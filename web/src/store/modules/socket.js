import Vue from 'vue';

const state = {
    socketOnline: false
}

const mutations = {
    ONLINE: (state, data) => {
        Vue.set(state, 'socketOnline', data.socketOnline)
    },
}

const actions = {

}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}
