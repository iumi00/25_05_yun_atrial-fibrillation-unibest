<!-- 使用 type="home" 属性设置首页，其他页面不需要设置，默认为page；推荐使用json5，更强大，且允许注释 -->
<route lang="json5" type="home">
{
  style: {
    // navigationStyle: 'custom',
    navigationBarTitleText: '首页',
  },
}
</route>

<script setup lang="ts">
// 1. 【新增】从 pinia 引入我们的用户 store
import { useUserStore } from '@/store'

// 2. 【新增】获取 store 实例，之后在模板中可以直接使用
const userStore = useUserStore()

import indexGridBoxesVue from '../../components/indexGridBoxes/indexGridBoxes.vue'
import indexScoreListVue from '../../components/indexScoreList/indexScoreList.vue'
import indexScienceCardVue from '../../components/indexScienceCard/indexScienceCard.vue'
import knowledgeSelfTest from '@/components/knowledge-self-test/knowledge-self-test.vue'
import { formatTime2yyyymmddhhmmss } from '@/utils/timeCompiler'

import { computed, ref, onMounted } from 'vue'
import { _api_getMyQuestionnaireHistory, _api_getPopularizationArticle } from '@/service'

// type IUserInfo = {
//   phone: string
//   nickname: string
//   avatar: string
// }

// const userInfo = ref<IUserInfo>({
//   phone: '加载中',
//   nickname: '加载中',
//   avatar: '../../static/logo.png',
// })

const advertiseList = ref([
  {
    title: '房颤管理系统指南',
    time: '2024-09-14',
  },
  {
    title: 'test2',
    time: '2024-09-25',
  },
])
const gridBoxesList = ref([
  {
    img: '',
    icontext: '\ue629',
    text: '病例信息',
    fontBGColor: '#1dd78f',
    fontSize: '40px',
    textSize: '16px',
    fontColor: 'white',
    url: '/pages-sub/profile/index',
  },
  {
    img: '',
    icontext: '\ue604',
    text: '风险自测',
    fontBGColor: '#1acba8',
    fontSize: '50px',
    textSize: '16px',
    fontColor: 'white',
    url: '/pages-sub/thrombusScore/index',
  },
  {
    img: '',
    icontext: '\ue60e',
    text: '知识自测',
    fontBGColor: '#1b91ff',
    fontSize: '40px',
    textSize: '16px',
    fontColor: 'white',
    url: '/pages-sub/scienceArticle/index',
  },
  {
    img: '',
    icontext: '\ue95c',
    text: '在线随访',
    fontBGColor: '#932df9',
    fontSize: '40px',
    textSize: '16px',
    fontColor: 'white',
    url: '/pages-sub/historyScore/index',
  },
])
const scoreList = ref([
  {
    url: '/pages-sub/thrombusScoring/index',
    mainTitle: '血栓风险评分计算',
    subTitle: 'CHA2DS2-VASc-60',
    iconColor: `linear-gradient(#caff55 20%, #45cd00 60%)`,
    score: '6',
    icontext: '\ue636',
  },
  {
    url: '/pages-sub/bleedRiskScoring/index',
    mainTitle: '出血风险评分计算',
    subTitle: 'HAS-BLED',
    iconColor: `linear-gradient(#eff7f9 20%, #9cbee3 60%)`,
    icontext: '\ue60d',
  },
])
const score = ref([])
const scoreListWithScore = computed(() => {
  return scoreList.value.map((item, index) => {
    return {
      ...item,
      score: score.value[index],
    }
  })
})
const scienceCardList = ref([
  {
    id: 1,
    src: '/static/logo.png',
    title: '房颤抗凝治疗',
    time: formatTime2yyyymmddhhmmss(new Date('2024-09-24')),
    href: 'https://cn.bing.com/',
  },
])
// const accessToken = uni.getStorageSync('accessToken')
// const userId = uni.getStorageSync('userId')
// 5. 【修改】注意：现在 token 和 userId 都应该从 userStore 中获取，这样更安全和规范
const accessToken = userStore.userInfo.token
const userId = String(userStore.userInfo.id)

/**
 * 异步获取用户信息
 *
 * 此函数调用_api_getUserInfo方法获取用户信息，并更新userInfo对象的值
 */
// async function getUserInfo() {
//   const res = await _api_getUserInfo({ accessToken })
//   console.log('getUserInfo', res)
//   userInfo.value.phone = res.data.phone
//   userInfo.value.nickname = res.data.nickName
//   userInfo.value.avatar = res.data.avatar
// }

/**
 * 异步获取用户的问卷列表
 *
 * 此函数通过调用_api_getMyQuestionnaireList来获取特定用户和类型的问卷列表，并根据问卷类型更新分数
 *
 * @param {string} type 问卷类型,CHA2DS2-VASc、HAS-BLED
 */
async function getMyQuestionnaireList(type: string) {
  // 调用API获取用户特定类型的问卷列表
  try {
    // 调用API获取用户特定类型的问卷列表
    const response = await _api_getMyQuestionnaireHistory({ userId, type }, { accessToken })

    if (response.success && response.data.length > 0) {
      // 根据问卷类型更新相应的分数
      if (type == 'CHA2DS2-VASc') {
        score.value[0] = response.data[0].score
      } else if (type == 'HAS-BLED') {
        score.value[1] = response.data[0].score
      } else {
        console.log('未知问卷类型')
      }
    }
  } catch (error) {
    console.error('获取问卷列表失败:', error)
  }
}

/**
 * 异步获取科普文章列表
 *
 * 该函数通过调用_api_getPopularizationArticle方法获取科普文章数据，并将其格式化后赋值给scienceCardList
 */
async function getPopularizationArticle() {
  // 调用_api_getPopularizationArticle方法获取科普文章数据
  try {
    const res = await _api_getPopularizationArticle({ accessToken })
    // console.log(res);
    // 将获取到的科普文章数据进行格式化处理，并赋值给scienceCardList
    scienceCardList.value = res.data.map((item) => {
      return {
        id: item.id,
        title: item.title,
        time: formatTime2yyyymmddhhmmss(new Date(item.time)),
        href: item.url,
      }
    })
  } catch (error) {
    console.error('获取科普文章失败:', error)
  }
}

async function _init() {
  // await getUserInfo()
  await getMyQuestionnaireList('CHA2DS2-VASc')
  await getMyQuestionnaireList('HAS-BLED')
  await getPopularizationArticle()
}

onMounted(async () => {
  await _init()
})
</script>

<template>
  <view class="container">
    <view class="topBG">
      <!-- 用户信息卡片 -->
      <navigator url="/pages-sub/profile/index" class="user-navigator">
        <view class="user">
          <view class="avator">
            <image
              :src="userStore.userInfo.avatar || '/static/logo.png'"
              mode="scaleToFill"
            ></image>
            <view class="avator-badge"></view>
          </view>
          <view class="info">
            <view class="username">姓名：{{ userStore.userInfo.nickname || '点击设置昵称' }}</view>
            <view class="phone">电话：{{ userStore.userInfo.phone || '点击设置电话' }}</view>
          </view>
          <view class="arrow">></view>
        </view>
      </navigator>
    </view>

    <!-- 系统公告 -->
    <view class="advertise">
      <view class="advertise-title">
        <text class="title-icon">📢</text>
        <text class="title-text">系统公告</text>
      </view>
      <swiper class="sys-swiper" autoplay :interval="3000" :duration="1000" vertical circular>
        <swiper-item v-for="(item, index) in advertiseList" :key="index" class="sys-swiper-item">
          <text class="title">{{ item.title }}</text>
          <text class="time">{{ item.time }}</text>
        </swiper-item>
      </swiper>
    </view>

    <view class="box">
      <!-- 功能网格 -->
      <view class="gridBoxes">
        <view class="gridBoxesItem" v-for="(item, index) in gridBoxesList" :key="index">
          <navigator :url="item.url" hover-class="navigator-hover">
            <indexGridBoxesVue
              :icontext="item.icontext"
              :text="item.text"
              :textSize="item.textSize"
              :fontSize="item.fontSize"
              :fontBGColor="item.fontBGColor"
              :fontColor="item.fontColor"
            ></indexGridBoxesVue>
          </navigator>
        </view>
      </view>

      <!-- 评分卡片 -->
      <view class="score">
        <view class="score-section-header">
          <text class="section-title">健康评估</text>
          <navigator url="/pages-sub/historyScore/index" class="view-more">查看历史记录</navigator>
        </view>
        <view class="score-top grayBox">
          <text>最近随访日期：暂无</text>
        </view>
        <view class="scoreCardList">
          <view v-for="(item, index) in scoreListWithScore" :key="index" class="grayBox score-card">
            <navigator :url="item.url" class="score-card-link">
              <indexScoreListVue
                :mainTitle="item.mainTitle"
                :subTitle="item.subTitle"
                :icontext="item.icontext"
                :iconColor="item.iconColor"
                :score="item.score"
              ></indexScoreListVue>
            </navigator>
          </view>
        </view>
      </view>

      <!-- 科普文章 -->
      <view class="science">
        <view class="science-header">
          <text class="section-title">健康科普</text>
          <navigator url="/pages-sub/scienceArticle/index" class="view-more">更多</navigator>
        </view>
        <view class="scienceItem" v-for="item in scienceCardList" :key="item.id">
          <indexScienceCardVue
            :title="item.title"
            :time="item.time"
            :src="item.src"
            :href="item.href"
          ></indexScienceCardVue>
        </view>
      </view>
    </view>
  </view>
</template>

<style scoped lang="scss">
$primary-color: #33d596;
$text-primary: #333;
$text-secondary: #666;
$text-tertiary: #999;
$border-color: #e6e6e6;
$bg-color: #f8f8f8;
$card-bg: #ffffff;
$shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.08);
$border-radius: 16rpx;

.topBG {
  background: linear-gradient($primary-color 90%, white 90%);
  box-sizing: border-box;
  padding: 20rpx;
  padding-bottom: 0;
  min-height: 240rpx;
  width: 100%;
}

.user {
  display: flex;
  align-items: center;
  background-color: $card-bg;
  box-sizing: border-box;
  border-radius: $border-radius;
  padding: 30rpx;
  box-shadow: $shadow;
  position: relative;
  transition: all 0.3s ease;

  &:active {
    transform: translateY(2rpx);
    box-shadow: 0 1rpx 5rpx rgba(0, 0, 0, 0.05);
  }

  .avator {
    width: 150rpx;
    height: 150rpx;
    border-radius: 50%;
    overflow: hidden;
    border: 4rpx solid rgba(255, 255, 255, 0.8);
    position: relative;
    box-shadow: 0 0 20rpx rgba(0, 0, 0, 0.1);

    image {
      width: 100%;
      height: 100%;
    }

    .avator-badge {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 40rpx;
      height: 40rpx;
      border-radius: 50%;
      background-color: $primary-color;
      border: 6rpx solid white;
    }
  }

  .info {
    margin-left: 30rpx;
    flex: 1;
    font-size: $uni-font-size-base;
    color: $text-secondary;
  }

  .username {
    font-size: 36rpx;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 8rpx;
  }

  .arrow {
    position: absolute;
    right: 30rpx;
    top: 50%;
    transform: translateY(-50%);
    color: #ccc;
    font-size: 40rpx;
    transition: all 0.3s ease;
  }

  &:active .arrow {
    right: 25rpx;
  }
}

.advertise {
  box-sizing: border-box;
  background-color: $card-bg;
  margin: 20rpx;
  border-radius: $border-radius;
  padding: 20rpx 30rpx;
  box-shadow: $shadow;

  .advertise-title {
    display: flex;
    align-items: center;
    margin-bottom: 10rpx;

    .title-icon {
      margin-right: 15rpx;
    }

    .title-text {
      font-size: $uni-font-size-base;
      color: #e64340;
      font-weight: 600;
    }
  }

  .sys-swiper {
    height: 60rpx;
    line-height: 60rpx;
    margin-left: 20rpx;

    .sys-swiper-item {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;

      // 滚动文本字体放大
      .title {
        flex: 1;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        word-break: break-all;
        color: $text-secondary;
        font-size: $uni-font-size-base;
      }

      .time {
        font-size: $uni-font-size-sm;
        color: $text-tertiary;
        margin-left: 20rpx;
        flex-shrink: 0;
      }
    }
  }
}

.box {
  margin: 20rpx;
  background-color: $bg-color;
  padding: 20rpx;
  border-radius: $border-radius;
  box-shadow: $shadow;

  // 通用的区块标题样式
  .section-title {
    font-size: 36rpx;
    font-weight: 600;
    color: $text-primary;
    margin-bottom: 20rpx;
    display: inline-block;
  }

  // 查看更多链接样式
  .view-more {
    font-size: $uni-font-size-sm;
    color: $primary-color;
  }

  .gridBoxes {
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;
    background-color: $card-bg;
    border-radius: $border-radius;
    padding: 45rpx;
    margin-bottom: 50rpx;
    box-shadow: $shadow;

    .gridBoxesItem {
      width: 23%;
      transition: transform 0.2s ease;
    }
    .gridBoxesItem:active {
      transform: scale(0.95);
    }
  }

  .navigator-hover {
    opacity: 0.7;
  }

  .score {
    background-color: $card-bg;
    box-sizing: border-box;
    border-radius: $border-radius;
    padding: 30rpx;
    margin-bottom: 20rpx;
    box-shadow: $shadow;

    .score-section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
    }

    .score-top {
      text-align: center;
      font-size: $uni-font-size-base;
      color: $text-tertiary;
      margin-bottom: 20rpx;
      padding: 20rpx 0;
      background-color: #f7f7f7;
      border-radius: 10rpx;
    }

    .scoreCardList {
      width: 100%;
      display: flex;
      justify-content: space-between;
      gap: 20rpx;
    }

    .score-card {
      width: 48%;
      transition: all 0.3s ease;
      border-radius: 10rpx;
      overflow: hidden;
    }

    .score-card:active {
      transform: translateY(2rpx);
    }
  }

  .science {
    box-sizing: border-box;
    background-color: $card-bg;
    border-radius: $border-radius;
    padding: 30rpx;
    box-shadow: $shadow;

    .science-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
    }

    .scienceItem {
      transition: all 0.3s ease;
    }

    .scienceItem:active {
      background-color: #f7f7f7;
    }

    .scienceItem:after {
      content: '';
      display: block;
      border-bottom: 2rpx solid $border-color;
      width: 100%;
      margin: 20rpx auto 0;
    }

    .scienceItem:last-child::after {
      display: none;
    }
  }
}

// 统一的灰色背景框样式
.grayBox {
  background-color: #f7f7f7;
}

// 动画效果
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.container {
  animation: fadeIn 0.5s ease-out;
}
</style>
