var RPSGraph = function() {
  var _width = 700,
    _height = 345,
    _padding = {top:0, right:0, bottom:0, left:0},
    _x_domain = [0, 1],
    _y_domain = [0, 1],
    _x_range = [0, _width],
    _y_range = [_height, 0],
    _x,
    _y,
    _svg_id = '#'
  ;

  //TODO: Should these return eg, _x_domain or _x.domain()? Ie, is _x_domain necessary?
  this.x_domain = function(val) {
    if (val) { _x_domain = val; _x.domain(val); return this; } else { return _x_domain; }
  };
  this.y_domain = function(val) {
    if (val) { _y_domain = val; _y.domain(val); return this; } else { return _y_domain; }
  };
//  this.x_range = function(val) {
//    if (val) { _x_range = val; _x.range(val); return this; } else { return _x_range; }
//  };
//  this.y_range = function(val) {
//    if (val) { _y_range = val; _y.range(val); return this; } else { return _y_range; }
//  };
  this.x = function(val) {
    if (val) { _x = val; return this; } else { return _x; }
  };
  this.y = function(val) {
    if (val) { _y = val; return this; } else { return _y; }
  };
  this.padding = function(val) {
    if (val) { _padding = val; return this; } else { return _padding; }
  };
  this.width = function(val) {
    if (val) { _width = val; return this; } else { return _width; }
  };
  this.height = function(val) {
    if (val) { _height = val; return this; } else { return _height; }
  };

  this.draw = function() {
    var svg = d3.select(_svg_id)
        .append('svg')
        .attr('width', _width+_padding.left+_padding.right)
        .attr('height', _height+_padding.top+_padding.bottom),
      grid_layer = svg.append('g')
        .attr('id', 'grid_layer')
        .attr('transform', 'translate('+_padding.left+','+_padding.top+')'),
      graph = svg.append('g')
        .attr('id', 'graph_layer')
        .attr('transform', 'translate('+_padding.left+','+_padding.top+')'),
      dflt = svg.append('g')
        .attr('transform', 'translate('+_padding.left+','+_padding.top+')'),
      mask = svg.append('g')
        .attr('id', 'mask_layer'),
      axes = svg.append('g')
        .attr('id', 'axes_layer')
        .attr('transform', 'translate('+_padding.left+','+_padding.top+')'),
      handle_layer = svg.append('g')
        .attr('id', 'handles_layer')
        .attr('transform', 'translate('+_padding.left+','+_padding.top+')'),
      buttons_layer = svg.append('g')
        .attr('id', 'buttons_layer')
        .attr('transform', 'translate('+_padding.left+','+_padding.top+')')
    ;
  }
};