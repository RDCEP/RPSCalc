STATES = {
    'AK': ['Alaska', 'alaska'],
    'AL': ['Alabama', 'alabama'],
    'AR': ['Arkansas', 'arkansas'],
    'AS': ['American Samoa', 'american_samoa'],
    'AZ': ['Arizona', 'arizona'],
    'CA': ['California', 'california'],
    'CO': ['Colorado', 'colorado'],
    'CT': ['Connecticut', 'connecticut'],
    'DC': ['District of Columbia', 'district_of_columbia'],
    'DE': ['Delaware', 'delaware'],
    'FL': ['Florida', 'florida'],
    'GA': ['Georgia', 'georgia'],
    'GU': ['Guam', 'guam'],
    'HI': ['Hawaii', 'hawaii'],
    'IA': ['Iowa', 'iowa'],
    'ID': ['Idaho', 'idaho'],
    'IL': ['Illinois', 'illinois'],
    'IN': ['Indiana', 'indiana'],
    'KS': ['Kansas', 'kansas'],
    'KY': ['Kentucky', 'kentucky'],
    'LA': ['Louisiana', 'louisiana'],
    'MA': ['Massachusetts', 'massachusetts'],
    'MD': ['Maryland', 'maryland'],
    'ME': ['Maine', 'maine'],
    'MI': ['Michigan', 'michigan'],
    'MN': ['Minnesota', 'minnesota'],
    'MO': ['Missouri', 'missouri'],
    'MP': ['Northern Mariana Islands', 'northern_mariana_islands'],
    'MS': ['Mississippi', 'mississippi'],
    'MT': ['Montana', 'montana'],
    'NA': ['National', 'national'],
    'NC': ['North Carolina', 'north_carolina'],
    'ND': ['North Dakota', 'north_dakota'],
    'NE': ['Nebraska', 'nebraska'],
    'NH': ['New Hampshire', 'new_hampshire'],
    'NJ': ['New Jersey', 'new_jersey'],
    'NM': ['New Mexico', 'new_mexico'],
    'NV': ['Nevada', 'nevada'],
    'NY': ['New York', 'new_york'],
    'OH': ['Ohio', 'ohio'],
    'OK': ['Oklahoma', 'oklahoma'],
    'OR': ['Oregon', 'oregon'],
    'PA': ['Pennsylvania', 'pennsylvania'],
    'PR': ['Puerto Rico', 'puerto_rico'],
    'RI': ['Rhode Island', 'rhode_island'],
    'SC': ['South Carolina', 'south_carolina'],
    'SD': ['South Dakota', 'south_dakota'],
    'TN': ['Tennessee', 'tennessee'],
    'TX': ['Texas', 'texas'],
    'UT': ['Utah', 'utah'],
    'VA': ['Virginia', 'virginia'],
    'VI': ['Virgin Islands', 'virgin_islands'],
    'VT': ['Vermont', 'vermont'],
    'WA': ['Washington', 'washington'],
    'WI': ['Wisconsin', 'wisconsin'],
    'WV': ['West Virginia', 'west_virginia'],
    'WY': ['Wyoming', 'wyoming'],
}


def abbr_to_short(directory):
    import os
    [
        os.rename(os.path.join(directory, f), '%s/%s.%s' % (directory, STATES[f.split('.')[0]][1], f.split('.')[1]))
        for f in os.listdir(directory) if not f.startswith('.')
    ]


if __name__ == '__main__':
    pass