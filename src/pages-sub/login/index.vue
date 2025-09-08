<route lang="json5">
{
  style: {
    // navigationStyle: 'custom',
    navigationBarTitleText: '登录',
  },
}
</route>

<template>
  <view class="container">
    <view class="logo">
      <image src="../../static/logo.png"></image>
    </view>
    <view class="title">
      <view class="mainTitle">房颤综合管理系统</view>
      <view class="subTitle">Atrial Fibrillation Comprehensive Management Platform</view>
    </view>
    <view class="form">
      <view class="phone">
        <input type="text" v-model="phone" placeholder="请输入手机号" />
      </view>
      <view class="pwd">
        <input type="text" v-model="pwd" placeholder="请输入密码" />
      </view>
      <view class="image">
        <view>
          <input type="text" v-model="verificationCode" placeholder="请输入验证码" />
          <view @click="imageClickHandler()">
            <image :src="verificationSrc" mode="scaleToFill"></image>
          </view>
        </view>
      </view>
      <button @click="login()">登 录</button>
    </view>
    <view class="options">
      <navigator url="/pages/register/register" open-type="redirect">我要注册</navigator>
      |
      <navigator url="/pages/forgetPwd/forgetPwd" open-type="redirect">忘记密码</navigator>
    </view>
    <view class="more2login">
      <view class="more_title">更多登录方式</view>
      <view class="icons">
        <view @click="wxLoginHandler">
          <image src="/static/icon/weixin.png" alt="" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { _api_getCaptcha, _api_login } from '@/service'

let phone = ref('13016648302')
let pwd = ref('123456Aa')
let verificationSrc = ref()
let verificationCode = ref()
let captchaId = ref()

const accessToken = uni.getStorageSync('accessToken')
const refreshToken = uni.getStorageSync('refreshToken')
const userId = uni.getStorageSync('userId')

if (accessToken && refreshToken && userId) {
  uni.reLaunch({
    url: '/pages/tabBar_index/tabBar_index',
  })
} else {
  imageClickHandler()
}

/**
 * 异步获取图片验证码
 *
 * 此函数通过发送GET请求到指定的API端点，获取图片验证码的URL
 * 获取到的URL会被赋值给verificationSrc，以便在前端页面中显示验证码图片
 */
async function getImageVerificationCode() {
  const captchaId = `${new Date().getTime()}__${Math.random()}`
  // 发送请求获取图片验证码
  const res = await _api_getCaptcha(captchaId)
  // 将获取到的验证码图片URL赋值给verificationSrc
  console.log(res)

  verificationSrc.value = res.data
  console.log(captchaId)
  return captchaId
}

/**
 * 异步函数，用于处理图片点击事件。
 * 主要功能是获取并更新图像验证码。
 */
async function imageClickHandler() {
  captchaId.value = await getImageVerificationCode()
}

/**
 * 异步登录函数
 *
 * 此函数负责处理用户登录逻辑，包括验证用户输入的电话号码、密码和验证码，
 * 并在成功登录后重定向用户到主页
 */
async function login() {
  // 调用登录API，传入用户输入的电话号码、密码和验证码
  // 使用await关键字等待API调用完成
  const res = await _api_login({
    phone: phone.value?.trim(),
    password: pwd.value?.trim(),
    captcha: verificationCode.value?.trim(),
    captchaId: captchaId.value,
  })
  // console.log(res);

  // 如果登录失败，则显示错误提示
  if (res.code == 0) {
    uni.showToast({
      title: res.msg || '账户或密码错误',
      icon: 'error',
    })
    return
  }

  // 将API返回的accessToken和refreshToken存储到本地缓存中
  uni.setStorageSync('accessToken', res.data.accessToken)
  uni.setStorageSync('refreshToken', res.data.refreshToken)
  uni.setStorageSync('userId', res.data.userId)
  uni.setStorageSync('openId', res.data.openid)

  // 从本地缓存中获取并打印accessToken和refreshToken，用于调试目的
  console.log('accessToken', uni.getStorageSync('accessToken'))
  console.log('refreshToken', uni.getStorageSync('refreshToken'))

  // 在登录成功后重新启动应用并导航到主页
  uni.reLaunch({
    url: '/pages/index/index',
  })
}

function wxLoginHandler() {
  console.log('wxLogin!!!')
  uni.login({
    success(res) {
      console.log(res)
    },
  })
}
</script>

<style scoped lang="scss">
.container {
  box-sizing: border-box;
  width: 100vw;
  height: 100vh;
  background-color: #f2f2f2;
  padding: 50rpx;
}

.logo {
  margin: 0 auto;
  width: 50%;
  padding-bottom: 50%;
  position: relative;

  > image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}

.title {
  text-align: center;
  color: #00b050;
  margin-top: 20rpx;
  border: 1px solid transparent;

  .mainTitle {
    font-size: 36px;
    font-weight: 500;
  }

  .subTitle {
    font-size: $uni-font-size-sm;
    font-weight: 600;
  }
}

.form {
  box-sizing: border-box;
  border: 1px solid transparent;
  margin-top: 50rpx;

  .phone,
  .pwd,
  .image {
    // background-color: pink;
    margin: 20rpx 0;
    height: 100rpx;
    line-height: 80rpx;

    input {
      height: 80rpx;
      line-height: 100rpx;
      padding-left: 30rpx;
      font-size: $uni-font-size-lg;
    }

    &::after {
      content: '';
      display: block;
      height: 0;
      border-bottom: 1px solid #c7c7c7;
      width: 90%;
      margin: 0 auto;
    }
  }

  .image {
    // background-color: blue;
    width: 100%;

    > view {
      display: flex;
      justify-content: space-between;
      height: 100%;

      input {
        display: block;
        width: 50%;
        // background-color: pink;
      }

      > view {
        width: 30%;
        height: 80%;
      }

      image {
        display: block;
        width: 100%;
        height: 100%;
        background-color: purple;
      }
    }
  }

  button {
    margin-top: 80rpx;
    background-color: #18ca85;
    border-radius: 50rpx;
    color: white;
    padding: 10rpx;
  }
}

.options {
  box-sizing: border-box;
  border: 1px solid transparent;
  color: #18ca85;
  display: flex;
  width: fit-content;
  margin: 0 auto;
  margin-top: 30rpx;

  > navigator {
    padding: 0 30rpx;
  }
}

.more2login {
  // background-color: pink;
  color: #c7c7c7;
  margin-top: 30rpx;
  box-sizing: border-box;
  border: 1px solid transparent;

  .more_title {
    text-align: center;
    box-sizing: border-box;
    border: 1px solid transparent;
  }

  .icons {
    box-sizing: border-box;
    border: 1px solid transparent;
    margin-top: 30rpx;
    display: flex;
    width: fit-content;
    margin: 0 auto;

    > view {
      image {
        width: 30px;
        height: 30px;
      }

      &::after {
        content: '';
        display: inline-block;
        height: 60%;
        border-right: 1px solid #c7c7c7;
        margin: 0 30rpx;
      }

      &:last-child::after {
        display: none;
      }
    }
  }
}
</style>
