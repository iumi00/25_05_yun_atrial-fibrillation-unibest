// 用户信息相关API
import { apiRequest } from '../config'
import { IResData, UserInfo } from '../types'
import { useUserStore } from '@/store'

/**
 * 用户个人资料数据
 */
export interface IProfileData {
  nickname: string
  phone: string
  avatar: string
}

/**
 * 更新用户信息
 */
export interface IUpdateInfo {
  id: number
  name: string
  sex: string
}

/**
 * 更新密码信息
 */
export interface IUpdatePassword {
  id: number
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

/**
 * 手机号更新数据
 */
export interface IPhoneData {
  encryptedData: string
  iv: string
}

/**
 * 更新用户个人资料
 * @param data 包含 nickname、phone 和 avatar
 */
export const updateProfile = (data: IProfileData) => {
  const userStore = useUserStore()
  console.log('👤 更新用户资料: /api/users/profile')
  console.log('🔑 使用Token:', userStore.userInfo?.token ? '已提供' : '未提供')
  
  return apiRequest.put<IResData<void>>('/api/users/profile', data, undefined, {
    Authorization: userStore.userInfo?.token,
  })
}

/**
 * 更新手机号
 * @param data 包含加密的手机号数据
 */
export const updatePhone = (data: IPhoneData) => {
  const userStore = useUserStore()
  console.log('📱 更新手机号: /api/users/phone')
  console.log('🔑 使用Token:', userStore.userInfo?.token ? '已提供' : '未提供')
  
  return apiRequest.post<IResData<void>>('/api/users/phone', data, undefined, {
    Authorization: userStore.userInfo?.token,
  })
}

/**
 * 修改用户基本信息
 * @param data 用户信息
 */
export const updateUserInfo = (data: IUpdateInfo) => {
  console.log('✏️ 修改用户信息: /api/user/updateInfo')
  return apiRequest.post<IResData<void>>('/api/user/updateInfo', data)
}

/**
 * 修改用户密码
 * @param data 密码信息
 */
export const updateUserPassword = (data: IUpdatePassword) => {
  console.log('🔒 修改用户密码: /api/user/updatePassword')
  return apiRequest.post<IResData<void>>('/api/user/updatePassword', data)
}

/**
 * 通过手机号注册
 * @param data 注册信息
 */
export const registerByPhone = (data: any, header = {}) => {
  console.log('📝 手机号注册: /api/user/user/register')
  return apiRequest.post<IResData<void>>('/api/user/user/register', data, undefined, header)
}

/**
 * 获取手机验证码
 * @param phone 手机号
 */
export const getPhoneVerificationCode = (phone: string) => {
  console.log('📱 获取手机验证码:', phone)
  return apiRequest.post<IResData<void>>(`/api/user/sms/send?phone=${phone}`)
}

/**
 * 删除用户
 * @param data 删除用户数据
 */
export const deleteUser = (data: any, headers = {}) => {
  console.log('🗑️ 删除用户')
  return apiRequest.delete<IResData<void>>('/api/user/user', { data, headers })
}