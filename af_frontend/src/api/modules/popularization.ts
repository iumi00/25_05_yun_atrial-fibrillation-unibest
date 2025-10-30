// 健康教育相关API
import { apiRequest } from '../config'
import { IResData } from '../types'

/**
 * 健康教育文章
 */
export interface HealthArticle {
  id: number
  title: string
  content: string
  coverImage?: string
  publishTime: string
  readCount?: number
  category?: string
}

/**
 * 获取健康教育文章列表
 * @param header 请求头信息
 * @returns 文章列表
 */
// Mock数据，用于开发测试
export const mockHealthArticles: HealthArticle[] = [
  {
    id: 1,
    title: '房颤的早期识别与预防',
    content: '房颤是常见的心律失常，早期识别和预防非常重要...',
    publishTime: '2024-09-10',
    readCount: 156
  },
  {
    id: 2,
    title: '房颤患者的日常生活管理',
    content: '房颤患者在日常生活中需要注意的事项...',
    publishTime: '2024-09-05',
    readCount: 234
  },
  {
    id: 3,
    title: '房颤治疗的新进展',
    content: '近年来，房颤治疗领域有许多新的进展...',
    publishTime: '2024-08-28',
    readCount: 312
  }
]

export const getPopularizationArticle = async (header: { [key: string]: string } = {}) => {
  console.log('📚 获取健康教育文章(使用真实API)')
  // 直接调用真实API，不使用mock数据作为后备
  const response = await apiRequest.get<IResData<HealthArticle[]>>('/api/article', undefined, header)
  return response
}