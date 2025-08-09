<template>
  <view class="my_container">
    <view class="img" :style="imgClass" v-if="!icontext">
      <image :src="img" alt="" />
    </view>
    <view class="icon" :style="icon" v-else>
      <view class="iconfont" :style="iconsize">{{ icontext }}</view>
    </view>
    <view class="text" :style="custom_text">
      {{ text }}
    </view>
  </view>
</template>

<script>
export default {
  name: 'indexGridBoxes',
  data() {
    return {}
  },
  props: {
    img: {
      type: String,
      default: '/static/logo.png',
    },
    icontext: {
      type: String,
      // default: "\ue640",
      default: '',
    },
    text: {
      type: String,
      default: '测试',
    },
    width: {
      type: String,
      default: '100rpx',
    },
    height: {
      type: String,
      default: '160rpx',
    },
    fontBGColor: {
      type: String,
      default: 'white',
    },
    fontColor: {
      type: String,
      default: 'black',
    },
    border: {
      type: Boolean,
      default: true,
    },
    fontSize: {
      type: String,
      default: '16px',
    },
    textSize: {
      type: String,
      default: '16px',
    },
  },
  methods: {},
  computed: {
    imgClass() {
      return {
        'margin-bottom': '20rpx',
        'border-radius': '20px',
      }
    },
    icon() {
      return {
        'background-color': this.fontBGColor,
        'border-radius': '40%',
        color: this.fontColor,
      }
    },
    iconsize() {
      return {
        'font-size': this.fontSize,
      }
    },
    custom_text() {
      return {
        'font-size': this.textSize,
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.my_container {
  box-sizing: border-box;
  padding: 10rpx;
  width: 100%;
  height: 100%;
}

.img {
  position: relative;
  width: 100%;
  overflow: hidden;
  height: 0;
  padding-bottom: 100%;

  > image {
    position: absolute;
    width: 100%;
    height: 100%;
  }
}

.icon {
  position: relative;
  width: 100%;
  height: 0;
  padding-top: 100%;
  overflow: hidden;
  text-align: center;

  .iconfont {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    // font-size: 50px;
  }
}

.text {
  color: #676767;
  width: 100%;
  text-align: center;
}
</style>
