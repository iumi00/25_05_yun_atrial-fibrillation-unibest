import { $http } from '@/service'

export function _api_getQuestionnaireList(data, headers = {}) {
  return $http.get('/api/user/question', { data, headers })
}

export function _api_commitData(data, headers) {
  return $http.post('/api/user/answer', data, { headers })
}

export function _api_delAnswer(id, headers) {
  return $http.delete(`/api/user/answer/${id}`, { headers })
}

export function _api_getMyQuestionnaireList(data, header) {
  return $http.post(`/api/user/answer/list`, data, header)
}

export function _api_getMyQuestionnaireDetail(data, header) {
  return $http.post(`/api/user/answer/detail`, data, header)
}
