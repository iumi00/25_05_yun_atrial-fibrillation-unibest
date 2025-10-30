// 用户认证相关API
import { apiRequest } from '../config'
import { IResData, LoginParams, LoginResult, UserInfo } from '../types'

/**
 * 登录表单
 */
export interface ILoginForm {
  username: string
  password: string
  code: string
  uuid: string
}

/**
 * 获取验证码
 */
export const getCode = () => {
  console.log('📞 请求验证码: /api/user/getCode')
  return apiRequest.get<IResData<{ captchaEnabled: boolean; uuid: string; image: string }>>('/api/user/getCode')
}

/**
 * 用户登录
 * @param loginForm 登录表单
 */
export const login = (loginForm: ILoginForm) => {
  console.log('🔐 用户登录: /api/user/login')
  return apiRequest.post<IResData<LoginResult>>('/api/user/login', loginForm)
}

/**
 * 获取用户信息
 */
export const getUserInfo = () => {
  console.log('👤 获取用户信息: /api/user/info')
  return apiRequest.get<IResData<UserInfo>>('/api/user/info')
}

/**
 * 退出登录
 */
export const logout = () => {
  console.log('🚪 用户退出登录: /api/user/logout')
  return apiRequest.get<IResData<void>>('/api/user/logout')
}

/**
 * 获取微信登录凭证
 * @returns Promise 包含微信登录凭证(code)
 */
export const getWxCode = () => {
  return new Promise<UniApp.LoginRes>((resolve, reject) => {
    uni.login({
      provider: 'weixin',
      success: (res) => resolve(res),
      fail: (err) => reject(new Error(err)),
    })
  })
}

/**
 * 微信登录
 * @param data 包含从 getWxCode() 获取到的 code
 */
export const wxLogin = (data: { code: string }) => {
  console.log('📱 微信登录: /api/users/login')
  return apiRequest.post<IResData<{ token: string; userInfo: UserInfo }>>('/api/users/login', data)
}

/**
 * 刷新访问令牌
 * @param refreshToken 刷新令牌
 */
export const refreshAccessToken = (refreshToken: string) => {
  console.log('🔄 刷新访问令牌: /api/user/user/refreshToken')
  return apiRequest.get<IResData<{ accessToken: string }>>('/api/user/user/refreshToken', undefined, {
    refreshToken
  })
}