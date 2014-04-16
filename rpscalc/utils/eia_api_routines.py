from rpscalc.eia_api.views import state_gridmix, state_retail
from rpscalc.constants import RPS_STATES


def get_all_gridmix():
    for s in RPS_STATES.keys():
        state_gridmix(s)


def get_all_retail():
    for s in RPS_STATES.keys():
        state_retail(s)


def get_state_gridmix(s):
    state_gridmix(s)


def get_state_retail(s):
    state_retail(s)


def get_all_data():
    for s in RPS_STATES.keys():
        state_retail(s)
        state_gridmix(s)




if __name__ == '__main__':
    # get_all_gridmix()
    get_state_gridmix('NM')
    get_state_retail('NM')