import json
from flask import Blueprint, request, render_template, flash, g, session, \
    redirect, url_for, abort

mod = Blueprint('calculator', __name__, url_prefix='')

@mod.route('/update', methods=['POST',])
def update():
    try:
        for k, v in request.get_json(force=True).iteritems():
            session[k] = v
        return 'Session updated.'
    except:
        abort(500)

@mod.route('/<state>/trajectory')
def trajectory(state):
    return render_template(
        'calculator/trajectory.html',
        state=state,
        session_data=json.dumps(session.items()),
    )

@mod.route('/<state>/carveouts')
def carveouts(state):
    if 'trajectory' not in session.keys():
        return redirect('/%s/trajectory' % state)
    return render_template(
        'calculator/carveouts.html',
        state=state,
        session_data=json.dumps(session.items()),
    )

@mod.route('/<state>/pricing')
def pricing(state):
    if 'trajectory' not in session.keys():
        return redirect('/%s/trajectory' % state)
    return render_template(
        'calculator/pricing.html',
        state=state,
        session_data=json.dumps(session.items()),
    )

@mod.route('/<state>/cost')
def cost(state):
    if 'trajectory' not in session.keys():
        return redirect('/%s/trajectory' % state)
    return render_template(
        'calculator/cost.html',
        state=state,
        session_data=json.dumps(session.items()),
    )