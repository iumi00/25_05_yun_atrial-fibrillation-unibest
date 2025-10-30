import { http } from '@/utils/http'

// 获取正确的后端地址
export const getBaseUrl = (): string => {
  console.log('🔍 开始获取API基础URL (api/config.ts)')
  const envUrl = import.meta.env.VITE_API_URL
  console.log('📡 原始VITE_API_URL环境变量:', envUrl)
  
  // 检查URL是否有效
  if (!envUrl || envUrl === 'undefined' || envUrl === 'null') {
    console.log('❌ 环境变量VITE_API_URL无效，使用默认地址: http://localhost:8000')
    return 'http://localhost:8000'
  }
  
  // 如果环境变量指向Apifox，则使用本地后端
  if (envUrl.includes('apifoxmock.com')) {
    console.log('🔄 检测到Apifox地址，切换使用本地后端: http://localhost:8000')
    return 'http://localhost:8000'
  }
  
  // 验证URL格式
  try {
    new URL(envUrl)
    console.log('✅ 使用环境变量中的地址:', envUrl)
    return envUrl
  } catch (error) {
    console.log('❌ 环境变量URL格式无效，使用默认地址: http://localhost:8000')
    return 'http://localhost:8000'
  }
}

// 配置基础URL
const baseUrl = getBaseUrl()
console.log('最终使用的后端地址:', baseUrl)

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