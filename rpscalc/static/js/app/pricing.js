/*
(function() {
  d3.json('/static/js/data/prices/' + Options.state + '.json', function(_data) {
    var retail = Math.round(_data.data.slice(-1)[0].data * 10);
    d3.select('#policy_retail').property('value', retail);
  });
  d3.selectAll('input')
//    .each(function() {
//      var input = d3.select(this);
//      Options.data[input.attr('name')] = input.property('value');
//    })
    .property('value', function() {
      var input = d3.select(this);
      if (input.attr('type') === 'text') {
        return Options.data[input.attr('name')] || input.property('value');
      }
      return null;
    })
    .property('checked', function() {
      var input = d3.select(this);
      if (input.attr('type') === 'checkbox') {
        return Options.data[input.attr('name')] || input.property('value');
      }
      return null;
    })
    .on('change', function() {
      var input = d3.select(this);
      var prop = input.attr('type') === 'checkbox' ? 'checked' : 'value';
      Options.data[input.attr('name')] = input.property(prop);
    });
}());
*/
(function() {
  d3.json('/static/js/data/prices/' + Options.state + '.json', function(_data) {
    var retail = Math.round(_data.data.slice(-1)[0].data * 10);
    d3.select('#policy_retail').property('value', retail);
  });
  d3.selectAll('input')
    .each(function(d) {
      var input = d3.select(this);
      Options.data[input.attr('name')] = input.property('value');
      input.on('change', function() {
        Options.data[input.attr('name')] = input.property('value');
      });
    });
}());