from datetime import datetime
from flask import Flask, render_template, session
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