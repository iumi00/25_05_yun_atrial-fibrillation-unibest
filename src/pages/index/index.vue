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
import indexGridBoxesVue from '../../components/indexGridBoxes/indexGridBoxes.vue'
import indexScoreListVue from '../../components/indexScoreList/indexScoreList.vue'
import indexScienceCardVue from '../../components/indexScienceCard/indexScienceCard.vue'
import { formatTime2yyyymmddhhmmss } from '@/utils/timeCompiler'

import { computed, ref } from 'vue'
import { onMounted } from 'vue'
import {
  _api_getMyQuestionnaireList,
  _api_getPopularizationArticle,
  _api_getUserInfo,
} from '@/service'

type IUserInfo = {
  phone: string
  nickname: string
  avatar: string
}

type FollowUpItem = {
  id: number
  name: string
  status: 'pending' | 'completed'
  description: string
}

type FollowUpReminder = {
  nextFollowUpDate: string
  daysRemaining: number
  items: FollowUpItem[]
}

const userInfo = ref<IUserInfo>({
  phone: '加载中',
  nickname: '加载中',
  avatar: '../../static/logo.png',
})

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
  },
  {
    img: '',
    icontext: '\ue604',
    text: '风险自测',
    fontBGColor: '#1acba8',
    fontSize: '50px',
    textSize: '16px',
    fontColor: 'white',
  },
  {
    img: '',
    icontext: '\ue60e',
    text: '知识自测',
    fontBGColor: '#1b91ff',
    fontSize: '40px',
    textSize: '16px',
    fontColor: 'white',
  },
  {
    img: '',
    icontext: '\ue95c',
    text: '在线随访',
    fontBGColor: '#932df9',
    fontSize: '40px',
    textSize: '16px',
    fontColor: 'white',
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

// 随访提醒数据
const followUpReminder = ref<FollowUpReminder>({
  nextFollowUpDate: '2024-10-15',
  daysRemaining: 7,
  items: [
    {
      id: 1,
      name: '心电图检查',
      status: 'pending',
      description: '常规心电图检查，评估心率和心律',
    },
    {
      id: 2,
      name: '血压测量',
      status: 'pending',
      description: '测量静息血压，评估心血管健康状况',
    },
    {
      id: 3,
      name: '用药指导',
      status: 'pending',
      description: '评估当前用药方案，调整剂量或种类',
    },
  ],
})

const accessToken = uni.getStorageSync('accessToken')
const userId = uni.getStorageSync('userId')

/**
 * 异步获取用户信息
 *
 * 此函数调用_api_getUserInfo方法获取用户信息，并更新userInfo对象的值
 */
async function getUserInfo() {
  const res = await _api_getUserInfo({ accessToken })
  console.log('getUserInfo', res)
  userInfo.value.phone = res.data.phone
  userInfo.value.nickname = res.data.nickName
  userInfo.value.avatar = res.data.avatar
}

/**
 * 异步获取用户的问卷列表
 *
 * 此函数通过调用_api_getMyQuestionnaireList来获取特定用户和类型的问卷列表，并根据问卷类型更新分数
 *
 * @param {string} type 问卷类型,CHA2DS2-VASc、HAS-BLED
 */
async function getMyQuestionnaireList(type) {
  // 调用API获取用户特定类型的问卷列表
  const res = await _api_getMyQuestionnaireList({ userId, type }, { accessToken })

  // 根据问卷类型更新相应的分数
  if (type == 'CHA2DS2-VASc') {
    score.value[0] = res.data[0].score
  } else if (type == 'HAS-BLED') {
    score.value[1] = res.data[0].score
  } else {
    console.log('未知问卷类型')
  }
}

/**
 * 异步获取科普文章列表
 *
 * 该函数通过调用_api_getPopularizationArticle方法获取科普文章数据，并将其格式化后赋值给scienceCardList
 */
async function getPopularizationArticle() {
  // 调用_api_getPopularizationArticle方法获取科普文章数据
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
}

/**
 * 处理立即随访按钮点击事件
 */
function handleFollowUpNow() {
  // 这里可以实现跳转到随访页面的逻辑
  uni.showToast({
    title: '正在跳转至随访页面',
    icon: 'success',
  })
  // 实际项目中可以使用uni.navigateTo跳转到随访页面
  // uni.navigateTo({ url: '/pages/followUp/index' })
}

/**
 * 处理病例信息按钮点击事件
 */
function handleCaseInfoClick() {
  uni.showToast({
    title: '病例信息功能开发中',
    icon: 'none',
  })
  // 未来可以跳转到病例信息页面
  // uni.navigateTo({ url: '/pages/caseInfo/index' })
}

/**
 * 处理风险自测按钮点击事件
 */
function handleRiskSelfTestClick() {
  // 跳转到血栓风险评分页面
  uni.navigateTo({
    url: '/pages-sub/thrombusScoring/index',
  })
}

/**
 * 处理知识自测按钮点击事件
 */
function handleKnowledgeSelfTestClick() {
  // 跳转到科普文章页面
  uni.navigateTo({
    url: '/pages-sub/scienceArticle/index',
  })
}

/**
 * 处理在线随访按钮点击事件
 */
function handleOnlineFollowUpClick() {
  // 这里可以实现跳转到随访页面的逻辑
  uni.showToast({
    title: '正在跳转至在线随访页面',
    icon: 'success',
  })
  // 实际项目中可以使用uni.navigateTo跳转到随访页面
  // uni.navigateTo({ url: '/pages/followUp/index' })
}

/**
 * 根据索引处理网格盒子点击事件
 */
function handleGridBoxClick(index: number) {
  switch (index) {
    case 0:
      handleCaseInfoClick()
      break
    case 1:
      handleRiskSelfTestClick()
      break
    case 2:
      handleKnowledgeSelfTestClick()
      break
    case 3:
      handleOnlineFollowUpClick()
      break
    default:
      break
  }
}

async function _init() {
  await getUserInfo()
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
      <view class="user">
        <view class="avator">
          <image :src="userInfo?.avatar || ''" mode="scaleToFill"></image>
        </view>
        <view class="info">
          <view class="username">姓名：{{ userInfo?.nickname || 'nickname' }}</view>
          <view class="phone">电话：{{ userInfo?.phone || 'phone' }}</view>
        </view>
      </view>
    </view>

    <view class="advertise">
      <view class="notice-icon">系统公告</view>
      <swiper class="sys-swiper" autoplay :interval="3000" :duration="1000" vertical circular>
        <swiper-item v-for="(item, index) in advertiseList" :key="index" class="sys-swiper-item">
          <view class="title">{{ item.title }}</view>
          <view class="time">{{ item.time }}</view>
        </swiper-item>
      </swiper>
    </view>

    <view class="content-wrapper">
      <!-- 随访提醒模块 -->
      <view class="follow-up-reminder">
        <view class="section-title">随访提醒</view>
        <view class="follow-up-content">
          <view class="follow-up-date">
            <text class="date-label">下次随访日期：</text>
            <text class="date-value">{{ followUpReminder.nextFollowUpDate }}</text>
            <text class="days-remaining" :class="{ urgent: followUpReminder.daysRemaining <= 3 }">
              ({{ followUpReminder.daysRemaining }}天后)
            </text>
          </view>

          <view class="follow-up-items">
            <view class="item-title">随访项目：</view>
            <view class="item-list">
              <view v-for="item in followUpReminder.items" :key="item.id" class="item">
                <view class="item-icon">
                  <view v-if="item.status === 'pending'" class="pending-icon">●</view>
                  <view v-else class="completed-icon">✓</view>
                </view>
                <view class="item-info">
                  <view class="item-name">{{ item.name }}</view>
                  <view class="item-description">{{ item.description }}</view>
                </view>
              </view>
            </view>
          </view>

          <button class="follow-up-button" @click="handleFollowUpNow">立即随访</button>
        </view>
      </view>

      <view class="grid-boxes">
        <view class="grid-boxes-item" v-for="(item, index) in gridBoxesList" :key="index">
          <view @click="handleGridBoxClick(index)" class="grid-box-wrapper">
            <indexGridBoxesVue
              :icontext="item.icontext"
              :text="item.text"
              :textSize="item.textSize"
              :fontSize="item.fontSize"
              :fontBGColor="item.fontBGColor"
              :fontColor="item.fontColor"
            ></indexGridBoxesVue>
          </view>
        </view>
      </view>

      <view class="score-section">
        <view class="section-title">风险评估</view>
        <view class="score-top">
          <text>最近随访日期：暂无</text>
        </view>
        <view class="score-card-list">
          <view v-for="(item, index) in scoreListWithScore" :key="index" class="score-card-item">
            <navigator :url="item.url">
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
        <view class="score-bottom">
          <navigator url="/pages-sub/historyScore/index">
            <text>查看历史记录</text>
            <text class="arrow">→</text>
          </navigator>
        </view>
      </view>

      <view class="science-section">
        <view class="section-title">健康科普</view>
        <view class="science-item" v-for="item in scienceCardList" :key="item.id">
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
.container {
  background-color: #f7f7f7;
  min-height: 100vh;
}

.topBG {
  background: linear-gradient(#33d596 90%, #f7f7f7 90%);
  box-sizing: border-box;
  padding: 20rpx;
  padding-bottom: 0;
  min-height: 240rpx;
  width: 100%;
}

.user {
  display: flex;
  align-items: center;
  background-color: white;
  box-sizing: border-box;
  border-radius: 20rpx;
  padding: 30rpx;
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.08);
  margin-bottom: 30rpx;

  .avator {
    width: 160rpx;
    height: 160rpx;
    border-radius: 50%;
    overflow: hidden;
    border: 4rpx solid #f0f0f0;

    image {
      width: 100%;
      height: 100%;
    }
  }

  .info {
    margin-left: 30rpx;
    flex: 1;

    .username {
      font-size: $uni-font-size-lg;
      font-weight: 600;
      color: #333;
      margin-bottom: 12rpx;
    }

    .phone {
      font-size: $uni-font-size-base;
      color: #888;
    }
  }
}

.advertise {
  box-sizing: border-box;
  display: flex;
  padding: 0 30rpx;
  height: 80rpx;
  line-height: 80rpx;
  margin-bottom: 20rpx;
  background-color: white;
  border-radius: 16rpx;
  margin: 0 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

  .notice-icon {
    flex-shrink: 0;
    font-size: $uni-font-size-base;
    color: #ff4d4f;
    font-weight: 500;
    padding-right: 20rpx;
    border-right: 2rpx solid #f0f0f0;
  }

  .sys-swiper {
    flex: 1;
    height: 100%;
    margin-left: 20rpx;

    .sys-swiper-item {
      display: flex;
      flex-wrap: nowrap;
      font-size: $uni-font-size-sm;
      align-items: center;

      .title {
        width: 70%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        word-break: break-all;
        color: #333;
      }

      .time {
        width: 30%;
        text-align: right;
        color: #999;
        font-size: $uni-font-size-sm;
        margin-left: 10rpx;
      }
    }
  }
}

.content-wrapper {
  margin: 20rpx;
  background-color: #f7f7f7;
  padding: 10rpx;
}

.section-title {
  font-size: $uni-font-size-lg;
  font-weight: 600;
  color: #333;
  margin-bottom: 20rpx;
  padding-left: 20rpx;
}

/* 随访提醒模块样式 */
.follow-up-reminder {
  background-color: white;
  border-radius: 20rpx;
  padding: 20rpx 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
}

.follow-up-content {
  padding: 10rpx 0;
}

.follow-up-date {
  padding: 20rpx;
  background-color: #fff9e6;
  border-radius: 12rpx;
  margin-bottom: 20rpx;
  text-align: center;
  font-size: $uni-font-size-base;
  color: #333;
}

.date-label {
  color: #666;
  margin-right: 10rpx;
}

.date-value {
  font-weight: 600;
  color: #e6a23c;
  margin-right: 10rpx;
}

.days-remaining {
  font-size: $uni-font-size-sm;
  color: #999;
}

.days-remaining.urgent {
  color: #ff4d4f;
  font-weight: 600;
}

.follow-up-items {
  margin-bottom: 20rpx;
}

.item-title {
  font-size: $uni-font-size-base;
  font-weight: 500;
  color: #333;
  margin-bottom: 15rpx;
  padding-left: 20rpx;
}

.item-list {
  background-color: #f8f8f8;
  border-radius: 12rpx;
  padding: 10rpx 0;
}

.item {
  display: flex;
  align-items: flex-start;
  padding: 15rpx 20rpx;
  border-bottom: 2rpx solid #f0f0f0;
}

.item:last-child {
  border-bottom: none;
}

.item-icon {
  margin-right: 15rpx;
  margin-top: 5rpx;
}

.pending-icon {
  color: #ff4d4f;
  font-size: 16rpx;
  font-weight: bold;
}

.completed-icon {
  color: #52c41a;
  font-size: 24rpx;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: $uni-font-size-base;
  font-weight: 500;
  color: #333;
  margin-bottom: 5rpx;
}

.item-description {
  font-size: $uni-font-size-sm;
  color: #666;
  line-height: 1.4;
}

.follow-up-button {
  width: 100%;
  height: 80rpx;
  line-height: 80rpx;
  background-color: #33d596;
  color: white;
  border-radius: 40rpx;
  font-size: $uni-font-size-base;
  font-weight: 600;
  border: none;
  box-shadow: 0 4rpx 12rpx rgba(51, 213, 150, 0.3);
  transition: all 0.3s ease;
}

.follow-up-button:active {
  background-color: #28b37d;
  box-shadow: 0 2rpx 6rpx rgba(51, 213, 150, 0.2);
  transform: scale(0.98);
}

/* 网格盒子样式 */
.grid-boxes {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20rpx;
  margin: 20rpx 0;
  background-color: white;
  border-radius: 20rpx;
  padding: 20rpx 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

  .grid-boxes-item {
    padding: 10rpx;
  }

  .grid-box-wrapper {
    height: 100%;
    width: 100%;
    border-radius: 16rpx;
    transition: all 0.3s ease;

    &:active {
      background-color: #f0f0f0;
      transform: scale(0.95);
    }
  }
}

/* 评分模块样式 */
.score-section {
  background-color: white;
  border-radius: 20rpx;
  padding: 20rpx 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

  .score-top {
    text-align: center;
    font-size: $uni-font-size-base;
    color: #666;
    margin: 10rpx 0 20rpx 0;
    padding: 16rpx 0;
    background-color: #f8f8f8;
    border-radius: 12rpx;
  }

  .score-card-list {
    width: 100%;
    display: flex;
    justify-content: space-between;
    margin-bottom: 20rpx;

    .score-card-item {
      width: 48%;
      border-radius: 12rpx;
      overflow: hidden;
      box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);
      transition: all 0.3s ease;

      &:active {
        transform: scale(0.98);
        box-shadow: 0 1rpx 3rpx rgba(0, 0, 0, 0.05);
      }
    }
  }

  .score-bottom {
    margin: 0;
    padding: 15rpx 0;
    font-size: $uni-font-size-base;
    font-weight: 500;
    text-align: center;
    color: #33d596;
    background-color: #f8fff8;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    navigator {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .arrow {
      margin-left: 8rpx;
      font-size: $uni-font-size-sm;
    }
  }
}

/* 科普模块样式 */
.science-section {
  background-color: white;
  border-radius: 20rpx;
  padding: 20rpx 30rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

  .science-item {
    border-radius: 12rpx;
    overflow: hidden;
    transition: all 0.3s ease;

    &:active {
      background-color: #f5f5f5;
    }
  }

  .science-item::after {
    content: '';
    display: block;
    border-bottom: 2rpx solid #f0f0f0;
    width: 90%;
    margin: 16rpx auto;
  }

  .science-item:last-child::after {
    display: none;
  }
}
</style>
