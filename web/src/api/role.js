import $http from './global/http-client'

export function getProjectPermission(data) {
    return $http.post('/api/v1/roles/getProjectPermission', data)
}

