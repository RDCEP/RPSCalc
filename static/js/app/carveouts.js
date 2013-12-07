var width = 760,
  height = 400,
  padding = 30,
  empty = true,
  container = '#carveouts',
  carveout_types = ['wind', 'solar'],
  parse_date = d3.time.format('%Y').parse;

d3.json('/static/js/data/states/' + Options.state + '.json', function(_data) {
  var def_line = [{data: []}],
    data = [{type: 'wind', data: []}, {type: 'solar', data: []}],
    stored = {wind: Options.data.wind || false, solar: Options.data.solar || false};
  // Parse trajectory data
  //TODO: Rewrite JSON carveouts as percent of RPS, not percent of total energy
  //TODO: The loop below is total crap
  for (var i = 0; i < carveout_types.length; ++i) {
    var carveout_type = carveout_types[i],
      carveout_data = data.filter(function(e) { return e.type === carveout_type })[0],
      _stored = stored[carveout_type] !== false,
      //TODO: data is not defined when no carveouts (end of next line)
      carveout = _data.carveouts.filter(function(d) { return d.type === carveout_type; })[0];
      carveout = _stored ? stored[carveout_type].data : carveout ? carveout.data : [];
    empty = empty ? carveout.length === 0 : false;
    carveout = carveout.length > 0 ? carveout : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    carveout.forEach(function(d, ii) {
      var _t = _data.trajectory[ii];
      console.log(d, _t);
      if (_stored && !Options.data.update_state) {
        carveout_data.data[ii]= {x: parse_date(String(ii + 2000)), y: _t === 0 ? 0 : d.y, type: carveout_type};
      } else {
        carveout_data.data[ii]= {x: parse_date(String(ii + 2000)), y: _t === 0 ? 0 : d / _t * 100, type: carveout_type};
      }
    });
    Options.data[carveout_type] = carveout_data;
    console.log(Options.data[carveout_type]);
  }
  data.sort(function(a, b) { return a.data[a.data.length-1].y < b.data[b.data.length-1].y ? -1 : a.data[a.data.length-1].y > b.data[b.data.length-1].y ? 1 : 0 });
  var foo = new RPSGraph()
    .padding(30)
    .width(width).height(height)
    .select(container)
    .title('Adjust the state&rsquo;s carveouts')
    .x(d3.time.scale())
    .y(d3.scale.linear())
    .domain([new Date(2013, 0, 1), new Date(2030, 0, 1)], [0, 100])
    .max_domains([50, 100])
    .format_x(function(x) { return x.getFullYear(); })
    .format_y(function(y) { return d3.format('.1f')(y); })
    .data(data)
    .stacked(true)
    .hoverable(true)
    .draggable(true, false)
    .h_grid(true)
    .draw()
    .zeroes(empty);
});