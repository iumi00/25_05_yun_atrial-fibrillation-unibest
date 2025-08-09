// src/api/user.ts
import { http } from '@/utils/http'
import { useUserStore } from '@/store'

interface IProfileData {
    nickname: string
    phone: string
    avatar: string // 【新增】添加 avatar 字段
}

/**
 * 更新用户个人资料
 * @param data 包含 nickname 和 phone
 */
// src/api/user.ts

export const updateProfile = (data: IProfileData) => {
    const userStore = useUserStore()
    // 【新增日志】打印一下我们准备要发送的 token
    console.log('🔵 [前端发送前] updateProfile 即将使用的 Token:', userStore.userInfo.token);
    return http.put(
        'http://localhost:3000/api/users/profile', // 1. url
        data,                                     // 2. data
        undefined,                                // 3. query (我们没有，所以传 undefined)
        {                                         // 4. header (现在在正确的位置了！)
            Authorization: userStore.userInfo.token,
        },
    )
}

interface IPhoneData {
    encryptedData: string
    iv: string
}

/**
 * 发送加密数据到后端以更新手机号
 */
// src/api/user.ts

export const updatePhone = (data: IPhoneData) => {
    const userStore = useUserStore()
    // 【新增日志】打印一下我们准备要发送的 token
    console.log('🔵 [前端发送前] updatePhone 即将使用的 Token:', userStore.userInfo.token);
    // http.post 的参数顺序和 http.put 是一样的
    return http.post(
        'http://localhost:3000/api/users/phone', // 1. url
        data,                                    // 2. data
        undefined,                               // 3. query
        {                                        // 4. header
            Authorization: userStore.userInfo.token,
        },
    )
}