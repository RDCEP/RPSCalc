(function() {

  Options.data.trajectory.data.forEach(function(d) { d.x = new Date(d.x); });
  Options.data.wind.data.forEach(function(d) { d.x = new Date(d.x); });
  Options.data.solar.data.forEach(function(d) { d.x = new Date(d.x); });

  var width = 760,
    height = 400,
    padding = 30,
    container = '#cost_chart',
    graph_data = {data: [
      Options.data.trajectory,
      Options.data.wind,
      Options.data.solar
    ]},
    pp = Options.data.price_and_policy,
    _x = d3.time.scale()
      .domain([new Date(2013, 0, 1), new Date(2030, 0, 1)])
      .range([0, (width - 2 * padding)]),
    segment_width = _x(graph_data.data[0].data[1].x) - _x(graph_data.data[0].data[0].x),
    _max_y = 0,

    chart_inputs = d3.select('#chart_wrap form')
      .attr({ 'class': 'clearfix',
        'id': 'chart_inputs' })
      .style('padding-left', padding + 'px')
      .classed('hidden', false)
      .select('#time_series_wrap'),

    input_series = chart_inputs.selectAll('.chart-input-series')
      .data(graph_data.data)
      .enter()
      .append('div')
      .attr({ 'class': 'clearfix chart-input-row chart-input-series',
        'data-type': function(d) { return d.type; } }),

    amortization = function(t, r) {
      return (r / 100 * Math.pow((1 + r / 100), t)) / (Math.pow((1 + r / 100), t) - 1);
    },

    wind_cost = function() {
      var ptc = pp.policy_ptc ? 0.7 : 1.0,
        decrease = 1;
      return (
        (
          pp.wind_installation * 1000000 * (
            amortization(pp.finance_contractterm, pp.finance_interestrate)
          ) * ptc
        ) / (8765 * pp.wind_capacity) + pp.wind_om + pp.wind_integration
      ) * decrease - pp.pricing_wholesale;
    },

    solar_cost = function() {
      var ptc = pp.policy_ptc ? 0.7 : 1.0,
        decrease = 1;
      return (
        (
          pp.solar_installation * 1000000 * (
            amortization(pp.finance_contractterm, pp.finance_interestrate)
          ) + pp.solar_om
        ) * ptc
      ) / (8765 * pp.solar_capacity) * decrease - pp.pricing_wholesale;
    },

    get_cap = function(captype, year, i) {
      if (captype == 'retail') {
        return (pp.policy_costcap / 100 * Options.data.retail_price) /
          (Math.pow((100 + +pp.pricing_annualgrowth) / 100, year - 2013) * Options.data.trajectory.data[i].y / 100);
      } else if (captype == 'single-acp') {
        return Options.data.state == 'connecticut'
          ? pp.policy_acp
          : Options.data.state == 'maine'
          ? pp.policy_acp
          : Options.data.state == 'texas'
          ? pp.policy_acp * Math.pow((100 + +pp.pricing_annualgrowth) / 100, year - 2013)
          : Options.data.state == 'rhode_island'
          ? pp.policy_acp * Math.pow((100 + +pp.pricing_annualgrowth) / 100, year - 2013)
          : pp.policy_acp;
      } else if (captype == 'retail-dollar') {
        var volume;
        if (Options.data.state == 'north_carolina') {
          volume = 1.077 * 12;
        } else if (Options.data.state == 'michigan') {
          volume = .676;
        }
        return (pp.policy_costcap / volume * Math.pow(
          (100 + +pp.pricing_annualgrowth) / 100, year - 2013)
          ) / (Options.data.trajectory.data[i].y / 100);
      } else if (captype == 'retail-solar-acp-wind') {
        var c = (pp.policy_costcap / 100 * Options.data.retail_price) /
          (Math.pow((100 + +pp.pricing_annualgrowth) / 100, year - 2013));
        var s = c * Options.data.solar.data[i].y / 100;
        var w = (pp.policy_acp * (1 - Options.data.solar.data[i].y / 100));
        return c * s + w;
      }
      return false;
    },

    get_cap_and_rec = function() {
      var _rec = {type: 'REC', data: [], line: true},
        _cap = {type: 'Cost Cap', data: [], invert: true},
        wind = wind_cost(),
        solar = solar_cost();
      _max_y = 0;
      Options.data.trajectory.data.forEach(function(d, i) {
        d.x = new Date(d.x);
        var wind_rec = Options.data.wind.data[i].y / 100 * wind,
          solar_rec = Options.data.solar.data[i].y / 100 * solar,
          other_rec = (100 - Options.data.solar.data[i].y - Options.data.wind.data[i].y) / 100 * wind * .65,
          year = d.x.getFullYear(),
          total_rec = wind_rec + solar_rec + other_rec,
          cost_cap = get_cap(pp.policy_captype, year, i);

        _max_y = year >= 2013 ? Math.max(_max_y, total_rec, cost_cap) : _max_y;

        if (cost_cap) {
          _cap.data[i] = {
            x: new Date(d.x),
            y0: 0,
            y: year >= 2013 ? cost_cap : 0};
        }
        _rec.data[i] = {
          x: new Date(d.x),
          y0: 0,
          y: total_rec };
      });
      return _cap.data.length > 0 ? [_rec, _cap] : [_rec];
    };

  var cost_graph = new RPSGraph(),
    cap_rec = get_cap_and_rec();

  input_series.each(function(d) {
    var t = d3.select(this);
    if (d.type != 'solar') {
      t.append('h5').text(function() {
        return (d.type == 'rps') ? 'RPS' : 'Carveouts (as a % of the RPS)';
      });
    }
    t.append('h6').text(function(d) { return (d.type == 'rps') ? null : d.type; });
  });

  d3.selectAll('.chart-input-pp-wrap')
    .style({
      width: (segment_width * 4 + 2) + 'px',
      float: 'left'
    });

  d3.selectAll('.chart-input-pp .chart-input').each(function() {
    var t = d3.select(this);
    t.style({ 'width': (segment_width - 14) + 'px' })
      .property('value', function(d) {
        return (typeof(pp[t.attr('name')]) == 'boolean')
          ? null : d3.format('.1f')(pp[t.attr('name')]); })
      .property('checked', function(d) {
        return (typeof(pp[t.attr('name')]) == 'boolean') ? pp[t.attr('name')] : null;
      })
      .on('change', function(d) {
        var t = d3.select(this),
          _v = (typeof(pp[t.attr('name')]) == 'boolean') ? t.property('checked') : +t.property('value');
        pp[t.attr('name')] = _v;
        t.property('value', function() { return (typeof(_v) == 'boolean') ? null : +_v; });
        t.property('checked', function() { return (typeof(_v) == 'boolean') ? _v : null; });
        cap_rec = get_cap_and_rec();
        cost_graph.data(cap_rec)
          .domain([new Date(2013, 0, 1), new Date(2030, 0, 1)], [0, Math.ceil(_max_y * 1.25)])
          .manual_update_intersection(cap_rec[0], cap_rec[1])
          .manual_update_handles()
          .redraw();
      });
  });



  graph_data.inputs = input_series.selectAll('input')
    .data(function(d) { return d.data; })
    .enter()
    .append('input')
    .attr({'type': 'text', 'class': 'chart-input',
      'data-x': function(d) { return d.x; },
      'data-type': function(d) {  return d.type; }})
    .property('value', function(d) { return d3.format('.1f')(d.y); })
    .style({ 'width': (segment_width - 14) + 'px',
      'display': function(d) {
        return ((_x(d.x) > _x.range()[0]) && (_x(d.x) <= _x.range()[1])) ? 'block' : 'none';
      }
    })
    .on('change', function(d) {
      var _v = (d3.select(this).property('value')),
        other_type = (d.type == 'solar') ? 'wind' : (d.type == 'wind') ? 'solar': false,
        max_val = 100;
      if (other_type) {
        var other_val = graph_data.data
          .filter(function(_d) {
            return _d.type === other_type;
          })[0].data
          .filter(function(_d) {
            return _d.x.getFullYear() === d.x.getFullYear();
          })[0].y;
        max_val = 100 - other_val;
      }
      _v = (_v > max_val) ? max_val : _v;
      graph_data.data
        .filter(function(_d) { return _d.type === d.type; })[0].data
        .filter(function(_d) { return _d.x === d.x; })[0].y = +_v;
      d3.select(this).property('value', +_v);
      cap_rec = get_cap_and_rec();
      cost_graph.data(cap_rec)
        .domain([new Date(2013, 0, 1), new Date(2030, 0, 1)], [0, Math.ceil(_max_y * 1.25)]);
      if (cap_rec.length > 1) {
        cost_graph.manual_update_intersection(cap_rec[0], cap_rec[1]);
      }
      cost_graph.manual_update_handles()
        .redraw();
    });

  cost_graph.padding(30)
    .width(width).height(height)
    .select(container)
    .x(d3.time.scale())
    .y(d3.scale.linear())
    .domain([new Date(2013, 0, 1), new Date(2030, 0, 1)], [0, Math.ceil(_max_y * 1.25)])
    .format_x(function(x) { return x.getFullYear(); })
    .format_y(function(y) { return '$'+d3.format('.2f')(y); });

  if (cap_rec.length > 1) {
    cost_graph.data(cap_rec)
      .title('Will we break the cap?')
      .colors([d3.rgb(86,180,233), d3.rgb(213,94,0)])
      .intersect(cap_rec[0], cap_rec[1], d3.rgb(213,94,0));
  } else {
    cost_graph.data(cap_rec)
      .title('The cost of renewable energy')
      .colors([d3.rgb(86,180,233)]);
  }
  cost_graph.stacked(false)
    .hoverable(true)
    .h_grid(true)
    .legend(true)
    .outlines(false)
    .lines(true)
    .draw();

  if (cap_rec.length > 1) {
    var break_legend = d3.select('.chart-legend').append('span').attr('class', 'legend-row');
    break_legend.append('span').attr('class', 'legend-swatch').style({
      'background-color': d3.rgb(213,94,0),
      'background-image': 'url(/static/images/svg/stripes_sky-blue.png)'
    });
    break_legend.append('span').attr('class', 'legend-text').text('REC price exceeds cost cap')
  }

})();
