(function() {
  var width = 760,
    height = 100,
    padding = 30,
    empty = true,
    container = '#trajectory',
    parse_date = d3.time.format('%Y').parse;
  d3.json('/static/js/data/states/' + Options.state + '.json', function(_data) {
    var def_line = [{data: []}],
      data = [{type: 'rps', data: []}],
      trajectory = Options.data.trajectory;
    if (trajectory && trajectory.data.length > 0) {
      trajectory.data.forEach(function(d, i) {
        data[0].data[i] = {y: d.y, x: new Date(d.x), y0: 0};
      });
      _data.trajectory.forEach(function(d, i) {
        def_line[0].data[i] = {y: d * 100, x: parse_date(String(i + 2000)), y0: 0};
      });
    } else if (_data.trajectory.length > 0) {
      empty = false;
      // Parse trajectory data
      _data.trajectory.forEach(function(d, i) {
        data[0].data[i] = {y: d * 100, x: parse_date(String(i + 2000)), y0: 0};
      });
      // Parse default trajectory
      _data.trajectory.forEach(function(d, i) {
        def_line[0].data[i] = {y: d * 100, x: parse_date(String(i + 2000)), y0: 0};
      });
    } else {
      for (var i = 0; i < 31; ++i) {
        data[0].data[i] = {y: 0, x: parse_date(String(i + 2000)), y0: 0};
        def_line[0].data[i] = {y: 0, x: parse_date(String(i + 2000)), y0: 0};
      }
    }
    Options.data['trajectory'] = data[0];
    var foo = new RPSGraph()
      .padding(30)
      .width(width).height(height)
      .select(container)
      .title('Trajectory')
      .x(d3.time.scale())
      .y(d3.scale.linear())
      .domain([new Date(2013, 0, 1), new Date(2030, 0, 1)], [0, 50])
      .format_x(function(x) { return x.getFullYear(); })
      .format_y(function(y) { return d3.format('.1f')(y); })
      .data(data)
      .stacked(false)
      .draggable(true, false)
      .draw()
      .zeroes(true);
  });
}());