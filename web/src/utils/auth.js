import Cookies from 'js-cookie'
import * as schedule from "../schedule";
import store from '@/store'

const TokenKey = 'vue_admin_template_token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  return Cookies.set(TokenKey, token)
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}

/**
 * 跳转登录页
 * 携带当前页面路由，以期在登录页面完成登录后返回当前页面
 */
export function toLogin() {
    // 关闭定时任务
    schedule.stopAllJob();
    // 清除执行器运行状态
    store.commit('socket/ACTUATOR_STATUS', {
      actuatorStatus: 'free'
    })
    setTimeout(() => {
      const target = window.location.href.substring(0, _.indexOf(window.location.href, '#') - 1)
      window.location.href = target
    }, 1000);
}
