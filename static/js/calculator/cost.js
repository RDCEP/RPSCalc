//TODO: So fucking much
//TODO: Calculate price

rec = function() {
  var ptc = .7,
    _solar = {
      capacity: .1,
      installation: 3.45,
      o_m: 0.012,
      integration: 5,
      amortization: 9,
      carveout: []
    },
    _wind = {
      capacity: .5,
      installation: 2,
      o_m: 10,
      integration: 5,
      amortization: 9,
      carveout: []
    },



  wind_cost = function(inst, integ, om, amort, capfac, decrease, wholesale) {
    return ((inst * ptc * amort) / (8765 * capfac) + om + int) * decrease - wholesale;
  };
  solar_cost = function(inst, integ, om, amort, capfac, decrease, wholesale) {
    return ((((inst * amort + om) * ptc) / (8765 * capfac)) * decrease) - wholesale;
  };
  rec = function(wind_co, solar_co) {
    var _rec = [];
    wind_co.forEach(function(d, i) { _rec[i] = d * wind_cost() + solar_co[i] * solar_cost(); });
    return _rec;
  }
};