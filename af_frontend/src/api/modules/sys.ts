// 系统相关API
import { apiRequest } from '../config'
import { IResData } from '../types'

/**
 * 获取系统公告
 * @param headers 请求头信息
 * @returns 系统公告列表
 */
export const getSysAnnouncement = (headers = {}) => {
  console.log('📢 获取系统公告')
  return apiRequest.get<IResData<any[]>>('/api/user/Announce', undefined, headers)
}