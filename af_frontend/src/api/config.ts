import { http } from '@/utils/http'
import { getEnvBaseUrl } from '@/utils/index'

// 统一使用utils中的getEnvBaseUrl函数获取基础URL，避免重复逻辑
// 配置基础URL
const baseUrl = getEnvBaseUrl()

// 创建带基础URL的请求方法
export const apiRequest = {
  get: <T>(url: string, query?: Record<string, any>, header?: Record<string, any>) => {
    return http<T>({
      url: `${baseUrl}${url}`,
      query,
      method: 'GET',
      header,
    })
  },
  
  post: <T>(url: string, data?: Record<string, any>, query?: Record<string, any>, header?: Record<string, any>) => {
    return http<T>({
      url: `${baseUrl}${url}`,
      data,
      query,
      method: 'POST',
      header,
    })
  },
  
  put: <T>(url: string, data?: Record<string, any>, query?: Record<string, any>, header?: Record<string, any>) => {
    return http<T>({
      url: `${baseUrl}${url}`,
      data,
      query,
      method: 'PUT',
      header,
    })
  },
  
  delete: <T>(url: string, query?: Record<string, any>, header?: Record<string, any>) => {
    return http<T>({
      url: `${baseUrl}${url}`,
      query,
      method: 'DELETE',
      header,
    })
  }
}

// 导出基础URL供其他地方使用
export { baseUrl }