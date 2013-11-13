import urllib2
import json
import urlparse
from flask import render_template, request, make_response, abort
from flask_beaker import BeakerSession
from uwsgi_app import app

session_opts = {
    'session.type': 'ext:memcached',
    'session.cookie_expires': True,
    'session.lock_dir': './data',
    'session.url': '127.0.0.1:11211',
    'session.memcache_module': 'pylibmc',
    'session.auto': True
}

app.config['DEBUG'] = True
app.config['SECRET_KEY'] = 'REPLACE_ME'
BeakerSession(app)

def update_session(request, **kwargs):
    s = request.environ.get('beaker.session')
    for key, value in kwargs.iteritems():
        s[key] = value
    return s

@app.route('/update', methods=['POST',])
def update():
    try:
        kwargs = json.loads(request.data)
        update_session(request, **kwargs)
        return 'Session updated.'
    except:
        abort(500)

@app.route('/pinwheel')
def pinwheel():
    return render_template(
        'pinwheel.html'
    )

@app.route('/<state>')
def state(state):
    if state == 'favicon.ico': abort(404)
    kwargs = {'state':state}
    _s = update_session(request, **kwargs)
    return render_template(
        'state.html',
        state=_s['state'],
    )

@app.route('/<state>/trajectory')
def trajectory(state):
    kwargs = {'state':state}
    _s = update_session(request, **kwargs)
    return render_template(
        'trajectory.html',
        state=_s['state'],
        graph_type='trajectory',
    )

@app.route('/<state>/wind')
def wind(state):
    kwargs = {'state':state}
    _s = update_session(request, **kwargs)
    return render_template(
        'wind_carveout.html',
        state=_s['state'],
        graph_type='wind_carveout',
    )

@app.route('/eia_api/retail')
def eia_api_retail():
    api_key = "D82A092DA301308805ECAB18A123BB4A"
    json_file = 'static/js/prices/retail_prices.json'
    states = json.loads(open(json_file).read())
    for s in states:
        series_id = "ELEC.PRICE.{}-ALL.Q".format(s)
        eia_url = 'http://api.eia.gov/series/?api_key={}&series_id={}'.format(api_key, series_id)
        d = json.loads(urllib2.urlopen(eia_url).read())
        print(float(d['series'][0]['data']))
        states[s] = float(d['series'][0]['data'][0][1]) * 10
    with open(json_file, 'w') as f:
        f.write(json.dumps(states, indent=4, separators=(',', ': ')))

@app.route('/eia_api/<state>/retail')
def eia_api_state_retail(state):
    api_key = 'D82A092DA301308805ECAB18A123BB4A'
    json_file = 'static/js/prices/{}.json'.format(state)
    series_id = 'ELEC.PRICE.{}-ALL.Q'.format(state)
    eia_url = 'http://api.eia.gov/series/?api_key={}&series_id={}'.format(api_key, series_id)
    _d = json.loads(urllib2.urlopen(eia_url).read())
    data = []
    m = 0.
    for d in _d['series'][0]['data'][::-1]:
        _date = [float(x) for x in d[0].split('Q')]
        _price = float(d[1])
        data.append({'date': '{}-{}'.format(int(_date[1]*3), int(_date[0])), 'data': _price})
        m = _price if _price > m else m
    div = 1-0-0. if m <= 10. else 5. if m <= 25. else 10.
    with open(json_file, 'w') as f:
        f.write(json.dumps(
            {'data': data, 'divs': range(0, int(m + 1), int(div))},
            indent=4, separators=(',', ': ')
        ))

@app.route('/eia_api/<state>/gridmix')
def eia_api(state):
    #TODO: this should be run as a cron every month or so. Should not be a public URL.
    from math import ceil
    from numpy import linspace
    eia = {
        'api_key': 'D82A092DA301308805ECAB18A123BB4A',
        'url': 'http://api.eia.gov/series?api_key{{}}&series_id={{}}',
        'series_id': 'SEDS.{code}TCB.{state}.A',
        'series_list': [
            {'sector': 'Biomass', 'code': 'BMTCB', 'intensity': 100},
            {'sector': 'Coal', 'code': 'CLTCB', 'intensity': 500},
            {'sector': 'Distillate Fuel Oil', 'code': 'DFTCB', 'intensity': 400},
            {'sector': 'Geothermal', 'code': 'GETCB', 'intensity': 150},
            {'sector': 'Hydroelectricity', 'code': 'HYTCB', 'intensity': 250},
            {'sector': 'Kerosene', 'code': 'KSTCB', 'intensity': 300},
            {'sector': 'LPG', 'code': 'LGTCB', 'intensity': 350},
            {'sector': 'Natural Gas as Lease and Plant Fuel', 'code': 'NGLPB', 'intensity': 250},
            {'sector': 'Nuclear Electricity', 'code': 'NUETB', 'intensity': 200},
            {'sector': 'Residual Fuel Oil', 'code': 'RFTCB', 'intensity': 480},
            {'sector': 'Solar', 'code': 'SOTCB', 'intensity': 50},
            {'sector': 'Supplemental Gaseous Fuels', 'code': 'SFTCB', 'intensity': 280},
            {'sector': 'Wind', 'code': 'WYTCB', 'intensity': 70},
            {'sector': 'Wood and Waste', 'code': 'WWTCB', 'intensity': 180},
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
    with open('static/js/gridmix/{}.json'.format(state), 'w') as f:
        f.write(
            json.dumps(
                {'data': d, 'maximum': m,
                 'divs': range(0, int(m + 1), int(div)),
                 }
            )
        )


if __name__ == '__main__':
    app.run()