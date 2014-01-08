(function() {
  'use strict';
  var width = 760,
    height = 100,
    padding = 30,
    empty = true,
    container = '#carveouts',
    input_types = ['rps', 'wind', 'solar'],
    parse_date = d3.time.format('%Y').parse;
  d3.json('/static/js/data/states/' + Options.state + '.json', function(_data) {
    var data = [{type: 'rps', data: []}, {type: 'wind', data: []}, {type: 'solar', data: []}];
    input_types.forEach(function(d, i) {
      var input_type = input_types[i],
      carveout_data = data.filter(function(e) { return e.type === carveout_type })[0],
    }