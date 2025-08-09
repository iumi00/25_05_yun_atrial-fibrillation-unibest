<route lang="json5">
{
  style: {
    // navigationStyle: 'custom',
    navigationBarTitleText: '历史分数',
  },
}
</route>

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

<script setup lang="ts">
import scoreCircleVue from '@/components/scoreCircle/scoreCircle.vue'
import scoreAdviceVue from '@/components/scoreAdvice/scoreAdvice.vue'
import { _api_getMyQuestionnaireDetail } from '@/service'

const accessToken = uni.getStorageSync('accessToken')

let answerId = ref()
let type = ref()
let title = ref('综合建议')
let text = ref('')
let score = ref(0)
const All_text = computed(() => {
  return [
    `血栓风险评分为${score.value}的患者处于高危状态，必须进行抗凝治疗，优先选择NOACs与此同时，需要进行密切的出血风险监测和多学科管理以确保抗凝治疗的安全性和有效性。`,
    `对于出血风险评分为${score.value}的患者，需谨慎进行抗凝治疗密切监测肝肾功能和INR水平，优先选择NOACs。控制高血压、避免高风险药物和减少饮酒是关键。医生应权衡抗凝治疗的必要性，确保获益大于风险，同时教育患者识别出血症状并及时就医。`,
  ]
})

onLoad((options) => {
  console.log('options', options)

  answerId.value = options.answerId
  type.value = options.type === 0 ? '血栓风险评分' : '出血风险评分'
  _init(options)
})

async function getMyQuestionnaireDetail(options) {
  const res = await _api_getMyQuestionnaireDetail({ id: answerId.value }, { accessToken })
  console.log(res)
  score.value = res.data.score
  text.value = All_text.value[parseInt(options.type)]
}

function _init(options) {
  getMyQuestionnaireDetail(options)
}
</script>

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
