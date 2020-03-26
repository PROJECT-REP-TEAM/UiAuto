/*
 * @Author: chenzy
 * @LastEditors: chenzy
 * @Date: 2019-08-17 12:17:01
 * @LastEditTime: 2019-08-26 15:38:49
 * @Description: file content
 */
import Vue from 'vue'
import _ from "lodash"

const state = {
    tab: null,
    refresh: 0,
    pluginStatus: {},
    pluginDownload: {},
    has_python_downloading: false,
    has_all_plugin_downloading: false
}

const mutations = {
    TO_REFRESH: (state) => {
        state.refresh++
    },
    PLUGIN_STATUS: (state, data) => {
        Vue.set(state.pluginStatus, data.plugin_id, data)
    },
    PLUGIN_DOWNLOAD: (state, data) => {
        Vue.set(state.pluginDownload, data.plugin_id, data)
        // let tempData = Object.assign({},state[data.plugin_id],data); 
        // state[data.id] = tempData;
    },
    PLUGIN_DOWNLOADDELETE: (state, data) => {
        state.pluginDownload = _.omit(state.pluginDownload, data)
    },
    MARK_PYTHON_DOWNLOADING: (has_python_downloading, data) => {
        Vue.set(state, 'has_python_downloading', data);
    },
    ALL_PLUGIN_DOWNLOADING: (has_all_plugin_downloading, data) => {
        Vue.set(state, 'has_all_plugin_downloading', data);
    },

}

const actions = {
    refreshPugin({ commit }) {
        commit('TO_REFRESH')
    },
    pluginDownload({ commit }, data) {
        commit('PLUGIN_DOWNLOAD', data)
    },
    pluginDownloadDelete({ commit }, data) {
        commit('PLUGIN_DOWNLOADDELETE', data)
    },
    pluginStatus({ commit }, data) {
        commit('PLUGIN_STATUS', data)
    },
    markPythonDownloading({ commit }, data) {
        commit('MARK_PYTHON_DOWNLOADING', data)
    },
    allPluginDownloading({ commit }, data) {
        commit('ALL_PLUGIN_DOWNLOADING', data)
    }
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}
