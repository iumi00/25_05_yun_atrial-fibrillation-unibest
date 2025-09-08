<route lang="json5">
{
  style: {
    // navigationStyle: 'custom',
    navigationBarTitleText: '血栓风险评分',
  },
}
</route>

<script>
import scoreCircleVue from '@/components/scoreCircle/scoreCircle.vue'
import scoreAdviceVue from '@/components/scoreAdvice/scoreAdvice.vue'

export default {
  components: {
    scoreCircleVue,
    scoreAdviceVue,
  },

  data() {
    return {
      score: 0,
      type: '血栓风险总分',
      title: '综合建议',
      text: '',
    }
  },

  onLoad(options) {
    console.log('onLoad 触发，参数:', options)

    if (options && options.score) {
      const scoreValue = parseInt(options.score)
      this.score = scoreValue

      console.log('设置评分:', scoreValue)

      // 根据评分生成建议文本
      if (scoreValue >= 2) {
        this.text = `血栓风险评分为${scoreValue}的患者处于高危状态，必须进行抗凝治疗，优先选择NOACs。与此同时，需要进行密切的出血风险监测和多学科管理以确保抗凝治疗的安全性和有效性。`
      } else if (scoreValue === 1) {
        this.text = `血栓风险评分为${scoreValue}的患者处于中危状态，建议进行抗凝治疗，可选择NOACs或华法林。需要定期监测出血风险。`
      } else {
        this.text = `血栓风险评分为${scoreValue}的患者处于低危状态，通常不需要抗凝治疗，但需要定期随访和监测。`
      }
    } else {
      console.warn('未接收到评分参数')
      // 设置默认值
      this.score = 3
      this.text = '测试：血栓风险评分为3的患者处于高危状态，必须进行抗凝治疗。'
    }
  },
}
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
