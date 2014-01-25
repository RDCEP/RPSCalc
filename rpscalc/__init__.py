from datetime import datetime
from flask import Flask, render_template, session
from flask.ext.assets import Environment, Bundle
from rpscalc.filters import session_json, session_cleared
# from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config.from_object('config')
app.url_map.strict_slashes = False
app.jinja_env.filters['session_json'] = session_json
app.jinja_env.filters['session_cleared'] = session_cleared

# db = SQLAlchemy(app)

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


# Load and register Blueprints
from rpscalc.state_pages.views import mod as state_pages_module
from rpscalc.calculator.views import mod as calculator_module
from rpscalc.eia_api.views import mod as eia_module
from rpscalc.views import mod as rpscalc_module
app.register_blueprint(state_pages_module)
app.register_blueprint(calculator_module)
app.register_blueprint(rpscalc_module)
app.register_blueprint(eia_module)

assets = Environment(app)
css = Bundle('css/main.css', filters='cssmin', output='gen/main.css')
assets.register('css_main', css)
js = Bundle(
    'js/app/session.js',  'js/app/stacked_chart.js',
    filters='jsmin', output='gen/main.js')
assets.register('js_main', js)
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
js = Bundle(
    'calculator/js/advanced.js', filters='jsmin', output='gen/advanced.js')
assets.register('js_advanced', js)
