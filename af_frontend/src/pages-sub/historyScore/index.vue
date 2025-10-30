<route lang="json5">
{
  style: {
    // navigationStyle: 'custom',
    navigationBarTitleText: '历史记录',
  },
}
</route>

<!-- <script setup lang="ts">
import historyItemVue from '@/components/historyItem/historyItem.vue'
// 已在下面导入新API

const accessToken = uni.getStorageSync('accessToken')
const userId = uni.getStorageSync('userId')

let historyList1 = ref([])
let historyList2 = ref([])
let historyList = computed(() => {
  return historyList1.value.concat(historyList2.value).sort((a, b) => {
    return b.id - a.id
  })
})

function transformTime(dat) {
  // return dat.join("-");
  return dat
}


}

function getUrl(id, type) {
  return `/pages-sub/historyScoreItem/index?answerId=${id}&type=${type == '出血风险' ? '1' : '0'}`
}

async function _init() {
  await getMyQuestionnaireList('CHA2DS2-VASc')
  await getMyQuestionnaireList('HAS-BLED')
}

_init()
</script>


<!-- af_frontend/src/pages-sub/historyScore/index.vue -->
<route lang="json5">
{
  style: {
    navigationBarTitleText: '历史记录',
  },
}
</route>

<script>
import { getQuestionnaireHistory } from '@/api/modules/questionnaire'
import { useUserStore } from '@/store'

export default {
  data() {
    return {
      loading: true,
      historyList: [],
      userStore: null
    }
  },
  
  onLoad() {
    this.userStore = useUserStore()
    this.loadHistoryData()
  },
  
  methods: {
    async loadHistoryData() {
      try {
        this.loading = true
        
        const userId = this.userStore.userInfo.id
        console.log('加载历史记录，用户ID:', userId)
        
        const response = await getQuestionnaireHistory(
          { userId: String(userId) },
          { Authorization: this.userStore.userInfo.token }
        )
        
        console.log('历史记录响应:', response)
        
        if (response.success) {
          this.historyList = response.data
          console.log('历史记录列表:', this.historyList)
        } else {
          throw new Error(response.message || '获取历史记录失败')
        }
        
      } catch (error) {
        console.error('加载历史记录失败:', error)
        uni.showToast({
          title: '加载历史记录失败',
          icon: 'error'
        })
      } finally {
        this.loading = false
      }
    },
    
    // 格式化时间
    formatTime(timestamp) {
      if (!timestamp) return ''
      const date = new Date(timestamp)
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    },
    
    // 获取评分等级
    getScoreLevel(score) {
      if (score >= 2) return '高危'
      if (score === 1) return '中危'
      return '低危'
    },
    
    // 获取评分等级颜色
    getScoreLevelColor(score) {
      if (score >= 2) return '#ff4757'
      if (score === 1) return '#ffa502'
      return '#2ed573'
    },
    
    // 查看详情
    viewDetail(record) {
      console.log('查看详情:', record)
      // uni.navigateTo({
      //   url: `/pages-sub/historyScoreItem/index?id=${record.id}&type=${record.questionnaireType}&score=${record.score}`
      // })
      uni.navigateTo({
        url: record.questionnaireType=='CHA2DS2-VASc'?`/pages-sub/thrombusScore/index?score=${record.score}`:`/pages-sub/bleedRiskScore/index?score=${record.score}`
      })
    },
    
    // 下拉刷新
    onPullDownRefresh() {
      this.loadHistoryData().then(() => {
        uni.stopPullDownRefresh()
      })
    }
  }
}
</script>

<template>
  <view class="container">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading">
      <text>加载中...</text>
    </view>
    
    <!-- 历史记录列表 -->
    <view v-else class="history-list">
      <view v-if="historyList.length === 0" class="empty-state">
        <text>暂无历史记录</text>
      </view>
      
      <view 
        v-for="(record, index) in historyList" 
        :key="record.id"
        class="history-item"
        @click="viewDetail(record)"
      >
        <view class="item-header">
          <text class="questionnaire-type">{{ record.questionnaireDisplayName }}</text>
          <text class="submit-time">{{ formatTime(record.submitTime) }}</text>
        </view>
        
        <view class="item-content">
          <view class="score-info">
            <text class="score-label">评分:</text>
            <text class="score-value" :style="{ color: getScoreLevelColor(record.score) }">
              {{ record.score }}
            </text>
            <text class="score-level" :style="{ color: getScoreLevelColor(record.score) }">
              ({{ getScoreLevel(record.score) }})
            </text>
          </view>
          
          <view class="status-info">
            <text class="status" :class="record.status">{{ record.status === 'completed' ? '已完成' : '草稿' }}</text>
          </view>
        </view>
        
        <view class="item-footer">
          <text class="view-detail">点击查看详情 ></text>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
.container {
  box-sizing: border-box;
  padding: 30rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.loading {
  text-align: center;
  padding: 100rpx 0;
  color: #666;
}

.empty-state {
  text-align: center;
  padding: 100rpx 0;
  color: #999;
}

.history-list {
  .history-item {
    background-color: white;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
    
    .item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
      
      .questionnaire-type {
        font-size: 32rpx;
        font-weight: bold;
        color: #333;
      }
      
      .submit-time {
        font-size: 24rpx;
        color: #999;
      }
    }
    
    .item-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
      
      .score-info {
        display: flex;
        align-items: center;
        
        .score-label {
          font-size: 28rpx;
          color: #666;
          margin-right: 10rpx;
        }
        
        .score-value {
          font-size: 36rpx;
          font-weight: bold;
          margin-right: 10rpx;
        }
        
        .score-level {
          font-size: 24rpx;
        }
      }
      
      .status-info {
        .status {
          padding: 8rpx 16rpx;
          border-radius: 20rpx;
          font-size: 24rpx;
          
          &.completed {
            background-color: #d4edda;
            color: #155724;
          }
          
          &.draft {
            background-color: #fff3cd;
            color: #856404;
          }
        }
      }
    }
    
    .item-footer {
      text-align: right;
      
      .view-detail {
        font-size: 24rpx;
        color: #007aff;
      }
    }
  }
}
</style>