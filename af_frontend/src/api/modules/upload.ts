// 文件上传相关API
import { useUserStore } from '@/store'
import { baseUrl } from '../config'

/**
 * 上传结果数据
 */
export interface UploadResult {
  url: string
  filename: string
  size: number
  type: string
}

/**
 * 上传文件
 * @param filePath 文件的临时路径
 * @returns Promise 包含上传结果
 */
export const uploadFile = (filePath: string): Promise<UploadResult> => {
  const userStore = useUserStore()
  const uploadUrl = `${baseUrl}/api/upload`
  
  console.log('📤 上传文件:', filePath)
  console.log('🔗 上传地址:', uploadUrl)
  console.log('🔑 使用Token:', userStore.userInfo?.token ? '已提供' : '未提供')
  
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: uploadUrl,
      filePath: filePath,
      name: 'file', // 这个 name 必须和后端 upload.single('file') 一致
      header: {
        Authorization: userStore.userInfo?.token,
      },
      success: (res) => {
        console.log('📥 上传响应:', res)
        
        if (res.statusCode === 200) {
          try {
            const data = JSON.parse(res.data)
            if (data.success || data.code === 200) {
              resolve({
                url: data.data.url || data.url,
                filename: data.data.filename || data.filename || '',
                size: data.data.size || data.size || 0,
                type: data.data.type || data.type || '',
              })
            } else {
              reject(new Error(data.message || data.msg || '上传失败'))
            }
          } catch (error) {
            console.error('📝 解析响应失败:', error)
            reject(new Error('上传响应格式错误'))
          }
        } else {
          reject(new Error(`上传失败，状态码: ${res.statusCode}`))
        }
      },
      fail: (err) => {
        console.error('❌ 上传失败:', err)
        reject(err)
      },
    })
  })
}