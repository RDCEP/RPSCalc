var RPSGraph = function() {
  var _data,
    width = 700,
    height = 345,
    padding = {top:0, right:0, bottom:0, left:0},
    x_domain = [0, 1],
    y_domain = [0, 1],
    x_range = [0, width],
    y_range = [height, 0],
    x,
    y,
    graph_data = {graph:null, data:null, colors:null},
    svg_id = '#',

    foo
  ;

  //TODO: Should these return eg, _x_domain or _x.domain()? Ie, is _x_domain necessary?
  this.select = function(el) {
    if (el) {svg_id = el; return this; } else { return svg_id; }
  };
  this.x = function(val) {
    if (val) { x = val; return this; } else { return x; }
  };
  this.y = function(val) {
    if (val) { y = val; return this; } else { return y; }
  };
  this.domain = function(xd, yd) {
    if (xd) {
      x_domain = xd; x.domain(xd);
      if (yd) {
        y_domain = yd; y.domain(yd);
      }
      return this;
    } else { return x_domain; }
  };
  this.padding = function(top, right, bottom, left) {
    if (top) {
      padding.top = top; padding.right = top; padding.bottom = top; padding.left = top;
      if (right) {
        padding.right = right; padding.left = right;
        if (bottom) {
          padding.bottom = bottom;
          if (left) {
            padding.left = left;
          }
        }
      }
      return this;
    } else { return padding; }
  };
  this.width = function(val) {
    if (val) { width = val; x.range([0, val]); return this; } else { return width; }
  };
  this.height = function(val) {
    if (val) { height = val; y.range([val, 0]); return this; } else { return height; }
  };
  this.graph = function(val, colors) {
    if (val) { graph_data.data = val; if (colors) {graph_data.colors = colors} return this; } else { return graph_data; }
  };

  this.draw = function(el) {
    var layer_translation = 'translate('+padding.left+','+padding.top+')',
      svg = d3.select(el).append('svg').attr('width', width+padding.left+padding.right)
        .attr('height', height+padding.top+padding.bottom),
      grid_layer = svg.append('g').attr('id', 'grid_layer').attr('transform', layer_translation),
      graph_layer = svg.append('g').attr('id', 'graph_layer').attr('transform', layer_translation),
      dflt = svg.append('g').attr('transform', layer_translation),
      mask_layer = svg.append('g').attr('id', 'mask_layer'),
      axes_layer = svg.append('g').attr('id', 'axes_layer').attr('transform', layer_translation),
      handle_layer = svg.append('g').attr('id', 'handles_layer').attr('transform', layer_translation),
      buttons_layer = svg.append('g').attr('id', 'buttons_layer').attr('transform', layer_translation),
      x_axis = d3.svg.axis().scale(x).orient('bottom'),
      y_axis = d3.svg.axis().scale(y).orient('left'),
      _line = d3.svg.line()
        .x(function(d) { return x(d.x); })
        .y(function(d) { return y(d.y); }),
      _area = d3.svg.area()
        .x(function(d) { return x(d.x); })
        .y0(function(d) { return y(0); })
        .y1(function(d) { return y(d.y); }),
      foo
    ;
    graph_data.graph = graph_layer.selectAll('.chart-line')
      .data(graph_data.data).enter().append('path')
      .attr('d', function(d, i) { return _area(d); })
      .attr('class', 'chart-line')
      .style('fill', function(d, i) {return graph_data.colors[i]; });
    mask_layer.append('rect').attr('class', 'mask')
      .attr('width', width+padding.left+padding.right).attr('height', padding.top)
      .attr('transform', 'translate(0,0)');
    mask_layer.append('rect').attr('class', 'mask')
      .attr('width', width+padding.left+padding.right).attr('height', padding.bottom)
      .attr('transform', 'translate(0,'+(height+padding.top)+')');
    mask_layer.append('rect').attr('class', 'mask')
      .attr('width', padding.left).attr('height', height+padding.top+padding.bottom)
      .attr('transform', 'translate(0,0)');
    mask_layer.append('rect').attr('class', 'mask')
      .attr('width', padding.left).attr('height', height+padding.top+padding.bottom)
      .attr('transform', 'translate('+(width+padding.left)+',0)');
    mask_layer.append('g')
      .attr('transform', 'translate(0,'+(height+10)+')')
      .call(x_axis);
    mask_layer.append('g')
      .attr('transform', 'translate('+(0)+',0)')
      .call(y_axis);

  }
};