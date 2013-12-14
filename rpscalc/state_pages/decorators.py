from functools import wraps
from flask import g, flash, redirect, url_for, request, session


def state_update(state):
    def wrap(f):
        def wrapped_f(*args, **kwargs):
            try:
                session['update_state'] = state != session['state']
                if session['update_state']:
                    session.clear()
            except KeyError:
                session['update_state'] = False
            session['state'] = state
            f(*args, **kwargs)
        return wrapped_f
    return wrap