import json
import os
import urllib2
from flask import Blueprint, request, render_template, flash, g, session, \
    redirect, url_for, abort
from rpscalc.constants import EIA_API_KEY, STATES, BASE_DIR


mod = Blueprint('eia_api', __name__, url_prefix='/eia_api',
                static_folder='static')


@mod.route('/<state>/retail')
def state_retail(state):
    api_key = EIA_API_KEY
    # json_file = os.path.join(BASE_DIR, 'static/js/data/retail/{}.json'.\
    json_file = os.path.join(BASE_DIR, 'eia_api/static/json/retail/{}.json'.\
                             format(STATES[state][1]))
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
    # state_json_file = os.path.join(BASE_DIR, 'static/js/data/states/{}.json'.\
    state_json_file = os.path.join(BASE_DIR, 'state_pages/static/json/{}.json'.\
                                   format(STATES[state][1]))
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


@mod.route('/<state>/gridmix')
def state_gridmix(state):
    #TODO: this should be run as a cron every month or so. Should not be a public URL.
    from math import ceil
    from numpy import linspace
    eia = {
        'api_key': EIA_API_KEY,
        'url': 'http://api.eia.gov/series?api_key{{}}&series_id={{}}',
        'series_id': 'SEDS.{code}TCB.{state}.A',
        'series_list': [
            {'sector': 'Biomass', 'code': 'BMTCB', 'intensity': 1},
            {'sector': 'Coal', 'code': 'CLTCB', 'intensity': 890},
            {'sector': 'Distillate Fuel Oil', 'code': 'DFTCB',
             'intensity': 670},
            {'sector': 'Geothermal', 'code': 'GETCB', 'intensity': 1},
            {'sector': 'Hydroelectricity', 'code': 'HYTCB', 'intensity': 1},
            {'sector': 'Kerosene', 'code': 'KSTCB', 'intensity': 650},
            {'sector': 'LPG', 'code': 'LGTCB', 'intensity': 500},
            {'sector': 'Natural Gas', 'code': 'NNTCB',
             'intensity': 400},
            {'sector': 'Nuclear Electricity', 'code': 'NUETB', 'intensity': 1},
            {'sector': 'Residual Fuel Oil', 'code': 'RFTCB', 'intensity': 670},
            {'sector': 'Solar', 'code': 'SOTCB', 'intensity': 1},
            {'sector': 'Supplemental Gaseous Fuels', 'code': 'SFTCB',
             'intensity': 9999},
            {'sector': 'Wind', 'code': 'WYTCB', 'intensity': 1},
            {'sector': 'Wood and Waste', 'code': 'WWTCB', 'intensity': 9999},
        ]
    }
    eia_url = 'http://api.eia.gov/series/?api_key=D82A092DA301308805ECAB18A123BB4A&series_id='
    for s in eia['series_list']:
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
            'sector': eia['series_list'][i]['sector'],
            'data': data,
            'code': eia['series_list'][i]['code'],
            'intensity': eia['series_list'][i]['intensity'],
        })
    div = 25. if m <= 100. else 100. if m <= 1000. else 500.
    m = ceil(m / div) * div
    # with open(os.path.join(BASE_DIR, 'static/js/data/gridmix/{}.json'.format(STATES[state][1])), 'w') as f:
    with open(os.path.join(BASE_DIR, 'eia_api/static/json/gridmix/{}.json'.format(STATES[state][1])), 'w') as f:
        f.write(
            json.dumps(
                {'data': d, 'maximum': m,
                 'divs': range(0, int(m + 1), int(div)),
                 }
            )
        )