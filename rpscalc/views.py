from datetime import datetime
from flask import Blueprint, request, render_template, flash, g, session, \
    redirect, url_for, abort


mod = Blueprint('rpscalc', __name__, static_folder='static')


@mod.route('/update', methods=['POST',])
def update():
    try:
        for k, v in request.get_json(force=True).iteritems():
            session[k] = v
        return 'Session updated.'
    except:
        abort(500)

@mod.route('/pinwheel')
def pinwheel():
    return render_template(
        'pinwheel.html'
    )