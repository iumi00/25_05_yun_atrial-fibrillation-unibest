<!-- src/pages-sub/profile/index.vue -->
<route lang="json5">
{
  style: {
    navigationBarTitleText: '编辑个人资料',
  },
}
</route>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/store'
import { updateProfile as _api_updateProfile, updatePhone as _api_updatePhone } from '@/api/user' // 我们等下会创建这个文件
import { uploadFile as _api_uploadFile } from '@/api/upload' // 【新增】引入上传 API
import { toast } from '@/utils/toast'

const userStore = useUserStore()

// 1. 【新增】用一个独立的 ref 来管理头像的临时 URL
const avatarUrl = ref(userStore.userInfo.avatar)
const permanentAvatarUrl = ref(userStore.userInfo.avatar) // 【新增】用于保存永久 URL
// 创建响应式变量，并用 store 中已有的数据进行初始化
const nickname = ref(userStore.userInfo.nickname)
const phone = ref(userStore.userInfo.phone || '')

const isLoading = ref(false)

// 2. 【新增】处理头像选择事件的函数
async function onChooseAvatar(e: any) {
  const tempFilePath = e.detail.avatarUrl
  avatarUrl.value = tempFilePath // 更新预览

  try {
    toast.loading('正在上传头像...')
    // 调用上传接口
    const result = await _api_uploadFile(tempFilePath)
    if (result.url) {
      toast.success('上传成功！')
      // 保存返回的永久 URL
      permanentAvatarUrl.value = result.url
      console.log('✅ 头像上传成功，永久 URL:', permanentAvatarUrl.value);
    }
  } catch (error) {
    toast.error('头像上传失败')
    console.error(error);
  } finally {
    // 【新增】无论成功或失败，都隐藏 loading
    toast.hideLoading(); 
  }
}

// 3. 【新增】处理昵称输入框失去焦点事件（微信昵称填充后会触发）
function onNicknameBlur(e: any) {
    nickname.value = e.detail.value
}

// 【新增】处理手机号授权事件的函数
async function onGetPhoneNumber(e: any) {
  if (!e.detail.encryptedData) {
    toast.error('您已取消授权')
    return
  }

  try {
    // 调用后端接口，发送加密数据
    const res = await _api_updatePhone({
      encryptedData: e.detail.encryptedData,
      iv: e.detail.iv,
    })

    // 【修改】在这里添加类型断言
    // 我们告诉 TypeScript，我们期望 res.data 是一个包含 phone 属性的对象
    const responseData = res.data as { phone: string };

    if (responseData && responseData.phone) {
      toast.success('手机号获取成功！')
      // 现在可以安全地访问 responseData.phone
      phone.value = responseData.phone
      // 【注意】这里也要更新，因为 userStore.userInfo 的 phone 字段是可选的
      if (userStore.userInfo) {
        userStore.userInfo.phone = responseData.phone
      }
    }
  } catch (error) {
    console.error('获取手机号失败', error)
    toast.error(error.data?.message || '获取手机号失败，请重试')
  }
}

// 保存功能现在只保存昵称和头像
async function handleSave() {
  if (!nickname.value) {
    toast.error('昵称不能为空')
    return
  }

// 在真实项目中，这里应该先调用上传图片的接口
  // const permanentAvatarUrl = await uploadFile(avatarUrl.value)

  isLoading.value = true
  try {
    // 调用 API 将新数据发送到后端
     await _api_updateProfile({
      nickname: nickname.value,
      phone: phone.value,
      avatar: permanentAvatarUrl.value, // 使用永久 URL
    })

    // 更新成功后，同步更新 Pinia Store 中的数据
    userStore.setUserInfo({
      ...userStore.userInfo,
      nickname: nickname.value,
      phone: phone.value,
      avatar: permanentAvatarUrl.value, // 使用永久 URL
    })

    toast.success('保存成功')
    
    // 延时后返回上一页
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)

  } catch (error) {
    console.error('保存失败', error)
    toast.error('保存失败，请重试')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
   <view class="profile-container">
    <!-- 1. 头像选择 -->
    <button class="avatar-wrapper" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
      <image class="avatar-img" :src="avatarUrl"></image>
    </button>
    <view class="tip">点击上方修改头像</view>

    <!-- 2. 昵称输入 -->
    <view class="form-item">
      <text class="label">昵称</text>
      <!-- 使用 type="nickname" 的特殊输入框 -->
      <input
        class="input"
        type="nickname"
        v-model="nickname"
        placeholder="请输入或点击下方选择微信昵称"
        @blur="onNicknameBlur"
      />
    </view>
    
    <!-- 【修改】将手机号输入框恢复为可编辑状态 -->
    <view class="form-item">
      <text class="label">电话</text>
      <!-- 移除了 disabled 属性，并修改了 placeholder -->
      <input class="input" v-model="phone" type="number" placeholder="可手动输入或授权获取" />
    </view>
    
    <button
      class="phone-button"
      open-type="getPhoneNumber"
      @getphonenumber="onGetPhoneNumber"
    >
      <text class="iconfont"></text> 获取微信绑定手机号
    </button>

    <!-- 4. 保存按钮 (保持不变) -->
    <button class="save-button" @click="handleSave" :loading="isLoading">保 存</button>
  </view>
</template>

<style scoped lang="scss">
// 在 style 的最上方添加这些新样式
.avatar-wrapper {
  padding: 0;
  width: 150rpx !important;
  height: 150rpx;
  border-radius: 50%;
  margin: 30rpx auto;
  overflow: hidden;
  border: 4rpx solid #fff;
  box-shadow: 0 0 10rpx rgba(0,0,0,0.1);
  &::after {
    border: none;
  }
  .avatar-img {
    width: 100%;
    height: 100%;
  }
}
.tip {
  text-align: center;
  color: #999;
  font-size: 24rpx;
  margin-bottom: 40rpx;
}

.profile-container {
  padding: 30rpx;
  background-color: #f7f7f7;
  min-height: 100vh;
}
.form-item {
  display: flex;
  align-items: center;
  padding: 30rpx;
  background-color: #fff;
  border-bottom: 1rpx solid #eee;
  .label {
    width: 120rpx;
  }
  .input {
    flex: 1;
  }
}
.save-button {
  margin-top: 50rpx;
  background-color: #07c160;
  color: white;
}

.phone-button {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20rpx 0 40rpx;
  background-color: #07c160;
  color: white;
  .iconfont {
    margin-right: 10rpx;
  }
}
</style>