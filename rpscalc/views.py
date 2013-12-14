import json
from datetime import datetime
from flask import Blueprint, request, render_template, flash, g, session, \
    redirect, url_for, abort

mod = Blueprint('rpscalc', __name__, static_folder='static')

#TODO: Store this in one place only
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

@mod.route('/pinwheel')
def pinwheel():
    return render_template(
        'pinwheel.html'
    )

@mod.route('/glossary')
def glossary():
    return render_template(
        'glossary.html',
        now=datetime.now().microsecond,
        session_data=session_json(),
        title='Glossary'
    )