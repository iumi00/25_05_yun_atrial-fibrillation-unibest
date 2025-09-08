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
import { useUserStore } from '@/store'
import {
  _api_startMeasurement,
  _api_uploadMeasurementData,
  _api_endMeasurement,
} from '@/service/myService/measurement'

const userStore = useUserStore()
const accessToken = userStore.userInfo.token
const userId = userStore.userInfo.id

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
const currentMeasurementId = ref<number | null>(null)

// 保存回调函数引用
let accelerometerCallback: ((res: any) => void) | null = null
// function startMeasurement() {
//   if (isMeasuring.value) return

//   uni.showLoading({ title: '测量中...', mask: true, duration: 100000 })
//   isMeasuring.value = true
//   measurementData.value = []

//   uni.startAccelerometer({
//     interval: 'game',
//     success() {
//       console.log('Accelerometer started')
//     },
//   })

//   uni.onAccelerometerChange((res) => {
//     /*measurementData.value.push({
//       x: res.x,
//       y: res.y,
//       z: res.z,
//       timestamp: dayjs().valueOf().toString(),
//     })*/
//     measurementData.value = [
//       ...measurementData.value, // 保留历史数据
//       {
//         x: res.x,
//         y: res.y,
//         z: res.z,
//         timestamp: dayjs().valueOf().toString(),
//       },
//     ]

//     updateChart()
//   })
//   // 设置测量时间
//   measurementInterval = setTimeout(
//     () => {
//       stopMeasurement()
//       uni.hideLoading()
//     },
//     measureTime.value * 1000 + 500,
//   )
// }

// function stopMeasurement() {
//   uni.offAccelerometerChange((res) => {
//     console.log('Accelerometer stopped')
//   })
//   uni.stopAccelerometer()
//   if (measurementInterval) {
//     clearTimeout(measurementInterval)
//     measurementInterval = null
//   }
//   isMeasuring.value = false
// }
async function startMeasurement() {
  if (isMeasuring.value) return

  try {
    // 调用后端API开始测量
    const response = await _api_startMeasurement(
      {
        userId: String(userId),
        durationSeconds: measureTime.value,
      },
      { Authorization: accessToken },
    )

    if (response.success) {
      currentMeasurementId.value = response.data.measurementId
      console.log('测量开始，ID:', currentMeasurementId.value)

      uni.showLoading({ title: '测量中...', mask: false, duration: 100000 })
      isMeasuring.value = true
      measurementData.value = []

      uni.startAccelerometer({
        interval: 'game',
        success() {
          console.log('Accelerometer started')
        },
      })

      // 定义回调函数并保存引用
      accelerometerCallback = (res: any) => {
        const newData = {
          x: res.x,
          y: res.y,
          z: res.z,
          timestamp: dayjs().valueOf().toString(),
        }

        measurementData.value = [...measurementData.value, newData]
        updateChart()
      }

      // 监听加速度计变化
      uni.onAccelerometerChange(accelerometerCallback)

      // 设置测量时间
      measurementInterval = setTimeout(
        () => {
          stopMeasurement()
          uni.hideLoading()
        },
        measureTime.value * 1000 + 500,
      )
    } else {
      throw new Error(response.message || '开始测量失败')
    }
  } catch (error) {
    console.error('开始测量失败:', error)
    uni.showToast({
      title: '开始测量失败',
      icon: 'error',
    })
  }
}

async function stopMeasurement() {
  try {
    // 正确取消监听，传入回调函数
    if (accelerometerCallback) {
      uni.offAccelerometerChange(accelerometerCallback)
      accelerometerCallback = null
    }

    uni.stopAccelerometer()

    if (measurementInterval) {
      clearTimeout(measurementInterval)
      measurementInterval = null
    }

    isMeasuring.value = false

    // 如果有测量ID和数据，上传到后端
    if (currentMeasurementId.value && measurementData.value.length > 0) {
      console.log('上传测量数据，数据点数量:', measurementData.value.length)

      const uploadResponse = await _api_uploadMeasurementData(
        {
          measurementId: currentMeasurementId.value,
          data: measurementData.value,
        },
        { Authorization: accessToken },
      )

      if (uploadResponse.success) {
        console.log('数据上传成功')

        // 结束测量
        const endResponse = await _api_endMeasurement(
          { measurementId: currentMeasurementId.value },
          { Authorization: accessToken },
        )

        if (endResponse.success) {
          console.log('测量结束，分析结果:', endResponse.data.analysisResult)
          uni.showToast({
            title: '测量完成',
            icon: 'success',
          })
        }
      }
    }

    currentMeasurementId.value = null
  } catch (error) {
    console.error('停止测量失败:', error)
    uni.showToast({
      title: '停止测量失败',
      icon: 'error',
    })
  }
}

// function exportData() {
//   // 检查是否有数据可以导出
//   if (measurementData.value.length === 0) {
//     uni.showToast({
//       title: '没有数据可以导出',
//       icon: 'none',
//     })
//     return
//   }

//   // 将数据转换为CSV内容
//   const csvContent = measurementData.value
//     .map((data) => `${data.timestamp},${data.x},${data.y},${data.z}`)
//     .join('\n')

//   // 使用 uni.getFileSystemManager 进行文件操作
//   const fs = uni.getFileSystemManager()
//   // 生成文件名，包含当前时间以避免重复
//   const filename = `accelerometer_data_${getFormattedTimestamp()}.csv`

//   try {
//     // 创建临时文件路径
//     const tempFilePath = `${uni.env.USER_DATA_PATH}/${filename}`
//     // 将CSV内容写入临时文件
//     fs.writeFileSync(tempFilePath, csvContent)

//     // 使用uni.saveFile将临时文件保存为永久文件
//     uni.saveFile({
//       tempFilePath,
//       success: (res) => {
//         uni.showToast({
//           title: '数据导出成功',
//           icon: 'success',
//         })
//         console.log('文件保存路径:', res.savedFilePath)
//         // 自动打开保存的文件
//         uni.openDocument({
//           filePath: res.savedFilePath,
//           fileType: 'csv',
//           success: () => {
//             console.log('文件打开成功')
//           },
//           fail: (err) => {
//             console.error('文件打开失败:', err)
//           },
//         })
//       },
//       fail: (err) => {
//         uni.showToast({
//           title: '数据导出失败',
//           icon: 'none',
//         })
//         console.error('文件保存失败:', err)
//       },
//     })
//   } catch (error) {
//     uni.showToast({
//       title: '文件写入失败',
//       icon: 'none',
//     })
//     console.error('文件写入失败:', error)
//   }
// }
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

  // 添加CSV头部
  const csvHeader = 'timestamp,x,y,z\n'
  const fullCsvContent = csvHeader + csvContent

  // 生成文件名
  const filename = `accelerometer_data_${getFormattedTimestamp()}.csv`

  // 跨平台文件导出
  exportFileCrossPlatform(fullCsvContent, filename)
}

// 跨平台文件导出函数
function exportFileCrossPlatform(content: string, filename: string) {
  // 检测平台
  const systemInfo = uni.getSystemInfoSync()
  console.log('当前平台信息:', systemInfo)

  // #ifdef H5
  exportFileForH5(content, filename)
  // #endif

  // #ifdef MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ
  exportFileForMiniProgram(content, filename)
  // #endif

  // #ifdef APP-PLUS
  exportFileForApp(content, filename)
  // #endif

  // #ifndef H5 || MP-WEIXIN || MP-ALIPAY || MP-BAIDU || MP-TOUTIAO || MP-QQ || APP-PLUS
  // 其他平台使用剪贴板
  copyToClipboard(content)
  // #endif
}

// H5平台文件导出
function exportFileForH5(content: string, filename: string) {
  try {
    // 创建Blob对象
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })

    // 创建下载链接
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.style.display = 'none'

    // 添加到页面并触发下载
    document.body.appendChild(link)
    link.click()

    // 清理
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)

    uni.showToast({
      title: '数据导出成功',
      icon: 'success',
    })
  } catch (error) {
    console.error('H5文件导出失败:', error)
    // 降级到剪贴板
    copyToClipboard(content)
  }
}
// 小程序平台文件导出
function exportFileForMiniProgram(content: string, filename: string) {
  try {
    // 使用 uni.getFileSystemManager
    const fs = uni.getFileSystemManager()

    // 创建临时文件路径
    const tempFilePath = `${uni.env.USER_DATA_PATH}/${filename}`

    // 将CSV内容写入临时文件
    fs.writeFileSync(tempFilePath, content, 'utf8')

    // 使用uni.saveFile将临时文件保存为永久文件
    uni.saveFile({
      tempFilePath,
      success: (res) => {
        uni.showToast({
          title: '数据导出成功',
          icon: 'success',
        })
        console.log('文件保存路径:', res.savedFilePath)

        // 尝试打开文件
        uni.openDocument({
          filePath: res.savedFilePath,
          fileType: 'csv',
          success: () => {
            console.log('文件打开成功')
          },
          fail: (err) => {
            console.error('文件打开失败:', err)
            // 即使打开失败，文件也已经保存成功
          },
        })
      },
      fail: (err) => {
        console.error('文件保存失败:', err)
        // 降级到剪贴板
        copyToClipboard(content)
      },
    })
  } catch (error) {
    console.error('小程序文件导出失败:', error)
    // 降级到剪贴板
    copyToClipboard(content)
  }
}
// App平台文件导出
function exportFileForApp(content: string, filename: string) {
  try {
    // 使用 uni.getFileSystemManager
    const fs = uni.getFileSystemManager()

    // 创建临时文件路径
    const tempFilePath = `${uni.env.USER_DATA_PATH}/${filename}`

    // 将CSV内容写入临时文件
    fs.writeFileSync(tempFilePath, content, 'utf8')

    // 使用uni.saveFile将临时文件保存为永久文件
    uni.saveFile({
      tempFilePath,
      success: (res) => {
        uni.showToast({
          title: '数据导出成功',
          icon: 'success',
        })
        console.log('文件保存路径:', res.savedFilePath)

        // 尝试打开文件
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
        console.error('文件保存失败:', err)
        // 降级到剪贴板
        copyToClipboard(content)
      },
    })
  } catch (error) {
    console.error('App文件导出失败:', error)
    // 降级到剪贴板
    copyToClipboard(content)
  }
}

// 备用方案：复制到剪贴板
function copyToClipboard(content: string) {
  // #ifdef H5
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        uni.showToast({
          title: '数据已复制到剪贴板',
          icon: 'success',
        })
      })
      .catch(() => {
        fallbackCopyToClipboard(content)
      })
  } else {
    fallbackCopyToClipboard(content)
  }
  // #endif

  // #ifndef H5
  uni.setClipboardData({
    data: content,
    success: () => {
      uni.showToast({
        title: '数据已复制到剪贴板',
        icon: 'success',
      })
    },
    fail: () => {
      uni.showToast({
        title: '复制失败',
        icon: 'none',
      })
    },
  })
  // #endif
}

// 备用复制方案
function fallbackCopyToClipboard(text: string) {
  const textArea = document.createElement('textarea')
  textArea.value = text
  textArea.style.position = 'fixed'
  textArea.style.left = '-999999px'
  textArea.style.top = '-999999px'
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()

  try {
    document.execCommand('copy')
    uni.showToast({
      title: '数据已复制到剪贴板',
      icon: 'success',
    })
  } catch (err) {
    uni.showToast({
      title: '复制失败',
      icon: 'none',
    })
  }

  document.body.removeChild(textArea)
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
