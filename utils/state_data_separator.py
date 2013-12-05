import json
import os
from utils.states import STATES

def state_separator():
    directory = '../static/js/state_data/'
    new_directory = '../static/js/data/'
    file = json.load(open(os.path.join(directory, 'state_data.json')))
    for state in file['features']:
        state['properties']['machine_name'] = STATES[state['properties']['abbr']][1]
        state['properties']['name'] = STATES[state['properties']['abbr']][0]
        with open(os.path.join(new_directory, '%s.json' % state['properties']['machine_name']), 'w') as f:
            f.write(json.dumps(
                state['properties'],
                indent=4, separators=(',', ': ')
            ))



if __name__ == '__main__':
    pass