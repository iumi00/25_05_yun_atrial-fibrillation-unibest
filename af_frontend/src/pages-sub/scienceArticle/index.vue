<template>
  <view class="article-container">
    <!-- 加载状态 -->
    <view v-if="loading" class="loading-container">
      <view class="loading-spinner"></view>
      <view class="loading-text">加载中...</view>
    </view>
    
    <!-- 错误状态 -->
    <view v-else-if="error" class="error-container">
      <view class="error-icon">⚠️</view>
      <view class="error-text">{{ error }}</view>
      <button class="retry-button" @click="loadArticleData">重试</button>
    </view>
    
    <!-- 文章内容 -->
    <view v-else class="article-content">
      <!-- 原生web-view用于展示文章 -->
      <web-view v-if="articleUrl" :src="articleUrl" @message="handleMessage"></web-view>
      
      <!-- 无链接时的默认展示 -->
      <view v-else class="default-content">
        <view class="article-header">
          <view class="article-title">{{ articleTitle || '文章详情' }}</view>
          <view class="article-time">{{ articleTime || new Date().toLocaleDateString() }}</view>
        </view>
        <view class="no-article-tip">
          暂无文章内容，请检查链接是否正确
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'ScienceArticle',
  data() {
    return {
      // 页面状态
      loading: false,
      error: '',
      articleUrl: '',
      articleTitle: '',
      articleTime: '',
      // 页面参数
      articleId: 0,
      externalHref: ''
    }
  },
  onLoad(options) {
    if (options) {
      this.articleId = Number(options.id || 0)
      this.externalHref = options.href ? decodeURIComponent(options.href) : ''
    }
    this.loadArticleData()
  },
  methods: {
    async loadArticleData() {
      this.loading = true
      this.error = ''
      
      try {
        // 优先使用传入的外部链接
        if (this.externalHref) {
          this.articleUrl = this.externalHref
          // 尝试从API获取更多信息
          if (this.articleId > 0) {
            await this.fetchArticleInfo()
          }
        } else if (this.articleId > 0) {
          // 如果没有外部链接但有ID，尝试从API获取完整文章
          await this.fetchArticleInfo()
        } else {
          this.error = '未提供文章信息'
        }
      } catch (err) {
        console.error('加载文章失败:', err)
        this.error = '加载文章失败，请重试'
      } finally {
        this.loading = false
      }
    },
    
    async fetchArticleInfo() {
      try {
        // 动态导入API，避免编译错误
        const { getPopularizationArticle } = await import('@/api/modules/popularization')
        const response = await getPopularizationArticle(this.articleId)
        if (response && response.data) {
          const article = response.data
          this.articleTitle = article.title || this.articleTitle
          this.articleTime = article.time || this.articleTime
          
          // 如果API返回了链接，则使用API返回的链接
          if (article.href) {
            this.articleUrl = article.href
          }
        }
      } catch (err) {
        console.error('获取文章详情失败:', err)
        // 不抛出错误，继续使用已有信息
      }
    },
    
    handleMessage(e) {
      try {
        console.log('Web-view message:', e)
        // 可以根据需要处理来自web-view的消息
      } catch (err) {
        console.error('处理web-view消息失败:', err)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.article-container {
  position: relative;
  min-height: 100vh;
  background-color: #f8f8f8;
}

// 加载状态样式
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  
  .loading-spinner {
    width: 50rpx;
    height: 50rpx;
    border: 6rpx solid #f3f3f3;
    border-top: 6rpx solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 20rpx;
  }
  
  .loading-text {
    font-size: 28rpx;
    color: #666;
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

// 错误状态样式
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 60vh;
  padding: 40rpx;
  
  .error-icon {
    font-size: 80rpx;
    margin-bottom: 20rpx;
  }
  
  .error-text {
    font-size: 28rpx;
    color: #666;
    text-align: center;
    margin-bottom: 30rpx;
  }
  
  .retry-button {
    padding: 15rpx 40rpx;
    background-color: #1989fa;
    color: white;
    border: none;
    border-radius: 20rpx;
    font-size: 28rpx;
  }
}

// 默认内容样式
.default-content {
  padding: 30rpx;
  
  .article-header {
    margin-bottom: 30rpx;
    
    .article-title {
      font-size: 36rpx;
      font-weight: bold;
      color: #333;
      margin-bottom: 15rpx;
    }
    
    .article-time {
      font-size: 24rpx;
      color: #999;
    }
  }
  
  .no-article-tip {
    font-size: 28rpx;
    color: #666;
    text-align: center;
    padding: 40rpx;
    background-color: #fff;
    border-radius: 20rpx;
  }
}

// Web-view容器样式
web-view {
  width: 100%;
  min-height: 100vh;
}
</style>
