var RPSGraph = function() {
  'use strict';
  var width = 700,
    height = 345,
    padding = {top: 10, right: 10, bottom: 30, left: 30},
    /***********************
     Scale and chart objects
     ***********************/
    _max_domains,
    _x = d3.scale.linear().domain([0, 1]).range([0, width]),
    _y = d3.scale.linear().domain([0, 1]).range([height, 0]),
    _line = d3.svg.line().x(function(d) { return _x(d.x); }).y(function(d) { return _y(d.y); }),
    _area = d3.svg.area().x(function(d) { return _x(d.x); }).y0(function() { return _y(0); }).y1(function(d) { return _y(d.y); }),
    /**************
     Data and color
     **************/
    graph_data = {graphs: [], data: [], inputs: [], active: [], ghost: [], default_line: [] },
    color_list = [
      //d3.rgb(0, 0, 0), //black
      d3.rgb(86, 180, 233), // sky blue
      d3.rgb(230, 159, 0),  // orange
      d3.rgb(0, 158, 115),  // bluish green
      d3.rgb(240, 228, 66), // yellow
      d3.rgb(0, 114, 178),  // blue
      d3.rgb(213, 94, 0),   // vermilion
      d3.rgb(204, 121, 167) // reddish purple
    ],
    /*********************
     SVG and layer objects
     *********************/
    svg_id = '#',
    svg,
    ghost_layer,
    grid_layer,
    graph_layer,
    default_layer,
    mask_layer,
    axes_layer,
    period_layer,
    handle_layer,
    button_layer,
    segment_width,
    x_axis,
    y_axis,
    masks,
    switches_list,
    /**********************
     X-segments and handles
     **********************/
    periods,
    handles,
    tool_tip,
    chart_inputs,
  //TODO: Is any of this used other than step? Remove?
    adjust_data = {step: 0.5, start: 0, stop: 0, index: 0},
    adjust_dot,
    /******
     States
     ******/
    _draggable = false,
    _labels = false,
    _hoverable = false,
    _stacked = false,
    /*****************
     "Private" methods
     *****************/
    colors = function(i) {
      /*
       Return color from array
       */
      return color_list[i % color_list.length];
    },
    format_x = function(_d) {
      /*
       Return x-value for hover legend, label, axis
       */
      return _d;
    },
    format_y = function(_d) {
      /*
       Return y-value for hover legend, label, axis
       */
      return _d;
    },
    redraw = function() {
      graph_data.graphs.each(function(d, i) {
        d3.select(this).attr('d', _area(graph_data.active.data));
      });
//      graph_data.inputs.each(function(d, i) {
//        d3.select(this).attr('value', function(d) {return d.data[i]; });
//      });
      d3.select('.default_line').attr('d', _line(graph_data.default_line.data));
      handles.data(graph_data.active.data)
        .each(function(d) {
          d3.select(this).selectAll('.data-point')
            .attr('cy', function() {return _y(d.y); });
          d3.select(this).select('.segment-label-bkgd')
            .attr('y', _y(d.y) - 40);
          d3.select(this).select('.segment-label-text')
            .text(function(d) {
              return (d.x > _x.invert(0)) ? d3.format('.1f')(d.y) : null;
            })
            .attr('y', _y(d.y) - 22);
        });
      d3.select('.y.axis').call(y_axis);
    },
    update_legend = function(_d) {
      tool_tip
        .html(format_x(_d.x) + ':&nbsp;' + format_y(_d.y))
        .style('left', (_x(_d.x) + padding.left + 10) + 'px')
        .style('top', (_y(_d.y) + padding.top) + 'px')
        .classed('active', true);
    },
    add_hover = function() {
      /*
       Attach mouse events to <rect>s with hoverable handles (toggle .active)
       */
      handles.each(function(d) {
        d3.select(this).select('.segment-rect')
          .on('mouseover', function() {
            update_legend(d);
            tool_tip.classed('hidden', !_hoverable);
            d3.selectAll('.data-point.tight').classed('active', false);
            d3.selectAll('.data-point.tight').classed('hovered', false);
            d3.select(this.parentNode.getElementsByClassName('tight')[0])
              .classed('active', true);
          })
          .on('mouseout', function() {
            adjust_dot = null;
            d3.select(this.parentNode.getElementsByClassName('tight')[0])
              .classed('active', false);
          });
      });
    },
    add_drag_hover = function() {
      /*
       Attach mouse events to draggable handles (toggle .active)
       */
      handles.each(function(d) {
        var handle = d3.select(this);
        d3.select(this).selectAll('.data-point.loose')
          .on('mouseover', function() {
            update_legend(d);
            tool_tip.classed('hidden', !_hoverable);
            d3.selectAll('.data-point.tight').classed('active', false);
            d3.selectAll('.data-point.tight').classed('hovered', false);
            handle.select('.data-point.tight')
              .classed('active', true).classed('hovered', true);
          })
          .on('mouseout', function() {
            d3.select(this).classed('active', false).classed('hovered', false);
          });
      });
    },
    remove_hover = function() {
      /*
       Remove mouse events from <rect>s with hoverable handles (toggle .active)
       */
      handles.selectAll('rect').on('mouseover', function() { return null; });
      handles.selectAll('rect').on('mouseout', function() { return null; });
    },
    remove_drag_hover = function() {
      /*
       Remove mouse events from draggable handles (toggle .active)
       */
      adjust_dot.on('mouseover', function() { return null; });
      adjust_dot.on('mouseout', function() { return null; });
      d3.selectAll('.data-point').on('mouseover', function() { return null; });
    },
    drag_start = function(d, i) {
      handles.filter(function(_d) { return _d === d; }).select('.segment-label-text').classed('hidden', _labels);
      tool_tip.classed('hidden', true);
      graph_data.active = graph_data.data[0];
      adjust_dot = d3.select(this);
      adjust_data.start = d.y;
      adjust_data.index = i;
      remove_hover();
      remove_drag_hover();
    },
    drag_move = function(d) {
      var adjusted = _y.invert(d3.event.y),
        delta = Math.round(adjusted / adjust_data.step) * adjust_data.step;
      graph_data.active.data.filter(function(_d) { return _d === d; })[0].y = (delta > _y.domain()[0]) ? (delta > _y.domain()[1]) ? _y.domain()[1] : delta : _y.domain()[0];
      redraw();
    },
    drag_end = function(d) {
      //TODO: update session
      update_legend(d);
      tool_tip.classed('hidden', false);
      handles.filter(function(_d) { return _d === d; }).select('.segment-label-text').classed('hidden', !_labels);
      adjust_data.stop = graph_data.active.data.filter(function(_d) { return _d === d; })[0].data;
      adjust_dot = null;
      graph_data.data[0] = graph_data.active;
//      update_session(data);
      redraw();
      add_hover();
      add_drag_hover();
    },
    mask_edges = function() {
      /*
       Draw masks on 4 edges of graph -- covers up extra graph underneath axes.
       */
      mask_layer.append('rect').attr('class', 'mask')
        .attr('width', width + padding.left + padding.right).attr('height', padding.top)
        .attr('transform', 'translate(0,0)');
      mask_layer.append('rect').attr('class', 'mask')
        .attr('width', width + padding.left + padding.right).attr('height', padding.bottom)
        .attr('transform', 'translate(0,' + (height + padding.top) + ')');
      mask_layer.append('rect').attr('class', 'mask')
        .attr('width', padding.left).attr('height', height + padding.top + padding.bottom)
        .attr('transform', 'translate(0,0)');
      mask_layer.append('rect').attr('class', 'mask right')
        .attr('width', padding.right).attr('height', height + padding.top + padding.bottom)
        .attr('transform', 'translate(' + (width + padding.left) + ',0)');
      masks = mask_layer.selectAll('.mask');
      if (_hoverable) {
        masks.on('mouseover', function() {
          tool_tip.classed('hidden', true);
        });
      }
    },
    draw_axes = function() {
      /*
       Draw x and y axes, ticks, etc.
       */
      axes_layer.append('g')
        .attr('transform', 'translate(0,' + (height + 5) + ')')
        .call(x_axis);
      axes_layer.append('g')
        .attr('transform', 'translate(-5,0)')
        .call(y_axis);
    },
    edit_switch_click = function() {
      d3.event.preventDefault();
      if (d3.select(this).classed('active')) {
        return;
      }
      d3.selectAll(this.parentNode.getElementsByClassName('switch')).each(function() {
        var current_switch = d3.select(this),
          layer_toggle = d3.select(current_switch.attr('data-layer-toggle'));
        layer_toggle.classed('hidden', !layer_toggle.classed('hidden'));
        current_switch.classed('active', !current_switch.classed('active'));
      });
    },
    domain_switch_click = function() {
      d3.event.preventDefault();
      var active_switch = d3.select(this);
      d3.selectAll(this.parentNode.getElementsByClassName('switch')).each(function() {
        var current_switch = d3.select(this);
        current_switch.classed('active', active_switch.attr('data-domain') === current_switch.attr('data-domain'));
        _y.domain([_y.domain()[0], active_switch.attr('data-domain')]);
//        current_switch.classed('active', !current_switch.classed('active'));
        redraw();
      });
    },
    add_labels = function() {

    },
    graph_drag = d3.behavior.drag().on('drag', drag_move).on('dragstart', drag_start).on('dragend', drag_end),
    foo;
  this.select = function(el) {
    if (!el) { return svg_id; }

    svg_id = el;
    switches_list = d3.select(el).append('div').attr('id', 'switches');
    var layer_translation = 'translate(' + padding.left + ',' + padding.top + ')';
    svg = d3.select(svg_id).append('svg').attr('width', width + padding.left + padding.right)
      .attr('height', height + padding.top + padding.bottom);
    ghost_layer = svg.append('g').attr('id', 'ghost_layer').attr('transform', layer_translation);
    grid_layer = svg.append('g').attr('id', 'grid_layer').attr('transform', layer_translation);
    graph_layer = svg.append('g').attr('id', 'graph_layer').attr('transform', layer_translation);
    default_layer = svg.append('g').attr('transform', layer_translation);
    mask_layer = svg.append('g').attr('id', 'mask_layer');
    axes_layer = svg.append('g').attr('id', 'axes_layer').attr('transform', layer_translation);
    handle_layer = svg.append('g').attr('id', 'handle_layer').attr('transform', layer_translation);
    button_layer = svg.append('g').attr('id', 'button_layer').attr('transform', layer_translation);
    return this;
  };
  this.x = function(val) {
    if (!val) { return _x; }
    _x = val;
    _x.range([0, width]);
    return this;
  };
  this.y = function(val) {
    if (!val) { return _y; }
    _y = val;
    _y.range([height, 0]);
    return this;
  };
  this.domain = function(xd, yd) {
    if (xd === undefined) { return [_x.domain(), _y.domain()]; }
    _x.domain(xd);
    if (yd) {
      _y.domain(yd);
    }
    return this;
  };
  this.padding = function(all, sides, bottom, left) {
    if (!all) { return padding; }
    padding = {top: all, right: all, bottom: all, left: all};
    if (sides) {
      padding.right = sides;
      padding.left = sides;
      if (bottom) {
        padding.bottom = bottom;
        if (left) {
          padding.left = left;
        }
      }
    }
    return this;
  };
  this.width = function(val) {
    if (!val) { return width; }
    width = val - padding.left - padding.right;
    return this;
  };
  this.height = function(val) {
    if (!val) { return height; }
    height = val - padding.top - padding.bottom;
    return this;
  };
  this.colors = function(func) {
    if (!func) { return colors; }
    if (typeof func === 'function') {
      colors = func;
      return this;
    }
    color_list = func;
    return this;
  };
  this.data = function(val) {
    if (!val) { return graph_data.data; }
    graph_data.data = val;
    return this;
  };
  this.max_domains = function(arr) {
    //TODO: This should really be wrapped up with this.domain()
    if (arr === undefined) { return _max_domains; }
    _max_domains = arr;
    var domain_switch = switches_list.append('span').attr('id', 'domain_switch').attr('class', 'switch-group');
    domain_switch.append('span').text('[ ');
    domain_switch.selectAll('.switch')
      .data(arr).enter()
      .append('a').attr('id', function(d) { return 'domain_switch_' + d; })
      .attr('class', 'switch').classed('active', function(d, i) { return d === _y.domain()[1]; })
      .attr('data-domain', function(d) { return d; })
      .text(function(d) { return d; }).on('click', domain_switch_click)
      .call(function(s) {
        domain_switch.selectAll('span')
          .data(s[0]).enter()
          .insert('span', function(d, i) { return s[0][i]; })
          .text(function(d, i) { return (i === 0) ? 'domain: ' : ' | '; });
      });
    domain_switch.append('span').text(' ]');
    return this;
  };
  this.draggable = function(bool, _label) {
    if (bool === undefined) { return _draggable; }
    if (_label === undefined) { _labels = false; } else { _labels = _label; }
    if (!_hoverable) {
      _draggable = false;
      console.log('Cannot set draggable unless hoverable() is explicitly set to true first.');
      return this;
    }
    _draggable = bool;
    if (bool === false) {
      d3.selectAll('.data-point').classed('draggable', false);
      d3.selectAll('.segment-label-bkgd').classed('hidden', true);
      d3.selectAll('.segment-label-text').classed('hidden', true);
      remove_drag_hover();
      return this;
    }
    // Add draggable class and labels to handles
    handles.each(function(d, i) {
      var handle = d3.select(this);
      handle.selectAll('.data-point').classed('draggable', true).call(graph_drag, i);
      //TODO: Add data- attributes
      handle.append('rect')
        .attr('class', 'segment-label-bkgd')
        .classed('hidden', function() { return !_labels; })
        .attr('height', 20)
        .attr('width', segment_width - 4)
        .attr('x', 2)
        .attr('y', _y(d.y) - 40)
        .style('fill', 'transparent');
      handle.append('text')
        .attr('class', 'segment-label-text')
        .classed('hidden', function() { return !_labels; })
        .attr('x', segment_width / 2)
        .attr('y', _y(d.y) - 22)
        .style('text-anchor', 'middle')
        .text(function(d) {
          return (d.x > _x.invert(0)) ? d3.format('.1f')(d.y) : null;
        });
    });
    // Add toggle switch
    var edit_switch = switches_list.append('span').attr('id', 'edit_switch').attr('class', 'switch-group');
    edit_switch.append('span').text('[ ');
    edit_switch.append('a').attr('id', 'drag_switch').attr('class', 'switch active')
      .attr('data-layer-toggle', '#handle_layer').text('drag').on('click', edit_switch_click);
    edit_switch.append('span').text(' | ');
    edit_switch.append('a').attr('id', 'type_switch').attr('class', 'switch')
      .attr('data-layer-toggle', '#chart_inputs').text('type').on('click', edit_switch_click);
    edit_switch.append('span').text(' ]');
    chart_inputs = d3.select(svg_id).append('form')
      .attr('id', 'chart_inputs')
      .style('padding-left', padding.left + 'px')
      .classed('hidden', true);
    // Add inputs
    graph_data.inputs = chart_inputs.selectAll('input')
      .data(graph_data.data[0].data).enter()
      .append('input').attr('type', 'text').attr('class', 'chart-input')
      .attr('data-x', function(d) { return d.x; }).property('value', function(d) { return format_y(d.y); })
      .style('width', (segment_width - 14) + 'px')
      .style('display', function(d) {return ((_x(d.x) > _x.range()[0]) && (_x(d.x) <= _x.range()[1])) ? 'block' : 'none'; })
      .on('change', function(d) {
        var _v = (d3.select(this).property('value'));
        //TODO: Better max and min
        _v = (_v > 100) ? 100 : (_v < 0) ? 0 : _v;
        graph_data.data[0].data.filter(function(_d) { return _d.x === d.x; })[0].y = _v;
        d3.select(this).property('value', _v);
        redraw();
//        rehover();
      });
    add_drag_hover();
    return this;
  };
  this.hoverable = function(bool) {
    if (bool === undefined) { return _hoverable; }
    _hoverable = bool;
    if (bool === false) {
      d3.selectAll('.data-point.tight').classed('hoverable', false);
      remove_hover();
      return this;
    }
    tool_tip = d3.select(svg_id).append('div').attr('id', 'tool_tip');
//    console.log(graph_data.data)
    segment_width = _x(graph_data.data[0].data[1].x) - _x(graph_data.data[0].data[0].x);
    handles = handle_layer.selectAll('.segment')
      .data(graph_data.data[0].data)
      .enter()
      .append('g')
      .attr('class', 'segment')
      .attr('transform', function(d) {return 'translate(' + (_x(d.x) - segment_width / 2) + ',0)'; });
    handles.each(function(d, i) {
      var visible = ((_x(d.x) >= _x.range()[0]) && (_x(d.x) <= _x.range()[1])),
        handle = d3.select(this);
      handle.append('rect')
        .attr('class', 'segment-rect')
        .attr('height', _y.range()[0])
        .attr('width', segment_width)
        .attr('data-x', function(d) { return d.x; })
        .attr('data-y', function(d) { return d.y; })
        .attr('data-legend', function(d) { return d.x + ':&nbsp;' + d.y; })
        .style('fill', 'transparent')
        .style('pointer-events', function() { return visible ? 'all' : 'none'; });
      handle.append('circle')
        .classed('data-point', function() { return visible; })
        .classed('hoverable', function() { return visible; })
        .classed('tight', true)
        .attr('data-x', function(d) { return d.x; })
        .attr('data-y', function(d) { return d.y; })
        .attr('cx', segment_width / 2)
        .attr('cy', function() { return _y(d.y); })
        .attr('r', function() { return visible ? 4 : 0; });
      handle.append('circle')
        .classed('data-point', function() { return visible; })
        .classed('hoverable', function() { return visible; })
        .classed('loose', true)
        .attr('data-x', function(d) { return d.x; })
        .attr('data-y', function(d) { return d.y; })
        .attr('cx', segment_width / 2)
        .attr('cy', function() { return _y(d.y); })
        .attr('r', function() { return visible ? segment_width / 2 : 0; });
    });
    add_hover();
    return this;
  };
  this.h_grid = function(bool) {
    //TODO: Don't return null if args undefined
    if (bool === undefined) { return null; }
    if (bool === false) {
      grid_layer.selectAll('.grid-line').remove();
      return this;
    }
    grid_layer.selectAll('.grid-line')
      .data(_y.ticks()).enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', _x.range()[0])
      .attr('x2', _x.range()[1])
      .attr('y1', function(d) { return _y(d); })
      .attr('y2', function(d) { return _y(d); });
    return this;
  };
  this.ghost = function(arr) {
    if (!_draggable) {
      console.log('Graph must be draggable in order to use ghost().');
      return this;
    }
    if (!arr) { return graph_data.ghost; }
    graph_data.ghost = arr;
    ghost_layer.append('path')
      .attr('d', _area(arr))
      .attr('class', 'ghost_area')
      .style('fill', '#dddddd');
    return this;
  };
  this.default_line = function(arr) {
    if (!_draggable) {
      console.log('Graph must be draggable in order to use default_line().');
      return this;
    }
    if (!arr) { return graph_data.default_line; }
    graph_data.default_line = arr;
    default_layer.append('path')
      .attr('d', _line(arr.data))
      .attr('class', 'default_line');
    return this;
  };
  this.format_x = function(func) {
    if (func === undefined) { return format_x; }
    format_x = func;
    return this;
  };
  this.format_y = function(func) {
    if (func === undefined) { return format_y; }
    format_y = func;
    return this;
  };
  this.stacked = function(bool) {
    if (bool === undefined) { return this; }
    _stacked = bool;
    if (bool) {
      console.log(graph_data.data);
      graph_data.data = d3.layout.stack(graph_data.data)
        .values(function(d) { return d.data; });
      console.log(graph_data.data());
    }
    return this;
  };
  this.draw = function() {
    graph_data.active = graph_data.data[0];
    x_axis = d3.svg.axis().scale(_x).orient('bottom');
    y_axis = d3.svg.axis().scale(_y).orient('left');
    _line = d3.svg.line()
      .x(function(d) { return _x(d.x); })
      .y(function(d) { return _y(d.y); });
    _area = d3.svg.area()
      .x(function(d) { return _x(d.x); })
      .y0(function() { return _y(0); })
      .y1(function(d) { return _y(d.y); });
    graph_data.graphs = graph_layer.selectAll('.chart-line')
      .data(graph_data.data).enter().append('path')
      .attr('d', function(d) { return _area(d.data); })
      .attr('class', 'chart-line')
      .style('fill', function(d, i) {return colors(i); });
    draw_axes();
    mask_edges();
    return this;
  };
};

var RPSGraphDraggable = function() {
  'use strict';
  RPSGraph.call(this);
  this.prototype = new RPSGraph();

};
RPSGraphDraggable.prototype.constructor = RPSGraphDraggable;
