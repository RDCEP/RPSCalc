import json


def session_json(_session):
    return json.dumps({ k: v for k, v in _session.iteritems()})


def session_cleared(_session):
    _s = { k: v for k, v in _session.iteritems()}
    for k in ['trajectory', 'wind', 'solar', 'rps', 'price_and_policy']:
        if k in _s.keys():
            _s[k] = False
    return json.dumps(_s)