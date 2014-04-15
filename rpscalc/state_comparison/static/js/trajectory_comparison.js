(function() {

  var states_w_rps = ['Arizona', 'California', 'Hawaii', 'Illinois',
    'Iowa', 'Kansas', 'Maryland', 'Michigan', 'Maine', 'Montana',
    'Nevada', 'New Jersey', 'North Carolina', 'Ohio', 'Oregon',
    'Rhode Island', 'Washington', 'Wisconsin'];



  d3.json('/comparison/static/json/trajectories.json', function(error, _data) {
    d3.json('/static/js/maps/topojson/us-named.json', function(error, us) {
      var width = 468,
        height = 428,
        padding = {top: 0 , bottom: 0, right: 0, left: 0},
        projection = d3.geo.albersUsa()
          .scale(1300)
          .translate([width / 8, height / 8]),
        path = d3.geo.path()
          .projection(projection),
        svg = d3.select('#map')
          .append('svg')
          .attr({ 'xmlns': 'http://www.w3.org/2000/svg',
            'xmlns:xmlns:xlink': 'http://www.w3.org/1999/xlink',
            'version': '1.1',
            'width': width + padding.left + padding.right,
            'height': height + padding.top + padding.bottom
          }),
        zoom_func = function() {
          projection.translate(d3.event.translate).scale(d3.event.scale);
          state_map.selectAll('path').attr('d', path);
        },
        zoom = d3.behavior.zoom()
          .translate(projection.translate())
          .scale(projection.scale())
          .scaleExtent([height, 8 * height])
          .on('zoom', zoom_func),
        state_map = svg.append('g')
          .attr('transform', 'translate(' + width/2 + ',' + height/2 + ')')
          .append('g')
          .attr('id', 'states_all')
          .call(zoom);

      state_map.insert('path', '.graticule')
        .datum(topojson.feature(us, us.objects.land))
        .attr('class', 'land')
        .attr('d', path);

      var us_states = state_map.selectAll('path', '.state-boundary')
        .data(topojson.feature(us, us.objects.states).features)
        .enter()
        .append('a')
        .attr('xlink:href', function(d) {
//          if (states_w_rps.indexOf(d.properties.name) > -1) {
//            return '/state/' + d.properties.name.toLowerCase().replace(' ', '_');
//          }
          return null;
        })
        .append('path')
        .attr({
          class: 'state-boundary',
          d: path,
          'data-id': function(d) { return d.id; }
        })
        .on('mouseover', function(d) {
          var t = d3.select(this);
          if (t.classed('rps')) {
            t.classed('active', true);
            d3.selectAll('.chart-line').sort(function(a, b) {
              return a.type != d.properties.code ? -1 : 1;
            });
            d3.select('.chart-line[data-type="'+d.properties.code+'"]')
              .classed('active', true);
          }
        })
        .on('mouseout', function(d) {
          d3.select(this).classed('active', false);
          d3.select('.chart-line[data-type="'+d.properties.code+'"]')
            .classed('active', false);
        })
        .on('click', function(d) {
          var t = d3.select(this),
            cl = d3.select('.chart-line[data-type="'+d.properties.code+'"]'),
            p1 = d3.selectAll('.state-boundary.persist1')[0].length,
            p2 = d3.selectAll('.state-boundary.persist2')[0].length;
          t.classed('persist2', !t.classed('persist1') && !!p1 && !p2);
          cl.classed('persist2', !t.classed('persist1') && !!p1 && !p2);
          t.classed('persist1', !p2 && !p1);
          cl.classed('persist1', !p2 && !p1);
        })
        .classed('rps', function(d) {
          return states_w_rps.indexOf(d.properties.name) > -1;
        });

      var data = [],
        parse_date = d3.time.format('%Y').parse;
      _data.forEach(function(_d, _i) {
        data[_i] = {type: _d.abbr, data: []};
        _d.data.forEach(function(d, i) {
          data[_i].data[i] = {y: d, x: parse_date(String(i + 2013)), y0: 0};
        });
      });

      width = 470;
      height = 470;

      var trajectories = new RPSGraph()
        .padding(10, 10, 30, 50)
        .width(width).height(height)
        .select('#trajectories')
        .x(d3.time.scale())
        .y(d3.scale.linear())
        .domain([new Date(2012, 10, 1), new Date(2030, 1, 1)],
            [0, d3.max(_data, function(d) { return d3.max(d.data); }) +.1])
        .format_x(function(x) { return x.getFullYear(); })
        .format_y(function(y) { return d3.format('.1f')(y); })
        .data(data)
        .h_grid(true)
        .lines(true)
        .draw();
    });

  });

//  d3.selectAll('.chart-line').style('fill', 'none');

})();