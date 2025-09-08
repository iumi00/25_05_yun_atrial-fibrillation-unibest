<route lang="json5" type="page">
{
  style: {
    navigationStyle: 'default',
    navigationBarTitleText: '房颤检测',
  },
}
</route>

<script setup lang="ts">
import { getFormattedTimestamp } from '@/utils/timeCompiler'
import dayjs from 'dayjs'
import { debounce } from 'lodash'

type IMeasurementData = {
  timestamp: string
  x: number
  y: number
  z: number
}

const measurementData = ref<IMeasurementData[]>([])
const isMeasuring = ref(false)
let measurementInterval = null
const measureTime = ref(60)

function startMeasurement() {
  if (isMeasuring.value) return

  uni.showLoading({ title: '测量中...', mask: true, duration: 100000 })
  isMeasuring.value = true
  measurementData.value = []

  uni.startAccelerometer({
    interval: 'game',
    success() {
      console.log('Accelerometer started')
    },
  })

  uni.onAccelerometerChange((res) => {
    /*measurementData.value.push({
      x: res.x,
      y: res.y,
      z: res.z,
      timestamp: dayjs().valueOf().toString(),
    })*/
    measurementData.value = [
      ...measurementData.value, // 保留历史数据
      {
        x: res.x,
        y: res.y,
        z: res.z,
        timestamp: dayjs().valueOf().toString(),
      },
    ]

    updateChart()
  })
  // 设置测量时间
  measurementInterval = setTimeout(
    () => {
      stopMeasurement()
      uni.hideLoading()
    },
    measureTime.value * 1000 + 500,
  )
}

function stopMeasurement() {
  uni.offAccelerometerChange((res) => {
    console.log('Accelerometer stopped')
  })
  uni.stopAccelerometer()
  if (measurementInterval) {
    clearTimeout(measurementInterval)
    measurementInterval = null
  }
  isMeasuring.value = false
}

function exportData() {
  // 检查是否有数据可以导出
  if (measurementData.value.length === 0) {
    uni.showToast({
      title: '没有数据可以导出',
      icon: 'none',
    })
    return
  }

  // 将数据转换为CSV内容
  const csvContent = measurementData.value
    .map((data) => `${data.timestamp},${data.x},${data.y},${data.z}`)
    .join('\n')

  // 使用 uni.getFileSystemManager 进行文件操作
  const fs = uni.getFileSystemManager()
  // 生成文件名，包含当前时间以避免重复
  const filename = `accelerometer_data_${getFormattedTimestamp()}.csv`

  try {
    // 创建临时文件路径
    const tempFilePath = `${uni.env.USER_DATA_PATH}/${filename}`
    // 将CSV内容写入临时文件
    fs.writeFileSync(tempFilePath, csvContent)

    // 使用uni.saveFile将临时文件保存为永久文件
    uni.saveFile({
      tempFilePath,
      success: (res) => {
        uni.showToast({
          title: '数据导出成功',
          icon: 'success',
        })
        console.log('文件保存路径:', res.savedFilePath)
        // 自动打开保存的文件
        uni.openDocument({
          filePath: res.savedFilePath,
          fileType: 'csv',
          success: () => {
            console.log('文件打开成功')
          },
          fail: (err) => {
            console.error('文件打开失败:', err)
          },
        })
      },
      fail: (err) => {
        uni.showToast({
          title: '数据导出失败',
          icon: 'none',
        })
        console.error('文件保存失败:', err)
      },
    })
  } catch (error) {
    uni.showToast({
      title: '文件写入失败',
      icon: 'none',
    })
    console.error('文件写入失败:', error)
  }
}

const chartOption = ref(generateChartOption())

function generateChartOption() {
  // 将时间戳转换为易读格式（分钟:秒:毫秒）
  const formatTimestamp = (ts: string) => dayjs(parseInt(ts)).format('mm:ss:SSS')

  if (measurementData.value.length === 0) {
    return {
      graphic: {
        type: 'text',
        left: 'center',
        top: 'middle',
        silent: true, // 不响应事件
        style: {
          fill: '#9d9d9d',
          fontWeight: 'bold',
          text: '暂无数据，请开始测量',
          fontSize: 15,
          textAlign: 'center',
        },
      },
    }
  }

  const allValues = []
  const timestamps = []

  for (const d of measurementData.value) {
    allValues.push(d.x, d.y, d.z)
    timestamps.push(d.timestamp)
  }

  const minVal = Math.min(...allValues)
  const maxVal = Math.max(...allValues)

  return {
    tooltip: {
      trigger: 'axis',
      textStyle: {
        textShadowColor: 'transparent', // 文字块背景阴影颜色
        textShadowBlur: 10, // 文字块的背景阴影长度
      },
    },
    legend: { data: ['X轴', 'Y轴', 'Z轴'] },
    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      name: '时间',
      data: timestamps,
      axisLabel: {
        rotate: -60, // 标签旋转45度
        // interval: 0, // 强制显示所有标签
        // interval: (index: number) => index % 5 === 0, // 间隔显示标签
        formatter: formatTimestamp,
      },
      axisTick: {
        alignWithLabel: true, // 刻度线与标签对齐
      },
    },
    yAxis: {
      type: 'value',
      name: '加速度值',
      min: Math.floor(minVal),
      max: Math.ceil(maxVal),
    },
    series: [
      {
        name: 'X轴',
        type: 'line',
        data: measurementData.value.map((data) => data.x),
      },
      {
        name: 'Y轴',
        type: 'line',
        data: measurementData.value.map((data) => data.y),
      },
      {
        name: 'Z轴',
        type: 'line',
        data: measurementData.value.map((data) => data.z),
      },
    ],
  }
}

let updateChart = debounce(() => {
  chartOption.value = generateChartOption()
}, 300) // 300ms防抖，每秒最多更新3-4次

const testFn = () => {
  measurementData.value = [
    {
      timestamp: dayjs().valueOf().toString(),
      x: 12,
      y: 24,
      z: 31,
    },
    {
      timestamp: (dayjs().valueOf() + 10).toString(),
      x: 42,
      y: 35,
      z: 16,
    },
    {
      timestamp: (dayjs().valueOf() + 20).toString(),
      x: 27,
      y: 48,
      z: 98,
    },
  ]
  console.log(measurementData.value)
  console.log(chartOption)
}
</script>

<template>
  <view class="min-h-screen box-border">
    <view class="">
      <view class="text-center">加速度计测量</view>
      <view class="flex justify-between items-center flex-wrap">
        <button @click="startMeasurement">开始测量</button>
        <button @click="stopMeasurement">停止测量</button>
        <button @click="exportData">导出数据</button>
        <button @click="testFn">测试</button>
      </view>
      <view class="flex justify-between items-center flex-wrap">
        <view>
          <wd-input
            label="测量时间/s"
            type="text"
            v-model="measureTime"
            placeholder="请输入用户名"
          />
        </view>
      </view>
    </view>
    <view class="flex flex-col">
      <view class="w-full box-border p-4">
        <cus-chart :option="chartOption"></cus-chart>
      </view>
      <view>{{ measurementData.length }}</view>
    </view>
  </view>
</template>

<style scoped lang="scss"></style>
