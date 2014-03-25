var FactsPage = function() {
  'use strict';
  var width = 345,
    height = 400,
    margin = 20,
    projection,
    handles;

  function rps_progress(trajectory, rps_progress, state, unit) {
    /*
     Draw bar chart for current RPS progress.
     ...
     Args
     ----
     _s: Object representing active state
     ...
     */
    unit = typeof(unit) != 'string' ? '%' : unit;
    var _wd = width * 2 + 10,
      domain_x = [2000, 2030],
      domain_y = [0, 50],
      rpsp_height = 40,
      rpsp_margin = 15,
      rpsp_legend = d3.select('#rps_progress')
        .append('div')
        .attr('class', 'chart-legend')
        .style('margin-bottom', '10px'),
      legend_row, legend_swatch, legend_text,
      rpsp = d3.select('#rps_progress')
        .append('svg')
        .attr('height', rpsp_height + 50)
        .attr('width', _wd),
      final = trajectory[trajectory.length - 6].y,
//      current = trajectory.filter(function(d) { return d.x.getFullYear() === 2011; })[0].y,
      current = trajectory.filter(function(d) { return d.x.getFullYear() === +rps_progress.year; })[0].y,
      actual = current * +rps_progress.progress,
      diff = Math.abs(actual - current);
    if (current > 0) {
      legend_row = rpsp_legend.append('span')
        .attr('class', 'legend-row');
      legend_row.append('span')
        .attr('class', 'legend-swatch')
        .style('background-color', d3.rgb(86, 180, 233));
      legend_row.append('span')
        .attr('class', 'legend-text')
        .html('Current progress');
    }
    if (diff > 0) {
      legend_row = rpsp_legend.append('span')
        .attr('class', 'legend-row');
      legend_row.append('span')
        .attr('class', 'legend-swatch')
        .style('background-color', d3.rgb(213, 94, 0));
      legend_row.append('span')
        .attr('class', 'legend-text')
        .html('Behind current goal');
    }
    rpsp.append('rect')
      .attr('height', rpsp_height)
      .attr('width', _wd)
      .attr('transform', 'translate(0,' + rpsp_margin + ')')
      .style('fill', '#ddd');
    rpsp.append('rect')
      .attr('height', rpsp_height)
      .attr('width', actual / final * _wd)
      .style('fill', '#56b4e9')
      .attr('transform', 'translate(0,' + rpsp_margin + ')')
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
        return 'translate(' + offset + ',' + rpsp_margin + ')';
      });
    var rps_hashes = rpsp.selectAll('.rps-hash')
      .data([actual, current, final])
      .enter()
      .append('line')
      .attr('x1', function(d, i) {
        if (i === 0) {
          return (actual !== current) ? actual / final * _wd : null;
        }
        return d / final * _wd - i;
      })
      .attr('x2', function(d, i) {
        if (i === 0) {
          return (actual !== current) ? actual / final * _wd : null;
        }
        return d / final * _wd - i; })
      .attr('y1', function(d, i) { return (i === 0) ? rpsp_margin : 0; })
      .attr('y2', function(d, i) { return (i === 0) ? rpsp_height + rpsp_margin : rpsp_height + 2 * rpsp_margin; })
      .attr('class', function(d, i) { return (i === 0) ? 'rps-hash-actual' : 'rps-hash'; });

    rps_hashes.each(function(d, i) {
      if (i > 0) {
        rpsp.append('text')
          .text(function() {
            return (i === 1) ? Math.round(current) + unit + ' by ' + rps_progress.year
              : Math.round(final) + unit + ' by 2030';
          })
          .attr('class', 'rps-text')
          .attr('text-anchor', 'end')
          .attr('transform', function() {
            var v_offset = (rpsp_height + 2 * (rpsp_margin - 2));
            var h_offset = d / final * _wd - i - 5;
            return 'translate(' + h_offset + ',' + v_offset + ')';
          });
      } else {
        rpsp.append('text')
          .text(function() {
            return ''
          })
          .attr('class', 'rps-text')
          .attr('text-anchor', function() {return (i === 0) ? 'start' : 'end'; })
          .attr('transform', function() {
            var v_offset = (i === 0) ? (rpsp_margin - 2) : (rpsp_margin - 4);
            var h_offset = (i === 0) ? 0 : d / final * _wd - i - 5;
            return 'translate(' + h_offset + ',' + v_offset + ')';
          });
      }

    });

    var p = d3.select('#rps_progress_wrap').select('p');
    p.text(p.text() + ' As of ' + rps_progress.year + ', ' + state +
      ' was ' + (rps_progress.progress * 100) + '% compliant with its goal of ' +
      current + '% capacity in that year. The most current information available is from ' +
      rps_progress.year + '.');
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
    d3.json('/eia_api/static/json/gridmix/' + Options.state + '.json?1', function(data) {
      var _max = data.maximum,
        _th = 0, // height of title
        _rh = 20, //row height
        _lh = 50, // legend height
        _mt = 5, //margin top
        _mb = 5, //margin bottom
        _h = _rh * data.data.length + _th,
        _wt = 140, // width of titles
        _wd = 440, // width of data
        color_co2 = d3.scale.linear()
          .domain([0, 1000])
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
          .attr('x1', function(d, i) { return (i === 0) ? d / _max * _wd + 1 : d / _max * _wd - 1;  })
          .attr('x2', function(d, i) {
            return (i === 0) ? d / _max * _wd + 1 : d / _max * _wd - 1;
          })
          .attr('transform', 'translate(' + _wt + ',0)');
      grid_mix.selectAll('.grid-axis-text')
        .data(data.divs)
        .enter()
        .append('text')
        .attr('class', 'grid-axis-text')
        .style('text-anchor', function(d, i) {return (i === 0) ? 'start' : 'end'; })
        .text(function(d, i) { return d; })
        .attr('transform', function(d) { return 'translate(' + (_wt + d / _max * _wd) + ',' + (_h + _mt + _mb) + ')'; });
      grid_mix.append('text')
        .text('trillions BTU')
        .attr('transform', 'translate(' + _wt + ',' + (_h + _mt + _mb + 15) + ')')
        .attr('class', 'grid-axis-text');
      var grid_bars = grid_mix.selectAll('.grid-data')
        .data(data.data)
        .enter()
        .append('g')
        .attr('class', 'grid-data')
        .attr('height', _rh)
        .attr('width', width * 2)
        .attr('transform', function(d, i) {
          return 'translate(0,' + ((i * _rh) + _th + _mt) + ')';
        })
        .attr('data-value', function(d) { return d.data; })
        .attr('data-name', function(d) { return d.sector; });
      grid_bars.append('text')
        .text(function(d) { return d.sector; })
        .attr('class', 'grid-data-text')
        .classed('green', function(d) { return d.green; })
        .attr('text-anchor', 'end')
        .attr('transform', function() {
          return 'translate(' + (_wt - 10) + ',10)';
        });
      grid_bars.append('rect')
        .attr('width', function(d) { return d.data / _max * _wd; })
        .attr('height', 10)
        .style('fill', function(d) { return color_co2(d.intensity); })
        .attr('class', 'grid-data-bar')
        .attr('transform', function() {
          return 'translate(' + _wt + ',0)';
        });
      var grad = svg.append('defs').append('linearGradient')
        .attr('id', 'grad_intensity')
        .attr('x1', '0%')
        .attr('x2', '0%')
        .attr('y1', '100%')
        .attr('y2', '0%');
      grad.append('stop')
        .attr('offset', '0%')
        .style('stop-color', '#dddddd')
        .style('stop-opacity', 1);
      grad.append('stop')
        .attr('offset', '100%')
        .style('stop-color', '#d55e00')
        .style('stop-opacity', 1);
      grid_mix.append('rect')
        .attr('width', 10)
        .attr('height', _h + 10)
        .attr('transform', 'translate(' + (_wt + _wd + 20) + ',' + 0 + ')')
        .style('fill', 'url(#grad_intensity)');
      var ci_min = grid_mix.append('text')
        .attr('transform', 'translate(' + (_wt + _wd + 40) + ',' + (_h) + ')')
        .attr('class', 'grid-axis-text')
        .style('text-anchor', 'start');
      ci_min.append('tspan').attr({x: 0, dy: 0})
        .text('0');
      ci_min.append('tspan').attr({x: 0, dy: '1em'})
        .text('gCO2/kWh');
      var ci_max = grid_mix.append('text')
        .attr('transform', 'translate(' + (_wt + _wd + 40) + ',' + (10) + ')')
        .attr('class', 'grid-axis-text')
        .style('text-anchor', 'start');
      ci_max.append('tspan').attr({x: 0, dy: 0})
        .text('1000');
      ci_max.append('tspan').attr({x: 0, dy: '1em'})
        .text('gCO2/kWh');
      grid_mix.append('text')
        .text('Carbon intensity')
        .attr('transform', 'translate(' + (_wt + _wd + 20) + ',' + (_h + _mt + _mb + 15) + ')')
        .attr('class', 'grid-axis-text')
        .style('text-anchor', 'start');
    });
  }

  d3.json('/state/static/json/' + Options.state + '.json', function(_data) {

    if (_data.abbr != 'IA') {

      var def_line = [{data: []}],
        data = [{type: 'RPS', data: []}],
        legend = d3.select('#carveout_graph_legend'),
        statute = d3.select('#statute'),
        tools = d3.select('#tools'),
        references = d3.select('#references'),
        tech_req = d3.select('#tech_req'),
        seal = d3.select('#main_content img'),
        parse_date = d3.time.format('%Y').parse;

      if (_data.trajectory.length > 0) {
        // Parse trajectory data
        _data.trajectory.forEach(function(d, i) {
          _data.abbr == 'TX'
            ? data[0].data[i] = {y: d, x: parse_date(String(i + _data.start_year)), y0: 0}
            : data[0].data[i] = {y: d * 100, x: parse_date(String(i + _data.start_year)), y0: 0};
        });
        // Parse default trajectory
        _data.trajectory.forEach(function(d, i) {
          _data.abbr == 'TX'
            ? def_line[0].data[i] = {y: d, x: parse_date(String(i + _data.start_year)), y0: 0}
            : def_line[0].data[i] = {y: d * 100, x: parse_date(String(i + _data.start_year)), y0: 0};
        });
      } else {
        for (var i = 0; i < 31; ++i) {
          data[0].data[i] = {y: 0, x: parse_date(String(i + _data.start_year)), y0: 0};
          def_line[0].data[i] = {y: 0, x: parse_date(String(i + _data.start_year)), y0: 0};
        }
      }

      console.log(data);

      if (_data.carveouts) {
        _data.carveouts.forEach(function(d) {
          var carveout = {type: d.type, data: []};
          d.data.forEach(function(_d, i) {
            carveout.data.push({'y': _d * data[0].data[i].y, 'y0': 0, 'x': parse_date(String(i + _data.start_year))});
          });
          data.push(carveout);
        });
      }

      var trajectory = new RPSGraph()
        .padding(30, 30, 30, 100)
        .width(760).height(height)
        .select('carveout_graph')
        .x(d3.time.scale())
        .y(d3.scale.linear())
        .domain([new Date(2013, 0, 1), new Date(2030, 0, 1)], [0, d3.extent(data[0].data, function(d) { return d.y; })[1]])
        .format_x(function(x) { return x.getFullYear(); })
        .format_y(function(y) { return d3.format('.1f')(y); })
        .data(data)
        .title('Policy Trajectory')
        .h_grid(true)
        .legend(true)
        .outlines(true)
        .draw();

      if (_data.abbr == 'TX') {
        rps_progress(data.filter(function(d) { return d.type.toUpperCase() === 'RPS' })[0].data, _data.rps_progress, _data.name, 'MW');
      } else {
        rps_progress(data.filter(function(d) { return d.type.toUpperCase() === 'RPS' })[0].data, _data.rps_progress, _data.name);
      }


    }

    grid_mix_bars(_data);

    d3.json('/eia_api/static/json/retail/' + _data.machine_name + '.json?1', function(_data) {
      data = [{type: 'retail', data: []}];
      parse_date = d3.time.format('%m-%Y').parse;

      _data.data.forEach(function(d, i) {
        data[0].data.push({y: +d.data, y0: 0, x: parse_date(d.date)})
      });

      var retail_chart = new RPSGraph()
        .padding(30, 10, 30, 50)
        .width(760).height(200)
        .select('#retail_price')
        .x(d3.time.scale())
        .y(d3.scale.linear())
        .domain(d3.extent(data[0].data, function(d) { return d.x; }),
          d3.extent(data[0].data, function(d, i) { return i === 0 ? Math.floor(d.y) - .1 : Math.ceil(d.y) + .1; }))
        .format_x(function(x) { return x.getFullYear(); })
        .format_y(function(y) { return d3.format('.1f')(y); })
        .data(data)
        .h_grid(true)
        .lines(true)
        .interpolate('monotone')
        .draw();
    });
  });

  // Left menu navigation
  d3.selectAll('#left_nav .onpage-link')
    .on('click', function() {
      d3.event.preventDefault();
      var start_y = window.pageYOffset
        , pane = this.getAttribute('data-name')
        , pane_y = document.getElementById(pane).getBoundingClientRect().top
        , pane_h = document.getElementById(pane).getBoundingClientRect().height
        , buffer_y = document.getElementById('left_nav').getBoundingClientRect().top
        , body = document.body
        , html = document.documentElement
        , height = Math.max( body.scrollHeight, body.offsetHeight,
            html.clientHeight, html.scrollHeight, html.offsetHeight );
      d3.select('body').style('padding-bottom', function() {
        return ((height - (start_y + pane_y)) < window.innerHeight) ? (window.innerHeight - pane_h - buffer_y)+'px' : 0;
      });
      window.location.hash = pane;
      d3.select('#main-nav').style('display', 'none').style('display', 'block');
      window.scroll(0, pane_y + start_y - buffer_y + 1);
    });
};
var facts_page = new FactsPage();