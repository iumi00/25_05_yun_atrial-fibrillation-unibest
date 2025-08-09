<route lang="json5">
{
  style: {
    // navigationStyle: 'custom',
    navigationBarTitleText: '房颤风险评分',
  },
}
</route>

<script setup lang="ts">
import scoreCircleVue from '@/components/scoreCircle/scoreCircle.vue'
import scoreAdviceVue from '@/components/scoreAdvice/scoreAdvice.vue'
import { ref } from 'vue'
import useScroingData from '@/store/scroing'
import { storeToRefs } from 'pinia'

const accessToken = uni.getStorageSync('accessToken')
const scroingData = useScroingData()
let { score } = storeToRefs(scroingData)

let type = ref('血栓风险总分')
let title = ref('综合建议')
let text = ref(
  `血栓风险评分为${score.value}的患者处于高危状态，必须进行抗凝治疗，优先选择NOACs与此同时，需要进行密切的出血风险监测和多学科管理以确保抗凝治疗的安全性和有效性。`,
)
</script>

<template>
  <view class="container">
    <view class="circle">
      <scoreCircleVue :score="score" :type="type"></scoreCircleVue>
    </view>
    <view class="text">
      <scoreAdviceVue :title="title" :text="text"></scoreAdviceVue>
    </view>
  </view>
</template>

<style scoped lang="scss">
.container {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 30rpx;
}

.circle {
  width: 500rpx;
  height: 450rpx;
  margin: 0 auto;
}

.text {
  margin-top: 50rpx;
  box-sizing: border-box;
  width: 100%;
  min-height: 500rpx;
  background-color: #ddf4ea;
  border: 2px dashed #25d08d;
  border-radius: 30rpx;
  overflow: hidden;
  padding: 30rpx;
}
</style>
