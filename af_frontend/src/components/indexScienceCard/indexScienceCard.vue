<template>
  <view class="my_container">
    <view class="content">
      <view class="text">
        <view class="title">{{ title }}</view>
        <view class="time">{{ time }}</view>
      </view>
      <view class="img">
        <image :src="src" mode="aspectFill"></image>
      </view>
    </view>
    <view class="arrow">></view>
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
      default: 'https://cn.bing.com/',
    },
  },
  methods: {
    navigateHandler() {
      // 检查href是否是内部页面路径还是外部链接
      if (this.href.startsWith('/')) {
        // 内部页面使用uni.navigateTo
        uni.navigateTo({
          url: this.href,
        })
      } else {
        // 外部链接使用uni.openURL
        uni.openURL({
          url: this.href,
        })
      }
    },
  },
}
</script>

<style scoped lang="scss">
$text-primary: #333;
$text-secondary: #666;
$text-tertiary: #999;
$border-radius: 16rpx;

.my_container {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  padding: 24rpx 30rpx;
  border-radius: $border-radius;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.3s ease;
  cursor: pointer;

  &:active {
    background-color: #f7f7f7;
  }

  .content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;
  }

  .text {
    display: flex;
    flex-direction: column;
    flex: 1;
    margin-right: 20rpx;
    min-width: 0;

    .title {
      font-size: $uni-font-size-base;
      font-weight: 600;
      color: $text-primary;
      margin-bottom: 10rpx;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.4;
    }

    .time {
      font-size: 24rpx;
      color: $text-tertiary;
    }
  }

  .img {
    box-sizing: border-box;
    width: 200rpx;
    height: 140rpx;
    overflow: hidden;
    border-radius: 12rpx;
    flex-shrink: 0;

    > image {
      width: 100%;
      height: 100%;
      border-radius: 12rpx;
      transition: transform 0.3s ease;
    }
  }

  .arrow {
    position: absolute;
    right: 30rpx;
    top: 50%;
    transform: translateY(-50%);
    color: #ccc;
    font-size: 32rpx;
    opacity: 0.6;
    transition: all 0.3s ease;
  }

  &:active .arrow {
    right: 25rpx;
  }
}
</style>
