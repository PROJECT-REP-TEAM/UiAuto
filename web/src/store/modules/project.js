import Vue from 'vue'
import _ from 'lodash'
import config from '@/config/environment/index'
const fs = window.nodeRequire('fs')
const moment = window.nodeRequire('moment')

const state = {
  projectDownload: {},
  localProjectLs: {},
  has_project_synchronize: false,
  browser: null,
  localProjectFoldersLs: {},
  projectByFolder: [],
}

const mutations = {
  PROJECT_BY_FOLDER: (state, data) => {
    state.projectByFolder = data
  },
  ADD_PROJECT_BY_FOLDER: (state, data) => {
    // state.projectByFolder.some(v => {
    //   if( v.folderName === data ){

    //   }
    //   console.log("ADD_PROJECT_BY_FOLDER")
    //   console.log(v)
    // })
    // if (state.projectByFolder.some(v => v.path === data.path)) 
    return
    // let tempData = Object.assign({},state[data.plugin_id],data); 
    // state[data.id] = tempData;
  },
  DEL_PROJECT_BY_FOLDER: (state, data) => {
    for (const [i, v] of state.projectByFolder.entries()) {
      if (v.path === data.path) {
        state.projectByFolder.splice(i, 1)
        break
      }
    }
  },
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
