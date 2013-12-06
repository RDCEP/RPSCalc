var update_session = function() {
  d3.event.preventDefault();
  var clicked = d3.select(this);
  d3.xhr('/update')
    .mimeType('application/json')
    .post(JSON.stringify(Options.data))
    .on('load', function() {
      window.location.assign(clicked.attr('href'));
    });
};

d3.selectAll('#crumbs a').on('click', update_session);
d3.selectAll('#left_nav a').on('click', update_session);