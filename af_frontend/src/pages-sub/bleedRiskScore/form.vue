<route lang="json5">
{
  style: {
    navigationBarTitleText: '出血风险评分',
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
      <view v-for="(question, index) in questions" :key="question.id" class="question-item">
        <view class="question-header">
          <text class="question-number">{{ index + 1 }}</text>
          <text class="question-title">{{ question.itemTitle }}</text>
        </view>

        <!-- 输入框 -->
        <view v-if="question.type === 'number'" class="age-input">
          <input
            type="number"
            v-model="formData[question.id]"
            :placeholder="`请输入${question.itemTitle}`"
            @input="handleAgeChange(question.id, $event.detail.value)"
          />
        </view>

        <!-- 单选框 -->
        <view v-else-if="question.type === 'radio'">
          <radio-group
            :value="String(formData[question.id])"
            @change="(e) => handleRadioChange(question.id, e.detail.value)"
          >
            <label v-for="option in question.options" :key="option.value" class="radio-option">
              <radio :value="String(option.value)" />
              <text>{{ option.label }}</text>
            </label>
          </radio-group>
        </view>
        <!-- 多选框 -->
        <view v-else-if="question.type === 'checkbox'" class="checkbox-group">
          <checkbox-group
            :value="formData[question.id] || []"
            @change="(e) => handleCheckboxChange(question.id, e.detail.value)"
          >
            <label v-for="option in question.options" :key="option.value" class="checkbox-option">
              <checkbox :value="String(option.value)" class="checkBox" />
              <text>{{ option.label }}</text>
            </label>
          </checkbox-group>
        </view>
        <!-- 检测时间 -->
        <view
          v-else-if="question.type === 'datetime' && question.itemTitle.includes('检测时间')"
          class="datetime-picker"
        >
          <picker
            mode="date"
            :value="getDateTimeValue(question.id, 'date') || ''"
            @change="(e) => handleDateChange(question.id, e.detail.value)"
          >
            <view class="picker-item">
              <text>日期：{{ getDateTimeValue(question.id, 'date') || '请选择' }}</text>
            </view>
          </picker>
          <picker
            mode="time"
            :value="getDateTimeValue(question.id, 'time') || ''"
            @change="(e) => handleTimeChange(question.id, e.detail.value)"
          >
            <view class="picker-item">
              <text>时间：{{ getDateTimeValue(question.id, 'time') || '请选择' }}</text>
            </view>
          </picker>
        </view>
      </view>
    </view>

    <!-- 底部操作按钮 -->
    <view class="footer">
      <!-- 评分显示 -->
      <view class="btn" v-if="score !== null">
        <text>总分: {{ score }}</text>
      </view>
      <view class="btn">
        <button @click="applyMockAnswers" class="mock-btn">使用备用数据</button>
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

// 定义数据类型
interface DateTimeValue {
  date: string
  time: string
}

interface QuestionOption {
  value: string
  label: string
  score?: number
}

interface QuestionItem {
  id: number
  itemTitle: string
  type: 'radio' | 'checkbox' | 'datetime' | 'number' | 'complex_radio'
  options?: QuestionOption[]
  required?: boolean
}

type FormDataValue = Record<number, any>

const userStore = useUserStore()
const accessToken = userStore.userInfo?.token || ''
const userId = userStore.userInfo?.id || '1'

const loading = ref(false)
const questions = ref<QuestionItem[]>([])
const score = ref(0)
const formData = ref<FormDataValue>({})

// 加载问卷配置
const loadQuestionnaireConfig = async () => {
  try {
    loading.value = true

    // 确保有访问令牌
    if (!accessToken) {
      console.warn('没有访问令牌，使用默认值')
    }

    // 尝试获取HAS-BLED类型问卷配置
    const response = await _api_getQuestionnaireList({ type: 'HAS-BLED' }, { accessToken })
    console.log('API响应:', response)

    if (response && response.success && Array.isArray(response.data) && response.data.length > 0) {
      questions.value = response.data
      console.log('加载到的题目数量:', response.data.length)

      // 初始化表单数据
      questions.value.forEach((question) => {
        formData.value[question.id] = undefined
      })

      // 计算初始分数
      calculateScore()
    } else {
      console.warn('API响应不符合预期或为空，使用模拟数据')
      // 使用模拟数据
      questions.value = getMockQuestionnaireData()

      // 初始化表单数据
      questions.value.forEach((question) => {
        formData.value[question.id] = undefined
      })

      // 计算初始分数
      calculateScore()
    }
  } catch (error) {
    console.error('加载问卷配置失败:', error)
    // API调用失败时使用模拟数据
    questions.value = getMockQuestionnaireData()

    // 初始化表单数据
    questions.value.forEach((question) => {
      formData.value[question.id] = undefined
    })

    // 计算初始分数
    calculateScore()

    uni.showToast({
      title: '加载问卷配置失败，使用模拟数据',
      icon: 'none',
      duration: 3000,
    })
  } finally {
    loading.value = false
  }
}

// 提供HAS-BLED类型问卷的模拟数据
const getMockQuestionnaireData = (): QuestionItem[] => {
  return [
    {
      id: 1,
      itemTitle: '高血压(收缩压>160mmHg)',
      type: 'radio',
      options: [
        { value: '0', label: '否', score: 0 },
        { value: '1', label: '是', score: 1 },
      ],
      required: true,
    },
    {
      id: 2,
      itemTitle: '肝肾功能异常',
      type: 'radio',
      options: [
        { value: '0', label: '否', score: 0 },
        { value: '1', label: '肝功能异常或肾功能异常（任意一个）', score: 1 },
        { value: '2', label: '两者均异常', score: 2 },
      ],
      required: true,
    },
    {
      id: 3,
      itemTitle: '卒中/TIA/血栓栓塞病史',
      type: 'radio',
      options: [
        { value: '0', label: '否', score: 0 },
        { value: '1', label: '是', score: 1 },
      ],
      required: true,
    },
    {
      id: 4,
      itemTitle: '出血病史或出血倾向',
      type: 'radio',
      options: [
        { value: '0', label: '否', score: 0 },
        { value: '1', label: '是', score: 1 },
      ],
      required: true,
    },
    {
      id: 5,
      itemTitle: 'INR值不稳定',
      type: 'radio',
      options: [
        { value: '0', label: '否', score: 0 },
        { value: '1', label: '是', score: 1 },
      ],
      required: true,
    },
    {
      id: 6,
      itemTitle: '年龄>65岁',
      type: 'radio',
      options: [
        { value: '0', label: '否', score: 0 },
        { value: '1', label: '是', score: 1 },
      ],
      required: true,
    },
    {
      id: 7,
      itemTitle: '药物或酒精应用',
      type: 'radio',
      options: [
        { value: '0', label: '否', score: 0 },
        { value: '1', label: '使用抗血小板药物或酗酒（任意一个）', score: 1 },
        { value: '2', label: '两者均有', score: 2 },
      ],
      required: true,
    },
  ]
}

// 清理表单数据
const cleanFormData = () => {
  const cleanedData: FormDataValue = {}

  Object.keys(formData.value).forEach((key) => {
    const numKey = parseInt(key)
    const value = formData.value[numKey]

    // 处理不同类型的数据
    if (value !== undefined && value !== null && value !== '') {
      cleanedData[numKey] = value
    }
  })

  return cleanedData
}

// 计算分数
const calculateScore = () => {
  let totalScore = 0

  questions.value.forEach((question) => {
    const value = formData.value[question.id]

    if (question.type === 'radio' && value && question.options) {
      const selectedOption = question.options.find((option) => option.value === value)
      if (selectedOption && selectedOption.score !== undefined) {
        totalScore += selectedOption.score
      }
    } else if (question.type === 'checkbox' && Array.isArray(value) && question.options) {
      value.forEach((checkedValue) => {
        const selectedOption = question.options?.find((option) => option.value === checkedValue)
        if (selectedOption && selectedOption.score !== undefined) {
          totalScore += selectedOption.score
        }
      })
    }
  })

  score.value = totalScore
}

// 处理年龄变化
const handleAgeChange = (questionId: number, value: string) => {
  formData.value[questionId] = value
  calculateScore()
}

// 处理单选框变化
const handleRadioChange = (questionId: number, value: string) => {
  formData.value[questionId] = value
  calculateScore()
}

// 处理多选框变化
const handleCheckboxChange = (questionId: number, values: string[]) => {
  formData.value[questionId] = values
  calculateScore()
}

// 获取日期时间值
const getDateTimeValue = (questionId: number, type: 'date' | 'time'): string => {
  const value = formData.value[questionId]
  if (value && typeof value === 'object' && 'date' in value && 'time' in value) {
    return value[type]
  }
  return ''
}

// 处理日期变化
const handleDateChange = (questionId: number, value: string) => {
  const currentValue = formData.value[questionId] || {}
  formData.value[questionId] = {
    ...currentValue,
    date: value,
  }
}

// 处理时间变化
const handleTimeChange = (questionId: number, value: string) => {
  const currentValue = formData.value[questionId] || {}
  formData.value[questionId] = {
    ...currentValue,
    time: value,
  }
}

// 格式化日期时间
const formatDateTime = (dateTime?: DateTimeValue): string => {
  if (!dateTime || !dateTime.date || !dateTime.time) {
    return ''
  }
  return `${dateTime.date} ${dateTime.time}`
}

// 提交表单
const submitForm = async () => {
  // 验证表单
  const hasEmptyRequiredField = questions.value.some((question) => {
    if (question.required) {
      const value = formData.value[question.id]
      return (
        value === undefined ||
        value === null ||
        value === '' ||
        (Array.isArray(value) && value.length === 0)
      )
    }
    return false
  })

  if (hasEmptyRequiredField) {
    uni.showToast({
      title: '请填写所有必填项',
      icon: 'none',
      duration: 2000,
    })
    return
  }

  try {
    loading.value = true

    // 准备提交数据
    const cleanedData = cleanFormData()
    const submitData = {
      userId: userId,
      questionnaireType: 'HAS-BLED',
      score: score.value,
      answers: cleanedData,
      submitTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      status: 'completed',
    }

    console.log('提交数据:', submitData)

    // 调用API提交数据
    const response = await _api_commitData(submitData, { Authorization: accessToken })
    console.log('提交响应:', response)

    if (response && response.success) {
      uni.showToast({
        title: '评分提交成功',
        icon: 'success',
        duration: 2000,
      })

      // 延迟跳转到结果页面，传递评分数据
      setTimeout(() => {
        uni.navigateTo({
          url: `/pages-sub/bleedRiskScore/index?score=${score.value}`,
        })
      }, 1500)
    } else {
      uni.showToast({
        title: '评分提交失败',
        icon: 'error',
        duration: 2000,
      })
    }
  } catch (error) {
    console.error('提交表单失败:', error)
    uni.showToast({
      title: '评分提交失败',
      icon: 'error',
      duration: 2000,
    })
  } finally {
    loading.value = false
  }
}

// 应用备用数据
const applyMockAnswers = () => {
  // 为每个问题设置预设答案
  questions.value.forEach((question) => {
    if (question.type === 'radio' && question.options && question.options.length > 0) {
      // 随机选择一个答案作为预设值
      const randomIndex = Math.floor(Math.random() * question.options.length)
      formData.value[question.id] = question.options[randomIndex].value
    } else if (question.type === 'number') {
      // 为数字类型问题设置一个合理的预设值
      formData.value[question.id] = Math.floor(Math.random() * 30) + 50 // 50-79岁之间的随机值
    }
  })

  // 重新计算分数
  calculateScore()

  // 显示提示
  uni.showToast({
    title: '备用数据已加载',
    icon: 'success',
    duration: 2000,
  })
}

// 组件挂载时加载问卷配置
onMounted(() => {
  loadQuestionnaireConfig()
})
</script>

<style scoped lang="scss">
.container {
  box-sizing: border-box;
  width: 100%;
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;
}

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200rpx;
  font-size: 32rpx;
  color: #666;
}

.questionnaire-form {
  background-color: #fff;
  border-radius: 30rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.05);
}

.question-item {
  margin-bottom: 40rpx;
  padding-bottom: 30rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.question-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.question-header {
  display: flex;
  align-items: center;
  margin-bottom: 20rpx;
}

.question-number {
  display: inline-block;
  width: 48rpx;
  height: 48rpx;
  background-color: #25d08d;
  color: #fff;
  text-align: center;
  line-height: 48rpx;
  border-radius: 50%;
  font-size: 28rpx;
  margin-right: 16rpx;
}

.question-title {
  font-size: 32rpx;
  color: #333;
  flex: 1;
}

.question-score {
  font-size: 28rpx;
  color: #25d08d;
}

/* 输入框样式 */
.age-input {
  margin-top: 10rpx;
}

.age-input input {
  width: 100%;
  height: 88rpx;
  border: 2rpx solid #e0e0e0;
  border-radius: 16rpx;
  padding: 0 30rpx;
  font-size: 30rpx;
  color: #333;
  background-color: #fafafa;
  transition: all 0.3s;
}

.age-input input:focus {
  border-color: #25d08d;
  background-color: #fff;
  box-shadow: 0 0 0 8rpx rgba(37, 208, 141, 0.1);
}

.age-input input::placeholder {
  color: #999;
  font-size: 28rpx;
}

/* 年龄评分说明 */
.age-score-info {
  margin-top: 10rpx;
  padding: 16rpx 24rpx;
  background-color: #f0f9f5;
  border-radius: 12rpx;
}

.score-highlight {
  font-size: 26rpx;
  color: #25d08d;
}

/* 单选框样式 */
.radio-group {
  margin-top: 10rpx;
}

.radio-option {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  font-size: 30rpx;
  color: #333;
}

.radio-option radio {
  width: 40rpx;
  height: 40rpx;
  margin-right: 20rpx;
}

.radio-option text {
  flex: 1;
}

/* 多选框样式 */
.checkbox-group {
  margin-top: 10rpx;
}

.checkbox-option {
  display: flex;
  align-items: center;
  padding: 20rpx 0;
  font-size: 30rpx;
  color: #333;
}

.checkBox {
  width: 40rpx;
  height: 40rpx;
  margin-right: 20rpx;
}

/* 日期时间选择器样式 */
.datetime-picker {
  margin-top: 10rpx;
}

.picker-item {
  height: 88rpx;
  line-height: 88rpx;
  padding: 0 30rpx;
  background-color: #fafafa;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  font-size: 30rpx;
  color: #333;
  border: 2rpx solid #e0e0e0;
  transition: all 0.3s;
}

.picker-item:active {
  background-color: #f0f0f0;
  border-color: #25d08d;
}

.picker-item text {
  display: inline-block;
  width: 100%;
}

/* 其他症状输入框 */
.other-input {
  margin-top: 20rpx;
  padding: 20rpx;
  background-color: #fafafa;
  border-radius: 16rpx;
  border: 2rpx solid #e0e0e0;
}

.input-label {
  margin-bottom: 16rpx;
}

.input-label text {
  font-size: 28rpx;
  color: #666;
}

.textarea-field {
  width: 100%;
  height: 160rpx;
  background-color: #fff;
  border: 2rpx solid #e0e0e0;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
  color: #333;
  resize: none;
  box-sizing: border-box;
}

.textarea-field:focus {
  border-color: #25d08d;
  box-shadow: 0 0 0 8rpx rgba(37, 208, 141, 0.1);
}

.char-count {
  text-align: right;
  margin-top: 8rpx;
}

.char-count text {
  font-size: 24rpx;
  color: #999;
}

/* 底部按钮样式 */
.footer {
  margin-top: 40rpx;
  padding: 0 20rpx;
}

.btn {
  margin-bottom: 20rpx;
  display: flex;
  justify-content: center;
}

.btn text {
  font-size: 32rpx;
  color: #25d08d;
  font-weight: bold;
}

.mock-btn {
  width: 100%;
  height: 96rpx;
  line-height: 96rpx;
  background-color: #1b91ff;
  color: #fff;
  font-size: 32rpx;
  font-weight: 500;
  border-radius: 48rpx;
  border: none;
  margin-bottom: 20rpx;
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

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
