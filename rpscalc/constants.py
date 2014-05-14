#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Constants for RPC Calculator
"""

import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))


EIA_API_KEY = 'D82A092DA301308805ECAB18A123BB4A'


class RPSState(object):
    def __init__(self, short_name, long_name, rps=True, calculator=True,
                 green_energy=list()):
        self.names = [short_name, long_name]
        self.rps = rps
        self.calculator = calculator if rps else False
        if len(green_energy) < 1:
            self.green_energy = ['BMTCB', 'GETCB', 'HYTCB', 'SOTCB', 'WYTCB']
        else:
            self.green_energy = green_energy

    def remove_ge(self, ge):
        self.green_energy.pop(self.green_energy.index(ge))

    def add_ge(self, ge):
        self.green_energy.append(ge)


RPS_STATES = {
    'AK': RPSState('alaska', 'Alaska', rps=False),
    'AL': RPSState('alabama', 'Alabama', rps=False),
    'AR': RPSState('arkansas', 'Arkansas', rps=False),
    'AS': RPSState('american_samoa', 'American Samoa', rps=False),
    'AZ': RPSState('arizona', 'Arizona'),
    'CA': RPSState('california', 'California', calculator=False),
    'CO': RPSState('colorado', 'Colorado'),
    'CT': RPSState('connecticut', 'Connecticut'),
    'DC': RPSState('district_of_columbia', 'District of Columbia', rps=False),
    'DE': RPSState('delaware', 'Delaware'),
    'FL': RPSState('florida', 'Florida', rps=False),
    'GA': RPSState('georgia', 'Georgia', rps=False),
    'GU': RPSState('guam', 'Guam', rps=False),
    'HI': RPSState('hawaii', u'Hawai‘i'),
    'ID': RPSState('idaho', 'Idaho', rps=False),
    'IN': RPSState('indiana', 'Indiana', rps=False),
    'IL': RPSState('illinois', 'Illinois'),
    'IA': RPSState('iowa', 'Iowa'),
    'KS': RPSState('kansas', 'Kansas'),
    'KY': RPSState('kentucky', 'Kentucky', rps=False),
    'LA': RPSState('louisiana', 'Louisiana', rps=False),
    'MA': RPSState('massachusetts', 'Massachusetts', rps=False),
    'MD': RPSState('maryland', 'Maryland', calculator=False),
    'MI': RPSState('michigan', 'Michigan'),
    'ME': RPSState('maine', 'Maine'),
    'MN': RPSState('minnesota', 'Minnesota'),
    'MO': RPSState('missouri', 'Missouri'),
    'MP': RPSState('northern_mariana_islands', 'Northern Mariana Islands',
                   rps=False),
    'MS': RPSState('mississippi', 'Mississippi', rps=False),
    'MT': RPSState('montana', 'Montana'),
    'NA': RPSState('national', 'National', rps=False),
    'ND': RPSState('north_dakota', 'North Dakota', rps=False),
    'NE': RPSState('nebraska', 'Nebraska', rps=False),
    'NH': RPSState('new_hampshire', 'New Hampshire'),
    'NM': RPSState('new_mexico', 'New Mexico', calculator=False),
    'NV': RPSState('nevada', 'Nevada'),
    'NJ': RPSState('new_jersey', 'New Jersey'),
    'NC': RPSState('north_carolina', 'North Carolina'),
    'NY': RPSState('new_york', 'New York', calculator=False, ),
    'OH': RPSState('ohio', 'Ohio', calculator=False),
    'OK': RPSState('oklahoma', 'Oklahoma', rps=False),
    'OR': RPSState('oregon', 'Oregon', calculator=False),
    'PA': RPSState('pennsylvania', 'Pennsylvania'),
    'PR': RPSState('puerto_rico', 'Puerto Rico', rps=False),
    'RI': RPSState('rhode_island', 'Rhode Island'),
    'SC': RPSState('south_carolina', 'South Carolina', rps=False),
    'SD': RPSState('south_dakota', 'South Dakota', rps=False),
    'TN': RPSState('tennessee', 'Tennessee', rps=False),
    'TX': RPSState('texas', 'Texas'),
    'UT': RPSState('utah', 'Utah', rps=False),
    'VA': RPSState('virginia', 'Virginia', rps=False),
    'VI': RPSState('virgin_islands', 'Virgin Islands', rps=False),
    'VT': RPSState('vermont', 'Vermont', rps=False),
    'WA': RPSState('washington', 'Washington'),
    'WI': RPSState('wisconsin', 'Wisconsin'),
    'WV': RPSState('west_virginia', 'West Virginia', rps=False),
    'WY': RPSState('wyoming', 'Wyoming', rps=False),
}


RPS_STATES['AZ'].remove_ge('HYTCB')
RPS_STATES['IA'].add_ge('WWTCB')
RPS_STATES['MD'].add_ge('WWTCB')
RPS_STATES['MI'].add_ge('WWTCB')
RPS_STATES['ME'].add_ge('WWTCB')
RPS_STATES['MO'].add_ge('WWTCB')
RPS_STATES['NH'].add_ge('WWTCB')
RPS_STATES['NM'].add_ge('WWTCB')
RPS_STATES['OH'].add_ge('WWTCB')
RPS_STATES['OR'].add_ge('WWTCB')
RPS_STATES['WI'].add_ge('WWTCB')


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