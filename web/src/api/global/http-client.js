/*
 * @Author: Bobol_Lum
 * @LastEditors: Please set LastEditors
 * @Description: 接口点用公用方法 & 异常处理
 * @Date: 2019-05-09 11:06:54
 * @LastEditTime: 2019-07-25 10:18:42
 */

/**
 * axios封装
 * 请求拦截、响应拦截、错误统一处理
 */
import axios from 'axios'
import _ from 'lodash'
import environment from '@/config/environment'
// import CryptoJS from "crypto-js";
import {
  Message,
  MessageBox
} from 'element-ui'
import * as schedule from "../../schedule";
console.log(environment)
import store from '@/store'
import {
  toLogin
} from '@/utils/auth'

/**
 * 提示函数
 * 禁止点击蒙层、显示一秒后关闭
 */
const tip = msg => {
  Message.error(msg)
}

// /**
//  * 跳转登录页
//  * 携带当前页面路由，以期在登录页面完成登录后返回当前页面
//  */
// const toLogin = async () => {
//   // 关闭定时任务
//   schedule.stopAllJob();
//   // 清除执行器运行状态
//   store.commit('socket/ACTUATOR_STATUS', {
//     actuatorStatus: 'free'
//   })
//   setTimeout(() => {
//     const target = window.location.href.substring(0, _.indexOf(window.location.href, '#') - 1)
//     window.location.href = target
//   }, 1000);
// }

/**
 * 请求失败后的错误统一处理
 * @param {Number} status 请求失败的状态码
 */
const errorHandle = (status, other) => {
  // 状态码判断
  switch (status) {
    // 401: 未登录状态，跳转登录页
    case 401:
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      toLogin()
      break
      // 402 已在别的客户端登录
      // 清除token并跳转登录页
    case 402:
      store.commit('socket/TOKEN_FAIL', {
        toeknFail: true
      })
      MessageBox.alert('已在其他客户端登陆，请重新登录', '提示', {
        confirmButtonText: '确定',
        callback: action => {
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
          toLogin()
        }
      });
      break
      // 403 token过期
      // 清除token并跳转登录页
    case 403:
      store.commit('socket/TOKEN_FAIL', {
        toeknFail: true
      })
      MessageBox.alert('用户登录信息已过期，请重新登录', '提示', {
        confirmButtonText: '确定',
        callback: action => {
          localStorage.removeItem('access_token')
          localStorage.removeItem('user')
          toLogin()
        }
      });
      break
      // 404请求不存在
    case 404:
      tip('请求的资源不存在')
      break
    case 405:
      tip('请求的资源不存在')
      break
      // 408请求超时
    case 408:
      tip('请求的资源超时')
      break
    case 503:
      tip('网络连接异常')
      break
    default:
      tip(`未知错误：${other}`)
      console.log(other)
  }
}

// 创建axios实例
var instance = axios.create({
  timeout: 1000 * 12
})
// 设置post请求头
instance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
/**
 * 请求拦截器
 * 每次请求前，如果存在token则在请求头中携带token
 */
instance.interceptors.request.use(
  config => {
    // 登录流程控制中，根据本地是否存在token判断用户的登录情况
    // 但是即使token存在，也有可能token是过期的，所以在每次的请求头中携带token
    // 后台根据携带的token判断用户的登录情况，并返回给我们对应的状态码
    // 而后我们可以在响应拦截器中，根据状态码进行一些统一的操作。
    const token = localStorage.getItem('access_token')
    console.log('token', token)
    // const token = store.state.token;
    if (token) {
      config.headers.Authorization = token
      config.headers['X-Access-Token'] = token.split('Bearer ')[1]
    }
    return config
  },
  error => {
    console.error(error) // for debug
    return Promise.reject(error)
  })

// 响应拦截器
instance.interceptors.response.use(
  // 请求成功
  res => res.status === 200 ? Promise.resolve(res) : Promise.reject(res),
  // 请求失败
  error => {
    const {
      response
    } = error
    if (response) {
      // 请求已发出，但是不在2xx的范围
      errorHandle(response.status, response.data.message)
      return Promise.reject(response)
    } else {
      tip('数据请求失败，请检查网络状况!');
      // 处理断网的情况
      // eg:请求超时或断网时，更新state的network状态
      // network状态在app.vue中控制着一个全局的断网提示组件的显示隐藏
      // 关于断网组件中的刷新重新获取数据，会在断网组件中说明
      // store.commit('changeNetwork', false);
    }
  })

var $http = {
  get: (url, params) => {
    return new Promise((resolve, reject) => {
      instance.get(`${environment.serverUrl}${url}`, {
          params: params
        })
        .then(res => {
          resolve(res.data)
        })
        .catch(err => {
          reject(err.data)
        })
    })
  },
  post: (url, params, options) => {
    // if (!!options && options.encrypt) {
    //   const dateLabel = _.reverse(moment().format("YYYY@MM@DD").split("")).join("")
    //   let pwd = CryptoJS.SHA512(dateLabel)
    //   pwd = CryptoJS.enc.Hex.stringify(pwd)
    //   let iv = CryptoJS.SHA256(dateLabel)
    //   iv = CryptoJS.enc.Hex.stringify(iv)
    //   const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(params), pwd, {
    //     mode: CryptoJS.mode.CBC,
    //     pad: CryptoJS.pad.Pkcs7,
    //     iv: iv
    //   })
    //   params = {
    //     data: encryptedData.toString()
    //   }
    // }
    return new Promise((resolve, reject) => {
      console.log(`${environment.serverUrl}${url}`)
      instance.post(`${environment.serverUrl}${url}`, params)
        .then(res => {
          console.log(res)
          resolve(res.data)
        })
        .catch(err => {
          console.log(err)
          reject(err.data)
        })
    })
  },
  delete: (url, params, options) => {
    return new Promise((resolve, reject) => {
      console.log(`${environment.serverUrl}${url}`)
      instance.delete(`${environment.serverUrl}${url}`, {
          params: params
        })
        .then(res => {
          console.log(res)
          resolve(res.data)
        })
        .catch(err => {
          console.log(err)
          reject(err.data)
        })
    })
  }
}

export default $http

// export default instance;
