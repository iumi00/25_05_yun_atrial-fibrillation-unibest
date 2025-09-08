<route lang="json5">
{
  style: {
    navigationBarTitleText: '出血风险评分',
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
    <view class="btn-container">
      <button @click="goToForm" class="submit-btn">重新评分</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import scoreCircleVue from '@/components/scoreCircle/scoreCircle.vue'
import scoreAdviceVue from '@/components/scoreAdvice/scoreAdvice.vue'
import { useUserStore } from '@/store'

const userStore = useUserStore()
const accessToken = userStore.userInfo?.token || ''
const userId = userStore.userInfo?.id || '1'

// 获取从上一个页面传递的参数
const route = useRoute()
const passedScore = route.query.score ? parseInt(route.query.score as string) : 0

// 定义响应式数据
const score = ref(passedScore || 0)
const type = ref('出血风险总分')
const title = ref('综合建议')
const text = ref('')

// 根据评分生成不同的建议
const generateAdvice = () => {
  if (score.value <= 2) {
    text.value = `HAS-BLED评分${score.value}分，属于低出血风险（≤2分）。\n\n抗凝治疗相对安全，但仍需定期监测。建议：\n1. 常规监测INR（如使用华法林）或肝肾功能（如使用NOACs）\n2. 控制血压在理想范围（<140/90mmHg）\n3. 避免同时使用抗血小板药物，除非有明确指征\n4. 保持健康生活方式，限制饮酒量\n5. 警惕出血症状，如牙龈出血、黑便等`
  } else if (score.value <= 4) {
    text.value = `HAS-BLED评分${score.value}分，属于中等出血风险（3-4分）。\n\n抗凝治疗需谨慎评估获益与风险。建议：\n1. 优先选择NOACs而非华法林，以降低出血风险\n2. 更频繁地监测INR、肝肾功能和凝血指标\n3. 严格控制血压（目标<130/80mmHg）\n4. 谨慎使用非甾体抗炎药、抗血小板药物等可能增加出血风险的药物\n5. 详细向患者说明出血风险及应对措施\n6. 建议与多学科团队（心内科、血液科）共同制定治疗方案`
  } else {
    text.value = `HAS-BLED评分${score.value}分，属于高出血风险（≥5分）。\n\n抗凝治疗风险显著增加，需特别谨慎。建议：\n1. 需由多学科团队（心内科、血液科、药剂科）共同评估抗凝必要性\n2. 如必须抗凝，应选择出血风险最低的药物和剂量\n3. 密切监测（至少每月1次）各项指标和出血情况\n4. 积极纠正可改变的出血危险因素（如控制血压、治疗肝肾功能异常等）\n5. 考虑使用新型口服抗凝药（如达比加群酯、利伐沙班）\n6. 制定详细的出血应急预案，并向患者及其家属详细说明`
  }
}

// 跳转到评分表单页面
const goToForm = () => {
  uni.navigateTo({
    url: '/pages-sub/bleedRiskScore/form',
  })
}

// 组件挂载时执行
onMounted(() => {
  generateAdvice()
})
</script>

<style scoped lang="scss">
.container {
  box-sizing: border-box;
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 30rpx;
  display: flex;
  flex-direction: column;
}

.circle {
  width: 500rpx;
  height: 450rpx;
  margin: 0 auto;
  padding-top: 30rpx;
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
  flex: 1;
}

.btn-container {
  margin-top: 40rpx;
  padding: 0 20rpx;
  margin-bottom: 40rpx;
}

.submit-btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  background-color: #25d08d;
  color: #fff;
  font-size: 34rpx;
  font-weight: bold;
  border-radius: 48rpx;
  border: none;
  box-shadow: 0 6rpx 20rpx rgba(37, 208, 141, 0.4);
  transition: all 0.3s;
}

.submit-btn:active {
  background-color: #1eb97c;
  box-shadow: 0 4rpx 12rpx rgba(37, 208, 141, 0.3);
  transform: translateY(2rpx);
}
</style>
