import Vue from 'vue'

const state = {
  socketOnline: false,
  actuatorStatus: 'free',
  executing: false,
  toeknFail: false
}

const mutations = {
  ONLINE: (state, data) => {
    Vue.set(state, 'socketOnline', data.socketOnline)
  },
  ACTUATOR_STATUS: (state, data) => {
    Vue.set(state, 'actuatorStatus', data.actuatorStatus)
  },
  TOKEN_FAIL: (state, data) => {
    Vue.set(state, 'toeknFail', data.toeknFail)
  }
}

const actions = {

}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
