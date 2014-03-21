(function() {
  /*
   Retrieve state data from JSON. Set region for pricing and policies.
   Prefer session data if it exists, else state data, else regional.
   */
  var retail,
    region,
    state_pp,
    default_pp,
    session_pp = Options.data.price_and_policy;
  Options.data.price_and_policy = session_pp || {};
  d3.json('/state/static/json/' + Options.state + '.json', function(_data) {
    state_pp = _data.price_and_policy || false;
    region = state_pp.region || 'default';
    d3.json('/calculator/static/json/pricing.json', function(_defaults) {
      default_pp = _defaults[region];
      d3.selectAll('input')
        .property('value', function() {
          var input = d3.select(this),
            name = input.attr('name'),
            type = input.attr('type');
          if (type === 'checkbox') {
            input.property('checked', function() {
              var val = session_pp[name] ? session_pp[name] : state_pp[name] ? state_pp[name] : default_pp[name];
              console.log(name, val, default_pp);
              Options.data.price_and_policy[name] = val;
              return val;
            });
            return null;
          } else {
            var val = (session_pp[name]) ? session_pp[name] : (state_pp[name]) ? state_pp[name] : default_pp[name];
            Options.data.price_and_policy[name] = val;
            if (name == 'cost_cap') {
              //TODO: set unit (% or $)

            }
            return val;
          }

        })
        .on('change', function() {
          var input = d3.select(this),
            name = input.attr('name'),
            type = input.attr('type');
          if (type === 'checkbox') {
            console.log(input.property('checked'));
            Options.data.price_and_policy[name] = input.property('checked');
          } else {
            Options.data.price_and_policy[name] =  parseFloat(input.property('value'));
          }
        });
    });
  });
}());
