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
  var data = [],
    width = 700,
    height = 350,
    padding = {top: 20, right:20, bottom:20, left:20},
    domain_x = [new Date(2013, 0, 1), new Date(2030, 0, 1)],
    domain_y = [0, 50],
    adjust_data = {step:.5, start:0, end:0},
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
      graph = svg.append('g'),
      dflt = svg.append('g'),
      handle_layer = svg.append('g'),
      x = d3.time.scale().domain(domain_x).range([padding.left, width+padding.left]),
      y = d3.scale.linear().domain(domain_y).range([height+padding.top, padding.top]),
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
      trajectory = graph.append('path')
        .attr('d', trajectory_area(data))
        .attr('class', 'chart-line')
        .style('fill', '#dddddd'),
      handles
  ;

  function drag_move(d, i) {
//    console.log(d3.event.x, d3.event.y)
//    var alpha = atan(d3.event.y / d3.event.x) + (pi / 2);
//    var delta = alpha - slice.lastdrag;
//    if (alpha < d.endAngle) {
//      if (Math.abs(delta) < pi ) {
//        if ((d.endAngle - alpha) < slice.max) {
//          slice.lastdrag = alpha;
//          data[i] = round(r2d((d.endAngle - alpha)) / 360 * 100 / slice.step) * slice.step;
//          data[0] = 0;
//          data[0] = 100 - d3.sum(data);
//          chart.data(pie(data));
//          redraw();
//        }
//      }
//    }
  }

  function drag_start(d) {
    console.log('start');
    adjust_dot = d3.select(this);
    adjust_data.start = d.data;
    handles.selectAll('rect').on('mouseover', function() {return null;});
    handles.selectAll('rect').on('mouseout', function() {return null;});
    adjust_dot.on('mouseout', function() {return null;});
//    var other = d3.select(chart[0][0]);
//    slice.max = ((d.endAngle - d.startAngle) + other.data()[0].endAngle);
//    slice.start = d.startAngle;
//    slice.lastdrag = d.startAngle;
  }

  function drag_end(d, i) {
    adjust_dot = null;
    redraw();
    console.log('end');
//    pie_handles.attr('cy', slicehandleradius);
//    var future = document.getElementById('future').checked;
//    if (future) {
//      console.log(future);
//      for (var data_index in alldata) {
//        console.log(data_index, year, data);
//        if (data_index >= year) {
//          alldata[data_index] = data;
//        }
//      }
//    } else {
//      alldata[year] = data;
//    }
  }

  function redraw() {
    trajectory
      .attr('d', trajectory_area(data))
    ;
    handles = handle_layer.selectAll('.time-period')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'time-period')
      .attr('transform', function(d, i) {
        return 'translate('+(x(d.date)-time_period_width/2)+',0)';
      })
      .each(function(d, i) {

//        d3.select(this).append('circle')
//          .attr('class', 'data-point-inner')
//          .attr('cx', time_period_width/2)
//          .attr('cy', function() {return y(d.data*100);})
//          .attr('r', 2)
//        ;

        d3.select(this).append('rect')
          .attr('height', y.range()[0])
          .attr('width', time_period_width)
          .attr('data-year', function(d) {
            return print_date(d.date);
          })
          .style('fill', 'transparent')
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
        ;
        d3.select(this).append('circle')
          .classed('data-point', true)
          .attr('cx', time_period_width/2)
          .attr('cy', function() {return y(d.data*100);})
          .attr('r', 6)
          .call(trajectory_drag)
          .on('mouseover', function() {
            d3.select(this).classed('active', true).classed('hovered', true);
          })
          .on('mouseout', function() {
            d3.select(this).classed('active', false).classed('hovered', false);
          })
        ;
      });
  }

  function trajectory_graph(_s) {
    data = _s.properties.trajectory;

    redraw();

  }

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
var trajectory_page = Trajectory();