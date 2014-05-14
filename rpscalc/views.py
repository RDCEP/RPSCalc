#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Base views for RPS Calculator. Index, and session update.
"""

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


@mod.route('/')
def index():
    return render_template(
        'index.html',
        title='Renewable Portfolio Standards'
    )

@mod.route('/documentation')
def documentation():
    return render_template(
        'documentation.html',
    )