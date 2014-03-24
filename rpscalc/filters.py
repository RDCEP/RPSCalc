#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Template filters for RPS Calculator.
"""

import json
from rpscalc.constants import RPS_STATES


def session_json(_session):
    return json.dumps({k: v for k, v in _session.iteritems()})


def session_cleared(_session):
    _s = {k: v for k, v in _session.iteritems()}
    for k in ['trajectory', 'wind', 'solar', 'rps', 'price_and_policy']:
        if k in _s.keys():
            _s[k] = False
    return json.dumps(_s)


def deslugify(v):
    return v.replace('_', ' ').capitalize()


def state_abbr(state):
    return [k for k, v in RPS_STATES.iteritems() if v['names'][0] == state][0]

def state_typo(state):
    return [v['names'][1] for v in RPS_STATES.values() if v['names'][0] == state][0]