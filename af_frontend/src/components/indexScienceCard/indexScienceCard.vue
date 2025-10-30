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
    id: {
      type: Number,
      default: 0
    },
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
      default: 'https://cn.bing.com/',
    },
  },
  methods: {
    navigateHandler(href) {
      // 根据不同平台使用不同的导航方式
      try {
        // 检测是否为本地页面路径
        if (href.startsWith('/pages/')) {
          // 本地页面使用navigateTo跳转
          // #ifdef MP-WEIXIN || H5
          uni.navigateTo({
            url: href
          })
          // #endif
        } else {
          // 小程序环境使用内置浏览器打开外部链接
          // #ifdef MP-WEIXIN
          uni.navigateTo({
            url: `/pages-sub/scienceArticle/index?id=${this.id}&href=${encodeURIComponent(href)}`
          })
          // #endif
          
          // H5环境直接跳转外部链接
          // #ifdef H5
          if (href.startsWith('http')) {
            window.open(href, '_blank')
          } else {
            window.location.href = href
          }
          // #endif
        }
      } catch (error) {
        console.error('导航错误:', error)
        // 兜底方案：复制链接到剪贴板
        uni.setClipboardData({
          data: href,
          success: () => {
            uni.showModal({
              title: '提示',
              content: '文章链接已复制，请在浏览器中粘贴打开',
              showCancel: false
            })
          }
        })
      }
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
