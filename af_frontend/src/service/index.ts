import { _getRequest } from '@/utils/myRequest'

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL

  if (!envUrl || envUrl === 'undefined' || envUrl === 'null') {
    return 'http://localhost:3000'
  }

  if (envUrl.includes('apifoxmock.com')) {
    return 'http://localhost:3000'
  }

  try {
    new URL(envUrl)
    return envUrl
  } catch (error) {
    return 'http://localhost:3000'
  }
}

const baseUrl = getBaseUrl()
export const $http = _getRequest(baseUrl)
uni.$http = $http

$http.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

$http.interceptors.response.use(
  (res) => {
    return res.data
  },
  (err) => {
    return Promise.reject(err)
  },
)

export * from './myService/sys'
export * from './myService/user'
export * from './myService/questionnaire'
export * from './myService/popularization'
export * from './myService/measurement'
