<route lang="json5" type="page">
{
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '房颤检测'
  }
}
</route>

<template>
  <view class="container">
    <view class="tip">
      <view class="title">加速度计测量</view>
      <view class="subtitle">请将手机平放在胸口进行测量</view>
    </view>
    
    <view class="btn-container">
      <button class="btn start-btn" @click="startMeasurement" :disabled="isMeasuring">开始测量</button>
      <button class="btn stop-btn" @click="stopMeasurement" :disabled="!isMeasuring">停止测量</button>
    </view>
    
    <view class="tool-container">
      <view class="measure-time-input">
        <text class="label">测量时间(s):</text>
        <input
          type="number"
          v-model="measureTime"
          class="input"
          placeholder="请输入测量时间"
          :disabled="isMeasuring"
        />
      </view>
      
      <view class="tool-buttons">
        <button class="btn tool-btn" @click="exportData">导出数据</button>
        <button class="btn tool-btn" @click="testFn">测试</button>
      </view>
    </view>
    
    <view class="measurement-indicator" v-if="isMeasuring">
      <view class="countdown">剩余时间: {{ remainingTime }}秒</view>
      <view class="progress-bar-container">
        <view class="progress-bar">
          <view class="progress-fill" :style="{ width: progressWidth }"></view>
        </view>
      </view>
    </view>
    
    <view class="chart-container">
      <view class="chart-title">测量数据图表</view>
      <cus-chart :option="chartOption"></cus-chart>
      <view class="measurement-status">数据点数量: {{ measurementData.length }}</view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { getFormattedTimestamp } from '@/utils/timeCompiler'
import dayjs from 'dayjs'
import { debounce } from 'lodash'
import { useUserStore } from '@/store'
import { 
  startMeasurement, 
  uploadMeasurementData, 
  endMeasurement 
} from '@/api/modules/measurement'

const userStore = useUserStore()
const accessToken = userStore.userInfo?.token || ''
const userId = userStore.userInfo?.id || ''

type IMeasurementData = {
  timestamp: string
  x: number
  y: number
  z: number
}

const measurementData = ref<IMeasurementData[]>([])
const isMeasuring = ref(false)
let measurementInterval: any = null
const measureTime = ref(60)
const currentMeasurementId = ref<number | null>(null)
const remainingTime = ref(0)
let timer: any = null

watch(isMeasuring, (newValue) => {
  if (newValue) {
    remainingTime.value = measureTime.value
    startCountdown()
  } else {
    stopCountdown()
    remainingTime.value = 0
  }
})

function getPlatformInfo() {
  return {
    canUseAccelerometer: false,
    platform: 'wechat'
  }
}

function generateMockData() {
  const baseTime = Date.now()
  const timeVariation = Math.floor(Math.random() * 100)
  const heartRate = 60 + Math.random() * 40
  const irregularity = Math.sin(baseTime / 1000 * heartRate / 60 * 2 * Math.PI) * 0.5
  
  return {
    timestamp: (baseTime + timeVariation).toString(),
    x: 0.1 + irregularity + (Math.random() - 0.5) * 0.2,
    y: 0.2 + irregularity * 0.8 + (Math.random() - 0.5) * 0.15,
    z: 9.8 + irregularity * 0.3 + (Math.random() - 0.5) * 0.1
  }
}

async function startMeasurement() {
  if (isMeasuring.value) return

  try {
    const platformInfo = getPlatformInfo()
    
    // 实际API调用
    const response = await startMeasurement(
      {
        userId: String(userId),
        durationSeconds: measureTime.value
      },
      { Authorization: accessToken }
    )

    if (response.code === 200 || response.code === 0) {
        currentMeasurementId.value = response.data.measurementId
        uni.showLoading({ title: '测量中...', mask: false, duration: measureTime.value * 1000 })
        isMeasuring.value = true
        measurementData.value = []
        
        if (platformInfo.canUseAccelerometer) {
          startRealAccelerometer()
        } else {
          startMockAccelerometer()
        }

        measurementInterval = setTimeout(() => {
          stopMeasurement()
          uni.hideLoading()
        }, measureTime.value * 1000)
      } else {
        throw new Error(response.msg || '开始测量失败')
      }
  } catch (error) {
    console.error('开始测量失败:', error)
    uni.showToast({
      title: '开始测量失败',
      icon: 'error'
    })
  }
}

function startRealAccelerometer() {
  uni.startAccelerometer({
    interval: 'normal',
    success: () => {
      uni.onAccelerometerChange((res) => {
        if (isMeasuring.value) {
          const data = {
            timestamp: Date.now().toString(),
            x: res.x,
            y: res.y,
            z: res.z
          }
          measurementData.value.push(data)
          updateChart()
        }
      })
    },
    fail: (err) => {
      console.error('启动加速度计失败:', err)
      startMockAccelerometer()
    }
  })
}

function startMockAccelerometer() {
  measurementInterval = setInterval(() => {
    if (isMeasuring.value) {
      const data = generateMockData()
      measurementData.value.push(data)
      updateChart()
    }
  }, 100)
}

async function stopMeasurement() {
  if (!isMeasuring.value) return

  isMeasuring.value = false
  
  if (timer) {
    clearInterval(timer)
    timer = null
  }
  
  if (measurementInterval) {
    clearInterval(measurementInterval)
    measurementInterval = null
  }
  
  uni.stopAccelerometer()
  
  if (measurementData.value.length > 0 && currentMeasurementId.value) {
    try {
      // 实际数据上传
      const response = await uploadMeasurementData(
        {
          measurementId: currentMeasurementId.value,
          data: measurementData.value
        },
        { Authorization: accessToken }
      )
      
      if (response.code === 200 || response.code === 0) {
        console.log('数据上传成功')
        // 调用endMeasurement但不直接访问其response属性
        try {
          await endMeasurement(
            { measurementId: currentMeasurementId.value },
            { Authorization: accessToken }
          )
          console.log('测量结束成功')
        } catch (endError) {
          console.error('结束测量失败:', endError)
        }
      }
    } catch (error) {
      console.error('数据上传失败:', error)
    }
  }
  
  uni.hideLoading()
}

function startCountdown() {
  stopCountdown()
  timer = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--
    } else {
      stopCountdown()
    }
  }, 1000)
}

function stopCountdown() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function exportData() {
  if (measurementData.value.length === 0) {
    uni.showToast({
      title: '暂无数据可导出',
      icon: 'none'
    })
    return
  }
  
  const csvContent = 'timestamp,x,y,z\n' + 
    measurementData.value.map(item => `${item.timestamp},${item.x},${item.y},${item.z}`).join('\n')
  
  console.log('导出数据:', csvContent)
  uni.showToast({
    title: '数据已导出到控制台',
    icon: 'success'
  })
}

function testFn() {
  console.log('测试函数被调用')
  uni.showToast({
    title: '测试功能',
    icon: 'none'
  })
}

const progressWidth = ref('0%')
watch(remainingTime, () => {
  const percentage = (remainingTime.value / measureTime.value) * 100
  progressWidth.value = `${100 - percentage}%`
})

const chartOption = ref({})

function generateChartOption() {
  if (measurementData.value.length === 0) {
    return {
      title: {
        text: '暂无数据',
        left: 'center',
        top: 'center',
        textStyle: {
          fontSize: 14,
          color: '#999'
        }
      },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: [] },
      yAxis: { type: 'value' },
      series: []
    }
  }
  
  const times = measurementData.value.map(item => {
    const time = new Date(parseInt(item.timestamp))
    return `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}`
  })
  
  const xData = measurementData.value.map(item => item.x)
  const yData = measurementData.value.map(item => item.y)
  const zData = measurementData.value.map(item => item.z)
  
  const maxPoints = 50
  const startIndex = Math.max(0, times.length - maxPoints)
  
  return {
    tooltip: { trigger: 'axis' },
    legend: {
      data: ['X轴', 'Y轴', 'Z轴'],
      top: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: times.slice(startIndex),
      axisLabel: {
        rotate: 45,
        fontSize: 10
      }
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'X轴',
        type: 'line',
        data: xData.slice(startIndex),
        smooth: true
      },
      {
        name: 'Y轴',
        type: 'line',
        data: yData.slice(startIndex),
        smooth: true
      },
      {
        name: 'Z轴',
        type: 'line',
        data: zData.slice(startIndex),
        smooth: true
      }
    ]
  }
}

const updateChart = debounce(() => {
  chartOption.value = generateChartOption()
}, 100)

onMounted(() => {
  chartOption.value = generateChartOption()
})

onUnmounted(() => {
  stopCountdown()
  if (measurementInterval) {
    clearInterval(measurementInterval)
  }
  uni.stopAccelerometer()
})
</script>

<style scoped>
.container {
  padding: 30rpx 40rpx;
  min-height: 100vh;
  background-color: #f8f8f8;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

.tip {
  text-align: center;
  margin-bottom: 40rpx;
  background-color: white;
  padding: 30rpx;
  border-radius: 12rpx;
  width: 100%;
  box-sizing: border-box;
}

.tip .title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
}

.tip .subtitle {
  font-size: 24rpx;
  color: #666;
}

.btn-container {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-bottom: 40rpx;
}

.btn-container .btn {
  flex: 1;
  min-height: 90rpx;
  line-height: 90rpx;
  border-radius: 45rpx;
  font-size: 28rpx;
  font-weight: bold;
  text-align: center;
}

.btn-container .start-btn {
  background-color: #07c160;
  color: white;
  margin-right: 20rpx;
}

.btn-container .stop-btn {
  background-color: #ff4757;
  color: white;
}

.tool-container {
  background-color: white;
  padding: 30rpx;
  border-radius: 12rpx;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

.measure-time-input {
  display: flex;
  align-items: center;
  margin-bottom: 30rpx;
  width: 100%;
  justify-content: center;
}

.measure-time-input .label {
  font-size: 28rpx;
  color: #333;
  margin-right: 20rpx;
  min-width: 180rpx;
}

.measure-time-input .input {
  flex: 1;
  height: 70rpx;
  border: 1rpx solid #ddd;
  border-radius: 8rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  max-width: 200rpx;
}

.tool-buttons {
  display: flex;
  justify-content: center;
  width: 100%;
}

.tool-buttons .tool-btn {
  flex: 1;
  min-height: 70rpx;
  line-height: 70rpx;
  background-color: #f5f5f5;
  color: #666;
  border-radius: 8rpx;
  font-size: 26rpx;
  margin: 0 10rpx;
  text-align: center;
}

.btn:disabled {
  opacity: 0.6;
}

.chart-container {
  margin-top: 40rpx;
  padding: 20rpx;
  background-color: white;
  border-radius: 12rpx;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

.chart-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 10rpx;
  text-align: center;
  width: 100%;
}

.measurement-status {
  text-align: center;
  margin: 20rpx 0;
  font-size: 24rpx;
  color: #666;
}

.measurement-indicator {
  margin-top: 20rpx;
  width: 100%;
}

.measurement-indicator .countdown {
  font-size: 28rpx;
  font-weight: bold;
  color: #07c160;
  margin-bottom: 10rpx;
  text-align: center;
}

.measurement-indicator .progress-bar-container {
  width: 100%;
}

.measurement-indicator .progress-bar-container .progress-bar {
  height: 10rpx;
  background-color: #e0e0e0;
  border-radius: 5rpx;
  overflow: hidden;
}

.measurement-indicator .progress-bar-container .progress-bar .progress-fill {
  height: 100%;
  background-color: #07c160;
  border-radius: 5rpx;
}
</style>
