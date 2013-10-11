from flask import render_template, request, make_response
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

@app.route('/pinwheel')
def index():
    return render_template(
        'pinwheel.html'
    )

@app.route('/state/<state>')
def state(state):
    return render_template(
        'state.html',
        state=state,
    )

@app.route('/eia_api/<state>')
def eia_api(state):
    import urllib2
    import json
    from math import ceil
    from numpy import linspace
    eia = {
        "api_key": "D82A092DA301308805ECAB18A123BB4A",
        "url": "http://api.eia.gov/series?api_key{{}}&series_id={{}}",
        "series_id": "SEDS.{code}TCB.{state}.A",
        "series_list": [
            {"sector": "Coal", "code": "CLTCB"},
            {"sector": "Motor Gasoline excl. Ethanol", "code": "MMTCB"},
            {"sector": "Biomass", "code": "BMTCB"},
            {"sector": "Jet Fuel", "code": "JFTCB"},
            {"sector": "Hydroelectricity", "code": "HYTCB"},
            {"sector": "Nuclear Electricity", "code": "NUETB"},
            {"sector": "Wind", "code": "WYTCB"},
            {"sector": "Residual Fuel Oil", "code": "RFTCB"},
            {"sector": "Natural Gas", "code": "NNTCB"},
            {"sector": "LPG", "code": "LGTCB"},
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
        d.append({
            'sector': eia['series_list'][i]['sector'],
            'data': data,
        })

    div = 100. if m <= 1000. else 500.
    m = ceil(m / div) * div
    return json.dumps({'data': d, 'maximum': m, 'divs': range(0, int(m + 1), int(div)),})


if __name__ == '__main__':
    app.run()