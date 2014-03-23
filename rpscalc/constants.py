import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))


EIA_API_KEY = 'D82A092DA301308805ECAB18A123BB4A'


RPS_STATES = {
    'AK': {'names': ['alaska', 'Alaska'], 'rps': False, },
    'AL': {'names': ['alabama', 'Alabama'], 'rps': False, },
    'AR': {'names': ['arkansas', 'Arkansas'], 'rps': False, },
    'AS': {'names': ['american_samoa', 'American Samoa'], 'rps': False, },
    'AZ': {'names': ['arizona', 'Arizona', ], 'rps': True,
           'green_energy': ['BMTCB', 'GETCB', 'HYTCB', 'SOTCB', 'WYTCB']},
    'CA': {'names': ['california', 'California', ], 'rps': True,
           'green_energy': ['BMTCB', 'GETCB', 'HYTCB', 'SOTCB', 'WYTCB']},
    'CO': {'names': ['colorado', 'Colorado', ], 'rps': True,
           'green_energy': ['BMTCB', 'GETCB', 'HYTCB', 'SOTCB', 'WYTCB']},
    'CT': {'names': ['connecticut', 'Connecticut'], 'rps': False, },
    'DC': {'names': ['district_of_columbia', 'District of Columbia'], 'rps': False, },
    'DE': {'names': ['delaware', 'Delaware'], 'rps': False, },
    'FL': {'names': ['florida', 'Florida'], 'rps': False, },
    'GA': {'names': ['georgia', 'Georgia'], 'rps': False, },
    'GU': {'names': ['guam', 'Guam'], 'rps': False, },
    'HI': {'names': ['hawaii', 'Hawai&lsquo;i', ], 'rps': True,
           'green_energy': ['BMTCB', 'GETCB', 'HYTCB', 'SOTCB', 'WYTCB']},
    'ID': {'names': ['idaho', 'Idaho', ], 'rps': False, },
    'IN': {'names': ['indiana', 'Indiana', ], 'rps': False, },
    'IL': {'names': ['illinois', 'Illinois', ], 'rps': True,
           'green_energy': ['BMTCB', 'GETCB', 'HYTCB', 'SOTCB', 'WYTCB']},
    'IA': {'names': ['iowa', 'Iowa', ], 'rps': True,
           'green_energy': ['BMTCB', 'GETCB', 'HYTCB', 'SOTCB', 'WYTCB']},
    'KS': {'names': ['kansas', 'Kansas', ], 'rps': True,
           'green_energy': ['BMTCB', 'GETCB', 'HYTCB', 'SOTCB', 'WYTCB']},
    'KY': {'names': ['kentucky', 'Kentucky', ], 'rps': False, },
    'LA': {'names': ['louisiana', 'Louisiana', ], 'rps': False, },
    'MA': {'names': ['massachusetts', 'Massachusetts', ], 'rps': False, },
    'MD': {'names': ['maryland', 'Maryland', ], 'rps': True,
           'green_energy': ['BMTCB', 'GETCB', 'HYTCB', 'SOTCB', 'WYTCB']},
    'MI': {'names': ['michigan', 'Michigan', ], 'rps': True,
           'green_energy': ['BMTCB', 'GETCB', 'HYTCB', 'SOTCB', 'WYTCB']},
    'ME': {'names': ['maine', 'Maine', ], 'rps': True,
           'green_energy': ['BMTCB', 'GETCB', 'HYTCB', 'SOTCB', 'WYTCB']},
    'MN': {'names': ['minnesota', 'Minnesota', ], 'rps': False, },
    'MO': {'names': ['missouri', 'Missouri', ], 'rps': False, },
    'MP': {'names': ['northern_mariana_islands', 'Northern Mariana Islands', ],
           'rps': False, },
    'MS': {'names': ['mississippi', 'Mississippi', ], 'rps': False, },
    'MT': {'names': ['montana', 'Montana', ], 'rps': True,
           'green_energy': ['BMTCB', 'GETCB', 'HYTCB', 'SOTCB', 'WYTCB']},
    'NA': {'names': ['national', 'National', ], 'rps': False, },
    'ND': {'names': ['north_dakota', 'North Dakota', ], 'rps': False, },
    'NE': {'names': ['nebraska', 'Nebraska', ], 'rps': False, },
    'NH': {'names': ['new_hampshire', 'New Hampshire', ], 'rps': False, },
    'NM': {'names': ['new_mexico', 'New Mexico', ], 'rps': False, },
    'NV': {'names': ['nevada', 'Nevada', ], 'rps': True,
           'green_energy': ['BMTCB', 'GETCB', 'HYTCB', 'SOTCB', 'WYTCB']},
    'NJ': {'names': ['new_jersey', 'New Jersey', ], 'rps': True,
           'green_energy': ['BMTCB', 'GETCB', 'HYTCB', 'SOTCB', 'WYTCB']},
    'NC': {'names': ['north_carolina', 'North Carolina', ], 'rps': True,
           'green_energy': ['BMTCB', 'GETCB', 'HYTCB', 'SOTCB', 'WYTCB']},
    'NY': {'names': ['new_york', 'New York', ], 'rps': False, },
    'OH': {'names': ['ohio', 'Ohio', ], 'rps': True,
           'green_energy': ['BMTCB', 'GETCB', 'HYTCB', 'SOTCB', 'WYTCB']},
    'OK': {'names': ['oklahoma', 'Oklahoma', ], 'rps': False, },
    'OR': {'names': ['oregon', 'Oregon', ], 'rps': True,
           'green_energy': ['BMTCB', 'GETCB', 'HYTCB', 'SOTCB', 'WYTCB']},
    'PA': {'names': ['pennsylvania', 'Pennsylvania', ], 'rps': False, },
    'PR': {'names': ['puerto_rico', 'Puerto Rico', ], 'rps': False, },
    'RI': {'names': ['rhode_island', 'Rhode Island', ], 'rps': True,
           'green_energy': ['BMTCB', 'GETCB', 'HYTCB', 'SOTCB', 'WYTCB']},
    'SC': {'names': ['south_carolina', 'South Carolina', ], 'rps': False, },
    'SD': {'names': ['south_dakota', 'South Dakota', ], 'rps': False, },
    'TN': {'names': ['tennessee', 'Tennessee', ], 'rps': False, },
    'TX': {'names': ['texas', 'Texas', ], 'rps': False, },
    'UT': {'names': ['utah', 'Utah', ], 'rps': False, },
    'VA': {'names': ['virginia', 'Virginia', ], 'rps': False, },
    'VI': {'names': ['virgin_islands', 'Virgin Islands', ], 'rps': False, },
    'VT': {'names': ['vermont', 'Vermont', ], 'rps': False, },
    'WA': {'names': ['washington', 'Washington', ], 'rps': True,
           'green_energy': ['BMTCB', 'GETCB', 'HYTCB', 'SOTCB', 'WYTCB']},
    'WI': {'names': ['wisconsin', 'Wisconsin', ], 'rps': True,
           'green_energy': ['BMTCB', 'GETCB', 'HYTCB', 'SOTCB', 'WYTCB']},
    'WV': {'names': ['west_virginia', 'West Virginia', ], 'rps': False, },
    'WY': {'names': ['wyoming', 'Wyoming', ], 'rps': False, },
}


EIA_FUEL_SECTORS = [
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
    {'sector': 'Supp. Gaseous Fuels', 'code': 'SFTCB',
     'intensity': 9999},
    {'sector': 'Wind', 'code': 'WYTCB', 'intensity': 1},
    {'sector': 'Wood and Waste', 'code': 'WWTCB', 'intensity': 9999},
]