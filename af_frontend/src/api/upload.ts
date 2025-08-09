// src/api/upload.ts
import { useUserStore } from '@/store'

const UPLOAD_URL = 'http://localhost:3000/api/upload' // 我们的上传接口地址

/**
 * 上传文件
 * @param filePath 文件的临时路径
 */
export const uploadFile = (filePath: string) => {
    const userStore = useUserStore()
    return new Promise<{ url: string }>((resolve, reject) => {
        uni.uploadFile({
            url: UPLOAD_URL,
            filePath: filePath,
            name: 'file', // 这个 name 必须和后端 upload.single('file') 一致
            header: {
                Authorization: userStore.userInfo.token, // 如果上传也需要认证
            },
            success: (res) => {
                if (res.statusCode === 200) {
                    const data = JSON.parse(res.data)
                    if (data.success) {
                        resolve(data.data)
                    } else {
                        reject(new Error(data.message || '上传失败'))
                    }
                } else {
                    reject(new Error(`上传失败，状态码: ${res.statusCode}`))
                }
            },
            fail: (err) => {
                reject(err)
            },
        })
    })
}