// import Cookies from 'js-cookie'

// var input = []

// var output = {}

const state = {
  node: {
    key: null,
    plugin_id: null,
    operation_id: null,
    input: [],
    output: {}
  },
  values: [],
  myDiagram: null
}

const mutations = {
  // REFRESH_EDITOR: (state, node) => {
  //   state.node = node;
  // }
}

const actions = {}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
