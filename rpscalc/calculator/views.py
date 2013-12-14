import json
from flask import Blueprint, request, render_template, flash, g, session, \
    redirect, url_for, abort

mod = Blueprint('calculator', __name__, url_prefix='/calculator')

def session_json():
    return json.dumps({ k: v for k, v in session.iteritems()})

@mod.route('/update', methods=['POST',])
def update():
    try:
        for k, v in request.get_json(force=True).iteritems():
            session[k] = v
        return 'Session updated.'
    except:
        abort(500)

@mod.route('/trajectory')
def trajectory():
    return render_template(
        'calculator/trajectory.html',
        state=session['state'],
        session_data=session_json(),
    )

@mod.route('/carveouts')
def carveouts():
    if 'trajectory' not in session.keys():
        return redirect('/%s/trajectory' % state)
    return render_template(
        'calculator/carveouts.html',
        state=session['state'],
        session_data=session_json(),
    )

@mod.route('/pricing')
def pricing():
    if 'trajectory' not in session.keys():
        return redirect('/%s/trajectory' % state)
    return render_template(
        'calculator/pricing.html',
        state=session['state'],
        session_data=session_json(),
    )

@mod.route('/cost')
def cost():
    if 'trajectory' not in session.keys():
        return redirect('/%s/trajectory' % state)
    return render_template(
        'calculator/cost.html',
        state=session['state'],
        session_data=session_json(),
    )