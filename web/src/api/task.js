import $http from './global/http-client'

export function taskList(data) {
  return $http.get('/job/dispatch/task/list', data)
}

export function editTask(data) {
  return $http.post('/api/v1/tasks/edit', data)
}

export function uploadTask(data) {
  return $http.post('/api/v1/tasks/synchronize/upload', data)
}

export function updateCron(data) {
  return $http.post('/api/v1/tasks/updateCron', data)
}

// uiauto详细日志
export function uiautoLogList(data) {
  return $http.get('/job/dispatch/log/list', data)
}

export function updateLog(data) {
  return $http.post('/api/v1/uiautoLogs/updateLog', data)
}
