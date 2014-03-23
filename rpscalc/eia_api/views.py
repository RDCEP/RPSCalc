import json
import os
import urllib2
from rpscalc.constants import EIA_API_KEY, BASE_DIR, RPS_STATES, \
    EIA_FUEL_SECTORS


def state_retail(state):
    api_key = EIA_API_KEY
    json_file = os.path.join(
        BASE_DIR, 'eia_api', 'static', 'json', 'retail',
        '{}.json'.format(RPS_STATES[state]['names'][0]))
    series_id = 'ELEC.PRICE.{}-ALL.Q'.format(state)
    eia_url = 'http://api.eia.gov/series/?api_key={}&series_id={}'.\
        format(api_key, series_id)
    _d = json.loads(urllib2.urlopen(eia_url).read())
    data = []
    m = 0.
    for d in _d['series'][0]['data'][::-1]:
        _date = [float(x) for x in d[0].split('Q')]
        _price = float(d[1])
        data.append({
            'date': '{}-{}'.format(int(_date[1]*3), int(_date[0])),
            'data': _price})
        m = _price if _price > m else m
    div = 1-0-0. if m <= 10. else 5. if m <= 25. else 10.
    with open(json_file, 'w') as f:
        f.write(json.dumps(
            {'data': data, 'divs': range(0, int(m + 1), int(div))},
            indent=4, separators=(',', ': ')
        ))
    state_json_file = os.path.join(
        BASE_DIR, 'state_pages', 'static', 'json',
        '{}.json'.format(RPS_STATES[state]['names'][0]))
    with open(state_json_file, 'r') as f:
        state_json = json.load(f)
        state_json['policy_and_price'] = state_json.get('price_and_policy', {})
        state_json['policy_and_price']['policy_retail'] = \
            int(round(data[-1]['data'] * 10, 0))
    with open(state_json_file, 'w') as f:
        f.write(json.dumps(
            state_json,
            indent=4, separators=(',', ': ')
        ))


def state_gridmix(state):
    from math import ceil
    series_list = sorted(
        [l for l in EIA_FUEL_SECTORS
         if l['code'] in RPS_STATES[state]['green_energy']],
        key=lambda k: k['sector']
    ) + sorted(
        [l for l in EIA_FUEL_SECTORS
         if l['code'] not in RPS_STATES[state]['green_energy']],
        key=lambda k: k['sector']
    )
    eia_url = 'http://api.eia.gov/series/?api_key={}&series_id='.\
        format(EIA_API_KEY)
    for s in series_list:
        eia_url += 'SEDS.'+s['code']+'.'+state+'.A;'
    eia_url = eia_url[0:-1]
    eia_url += '&num=1'
    j = json.loads(urllib2.urlopen(eia_url).read())
    d = []
    m = 0.
    for i in range(len(j['series'])):
        data = float(j['series'][i]['data'][0][1]) / 1000.
        m = data if data > m else m
        if data > 0: d.append({
            'sector': series_list[i]['sector'],
            'data': data,
            'code': series_list[i]['code'],
            'intensity': series_list[i]['intensity'],
            'green': series_list[i]['code'] in RPS_STATES[state]['green_energy']
        })
    div = 25. if m <= 100. else 100. if m <= 1000. else 500.
    m = ceil(m / div) * div
    with open(os.path.join(
            BASE_DIR, 'eia_api', 'static', 'json', 'gridmix',
            '{}.json'.format(RPS_STATES[state]['names'][0])), 'w') as f:
        f.write(
            json.dumps({'data': d, 'maximum': m,
                        'divs': range(0, int(m + 1), int(div)), })
        )