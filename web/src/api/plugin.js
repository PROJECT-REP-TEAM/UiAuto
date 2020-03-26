/*
 * @Author: Bobol_Lum
 * @LastEditors: chenzy
 * @Description: 
 * @Date: 2019-05-10 09:12:58
 * @LastEditTime: 2019-05-22 10:10:43
 */

import $http from './global/http-client'

export function pluginList(data) {
  !data.attributes && (data.attributes = ["language", "plugin_id", "plugin_name", "author", "version", "plugin_description", "attachment_md5", "updatedAt"])
  return $http.post('/api/v1/plugins/base/user/list', data)
}

export function pluginViews(data) {
  !data.attributes && (data.attributes = ["language", "plugin_id", "plugin_name", "author", "version", "plugin_description", "attachment_md5", "updatedAt"])
  return $http.post('/api/v1/plugins/base/user/views', data)
}

export function getCloudProjects(data) {
  return $http.post('/api/v1/uiautoClients/getCloudProjects', data)
}
