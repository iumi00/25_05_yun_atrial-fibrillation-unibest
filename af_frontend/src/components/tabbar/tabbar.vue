<template>
  <view>
    <view class="tabbar">
      <view
        class="tabbar-item"
        v-for="(item, index) in list"
        :key="index"
        @click="changeTab(index)"
      >
        <view class="select" v-if="current == index">
          <view class="i-t position">
            <image
              class="img imgactive"
              mode="widthFix"
              :src="item.selectedIconPath"
              v-if="current == index"
            ></image>
            <image class="img" mode="widthFix" :src="item.iconPath" v-else></image>
            <view class="text active" v-if="current == index">{{ item.text }}</view>
            <view class="text" v-else>{{ item.text }}</view>
          </view>
        </view>
        <view v-else>
          <image
            class="img"
            mode="widthFix"
            :src="item.selectedIconPath"
            v-if="current == index"
          ></image>
          <image class="img" mode="widthFix" :src="item.iconPath" v-else></image>
          <view class="text active" v-if="current == index">{{ item.text }}</view>
          <view class="text" v-else>{{ item.text }}</view>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'tabbar',
  props: ['current'],
  data() {
    return {
      list: [
        // {
        // 		pagePath: "页面路径",
        // 		iconPath: "图标路径",
        // 		selectedIconPath: "选中的图标路径",
        // 		text: "文字"
        // 	},
        {
          pagePath: 'pages/tabBar_index/tabBar_index',
          text: '首页',
          iconPath: 'require(../static/icon_6d81av3mhlm/shouye1.png)',
          selectedIconPath: 'require(../static/icon_6d81av3mhlm/shouye1.png)',
        },
        {
          pagePath: 'pages/tabBar_healthy/tabBar_healthy',
          text: '健康',
        },
      ],
    }
  },

  created() {
    uni.hideTabBar()
  },

  methods: {
    changeTab(e) {
      uni.switchTab({
        url: '/' + this.list[e].pagePath,
      })
    },
  },
}
</script>

<style scoped lang="scss">
.tabbar {
  font-size: 1.5vh;
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 99;
  width: 100%;
  height: 6vh;
  display: flex;
  align-items: center;
  justify-content: space-around;
  background-color: #fff;
  padding: 20rpx 0;
  border-top: 1px solid black;
}

.tabbar-item {
  height: 100%;
  padding: 0 40rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: pink;
}

.img {
  height: 3vh;
  width: 2.5vh;
  margin: 0 4vw;
}

.text {
  text-align: center;
  color: #cacaca;
}

.i-t {
  font-size: 1.5vh;
  padding: 2vw 2vh;
  position: absolute;
  bottom: 1vh;
}

.select {
  width: 10vh;
  height: 10vh;
  border-radius: 10vh;
  background-color: #086d5b;
  margin-bottom: 4vh;
  position: relative;
}

.imgactive {
  height: 3.5vh;
  width: 3.2vh;
  margin: 0 2.2vw;
}

.text.active {
  color: #fff;
}
</style>
