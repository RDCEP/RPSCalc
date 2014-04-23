var StateCostCap = function() {

  var type = 'none',
    cap,
    unit,
    cap_function;

  this.type = function(x) {
    if (typeof(x) == 'undefined') {
      return type;
    } else {
      unit = x == 'retail' ? '%' : x == 'acp' ? '$' : null;
      type = x;
      return this;
    }
  };

  this.cap = function(x) {
    if (typeof(x) == 'undefined') {
      return cap;
    }
    cap = x;
    return this;
  };

  this.unit = function(x) {
    if (typeof(x) == 'undefined') {
      return unit;
    }
    unit = x;
    return this;
  };

  this.cap_function = function(year, cap, retail, growth, trajectory) {
    return type == 'none'
      ? false
      : type == 'retail' && unit == '%'
      ? (cap * Math.pow(
          (100 + +growth) / 100, year - 2013)
        ) / trajectory * retail
      : type == 'retail' && unit == '$'
      ? (cap * Math.pow(
          (100 + +growth) / 100, year - 2013)
        ) / trajectory * retail
      : type == 'single-acp'
      ? cap
      : false
  };

};

state_cost_caps = state_cost_caps || { };

state_cost_caps.arizona = new StateCostCap();
state_cost_caps.colorado = new StateCostCap().type('retail').cap(2);
state_cost_caps.connecticutt = new StateCostCap().type('acp');
state_cost_caps.illinois = new StateCostCap().type('retail').cap(2);

