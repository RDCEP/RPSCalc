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
    pp_data = [
      {name: 'Policy', inputs: [
        {name: 'Cost cap', 'data-type': 'policy_costcap', unit: '%'},
        {name: 'PTC', 'data-type': 'policy_ptc'}
      ]},
      {name: 'Financing', inputs: [
        {name: 'Contract term', 'data-type': 'finance_contractterm', unit: 'yr'},
        {name: 'Interest rate', 'data-type': 'finance_interestrate', unit: '%'}
      ]},
      {name: 'Price', inputs: [
        {name: 'Wholesale price', 'data-type': 'pricing_wholesale', unit: '$'},
        {name: 'Annual growth', 'data-type': 'pricing_annualgrowth', unit: '%'}
      ]}
    ],
//    pp_data = [
//        {name: 'Cost cap', data: pp['policy_costcap'], 'type': 'text', 'unit': '%'},
//        {name: 'PTC', data: pp['policy_ptc'], 'type': 'checkbox'},
//        {name: 'Contract term', data: pp['finance_contractterm']},
//        {name: 'Interest rate', data: pp['finance_interestrate']},
//        {name: 'Annual growth', data: pp['pricing_annualgrowth'], 'type': 'text', 'unit': '%'},
//        {name: 'Wholesale price', data: pp['pricing_wholesale'], 'type': 'text', 'unit': '$'}
//    ],
    _x = d3.time.scale().domain([new Date(2013, 0, 1), new Date(2030, 0, 1)]).range([0, (width - 2 * padding)]),
    segment_width = _x(graph_data.data[0].data[1].x) - _x(graph_data.data[0].data[0].x),
    chart_inputs = d3.select('#chart_wrap')
      .append('form')
      .attr({ 'class': 'clearfix',
        'id': 'chart_inputs' })
      .style('padding-left', padding + 'px')
      .classed('hidden', false),
    input_series = chart_inputs.selectAll('.chart-input-series')
      .data(graph_data.data)
      .enter()
      .append('div')
      .attr({ 'class': 'clearfix chart-input-row chart-input-series',
        'data-type': function(d) { return d.type; } }),
    input_pp = chart_inputs.append('div').attr('class', 'chart-input-row')
      .selectAll('.chart-input-pp-wrap')
      .data(pp_data)
      .enter()
      .append('div')
      .attr('class', 'chart-input-pp-wrap')
      .style({
        width: (segment_width * 4 + 2) + 'px',
        float: 'left'
      }),
    amortization = function(t, r) {
      return (r / 100 * Math.pow((1 + r / 100), t)) / (Math.pow((1 + r / 100), t) - 1);
    },
    wind_cost = function() {
      console.log(pp.policy_ptc);
      var ptc = pp.policy_ptc ? 0.7 : 1.0,
        decrease = 1;
      return (
        (
          (pp.wind_installation * 1000000) * ptc * amortization(pp.finance_contractterm, pp.finance_interestrate)
        ) / (8765 * pp.wind_capacity) + pp.wind_om + pp.wind_integration
      ) * decrease - pp.pricing_wholesale;
    },
    solar_cost = function() {
      var ptc = pp.ptc === 'on' ? 0.7 : 1.0,
        decrease = 1;
      return (
        (
          (pp.solar_installation * 1000000) * (
            amortization(pp.finance_contractterm, pp.finance_interestrate)) + pp.solar_om
        )
      ) * ptc / (8765 * pp.solar_capacity) * decrease - pp.pricing_wholesale;
    },
    get_cap_and_rec = function() {
      var _rec = {type: 'REC', data: []},
        _cap = {type: 'Cost Cap', data: [], invert: true},
        wind = wind_cost(),
        solar = solar_cost();
      Options.data.wind.data.forEach(function(d, i) {
        d.x = new Date(d.x);
        var wind_rec = d.y / 100 * wind,
          solar_rec = Options.data.solar.data[i].y / 100 * solar,
          //TODO: This .65 is crap now. It comes from the IL/IA code from the original paper
          //TODO: Get current year dynamically
          other_rec = (100 - Options.data.solar.data[i].y - d.y) / 100 * wind * .65,
          year = d.x.getFullYear();
        _cap.data[i] = {x: new Date(d.x), y0: 0, y: year >= 2013 ? (pp.policy_costcap * Math.pow(1.01, year - 2013)) / Options.data.trajectory.data[i].y * 100 : 0};
        _rec.data[i] = {x: new Date(d.x), y0: 0, y: (wind_rec + solar_rec + other_rec)};
      });
      return [_cap, _rec];
    };

  var foo = new RPSGraph(),
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

  input_pp.each(function(d) {
    var t = d3.select(this);
    t.append('h5')
      .text(function(d) { return d.name; });
    var divs = t.selectAll('.chart-input-pp')
      .data(d.inputs)
      .enter()
      .append('div')
      .attr({ 'class': 'clearfix chart-input-row chart-input-pp'});
    divs.each(function() {
      var t = d3.select(this);
      var l = t.append('label');
      l.append('input')
        .attr({
          'class': 'chart-input',
          'type': function(d) { return (typeof(pp[d['data-type']]) == 'boolean') ? 'checkbox' : 'text'; },
          'data-type': function(d) { return d.name; }
        })
        .style({ 'width': (segment_width - 14) + 'px' })
        .property('value', function(d) { return (typeof(pp[d['data-type']]) == 'boolean') ? null : d3.format('.1f')(pp[d['data-type']]); })
        .property('checked', function(d) {
          return (typeof(pp[d['data-type']]) == 'boolean') ? pp[d['data-type']] : null;
        })
      .on('change', function(d) {
        var t = d3.select(this),
          _v = (typeof(pp[d['data-type']]) == 'boolean') ? t.property('checked') : t.property('value');
        pp[d['data-type']] = _v;
        t.property('value', function() { return (typeof(_v) == 'boolean') ? null : +_v; });
        t.property('checked', function() { return (typeof(_v) == 'boolean') ? _v : null; });
        cap_rec = get_cap_and_rec();
        foo.data(cap_rec)
          .manual_update_intersection(cap_rec[0], cap_rec[1])
          .manual_update_handles()
          .redraw();
        });
        l.append('div')
          .style({
            'width': (segment_width * 3 - 10) + 'px',
            'float': 'left'
          })
          .text(function(d) { return d.name; });
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
        var other_val = graph_data
          .data.filter(function(_d) {
            return _d.type === other_type;
          })[0]
          .data.filter(function(_d) {
            return _d.x.getFullYear() === d.x.getFullYear();
          })[0].y;
        max_val = 100 - other_val;
      }
      _v = (_v > max_val) ? max_val : _v;
      graph_data.data.filter(function(_d) { return _d.type === d.type; })[0].data.filter(function(_d) { return _d.x === d.x; })[0].y = +_v;
      d3.select(this).property('value', +_v);
      cap_rec = get_cap_and_rec();
      foo.data(cap_rec)
        .manual_update_intersection(cap_rec[0], cap_rec[1])
        .manual_update_handles()
        .redraw();
    });

  foo.padding(30)
    .width(width).height(height)
    .select(container)
    .title('Will we break the cap?')
    .x(d3.time.scale())
    .y(d3.scale.linear())
    .domain([new Date(2013, 0, 1), new Date(2030, 0, 1)], [0, 50])
    .max_domains([50,100])
    .format_x(function(x) { return x.getFullYear(); })
    .format_y(function(y) { return d3.format('.1f')(y); })
    .data(cap_rec)
    .stacked(false)
    .hoverable(true)
    .colors([d3.rgb(213,94,0), d3.rgb(86,180,233)])
    .h_grid(true)
    .legend(true)
    .outlines(false)
    .intersect(cap_rec[0], cap_rec[1], d3.rgb(213,94,0))
    .draw();
})();
