import { defineUniPages } from '@uni-helper/vite-plugin-uni-pages'

export default defineUniPages({
  globalStyle: {
    navigationStyle: 'default',
    navigationBarTitleText: 'unibest',
    navigationBarBackgroundColor: '#f8f8f8',
    navigationBarTextStyle: 'black',
    backgroundColor: '#FFFFFF',
  },
  easycom: {
    autoscan: true,
    custom: {
      '^fg-(.*)': '@/components/fg-$1/fg-$1.vue',
      '^wd-(.*)': 'wot-design-uni/components/wd-$1/wd-$1.vue',
      '^(?!z-paging-refresh|z-paging-load-more)z-paging(.*)':
        'z-paging/components/z-paging$1/z-paging$1.vue',
    },
  },
  // 如果不需要tabBar，推荐使用 spa 模板。（pnpm create xxx -t spa）
  tabBar: {
    color: '#999999',
    selectedColor: '#018d71',
    backgroundColor: '#F8F8F8',
    borderStyle: 'black',
    height: '50px',
    fontSize: '10px',
    iconWidth: '24px',
    spacing: '3px',
    list: [
      {
        pagePath: 'pages/index/index',
        text: '首页',
        iconPath: 'static/icon/shouye1.png',
        selectedIconPath: 'static/icon/shouye1-copy.png',
      },
      {
        pagePath: 'pages/measure/index',
        text: '测量',
        iconPath: 'static/icon/zhiyejiankang.png',
        selectedIconPath: 'static/icon/zhiyejiankang-copy-copy.png',
      },
      {
        pagePath: 'pages/Chat/index',
        text: '智能诊断',
        iconPath: 'static/icon/shouye1.png',
        selectedIconPath: 'static/icon/shouye1-copy.png',
      },
    ],
  },
  subPackages: [],
})
