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
    .attr('xlink:href', function(d) {
      if (states_w_rps.indexOf(d.properties.name) > -1) {
        return '/state/' + d.properties.name.toLowerCase().replace(' ', '_');
      }
      return null;
    })
    .append('path')
    .attr({
      class: 'state-boundary',
      d: path,
      'data-id': function(d) { return d.id; }
    })
    .on('mouseover', function() {
      d3.select(this).classed('active', true);
    })
    .on('mouseout', function() {
      d3.select(this).classed('active', false);
    })
    .classed('rps', function(d) {
      return states_w_rps.indexOf(d.properties.name) > -1;
    });
});

d3.select(self.frameElement).style("height", height + "px");