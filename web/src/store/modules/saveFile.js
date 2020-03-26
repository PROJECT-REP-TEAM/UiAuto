const state = {
  value: false,
}

const mutations = {
  increment(state) {
    state.value = true
  },
  decrement(state) {
    state.value = false
  }
}

const actions = {}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
