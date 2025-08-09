import { $http } from '@/service'

export function _api_getCaptcha(id) {
  return $http.get('/api/user/captcha', {
    params: { id },
  })
}

/**
 * 登录
 * @param {Object} data
 * @param {string} data.phone
 * @param {string} data.password
 * @param {string} data.captcha
 * @param {string} data.captchaId
 * @returns
 */
export function _api_login(data) {
  return $http.post('/api/user/user/login', data)
}

export function _api_registerByPhone(data, header = {}) {
  return $http.post('/api/user/user/register', data, header)
}

export function _api_registerByWeChat(data, header = {}) {
  return $http.post('/api/user/user/wechat/login', data, header)
}

export function _api_getUserInfo(headers) {
  return $http.get('/api/user/user', { headers: { ...headers } })
}

export function _api_modifyUserInfo(data, header = {}) {
  return $http.put('/api/user/user', data, header)
}

export function _api_delUser(data, headers = {}) {
  return $http.delete('/api/user/user', {
    data,
    headers,
  })
}

export function _api_logOut(data, header = {}) {
  return $http.post('/api/user/user/logout', data, header)
}

export function _api_getImageVerificationCode(id: string) {
  return $http.get('/api/user/captcha', {
    params: { id },
  })
}

export function _api_getPhoneVerificationCode(phone: string) {
  return $http.post(`/api/user/sms/send?phone=${phone}`)
}

export function _api_refreshAccessToken(headers) {
  return $http.get('/api/user/user/refreshToken', { headers })
}
