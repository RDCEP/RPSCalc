var RPSGraph = function() {
  var _width = 700,
    _height = 345,
    _padding = {top:0, right:0, bottom:0, left:0},
    _x,
    _y;
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
};

var Trajectory = function() {
  var data,
    width = 700,
    height = 350,
    padding = {top: 30, right:30, bottom:30, left:30},
    domain_x = [new Date(2013, 0, 1), new Date(2030, 0, 1)],
    domain_y = [0, 50],
    adjust_data = {step:.005, start:0, stop:0, index:0},
    adjust_dot,
    trajectory_drag = d3.behavior.drag()
      .on('drag', drag_move)
      .on('dragstart', drag_start)
      .on('dragend', drag_end),
    print_date = d3.time.format('%Y'),
    svg = d3.select('#state_trajectory')
      .append('svg')
      .attr('width', width+padding.left+padding.right)
      .attr('height', height+padding.top+padding.bottom),
    graph = svg.append('g')
      .attr('transform', 'translate('+padding.left+','+padding.top+')'),
    dflt = svg.append('g'),
    mask = svg.append('g'),
    handle_layer = svg.append('g')
      .attr('transform', 'translate('+padding.left+','+padding.top+')'),
//    x = d3.time.scale().domain(domain_x).range([padding.left, width+padding.left]),
//    y = d3.scale.linear().domain(domain_y).range([height+padding.top, padding.top]),
    x = d3.time.scale().domain(domain_x).range([0, width]),
    y = d3.scale.linear().domain(domain_y).range([height, 0]),
    x_axis = d3.svg.axis().scale(x),
    y_axis = d3.svg.axis().scale(y),
    trajectory_line = d3.svg.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.data); }),
    trajectory_area = d3.svg.area()
      .x(function(d) { return x(d.date); })
      .y0(function(d) { return y(0); })
      .y1(function(d) { return y(d.data * 100); }),
    time_period_width = x(new Date(2013, 0, 1)) - x(new Date(2012, 0, 1)),
    trajectory,
    handles
  ;

  function drag_move(d, i, ii) {
    var adjusted = y.invert(d3.event.y) / 100,
      delta = Math.round(adjusted / adjust_data.step) * adjust_data.step,
      rounded = (delta > 0) ? (delta >.5) ? .5 : delta : 0
    ;
    data.filter(function(_d) { return _d == d; })[0].data = rounded;
    redraw();
  }

  function drag_start(d, i, ii, foo) {
    console.log('start', d, i, ii, foo);
    adjust_dot = d3.select(this);
    adjust_data.start = d.data;
    adjust_data.index = i
    handles.selectAll('rect').on('mouseover', function() {return null;});
    handles.selectAll('rect').on('mouseout', function() {return null;});
    adjust_dot.on('mouseover', function() {return null;});
    adjust_dot.on('mouseout', function() {return null;});
  }

  function drag_end(d, i, ii) {
    adjust_dot.classed('active', false).classed('hovered', false);
    adjust_data.stop = data.filter(function(_d) { return _d == d; })[0].data;
    redraw();
    adjust_dot = null;
  }

  function redraw() {
    trajectory
      .attr('d', trajectory_area(data))
    ;
    handles.data(data)
      .each(function(d,i) {
        d3.select(this).select('.time-period-rect')
          .on('mouseover', function() {
            var _xo = d3.select(this).attr('data-year');
            d3.select(this.parentNode.getElementsByClassName('data-point')[0])
              .classed('active', true);
          })
          .on('mouseout', function() {
            adjust_dot = null;
            d3.select(this.parentNode.getElementsByClassName('data-point')[0])
              .classed('active', false);
          })
        d3.select(this).select('.data-point')
          .attr('cy', function() {return y(d.data*100);})
          .on('mouseover', function() {
            d3.select(this).classed('active', true).classed('hovered', true);
          })
          .on('mouseout', function() {
            d3.select(this).classed('active', false).classed('hovered', false);
          })
        ;
        d3.select(this).select('.time-period-label-bkgd')
          .attr('y', y(d.data*100) - 40)
        ;
        d3.select(this).select('.time-period-label-text')
          .text(d3.format('.1f')(d.data*100))
          .attr('y', y(d.data*100) - 22)
        ;
      })
    ;
  }

  function trajectory_graph(_s) {
    data = _s.properties.trajectory;
    trajectory = graph.append('path')
      .attr('d', trajectory_area(data))
      .attr('class', 'chart-line')
      .style('fill', '#dddddd')
    ;
    handles = handle_layer.selectAll('.time-period')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'time-period')
      .attr('transform', function(d, i) {
        return 'translate('+(x(d.date)-time_period_width/2)+',0)';
      })
    ;
    handles.each(function(d, i) {
      d3.select(this).append('rect')
        .attr('class', 'time-period-rect')
        .attr('height', y.range()[0])
        .attr('width', time_period_width)
        .attr('data-year', function(d) {
          return print_date(d.date);
        })
        .style('fill', 'transparent')
      ;
      d3.select(this).append('circle')
        .classed('data-point', true)
        .attr('cx', time_period_width/2)
        .attr('cy', function() {return y(d.data*100);})
        .attr('r', 6)
        .call(trajectory_drag, i)
      ;
      d3.select(this).append('rect')
        .attr('class', 'time-period-label-bkgd')
        .attr('height', 20)
        .attr('width', time_period_width-4)
        .attr('x', 2)
        .attr('y', y(d.data*100) - 40)
        .attr('data-year', function(d) {
          return print_date(d.date);
        })
        .style('fill', 'transparent')
      ;
      d3.select(this).append('text')
        .attr('class', 'time-period-label-text')
        .attr('x', time_period_width/2)
        .attr('y', y(d.data*100) - 22)
        .attr('data-year', function(d) {
          return print_date(d.date);
        })
        .style('text-anchor', 'middle')
    });
    mask.append('rect').attr('class', 'mask')
      .attr('width', width+padding.left+padding.right).attr('height', padding.top)
      .attr('transform', 'translate(0,0)');
    mask.append('rect').attr('class', 'mask')
      .attr('width', width+padding.left+padding.right).attr('height', padding.bottom)
      .attr('transform', 'translate(0,'+(height+padding.top)+')');
    mask.append('rect').attr('class', 'mask')
      .attr('width', padding.left).attr('height', height+padding.top+padding.bottom)
      .attr('transform', 'translate(0,0)');
    mask.append('rect').attr('class', 'mask')
      .attr('width', padding.left).attr('height', height+padding.top+padding.bottom)
      .attr('transform', 'translate('+(width+padding.left)+',0)');

    redraw();
  }

  this.build = function() {
    d3.json('/static/js/state_data.json', function(_data) {
      var parse_date = d3.time.format('%Y').parse;
      _data.features.forEach(function(d, i) {
        if (d.properties.trajectory) {
          _date_data = [];
          d.properties.trajectory.forEach(function(dd, ii) {
            _date_data.push({'data': dd, 'date': parse_date(String(ii+ 2000))});
          });
          d.properties.trajectory = _date_data;
        }
        if (d.properties.carveouts) {
          d.properties.carveouts.forEach(function(dd, ii) {
            _date_data = [];
            dd.data.forEach(function(ddd, iii) {
              _date_data.push({'data': ddd, 'date': parse_date(String(iii+ 2000))});
            });
            dd.data = _date_data;
          });
        }
      });
      var _s = _data.features.filter(function(d) {
        return (d.properties.machine_name == Options.state) ? d : null;
      })[0];
      data = _s.properties.trajectory;
      trajectory_graph(_s);
    });
  };
};
var trajectory_page = new Trajectory();
trajectory_page.build();