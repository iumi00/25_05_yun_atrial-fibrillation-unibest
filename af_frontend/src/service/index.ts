/*
import {$http} from '@/utils/myRequest'
import wait from "@/utils/wait"

uni.$http = $http
// 配置请求根路径
$http.baseUrl = import.meta.env.VITE_API_URL
console.log('baseUrl', $http.baseUrl);

// $http.baseUrl = 'http://xxx'
// uni.$apiKey = 'xxxxxxxxx'

// 请求开始之前做一些事情
$http.beforeRequest = function (options) {
  uni.showLoading({
    title: '数据加载中...',
  })
}

let isFreshing = false
// 请求完成之后做一些事情
$http.afterRequest = async function (res, resolve, reject) {
  uni.hideLoading()
  console.log('isFreshing', isFreshing);
  // 如果token过期了就用refreshToken刷新
  if (res.statusCode == 200) {
    // console.log('rrrtest', res);
    resolve(res.data)
  } else {
    if (isFreshing == true) {
      return
    }
    console.log('endRequest', res);

    let refreshToken = uni.getStorageSync(
      'refreshToken')
    console.log('refreshToken', refreshToken);
    if (refreshToken == "" || refreshToken ==
      undefined) {
      uni.removeStorageSync('refreshToken')
      uni.removeStorageSync('accessToken')
      uni.removeStorageSync("userId");
      uni.removeStorageSync("openId");
      uni.showToast({
        title: "登录过期",
        icon: "error"
      })
      isFreshing = false;
      await wait(500)
      uni.reLaunch({
        url: "/pages/login/login"
      })
      reject()
    } else if (isFreshing == false) {
      isFreshing = true

      // console.log(2222222);
      try {
        const response = await uni.$http.get(
          '/api/user/user/refreshToken', {}, {
            refreshToken
          })
        // console.log('refreshTokenResponse', response);
        uni.setStorageSync('accessToken', response.data)
        await wait(200)
        // 获取当前失败的请求
        let config = res.config
        // 重发
        // console.log(33333333333);
        const newRes = await uni.request({
          url: config.url,
          method: config.method,
          data: config.data,
          header: {accessToken: response.data}
        })
        isFreshing = false
        // console.log(newRes);
        resolve(newRes.data)

      } catch (err) {
        console.log('errrrrrr', err);
        uni.removeStorageSync('refreshToken')
        uni.removeStorageSync('accessToken')
        uni.showToast({
          title: "登录过期",
          icon: "error"
        })
        isFreshing = false;
        await wait(500)
        uni.reLaunch({
          url: "/pages/login/login"
        })
      }

    }
  }

  reject(res)


}
 */
import { _getRequest } from '@/utils/myRequest'

// 获取正确的后端地址
const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL
  console.log('原始VITE_API_URL:', envUrl)
  
  // 检查URL是否有效
  if (!envUrl || envUrl === 'undefined' || envUrl === 'null') {
    console.log('环境变量VITE_API_URL无效，使用默认地址')
    return 'http://localhost:3000'
  }
  
  // 如果环境变量指向Apifox，则使用本地后端
  if (envUrl.includes('apifoxmock.com')) {
    console.log('检测到Apifox地址，使用本地后端')
    return 'http://localhost:3000'
  }
  
  // 验证URL格式
  try {
    new URL(envUrl)
    console.log('使用环境变量中的地址:', envUrl)
    return envUrl
  } catch (error) {
    console.log('环境变量URL格式无效，使用默认地址')
    return 'http://localhost:3000'
  }
}

const baseUrl = getBaseUrl()
console.log('最终使用的后端地址:', baseUrl)

// todo: 更改各个请求方法以适配 $http(axios)
export const $http = _getRequest(baseUrl)
// 配置拦截器
$http.interceptors.request.use(
  (config) => {
    console.log('发送请求到:', config.url)
    console.log('请求方法:', config.method)
    console.log('请求参数:', config.params)
    console.log('请求头:', config.headers)
    
    return config
  },
  (error) => {
    console.error('请求拦截器错误:', error)
    return Promise.reject(error)
  }
)
$http.interceptors.response.use(
  (res) => {
    console.log('收到响应:', res)
    return res.data
  },
  (err) => {
    console.error('API请求错误:', err)
    console.error('错误详情:', err.response)
    return Promise.reject(err)
  },
)

export * from './myService/sys'
export * from './myService/user'
export * from './myService/questionnaire'
export * from './myService/popularization'
export * from './myService/measurement'
