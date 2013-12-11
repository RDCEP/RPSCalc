import json
from flask import Blueprint, request, render_template, flash, g, session, \
    redirect, url_for, abort
from decorators import state_update

mod = Blueprint('state_pages', __name__, url_prefix='')

@mod.route('/<state>')
@mod.route('/<state>/')
def state_page(state):
    if state == 'favicon.ico': abort(404)
    return render_template(
        'state_pages/overview.html',
        state=state,
        session_data=json.dumps(session.items()),
    )