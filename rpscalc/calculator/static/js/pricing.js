(function() {
  /*
   Retrieve state data from JSON. Set region for pricing and policies.
   Prefer session data if it exists, else state data, else regional.
   */
  var retail,
    region,
    state_pp,
    default_pp,
    session_pp = Options.data.price_and_policy,

    amortization = function(t, r) {
      return (r / 100 * Math.pow((1 + r / 100), t)) / (Math.pow((1 + r / 100), t) - 1);
    },

    wind_cost = function() {
      var ptc = Options.data.price_and_policy.policy_ptc ? 0.7 : 1.0,
        decrease = 1;
      return (
        (
          Options.data.price_and_policy.wind_installation * 1000000 * (
            amortization(Options.data.price_and_policy.finance_contractterm, Options.data.price_and_policy.finance_interestrate)
          ) * ptc
        ) / (8765 * Options.data.price_and_policy.wind_capacity) + Options.data.price_and_policy.wind_om + Options.data.price_and_policy.wind_integration
      ) * decrease - Options.data.price_and_policy.pricing_wholesale;
    },

    solar_cost = function() {
      var ptc = Options.data.price_and_policy.policy_ptc ? 0.7 : 1.0,
        decrease = 1;
      return (
        (
          Options.data.price_and_policy.solar_installation * 1000000 * (
            amortization(Options.data.price_and_policy.finance_contractterm, Options.data.price_and_policy.finance_interestrate)
          ) + Options.data.price_and_policy.solar_om
        ) * ptc
      ) / (8765 * Options.data.price_and_policy.solar_capacity) * decrease - Options.data.price_and_policy.pricing_wholesale;
    },

    show_costs = function() {

      d3.select('#wind_cost').text(function() {
        return '$'+wind_cost().toFixed(2);
      });
      d3.select('#solar_cost').text(function() {
        return '$'+solar_cost().toFixed(2);
      });

    };

  Options.data.price_and_policy = session_pp || {};
  d3.json('/state/static/json/' + Options.state + '.json?2', function(_data) {
    state_pp = _data.price_and_policy || false;
    region = state_pp.region || 'default';
    d3.json('/calculator/static/json/pricing.json', function(_defaults) {
      default_pp = _defaults[region];
      Options.data.retail_price = _data.price_and_policy.policy_retail;
      d3.selectAll('input')
        .property('value', function() {
          var t = d3.select(this),
            name = t.attr('name'),
            type = t.attr('type');
          if (type === 'checkbox') {
            t.property('checked', function() {
              var val = session_pp[name] ? session_pp[name] : state_pp[name] ? state_pp[name] : default_pp[name];
              Options.data.price_and_policy[name] = val;
              return val;
            });
            return null;
          } else {
            var val = (session_pp[name]) ? session_pp[name] : (state_pp[name]) ? state_pp[name] : default_pp[name];
            Options.data.price_and_policy[name] = val;
            return val;
          }
        })
        .on('change', function() {
          var input = d3.select(this),
            name = input.attr('name'),
            type = input.attr('type');
          if (type === 'checkbox') {
            Options.data.price_and_policy[name] = input.property('checked');
          } else {
            Options.data.price_and_policy[name] =  parseFloat(input.property('value'));
          }

          show_costs();

        });

      show_costs();

    });

  });



}());
