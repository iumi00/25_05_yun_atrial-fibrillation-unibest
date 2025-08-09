<route lang="json5">
{
  style: {
    // navigationStyle: 'custom',
    navigationBarTitleText: '注册',
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
      <p class="tips pwd-tip">请输入至少8位密码，包含数字与大小写字母</p>
      <view class="image">
        <view>
          <input type="text" v-model="code" placeholder="请输入验证码" />
          <view @click="getCode()" v-if="!getCodeFlag">获取验证码</view>
          <view v-else :class="{ active: getCodeFlag }">{{ seconds }} 重新获取</view>
        </view>
      </view>
      <button @click="register()">注 册</button>
    </view>
    <view class="options">
      <navigator url="/pages/login/login" open-type="redirect">已有帐号</navigator>
      |
      <navigator url="/pages/forgetPwd/forgetPwd" open-type="redirect">忘记密码</navigator>
    </view>
  </view>
</template>

<script setup lang="ts">
import { _api_getPhoneVerificationCode, _api_registerByPhone } from '@/service'
import wait from '@/utils/wait'
import { isValidPhoneNumber } from '@/utils/regs'

let phone = ref('')
let pwd = ref('')
let code = ref()
let getCodeFlag = ref(false)
let seconds = ref(180)
let timer

async function getCode() {
  if (!isValidPhoneNumber(phone.value)) {
    uni.showToast({
      title: '请输入正确的手机号',
      icon: 'error',
    })
    return
  }

  const res = _api_getPhoneVerificationCode(phone.value)

  getCodeFlag.value = true

  timer = setInterval(() => {
    if (seconds.value <= 0) {
      getCodeFlag.value = false
      seconds.value = 180
      clearInterval(timer)
      return
    }
    seconds.value--
  }, 1000)
}

async function register() {
  console.log(phone)
  console.log(pwd)
  console.log(code)

  // uni.reLaunch({
  // 	url: "/pages/tabBar_index/tabBar_index"
  // })
  console.log(111111)

  const res = await _api_registerByPhone({
    phone: phone.value,
    password: pwd.value,
    code: code.value,
  })
  // let res = {
  // 	code: 1,
  // };
  // console.log(res);
  await wait(1000)
  if (res.code == 0) {
    uni.showToast({
      title: res.msg || '注册失败',
      icon: 'error',
    })
    return
  } else {
    uni.showToast({
      title: '注册成功',
      icon: 'success',
      duration: 2000,
    })
    setTimeout(() => {
      uni.redirectTo({
        url: '/pages/login/login',
      })
    }, 2000)
  }
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
        width: fit-content;
        height: 80%;
        // background-color: pink;
        color: #18ca85;

        &.active {
          color: gray;
        }
      }
    }
  }

  .pwd-tip {
    margin-top: -20rpx;
    margin-left: 40rpx;
    font-size: $uni-font-size-sm;
    color: #25d08d;
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
