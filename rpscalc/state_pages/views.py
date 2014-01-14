import json
from flask import Blueprint, request, render_template, flash, g, session, \
    redirect, url_for, abort

mod = Blueprint('state_pages', __name__, url_prefix='/state')

@mod.route('/<state>')
@mod.route('/<state>/')
def overview(state):
    if state == 'favicon.ico': abort(404)
    session['state'] = state
    return render_template(
        'state_pages/overview.html',
        state=state,
        session_clear='true',
    )