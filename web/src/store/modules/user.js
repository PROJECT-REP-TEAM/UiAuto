import { login, logout, getInfo, sendMsg, register, smsRecoverPassword, smsGetUsername } from '@/api/user'
import { getToken, setToken, removeToken } from '@/utils/auth'
import { resetRouter } from '@/router'

const state = {
  token: getToken(),
  name: '',
  avatar: ''
}

const mutations = {
  SET_TOKEN: (state, token) => {
    state.token = token
  },
  SET_NAME: (state, name) => {
    state.name = name
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar
  }
}

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo
    return new Promise((resolve, reject) => {
      login({ username: username.trim(), password: password }).then(response => {
        const { data } = response
        localStorage.setItem('access_token', `Bearer ${data.token}`)
        localStorage.setItem('user', JSON.stringify(data.user))
        // commit('SET_TOKEN', data.token)
        // setToken(data.token)
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token).then(response => {
        const { data } = response

        if (!data) {
          reject('Verification failed, please Login again.')
        }

        const { name, avatar } = data

        commit('SET_NAME', name)
        commit('SET_AVATAR', avatar)
        resolve(data)
      }).catch(error => {
        reject(error)
      })
    })
  },

  // user logout
  logout({ commit, state }) {
    return new Promise((resolve, reject) => {
      logout(state.token).then(() => {
        commit('SET_TOKEN', '')
        removeToken()
        resetRouter()
        resolve()
      }).catch(error => {
        reject(error)
      })
    })
  },

  // remove token
  resetToken({ commit }) {
    return new Promise(resolve => {
      commit('SET_TOKEN', '')
      removeToken()
      resolve()
    })
  },

  // user sendMsg
  sendMsg({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      sendMsg(data).then(() => { resolve() }).catch(error => {
        reject(error)
      })
    })
  },

  // user register
  register({ commit, state }, data) {
    const params = {
      username: data.username,
      password: data.password,
      mobile: data.phone,
      email: data.email,
      cerification_code: data.code
    }
    return new Promise((resolve, reject) => {
      register(params)
        .then(() => { resolve() })
        .catch(error => {
          reject(error)
        })
    })
  },

  // 重置密码
  smsRecoverPassword({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      smsRecoverPassword(data)
        .then(res => { resolve(res) })
        .catch(error => {
          reject(error)
        })
    })
  },

  // 获取用户名
  smsGetUsername({ commit, state }, data) {
    return new Promise((resolve, reject) => {
      smsGetUsername(data)
        .then(res => { resolve(res) })
        .catch(error => {
          reject(error)
        })
    })
  }


}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}

