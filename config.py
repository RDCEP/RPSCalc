#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Configuration options for RPS Calculator.
"""

import os
_basedir = os.path.abspath(os.path.dirname(__file__))

DEBUG = True

ADMINS = frozenset(['matteson@obstructures.org'])
SECRET_KEY = 'REPLACEME'

# SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(_basedir, 'rpscalc.db')
SQLALCHEMY_DATABASE_URI = 'postgresql://rpscalc:rpscalc@localhost/rpscalc_001D'
# SQLALCHEMY_MIGRATE_REPO = os.path.join(_basedir, 'db_repository')
# DATABASE_CONNECT_OPTIONS = {}

THREADS_PER_PAGE = 8

# CSRF_ENABLED = True
# CSRF_SESSION_KEY = 'REPLACEME'

# RECAPTCHA_USE_SSL = False
# RECAPTCHA_PUBLIC_KEY = 'REPLACEME'
# RECAPTCHA_PRIVATE_KEY = 'REPLACEME'
# RECAPTCHA_OPTIONS = {'theme': 'white'}