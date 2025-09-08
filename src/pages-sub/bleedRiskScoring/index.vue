<route lang="json5">
{
  style: {
    // navigationStyle: 'custom',
    navigationBarTitleText: '出血风险评分',
  },
}
</route>

<script setup lang="ts">
import scroingItemVue from '@/components/scroingItem/scroingItem.vue'
import useScroingData from '@/store/scroing'
import { storeToRefs } from 'pinia'
import { _api_commitData, _api_getQuestionnaireList } from '@/service'

const accessToken = uni.getStorageSync('accessToken')
const scroingData = useScroingData()
// 重置评分数据
scroingData.resetScroingList()
let { score, scroingList } = storeToRefs(scroingData)

let list = ref([])
let length = ref(0)

async function getQuestionnaireList(type) {
  const res = await _api_getQuestionnaireList({ type })
  console.log('getQuestionnaireList', res)
  list.value = res.data
  length.value = res.data.length
}

async function commitData() {
  console.log(scroingList.value)
  console.log(length.value)

  for (let i = 1; i < length.value + 1; i++) {
    console.log(scroingList.value[i])
    if (scroingList.value[i] == undefined) {
      uni.showToast({
        title: '请完成所有题目',
        icon: 'error',
      })
      return
    }
  }

  uni.showLoading({
    title: '提交中',
  })
  let list = {}
  for (let i = 1; i < length.value + 1; i++) {
    console.log(scroingList.value[i])
    if (scroingList.value[i] == 0) {
      list[i] = '否'
    } else {
      list[i] = '是'
    }
  }
  let data = {
    userId: uni.getStorageSync('userId'),
    type: 'HAS-BLED',
    score: score.value,
    answers: list,
  }
  const res = await _api_commitData(data, { accessToken })
  console.log(res)
  uni.navigateTo({
    url: '/pages-sub/bleedRiskScore/index',
  })
}

function _init() {
  getQuestionnaireList('HAS-BLED')
}

_init()
</script>

<template>
  <view class="container">
    <view class="item" v-for="(item, index) in list" :key="index">
      <scroingItemVue
        :title="item.itemTitle"
        :score="item.itemScore"
        :index="index + 1"
      ></scroingItemVue>
    </view>
    <view class="takeup"></view>

    <view class="bottom">
      <view class="score">
        <text>总分</text>
        <text>{{ score }}</text>
      </view>
      <view class="btn">
        <button @click="commitData">确认</button>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.container {
  box-sizing: border-box;
  width: 100vw;
  min-height: 100vh;
  padding: 30rpx;
}

.takeup {
  height: 80px;
  background-color: transparent;
  width: 100%;
}

.bottom {
  background-color: white;
  border-top: 1px solid #b8b8b8;
  border-radius: 20rpx 20rpx 0 0;
  width: 100vw;
  height: 60px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;

  > view {
    &.score {
      line-height: 60px;

      > text:last-child {
        font-size: 30px;
        margin-left: 20rpx;
      }
    }

    &.btn {
      width: 30%;
      margin-top: 6px;

      button {
        background-color: #18ca85;
        border-radius: 20px;
        color: white;
      }
    }
  }
}
</style>
