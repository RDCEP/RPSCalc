from flask import Flask, render_template, Blueprint
# from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config.from_object('config')
app.url_map.strict_slashes = False

# db = SQLAlchemy(app)

@app.errorhandler(404)
def not_found(error):
    return render_template('errors/404.html'), 404

mod = Blueprint('rpscalc', __name__, static_folder='static')

from rpscalc.state_pages.views import mod as state_pages_module
from rpscalc.calculator.views import mod as calculator_module
app.register_blueprint(state_pages_module)
app.register_blueprint(calculator_module)
app.register_blueprint(mod)