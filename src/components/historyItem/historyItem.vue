<template>
  <view class="my_container">
    <view class="top">
      <view class="time">
        <text class="iconfont">&#xe630;</text>
        <text>{{ time }}</text>
      </view>

      <view class="operate">查看></view>
    </view>

    <view class="bottom">
      <view class="type">{{ type }}</view>

      <view class="score">
        <text>总分：</text>
        <text>{{ score }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  time: {
    type: String,
    default: '2024-09-27 18:30:02',
  },
  type: {
    type: String,
    default: '血栓风险评分',
  },
  score: {
    type: Number,
    default: 4,
  },
})
</script>

<style scoped lang="scss">
.my_container {
  box-sizing: border-box;
  padding: 40rpx 20rpx;
  width: 100%;
  height: 100%;
}

.top {
  display: flex;
  justify-content: space-between;

  .time {
    .iconfont {
      font-size: 30px;
      margin-right: 10rpx;
    }

    & {
      font-size: 20px;
    }
  }

  .operate {
    color: #7f7f7f;
    font-size: 20px;
  }
}

.bottom {
  display: flex;
  justify-content: space-between;
  margin-top: 20rpx;

  .type {
    font-size: 26px;
    font-weight: 600;
  }

  .score {
    > text {
      font-size: 26px;
      color: #c00000;
    }
  }
}
</style>
