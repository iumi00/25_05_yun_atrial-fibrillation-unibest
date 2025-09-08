<template>
  <view class="my_container">
    <view class="title" :style="TitleStyle">
      <view class="mainTitle">{{ mainTitle }}</view>
      <view class="subTitle">{{ subTitle }}</view>
    </view>
    <view class="subText">
      <view class="iconfont" :style="iconStyle">
        {{ icontext }}
      </view>
      <view class="score">
        <template v-if="score">
          <text class="score-number">{{ score }}</text>
          <text class="score-unit">分</text>
        </template>
        <text class="no-score">暂无</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'indexScoreList',
  data() {
    return {}
  },
  props: {
    mainTitle: {
      type: String,
      default: 'mainTitle',
    },
    subTitle: {
      type: String,
      default: 'subTitle',
    },
    icontext: {
      type: String,
      default: `\ue636`,
    },
    score: {
      type: String,
    },
    iconColor: {
      type: String,
      default: 'linear-gradient(#caff55 20%, #45cd00 60%)',
    },
  },
  computed: {
    TitleStyle() {
      return {
        color: '#23cf8f',
      }
    },
    iconStyle() {
      return {
        background: this.iconColor,
        '-webkit-background-clip': 'text',
        '-webkit-text-fill-color': 'transparent',
      }
    },
  },
}
</script>

<style scoped lang="scss">
$primary-color: #33d596;
$text-primary: #333;
$text-secondary: #666;
$text-tertiary: #999;

.my_container {
  box-sizing: border-box;
  width: 100%;
  min-height: 100rpx;
  border-radius: 16rpx;
  padding: 20rpx;
  transition: all 0.3s ease;
}

.title {
  width: 100%;
  margin-bottom: 10rpx;

  > view {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .mainTitle {
    font-size: $uni-font-size-base;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 4rpx;
  }

  .subTitle {
    font-size: 24rpx;
    color: $text-tertiary;
  }
}

.subText {
  margin-top: 10rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .iconfont {
    font-size: 52rpx;
    margin-left: 10rpx;
    transition: transform 0.3s ease;
  }

  .iconfont:active {
    transform: scale(1.1);
  }

  .score {
    display: flex;
    align-items: baseline;
    background-color: #f0f7ff;
    padding: 4rpx 16rpx;
    border-radius: 20rpx;
  }

  .score-number {
    font-size: 48rpx;
    font-weight: 700;
    color: $primary-color;
  }

  .score-unit {
    font-size: $uni-font-size-sm;
    color: $text-secondary;
    margin-left: 8rpx;
  }

  .no-score {
    font-size: $uni-font-size-base;
    color: $text-tertiary;
    background-color: #f7f7f7;
    padding: 4rpx 16rpx;
    border-radius: 20rpx;
  }
}
</style>
