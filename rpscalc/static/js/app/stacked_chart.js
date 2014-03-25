var RPSGraph = function() {
  'use strict';
  var Options = window.Options || {},
    width = 700,
    height = 345,
    padding = {top: 10, right: 10, bottom: 30, left: 30},
    /***********************
     Scale and chart objects
     ***********************/
    _max_domains,
    _x = d3.scale.linear().domain([0, 1]).range([0, width]),
    _y = d3.scale.linear().domain([0, 1]).range([height, 0]),
    x_axis = d3.svg.axis().scale(_x).orient('bottom').tickSize(6).innerTickSize(6),
    y_axis = d3.svg.axis().scale(_y).orient('left'),
    _line = d3.svg.line().x(function(d) { return _x(d.x); }).y(function(d) { return _y(d.y + d.y0); }),
    _area = d3.svg.area().x(function(d) { return _x(d.x); }).y0(function(d) { return _y(d.y0); }).y1(function(d) { return _y(d.y + d.y0); }),
    _invert_area = d3.svg.area().x(function(d) { return _x(d.x); }).y0(function() { return _y.range()[1]; }).y1(function(d) { return _y(d.y + d.y0); }),
    _stack = d3.layout.stack().offset('zero').values(function(d) { return d.data; }).x(function(d) { return d.x; }).y(function(d) { return d.y; }),
    _chart_f = _area,
    /**************
     Data and color
     **************/
    graph_data = {
      graphs: [],       // Graph objects
      outlines: [],     // Graph outline objects
      intersection: null,
      data: [],         // Data
      inputs: [],       // Inputs below graph
      active: [],       // Data series currently being altered
      ghost: [],        // Background area chart
      default_line: [], // Dotted default line for draggable graphs
      nested: []        // Nested data needed for handles when graphing multiple series
    },
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
    svg_id = null,
    svg,
    svg_defs,
    ghost_layer,
    grid_layer,
    clip_layer,
    graph_layer,
    intersect_layer,
    outline_layer,
    default_layer,
    axes_layer,
//    period_layer,
    handle_layer,
    button_layer,
    segment_width,
    switches_list,
    title,
    /**********************
     X-segments and handles
     **********************/
//    periods,
    handles,
    tool_tip,
    chart_inputs,
    adjust_data = {step: 0.5, stop: 0},
    adjust_dot,
    /******
     States
     ******/
    _draggable = false,
    _labels = false,
    _hoverable = false,
    _stacked = false,
    _outlines = true,
    _h_grid = true,
    _lines = false,
    /*****************
     "Private" methods
     *****************/
    color = function(i) {
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
      if (_stacked) { graph_data.data = _stack(graph_data.data); }
      graph_data.graphs
        .data(graph_data.data)
        .attr('d', function(d) {
        //TODO: This is written twice -- store in a function
        if (d.invert) {
          return d3.svg.area().x(function(d) { return _x(d.x); }).y0(function(d) { return _y.range()[1]; }).y1(function(d) { return _y(d.y + d.y0); })(d.data);
        }
        return _chart_f(d.data);
      });
      if (graph_data.intersection) {
        graph_data.intersection
          .attr('d', function(d) {
            return d.invert ? _invert_area(d.data) : _area(d.data); });
      }
      if (_outlines) {
        graph_data.outlines
          .data(graph_data.data.slice(0, -1))
          .attr('d', function(d) { return _line(d.data); });
      }
      handles.data(graph_data.nested)
        .each(function() {
          d3.select(this).selectAll('.data-point')
            .attr('cy', function(d) { return _y(d.y + d.y0); });
          d3.select(this).select('.segment-label-bkgd')
            .attr('y', function(d) { return _y(d.values[0].y + d.values[0].y0) - 40; });
          d3.select(this).selectAll('.segment-label-text')
            .text(function(d) {
              return (d.x > _x.invert(0)) ? d3.format('.1f')(d.y) : null;
            })
            .attr('y', function(d) { return _y(d.y + d.y0) - 22; });
        });
      d3.select('.y.axis').call(y_axis);
    },
    nested = function() {
      /*
       Transform series data into data nested by time period
       */
      return d3.nest()
        .key(function(d) { return d.x; })
        .entries([].concat.apply([], graph_data.data.map(function(d) {
          d.data.forEach(function(dd) { dd.type = d.type; }); return d.data;
        })));
    },
    update_legend = function(_d) {
      var _h = '';
      _d.reverse().forEach(function(d) {
        var current_x = _d.length > 1 ? d.type : format_x(d.x);
        _h += current_x + ':&nbsp;' + format_y(d.y) + '<br>';
      });
      tool_tip
        .html(_h)
        .style('left', (_x(_d[0].x) + padding.left + 10) + 'px')
        .style('top', (_y(_d[0].y) + padding.top) + 'px')
        .classed('active', true);
      _d.reverse();
    },
    add_hover = function() {
      /*
       Attach mouse events to <rect>s with hoverable handles (toggle .active)
       */
      handles.each(function() {
        var handle = d3.select(this);
        handle.select('.segment-rect')
          .on('mouseover', function(d) {
            update_legend(d.values);
            tool_tip.classed('hidden', !_hoverable);
            handle.selectAll('.data-point.tight')
              .classed('active', true);
          })
          .on('mouseout', function() {
            tool_tip.classed('hidden', true);
            d3.selectAll('.data-point.tight')
              .classed('active', false)
              .classed('hovered', false);
            adjust_dot = null;
            handle.selectAll('data-point')
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
          .on('mouseover', function(dd, ii) {
            update_legend(d.values);
            tool_tip.classed('hidden', !_hoverable);
            handle.selectAll('.data-point.tight')
              .filter(function(ddd, iii) { return ii === iii; })
              .classed('active', true).classed('hovered', true);
          })
          .on('mouseout', function() {
            d3.selectAll('.data-point.tight')
              .classed('active', false).classed('hovered', false);
            d3.select(this).classed('active', false).classed('hovered', false);
          });
      });
    },
    remove_hover = function() {
      /*
       Remove mouse events from <rect>s with hoverable handles (toggle .active)
       */
      handles.selectAll('rect')
        .on('mouseover', function() { return null; })
        .on('mouseout', function() { return null; });
    },
    remove_drag_hover = function() {
      /*
       Remove mouse events from draggable handles (toggle .active)
       */
      adjust_dot.on('mouseover', function() { return null; })
        .on('mouseout', function() { return null; });
      d3.selectAll('.data-point').on('mouseover', function() { return null; });
    },
    max_drag = function(_d) {
      /*
       Calculate maximum allowable adjustment of point in series.
       */
      return d3.max(_max_domains) - ((d3.sum(graph_data.data, function(_dd) { return _dd.data.filter(function(_ddd) { return _ddd.x.getFullYear() == _d.x.getFullYear(); })[0].y; })) - _d.y);
    },
    drag_start = function(_d) {
      d3.select('.segment-label-text[data-x="' + _d.x.toString() + '"][data-type="' + _d.type + '"]').classed('hidden', _labels);
      tool_tip.classed('hidden', true);
      graph_data.active = graph_data.data.filter(function(d) { return d.type === _d.type; })[0];
      adjust_dot = d3.select(this);
      remove_hover();
      remove_drag_hover();
    },
    drag_move = function(_d) {
      var adjusted = _y.invert(d3.event.y) - _d.y0,
        delta = Math.round(adjusted / adjust_data.step) * adjust_data.step;
      graph_data.active.data.filter(function(d) { return _d === d; })[0].y = (delta > _y.domain()[0]) ? (delta > max_drag(_d)) ? max_drag(_d) : delta : _y.domain()[0];
      graph_data.data.filter(function(d) { return d.type === _d.type; })[0] = graph_data.active;
      graph_data.nested = nested();
      redraw();
    },
    drag_end = function(_d) {
      //TODO: update session
      update_legend(d3.select('.segment-rect[data-x="' + _d.x.toString() + '"]').datum().values);
      tool_tip.classed('hidden', false);
      d3.select('.segment-label-text[data-x="' + _d.x.toString() + '"][data-type="' + _d.type + '"]').classed('hidden', !_labels);
      adjust_data.stop = graph_data.active.data.filter(function(d) { return _d.x === d.x ; })[0];
      d3.select('.chart-input[data-x="' + _d.x.toString() + '"][data-type="' + _d.type + '"]')
        .property('value', adjust_data.stop.y);
      adjust_dot = null;
      graph_data.data.filter(function(d) { return d.type === _d.type; })[0] = graph_data.active;
      Options.data[_d.type] = graph_data.active;
      redraw();
      add_hover();
      add_drag_hover();
    },
    draw_axes = function() {
      /*
       Draw x and y axes, ticks, etc.
       */
      axes_layer.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + (height + 5) + ')')
        .call(x_axis);
      axes_layer.append('g')
        .attr('class', 'y axis')
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
          layer_toggle = d3.select('#' + current_switch.attr('data-layer-toggle'));
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
        d3.select('.y.axis').call(y_axis);
      });
      redraw();
      graph_data.default_line
        .attr('d', function(d) { return _line(d.data); });
    },
    pre_id = function(str) {
      return svg_id + '_' + str;
    },
    graph_drag = d3.behavior.drag().on('drag', drag_move).on('dragstart', drag_start).on('dragend', drag_end);
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
    /*
     Set width of graph.
     ...
     Args
     ----
     val (int): width of DOM element to use as container (Note: *not* the width of the graph itself!)
     ...
     Returns
     -------
     RPSGraph
     ...
     */
    if (!val) { return width; }
    width = val - padding.left - padding.right;
    return this;
  };
  this.height = function(val) {
    if (!val) { return height; }
    height = val - padding.top - padding.bottom;
    return this;
  };
  this.select = function(el) {
    if (!el) { return svg_id; }
    svg_id = el.replace('#', '');
    switches_list = d3.select(el).append('div')
      .attr({ 'id': pre_id('switches'),
        'class': 'switches-wrap' });
    svg = d3.select('#'+svg_id).append('div')
      .attr('class', 'chart-wrap')
      .style({
        'left': '-' + padding.left + 'px',
        'width': (width + padding.left) + 'px'
      })
      .append('svg')
      .attr({ 'xmlns': 'http://www.w3.org/2000/svg',
        'xmlns:xmlns:xlink': 'http://www.w3.org/1999/xlink',
        'version': '1.1',
        'width': width + padding.left + padding.right,
        'height': height + padding.top + padding.bottom,
        'id': pre_id('chart_svg') })
      .append('g')
      .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')');
    svg_defs = svg.append('defs');
    ghost_layer = svg.append('g').attr('id', pre_id('ghost_layer'));
    grid_layer = svg.append('g').attr('id', pre_id('grid_layer'));
    clip_layer = svg.append('g').attr('id', pre_id('clip_layer'));
    graph_layer = svg.append('g').attr('id', pre_id('graph_layer'));
    svg_defs.append('clipPath').attr("id", "graph_clip").append("rect")
      .attr({'width': width, 'height': height });
    intersect_layer = svg.append('g').attr('id', pre_id('intersect_layer'));
    outline_layer = svg.append('g').attr('id', pre_id('outline_layer'));
    default_layer = svg.append('g').attr('id', pre_id('default_layer'));
    axes_layer = svg.append('g').attr('id', pre_id('axes_layer'));
    handle_layer = svg.append('g').attr('id', pre_id('handle_layer'));
    button_layer = svg.append('g').attr('id', pre_id('button_layer'));
    svg.selectAll('g').attr('class', 'chart-layer');
    return this;
  };
  this.title = function(str, align) {
    if (str === undefined) { return title.text(); }
    title = d3.select('#' + svg_id).insert('h3', '.chart-wrap');
    title.html(str);
//    if (align) { title.style('padding-left', padding.left + 'px'); }
    return this;
  };
  this.x = function(val) {
    if (!val) { return _x; }
    _x = val;
    _x.range([0, width]);
    x_axis.scale(_x);
    return this;
  };
  this.y = function(val) {
    if (!val) { return _y; }
    _y = val;
    _y.range([height, 0]);
    y_axis.scale(_y);
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
  this.max_domains = function(arr) {
    /*
     Create multiple domain switch
     ...
     Args
     ----
     arr (Array): Array of numerics
     ...
     Returns
     -------
     RPSGraph
     ...
     */
    //TODO: This should really be wrapped up with this.domain()
    if (arr === undefined) { return _max_domains; }
    _max_domains = arr;
    var domain_switch = title.append('span').attr('class', 'switch-group');
    domain_switch.append('span').html('&nbsp;[&nbsp;');
    domain_switch.selectAll('.switch')
      .data(arr).enter().append('a')
      .attr('class', 'switch').classed('active', function(d) { return d === _y.domain()[1]; })
      .attr('data-domain', function(d) { return d; })
      .text(function(d) { return d; }).on('click', domain_switch_click)
      .call(function(s) {
        domain_switch.selectAll('span')
          .data(s[0]).enter()
          .insert('span', function(d, i) { return s[0][i]; })
          .text(function(d, i) { return (i === 0) ? 'domain: ' : ' | '; });
      });
    domain_switch.append('span').html('&nbsp;]');
    return this;
  };
  this.format_x = function(func) {
    /*
     Format function for data in x axis
     ...
     Args
     ----
     func (Function): function that accepts an argument and returns a String
     ...
     Returns
     -------
     RPSGraph
     ...
     */
    if (func === undefined) { return format_x; }
    format_x = func;
    return this;
  };
  this.format_y = function(func) {
    /*
     Format function for data in y axis
     ...
     Args
     ----
     func (Function): function that accepts an argument and returns a String
     ...
     Returns
     -------
     RPSGraph
     ...
     */
    if (func === undefined) { return format_y; }
    format_y = func;
    return this;
  };
  this.colors = function(func) {
    if (func === undefined) { return color; }
    if (typeof func === 'function') {
      color = func;
    } else if (typeof func === 'string') {
      color = function() { return func; }
    } else {
      color_list = func;
    }
    return this;
  };
  this.data = function(arr) {
    /*
     Set data series to graph.
     ...
     Args
     ----
     arr (Array): Array of Arrays of Objects {x: foo, y: bar, y0: [0]}
     ...
     Returns
     -------
     RPSGraph
     ...
     */
    if (arr === undefined) { return graph_data.data; }
    graph_data.data = arr;
    graph_data.nested = nested();
    return this;
  };
  this.draggable = function(bool, _label) {
    /*
     Create draggable interface.
     ...
     Args
     ----
     bool (Boolean): true if graph should be draggable
     _label (Boolean): true if nodes should have visible labels
     ...
     Returns
     -------
     RPSGraph
     ...
     */
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
      handle.selectAll('segment-label-bkgd')
        .data(function(d) { return d.values; }).enter()
        .append('rect')
        .attr('class', 'segment-label-bkgd')
        .classed('hidden', function() { return !_labels; })
        .attr('height', 20)
        .attr('width', segment_width - 4)
        .attr('x', 2)
        .attr('y', _y(d.values[0].y) - 40)
        .attr('data-x', function(d) { return d.x; })
        .style('fill', 'transparent');
      handle.selectAll('.segment-label-text')
        .data(function(d) { return d.values; }).enter()
        .append('text')
        .attr('class', 'segment-label-text')
        .classed('hidden', function() { return !_labels; })
        .attr('x', segment_width / 2)
        .attr('y', function(d) { return _y(d.y) - 22; })
        .attr('data-x', function(d) { return d.x; })
        .attr('data-type', function(d) { return d.type; })
        .style('text-anchor', 'middle')
        .text(function(d) {
          return (d.x > _x.invert(0)) ? d3.format('.1f')(d.y) : null;
        });
    });
    // Add toggle switch
    var edit_switch = title.append('span').attr('class', 'switch-group');
    edit_switch.append('span').html('&nbsp;[&nbsp;');
    edit_switch.append('a').attr('class', 'input-switch switch active')
      .attr('data-layer-toggle', pre_id('handle_layer')).text('drag').on('click', edit_switch_click);
    edit_switch.append('span').text(' | ');
    edit_switch.append('a').attr('class', 'input-switch switch')
      .attr('data-layer-toggle', pre_id('chart_inputs')).text('type').on('click', edit_switch_click);
    edit_switch.append('span').html('&nbsp;]');

    chart_inputs = d3.select('.chart-wrap').append('form')
      .attr({ 'class': 'clearfix',
        'id': pre_id('chart_inputs') })
      .style('padding-left', padding.left + 'px')
      .classed('hidden', true);
    // Add inputs
    var input_rows = chart_inputs.selectAll('div')
      .data(graph_data.data.reverse()).enter()
      .append('div')
      .attr({ 'class': 'clearfix chart-input-row',
        'data-type': function(d) { return d.type; } });
    input_rows.append('h6').text(function(d) { return d.type; });
    graph_data.data.reverse();
    graph_data.inputs = input_rows.selectAll('input')
      .data(function(d) { return d.data; }).enter()
      .append('input')
      .attr({'type': 'text', 'class': 'chart-input',
        'data-x': function(d) { return d.x; },
        'data-type': function(d) {  return d.type; }})
      .property('value', function(d) { return format_y(d.y); })
      .style({ 'width': (segment_width - 14) + 'px',
        'display': function(d) {return ((_x(d.x) > _x.range()[0]) && (_x(d.x) <= _x.range()[1])) ? 'block' : 'none'; } })
      .on('change', function(d) {
        var _v = (d3.select(this).property('value'));
        //TODO: Better max and min
        _v = (_v > max_drag(d)) ? format_y(max_drag(d)) : (_v < d.y0) ? d.y0 : _v;
        graph_data.data.filter(function(_d) { return _d.type === d.type; })[0].data.filter(function(_d) { return _d.x === d.x; })[0].y = +_v;
        d3.select(this).property('value', +_v);
        redraw();
      });
    add_drag_hover();
    return this;
  };
  this.hoverable = function(bool) {
    /*
     Create hoverable interface.
     ...
     Args
     ----
     bool (Boolean): true if graph should be hoverable
     ...
     Returns
     -------
     RPSGraph
     ...
     */
    if (bool === undefined) { return _hoverable; }
    _hoverable = bool;
    if (bool === false) {
      d3.selectAll('.data-point.tight').classed('hoverable', false);
      remove_hover();
      return this;
    }
    tool_tip = d3.select('.chart-wrap').append('div').attr('class', 'tool_tip');
    segment_width = _x(graph_data.data[0].data[1].x) - _x(graph_data.data[0].data[0].x);
    handles = handle_layer.selectAll('.segment')
      .data(graph_data.nested)
      .enter()
      .append('g')
      .attr('class', 'segment')
      .attr('transform', function(d) {return 'translate(' + (_x(d.values[0].x) - segment_width / 2) + ',0)'; });
    handles.each(function(d) {
      var visible = ((_x(d.values[0].x) >= _x.range()[0]) && (_x(d.values[0].x) <= _x.range()[1])),
        handle = d3.select(this);
      handle.append('rect')
        .attr('class', 'segment-rect')
        .attr('height', _y.range()[0])
        .attr('width', segment_width)
        .attr('data-x', function(d) { return d.values[0].x; })
        .style('fill', 'transparent')
        .style('pointer-events', function() { return visible ? 'all' : 'none'; });
      handle.selectAll('.data-point.tight')
        .data(function(d) { return d.values; }).enter()
        .append('circle')
        .classed('data-point', function() { return visible; })
        .classed('hoverable', function() { return visible; })
        .classed('tight', true)
        .attr('data-x', function(d) { return d.x; })
        .attr('data-y', function(d) { return d.y; })
        .attr('data-type', function(d) { return d.type; })
        .attr('cx', segment_width / 2)
        .attr('cy', function(d) { return _y(d.y + d.y0); })
        .attr('r', function() { return visible ? 4 : 0; });
      handle.selectAll('.data-point.loose')
        .data(function(d) { return d.values; }).enter()
        .append('circle')
        .classed('data-point', function() { return visible; })
        .classed('hoverable', function() { return visible; })
        .classed('loose', true)
        .attr('data-x', function(d) { return d.x; })
        .attr('data-y', function(d) { return d.y; })
        .attr('data-type', function(d) { return d.type; })
        .attr('cx', segment_width / 2)
        .attr('cy', function(d) { return _y(d.y + d.y0); })
        .attr('r', function() { return visible ? segment_width / 2 : 0; });
      handles.data(graph_data.data[0]);
    });
    add_hover();
    return this;
  };
  this.h_grid = function(bool) {
    /*
     Draw horizontal gridlines
     ...
     Args
     ----
     bool (Boolean): true if gridlines should be drawn
     ...
     Returns
     -------
     RPSGraph
     ...
     */
    if (bool === undefined) { return _h_grid; }
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
  this.ghost = function(arr, clr) {
    /*
     Create static area in background of graph
     ...
     Args
     ----
     arr (Array): Array of Objects to chart {x: foo, y: bar, y0: 0}
     ...
     Returns
     -------
     RPSGraph
     ...
     */
//    if (!_draggable) {
//      console.log('Graph must be draggable in order to use ghost().');
//      return this;
//    }
    if (!arr) { return graph_data.ghost; }
    graph_data.ghost = arr;
    ghost_layer.selectAll('.ghost-area')
      .data(arr).enter()
      .append('path')
      .attr('d', function(d) {
        if (d.invert) {
          return d3.svg.area().x(function(d) { return _x(d.x); }).y0(function() { return _y.range()[1]; }).y1(function(d) { return _y(d.y + d.y0); })(d.data);
        }
        return _area(d.data);
      })
      .attr('class', 'ghost-area')
      .style('fill', clr || '#dddddd');
    return this;
  };
  this.default_line = function(arr, style_hash) {
    /*
     Draw static dotted line in foreground of graph to represent 'default'
     ...
     Args
     ----
     arr (Array): Array of Objects to chart {x: foo, y: bar, y0: 0}
     ...
     Returns
     -------
     RPSGraph
     ...
     */
    if (!_draggable) {
      console.log('Graph must be draggable in order to use default_line().');
      return this;
    }
    if (arr === undefined) { return graph_data.default_line; }
    graph_data.default_line = default_layer.selectAll('.default_line')
      .data(arr).enter().append('path')
      .attr('d', function(d) { return _line(d.data); })
      .attr('class', 'default_line')
      .attr('clip-path', 'url(#graph_clip)')
      .style(style_hash);
    return this;
  };
  this.stacked = function(bool) {
    /*
     Determine whether or not to stack data, rather than overlap
     ...
     Args
     ----
     bool (Boolean): true if graph should stack
     ...
     Returns
     -------
     RPSGraph
     ...
     */
    if (bool === undefined) { return this; }
    _stacked = bool;
    if (bool) {
      graph_data.data = d3.layout.stack()
        .offset('zero')
        .values(function(d) { return d.data; })
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })(graph_data.data);
    }
    return this;
  };
  this.zeroes = function(bool) {
    if (bool) {
      var e = document.createEvent('SVGEvents');
      e.initEvent('click', true, true);
      d3.select('[data-layer-toggle="' + pre_id('chart_inputs') + '"]').node().dispatchEvent(e);
    }
  };
  this.intersect = function(a, b, c) {
    var pattern = svg_defs.append('pattern')
      .attr('id', pre_id('clip_pattern'))
      .attr('width', 16)
      .attr('height', 16)
      .attr('patternUnits', 'userSpaceOnUse');
    pattern.append('rect')
      .attr('width', 16)
      .attr('height', 16)
      .attr('fill', c || 'black');
    pattern.append('image')
      .attr('width', 16)
      .attr('height', 16)
      .attr('xlink:href', '/static/images/svg/stripes_red.png');
    graph_data.intersection = svg_defs.selectAll('.intersection-path')
      .data([a, b]).enter().append('clipPath')
      .attr('id', function(d, i) { return pre_id('clip_path_' + i); })
      .attr('class', 'intersection-path')
      .append('path')
      .attr('id', function(d, i) { return pre_id('clip_path_' + i + '_path'); })
      .attr('d', function(d) { return d.invert ? _invert_area(d.data) : _area(d.data); });
    svg_defs.append('clipPath')
      .attr('id', pre_id('clip_intersection'))
      .attr('clip-path', 'url(#' + pre_id('clip_path_0') + ')')
      .append('use')
      .attr('xlink:href', '#' + pre_id('clip_path_1_path'));
    intersect_layer.append('rect')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'url(#' + pre_id('clip_pattern') + ')')
      .attr('clip-path', 'url(#' + pre_id('clip_intersection') + ')');
//      .style('fill', c)
//      .attr('clip-path', 'url(#clip_intersection)');
    return this;
  };
  this.manual_update_intersection = function(a, b) {
    graph_data.intersection.data([a, b]);
    return this;
  };
  this.manual_update_handles = function() {
    handles.data(graph_data.nested)
      .each(function(_d) {
        var _this = d3.select(this);
        _this.select('.segment-rect')
          .data(_d);
        _this.selectAll('.data-point')
          .data(_d.values)
          .attr('cy', function(d) { return _y(d.y + d.y0); });
        _this.select('.segment-label-bkgd')
          .data(_d.values)
          .attr('y', function(d) { return _y(d.values[0].y + d.values[0].y0) - 40; });
        _this.selectAll('.segment-label-text')
          .data(_d.values)
          .text(function(d) {
            return (d.x > _x.invert(0)) ? d3.format('.1f')(d.y) : null;
          })
          .attr('y', function(d) { return _y(d.y + d.y0) - 22; });
      });
    return this;
  };
  this.lines = function(bool) {
    if (bool === undefined) { return _lines; }
    _lines = bool;
    _outlines = !bool;
    _chart_f = bool ? _line : _area;
    return this;
  };
  this.interpolate = function(str) {
    if (str === undefined) { return this; }
    _line.interpolate(str);
    _area.interpolate(str);
    return this;
  };
  this.outlines = function(bool) {
    if (bool == undefined) { return _outlines; }
    _outlines = bool;
    return this;
  };
  this.legend = function(bool) {
    //TODO: Don't return this without bool
    if (bool === undefined) { return this; }
    if (bool) {
      var legend = d3.select('#' + svg_id).insert('div', '.chart-wrap')
        .attr('class', 'chart-legend');
      graph_data.data.forEach(function(d, i) {
        var legend_unit = legend.append('span')
          .attr('class', 'legend-row');
        legend_unit.append('span').attr('class', 'legend-swatch')
          .style('background-color', color(i));
        legend_unit.append('span').attr('class', 'legend-text').text(d.type);
      });
    }
    return this;
  };
  this.switch_input = function() {
    d3.selectAll('.input-switch').each(function() {
      var current_switch = d3.select(this),
        layer_toggle = d3.select('#' + current_switch.attr('data-layer-toggle'));
      layer_toggle.classed('hidden', !layer_toggle.classed('hidden'));
      current_switch.classed('active', !current_switch.classed('active'));
    });
  };
  this.draw = function() {
    /*
     Draw all data
     ...
     Args
     ----
     null
     ...
     Returns
     -------
     RPSGraph
     ...
     */
    graph_data.graphs = graph_layer.selectAll('.chart-line')
      .data(graph_data.data).enter().append('path')
      .attr('d', function(d) { return d.invert ? _invert_area(d.data) : _chart_f(d.data); })
      .attr('class', 'chart-line')
      .attr('clip-path', 'url(#graph_clip)')
      .style('fill', function(d, i) { return (!_lines || d.invert) ? color(i) : null; })
      .style('stroke', function(d, i) { return (_lines && !d.invert) ? color(i) : null; });
    if (_outlines) {
      graph_data.outlines = outline_layer.selectAll('.chart-outline')
        .data(function() {
          return _stacked ? graph_data.data.slice(0, -1) : graph_data.data.reverse().slice(0, -1)
        }).enter().append('path')
        .attr('d', function(d) { return _line(d.data); })
        .attr('class', 'chart-outline')
        .attr('clip-path', 'url(#graph_clip)');
    }
    draw_axes();
    return this;
  };
  this.redraw = function() {
    redraw();
    return this;
  };
};