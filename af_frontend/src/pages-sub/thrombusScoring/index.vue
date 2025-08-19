<route lang="json5">
{
  style: {
    navigationBarTitleText: '血栓风险评分',
  },
}
</route>

<template>
  <view class="container">

    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>

    <view v-else class="questionnaire-form">
      <!-- 动态渲染题目 -->
      <view 
        v-for="(question, index) in questions" 
        :key="question.id" 
        class="question-item"
      >
        <view class="question-header">
          <text class="question-number">{{ index + 1 }}</text>
          <text class="question-title">{{ question.itemTitle }}</text>
          <!-- <text class="question-score">({{ question.itemScore }}分)</text> -->
        </view>

        <!-- 输入框 -->
        <view v-if="question.type==='number'" class="age-input">
          <input 
            type="number"
            v-model="formData[question.id]"
            :placeholder="`请输入${question.itemTitle}`"
            @input="handleAgeChange(question.id, $event.detail.value)"
          />
          <!-- 显示年龄评分说明 -->
          <view v-if="question.itemTitle==='年龄(岁)'" class="age-score-info">
            <!-- <text v-if="formData[question.id] >= 65" class="score-highlight">年龄≥65岁，加2分</text>
            <text v-else-if="formData[question.id] >= 60" class="score-highlight">年龄60~65岁，加1分</text> -->
            </view>
        </view>
        
        <!-- 单选框 -->
        <radio-group 
          :value="String(formData[question.id])"
          @change="e => handleRadioChange(question.id, e.detail.value)"
        >
          <label 
            v-for="option in question.options" 
            :key="option.value"
            class="radio-option"
          >
            <radio :value="String(option.value)" />
            <text>{{ option.label }}</text>
          </label>
        </radio-group>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="footer">
      <!-- 评分显示 -->
      <view class="btn" v-if="score !== null">
        <text>总分: {{ score }}</text>
      </view>
      <view class="btn">
        <button @click="submitForm" class="submit-btn">确认</button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import dayjs from 'dayjs'
import { ref, onMounted } from 'vue'
import { useUserStore } from '@/store'
import { _api_getQuestionnaireList, _api_commitData } from '@/service'
import type { QuestionItem } from '@/types/api'

const userStore = useUserStore()
const accessToken = userStore.userInfo.token
const userId = userStore.userInfo.id

const loading = ref(true)
const questions = ref<QuestionItem[]>([])
const formData = ref<Record<number, number|string|undefined>>({})
const score = ref<number | null>(null)

// 加载问卷配置
const loadQuestionnaireConfig = async () => {
  try {
    loading.value = true
    const response = await _api_getQuestionnaireList(
      { type: 'CHA2DS2-VASc' },
      { Authorization: accessToken }
    )
    console.log('API响应:', response)

    if (response && response.success) {
      questions.value = response.data
      // 初始化表单数据
      questions.value.forEach(question => {
          formData.value[question.id] = undefined // 默认选择"否"
      })
      calculateScore()
    } else {
      console.error('获取问卷配置失败:', response?.message || '未知错误')
      throw new Error(response.message || '获取问卷配置失败')
    }
  } catch (error) {
    console.error('加载问卷配置失败:', error)
    uni.showToast({
      title: '加载问卷配置失败',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}



// 计算总分
const calculateScore = () => {
  let totalScore = 0
  
  questions.value.forEach(question=>{
    const value = formData.value[question.id];
    if (question.type === 'radio' && question.options) {
      // 找到用户选择的选项
      const selectedOption = question.options.find(option => option.value == value);
      if (selectedOption && selectedOption.score) {
        totalScore += selectedOption.score;
        console.log(`${question.itemTitle} 选择: ${selectedOption.label}, 得分: ${selectedOption.score}, 当前总分: ${totalScore}`);
      }
    } else if (question.type === 'number') {
      // 年龄等数字输入题目的特殊处理
      if (question.itemTitle.includes('年龄')) {
        const age = Number(value);
        if (age >= 65) {
          totalScore += 2;
          console.log(`年龄${age}岁，加2分，当前总分: ${totalScore}`);
        } else if (age >= 60) {
          totalScore += 1;
          console.log(`年龄${age}岁，加1分，当前总分: ${totalScore}`);
        }
      }
    }
  })
  
  
  score.value = totalScore
   console.log('最终评分:', totalScore)
}

// 处理年龄输入变化
const handleAgeChange = (questionId: number, value: string) => {
  formData.value[questionId] = parseInt(value)
  calculateScore() // 重新计算评分
}

// 处理单选框变化
const handleRadioChange = (questionId: number, value: string) => {
  formData.value[questionId] = value
  calculateScore()
}

// 提交表单
const submitForm = async () => {
  // 验证是否所有题目都已回答
  for (const question of questions.value) {
    console.log('formData',formData.value)
    if(formData.value[question.id] === undefined) {
      uni.showToast({
        title: '请完成所有题目',
        icon: 'error'
      })
      return
    }
  }

  uni.showLoading({
    title: '提交中'
  })

  try {
    // 准备提交数据

    const data = {
      userId: String(userId),
      questionnaireType: 'CHA2DS2-VASc',
      score: score.value,
      answers: formData.value,
      submitTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      status: 'completed'
    }
    console.log('data',data)

    const response = await _api_commitData(data, { accessToken })
    
    if (response.success) {
      console.log('提交成功:', response)
      uni.hideLoading()
      uni.showToast({
        title: '提交成功',
        icon: 'success'
      })

      // 跳转到结果页面
       setTimeout(() => {
      uni.navigateTo({
        url: `/pages-sub/thrombusScore/index?score=${score.value}`
      })
    },1000)
    } else {
      throw new Error(response.message || '提交失败')
    }

  } catch (error) {
    uni.hideLoading()
    console.error('提交失败:', error)
    uni.showToast({
      title: '提交失败',
      icon: 'error'
    })
  }
}

onMounted(() => {
  loadQuestionnaireConfig()
})
</script>

<style scoped lang="scss">
.container {
  box-sizing: border-box;
  width: 100%;
  min-height: 100vh;
  padding: 30rpx;
  background-color: #f5f5f5;
}

.loading {
  text-align: center;
  padding: 40rpx;
  font-size: 28rpx;
  color: #666;
}

.header {
  text-align: center;
  margin-bottom: 40rpx;
  
  h2 {
    font-size: 36rpx;
    font-weight: bold;
    margin-bottom: 10rpx;
    color: #333;
  }
  
  p {
    font-size: 28rpx;
    color: #666;
    line-height: 1.5;
  }
}

.questionnaire-form {
  background: white;
  border-radius: 20rpx;
  padding: 30rpx;
  margin-bottom: 120rpx;
}

.question-item {
  margin-bottom: 40rpx;
  padding: 20rpx;
  border: 1px solid #eee;
  border-radius: 10rpx;
  
  .question-header {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
    
    .question-number {
      background: #18ca85;
      color: white;
      width: 40rpx;
      height: 40rpx;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24rpx;
      margin-right: 15rpx;
    }
    
    .question-title {
      flex: 1;
      font-size: 28rpx;
      font-weight: 500;
      color: #333;
    }
    
    input{
      border:1px solid black;
    }
  }
  
  .radio-option {
    display: flex;
    align-items: center;
    margin-bottom: 15rpx;
    padding: 15rpx;
    border-radius: 8rpx;
    transition: background-color 0.3s;
    
    &:hover {
      background-color: #f8f9fa;
    }
    
    text {
      margin-left: 15rpx;
      font-size: 28rpx;
      color: #333;
    }
  }
}

.footer {
  background-color: white;
  border-top: 1px solid #b8b8b8;
  border-radius: 20rpx 20rpx 0 0;
  width: 100%;
  height: 80px;
  position: sticky;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  .btn {
    width: 45%;
    text{
      font-size: 30rpx;
    }
    button {
      width: 100%;
      height: 60rpx;
      line-height: 60rpx;
      border-radius: 30rpx;
      font-size: 28rpx;
      border: none;
      
      &.submit-btn {
        background-color: #18ca85;
        color: white;
      }
    }
  }
}
</style>