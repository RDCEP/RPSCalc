#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Glossary views for RPS Calculator.
"""

from flask import Blueprint, render_template


mod = Blueprint('glossary', __name__, url_prefix='/glossary',
                static_folder='static', template_folder='templates')


@mod.route('/')
def glossary(definition=None):
    return render_template(
        'glossary.html',
        title='Glossary',
    )