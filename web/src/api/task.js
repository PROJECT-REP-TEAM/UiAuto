import $http from './global/http-client'

export function taskList(data) {
    return $http.post('/api/v1/tasks/list', data)
}

export function editTask(data) {
    return $http.post('/api/v1/tasks/edit', data)
}

export function uploadTask(data) {
    return $http.post('/api/v1/tasks/synchronize/upload', data)
}

