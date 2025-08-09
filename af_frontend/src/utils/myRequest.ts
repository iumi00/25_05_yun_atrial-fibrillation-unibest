import axios from 'axios'
import { UniAdapter } from 'uniapp-axios-adapter'

// 创建一个新的axios实例
export const _getRequest = (baseURL: string) => {
  return axios.create({
    baseURL,
    timeout: 10000,
    adapter: UniAdapter, // 指定适配器
  })
}
