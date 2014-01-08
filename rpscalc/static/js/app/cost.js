(function() {
  var pp = Options.data.price_and_policy;
  var wind_cost = function() {
    var ptc = pp.policy_ptc ? 0.7 : 1.0,
      decrease = 1;
    return (((pp.wind_installation * 1000000) * ptc * (pp.wind_amortization / 100)) / (8765 * pp.wind_capacity) + pp.wind_om + pp.wind_integration) * decrease - pp.policy_wholesale;
  };
  var solar_cost = function() {
    var ptc = pp.ptc === 'on' ? 0.7 : 1.0,
      decrease = 1;
    return (((pp.solar_installation * 1000000) * (pp.solar_amortization / 100) + pp.solar_om)) * ptc / (8765 * pp.solar_capacity) * decrease - pp.policy_wholesale;
  };
  var get_cap_and_rec = function() {
    var _rec = {type: 'REC', data: []},
      _cap = {type: 'Cost Cap', data: [], invert: true},
      wind = wind_cost(),
      solar = solar_cost();
    Options.data.wind.data.forEach(function(d, i) {
      d.x = new Date(d.x);
      var wind_rec = d.y / 100 * wind,
        solar_rec = Options.data.solar.data[i].y / 100 * solar,
        //TODO: This .65 is crap now. It comes from the IL/IA code from the original paper
        other_rec = (100 - Options.data.solar.data[i].y - d.y) / 100 * wind * .65,
        year = d.x.getFullYear();
      _cap.data[i] = {x: new Date(d.x), y0: 0, y: year >= 2013 ? (pp.policy_costcap * Math.pow(1.01, year - 2013)) / Options.data.trajectory.data[i].y * 100 : 0};
      _rec.data[i] = {x: new Date(d.x), y0: 0, y: (wind_rec + solar_rec + other_rec)};
    });
    return [_cap, _rec];
  };
  var width = 760,
    height = 400,
    padding = 30,
    container = '#cost_cap',
    cap_rec = get_cap_and_rec(),
    cost = new RPSGraph()
      .padding(30)
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
  var intersect_legend = d3.select('.chart-legend').append('span').attr('class', 'legend-row');
  intersect_legend.append('span').attr('class', 'legend-swatch')
    .style('background-color', d3.rgb(213, 94, 0))
    .style('background-image', 'url(/static/images/svg/stripes_sky-blue.png)');
  intersect_legend.append('span').attr('class', 'legend-text')
    .text('REC exceeds costcap');
}());