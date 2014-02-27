from flask import Blueprint, render_template


mod = Blueprint('comparison', __name__, template_folder='templates',
                static_folder='static')


@mod.route('/state/comparison')
def comparison():
    return render_template(
        'comparison.html',
        title='State by state RPS Comparison',
    )