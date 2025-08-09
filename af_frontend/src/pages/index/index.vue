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
import { formatTime2yyyymmddhhmmss } from '@/utils/timeCompiler'

import { computed, ref } from 'vue'
import {
  _api_getMyQuestionnaireList,
  _api_getPopularizationArticle,
  // _api_getUserInfo,
} from '@/service'

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
// const accessToken = uni.getStorageSync('accessToken')
// const userId = uni.getStorageSync('userId')
// 5. 【修改】注意：现在 token 和 userId 都应该从 userStore 中获取，这样更安全和规范
const accessToken = userStore.userInfo.token
const userId = userStore.userInfo.id

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
      <!-- 在 src/pages/index/index.vue 的 template 中 -->
      <!-- 将整个 user 卡片用 navigator 包裹起来 -->
      <navigator url="/pages-sub/profile/index" class="user-navigator">
        <view class="user">
          <view class="avator">
            <image :src="userStore.userInfo.avatar || ''" mode="scaleToFill"></image>
          </view>
          <view class="info">
          <view class="username">姓名：{{ userStore.userInfo.nickname || '点击设置昵称' }}</view>
          <view class="phone">电话：{{ userStore.userInfo.phone || '点击设置电话' }}</view>
         </view>
         <!-- 添加一个向右的箭头，提示用户可以点击 -->
         <view class="arrow"> > </view>
       </view>
      </navigator>
    </view>

    <view class="advertise">
      <view>系统公告</view>
      <swiper class="sys-swiper" autoplay :interval="3000" :duration="1000" vertical circular>
        <swiper-item v-for="(item, index) in advertiseList" :key="index" class="sys-swiper-item">
          <view class="title">{{ item.title }}</view>
          <view class="time">{{ item.time }}</view>
        </swiper-item>
      </swiper>
    </view>

    <view class="box">
      <view class="gridBoxes">
        <view class="gridBoxesItem" v-for="(item, index) in gridBoxesList" :key="index">
          <indexGridBoxesVue
            :icontext="item.icontext"
            :text="item.text"
            :textSize="item.textSize"
            :fontSize="item.fontSize"
            :fontBGColor="item.fontBGColor"
            :fontColor="item.fontColor"
          ></indexGridBoxesVue>
        </view>

        <!-- 后面做点击事件可以考虑增加一个自定义属性 -->
        <!-- 或者用一个navigator包含他们 -->
      </view>

      <view class="score">
        <view class="score-top grayBox">
          <text>最近随访日期：暂无</text>
        </view>
        <view class="scoreCardList">
          <view v-for="(item, index) in scoreListWithScore" :key="index" class="grayBox">
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
            <text>>>>></text>
            <text>查看历史记录</text>
          </navigator>
        </view>
      </view>

      <view class="science">
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
.topBG {
  background: linear-gradient(#33d596 90%, white 90%);
  box-sizing: border-box;
  padding: 20rpx;
  padding-bottom: 0;
  min-height: 200rpx;
  width: 100%;
}

.user {
  display: flex;
  align-items: center;
  background-color: white;
  box-sizing: border-box;
  border-radius: 10rpx;
  padding: 30rpx;
  box-shadow: 0 6rpx 6rpx #9f9f9f;
  position: relative; // 为了让箭头定位

  .avator {
    width: 150rpx;
    height: 150rpx;
    overflow: hidden;

    image {
      width: 100%;
      height: 100%;
    }
  }

  .info {
    margin-left: 20rpx;
    font-size: $uni-font-size-base;
    color: #8b8b8b;
    height: fit-content;
  }

  .arrow {
    position: absolute;
    right: 30rpx;
    top: 50%;
    transform: translateY(-50%);
    color: #ccc;
    font-size: 40rpx;
  }
}

.advertise {
  box-sizing: border-box;
  display: flex;
  padding: 0 30rpx;
  height: 60rpx;
  line-height: 60rpx;

  > view {
    flex-shrink: 0;
    flex-grow: 0;
    font-size: $uni-font-size-base;
    color: red;
  }

  .sys-swiper {
    flex-shrink: 0;
    flex-grow: 0;
    flex: 1;
    height: 100%;
    margin-left: 20rpx;

    .sys-swiper-item {
      display: flex;
      flex-wrap: nowrap;
      font-size: $uni-font-size-sm;

      .title {
        width: 70%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        word-break: break-all;
      }
    }
  }
}

.box {
  margin: 20rpx;
  background-color: #f2f2f2;
  padding: 10rpx 20rpx;

  .gridBoxes {
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;
    padding: 0 30rpx;
    // padding: 10rpx 40rpx;

    .gridBoxesItem {
      width: 23%;
    }
  }

  .score {
    background-color: white;
    box-sizing: border-box;
    border: 1px solid transparent;
    padding: 0 30rpx;

    .score-top {
      text-align: center;
      font-size: $uni-font-size-base;
      color: #828283;
      margin: 10rpx 0;
      padding: 16rpx 0;
    }

    .scoreCardList {
      width: 100%;
      display: flex;
      justify-content: space-between;

      > view {
        width: 45%;
      }
    }

    .score-bottom {
      margin: 30rpx;
      margin-bottom: 10rpx;
      font-size: $uni-font-size-base;
      font-weight: 700;
      text-align: center;
      color: #33d596;
    }
  }

  .science {
    box-sizing: border-box;
    margin-top: 30rpx;
    border-radius: 20rpx;
    background-color: white;
    border: 1px solid transparent;

    .scienceItem:after {
      content: '';
      display: block;
      border-bottom: 4rpx solid #e6e6e6;
      width: 90%;
      margin: 10rpx auto;
    }

    .scienceItem:last-child::after {
      display: none;
    }
  }
}
</style>
