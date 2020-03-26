import Vue from 'vue'
import _ from 'lodash'
import config from '@/config/environment/index'
const fs = window.require('fs')
const moment = window.require('moment')

const state = {
  projectDownload: {},
  localProjectLs: {},
  has_project_synchronize: false,
  browser: null,
  localProjectFoldersLs: {}
}

const mutations = {
  LOCAL_PROJECT: (state, data) => {
    Vue.set(state.localProjectLs, data.project_name, data)
  },
  PROJECT_DOWNLOAD: (state, data) => {
    Vue.set(state.projectDownload, data.project_name, data)
  },
  LOCAL_PROJECT_DELETE: (state, data) => {
    state.localProjectLs = _.omit(state.localProjectLs, data.project_name)
  },
  PROJECT_DOWNLOADDELETE: (state, data) => {
    state.projectDownload = _.omit(state.projectDownload, data.project_name)
  },
  HAS_PROJECT_SYNCHRONIZE: (has_python_downloading, data) => {
    Vue.set(state, 'has_project_synchronize', data)
  },
  BROWSER: (state, data) => {
    state.browser = data.browser_info
  },
  LOCAL_PROJECT_FOLDERS: (state, data) => {
    Vue.set(state.localProjectFoldersLs, data.folder_name, data)
  },
  LOCAL_PROJECT_FOLDER_DELETE: (state, data) => {
    state.localProjectFoldersLs = _.omit(state.localProjectFoldersLs, data.folder_name)
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
