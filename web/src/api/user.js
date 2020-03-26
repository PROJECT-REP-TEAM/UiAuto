/*
 * @Author: Bobol_Lum
 * @LastEditors: Bobol_Lum
 * @Description: 用户相关接口
 * @Date: 2019-04-24 10:24:15
 * @LastEditTime: 2019-08-17 12:08:16
 */

import request from '@/utils/request'
import $http from './global/http-client'
import da from 'element-ui/src/locale/lang/da'
// import axios from '@/utils/http'; // 导入http中创建的axios实例
// import qs from 'qs'; // 根据需求是否导入qs模块

export function login(data) {
  // return request({
  //   url: '/user/login',
  //   method: 'post',
  //   data
  // })
  console.log('--------------login---------------')
  data.platform = 'uiauto'
  return $http.post('/api/v1/users/login/password', data)
}

export function getInfo(token) {
  return request({
    url: '/user/info',
    method: 'get',
    params: { token }
  })
}

export function logout() {
  return request({
    url: '/user/logout',
    method: 'post'
  })
}

export function sendMsg(data) {
  return $http.post('/api/v1/users/sendCerificationCode', data)
}

export function register(data) {
  return $http.post('/api/v1/users/smsRegister', data)
}
