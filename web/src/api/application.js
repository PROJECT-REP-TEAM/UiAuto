import $http from './global/http-client'

// 获取调度管理当前执行器的信息
export function myApplicationList(data) {
  return $http.get('/job/dispatch/rule/list', data)
}

// 获取当前执行器对应的执行器id
export function getActuatorId(data) {
  return $http.get('/job/dispatch/actuator/list', data)
}

// 获取应用市场
export function getStoreList(data) {
  return $http.get('/uiauto/script/storeList', data)
}

// 收藏
export function addCollect(data) {
  return $http.post('/uiauto/script/permission/addCollect', data)
}

// 取消收藏
export function cancleCollect(data) {
  return $http.delete('/uiauto/script/permission/cancleCollect', data)
}