/*
 * @Author: Bobol_Lum
 * @LastEditors: chenzy
 * @Description:
 * @Date: 2019-05-10 09:12:58
 * @LastEditTime: 2019-05-22 10:10:43
 */

import $http from './global/http-client'

export function pluginList(data) {
  return $http.get('/uiauto/plugin/pluginList', data)
}

export function historyPluginList(data) {
  return $http.get('/uiauto/plugin/list', data)
}

export function pluginViews(data) {
  return $http.get('/uiauto/plugin/view', data)
}

export function getCloudProjects(data) {
  return $http.post('/uiauto/script/getCloudProjects', data)
}
