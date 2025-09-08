import { $http } from '@/service'

export function _api_getPopularizationArticle(header: { [key: string]: string }) {
  return $http.get(`/api/user/article`, {
    headers: { ...header },
  })
}
