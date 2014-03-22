from flask import Blueprint, render_template, session


mod = Blueprint('state_comparison', __name__, url_prefix='/comparison',
                template_folder='templates', static_folder='static')


@mod.route('/')
def comparison():
    state = session['state'] or False
    return render_template(
        'comparison.html',
        title='State by state RPS Comparison',
        state=state
    )