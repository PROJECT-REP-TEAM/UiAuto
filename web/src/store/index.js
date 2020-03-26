/*
 * @Author: chenzy
 * @LastEditors: chenzy
 * @Date: 2019-07-04 13:48:52
 * @LastEditTime: 2019-08-21 02:44:10
 * @Description: file content
 */
import Vue from 'vue'
import Vuex from 'vuex'
import getters from './getters'
import app from './modules/app'
import settings from './modules/settings'
import user from './modules/user'
import flowchart from './modules/flowchart'
import plugin from './modules/plugin'
import project from './modules/project'
import socket from './modules/socket'
import tagsView from './modules/tagsView'
import dependency from './modules/dependency'
import saveFile from './modules/saveFile.js'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    app,
    settings,
    user,
    flowchart,
    plugin,
    project,
    socket,
    tagsView,
    dependency,
    saveFile
  },
  getters
})

export default store
