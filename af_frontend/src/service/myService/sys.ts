import { $http } from '@/service'

export function _api_getSysAnnouncement(headers) {
  return $http.get(`/api/user/Announce`, { headers })
}
