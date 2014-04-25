#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Calculator views for RPS Calculator.
"""

from flask import Blueprint, request, render_template, flash, g, session, \
    redirect, url_for, abort
from rpscalc.constants import RPS_STATES


mod = Blueprint('calculator', __name__, url_prefix='/calculator',
                static_folder='static', template_folder='templates')


def update_calc_state(state):
    print session['state']
    for k in ['trajectory', 'wind', 'solar', 'rps', 'price_and_policy']:
        session[k] = False
    if state != session['state']:
        session['state'] = state


@mod.route('/clear', methods=['POST',])
def clear():
    try:
        for k, v in request.get_json(force=True).iteritems():
            if k in ['trajectory', 'wind', 'solar', 'rps', 'price_and_policy']:
                session[k] = False
            else:
                session[k] = v
        session['clear'] = False
        return 'Session cleared.'
    except:
        abort(500)


@mod.route('/update', methods=['POST',])
def update():
    try:
        for k, v in request.get_json(force=True).iteritems():
            session[k] = v
        session['clear'] = False
        return 'Session updated.'
    except:
        abort(500)


@mod.route('/<state>/trajectory')
def trajectory(state):
    return render_template(
        'trajectory_states/{}.html'.format(state),
        state=state,
        session_clear=False if state == session['state'] else True,
    )


@mod.route('/<state>/carveout')
def carveouts(state):
    if 'trajectory' not in session.keys():
        return redirect(url_for('calculator.trajectory', state=state))
    return render_template(
        'carveout_states/{}.html'.format(state),
        state=session['state'] or state,
    )


@mod.route('/<state>/pricing')
def pricing(state):
    if not session['trajectory']:
        return redirect(url_for('calculator.trajectory', state=state))
    if not session['wind'] or not session['solar']:
        return redirect(url_for('calculator.carveouts', state=state))
    return render_template(
        'pricing_states/{}.html'.format(state),
        state=session['state'] or state,
    )

@mod.route('/<state>/cost')
def cost(state):
    if not session['trajectory']:
        return redirect(url_for('calculator.trajectory', state=state))
    if not session['wind'] or not session['solar']:
        return redirect(url_for('calculator.carveouts', state=state))
    if not session['price_and_policy']:
        return redirect(url_for('calculator.pricing', state=state))
    return render_template(
        'cost_states/{}.html'.format(state),
        state=session['state'] or state,
    )

@mod.route('/<state>/advanced')
def advanced(state):
    if not session['trajectory']:
        return redirect(url_for('calculator.trajectory', state=state))
    if not session['wind'] or not session['solar']:
        return redirect(url_for('calculator.carveouts', state=state))
    if not session['price_and_policy']:
        return redirect(url_for('calculator.pricing', state=state))
    return render_template(
        'advanced.html',
        state=session['state'] or state,
    )