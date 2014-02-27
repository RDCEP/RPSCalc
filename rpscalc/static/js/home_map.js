var width = 960,
  height = 600,
  padding = {top: 0 , bottom: 0, right: 0, left: 0};

var states_w_rps = ['Arizona', 'California', 'Hawaii', 'Illinois',
  'Iowa', 'Kansas', 'Maryland', 'Michigan', 'Maine', 'Montana',
  'Nevada', 'New Jersey', 'North Carolina', 'Ohio', 'Oregon',
  'Rhode Island', 'Washington', 'Wisconsin'];

var projection = d3.geo.albersUsa()
    .scale(1300)
    .translate([width / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("#map")
  .style({width: width+'px', height: height+'px'})
  .append("svg")
  .attr({ 'xmlns': 'http://www.w3.org/2000/svg',
    'xmlns:xmlns:xlink': 'http://www.w3.org/1999/xlink',
    'version': '1.1',
    'width': width + padding.left + padding.right,
    'height': height + padding.top + padding.bottom
  });

var pop_ups = d3.select('#map')
  .append('ul')
  .attr({id: 'state-options'});

d3.json('/static/js/maps/topojson/us-named.json', function(error, us) {
  svg.insert("path", ".graticule")
      .datum(topojson.feature(us, us.objects.land))
      .attr("class", "land")
      .attr("d", path);

  var us_states = svg.selectAll('path', '.state-boundary')
    .data(topojson.feature(us, us.objects.states).features)
    .enter()
    .append('a')
    .append('path')
    .attr({
      class: 'state-boundary',
      d: path,
      'data-id': function(d) { return d.id; }
    })
    .on('mouseover', function(d, i) {
      var c = path.centroid(d);
      pop_ups.selectAll('li').style('display', 'none');
      var p = pop_ups.select('[data-id="'+ d.id+'"]');
      p.style({
        left: (c[0] - 24)+'px',
        top: (c[1] - 10)+'px',
        display: 'block'
      });

    })
    .classed('rps', function(d) {
      var is_rps_state = states_w_rps.indexOf(d.properties.name) > -1;
      if (is_rps_state) {
        var pop_up = pop_ups.append('li')
          .attr({
            class: 'state-options',
            'data-id': d.id
          });
        var overview_icon = pop_up
          .append('a')
          .attr({class: 'option-icon state-overview-icon'})
          .on('click', function(e) {
            console.log(e);
            window.location = e.attr('href');
          });
        var calculator_icon = pop_up
          .append('a')
          .attr({class: 'option-icon state-calculator-icon'});
        overview_icon.attr('href', '/state/'+d.properties.name.toLowerCase().replace(' ', '_'));
        calculator_icon.attr('href', '/calculator/'+d.properties.name.toLowerCase().replace(' ', '_')+'/trajectory');
      }
      return is_rps_state;
    });
});

d3.select(self.frameElement).style("height", height + "px");