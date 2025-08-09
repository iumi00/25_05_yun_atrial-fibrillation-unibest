import {
  login as _login,
  getUserInfo as _getUserInfo,
  wxLogin as _wxLogin,
  logout as _logout,
  getWxCode,
} from '@/api/login'
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { toast } from '@/utils/toast'
import { IUserInfoVo } from '@/api/login.typings'

// 初始化状态
const userInfoState: IUserInfoVo = {
  id: 0,
  username: '',
  avatar: '/static/images/default-avatar.png',
  token: '',
}

export const useUserStore = defineStore(
  'user',
  () => {
    // 定义用户信息
    const userInfo = ref<IUserInfoVo>({ ...userInfoState })
    // 设置用户信息
    const setUserInfo = (val: IUserInfoVo) => {
      console.log('设置用户信息', val)
      // 若头像为空 则使用默认头像
      if (!val.avatar) {
        val.avatar = userInfoState.avatar
      } else {
        val.avatar = 'https://oss.laf.run/ukw0y1-site/avatar.jpg?feige'
      }
      userInfo.value = val
    }
    const setUserAvatar = (avatar: string) => {
      userInfo.value.avatar = avatar
      console.log('设置用户头像', avatar)
      console.log('userInfo', userInfo.value)
    }
    // 删除用户信息
    const removeUserInfo = () => {
      userInfo.value = { ...userInfoState }
      uni.removeStorageSync('userInfo')
      uni.removeStorageSync('token')
    }
    /**
     * 用户登录
     * @param credentials 登录参数
     * @returns R<IUserLogin>
     */
    const login = async (credentials: {
      username: string
      password: string
      code: string
      uuid: string
    }) => {
      const res = await _login(credentials)
      console.log('登录信息', res)
      toast.success('登录成功')
      getUserInfo()
      return res
    }
    /**
     * 获取用户信息
     */
    const getUserInfo = async () => {
      const res = await _getUserInfo()
      const userInfo = res.data
      setUserInfo(userInfo)
      uni.setStorageSync('userInfo', userInfo)
      uni.setStorageSync('token', userInfo.token)
      // TODO 这里可以增加获取用户路由的方法 根据用户的角色动态生成路由
      return res
    }
    /**
     * 退出登录 并 删除用户信息
     */
    const logout = async () => {
      _logout()
      removeUserInfo()
    }
    /**
     * 微信登录 - 【已修改为我们自己的高效流程】
     */
    const wxLogin = async () => {
      try {
        // 步骤 1: 调用 api/login.ts 中的 getWxCode 获取 code
        const codeRes = await getWxCode()
        console.log('✅ [步骤1] 获取微信 Code 成功:', codeRes.code)

        // 步骤 2: 调用我们修改后的 wxLogin API，将 code 发送到我们自己的后端
        // _wxLogin 是从 api/login.ts 导入的 wxLogin 函数
        const loginRes = await _wxLogin({ code: codeRes.code })
        console.log('✅ [步骤2] 后端登录成功，返回:', loginRes)

        // 步骤 3: 直接使用后端返回的数据设置用户信息和 token
        // 注意：我们的后端接口设计得很好，一次性返回了所有需要的数据
        if (loginRes.data && loginRes.data.token) {
          // 从后端返回的数据中提取 userInfo 和 token
          const { userInfo, token } = loginRes.data;

          // 调用本 store 内的 setUserInfo 方法来更新状态
          setUserInfo({ ...userInfo, token });
          console.log('✅ [步骤3] 用户信息和 Token 已在 Pinia Store 中设置')

          return loginRes // 返回完整的后端响应
        } else {
          // 如果后端没有按预期返回数据，进行错误处理
          toast.error('登录凭证解析失败，请重试')
          return Promise.reject(loginRes)
        }
      } catch (error) {
        console.error('❌ 微信登录流程出错:', error)
        toast.error('登录请求失败，请检查网络或联系管理员')
        return Promise.reject(error)
      }
    }

    return {
      userInfo,
      login,
      wxLogin,
      getUserInfo,
      setUserAvatar,
      logout,
      setUserInfo,
    }
  },
  {
    persist: true,
  },
)
