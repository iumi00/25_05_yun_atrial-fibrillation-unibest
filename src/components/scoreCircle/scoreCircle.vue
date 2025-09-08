<template>
  <view class="my_container">
    <view class="circle"></view>

    <view class="text">
      <view class="score">
        {{ score }}
      </view>

      <view class="type">
        {{ type }}
      </view>
    </view>
  </view>
</template>

<script setup>
const props = defineProps({
  type: {
    type: String,
    default: '出血风险总分',
  },
  score: {
    type: Number,
    default: 4,
  },
})
</script>

<style scoped lang="scss">
.my_container {
  position: relative;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.circle {
  position: absolute;
  top: 0;
  left: 0;
  width: calc(100% - 8px);
  height: 0;
  padding-bottom: 100%;
  border: 4px solid #6096e6;
  border-radius: 50%;
}

.text {
  position: absolute;
  top: 50%;
  left: 50%;
  width: fit-content;
  transform: translate(-50%, -50%);
  // background-color: pink;
  text-align: center;

  .score {
    color: #ff0000;
    font-size: 60px;
    font-weight: 600;

    &::after {
      content: '';
      display: block;
      width: 80%;
      border-bottom: 2px solid #929292;
      margin: 0 auto;
    }
  }

  .type {
    color: #00b050;
    font-size: 24px;
    margin-top: 30rpx;
    font-weight: 600;
    width: fit-content;
    white-space: nowrap;
  }
}
</style>
