<route lang="json5">
{
  style: {
    navigationBarTitleText: '血栓风险评分',
  },
}
</route>

<template>
  <view class="container">
    <!-- 调试信息 -->
    <view
      class="debug-info"
      style="font-size: 24rpx; color: #666; padding: 10rpx; background: #f0f0f0"
    >
      <text>questions数量: {{ questions.length }}</text>
      <text>loading状态: {{ loading }}</text>
    </view>

    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>

    <!-- 即使questions为空也显示问卷表单容器 -->
    <view class="questionnaire-form">
      <!-- 动态渲染题目 -->
      <view
        v-for="(question, index) in questions"
        :key="question.id || index"
        class="question-item"
      >
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
          <!-- 显示年龄评分说明 -->
          <view v-if="question.itemTitle === '年龄(岁)'" class="age-score-info">
            <!-- <text v-if="formData[question.id] >= 65" class="score-highlight">年龄≥65岁，加2分</text>
            <text v-else-if="formData[question.id] >= 60" class="score-highlight">年龄60~65岁，加1分</text> -->
          </view>
        </view>

        <!-- 房颤相关症状 - 添加级联效果 -->
        <view
          v-else-if="question.type === 'checkbox' && question.itemTitle.includes('房颤相关症状')"
          class="checkbox-group"
        >
          <checkbox-group
            :value="(formData[question.id] as string[]) || []"
            @change="(e) => handleCheckboxChange(question.id, e.detail.value)"
          >
            <label v-for="option in question.options" :key="option.value" class="checkbox-option">
              <checkbox :value="String(option.value)" />
              <text>{{ option.label }}</text>
            </label>
          </checkbox-group>

          <!-- 其他症状输入框 - 修复级联显示条件 -->
          <view v-if="shouldShowOtherInput(question.id)" class="other-input">
            <view class="input-label">
              <text>请详细描述其他症状：</text>
            </view>
            <textarea
              v-model="otherSymptoms[question.id]"
              placeholder="请输入其他症状的详细描述..."
              class="textarea-field"
              :maxlength="200"
              :show-confirm-bar="false"
            />
            <view class="char-count">
              <text>{{ (otherSymptoms[question.id] || '').length }}/200</text>
            </view>
          </view>
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
const otherSymptoms = ref<Record<number, string>>({})

const formData = ref<FormDataValue>({})

// 加载问卷配置
const loadQuestionnaireConfig = async () => {
  try {
    loading.value = true
    console.log('开始加载问卷配置...')

    // 确保有访问令牌
    if (!accessToken) {
      console.warn('没有访问令牌，使用默认值')
    }

    // 尝试API请求
    try {
      const response = await _api_getQuestionnaireList(
        { type: 'CHA2DS2-VASc' },
        { Authorization: accessToken },
      )
      console.log('API响应:', response)

      if (response && response.success && Array.isArray(response.data)) {
        questions.value = response.data
        console.log('加载到的题目数量:', response.data.length)
      } else {
        console.error('获取问卷配置失败:', response?.message || '未知错误')
        // 直接使用模拟数据
        questions.value = getMockQuestionnaireData()
      }
    } catch (apiError) {
      console.error('API请求失败:', apiError)
      // 显示友好的错误提示
      uni.showToast({
        title: '加载问卷配置失败，使用本地数据',
        icon: 'none',
        duration: 3000,
      })
      // 使用模拟数据
      questions.value = getMockQuestionnaireData()
    }

    // 初始化表单数据
    questions.value.forEach((question) => {
      formData.value[question.id] = undefined
    })

    console.log('当前questions数据:', questions.value)

    // 计算初始分数
    calculateScore()
  } catch (error) {
    console.error('加载问卷配置过程中发生错误:', error)

    // 强制使用模拟数据
    questions.value = getMockQuestionnaireData()
    questions.value.forEach((question) => {
      formData.value[question.id] = undefined
    })
    calculateScore()
  } finally {
    loading.value = false
    console.log('加载完成，loading状态变为:', loading.value)
  }
}

// 提供模拟问卷数据作为后备方案
const getMockQuestionnaireData = (): QuestionItem[] => {
  console.log('生成模拟问卷数据...')
  const mockData: QuestionItem[] = [
    {
      id: 1,
      itemTitle: '年龄(岁)',
      type: 'number',
      required: true,
    },
    {
      id: 2,
      itemTitle: '是否有充血性心力衰竭/左心室功能障碍病史？',
      type: 'radio',
      required: true,
      options: [
        { value: 'yes', label: '是', score: 1 },
        { value: 'no', label: '否', score: 0 },
      ],
    },
    {
      id: 3,
      itemTitle: '是否有高血压病史？',
      type: 'radio',
      required: true,
      options: [
        { value: 'yes', label: '是', score: 1 },
        { value: 'no', label: '否', score: 0 },
      ],
    },
    {
      id: 4,
      itemTitle: '是否有糖尿病病史？',
      type: 'radio',
      required: true,
      options: [
        { value: 'yes', label: '是', score: 1 },
        { value: 'no', label: '否', score: 0 },
      ],
    },
    {
      id: 5,
      itemTitle: '是否有脑卒中/TIA/血栓栓塞病史？',
      type: 'radio',
      required: true,
      options: [
        { value: 'yes', label: '是', score: 2 },
        { value: 'no', label: '否', score: 0 },
      ],
    },
    {
      id: 6,
      itemTitle: '性别',
      type: 'radio',
      required: true,
      options: [
        { value: 'male', label: '男性', score: 0 },
        { value: 'female', label: '女性', score: 1 },
      ],
    },
  ]
  console.log('模拟数据生成完成，题目数量:', mockData.length)
  return mockData
}

// 数据清理函数 - 优化datetime和症状处理
const cleanFormData = () => {
  const cleanedData: Record<number, string> = {}

  questions.value.forEach((question) => {
    const value = formData.value[question.id]

    if (question.type === 'datetime') {
      // 处理时间数据 - 转换为datetime格式
      if (value && typeof value === 'object' && 'date' in value && 'time' in value) {
        const dateTimeValue = value as DateTimeValue
        if (dateTimeValue.date && dateTimeValue.time) {
          const formattedDateTime = formatDateTime(dateTimeValue.date, dateTimeValue.time)
          if (formattedDateTime) {
            cleanedData[question.id] = formattedDateTime
          } else {
            cleanedData[question.id] = '时间格式错误'
          }
        } else {
          cleanedData[question.id] = '未选择完整时间'
        }
      } else {
        cleanedData[question.id] = '未选择时间'
      }
    } else if (question.type === 'checkbox') {
      // 处理多选数据 - 优化症状处理
      if (Array.isArray(value) && value.length > 0) {
        const symptoms = [...value] // 创建副本避免修改原数组

        // 处理"其他"症状
        const otherIndex = symptoms.indexOf('其他')
        if (otherIndex !== -1) {
          const otherText = otherSymptoms.value[question.id]?.trim()
          if (otherText) {
            // 替换"other"为具体的症状描述
            symptoms[otherIndex] = `其他：${otherText}`
          } else {
            // 如果没有输入具体症状，移除"other"
            symptoms.splice(otherIndex, 1)
          }
        }

        if (symptoms.length > 0) {
          cleanedData[question.id] = symptoms.join('；')
        } else {
          cleanedData[question.id] = '未选择症状'
        }
      } else {
        cleanedData[question.id] = '未选择症状'
      }
    } else if (question.type === 'complex_radio') {
      // 处理复杂单选
      if (typeof value === 'string' && value.startsWith('yes_')) {
        const drugType = value.replace('yes_', '')
        const drugLabel = question.options?.find((opt) => opt.value === drugType)?.label || drugType
        cleanedData[question.id] = `是，${drugLabel}`
      } else {
        cleanedData[question.id] = value === 'yes' ? '是' : '否'
      }
    } else {
      // 处理普通单选和数字输入
      if (value === undefined || value === null || value === '') {
        cleanedData[question.id] = '未选择'
      } else {
        cleanedData[question.id] = String(value)
      }
    }
  })

  return cleanedData
}

// 计算总分
const calculateScore = () => {
  let totalScore = 0

  questions.value.forEach((question) => {
    const value = formData.value[question.id]
    if (question.type === 'radio' && question.options) {
      // 找到用户选择的选项
      const selectedOption = question.options.find((option) => option.value == value)
      if (selectedOption && selectedOption.score) {
        totalScore += selectedOption.score
        console.log(
          `${question.itemTitle} 选择: ${selectedOption.label}, 得分: ${selectedOption.score}, 当前总分: ${totalScore}`,
        )
      }
    } else if (question.type === 'checkbox' && Array.isArray(value)) {
      // 处理多选
      value.forEach((selectedValue) => {
        const selectedOption = question.options?.find((option) => option.value == selectedValue)
        if (selectedOption && selectedOption.score !== undefined) {
          totalScore += selectedOption.score
        }
      })
    } else if (question.type === 'number' && typeof value === 'number') {
      // 年龄等数字输入题目的特殊处理
      if (question.itemTitle.includes('年龄')) {
        const age = Number(value)
        if (age >= 65) {
          totalScore += 2
          console.log(`年龄${age}岁，加2分，当前总分: ${totalScore}`)
        } else if (age >= 60) {
          totalScore += 1
          console.log(`年龄${age}岁，加1分，当前总分: ${totalScore}`)
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

// 添加辅助函数来安全获取datetime值
const getDateTimeValue = (questionId: number, field: 'date' | 'time'): string => {
  const value = formData.value[questionId]
  if (value && typeof value === 'object' && 'date' in value && 'time' in value) {
    return (value as DateTimeValue)[field] || ''
  }
  return ''
}

// 处理日期选择
const handleDateChange = (questionId: number, date: string) => {
  const currentValue = formData.value[questionId]
  if (typeof currentValue === 'object' && currentValue !== null && 'date' in currentValue) {
    ;(currentValue as DateTimeValue).date = date
  } else {
    formData.value[questionId] = { date, time: '' } as DateTimeValue
  }
  calculateScore()
}

// 处理时间选择
const handleTimeChange = (questionId: number, time: string) => {
  const currentValue = formData.value[questionId]
  if (typeof currentValue === 'object' && currentValue !== null && 'time' in currentValue) {
    ;(currentValue as DateTimeValue).time = time
  } else {
    formData.value[questionId] = { date: '', time } as DateTimeValue
  }
  calculateScore()
}
// 判断是否显示"其他"输入框
const shouldShowOtherInput = (questionId: number): boolean => {
  const value = formData.value[questionId]
  console.log(`检查题目${questionId}是否显示其他输入框:`, value)

  if (Array.isArray(value)) {
    const hasOther = value.includes('其他')
    console.log(`题目${questionId}包含other选项:`, hasOther)
    return hasOther
  }
  return false
}

// 处理复选框变化 - 优化级联逻辑
const handleCheckboxChange = (questionId: number, values: string[]) => {
  console.log(`复选框变化 - 题目${questionId}:`, values)
  formData.value[questionId] = values

  // 如果取消选择"其他"，清空输入内容
  if (!values.includes('其他')) {
    otherSymptoms.value[questionId] = ''
  }

  calculateScore()
}

// 格式化日期时间为datetime字符串
const formatDateTime = (date: string, time: string): string => {
  if (!date || !time) {
    return ''
  }

  try {
    // 将日期和时间组合成ISO格式
    const dateTimeString = `${date} ${time}:00`
    const dateObj = new Date(dateTimeString)

    // 检查日期是否有效
    if (isNaN(dateObj.getTime())) {
      console.warn('无效的日期时间格式:', dateTimeString)
      return ''
    }

    // 返回ISO格式的datetime字符串
    return dateObj.toISOString()
  } catch (error) {
    console.error('日期时间格式化失败:', error)
    return ''
  }
}

// 提交表单
const submitForm = async () => {
  // 验证是否所有题目都已回答
  // for (const question of questions.value) {
  //   console.log('formData',formData.value)
  //   if(formData.value[question.id] === undefined) {
  //     uni.showToast({
  //       title: '请完成所有题目',
  //       icon: 'error'
  //     })
  //     return
  //   }
  // }

  // uni.showLoading({
  //   title: '提交中'
  // })

  try {
    // 验证表单数据完整性
    const validationErrors: string[] = []

    for (const question of questions.value) {
      const value = formData.value[question.id]
      console.log('question', question, value)
      if (question.required) {
        if (question.type === 'radio' || question.type === 'complex_radio') {
          if (value === undefined || value === null || value === '') {
            validationErrors.push(`${question.itemTitle} 未选择`)
          }
        } else if (question.type === 'number') {
          if (value === undefined || value === null || value === '' || isNaN(Number(value))) {
            validationErrors.push(`${question.itemTitle} 请输入有效数字`)
          }
        } else if (question.type === 'datetime') {
          if (value && typeof value === 'object' && 'date' in value && 'time' in value) {
            const dateTimeValue = value as DateTimeValue
            if (!dateTimeValue.date || !dateTimeValue.time) {
              validationErrors.push(`${question.itemTitle} 请选择完整时间`)
            }
          } else {
            validationErrors.push(`${question.itemTitle} 请选择时间`)
          }
        } else if (question.type === 'checkbox') {
          console.log('checkbox', value)
          if (!Array.isArray(value) || value.length === 0 || value === undefined) {
            validationErrors.push(`${question.itemTitle} 请至少选择一个选项`)
          } else if (value.includes('其他') && !otherSymptoms.value[question.id]?.trim()) {
            validationErrors.push(`${question.itemTitle} 选择"其他"时请填写具体症状`)
          }
        }
      }
    }

    if (validationErrors.length > 0) {
      uni.showToast({
        title: validationErrors[0],
        icon: 'none',
        duration: 2000,
      })
      return
    }

    // 清理数据
    const cleanedData = cleanFormData()
    console.log('清理后的表单数据:', cleanedData)

    // 准备提交数据

    const data = {
      userId: String(userId),
      questionnaireType: 'CHA2DS2-VASc',
      score: score.value,
      answers: formData.value,
      submitTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      status: 'completed',
      rawData: {
        formData: formData.value,
        otherSymptoms: otherSymptoms.value,
      },
    }
    console.log('data', data)
    uni.showLoading({ title: '提交中...' })

    const response = await _api_commitData(data, { accessToken })

    if (response.success) {
      console.log('提交成功:', response)
      uni.hideLoading()
      uni.showToast({
        title: '提交成功',
        icon: 'success',
      })

      // 跳转到结果页面
      setTimeout(() => {
        const targetUrl = `/pages-sub/thrombusScore/index?score=${score.value}`
        uni.navigateTo({
          url: targetUrl,
          success: () => {
            console.log('跳转成功')
          },
          fail: (err) => {
            console.error('跳转失败:', err)
            uni.redirectTo({
              url: targetUrl,
            })
          },
        })
      }, 1000)
    } else {
      throw new Error(response.message || '提交失败')
    }
  } catch (error) {
    uni.hideLoading()
    console.error('提交失败:', error)
    uni.showToast({
      title: '提交失败',
      icon: 'error',
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

    input {
      border: 1px solid black;
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

.datetime-picker {
  display: flex;
  gap: 20rpx;
  margin-top: 20rpx;

  .picker-item {
    flex: 1;
    padding: 20rpx;
    border: 2rpx solid #e0e0e0;
    border-radius: 8rpx;
    text-align: center;
    background-color: #f9f9f9;
  }
}
.checkbox-group {
  .checkbox-option {
    display: flex;
    align-items: center;
    margin-bottom: 15rpx;
    padding: 15rpx;
    text {
      margin-left: 15rpx;
      font-size: 28rpx;
    }
  }

  .other-input {
    margin-top: 20rpx;
    margin-left: 40rpx;
    padding: 20rpx;
    background-color: #f8f9fa;
    border-radius: 8rpx;
    border: 2rpx solid #e9ecef;
    .input-label {
      margin-bottom: 15rpx;

      text {
        font-size: 28rpx;
        color: #495057;
        font-weight: 500;
      }
    }

    .textarea-field {
      box-sizing: border-box;
      width: 100%;
      min-height: 120rpx;
      padding: 20rpx;
      border: 2rpx solid #dee2e6;
      border-radius: 8rpx;
      background-color: #fff;
      font-size: 28rpx;
      line-height: 1.5;
      resize: none;
      &:focus {
        border-color: #007bff;
        outline: none;
      }
    }

    .char-count {
      margin-top: 10rpx;
      text-align: right;

      text {
        font-size: 24rpx;
        color: #6c757d;
      }
    }
  }
}

.datetime-picker {
  display: flex;
  gap: 20rpx;
  margin-top: 20rpx;

  .picker-item {
    flex: 1;
    padding: 20rpx;
    border: 2rpx solid #e0e0e0;
    border-radius: 8rpx;
    text-align: center;
    background-color: #f9f9f9;
    transition: border-color 0.3s ease;

    &:active {
      border-color: #007bff;
      background-color: #e3f2fd;
    }
  }
}

// 添加动画效果
.other-input {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10rpx);
  }
  to {
    opacity: 1;
    transform: translateY(0);
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
    text {
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
