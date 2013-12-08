(function() {
  d3.json('/static/js/data/prices/' + Options.state + '.json', function(_data) {
    var retail = Math.round(_data.data.slice(-1)[0].data * 10);
    d3.select('#policy_retail').property('value', retail);
  });
  d3.selectAll('input')
    .each(function() {
      var input = d3.select(this);
      Options.data[input.attr('name')] = input.property('value');
      input.on('change', function() {
        Options.data[input.attr('name')] = input.property('value');
      });
    });
}());