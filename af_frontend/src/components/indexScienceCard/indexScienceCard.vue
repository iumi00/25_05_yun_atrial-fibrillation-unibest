<template>
  <view class="my_container" @click="navigateHandler(href)">
    <view class="text">
      <view class="title">
        {{ title }}
      </view>
      <view class="time">
        {{ time }}
      </view>
    </view>
    <view class="img">
      <image :src="src" mode="scaleToFill"></image>
    </view>
  </view>
</template>

<script>
export default {
  name: 'indexScienceCard',
  data() {
    return {}
  },
  props: {
    src: {
      type: String,
      default: '/static/logo.png',
    },
    title: {
      type: String,
      default: 'Title',
    },
    time: {
      type: String,
      default: 'time',
    },
    href: {
      type: String,
      default: `https: //cn.bing.com/`,
    },
  },
  methods: {
    navigateHandler(href) {
      uni.setClipboardData({
        data: href,
      })
      uni.showModal({
        content: '已自动复制网址，请在手机浏览器里粘贴该网址',
        showCancel: false,
      })
    },
  },
}
</script>

<style scoped lang="scss">
.my_container {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 0;
  min-height: 160rpx;
  padding: 30rpx;
  border-radius: 20rpx;
  display: flex;
  justify-content: space-between;

  .text {
    display: flex;
    flex-direction: column;
    justify-content: space-around;

    .title {
      font-size: $uni-font-size-lg;
    }

    .time {
      font-size: $uni-font-size-sm;
    }
  }

  .img {
    box-sizing: border-box;
    width: 40%;
    height: 100%;
    min-height: 100rpx;
    overflow: hidden;
    max-width: 120rpx;

    > image {
      width: 100%;
      height: 100%;
    }
  }
}
</style>
