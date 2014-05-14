#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Base module for RPS Calculator. Register filters, context processors,
blueprints, assets.
"""

from datetime import datetime
from flask import Flask, render_template, session, g
from flask.ext.assets import Environment, Bundle
from rpscalc.filters import session_json, session_cleared, deslugify, \
    state_abbr, state_typo
from rpscalc.constants import RPS_STATES


app = Flask(__name__)
app.config.from_object('config')
app.url_map.strict_slashes = False
app.jinja_env.filters['session_json'] = session_json
app.jinja_env.filters['session_cleared'] = session_cleared
app.jinja_env.filters['deslugify'] = deslugify
app.jinja_env.filters['state_abbr'] = state_abbr
app.jinja_env.filters['state_typo'] = state_typo


@app.errorhandler(404)
def not_found(error):
    return render_template('errors/404.html'), 404


#TODO: Delete this. Replace with filter.
@app.context_processor
def session_clear():
    return dict(session_clear='false')


@app.context_processor
def template_now():
    return dict(now=datetime.now().microsecond)


@app.context_processor
def all_rps_states():
    s = sorted([(v.names[0], v.names[1])
                for k, v in RPS_STATES.iteritems()
                if v.rps], key=lambda i: i[1])
    return dict(all_rps_states=s)


@app.context_processor
def all_calc_states():
    s = sorted([(v.names[0], v.names[1])
                for k, v in RPS_STATES.iteritems()
                if v.calculator], key=lambda i: i[1])
    return dict(all_calc_states=s)


# Load and register Blueprints
from rpscalc.state_pages.views import mod as state_pages_module
from rpscalc.calculator.views import mod as calculator_module
from rpscalc.glossary.views import mod as glossary_module
from rpscalc.views import mod as rpscalc_module
from rpscalc.state_comparison.views import mod as comparison_mod
from rpscalc.eia_api.views import mod as eia_api_mod
app.register_blueprint(state_pages_module)
app.register_blueprint(calculator_module)
app.register_blueprint(glossary_module)
app.register_blueprint(rpscalc_module)
app.register_blueprint(comparison_mod)
app.register_blueprint(eia_api_mod)

# Set up asset bundles
assets = Environment(app)
css = Bundle('css/main.css', filters='cssmin', output='gen/main.css')
assets.register('css_main', css)
js = Bundle(
    'js/app/session.js',  'js/app/stacked_chart.js',
    filters='jsmin', output='gen/main.js')
assets.register('js_main', js)
js = Bundle(
    'js/vendor/topojson.v1.min.js',  'js/vendor/d3.geo.projection.v0.min.js',
    filters='jsmin', output='gen/map_extras.js')
assets.register('js_map_extras', js)
js = Bundle(
    'calculator/js/trajectory.js', filters='jsmin', output='gen/trajectory.js')
assets.register('js_trajectory', js)
js = Bundle(
    'state_pages/js/state_facts.js', filters='jsmin', output='gen/state_facts.js')
assets.register('js_state_facts', js)
js = Bundle(
    'calculator/js/carveouts.js', filters='jsmin', output='gen/carveouts.js')
assets.register('js_carveouts', js)
js = Bundle(
    'calculator/js/pricing.js', filters='jsmin', output='gen/pricing.js')
assets.register('js_pricing', js)
js = Bundle(
    'calculator/js/cost.js', filters='jsmin', output='gen/cost.js')
assets.register('js_cost', js)