import { ICaptcha, IUpdateInfo, IUpdatePassword, IUserInfoVo, IUserLogin } from './login.typings'
import { http } from '@/utils/http'

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
 * @returns ICaptcha 验证码
 */
export const getCode = () => {
  return http.get<ICaptcha>('/user/getCode')
}

/**
 * 用户登录
 * @param loginForm 登录表单
 */
export const login = (loginForm: ILoginForm) => {
  return http.post<IUserLogin>('/user/login', loginForm)
}

/**
 * 获取用户信息
 */
export const getUserInfo = () => {
  return http.get<IUserInfoVo>('/user/info')
}

/**
 * 退出登录
 */
export const logout = () => {
  return http.get<void>('/user/logout')
}

/**
 * 修改用户信息
 */
export const updateInfo = (data: IUpdateInfo) => {
  return http.post('/user/updateInfo', data)
}

/**
 * 修改用户密码
 */
export const updateUserPassword = (data: IUpdatePassword) => {
  return http.post('/user/updatePassword', data)
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
 * 微信登录参数
 */

/**
 * 微信登录
 * @param params 微信登录参数，包含code
 * @returns Promise 包含登录结果
 */
/**
 * 微信登录 - 【已修改为我们自己的后端】
 * @param data 包含从 getWxCode() 获取到的 code
 * @returns Promise 包含我们后端返回的 token 和 userInfo
 */
export const wxLogin = (data: { code: string }) => {
  // 注意：我们这里写了完整的 URL，因为 http 客户端的基础路径可能配置的是旧的后端地址。
  // 这样做可以确保请求一定发到我们自己的新后端服务上。
  return http.post<{ token: string; userInfo: IUserInfoVo }>(
    'http://localhost:3000/api/users/login',
    data,
  )
}
