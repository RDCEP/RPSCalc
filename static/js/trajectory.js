var Trajectory = function() {
  var data,
    width = 700,
    height = 350,
    padding = {top: 30, right:30, bottom:30, left:30},
    domain_x = [new Date(2013, 0, 1), new Date(2030, 0, 1)],
    domain_y = [0, 50],
    adjust_data = {step:.5, start:0, stop:0, index:0},
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
    grid_layer = svg.append('g')
      .attr('id', 'grid_layer')
      .attr('transform', 'translate('+padding.left+','+padding.top+')'),
    graph = svg.append('g')
      .attr('id', 'graph_layer')
      .attr('transform', 'translate('+padding.left+','+padding.top+')'),
    dflt = svg.append('g')
      .attr('transform', 'translate('+padding.left+','+padding.top+')'),
    mask = svg.append('g')
      .attr('id', 'mask_layer'),
    axes = svg.append('g')
      .attr('id', 'axes_layer')
      .attr('transform', 'translate('+padding.left+','+padding.top+')'),
    handle_layer = svg.append('g')
      .attr('id', 'handles_layer')
      .attr('transform', 'translate('+padding.left+','+padding.top+')'),
    buttons_layer = svg.append('g')
      .attr('id', 'buttons_layer')
      .attr('transform', 'translate('+padding.left+','+padding.top+')'),
    form = d3.select('#state_trajectory').append('form')
      .attr('id', 'state_trajectory_inputs')
      .style('padding-left', padding.left+'px')
      .classed('hidden', true),
    x = d3.time.scale().domain(domain_x).range([0, width]),
    y = d3.scale.linear().domain(domain_y).range([height, 0]),
    x_axis = d3.svg.axis().scale(x).orient('bottom'),
    y_axis = d3.svg.axis().scale(y).orient('left'),
    trajectory_line = d3.svg.line()
      .x(function(d) { return x(d.date); })
      .y(function(d) { return y(d.data); }),
    trajectory_area = d3.svg.area()
      .x(function(d) { return x(d.date); })
      .y0(function(d) { return y(0); })
      .y1(function(d) { return y(d.data); }),
    time_period_width = x(new Date(2013, 0, 1)) - x(new Date(2012, 0, 1)),
    trajectory,
    handles,
    inputs
  ;

  function drag_move(d, i, ii) {
    var adjusted = y.invert(d3.event.y),
      delta = Math.round(adjusted / adjust_data.step) * adjust_data.step,
      rounded = (delta > 0) ? (delta > 50) ? 50 : delta : 0
    ;
    data.filter(function(_d) { return _d == d; })[0].data = rounded;
    redraw();
  }

  function drag_start(d, i, ii, foo) {
    console.log('start');
    adjust_dot = d3.select(this);
    adjust_data.start = d.data;
    adjust_data.index = i;
    handles.selectAll('rect').on('mouseover', function() {return null;});
    handles.selectAll('rect').on('mouseout', function() {return null;});
    adjust_dot.on('mouseover', function() {return null;});
    adjust_dot.on('mouseout', function() {return null;});
  }

  function drag_end(d, i, ii) {
    console.log('end');
    adjust_data.stop = data.filter(function(_d) { return _d == d; })[0].data;
    adjust_dot = null;
    redraw();
  }

  function redraw() {
    trajectory
      .attr('d', trajectory_area(data))
    ;
    inputs.data(data).each(function(d) {
      d3.select(this).attr('value', function(d) {return d.data;})
    });
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
          .attr('cy', function() {return y(d.data);})
          .on('mouseover', function() {
            d3.select(this).classed('active', true).classed('hovered', true);
          })
          .on('mouseout', function() {
            d3.select(this).classed('active', false).classed('hovered', false);
          })
        ;
        d3.select(this).select('.time-period-label-bkgd')
          .attr('y', y(d.data) - 40)
        ;
        d3.select(this).select('.time-period-label-text')
          .text(function(d) {
            return (d.date.getFullYear() > 2013) ? d3.format('.1f')(d.data) : null;
          })
          .attr('y', y(d.data) - 22)
        ;
      })
    ;
  }

  function trajectory_graph(_s) {
    data = _s.properties.trajectory;
    trajectory = graph.append('path')
      .attr('d', trajectory_area(data))
      .attr('class', 'chart-line')
      .style('fill', d3.rgb(0, 158, 115))
    ;
    handles = handle_layer.selectAll('.time-period')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'time-period')
      .attr('transform', function(d, i) {return 'translate('+(x(d.date)-time_period_width/2)+',0)';})
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
        .style('pointer-events', function(d) {return (d.date.getFullYear() > 2013) ? 'all' : 'none'; })
      ;
      d3.select(this).append('circle')
        .classed('data-point', true)
        .attr('cx', time_period_width/2)
        .attr('cy', function() {return y(d.data);})
        .attr('r', 6)
        .call(trajectory_drag, i)
      ;
      d3.select(this).append('rect')
        .attr('class', 'time-period-label-bkgd')
        .attr('height', 20)
        .attr('width', time_period_width-4)
        .attr('x', 2)
        .attr('y', y(d.data) - 40)
        .attr('data-year', function(d) {
          return print_date(d.date);
        })
        .style('fill', 'transparent')
      ;
      d3.select(this).append('text')
        .attr('class', 'time-period-label-text')
        .attr('x', time_period_width/2)
        .attr('y', y(d.data) - 22)
        .attr('data-year', function(d) {
          return print_date(d.date);
        })
        .style('text-anchor', 'middle')
    });
    grid_layer.selectAll('.grid-line')
      .data(y.ticks()).enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', 0)
      .attr('x2', x.range()[1])
      .attr('y1', function(d) { return y(d); })
      .attr('y2', function(d) { return y(d); })
    ;
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
    axes.append('g')
      .attr('transform', 'translate(0,'+(height+10)+')')
      .call(x_axis);
    axes.append('g')
      .attr('transform', 'translate('+(0)+',0)')
      .call(y_axis);
    inputs = form.selectAll('input')
      .data(data).enter()
      .append('input').attr('type', 'text')
      .style('width', (time_period_width-14)+'px')
      .style('display', function(d) {return (d.date.getFullYear() > 2013) ? 'block' : 'none'; })
      .on('change', function(d, i) {
        data.filter(function(_d) { return _d == d; })[0].data = d3.select(this).property('value');
        redraw();
      })
    ;
    dflt.append('path')
      .attr('id', 'default_trajectory')
      .attr('d', trajectory_line(data))
    ;
    //TODO: Below is totally repetitive. Rewrite.
    var drag_switch = d3.select('#drag_switch'),
      type_switch = d3.select('#type_switch');
    drag_switch.on('click', function() {
      d3.event.preventDefault();
      drag_switch.classed('active', function() {
        var state = drag_switch.classed('active');
        handle_layer.classed('hidden', state);
        form.classed('hidden', !state);
        type_switch.classed('active', state);
        return (state) ? false : true;
      });
    });
    type_switch.on('click', function() {
      d3.event.preventDefault();
      type_switch.classed('active', function() {
        var state = type_switch.classed('active');
        handle_layer.classed('hidden', !state);
        form.classed('hidden', state);
        drag_switch.classed('active', state);
        return (state) ? false : true;
      });
    });
    redraw();
  }

  this.build = function() {
    d3.json('/static/js/state_data.json', function(_data) {
      var parse_date = d3.time.format('%Y').parse;
      _data.features.forEach(function(d, i) {
        if (d.properties.trajectory) {
          _date_data = [];
          d.properties.trajectory.forEach(function(dd, ii) {
            _date_data.push({'data': dd*100, 'date': parse_date(String(ii+ 2000))});
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