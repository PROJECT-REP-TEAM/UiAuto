import Vue from 'vue'
import _ from "lodash"
const fs = window.require("fs");
const os = window.require("os");
const path = window.require("path");
import config from "@/config/environment/index";

const state = {
    node: {
        isdownloaded: os.arch() == "x64" ? (fs.existsSync(path.normalize(
            config.pluginsPath + "/.." + "/dependencies/node-v10.16.0-x64.msi"
        )) ? true : false) : (fs.existsSync(path.normalize(
            config.pluginsPath + "/.." + "/dependencies/node-v10.16.0-x86.msi"
        )) ? true : false),
        downloading: false,
        filePath: os.arch() == "x64" ? (fs.existsSync(path.normalize(
            config.pluginsPath + "/.." + "/dependencies/node-v10.16.0-x64.msi"
        )) ? path.normalize(
            config.pluginsPath + "/.." + "/dependencies/node-v10.16.0-x64.msi"
        ) : '') : (fs.existsSync(path.normalize(
            config.pluginsPath + "/.." + "/dependencies/node-v10.16.0-x86.msi"
        )) ? path.normalize(
            config.pluginsPath + "/.." + "/dependencies/node-v10.16.0-x86.msi"
        ) : ''),
        installing: false,
        installed: false
    },
    python: {
        isdownloaded: true,
        downloading: false,
        filePath: path.normalize(
            config.pluginsPath + "/.." + "/dependencies/Python3.6.8_20190816.zip"
        ),
        installing: false,
        installed: false
    },
    chrome: {
        isdownloaded: fs.existsSync(path.normalize(
            config.pluginsPath + "/.." + "/plugins/ChromeSetup.exe"
        )) ? true : false,
        downloading: false,
        filePath: '',
        installing: false,
        installed: false
    },
    selenium: {
        isdownloaded: false,
        downloading: false,
        installing: false,
        installed: false
    }
}

const mutations = {
    DEPENDENCY_DOWNLOAD: (state, data) => {
        data = _.assign(state[data.name], data);
        Vue.set(state, data.name, data)
    },

}

const actions = {
    dependencyDownload({ commit }, data) {
        commit('DEPENDENCY_DOWNLOAD', data)
    },
}

export default {
    namespaced: true,
    state,
    mutations,
    actions
}
