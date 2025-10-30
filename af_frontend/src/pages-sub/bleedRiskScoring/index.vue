<route lang="json5">
{
  style: {
    // navigationStyle: 'custom',
    navigationBarTitleText: '出血风险评分',
  },
}
</route>

<script setup lang="ts">
import scroingItemVue from '@/components/scroingItem/scroingItem.vue'
import useScroingData from '@/store/scroing'
import { storeToRefs } from 'pinia'
import { getQuestionnaireList, commitQuestionnaire } from '@/api/modules/questionnaire'
import { ref } from 'vue'
import { useUserStore } from '@/store'

// 使用用户store获取认证信息
const userStore = useUserStore()
const accessToken = userStore.userInfo?.token || uni.getStorageSync('accessToken')
const userId = userStore.userInfo?.id || uni.getStorageSync('userId')

const scroingData = useScroingData()
// 重置评分数据
scroingData.resetScroingList()
const { score, scroingList } = storeToRefs(scroingData)

const list = ref([])
const length = ref(0)
const loading = ref(false)
const error = ref('')

async function fetchQuestionnaireList(type) {
  try {
    loading.value = true
    error.value = ''
    
    console.log('获取问卷列表，类型:', type)
    console.log('Token:', accessToken)
    
    // 优化API调用方式，添加headers参数
    const res = await getQuestionnaireList(
      { type },
      { headers: { Authorization: accessToken } }
    )
    
    console.log('问卷API响应:', res)
    
    // 增强数据处理逻辑
    if (res && res.success) {
      let questionData = []
      
      if (Array.isArray(res.data)) {
        questionData = res.data
      } else if (res.data && Array.isArray(res.data.list)) {
        questionData = res.data.list
      } else if (res.data && Array.isArray(res.data.questions)) {
        questionData = res.data.questions
      }
      
      list.value = questionData
      length.value = questionData.length
      console.log('加载到的问题数量:', length.value)
      
      // 如果没有数据，显示提示
      if (length.value === 0) {
        uni.showToast({
          title: '暂无题目数据',
          icon: 'none'
        })
      }
    } else {
      console.error('获取问卷失败:', res)
      throw new Error(res?.message || '获取问卷数据失败')
    }
  } catch (err) {
    console.error('获取问卷异常:', err)
    error.value = err instanceof Error ? err.message : '未知错误'
    
    uni.showToast({
      title: '加载失败: ' + error.value,
      icon: 'error'
    })
    
    // 开发环境下添加模拟数据
    if (process.env.NODE_ENV === 'development') {
      console.log('添加模拟数据用于开发测试')
      list.value = [
        { id: 1, itemTitle: '高血压', itemScore: 1 },
        { id: 2, itemTitle: '异常肝肾功能', itemScore: 1 },
        { id: 3, itemTitle: '脑卒中', itemScore: 1 },
        { id: 4, itemTitle: '出血史或出血倾向', itemScore: 1 },
        { id: 5, itemTitle: 'INR波动', itemScore: 1 },
        { id: 6, itemTitle: '老年(>65岁)', itemScore: 1 },
        { id: 7, itemTitle: '药物或饮酒', itemScore: 1 }
      ]
      length.value = list.value.length
    }
  } finally {
    loading.value = false
  }
}

async function commitData() {
  console.log('提交评分数据...')
  console.log('评分列表:', scroingList.value)
  console.log('问题数量:', length.value)

  // 验证所有题目是否已回答
  for (let i = 1; i < length.value + 1; i++) {
    if (scroingList.value[i] === undefined) {
      uni.showToast({
        title: '请完成所有题目',
        icon: 'error',
        duration: 2000
      })
      return
    }
  }

  try {
    uni.showLoading({
      title: '提交中',
    })
    
    // 准备答案数据
    const answers = {}
    for (let i = 1; i < length.value + 1; i++) {
      answers[i] = scroingList.value[i] === 0 ? '否' : '是'
    }
    
    const data = {
      userId: userId,
      type: 'HAS-BLED',
      score: score.value,
      answers: answers,
      submitTime: new Date().toISOString()
    }
    
    console.log('提交数据:', data)
    
    // 优化API调用
    const res = await commitQuestionnaire(data, { headers: { Authorization: accessToken } })
    
    console.log('提交响应:', res)
    
    if (res && res.success) {
      uni.hideLoading()
      uni.showToast({
        title: '提交成功',
        icon: 'success'
      })
      
      // 延迟跳转，确保用户看到成功提示
      setTimeout(() => {
        uni.navigateTo({
          url: '/pages-sub/bleedRiskScore/index',
          success: () => {
            console.log('跳转成功')
          },
          fail: (err) => {
            console.error('跳转失败:', err)
            // 失败时尝试重定向
            uni.redirectTo({
              url: '/pages-sub/bleedRiskScore/index'
            })
          }
        })
      }, 1000)
    } else {
      throw new Error(res?.message || '提交失败')
    }
  } catch (err) {
    uni.hideLoading()
    console.error('提交异常:', err)
    uni.showToast({
      title: '提交失败: ' + (err instanceof Error ? err.message : '未知错误'),
      icon: 'error'
    })
  }
}

function _init() {
  console.log('初始化出血风险评分页面...')
  fetchQuestionnaireList('HAS-BLED')
}

// 页面加载时初始化
_init()

// 提供重新加载功能
function reloadQuestionnaire() {
  console.log('重新加载问卷...')
  scroingData.resetScroingList()
  fetchQuestionnaireList('HAS-BLED')
}
</script>

<template>
  <view class="container">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-state">
      <text>加载中...</text>
    </view>
    
    <!-- 错误提示 -->
    <view v-else-if="error" class="error-state">
      <text>{{ error }}</text>
      <button @click="reloadQuestionnaire" class="reload-btn">重新加载</button>
    </view>
    
    <!-- 问卷内容 -->
    <view v-else-if="list.length > 0">
      <view class="item" v-for="(item, index) in list" :key="item.id || index">
        <scroingItemVue
          :title="item.itemTitle"
          :score="item.itemScore"
          :index="index + 1"
        ></scroingItemVue>
      </view>
      <view class="takeup"></view>
    </view>
    
    <!-- 空状态 -->
    <view v-else class="empty-state">
      <text>暂无题目数据</text>
      <button @click="reloadQuestionnaire" class="reload-btn">重新加载</button>
    </view>

    <!-- 底部操作按钮 -->
    <view class="bottom">
      <view class="score">
        <text>总分</text>
        <text class="score-value">{{ score }}</text>
      </view>
      <view class="btn">
        <button @click="commitData" class="submit-btn">确认</button>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.container {
  box-sizing: border-box;
  width: 100vw;
  min-height: 100vh;
  padding: 30rpx;
}

.takeup {
  height: 80px;
  background-color: transparent;
  width: 100%;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100rpx 0;
  text-align: center;
  
  text {
    font-size: 32rpx;
    color: #666;
    margin-bottom: 30rpx;
  }
}

.error-state text {
  color: #e64340;
}

.reload-btn {
  background-color: #18ca85;
  color: white;
  font-size: 28rpx;
  border-radius: 20rpx;
  padding: 0 40rpx;
}

.bottom {
  background-color: white;
  border-top: 1px solid #b8b8b8;
  border-radius: 20rpx 20rpx 0 0;
  width: 100vw;
  height: 60px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);

  > view {
    &.score {
      display: flex;
      align-items: center;
      line-height: 60px;
      font-size: 28rpx;
      color: #333;

      .score-value {
        font-size: 48rpx;
        font-weight: bold;
        color: #18ca85;
        margin-left: 20rpx;
      }
    }

    &.btn {
      width: 30%;
      
      .submit-btn {
        background-color: #18ca85;
        border-radius: 20px;
        color: white;
        font-size: 28rpx;
        border: none;
      }
    }
  }
}
</style>
