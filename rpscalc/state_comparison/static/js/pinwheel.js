function Pinwheel() {
  /*
   Set up initial variables
   ------------------------
   General layout
   */
  var margin = {top: 0, right: 0, bottom: 0, left: 0},
    padding = {top: 30, right: 30, bottom: 30, left: 30},
    outer_width = 600,
    outer_height = 600,
    inner_width = outer_width - margin.left - margin.right,
    inner_height = outer_height - margin.top - margin.bottom,
    width = inner_width - padding.left - padding.right,
    height = inner_height - padding.top - padding.bottom,
    _or = width / 2,
    _ir = 100,
    offset = 0,
    rotational_offset = Math.PI / 5
  ;
  /*
   General parameters
   */
  var num_states,
    num_segments,
    current_state
  ;

  /*
   Graph entities
   */
  var svg = d3.select('#graph').append('svg')
      .attr('width', width + padding.left + padding.right)
      .attr('height', height + padding.top + padding.bottom)
      .append('g'),
    _translate = 'translate('+(outer_width / 2)+','+(outer_height / 2)+')',
    data_layer = svg.append('g')
      .attr('transform', _translate)
      .attr('id', 'data-layer'),
    segments_layer = svg.append('g')
      .attr('transform', _translate)
      .attr('id', 'segments-layer'),
    states_layer = svg.append('g')
      .attr('transform', _translate)
      .attr('id', 'states-layer'),
    regions_layer = svg.append('g')
      .attr('transform', _translate)
      .attr('id', 'regions-layer'),
    legend,
    default_legend
  ;

  /*
   Graph functions: color, radius, angle, mouse, etc.
   */
  function get_color(i, v, n) {
    var color_list = [
      d3.rgb(0, 0, 0), //black
      d3.rgb(230, 159, 0),  // orange
      d3.rgb(86, 180, 233), // sky blue
      d3.rgb(0, 158, 115),  // bluish green
      d3.rgb(240, 228, 66), // yellow
      d3.rgb(0, 114, 178),  // blue
      d3.rgb(213, 94, 0),   // vermilion
      d3.rgb(204, 121, 167) // reddish purple
    ];
    if (v === (false || null)) {
      return '#eeeeee';
    }
    var c = color_list[(i + 8) % 8],
      m = 3,
      r = (255 - (255 - c.r) / m - c.r) * (n - v) / n + c.r,
      g = (255 - (255 - c.g) / m - c.g) * (n - v) / n + c.g,
      b = (255 - (255 - c.b) / m - c.b) * (n - v) / n + c.b
    ;
    return d3.rgb(r, g, b);
  }
  function start_angle(i) {
    return (Math.PI * 2) / num_states * i - rotational_offset;
  }
  function end_angle(i) {
    return (Math.PI * 2) / num_states * (i + 1) - rotational_offset;
  }
  function outer_radius(d, i) {
    return _or - i * ((_or - _ir) / num_segments);
  }
  function inner_radius(d, i) {
    return _or - (i + 1) * ((_or - _ir) / num_segments);
  }
  function state_label_x(i) {
    return Math.sin((Math.PI * (2 * i + 1)) / num_states - rotational_offset) * (_or + padding.left / 2);
  }
  function state_label_y(i) {
    return -Math.cos((Math.PI * (2 * i + 1)) / num_states - rotational_offset) * (_or + padding.left / 2);
  }
  function mouse_over() {
    var
      slice = d3.select('.state-slice[data-state='+this.getAttribute('data-state')+']'),
      legend_items = d3.selectAll('.legend li');
    d3.select('h2.state').html(slice.attr('data-longname'));
    d3.selectAll('.legend-text').remove();
    legend_items.each(function() {
      var legend_item = d3.select(this);
      legend_item.append('p')
        .html(function() {
          var segment = slice.select('[data-segment='+legend_item.attr('data-segment')+']'),
            _i = segment.attr('data-index'),
            _n = segment.attr('data-segment'),
            _v = segment.attr('data-value'),
            _l = segment.attr('data-legend')
          ;
          legend_item.select('.dot').style('background-color', segment.attr('fill'));
          return '<b>'+legend[_n]['name']+':</b> '+(_l || (legend[_n]['values'][_v] || 'N/A'));
        })
        .attr('class', 'legend-text')
      ;
      d3.select('#legend').style('display', 'block');
    });
    d3.selectAll('.state[data-state='+slice.attr('data-state')+']').classed('active', true);
  }
  function mouse_out() {
    var slice = d3.select('.state-slice[data-state='+this.getAttribute('data-state')+']');
    d3.select('#legend').style('display', 'none');
    d3.select('h2.state').html('');
    d3.selectAll('.legend-text').remove();
    d3.selectAll('.state[data-state='+slice.attr('data-state')+']').classed('active', false);
    draw_default_legend();
  }

  function draw_default_legend() {
    var
      slice = d3.select('.state-slice[data-state='+Options.state_abbr+']'),
      legend_items = d3.selectAll('.legend li');
    d3.select('h2.state').html(slice.attr('data-longname'));
    d3.selectAll('.legend-text').remove();
    legend_items.each(function(d, i) {
      var legend_item = d3.select(this);
      legend_item.append('p')
        .html(function() {
          var segment = slice.select('[data-segment='+legend_item.attr('data-segment')+']'),
            _i = segment.attr('data-index'),
            _n = segment.attr('data-segment'),
            _v = segment.attr('data-value'),
            _l = segment.attr('data-legend')
          ;
          legend_item.select('.dot').style('background-color', segment.attr('fill'));
          return '<b>'+legend[_n]['name']+':</b> '+(_l || (legend[_n]['values'][_v] || 'N/A'));
        })
        .attr('class', 'legend-text')
      ;
      d3.select('#legend').style('display', 'block');
    });

//    var
//      legend_items = d3.selectAll('.legend li');
//    d3.select('h2.state').html('Legend');
//    legend_items.each(function(d, i) {
//      var legend_item = d3.select(this);
//      legend_item.append('p')
//        .html(function() {
//          var segment = legend_item.attr('data-segment');
//          legend_item.select('.dot').style('background-color', get_color(i,1,1));
//          return '<b>'+default_legend[i]['name']+':</b> '+(default_legend[i]['values']);
//        })
//        .attr('class', 'legend-text')
//      ;
//      d3.select('#legend').style('display', 'block');
//    });

  }
  /*
   End variables
   */

  d3.json('/comparison/static/json/pinwheel_data.json', function(data) {
    num_states = data.states.length;
    legend = data.legend;
    default_legend = data.default_legend;
    var states = data_layer.selectAll('.state')
      .data(data.states)
      .enter()
      .append('g')
      .attr('data-state', function(d) {return d.abbr;})
      .attr('data-region', function(d) {return d.region;})
      .attr('data-longname', function(d) {return d.name;})
      .attr('class', 'state state-slice')
    ;
    states.sort(function(a, b) {
      var _a = data.regions.indexOf(a.region),
        _b = data.regions.indexOf(b.region);
      return _a < _b ? -1 : _a > _b ? 1 : d3.ascending(a.abbr, b.abbr);
    });

    /*
     Draw slice, data segments, labels for each state.
     */
    states.each(function(d, i) {
      /*
       Data segments
       */
      num_segments = d.data.length;
      current_state = d3.select(this);
      current_state.selectAll('.segment')
        .data(d.data)
        .enter()
        .append('path')
        .attr('d', d3.svg.arc()
          .innerRadius(inner_radius)
          .outerRadius(outer_radius)
          .startAngle(start_angle(i))
          .endAngle(end_angle(i))
        )
        .attr('fill', function(dd, ii) {return get_color(ii, dd.value, data.legend[dd.name]['values'].length - 1);})
        .attr('class', 'segment')
        .attr('data-state', d.abbr)
        .attr('data-segment', function(dd) {return dd.name;})
        .attr('data-index', function(dd, ii) {return ii;})
        .attr('data-value', function(dd) {return dd.value;})
        .attr('data-legend', function(dd) {return dd.legend || null;})
      ;

      /*
       Slice borders for each state, with mouse events
       */
      states_layer.append('path')
        .attr('d', d3.svg.arc()
          .innerRadius(_ir)
          .outerRadius(_or)
          .startAngle(start_angle(i))
          .endAngle(end_angle(i))
        )
        .attr('class', 'state state-border')
        .attr('data-state', d.abbr)
        .attr('data-longname', d.name)
        .on('mouseover', mouse_over)
        .on('mouseout', mouse_out)
      ;

      /*
       State abbreviation labels and discs for mouse events
       */
      states_layer.append('circle')
        .attr('class', 'state state-label state-label-disc')
        .attr('data-state', d.abbr)
        .attr('cx', state_label_x(i))
        .attr('cy', state_label_y(i))
        .attr('r', 12)
        .style({
          fill: function() { return d.abbr == Options.state_abbr ? d3.rgb(213, 94, 0) : null; }
        })
        .classed('current', function() { return d.abbr == Options.state_abbr; })
      ;
      states_layer.append('text')
        .attr('class', 'state state-label state-label-text')
        .attr('data-state', d.abbr)
        .text(d.abbr)
        .attr('x', state_label_x(i))
        .attr('y', state_label_y(i))
        .classed('current', function() { return d.abbr == Options.state_abbr; })
      ;
    });

    /*
     Circular borders between data segments
     */
    segments_layer.selectAll('.segdiv')
      .data(d3.map(data.legend).keys())
      .enter()
      .append('circle')
      .attr('class', 'segdiv')
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('r', inner_radius)
    ;
    d3.select('ul.legend').selectAll('li')
      .data(d3.map(data.legend).keys())
      .enter()
      .append('li')
      .attr('data-segment', function(d) {return d;})
      .attr('class', 'clearfix')
      .append('div')
      .attr('class', 'dot')
    //<li data-segment=rps class=clearfix><div class=dot></div></li>

    /*
     Separator lines for national regions
     */
    var _sa = 0 - rotational_offset,
      _ea = 0;
    regions_layer.selectAll('.regdiv')
      .data(data.regions)
      .enter()
      .append('path')
      .attr('d', d3.svg.arc()
          .innerRadius(_ir)
          .outerRadius(_or)
          .startAngle(function(dd) {
            _sa += _ea;
            return _sa;
          })
          .endAngle(function(dd) {
//            _ea = (Math.PI * 2) / num_states * d3.selectAll('[data-region='+dd+']').size();
            _ea = (Math.PI * 2) / num_states * d3.selectAll('[data-region='+dd+']')[0].length;
            return _sa;
          })
      )
      .attr('class', 'regdiv')
    ;
    draw_default_legend();
  });
}

var pinwheel = new Pinwheel();