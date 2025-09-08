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
          <text>{{ score }}</text>
          <text>分</text>
        </template>
        <text v-else>暂无</text>
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
.my_container {
  box-sizing: border-box;
  width: 100%;
  min-height: 100rpx;
  border-radius: 20rpx;
  padding: 16rpx;
}

.title {
  width: 100%;

  > view {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .mainTitle {
    font-size: $uni-font-size-base;
  }

  .subTitle {
    font-size: 10px;
  }
}

.subText {
  margin-top: 20rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .iconfont {
    font-size: 36px;
    margin-left: 10rpx;
    // background: linear-gradient(#caff55 20%, #45cd00 60%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .score {
    > text:last-child {
      font-size: $uni-font-size-sm;
      color: #dfe2e4;
      margin-left: 8rpx;
    }
  }
}
</style>
