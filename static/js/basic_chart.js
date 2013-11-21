var RPSGraph = function() {
  'use strict';
  var width = 700,
    height = 345,
    padding = {top: 30, right: 30, bottom: 30, left: 30},
    x_domain = [0, 1],
    y_domain = [0, 1],
    x_range = [0, width],
    y_range = [height, 0],
    x,
    y,
    graph_data = {graphs: [], data: [], limit: [], inputs: [], active: [], ghost: [], default_line: [] },
    svg_id = '#',
    layer_translation,
    svg,
    ghost_layer,
    grid_layer,
    graph_layer,
    default_layer,
    mask_layer,
    axes_layer,
    handle_layer,
    button_layer,
    segment_width,
    handles,
    tool_tip,
    x_axis,
    y_axis,
    _line = d3.svg.line().x(function(d) { return x(d.x); }).y(function(d) { return y(d.y); }),
    _area = d3.svg.area().x(function(d) { return x(d.x); }).y0(function() { return y(0); }).y1(function(d) { return y(d.y); }),
    adjust_data = {step: 0.5, start: 0, stop: 0, index: 0},
    adjust_dot,
    draggable = false,
    hoverable = false,
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
    colors = function(i) {
      return color_list[i % color_list.length];
    },
    hover_legend = function(_d) {
      var legend = {};
      legend.html = _d.x + ':&nbsp;' + _d.y;
      legend.x = x(_d.x) + 10;
      legend.y = y(_d.y) - padding.top - 10;
      return legend;
    },
    redraw = function() {
      graph_data.graphs.each(function(d, i) {
        d3.select(this).attr('d', _area(graph_data.active));
      });
//      graph_data.inputs.each(function(d, i) {
//        d3.select(this).attr('value', function(d) {return d.data[i]; });
//      });
//      trajectory
//        .attr('d', trajectory_area(data.trajectory));
//      default_trajectory.attr('d', trajectory_line(dt));
//      inputs.data(data.current).each(function() {
//        d3.select(this).attr('value', function(d) {return d.data; });
//      });
      handles.data(graph_data.active)
        .each(function(d) {
          d3.select(this).select('.data-point')
            .attr('cy', function() {return y(d.y); });
//          d3.select(this).select('.time-period-label-bkgd')
//            .attr('y', y(d.y) - 40);
//          d3.select(this).select('.time-period-label-text')
//            .text(function(d) {
//              return (d.date.getFullYear() > 2013) ? d3.format('.1f')(d.data) : null;
//            })
//            .attr('y', y(d.data) - 22);
        });
      d3.select('.y.axis').call(y_axis);
    },
    add_hover = function() {
      /*
       Attach mouse events to <rect>s with hoverable handles (toggle .active)
       */
      handles.each(function(d) {
        d3.select(this).select('.time-period-rect')
          .on('mouseover', function() {
            var legend = hover_legend(d);
            d3.selectAll('.data-point').classed('active', false);
            d3.selectAll('.data-point').classed('hovered', false);
            d3.select(this.parentNode.getElementsByClassName('data-point')[0])
              .classed('active', true);
            //TODO: return html, x, and y from hover_legend()?
            tool_tip
              .html(function() {
                return legend.html;
              })
              .style('position', 'absolute')
              .style('left', legend.x + 'px')
              .style('top', legend.y + 'px')
              .classed('active', true);
          })
          .on('mouseout', function() {
            adjust_dot = null;
            d3.select(this.parentNode.getElementsByClassName('data-point')[0])
              .classed('active', false);
            tool_tip.classed('active', true);
          });
      });
    },
    add_drag_hover = function() {
      /*
       Attach mouse events to draggable handles (toggle .active)
       */
      handles.each(function() {
        d3.select(this).select('.data-point')
          .on('mouseover', function() {
            d3.selectAll('.data-point').classed('active', false);
            d3.selectAll('.data-point').classed('hovered', false);
            d3.select(this).classed('active', true).classed('hovered', true);
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
    },
    drag_start = function(d, i) {
      console.log('start');
      graph_data.active = graph_data.data[0];
      adjust_dot = d3.select(this);
      adjust_data.start = d.y;
      adjust_data.index = i;
      remove_hover();
      remove_drag_hover();
    },
    drag_move = function(d) {
      var adjusted = y.invert(d3.event.y),
        delta = Math.round(adjusted / adjust_data.step) * adjust_data.step;
      graph_data.active.filter(function(_d) { return _d === d; })[0].y = (delta > y.domain()[0]) ? (delta > y.domain()[1]) ? y.domain()[1] : delta : y.domain()[0];
      redraw();
    },
    drag_end = function(d) {
      console.log('end');
      //TODO: update session
      adjust_data.stop = graph_data.active.filter(function(_d) { return _d === d; })[0].data;
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
      mask_layer.append('rect').attr('class', 'mask')
        .attr('width', padding.left).attr('height', height + padding.top + padding.bottom)
        .attr('transform', 'translate(' + (width + padding.left) + ',0)');
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
    graph_drag = d3.behavior.drag().on('drag', drag_move).on('dragstart', drag_start).on('dragend', drag_end),
    foo;
  //TODO: Should these return eg, _x_domain or _x.domain()? Ie, is _x_domain necessary?
  this.select = function(el) {
    if (!el) { return svg_id; }
    svg_id = el;
    layer_translation = 'translate(' + padding.left + ',' + padding.top + ')';
    svg = d3.select(svg_id).append('svg').attr('width', width + padding.left + padding.right)
      .attr('height', height + padding.top + padding.bottom);
    ghost_layer = svg.append('g').attr('id', 'ghost_layer').attr('transform', layer_translation);
    grid_layer = svg.append('g').attr('id', 'grid_layer').attr('transform', layer_translation);
    graph_layer = svg.append('g').attr('id', 'graph_layer').attr('transform', layer_translation);
    default_layer = svg.append('g').attr('transform', layer_translation);
    mask_layer = svg.append('g').attr('id', 'mask_layer');
    axes_layer = svg.append('g').attr('id', 'axes_layer').attr('transform', layer_translation);
    handle_layer = svg.append('g').attr('id', 'handles_layer').attr('transform', layer_translation);
    button_layer = svg.append('g').attr('id', 'buttons_layer').attr('transform', layer_translation);
    return this;
  };
  this.x = function(val) {
    if (!val) { return x; }
    x = val;
    x.range([0, width]);
    return this;
  };
  this.y = function(val) {
    if (!val) { return y; }
    y = val;
    y.range([height, 0]);
    return this;
  };
  this.domain = function(xd, yd) {
    if (!xd) { return x_domain; }
    x_domain = xd;
    x.domain(xd);
    if (yd) {
      y_domain = yd;
      y.domain(yd);
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
  this.hover_legend = function(func) {
    //TODO: Build legends
    if (!func) { return hover_legend; }
    if (typeof func !== 'function') {
      console.log('hover_legend() expects a function.');
      return this;
    }
    hover_legend = func;
    return this;
  };
  this.data = function(val) {
    if (!val) { return graph_data.data; }
    graph_data.data = val;
    return this;
  };
  this.draggable = function(bool) {
    if (bool === undefined) { return draggable; }
    if (!hoverable) {
      draggable = false;
      console.log('Cannot set draggable unless hoverable() is explicitly set to true first.');
      return this;
    }
    draggable = bool;
    if (bool === false) {
      d3.selectAll('.data-point').classed('draggable', false);
      remove_drag_hover();
      return this;
    }
    //TODO: Finish this stub
    d3.selectAll('.data-point').each(function(d, i) {
      d3.select(this)
        .classed('draggable', true)
        .call(graph_drag, i);
    });
    add_drag_hover();
    return this;
  };
  this.hoverable = function(bool, labels) {
    if (bool === undefined) { return hoverable; }
    if (bool === false) {
      d3.selectAll('.data-point').classed('hoverable', false);
      remove_hover();
      return this;
    }
    hoverable = bool;
    tool_tip = d3.select(svg_id).append('div').attr('id', 'tool_tip');
    segment_width = x(graph_data.data[0][1].x) - x(graph_data.data[0][0].x);
    handles = handle_layer.selectAll('.time-period')
      .data(graph_data.data[0])
      .enter()
      .append('g')
      .attr('class', 'time-period')
      .attr('transform', function(d) {return 'translate(' + (x(d.x) - segment_width / 2) + ',0)'; });
    handles.each(function(d, i) {
      var visible = ((x(d.x) >= x.range()[0]) && (x(d.x) <= x.range()[1]));
      d3.select(this).append('rect')
        .attr('class', 'time-period-rect')
        .attr('height', y.range()[0])
        .attr('width', segment_width)
        .attr('data-x', function(d) { return d.x; })
        .attr('data-y', function(d) { return d.y; })
        .attr('data-legend', function(d) { return d.x + ':&nbsp;' + d.y; })
        .style('fill', 'transparent')
        .style('pointer-events', function() { return visible ? 'all' : 'none'; });
      d3.select(this).append('circle')
        .classed('data-point', function(d) { return visible; })
        .classed('hoverable', function(d) { return visible; })
        .attr('cx', segment_width / 2)
        .attr('cy', function() { return y(d.y); })
        .attr('r', function() { return visible ? 6 : 0; });
      if (labels) {
        d3.select(this).append('rect')
          .attr('class', 'time-period-label-bkgd')
          .attr('height', 20)
          .attr('width', segment_width - 4)
          .attr('x', 2)
          .attr('y', y(d.y) - 40)
//          .attr('data-year', function(d) { return print_date(d.date); })
          .style('fill', 'transparent');
        d3.select(this).append('text')
          .attr('class', 'time-period-label-text')
          .attr('x', segment_width / 2)
          .attr('y', y(d.y) - 22)
//          .attr('data-year', function(d) { return print_date(d.date); })
          .style('text-anchor', 'middle');
      }
    });
    add_hover();
    return this;
  };
  this.h_grid = function(bool) {
    if (bool === undefined) { return hoverable; }
    if (bool === false) {
      grid_layer.selectAll('.grid-line').remove();
      return this;
    }
    grid_layer.selectAll('.grid-line')
      .data(y.ticks()).enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', x.range()[0])
      .attr('x2', x.range()[1])
      .attr('y1', function(d) { return y(d); })
      .attr('y2', function(d) { return y(d); });
    return this;
  };
  this.ghost = function(arr) {
    if (!draggable) {
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
    if (!draggable) {
      console.log('Graph must be draggable in order to use default_line().');
      return this;
    }
    if (!arr) { return graph_data.default_line; }
    graph_data.default_line = arr;
    default_layer.append('path')
      .attr('d', _line(arr))
      .attr('class', 'default_line');
    return this;
  };
  this.draw = function() {
    graph_data.active = graph_data.data[0];
    x_axis = d3.svg.axis().scale(x).orient('bottom');
    y_axis = d3.svg.axis().scale(y).orient('left');
    _line = d3.svg.line()
      .x(function(d) { return x(d.x); })
      .y(function(d) { return y(d.y); });
    _area = d3.svg.area()
      .x(function(d) { return x(d.x); })
      .y0(function() { return y(0); })
      .y1(function(d) { return y(d.y); });
    graph_data.graphs = graph_layer.selectAll('.chart-line')
      .data(graph_data.data).enter().append('path')
      .attr('d', function(d) { return _area(d); })
      .attr('class', 'chart-line')
      .style('fill', function(d, i) {return colors(i); });
    draw_axes();
    mask_edges();
    return this;
  };
};