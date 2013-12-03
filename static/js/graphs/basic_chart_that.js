var RPSGraph = function() {
  'use strict';
  var that = this;
  that._width = 700;
  that._height = 345;
  that.top = 10;
  that.right = 10;
  that.bottom = 30;
  that.left = 30;
  /***********************
   Scale and chart objects
   ***********************/
  that._max_domains = [];
  that._x = d3.scale.linear().domain([0, 1]).range([0, that._width]);
  that._y = d3.scale.linear().domain([0, 1]).range([that._height, 0]);
  that.x_axis = d3.svg.axis().scale(that._x).orient('bottom');
  that.y_axis = d3.svg.axis().scale(that._y).orient('left');
  that._line = d3.svg.line().x(function(d) { return that._x(d.x); }).y(function(d) { return that._y(d.y); });
  that._area = d3.svg.area().x(function(d) { return that._x(d.x); }).y0(function() { return that._y(0); }).y1(function(d) { return that._y(d.y); });
  /**************
   Data and color
   **************/
  that.graph_data = {graphs: [], data: [], inputs: [], active: [], ghost: [], default_line: [] };
  that.color_list = [
    //d3.rgb(0, 0, 0), //black
    d3.rgb(86, 180, 233), // sky blue
    d3.rgb(230, 159, 0),  // orange
    d3.rgb(0, 158, 115),  // bluish green
    d3.rgb(240, 228, 66), // yellow
    d3.rgb(0, 114, 178),  // blue
    d3.rgb(213, 94, 0),   // vermilion
    d3.rgb(204, 121, 167) // reddish purple
  ];
  /*********************
   SVG and layer objects
   *********************/
  that.svg_id = '#';
  that.svg = null;
  that.ghost_layer = null;
  that.grid_layer = null;
  that.graph_layer = null;
  that.default_layer = null;
  that.mask_layer = null;
  that.axes_layer = null;
  that.period_layer = null;
  that.handle_layer = null;
  that.button_layer = null;
  that.segment_width = 0;
  that.masks = [];
  that.switches_list = [];
  /**********************
   X-segments and handles
   **********************/
  that.periods;
  that.handles = [];
  that.tool_tip = null;
  that.chart_inputs = [];
  //TODO: Is any of this used other than step? Remove?
  that.adjust_data = {step: 0.5, start: 0, stop: 0, index: 0};
  that.adjust_dot = null;
  /******
   States
   ******/
  that._draggable = false;
  that._labels = false;
  that._hoverable = false;
  /*****************
   "Private" methods
   *****************/
  that._colors = function(i) {
    /*
     Return color from array
     */
    return that.color_list[i % that.color_list.length];
  };
  that._format_x = function(_d) {
    /*
     Return x-value for hover legend, label, axis
     */
    return _d;
  };
  that._format_y = function(_d) {
    /*
     Return y-value for hover legend, label, axis
     */
    return _d;
  };
  that.redraw = function() {
    that.graph_data.graphs.each(function(d, i) {
      d3.select(this).attr('d', that._area(that.graph_data.active));
    });
//      graph_data.inputs.each(function(d, i) {
//        d3.select(this).attr('value', function(d) {return d.data[i]; });
//      });
    d3.select('.default_line').attr('d', that._line(that.graph_data.default_line));
    that.handles.data(that.graph_data.active)
      .each(function(d) {
        d3.select(this).selectAll('.data-point')
          .attr('cy', function() {return that._y(d.y); });
        d3.select(this).select('.segment-label-bkgd')
          .attr('y', that._y(d.y) - 40);
        d3.select(this).select('.segment-label-text')
          .text(function(d) {
            return (d.x > that._x.invert(0)) ? d3.format('.1f')(d.y) : null;
          })
          .attr('y', that._y(d.y) - 22);
      });
    d3.select('.y.axis').call(that.y_axis);
  };
  that.update_legend = function(_d) {
    that.tool_tip
      .html(that._format_x(_d.x) + ':&nbsp;' + that._format_y(_d.y))
      .style('left', (that._x(_d.x) + that.left + 10) + 'px')
      .style('top', (that._y(_d.y) + that.top) + 'px')
      .classed('active', true);
  };
  that.add_hover = function() {
    /*
     Attach mouse events to <rect>s with hoverable handles (toggle .active)
     */
    that.handles.each(function(d) {
      d3.select(this).select('.segment-rect')
        .on('mouseover', function() {
          that.update_legend(d);
          that.tool_tip.classed('hidden', !that._hoverable);
          d3.selectAll('.data-point.tight').classed('active', false);
          d3.selectAll('.data-point.tight').classed('hovered', false);
          d3.select(this.parentNode.getElementsByClassName('tight')[0])
            .classed('active', true);
        })
        .on('mouseout', function() {
          that.adjust_dot = null;
          d3.select(this.parentNode.getElementsByClassName('tight')[0])
            .classed('active', false);
        });
    });
  };
  that.add_drag_hover = function() {
    /*
     Attach mouse events to draggable handles (toggle .active)
     */
    that.handles.each(function(d) {
      var handle = d3.select(this);
      d3.select(this).selectAll('.data-point.loose')
        .on('mouseover', function() {
          that.update_legend(d);
          that.tool_tip.classed('hidden', !that._hoverable);
          d3.selectAll('.data-point.tight').classed('active', false);
          d3.selectAll('.data-point.tight').classed('hovered', false);
          handle.select('.data-point.tight')
            .classed('active', true).classed('hovered', true);
        })
        .on('mouseout', function() {
          d3.select(this).classed('active', false).classed('hovered', false);
        });
    });
  };
  that.remove_hover = function() {
    /*
     Remove mouse events from <rect>s with hoverable handles (toggle .active)
     */
    that.handles.selectAll('rect').on('mouseover', function() { return null; });
    that.handles.selectAll('rect').on('mouseout', function() { return null; });
  };
  that.remove_drag_hover = function() {
    /*
     Remove mouse events from draggable handles (toggle .active)
     */
    that.adjust_dot.on('mouseover', function() { return null; });
    that.adjust_dot.on('mouseout', function() { return null; });
    d3.selectAll('.data-point').on('mouseover', function() { return null; });
  };
  that.drag_start = function(d, i) {
    that.handles.filter(function(_d) { return _d === d; }).select('.segment-label-text').classed('hidden', that._labels);
    that.tool_tip.classed('hidden', true);
    that.graph_data.active = that.graph_data.data[0];
    that.adjust_dot = d3.select(this);
    that.adjust_data.start = d.y;
    that.adjust_data.index = i;
    that.remove_hover();
    that.remove_drag_hover();
  };
  that.drag_move = function(d) {
    var adjusted = that._y.invert(d3.event.y),
      delta = Math.round(adjusted / that.adjust_data.step) * that.adjust_data.step;
    that.graph_data.active.filter(function(_d) { return _d === d; })[0].y = (delta > that._y.domain()[0]) ? (delta > that._y.domain()[1]) ? that._y.domain()[1] : delta : that._y.domain()[0];
    that.redraw();
  };
  that.drag_end = function(d) {
    //TODO: update session
    that.update_legend(d);
    that.tool_tip.classed('hidden', false);
    that.handles.filter(function(_d) { return _d === d; }).select('.segment-label-text').classed('hidden', !that._labels);
    that.adjust_data.stop = that.graph_data.active.filter(function(_d) { return _d === d; })[0].data;
    that.adjust_dot = null;
    that.graph_data.data[0] = that.graph_data.active;
//      update_session(data);
    that.redraw();
    that.add_hover();
    that.add_drag_hover();
  };
  that.mask_edges = function() {
    /*
     Draw masks on 4 edges of graph -- covers up extra graph underneath axes.
     */
    that.mask_layer.append('rect').attr('class', 'mask')
      .attr('width', that._width + that.left + that.right).attr('height', that.top)
      .attr('transform', 'translate(0,0)');
    that.mask_layer.append('rect').attr('class', 'mask')
      .attr('width', that._width + that.left + that.right).attr('height', that.bottom)
      .attr('transform', 'translate(0,' + (that._height + that.top) + ')');
    that.mask_layer.append('rect').attr('class', 'mask')
      .attr('width', that.left).attr('height', that._height + that.top + that.bottom)
      .attr('transform', 'translate(0,0)');
    that.mask_layer.append('rect').attr('class', 'mask right')
      .attr('width', that.right).attr('height', that._height + that.top + that.bottom)
      .attr('transform', 'translate(' + (that._width + that.left) + ',0)');
    that.masks = that.mask_layer.selectAll('.mask');
    if (that._hoverable) {
      that.masks.on('mouseover', function() {
        that.tool_tip.classed('hidden', true);
      });
    }
  };
  that.draw_axes = function() {
    /*
     Draw x and y axes, ticks, etc.
     */
    that.axes_layer.append('g')
      .attr('transform', 'translate(0,' + (that._height + 5) + ')')
      .call(that.x_axis);
    that.axes_layer.append('g')
      .attr('transform', 'translate(-5,0)')
      .call(that.y_axis);
  };
  that.edit_switch_click = function() {
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
  };
  that.domain_switch_click = function() {
    d3.event.preventDefault();
    var active_switch = d3.select(this);
    d3.selectAll(this.parentNode.getElementsByClassName('switch')).each(function() {
      var current_switch = d3.select(this);
      current_switch.classed('active', active_switch.attr('data-domain') === current_switch.attr('data-domain'));
      that._y.domain([that._y.domain()[0], active_switch.attr('data-domain')]);
//        current_switch.classed('active', !current_switch.classed('active'));
      that.redraw();
    });
  };
  that.graph_drag = d3.behavior.drag().on('drag', that.drag_move).on('dragstart', that.drag_start).on('dragend', that.drag_end);
  /****************
   "Public" methods
   ****************/
  this.select = function(el) {
    if (!el) { return that.svg_id; }
    that.svg_id = el;
    that.switches_list = d3.select(el).append('div').attr('id', 'switches');
    var layer_translation = 'translate(' + that.left + ',' + that.top + ')';
    that.svg = d3.select(that.svg_id).append('svg').attr('width', that._width + that.left + that.right)
      .attr('height', that._height + that.top + that.bottom);
    that.ghost_layer = that.svg.append('g').attr('id', 'ghost_layer').attr('transform', layer_translation);
    that.grid_layer = that.svg.append('g').attr('id', 'grid_layer').attr('transform', layer_translation);
    that.graph_layer = that.svg.append('g').attr('id', 'graph_layer').attr('transform', layer_translation);
    that.default_layer = that.svg.append('g').attr('transform', layer_translation);
    that.mask_layer = that.svg.append('g').attr('id', 'mask_layer');
    that.axes_layer = that.svg.append('g').attr('id', 'axes_layer').attr('transform', layer_translation);
    that.handle_layer = that.svg.append('g').attr('id', 'handle_layer').attr('transform', layer_translation);
    that.button_layer = that.svg.append('g').attr('id', 'button_layer').attr('transform', layer_translation);
    return this;
  };
  this.x = function(val) {
    if (!val) { return that._x; }
    that._x = val;
    that._x.range([0, that._width]);
    return this;
  };
  this.y = function(val) {
    if (!val) { return that._y; }
    that._y = val;
    that._y.range([that._height, 0]);
    return this;
  };
  this.domain = function(xd, yd) {
    if (xd === undefined) { return [that._x.domain(), that._y.domain()]; }
    that._x.domain(xd);
    if (yd) {
      that._y.domain(yd);
    }
    return this;
  };
  this.padding = function(all, sides, bottom, left) {
    if (!all) { return [that.top, that.right, that.bottom, that.left]; }
    that.top = all;
    that.right = all;
    that.bottom = all;
    that.left = all;
    if (sides) {
      that.right = sides;
      that.left = sides;
      if (bottom) {
        that.bottom = bottom;
        if (left) {
          that.left = left;
        }
      }
    }
    return this;
  };
  this.width = function(val) {
    if (!val) { return that._width; }
    that._width = val - that.left - that.right;
    return this;
  };
  this.height = function(val) {
    if (!val) { return that._height; }
    that._height = val - that.top - that.bottom;
    return this;
  };
  this.colors = function(func) {
    if (!func) { return that._colors; }
    if (typeof func === 'function') {
      that._colors = func;
      return this;
    }
    that.color_list = func;
    return this;
  };
  this.data = function(val) {
    if (!val) { return that.graph_data.data; }
    that.graph_data.data = val;
    return this;
  };
  this.max_domains = function(arr) {
    //TODO: This should really be wrapped up with this.domain()
    if (arr === undefined) { return that._max_domains; }
    that._max_domains = arr;
    var domain_switch = that.switches_list.append('span').attr('id', 'domain_switch').attr('class', 'switch-group');
    domain_switch.append('span').text('[ ');
    domain_switch.selectAll('.switch')
      .data(arr).enter()
      .append('a').attr('id', function(d) { return 'domain_switch_' + d; })
      .attr('class', 'switch').classed('active', function(d, i) { return d === that._y.domain()[1]; })
      .attr('data-domain', function(d) { return d; })
      .text(function(d) { return d; }).on('click', that.domain_switch_click)
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
    if (bool === undefined) { return that._draggable; }
    if (_label === undefined) { that._labels = false; } else { that._labels = _label; }
    if (!that._hoverable) {
      that._draggable = false;
      console.log('Cannot set draggable unless hoverable() is explicitly set to true first.');
      return this;
    }
    that._draggable = bool;
    if (bool === false) {
      d3.selectAll('.data-point').classed('draggable', false);
      d3.selectAll('.segment-label-bkgd').classed('hidden', true);
      d3.selectAll('.segment-label-text').classed('hidden', true);
      that.remove_drag_hover();
      return this;
    }
    // Add draggable class and labels to handles
    that.handles.each(function(d, i) {
      var handle = d3.select(this);
      handle.selectAll('.data-point').classed('draggable', true).call(that.graph_drag, i);
      //TODO: Add data- attributes
      handle.append('rect')
        .attr('class', 'segment-label-bkgd')
        .classed('hidden', function() { return !that._labels; })
        .attr('height', 20)
        .attr('width', that.segment_width - 4)
        .attr('x', 2)
        .attr('y', that._y(d.y) - 40)
        .style('fill', 'transparent');
      handle.append('text')
        .attr('class', 'segment-label-text')
        .classed('hidden', function() { return !that._labels; })
        .attr('x', that.segment_width / 2)
        .attr('y', that._y(d.y) - 22)
        .style('text-anchor', 'middle')
        .text(function(d) {
          return (d.x > that._x.invert(0)) ? d3.format('.1f')(d.y) : null;
        });
    });
    // Add toggle switch
    var edit_switch = that.switches_list.append('span').attr('id', 'edit_switch').attr('class', 'switch-group');
    edit_switch.append('span').text('[ ');
    edit_switch.append('a').attr('id', 'drag_switch').attr('class', 'switch active')
      .attr('data-layer-toggle', '#handle_layer').text('drag').on('click', that.edit_switch_click);
    edit_switch.append('span').text(' | ');
    edit_switch.append('a').attr('id', 'type_switch').attr('class', 'switch')
      .attr('data-layer-toggle', '#chart_inputs').text('type').on('click', that.edit_switch_click);
    edit_switch.append('span').text(' ]');
    that.chart_inputs = d3.select(that.svg_id).append('form')
      .attr('id', 'chart_inputs')
      .style('padding-left', that.left + 'px')
      .classed('hidden', true);
    // Add inputs
    that.graph_data.inputs = that.chart_inputs.selectAll('input')
      .data(that.graph_data.data[0]).enter()
      .append('input').attr('type', 'text').attr('class', 'chart-input')
      .attr('data-x', function(d) { return d.x; }).property('value', function(d) { return that._format_y(d.y); })
      .style('width', (that.segment_width - 14) + 'px')
      .style('display', function(d) {return ((that._x(d.x) > that._x.range()[0]) && (that._x(d.x) <= that._x.range()[1])) ? 'block' : 'none'; })
      .on('change', function(d) {
        var _v = (d3.select(this).property('value'));
        //TODO: Better max and min
        _v = (_v > 100) ? 100 : (_v < 0) ? 0 : _v;
        that.graph_data.data[0].filter(function(_d) { return _d.x === d.x; })[0].y = _v;
        d3.select(this).property('value', _v);
        that.redraw();
      });
    that.add_drag_hover();
    return this;
  };
  this.hoverable = function(bool) {
    if (bool === undefined) { return that._hoverable; }
    that._hoverable = bool;
    if (bool === false) {
      d3.selectAll('.data-point.tight').classed('hoverable', false);
      that.remove_hover();
      return this;
    }
    that.tool_tip = d3.select(that.svg_id).append('div').attr('id', 'tool_tip');
    that.segment_width = that._x(that.graph_data.data[0][1].x) - that._x(that.graph_data.data[0][0].x);
    that.handles = that.handle_layer.selectAll('.segment')
      .data(that.graph_data.data[0])
      .enter()
      .append('g')
      .attr('class', 'segment')
      .attr('transform', function(d) {return 'translate(' + (that._x(d.x) - that.segment_width / 2) + ',0)'; });
    that.handles.each(function(d, i) {
      var visible = ((that._x(d.x) >= that._x.range()[0]) && (that._x(d.x) <= that._x.range()[1])),
        handle = d3.select(this);
      handle.append('rect')
        .attr('class', 'segment-rect')
        .attr('height', that._y.range()[0])
        .attr('width', that.segment_width)
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
        .attr('cx', that.segment_width / 2)
        .attr('cy', function() { return that._y(d.y); })
        .attr('r', function() { return visible ? 4 : 0; });
      handle.append('circle')
        .classed('data-point', function() { return visible; })
        .classed('hoverable', function() { return visible; })
        .classed('loose', true)
        .attr('data-x', function(d) { return d.x; })
        .attr('data-y', function(d) { return d.y; })
        .attr('cx', that.segment_width / 2)
        .attr('cy', function() { return that._y(d.y); })
        .attr('r', function() { return visible ? that.segment_width / 2 : 0; });
    });
    that.add_hover();
    return this;
  };
  this.h_grid = function(bool) {
    //TODO: Don't return null if args undefined
    if (bool === undefined) { return null; }
    if (bool === false) {
      that.grid_layer.selectAll('.grid-line').remove();
      return this;
    }
    that.grid_layer.selectAll('.grid-line')
      .data(that._y.ticks()).enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', that._x.range()[0])
      .attr('x2', that._x.range()[1])
      .attr('y1', function(d) { return that._y(d); })
      .attr('y2', function(d) { return that._y(d); });
    return this;
  };
  this.ghost = function(arr) {
    if (!that._draggable) {
      console.log('Graph must be draggable in order to use ghost().');
      return this;
    }
    if (!arr) { return that.graph_data.ghost; }
    that.graph_data.ghost = arr;
    that.ghost_layer.append('path')
      .attr('d', that._area(arr))
      .attr('class', 'ghost_area')
      .style('fill', '#dddddd');
    return this;
  };
  this.default_line = function(arr) {
    if (!that._draggable) {
      console.log('Graph must be draggable in order to use default_line().');
      return this;
    }
    if (!arr) { return that.graph_data.default_line; }
    that.graph_data.default_line = arr;
    that.default_layer.append('path')
      .attr('d', that._line(arr))
      .attr('class', 'default_line');
    return this;
  };
  this.format_x = function(func) {
    if (func === 'undefined') { return that._format_x; }
    that._format_x = func;
    return this;
  };
  this.format_y = function(func) {
    if (func === 'undefined') { return that._format_y; }
    that._format_y = func;
    return this;
  };
  this.draw = function() {
    that.graph_data.active = that.graph_data.data[0];
    that._line = d3.svg.line()
      .x(function(d) { return that._x(d.x); })
      .y(function(d) { return that._y(d.y); });
    that._area = d3.svg.area()
      .x(function(d) { return that._x(d.x); })
      .y0(function() { return that._y(0); })
      .y1(function(d) { return that._y(d.y); });
    that.graph_data.graphs = that.graph_layer.selectAll('.chart-line')
      .data(that.graph_data.data).enter().append('path')
      .attr('d', function(d) { return that._area(d); })
      .attr('class', 'chart-line')
      .style('fill', function(d, i) {return that._colors(i); });
    that.draw_axes();
    that.mask_edges();
    return this;
  };
};

var RPSGraphDraggable = function() {
  'use strict';
  RPSGraph.call(this);
  this.prototype = new RPSGraph();

};
RPSGraphDraggable.prototype.constructor = RPSGraphDraggable;
