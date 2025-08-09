// import { onLoad } from '@dcloudio/uni-app'
// import { needLoginPages as _needLoginPages, getNeedLoginPages } from '@/utils'
// import { useUserStore } from '@/store'

// const loginRoute = import.meta.env.VITE_LOGIN_URL
// const isDev = import.meta.env.DEV
// const isLogined = () => {
//   const userStore = useUserStore()
//   return !!userStore.userInfo.username
// }
// // 检查当前页面是否需要登录
// export function usePageAuth() {
//   onLoad((options) => {
//     // 获取当前页面路径
//     const pages = getCurrentPages()
//     const currentPage = pages[pages.length - 1]
//     const currentPath = `/${currentPage.route}`

//     // 获取需要登录的页面列表
//     let needLoginPages: string[] = []
//     if (isDev) {
//       needLoginPages = getNeedLoginPages()
//     } else {
//       needLoginPages = _needLoginPages
//     }

//     // 检查当前页面是否需要登录
//     const isNeedLogin = needLoginPages.includes(currentPath)
//     if (!isNeedLogin) {
//       return
//     }

//     const hasLogin = isLogined()
//     if (hasLogin) {
//       return true
//     }

//     // 构建重定向URL
//     const queryString = Object.entries(options || {})
//       .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
//       .join('&')

//     const currentFullPath = queryString ? `${currentPath}?${queryString}` : currentPath
//     const redirectRoute = `${loginRoute}?redirect=${encodeURIComponent(currentFullPath)}`

//     // 重定向到登录页
//     uni.redirectTo({ url: redirectRoute })
//   })
// }
import { useUserStore } from '@/store'

/**
 * 页面认证 Hook - 【已重构为应用启动时自动登录】
 *
 * 这个 Hook 在 App.vue 的 onLaunch 中被调用，是整个应用认证流程的唯一入口。
 * 我们已经彻底重构了它，抛弃了旧的页面跳转认证逻辑。
 * 现在，它的唯一职责就是：在应用启动时，执行我们自己的 wxLogin 流程。
 */
export function usePageAuth() {
  // 1. 获取用户状态管理的 store 实例
  const userStore = useUserStore()

  // 2. 打印日志，方便调试，确认认证入口已被执行
  console.log('✅ [Auth Entry] 已进入应用认证入口，准备执行自动登录流程...')

  // 3. 【核心】不再做任何复杂的、旧的判断，
  //    直接、无条件地调用我们已经写好完整逻辑的 wxLogin action。
  //    这个 action 内部会处理好所有事情（获取code、请求后端、保存token）。
  userStore.wxLogin()
}