//TODO: So fucking much
//TODO: Calculate price

wind_cost = function() {
  var ptc = data.policy_ptc === 'on' ? 0.7 : 1.0,
    decrease = 1;
  return (((data.wind_installation * 1000000) * ptc * (data.wind_amortization / 100)) / (8765 * data.wind_capacity) + data.wind_om + data.wind_integration) * decrease - data.policy_wholesale;
};
solar_cost = function() {
  var ptc = data.ptc === 'on' ? 0.7 : 1.0,
    decrease = 1;
  return (((data.solar_installation * 1000000) * (data.solar_amortization / 100) + data.solar_om)) * ptc / (8765 * data.solar_capacity) * decrease - data.policy_wholesale;
};
rec = function() {
  var _rec = {type: 'REC', data: []},
    _cap = {type: 'Cost Cap', data: []},
    wind = wind_cost(),
    solar = solar_cost();
  data.wind.data.forEach(function(d, i) {
    var wind_rec = d.y / 100 * wind,
      solar_rec = data.solar.data[i].y / 100 * solar,
      other_rec = (100 - data.solar.data[i].y - d.y) / 100 * wind * .65,
      year = +d.x.split('-')[0];
    _cap.data[i] = {x: new Date(d.x), y0: 0, y: year >= 2013 ? (data.policy_costcap * Math.pow(1.01, year - 2013)) / data.trajectory.data[i].y * 100 : 0};
    _rec.data[i] = {x: new Date(d.x), y0: 0, y: (wind_rec + solar_rec + other_rec)};
  });
  return [_rec,_cap];
};
var width = 760,
  height = 300,
  padding = 30,
  container = '#cost_cap',
  parse_date = d3.time.format('%Y').parse,
  cost = new RPSGraph()
    .padding(30)
    .width(width).height(height)
    .select(container)
    .title('')
    .x(d3.time.scale())
    .y(d3.scale.linear())
    .domain([new Date(2013, 0, 1), new Date(2030, 0, 1)], [0, 50])
    .format_x(function(x) { return x.getFullYear(); })
    .format_y(function(y) { return d3.format('.1f')(y); })
    .data(rec())
    .stacked(false)
    .hoverable(true)
    .h_grid(true)
    .lines(true)
    .draw();