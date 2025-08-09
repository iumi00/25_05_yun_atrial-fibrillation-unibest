<template>
  <view class="my_container">
    <view class="title">——{{ title }}——</view>
    <view class="text">
      {{ text }}
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: '综合建议',
  },
  text: {
    type: String,
    default: 'advice?',
  },
})
</script>

<style scoped lang="scss">
.my_container {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
}

.title {
  text-align: center;
  font-size: 30px;
  color: #00b050;
}

.text {
  margin-top: 20rpx;
  font-size: 22px;
}
</style>
