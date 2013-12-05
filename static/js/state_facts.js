var FactsPage = function() {
  'use strict';
  var width = 345,
    height = 345,
    margin = 20,
    projection,
    handles;

  function rps_progress(trajectory, progress) {
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
      final = trajectory[trajectory.length - 6].y,
      current = trajectory.filter(function(d) { return d.x.getFullYear() === 2013; })[0].y,
      actual = progress * 100,
      diff = Math.abs(actual - current);
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
      rpsp.append('text')
        .text(function() {
          return (i === 0) ? '' : (i === 1) ? '2013' : '2030';
        })
        .attr('class', 'rps-text')
        .attr('text-anchor', 'end')
        .attr('transform', function() {
          var v_offset = (rpsp_height + 2 * (rpsp_margin - 2));
          var h_offset = d / final * _wd - i - 5;
          return 'translate(' + h_offset + ',' + v_offset + ')';
        });
      rpsp.append('text')
        .text(function() {
//          return (i == 0) ? (actual == current) ? '' : Math.round(actual * 100) + '%' : (i == 1) ? Math.round(current * 100) + '%' : Math.round(final * 100) + '%';
          return (i === 0) ? '' : (i === 1) ? Math.round(current) + '%' : Math.round(final) + '%';
        })
        .attr('class', 'rps-text')
        .attr('text-anchor', function() {return (i === 0) ? 'start' : 'end'; })
        .attr('transform', function() {
          var v_offset = (i === 0) ? (rpsp_margin - 2) : (rpsp_margin - 4);
          var h_offset = (i === 0) ? 0 : d / final * _wd - i - 5;
          return 'translate(' + h_offset + ',' + v_offset + ')';
        });
    });
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
    d3.json('/static/js/gridmix/' + _s.abbr + '.json', function(data) {
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
          .domain([0, 500])
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
        .style('stop-opacity', 1);
      grid_mix.append('rect')
        .attr('width', 500)
        .attr('height', 10)
        .attr('transform', 'translate(' + _wt + ',' + (_h + _mt + _mb + 25) + ')')
        .style('fill', 'url(#grad_intensity)');
      grid_mix.append('text')
        .text('0 unit')
        .attr('transform', 'translate(' + _wt + ',' + (_h + _mt + _mb + _lh - 3) + ')')
        .attr('class', 'grid-axis-text')
        .style('text-anchor', 'start');
      grid_mix.append('text')
        .text('500 unit')
        .attr('transform', 'translate(' + (_wt + _wd) + ',' + (_h + _mt + _mb + _lh - 3) + ')')
        .attr('class', 'grid-axis-text')
        .style('text-anchor', 'end');
      grid_mix.append('text')
        .text('Carbon intensity')
        .attr('transform', 'translate(' + (_wt - 10) + ',' + (_h + _mt + _mb + 35) + ')')
        .attr('class', 'grid-axis-text')
        .style('text-anchor', 'end');
    });
  }

  function retail_price_history(_s) {
    var parseDate = d3.time.format('%m-%Y').parse,
      padding = {top: 30, right: 30, bottom: 30, left: 30},
      _h = height * 0.5, //y_max * 2 * height
      _w = width * 2,
      tool_tip = d3.select('#retail_price').append('div').classed('tooltip', true),
      svg = d3.select('#retail_price').insert('svg')
        .attr('height', _h + padding.top + padding.bottom)
        .attr('width', _w + padding.left + padding.right),
      grid_layer = svg.append('g')
        .attr('id', 'prices_grid_layer')
        .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')'),
      graph_layer = svg.append('g')
        .attr('id', 'prices_graph_layer')
        .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')'),
      mask_layer = svg.append('g')
        .attr('id', 'prices_mask_layer'),
      axes_layer = svg.append('g')
        .attr('id', 'prices_axes_layer')
        .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')'),
      handle_layer = svg.append('g')
        .attr('id', 'prices_handles_layer')
        .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')'),
      foo;
    d3.json('/static/js/prices/' + _s.abbr + '.json', function(data) {
      data.data.forEach(function(d) {
        d.date = parseDate(d.date);
        d.data = +d.data;
      });
      var print_date = d3.time.format('%Y'),
        domain_y = [
          Math.floor(d3.min(data.data, function(d) { return d.data; })),
          Math.ceil(d3.max(data.data, function(d) { return d.data; }))
        ],
        x = d3.time.scale()
          .domain(d3.extent(data.data, function(d) { return d.date; }))
          .range([0, _w]),
        y = d3.scale.linear().domain(domain_y).range([_h - 2, 0]),
        time_period_width = x(new Date(2013, 0, 1)) - x(new Date(2012, 0, 1)),
        x_axis = d3.svg.axis()
          .scale(x)
          .orient('bottom'),
        y_axis = d3.svg.axis()
          .scale(y)
          .orient('left'),
        line = d3.svg.line()
          .x(function(d) { return x(d.date); })
          .y(function(d) { return y(d.data); });
      graph_layer.append('g').append('path')
        .datum(data.data)
        .attr('class', 'price-line')
        .attr('d', line);
      mask_layer.append('rect').attr('class', 'mask')
        .attr('width', _w + padding.left + padding.right).attr('height', padding.top)
        .attr('transform', 'translate(0,0)');
      mask_layer.append('rect').attr('class', 'mask')
        .attr('width', _w + padding.left + padding.right).attr('height', padding.bottom)
        .attr('transform', 'translate(0,' + (_h + padding.top) + ')');
      mask_layer.append('rect').attr('class', 'mask')
        .attr('width', padding.left).attr('height', _h + padding.top + padding.bottom)
        .attr('transform', 'translate(0,0)');
      mask_layer.append('rect').attr('class', 'mask')
        .attr('width', padding.left).attr('height', _h + padding.top + padding.bottom)
        .attr('transform', 'translate(' + (_w + padding.left) + ',0)');
      grid_layer.append('g').selectAll('.grid-axis')
        .data(y.ticks())
        .enter()
        .append('line')
        .attr('class', 'grid-axis')
        .attr('y1', function(d) {return y(d); })
        .attr('y2', function(d) {return y(d); })
        .attr('x1', x.range()[0])
        .attr('x2', x.range()[1])
      ;
      axes_layer.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(0,0)')
        .call(y_axis);
      axes_layer.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + _h + ')')
        .call(x_axis);
    });
  }


  d3.json('/static/js/state_data.json', function(_data) {

    var def_line = [{data: []}],
      data = [{type: 'rps', data: []}],
      legend = d3.select('#carveout_graph_legend'),
      statute = d3.select('#statute'),
      tools = d3.select('#tools'),
      references = d3.select('#references'),
      tech_req = d3.select('#tech_req'),
      seal = d3.select('#main_content img'),
      _s = _data.features.filter(function(d) {
        return (d.properties.machine_name == Options.state) ? d : null;
      })[0],
      parse_date = d3.time.format('%Y').parse;

    if (_s.properties.carveouts) {
      _s.properties.carveouts.forEach(function(d) {
        var carveout = {type: d.type, data: []};
        d.data.forEach(function(_d, i) {
          carveout.data.push({'y': _d * 100, 'y0': 0, 'x': parse_date(String(i + 2000))});
        });
        data.push(carveout);
      });
    }

    if (_s.properties.trajectory.length > 0) {
      // Parse trajectory data
      _s.properties.trajectory.forEach(function(d, i) {
        data[0].data[i] = {y: d * 100, x: parse_date(String(i + 2000)), y0: 0};
      });
      // Parse default trajectory
      _s.properties.trajectory.forEach(function(d, i) {
        def_line[0].data[i] = {y: d * 100, x: parse_date(String(i + 2000)), y0: 0};
      });
    } else {
      for (var i = 0; i < 31; ++i) {
        data[0].data[i] = {y: 0, x: parse_date(String(i + 2000)), y0: 0};
        def_line[0].data[i] = {y: 0, x: parse_date(String(i + 2000)), y0: 0};
      }
    }
    // Set header info
    d3.select('h1').text(_s.properties.name);

    seal.attr('src', '/static/images/state_seals/' + _s.properties.abbr + '.png');
    d3.select('#summary')
      .append('p')
      .html(_s.properties.snapshot.summary);
    d3.select('#overview').selectAll('li')
      .data(_s.properties.snapshot.overview)
      .enter()
      .append('li')
      .html(function(d) { return d; });
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
        return '<td>' + d.name + '</td><td>' + d.description + '</td>';
      });
    tech_req.selectAll('tr')
      .data(_s.properties.legislation.rps_tech_details)
      .enter();
    d3.select('#cost_cap_details')
      .append('p')
      .html(_s.properties.legislation.cost_cap_details);
    d3.select('#carveouts')
      .append('p')
      .html(_s.properties.legislation.carveouts);
    tools.insert('p', 'ul')
      .html(_s.properties.resources.tools.text);
    tools.select('ul').selectAll('li')
      .data(_s.properties.resources.tools.links)
      .enter()
      .append('li')
      .html(function(d) {
        return '<a href="' + d.href + '">' + d.name + '</a>&nbsp;&mdash;&nbsp;' + d.description;
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
    var foo = new RPSGraph()
      .padding(30)
      .width(760).height(height)
      .select('#carveout_graph')
      .x(d3.time.scale())
      .y(d3.scale.linear())
      .domain([new Date(2013, 0, 1), new Date(2030, 0, 1)], [0, 50])
      .format_x(function(x) { return x.getFullYear(); })
      .format_y(function(y) { return d3.format('.1f')(y); })
      .data(data)
      .h_grid(true)
      .draw();

    rps_progress(data[0].data, _s.properties.snapshot.rps_progress);

    grid_mix_bars(_s.properties);

    d3.json('/static/js/prices/' + _s.properties.abbr + '.json', function(_data) {
      data = [{type: 'retail', data: []}];
      parse_date = d3.time.format('%m-%Y').parse;
      _data.data.forEach(function(d, i) {
        data[0].data.push({y: +d.data, y0: 0, x: parse_date(d.date)})
      });
      console.log(d3.extent(data[0].data, function(d) { return d.x; }));
      var retail_chart = new RPSGraph()
        .padding(30)
        .width(760).height(height)
        .select('#retail_price')
        .x(d3.time.scale())
        .y(d3.scale.linear())
        .domain(d3.extent(data[0].data, function(d) { return d.x; }), d3.extent(data[0].data, function(d) { return d.y; }))
        .format_x(function(x) { return x.getFullYear(); })
        .format_y(function(y) { return d3.format('.1f')(y); })
        .data(data)
        .h_grid(true)
        .lined(true)
        .draw();
    });

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
var facts_page = new FactsPage();