<route lang="json5">
{
  style: {
    // navigationStyle: 'custom',
    navigationBarTitleText: '出血风险评分',
  },
}
</route>

<script setup lang="ts">
import scoreCircleVue from '@/components/scoreCircle/scoreCircle.vue'
import scoreAdviceVue from '@/components/scoreAdvice/scoreAdvice.vue'
import useScroingData from '@/store/scroing'
import { storeToRefs } from 'pinia'

const accessToken = uni.getStorageSync('accessToken')
const scroingData = useScroingData()
let { score } = storeToRefs(scroingData)

let type = ref('出血风险总分')
let title = ref('综合建议')
let text = ref(
  `对于出血风险评分为${score.value}的患者，需谨慎进行抗凝治疗密切监测肝肾功能和INR水平，优先选择NOACs。控制高血压、避免高风险药物和减少饮酒是关键。医生应权衡抗凝治疗的必要性，确保获益大于风险，同时教育患者识别出血症状并及时就医。`,
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
