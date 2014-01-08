(function() {
  'use strict';
  var width = 760,
    height = 100,
    padding = 30,
    empty = true,
    container = '#carveouts',
    carveout_types = ['wind', 'solar'],
    parse_date = d3.time.format('%Y').parse;
  d3.json('/static/js/data/states/' + Options.state + '.json', function(_data) {
      var data = [{type: 'wind', data: []}, {type: 'solar', data: []}],
      stored = {wind: Options.data.wind || false, solar: Options.data.solar || false};
    carveout_types.forEach(function(d, i) {
      var carveout_type = carveout_types[i],
        carveout_data = data.filter(function(e) { return e.type === carveout_type })[0],
        _stored = stored[carveout_type] !== false,
        carveout = _data.carveouts.filter(function(d) { return d.type === carveout_type; })[0];
        carveout = _stored ? stored[carveout_type].data : carveout ? carveout.data : [];
      empty = empty ? carveout.length === 0 : d3.sum(carveout, function(d) { return d.y; }) === 0;
      carveout = carveout.length > 0 ? carveout : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      carveout.forEach(function(d, ii) {
        var _t = _data.trajectory[ii];
        if (_stored && !Options.data.update_state) {
          carveout_data.data[ii]= {x: parse_date(String(ii + 2000)), y: _t === 0 ? 0 : d.y, type: carveout_type};
        } else {
          carveout_data.data[ii]= {x: parse_date(String(ii + 2000)), y: _t === 0 ? 0 : d / _t * 100, type: carveout_type};
        }
      });
      Options.data[carveout_type] = carveout_data;
    });
    data.sort(function(a, b) { return a.data[a.data.length-1].y < b.data[b.data.length-1].y ? -1 : a.data[a.data.length-1].y > b.data[b.data.length-1].y ? 1 : 0 });

    var chart_inputs = d3.select(container).append('form')
      .attr({ 'class': 'clearfix',
        'id': container + 'chart_inputs' })
      .style('padding-left', padding.left + 'px')
      .classed('hidden', false);
    var input_rows = chart_inputs.selectAll('div')
      .data(data.reverse()).enter()
      .append('div')
      .attr({ 'class': 'clearfix chart-input-row',
        'data-type': function(d) { return d.type; } });
    input_rows.append('h6').text(function(d) { return d.type; });
    data.reverse();
    var _x = d3.scale.linear().domain([new Date(2013, 0, 1), new Date(2030, 0, 1)]).range([0, width-60]);
    console.log(data[0].data[1]);
    var segment_width = _x(data[0].data[1].x) - _x(data[0].data[0].x);
    var format_y = function(y) {return d3.format('.1f')(y);};
    var inputs = input_rows.selectAll('input')
      .data(function(d) { return d.data; }).enter()
      .append('input')
      .attr({'type': 'text', 'class': 'chart-input',
        'data-x': function(d) { return d.x; },
        'data-type': function(d) {  return d.type; }})
      .property('value', function(d) { return format_y(d.y); })
      .style({ 'width': (segment_width - 14) + 'px',
        'display': function(d) {return ((_x(d.x) > _x.range()[0]) && (_x(d.x) <= _x.range()[1])) ? 'block' : 'none'; } })
      .on('change', function(d) {
        var _v = (d3.select(this).property('value'));
        //TODO: Better max and min
        _v = (_v > max_drag(d)) ? format_y(max_drag(d)) : (_v < d.y0) ? d.y0 : _v;
        data.filter(function(_d) { return _d.type === d.type; })[0].data.filter(function(_d) { return _d.x === d.x; })[0].y = +_v;
        d3.select(this).property('value', +_v);
        //TODO: Redraw cost graph
      });
//    var carveouts = new RPSGraph()
//      .padding(30)
//      .width(width).height(height)
//      .select(container)
//      .x(d3.time.scale())
//      .y(d3.scale.linear())
//      .domain([new Date(2013, 0, 1), new Date(2030, 0, 1)], [0, 100])
//      .max_domains([50, 100])
//      .format_x(function(x) { return x.getFullYear(); })
//      .format_y(function(y) { return d3.format('.1f')(y); })
//      .data(data)
//      .stacked(true)
//      .hoverable(true)
//      .draggable(true, false)
//      .h_grid(true)
//      .legend(true)
//      .draw();
//    carveouts.zeroes(true);
  });
}());