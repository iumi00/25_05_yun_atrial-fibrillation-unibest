<template>
  <view class="my_container">
    <view class="title">{{ index }}、{{ title }}</view>
    <view class="btn">
      <radio-group name="" @change="Changehandler">
        <label @click="handlerBtn1">
          <radio :value="score" />
          <view :class="{ active: activeFlag1 === true }">是</view>
        </label>
        <label @click="handlerBtn2">
          <radio :value="0" />
          <view :class="{ active: activeFlag2 === true }">否</view>
        </label>
      </radio-group>
    </view>
  </view>
  <view class="test" v-if="props.debugger">
    {{ scroingList }}
  </view>
</template>

<script setup lang="ts">
import useScroingData from '../../store/scroing'
import { storeToRefs } from 'pinia'

const scroingData = useScroingData()
const { scroingList } = storeToRefs(scroingData)
// console.log(scroingList);

const props = defineProps({
  title: {
    type: String,
    default: '题目：哈哈哈哈哈哈',
  },
  score: {
    type: Number,
    default: 1,
  },
  index: {
    type: Number,
    default: 10,
  },
  debugger: {
    type: Boolean,
    default: false,
  },
})

let activeFlag1 = ref(false)
let activeFlag2 = ref(false)

function Changehandler(e) {
  const index = props.index
  scroingData.changeScroingList(index, parseFloat(e.detail.value))
  console.log(scroingList.value)
}

function handlerBtn1() {
  activeFlag1.value = true
  activeFlag2.value = false
}

function handlerBtn2() {
  activeFlag1.value = false
  activeFlag2.value = true
}
</script>

<style scoped lang="scss">
.my_container {
  // background-color: pink;
  box-sizing: border-box;
  width: 100%;
  padding: 20rpx;
}

.title {
  font-size: 18px;
}

.btn {
  margin-top: 20rpx;

  radio-group {
    display: flex;
    justify-content: space-around;

    radio {
      display: none;
    }
  }

  label {
    display: inline-block;
    width: 45%;

    view {
      box-sizing: border-box;
      background-color: #f6f6f6;
      padding: 20rpx 0;
      border-radius: 10rpx;
      text-align: center;
    }

    .active {
      background-color: #18ca85;
      color: white;
    }
  }
}
</style>
