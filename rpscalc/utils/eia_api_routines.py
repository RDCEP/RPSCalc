from rpscalc.eia_api.views import state_gridmix, state_retail
from rpscalc.constants import RPS_STATES


def get_all_gridmix():
    for s in  RPS_STATES:
        state_gridmix(s[2])


def get_all_retail():
    for s in  RPS_STATES:
        state_retail(s[2])


def get_all_data():
    for s in  RPS_STATES:
        state_retail(s[2])
        state_gridmix(s[2])


if __name__ == '__main__':
    get_all_data()