/* eslint-disable no-param-reassign */
import qs from 'qs'
import { useUserStore } from '@/store'
import { platform } from '@/utils/platform'
import { getEnvBaseUrl } from '@/utils'

export type CustomRequestOptions = UniApp.RequestOptions & {
  query?: Record<string, any>
  /** 出错时是否隐藏错误提示 */
  hideErrorToast?: boolean
} & IUniUploadFileOptions // 添加uni.uploadFile参数类型

// 请求基准地址
const baseUrl = getEnvBaseUrl()

// 拦截器配置
const httpInterceptor = {
  // 拦截前触发
  invoke(options: CustomRequestOptions) {
    console.log('🚀 开始发送HTTP请求')
    
    // 接口请求支持通过 query 参数配置 queryString
    if (options.query) {
      const queryStr = qs.stringify(options.query)
      if (options.url.includes('?')) {
        options.url += `&${queryStr}`
      } else {
        options.url += `?${queryStr}`
      }
      console.log('📝 请求参数已添加到URL')
    }
    
    // 记录原始URL
    const originalUrl = options.url
    
    // 非 http 开头需拼接地址
    if (!options.url.startsWith('http')) {
      console.log('🔗 拼接基础URL到相对路径:', originalUrl)
      console.log('📡 使用的基础URL:', baseUrl)
      
      // #ifdef H5
      // console.log(__VITE_APP_PROXY__)
      if (JSON.parse(__VITE_APP_PROXY__)) {
        // 自动拼接代理前缀
        options.url = import.meta.env.VITE_APP_PROXY_PREFIX + options.url
        console.log('🌐 H5环境 - 使用代理前缀:', import.meta.env.VITE_APP_PROXY_PREFIX)
      } else {
        options.url = baseUrl + options.url
        console.log('🌐 H5环境 - 直接拼接基础URL')
      }
      // #endif
      // 非H5正常拼接
      // #ifndef H5
      options.url = baseUrl + options.url
      console.log('📱 非H5环境 - 拼接基础URL')
      // #endif
    }
    
    // 显示最终完整URL（验证端口）
    console.log('✅ 最终请求URL:', options.url)
    console.log('🔍 请求方法:', options.method || 'GET')
    
    // 1. 请求超时
    options.timeout = 10000 // 10s
    
    // 2. （可选）添加小程序端请求头标识
    options.header = {
      platform, // 可选，与 uniapp 定义的平台一致，告诉后台来源
      ...options.header,
    }
    
    // 3. 添加 token 请求头标识
    const userStore = useUserStore()
    // 直接从userInfo对象中获取token，避免类型错误
    const token = userStore.userInfo?.token
    if (token) {
      options.header.Authorization = `Bearer ${token}`
      console.log('🔑 请求已携带Authorization Token')
    }
    
    console.log('📤 请求准备就绪')
  },
}

export const requestInterceptor = {
  install() {
    // 拦截 request 请求
    uni.addInterceptor('request', httpInterceptor)
    // 拦截 uploadFile 文件上传
    uni.addInterceptor('uploadFile', httpInterceptor)
  },
}
