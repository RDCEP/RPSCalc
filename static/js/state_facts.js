var FactsPage = function() {
  var width = 345,
    height = 345,
    margin = 20,
    projection
  ;

  function get_color(i) {
    var color_list = [
      //d3.rgb(0, 0, 0), //black
      d3.rgb(86, 180, 233), // sky blue
      d3.rgb(230, 159, 0),  // orange
      d3.rgb(0, 158, 115),  // bluish green
      d3.rgb(240, 228, 66), // yellow
      d3.rgb(0, 114, 178),  // blue
      d3.rgb(213, 94, 0),   // vermilion
      d3.rgb(204, 121, 167) // reddish purple
    ];
    return color_list[i];
  }

  function hover_in(d) {
    /*
     Highlight trajectory on mouseover
     */
    if (d.properties.trajectory) {
      var _s = d3.select(this).attr('data-state'),
        state = d3.select('.map-state[data-state='+_s+']'),
        plot = d3.select('.trajectory[data-state='+_s+']'),
        _a = d3.select('.rps-state.active')
      ;
      if (_s != _a.attr('data-state')) {
        state.classed('hovered', true);
        plot.classed('hovered', true);
        plot.node().parentNode.appendChild(plot.node());
      }
    }
  }

  function hover_out() {
    /*
     Remove highlighting of trajectory on mouseout
     */
    var _s = d3.select(this).attr('data-state'),
      state = d3.select('.map-state[data-state='+_s+']'),
      plot = d3.select('.trajectory[data-state='+_s+']'),
      _a = d3.select('.trajectory.active')
    ;
    state.classed('hovered', false);
    plot.classed('hovered', false);
    _a.node().parentNode.appendChild(_a.node());
  }

  function rps_progress(_s) {
    /*
     Draw bar chart for current RPS progress.
     ...
     Args
     ----
     _s: Object representing active state
     ...
     */
    //TODO: _wd is set for a wide module (_wd = width for a narrow module)
    var _wd = width * 2 + 10,
      domain_x = [2000, 2030],
      domain_y = [0, 50],
      rpsp_height = 40,
      rpsp_margin = 15,
      rpsp = d3.select('#rps_progress')
        .append('svg')
        .attr('height', rpsp_height + 50)
        .attr('width', _wd),
      final = _s.trajectory[_s.trajectory.length - 6].data,
      current = _s.trajectory[2013 - domain_x[0]].data,
      actual = _s.snapshot.rps_progress,
      diff = Math.abs(actual - current)
    ;
    rpsp.append('rect')
      .attr('height', rpsp_height)
      .attr('width', _wd)
      .attr('transform', 'translate(0,'+rpsp_margin+')')
      .style('fill', '#ddd');
    rpsp.append('rect')
      .attr('height', rpsp_height)
      .attr('width', actual / final * _wd)
      .style('fill', '#56b4e9')
      .attr('transform', 'translate(0,'+rpsp_margin+')')
      .attr('data-amount', actual)
      .attr('class', 'rps-actual');
    rpsp.append('rect')
      .attr('height', rpsp_height)
      .attr('width', function() {
        return (actual <= current) ? diff / final * _wd : 1;
      })
      .attr('data-amount', actual - current)
      .attr('class', 'rps-diff')
      .attr('transform', function() {
        var offset = (actual <= current) ? actual / final * _wd : current / final * _wd;
        return 'translate(' + offset + ','+rpsp_margin+')';
      });
    var rps_hashes = rpsp.selectAll('.rps-hash')
      .data([actual, current, final])
      .enter()
      .append('line')
      .attr('x1', function(d, i) {
        if (i == 0) {
          return (actual != current) ? actual / final * _wd : null;
        }
        return d / final * _wd - i;
      })
      .attr('x2', function(d, i) {
        if (i == 0) {
          return (actual != current) ? actual / final * _wd : null;
        }
        return d / final * _wd - i; })
      .attr('y1', function(d, i) { return (i == 0) ? rpsp_margin : 0; })
      .attr('y2', function(d, i) { return (i == 0) ? rpsp_height+rpsp_margin : rpsp_height+2*rpsp_margin; })
      .attr('class', function(d, i) { return (i == 0) ? 'rps-hash-actual' : 'rps-hash'; });
    rps_hashes.each(function(d, i) {
      rpsp.append('text')
        .text(function() {
          return (i == 0) ? '' : (i == 1) ? '2013' : '2030';
        })
        .attr('class', 'rps-text')
        .attr('text-anchor', 'end')
        .attr('transform', function() {
          var v_offset = (rpsp_height + 2 * (rpsp_margin-2));
          var h_offset = d / final * _wd - i - 5;
          return 'translate(' + h_offset + ',' + v_offset + ')';
        })
      ;
      rpsp.append('text')
        .text(function() {
//          return (i == 0) ? (actual == current) ? '' : Math.round(actual * 100) + '%' : (i == 1) ? Math.round(current * 100) + '%' : Math.round(final * 100) + '%';
          return (i == 0) ? '' : (i == 1) ? Math.round(current * 100) + '%' : Math.round(final * 100) + '%';
        })
        .attr('class', 'rps-text')
        .attr('text-anchor', function() {return (i == 0) ? 'start' : 'end'; })
        .attr('transform', function() {
          var v_offset = (i == 0) ? (rpsp_margin-2) : (rpsp_margin-4);
          var h_offset = (i == 0) ? 0 : d / final * _wd - i - 5;
          return 'translate(' + h_offset + ','+v_offset+')';
        })
      ;
    });
//    rpsp.append('text')
//      .text(function() {
//        return (actual <= current) ? 'Non-compliant' : 'Compliant';
//      })
//      .attr('class', 'rps-text')
//      .attr('text-anchor', 'start')
//      .attr('transform', function() {
//        return 'translate(0,' + (rpsp_margin-2)+')';
//      })
  }

  function carveout_graph(_s) {
    /*
     Draw area chart of carveouts.
     ...
     Args
     ----
     _s: Object representing active state
     ...
     */
    _s.carveouts.splice(0,0,{type: 'RPS', data: _s.trajectory});
    var
      padding = {top:30,right:30,bottom:10,left:10},
      _h = height * 0.75, //y_max * 2 * height
      _w = width - padding.right - padding.left,
      y_max = d3.max(_s.trajectory, function(d) {return d.data;}),
      domain_x = [2000, 2030],
      x = d3.time.scale().domain([new Date(2000, 0, 1), new Date(2030, 0, 1)]).range([0,width]),
      y = d3.scale.linear().domain([0, y_max * 100]).range([_h - 2, 0]),
      svg = d3.select('#carveout_graph')
        .insert('svg', 'div')
        .attr('height', _h + padding.top)
        .attr('width', width+padding.right),
      graph = svg.append('g')
        .attr('transform', 'translate(0,30)'),
      legend = d3.select('#carveout_graph_legend')
        .selectAll('div')
        .data(_s.carveouts)
        .enter()
        .append('div')
        .style('top', padding.top+'px')
        .style('position', 'relative')
        .attr('class', 'clearfix'),
      area = d3.svg.area()
        .x(function(d, i) {return x(d.date); })
        .y1(function(d) { return y(d.data * 100); })
        .y0(y(0)),
      line = d3.svg.line()
        .x(function(d,i) { return x(d.date); })
        .y(function(d,i) { return y(d.data * 100); }),
      areas = graph.selectAll('.carveout-area')
        .data(_s.carveouts)
        .enter()
        .append('path')
        .attr('class', 'carveout-area')
        .attr('d', function(d) { return area(d.data); })
        .style('fill', function(d, i) { return get_color(i); })
    ;
    graph.selectAll('.carveout-line')
      .data(_s.carveouts)
      .enter()
      .append('path')
      .attr('class', 'carveout-line')
      .attr('d', function(d) { return line(d.data); })
    ;
    //TODO: this method for axis text sucks
    graph.selectAll('.carveout-axis-text')
      .data(_s.carveouts)
      .enter()
      .append('text')
      .attr('class', 'carveout-axis-text')
      .text(function(d) { return d.data[d.data.length-1] * 100; })
      .attr('transform', function(d, i) { return 'translate('+(width+2)+','+(y(d.data[d.data.length-1]*100))+')'; })
    ;
    svg.selectAll('.carveout-xaxis-text')
      .data([2000, 2030])
      .enter()
      .append('text')
      .attr('class', 'carveout-axis-text carveout-xaxis-text')
      .text(function(d) { return d; })
      .attr('transform', function(d, i) {
        var offset = (i == 0) ? 2 : width-2;
        return 'translate('+(offset)+',20)';
      })
      .style('text-anchor', function(d, i) {return (i == 0) ? 'start' : 'end'; })
    ;
    graph.append('line')
      .attr('class', 'edge-axis')
      .attr('x1', 0).attr('x2', width)
      .attr('y1', 0).attr('y2', 0)
    ;
    graph.append('line')
      .attr('class', 'edge-axis')
      .attr('x1', width).attr('x2', width)
      .attr('y1', 0).attr('y2', height)
    ;
    legend.append('div')
      .style('background-color', function(d, i) { return get_color(i); })
      .attr('class', 'carveout-swatch')
    ;
    legend.append('p')
      .text(function(d) { return d.type; })
      .attr('class', 'carveout-text')
    ;
    if (_s.carveouts.length > 0) {
      d3.select('#carve_out_wrap h3')
        .classed('right-align', true);
    }
  }

  function grid_mix_bars(_s) {
    /*
     Get grid mix information from EIA and draw chart
     ...
     Args
     ----
     _s: Object representing active state
     ...
     */
    d3.json('/static/js/gridmix/'+_s.abbr+'.json', function(data) {
      var _max = data.maximum,
        _th = 0, // height of title
        _rh = 20, //row height
        _lh = 50, // legend height
        _mt = 5, //margin top
        _mb = 5, //margin bottom
        _h = _rh * data.data.length + _th,
        _wt = 200, // width of titles
        _wd = 500, // width of data
        color_co2 = d3.scale.linear()
          .domain([0,500])
//          .range(['#56b4e9', '#d55e00']),
          .range(['#dddddd', '#d55e00']),
        svg = d3.select('#grid_mix')
          .append('svg')
          .attr('height', _h + _th + _mt + _mb + _lh)
          .attr('width', width * 2 + 10),
        grid_mix = svg.append('g'),
        grid_axes = grid_mix.selectAll('.grid-axis')
          .data(data.divs)
          .enter()
          .append('line')
          .attr('class', 'grid-axis')
          .attr('y1', 0)
          .attr('y2', _h + _mt + _mb)
          .attr('x1', function(d, i) { return (i == 0) ? d / _max * _wd + 1 : d / _max * _wd - 1;  })
          .attr('x2', function(d, i) {
            return (i == 0) ? d / _max * _wd + 1 : d / _max * _wd - 1;
          })
          .attr('transform', 'translate('+_wt+',0)')
      ;
      grid_mix.selectAll('.grid-axis-text')
        .data(data.divs)
        .enter()
        .append('text')
        .attr('class', 'grid-axis-text')
        .style('text-anchor', function(d, i) {return (i == 0) ? 'start' : 'end'; })
        .text(function(d, i) { return d; })
        .attr('transform', function(d) { return 'translate('+(_wt + d / _max * _wd)+','+(_h+_mt+_mb)+')'; })
      ;
      grid_mix.append('text')
        .text('trillions BTU')
        .attr('transform', 'translate('+_wt+','+(_h+_mt+_mb+15)+')')
        .attr('class', 'grid-axis-text')
      ;
      grid_bars = grid_mix.selectAll('.grid-data')
        .data(data.data)
        .enter()
        .append('g')
        .attr('class', 'grid-data')
        .attr('height', _rh)
        .attr('width', width * 2)
        .attr('transform', function(d, i) {
          return 'translate(0,'+((i*_rh)+_th + _mt)+')';
        })
        .attr('data-value', function(d) { return d.data; })
        .attr('data-name',function(d) { return d.sector; })
      ;
      grid_bars.append('text')
        .text(function(d, i) { return d.sector; })
        .attr('class', 'grid-data-text')
        .attr('text-anchor', 'end')
        .attr('transform', function(d, i) {
          return 'translate('+(_wt - 10)+',10)';
        })
      ;
      grid_bars.append('rect')
        .attr('width', function(d) { return d.data / _max * _wd; })
        .attr('height', 10)
        .style('fill', function(d) { return color_co2(d.intensity); })
        .attr('class', 'grid-data-bar')
        .attr('transform', function(d, i) {
          return 'translate('+_wt+',0)';
        })
      ;
      var grad = svg.append('defs').append('linearGradient')
        .attr('id', 'grad_intensity')
        .attr('x1', '0%')
        .attr('x2', '100%')
        .attr('y1', '0%')
        .attr('y2', '0%');
      grad.append('stop')
        .attr('offset', '0%')
        .style('stop-color', '#dddddd')
        .style('stop-opacity', 1);
      grad.append('stop')
        .attr('offset', '100%')
        .style('stop-color', '#d55e00')
        .style('stop-opacity', 1)
      ;

      grid_mix.append('rect')
        .attr('width', 500)
        .attr('height', 10)
        .attr('transform', 'translate('+_wt+','+(_h+_mt+_mb+25)+')')
        .style('fill', 'url(#grad_intensity)')
      ;
      grid_mix.append('text')
        .text('0 unit')
        .attr('transform', 'translate('+_wt+','+(_h+_mt+_mb+_lh-3)+')')
        .attr('class', 'grid-axis-text')
        .style('text-anchor', 'start')
      ;
      grid_mix.append('text')
        .text('500 unit')
        .attr('transform', 'translate('+(_wt+_wd)+','+(_h+_mt+_mb+_lh-3)+')')
        .attr('class', 'grid-axis-text')
        .style('text-anchor', 'end')
      ;
      grid_mix.append('text')
        .text('Carbon intensity')
//        .attr('transform', 'translate('+(_wt+_wd/2)+','+(_h+_mt+_mb+_lh-3)+')')
        .attr('transform', 'translate('+(_wt-10)+','+(_h+_mt+_mb+35)+')')
        .attr('class', 'grid-axis-text')
        .style('text-anchor', 'end')
      ;
    });
  }

  function retail_price_history(_s) {
    var parseDate = d3.time.format('%m-%Y').parse,
      padding = {top:30,right:30,bottom:10,left:10},
      _h = height * 0.75, //y_max * 2 * height
      _w = width * 2 + padding.left + padding.right,
      tool_tip = d3.select('#retail_price').append('div').classed('tooltip', true),
      svg = d3.select('#retail_price')
        .insert('svg', 'div')
        .attr('height', _h + padding.top + padding.bottom)
        .attr('width', width*2 + padding.left + padding.right),
      axes = svg.append('g'),
      graph = svg.append('g')
//        .attr('transform', 'translate('+padding.left+','+padding.top+')'),
        .attr('transform', 'translate(0,0)'),
      plotdots = svg.append('g')
    ;
    d3.json('/static/js/prices/'+_s.abbr+'.json', function(data) {
      data.data.forEach(function(d) {
        d.date = parseDate(d.date);
        d.data = +d.data;
      });
      var fx = function(d) { return d.date; },
        fy = function(d) { return d.data; },
        px = function(d) {return d3.time.format('%Y')(d.date);},
        domain_y = [0, Math.ceil(d3.max(data.data, function(d) { return d.data; }))],
        x = d3.time.scale()
          .domain(d3.extent(data.data, function(d) { return d.date; }))
          .range([0, width*2]),
        y = d3.scale.linear().domain(domain_y).range([_h+padding.top-2, padding.top]),
        x_axis = d3.svg.axis()
          .scale(x)
          .orient('top'),
        y_axis = d3.svg.axis()
          .scale(y)
          .orient('right'),
        line = d3.svg.line()
          .x(function(d) { return x(d.date); })
          .y(function(d) { return y(d.data); })
      ;
      graph.append('g').append('path')
        .datum(data.data)
        .attr('class', 'price-line')
        .attr('d', line)
      ;
      add_hover_segments(data.data, x, y, fx, fy, plotdots, tool_tip, px, fy, d3.rgb(86, 180, 233));
      axes.append('g').selectAll('.grid-axis')
        .data(y.ticks())
        .enter()
        .append('line')
        .attr('class', 'grid-axis')
        .attr('y1', function(d) {return y(d); })
        .attr('y2', function(d) {return y(d); })
        .attr('x1', x.range()[0])
        .attr('x2', x.range()[1])
      ;
      axes.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate('+ x.range()[1]+',0)')
        .call(y_axis);
      axes.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,'+padding.top+')')
        .call(x_axis);
    });
  }

  function add_hover_segments(data, x, y, fx, fy, g, tool_tip, px, py, color) {
    g.selectAll('.time-period')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'time-period')
      .attr('transform', function(d, i) {
        return 'translate('+(x.range()[1] / (data.length - 1)) * i +',0)';
      })
      .each(function(d, i) {
        d3.select(this).append('rect')
          .attr('height', y.range()[0])
          .attr('width', x.range()[1] / (data.length))
          .attr('transform', function(d, i) {
            return 'translate('+(x.range()[1] / (data.length - 1)) * i +',0)';
          })
          .attr('data-year', function() {
             return i + 2000;
          })
          .style('fill', 'transparent')
          .on('mouseover', function(d) {
            //TODO: There's gotta be a better way to do this (and below)
            var _xo = d3.select(this).attr('data-year');
            d3.select(this.parentNode.getElementsByClassName('data-point')[0])
              .classed('active', true);
            tool_tip
//              .html((i + 2000)+': '+(Math.round(d*100))+'%')
              .html(function() {
                if (d.date) {
                  return px(d)+': '+(Math.round(py(d)))+'%';
                } else {
                  return px(i)+': '+(Math.round(py(d)))+'%'
                }
              })
              .style('position', 'absolute')
              .style('top', (y(d * 100) - margin - 10)+'px')
              .style('left', (x(new Date(_xo, 0, 1)) + 10) + 'px')
              .classed('active', true)
            ;
          })
          .on('mouseout', function() {
            d3.select(this.parentNode.getElementsByClassName('data-point')[0])
              .classed('active', false);
            tool_tip.classed('active', false);
          })
        ;
        d3.select(this).append('circle')
          .classed('data-point', true)
          .attr('cx', function(d) { return 0;})//return x(fx(d)); })
          .attr('cy', function(d) {return y(fy(d));})
          .attr('r', 6)
        ;
      });
  }

  function trajectory(_s, data) {
    var
      px = function(d) { return d3.time.format('%Y')(d.date); },
      fx = function(d) { return d.date; },
      fy = function(d) { return d.data * 100;},
      padding = {top:20, right:20, bottom:10, left:10},
      x = d3.time.scale()
        .domain([new Date(2000, 0, 1), new Date(2030, 0, 1)])
        .range([0,width]),
      y = d3.scale.linear()
        .domain([0, 50])
        .range([height-2, 0]),
      tool_tip = d3.select('#state-trajectory').append('div').classed('tooltip', true),
      plot_path = d3.svg.line()
        .x(function(d,i) { return x(fx(d)); })
        .y(function(d,i) { return y(fy(d)); }),
      svg = d3.select('#state-trajectory')
        .append('svg')
        .attr('width', width+padding.right+padding.left)
        .attr('height', height+padding.top+padding.bottom),
      axes = svg.append('g')
        .attr('transform', 'translate('+padding.left+','+padding.top+')'),
      plots = svg.append('g')
        .attr('class', 'plot')
        .attr('transform', 'translate('+padding.left+','+padding.top+')'),
      plotdots = svg.append('g')
        .attr('class', 'plotdots')
        .attr('transform', 'translate('+padding.left+','+padding.top+')'),
      x_axis = d3.svg.axis()
          .scale(x)
          .orient('top'),
      y_axis = d3.svg.axis()
        .scale(y)
        .orient('right');
    plots.selectAll('.trajectory')
      .data(data.features)
      .enter()
      .append('path')
      .attr('d', function(d,i) {
        return (d.properties.trajectory) ? plot_path(d.properties.trajectory) : null;
      })
      .attr('data-state', function(d) { return d.properties.abbr; })
      .attr('id', function(d,i) {
        return 'plot_'+ d.properties.abbr;
      })
      .attr('class', 'trajectory rps-object')
      .classed('active', function(d) {
        return d == _s;
      })
      .each(function(d) {
        if (d == _s) {
          this.parentNode.appendChild(this);
        }
      });
    add_hover_segments(_s.properties.trajectory, x, y, fx, fy, plotdots, tool_tip, px, fy, d3.rgb(213, 94, 0));
    axes.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,0)')
      .call(x_axis);
    axes.append('g')
      .attr('class', 'y axis')
      .call(y_axis)
      .attr('transform', 'translate('+ x.range()[1]+',0)');
  }

  function draw_map(_s, data) {
    function zoom_f() {
      projection.translate(d3.event.translate).scale(d3.event.scale);
      state_map.selectAll('path').attr('d', state_path);
    }
    var
      projection = d3.geo.conicEqualArea()
        .scale(width*5)
        .translate([0, 0])
        .rotate([96, 0])
        .center([-.6, 38.7])
        .parallels([29.5, 45.5])
        .translate([width / 2, height / 2])
        .precision(.1),
      svg_map = d3.select('#state-map')
        .append('svg')
        .attr('width', width)
        .attr('height', height+20),
      state_path = d3.geo.path()
        .projection(projection),
      _c = projection.invert(state_path.centroid(_s));
    projection.center([_c[0] + 96, _c[1]]);
    var
      zoom = d3.behavior.zoom()
        .translate(projection.translate())
        .scale(projection.scale())
        .scaleExtent([500, 8000])
        .on('zoom', zoom_f),
      state_map = svg_map.append('g')
        .append('g')
        .attr('id', 'states_all')
        .style('fill', '#eeeeee')
        .call(zoom),
      state_links = state_map.selectAll('a')
        .data(data.features)
        .enter().append('a')
        .attr('xlink:href', function(d) {
          return d.properties.trajectory ? '/state/' + d.properties.machine_name : null;
      }),
      states = state_links
        .append('path')
        .attr('d', state_path)
        .attr('id', function(d) { return 'state_'+ d.properties.abbr; })
        .attr('data-state', function(d) { return d.properties.abbr; })
        .attr('class', 'map-state rps-object')
        .classed('rps-state', function(d) {
          return (d.properties.trajectory) ? true : false;
        })
        .classed('active', function(d) {
          return d == _s;
        })
        .attr('data-center', function(d) {return state_path.centroid(d);})
        .on('mouseover', hover_in)
        .on('mouseout', hover_out)
    ;
  }

  d3.json('/static/js/state_data.json', function(data) {
    /*
     Load state_data JSON object and draw page
     */
    var _date_data;
    var parse_date = d3.time.format('%Y').parse;
    data.features.forEach(function(d, i) {
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
    var _s = data.features.filter(function(d) {
      return (d.properties.machine_name == Options.state) ? d : null;
    })[0];

    d3.select('h1').text(_s.properties.name);

    var statute = d3.select('#statute'),
      tools = d3.select('#tools'),
      references = d3.select('#references'),
      tech_req = d3.select('#tech_req'),
      seal = d3.select('#state-wrap img')
    ;
    seal.attr('src', '/static/images/state_seals/'+_s.properties.abbr+'.png');
    d3.select('#summary')
      .append('p')
      .html(_s.properties.snapshot.summary);
    d3.select('#overview').selectAll('li')
      .data(_s.properties.snapshot.overview)
      .enter()
      .append('li')
      .html(function(d, i) {return d});

    statute.append('p')
      .html(_s.properties.legislation.statute);

    var tbl = tech_req.append('table');
    tbl.append('tr')
      .selectAll('th')
      .data(['Policy', 'Description'])
      .enter()
      .append('th')
      .text(function(d) { return d; });
    tbl.selectAll('.row')
      .data(_s.properties.legislation.rps_tech_details)
      .enter()
      .append('tr')
      .attr('class', 'row')
      .html(function(d) {
        return '<td>'+ d.name+'</td><td>'+ d.description+'</td>';
      });
    tech_req.selectAll('tr')
      .data(_s.properties.legislation.rps_tech_details)
      .enter()
    d3.select('#cost_cap_details')
      .append('p')
      .html(_s.properties.legislation.cost_cap_details);
    d3.select('#carveouts')
      .append('p')
      .html(_s.properties.legislation.carveouts);
    d3.select('#grid_mix')
      .append('p')
      .html(_s.properties.resources.grid_mix.text);
    tools.insert('p', 'ul')
      .html(_s.properties.resources.tools.text);
    tools.select('ul').selectAll('li')
      .data(_s.properties.resources.tools.links)
      .enter()
      .append('li')
      .html(function(d) {
        return '<a href="'+ d.href+'">'+d.name+'</a>&nbsp;&mdash;&nbsp;'+ d.description;
      });
    references.insert('p', 'ul')
      .html(_s.properties.resources.references.text);
    references.select('ul').selectAll('li')
      .data(_s.properties.resources.references.links)
      .enter()
      .append('li')
      .html(function(d) {
        return '<a href="'+ d.href+'">'+d.name+'</a>&nbsp;&mdash;&nbsp;'+ d.description;
      });

    draw_map(_s, data);

    // Trajectory chart (axis() called from within).
    trajectory(_s, data);

    // RPS progress chart
    rps_progress(_s.properties);

    // Carveout chart
    if (_s.properties.carveouts.length > 0) { carveout_graph(_s.properties); }

    //Grid mix chart
    grid_mix_bars(_s.properties);

    retail_price_history(_s.properties);

  });

  // Left menu navigation
  d3.selectAll('#left-nav a')
    .on('click', function() {
      d3.event.preventDefault();
      window.location.hash = this.getAttribute('data-name');
      d3.select('#main-nav').style('display', 'none').style('display', 'block');
      var _oy = (window.pageYOffset || document.body.scrollTop) - document.getElementById('left-nav').getBoundingClientRect().top + 1;
      window.scroll(0, _oy);
    });
};
var facts_page = FactsPage();