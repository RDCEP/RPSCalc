(function() {
  Options.data.trajectory.data.forEach(function(d) { d.x = new Date(d.x); });
  Options.data.wind.data.forEach(function(d) { d.x = new Date(d.x); });
  Options.data.solar.data.forEach(function(d) { d.x = new Date(d.x); });
  var width = 760,
    height = 400,
    padding = 30,
    empty = true,
    container = '#cost_chart',
    input_types = ['rps', 'wind', 'solar'],
    parse_date = d3.time.format('%Y').parse,
    graph_data = {data: [
      Options.data.trajectory,
      Options.data.wind,
      Options.data.solar
    ]},
    _x = d3.time.scale().domain([new Date(2013, 0, 1), new Date(2030, 0, 1)]).range([0, (width - 2 * padding)]),
    segment_width = _x(graph_data.data[0].data[1].x) - _x(graph_data.data[0].data[0].x),
    chart_inputs = d3.select('#chart_wrap')
      .append('form')
      .attr({ 'class': 'clearfix',
        'id': 'chart_inputs' })
      .style('padding-left', padding + 'px')
      .classed('hidden', false),
    input_rows = chart_inputs.selectAll('div')
      .data(graph_data.data.reverse())
      .enter()
      .append('div')
      .attr({ 'class': 'clearfix chart-input-row',
        'data-type': function(d) { return d.type; } }),
    pp = Options.data.price_and_policy,
    wind_cost = function() {
      var ptc = pp.policy_ptc ? 0.7 : 1.0,
        decrease = 1;
      return (((pp.wind_installation * 1000000) * ptc * (pp.wind_amortization / 100)) / (8765 * pp.wind_capacity) + pp.wind_om + pp.wind_integration) * decrease - pp.policy_wholesale;
    },
    solar_cost = function() {
      var ptc = pp.ptc === 'on' ? 0.7 : 1.0,
        decrease = 1;
      return (((pp.solar_installation * 1000000) * (pp.solar_amortization / 100) + pp.solar_om)) * ptc / (8765 * pp.solar_capacity) * decrease - pp.policy_wholesale;
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

  input_rows.append('h6').text(function(d) { return d.type; });
  graph_data.data.reverse();
  graph_data.inputs = input_rows.selectAll('input')
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
      //TODO: Clean all this up
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
