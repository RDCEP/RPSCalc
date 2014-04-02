(function() {
  d3.json('/comparison/static/json/trajectories.json', function(error, _data) {
    var data = [],
      parse_date = d3.time.format('%Y').parse;
    _data.forEach(function(_d, _i) {
      console.log(_i);
      data[_i] = {type: _d.abbr, data: []};
      _d.data.forEach(function(d, i) {
        console.log(_i, i);
        data[_i].data[i] = {y: d, x: parse_date(String(i + 2013)), y0: 0};
      });
    });

    console.log(data);

    var trajectories = new RPSGraph()
      .padding(30, 10, 30, 50)
      .width(760).height(400)
      .select('#trajectories')
      .x(d3.time.scale())
      .y(d3.scale.linear())
      .domain([new Date(2012, 10, 1), new Date(2030, 1, 1)],
          [0, d3.max(_data, function(d) { return d3.max(d.data); }) +.1])
      .format_x(function(x) { return x.getFullYear(); })
      .format_y(function(y) { return d3.format('.1f')(y); })
      .data(data)
      .h_grid(true)
      .lines(true)
      .draw();
  });

//  d3.selectAll('.chart-line').style('fill', 'none');

})();