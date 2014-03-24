#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
State page overviews for RPS Calculator.
"""

from flask import Blueprint, render_template, session, abort


mod = Blueprint('state_pages', __name__, url_prefix='/state',
                static_folder='static', template_folder='templates')


@mod.route('/<state>')
@mod.route('/<state>/')
def overview(state):
    if state == 'favicon.ico': abort(404)
    session['state'] = state
    return render_template(
        'overview_states/{}.html'.format(state),
        state=state,
        session_clear='true',
    )