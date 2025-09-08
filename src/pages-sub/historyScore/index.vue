<route lang="json5">
{
  style: {
    // navigationStyle: 'custom',
    navigationBarTitleText: '历史分数',
  },
}
</route>

<script setup lang="ts">
import historyItemVue from '@/components/historyItem/historyItem.vue'
import { _api_getMyQuestionnaireList } from '@/service'

const accessToken = uni.getStorageSync('accessToken')
const userId = uni.getStorageSync('userId')

let historyList1 = ref([])
let historyList2 = ref([])
let historyList = computed(() => {
  return historyList1.value.concat(historyList2.value).sort((a, b) => {
    return b.id - a.id
  })
})

function transformTime(dat) {
  // return dat.join("-");
  return dat
}

async function getMyQuestionnaireList(type) {
  const res = await _api_getMyQuestionnaireList({ type, userId }, { accessToken })
  console.log(res)
  if (type == 'CHA2DS2-VASc') {
    historyList1.value = res.data
    historyList1.value.forEach((item) => {
      item.type = '血栓风险'
      item.score = parseInt(item.score)
      item.time = transformTime(item.createdTime)
    })
  } else if (type == 'HAS-BLED') {
    historyList2.value = res.data
    historyList2.value.forEach((item) => {
      item.type = '出血风险'
      item.score = parseInt(item.score)
      item.time = transformTime(item.createdTime)
    })
  } else {
    console.log('未知问卷类型')
    return
  }
  console.log(historyList)
}

function getUrl(id, type) {
  return `/pages-sub/historyScoreItem/index?answerId=${id}&type=${type == '出血风险' ? '1' : '0'}`
}

async function _init() {
  await getMyQuestionnaireList('CHA2DS2-VASc')
  await getMyQuestionnaireList('HAS-BLED')
}

_init()
</script>

<template>
  <view class="container">
    <view class="item" v-for="(item, index) in historyList" :key="index">
      <navigator
        :url="getUrl(item.id, item.type)"
        open-type="navigate"
        hover-class="navigator-hover"
      >
        <historyItemVue
          :type="item.type"
          :time="item.time"
          :score="parseInt(item.score)"
        ></historyItemVue>
      </navigator>
    </view>
  </view>
</template>

<style scoped lang="scss">
.container {
  box-sizing: border-box;
  padding: 30rpx;
  background-color: #f2f2f2;
}

.item {
  margin: 20rpx auto;
  width: 100%;
  height: 200rpx;
  background-color: white;
  border-radius: 30rpx;
  overflow: hidden;
}
</style>
