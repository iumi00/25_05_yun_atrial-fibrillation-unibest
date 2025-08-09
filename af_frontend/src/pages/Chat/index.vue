<route lang="json5" type="page">
{
  style: {
    // navigationStyle: 'custom',
    navigationBarTitleText: 'Ai对话',
  },
}
</route>

<script setup lang="ts">
import ChatItem from '@/pages/Chat/components/chat-item.vue'

const waitingSendMessage = ref('aaaaa')
const textareaActive = ref(false)

let socketTask = null
const maxReconnectAttempts = 5 // 最大重连次数
const reconnectInterval = 3000 // 重连间隔时间（毫秒）
let reconnectAttempts = 0 // 当前重连次数
const messageList = ref([
  { text: '你好', position: 'right' },
  { text: '你好', position: 'left' },
  { text: '你好', position: 'right' },
  { text: '你好', position: 'left' },
  {
    text: '你nnnnn好',
    position: 'right',
    img: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==',
  },
  { text: '你好', position: 'left' },
  { text: '你好', position: 'right' },
  { text: '你好', position: 'left' },
  { text: '你好', position: 'right' },
])

function textareaFocusHandler() {
  textareaActive.value = true
}

function textareaBlurHandler() {
  textareaActive.value = false
}

function sendBtnHandler() {
  if (waitingSendMessage.value != '' && socketTask && socketTask.readyState === 1) {
    socketTask.send({
      data: waitingSendMessage.value,
      success() {
        console.log('消息发送成功')
        waitingSendMessage.value = ''
      },
      fail(err) {
        console.error('消息发送失败', err)
      },
    })
  } else {
    console.error('WebSocket 连接未打开')
    reconnect()
  }
}

function connectWebSocket() {
  if (reconnectAttempts >= maxReconnectAttempts) {
    console.error('达到最大重连次数，停止重连')
    return
  }

  socketTask = uni.connectSocket({
    url: 'wss://cloudhouse.tech/ws/1',
    complete() {
      console.log('尝试连接 WebSocket')
    },
  })

  socketTask.onOpen(() => {
    console.log('WebSocket 连接已打开')
    reconnectAttempts = 0 // 重置重连次数
  })

  socketTask.onMessage((res) => {
    console.log('收到消息', res.data)
  })

  socketTask.onClose(() => {
    console.log('WebSocket 连接已关闭')
  })

  socketTask.onError((err) => {
    console.error('WebSocket 连接错误', err)
  })
}

function reconnect() {
  reconnectAttempts++
  console.log(`尝试第 ${reconnectAttempts} 次重连`)
  setTimeout(connectWebSocket, reconnectInterval)
}

onMounted(() => {
  connectWebSocket()
})

onUnmounted(() => {
  if (socketTask) {
    socketTask.close({
      code: 1000,
      reason: '页面卸载',
    })
  }
})
</script>

<template>
  <view class="myContainer">
    <view class="message">
      <view v-for="(item, index) in messageList" :key="index">
        <chat-item :position="item.position" :text="item.text" :img="`${item.img}`" 4></chat-item>
      </view>
    </view>
  </view>
  <!-- 仿照微信写一个发送信息的发送框 -->
  <view class="sendBox">
    <textarea
      :class="{ active: textareaActive }"
      @focus="textareaFocusHandler"
      @blur="textareaBlurHandler"
      :value="waitingSendMessage"
    ></textarea>
    <button type="primary" @click="sendBtnHandler">发送</button>
  </view>
</template>

<style scoped lang="scss">
.myContainer {
  box-sizing: border-box;
  padding: 10rpx;
  min-height: 100vh;
  width: 100vw;
  font-size: 16px;
  padding-bottom: 100px;
}

.message view {
  margin: 20px 0;
  // background-color: pink;
}

.sendBox {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  box-sizing: border-box;
  padding: 10px;
  background-color: white;

  textarea {
    flex: 1;
    min-width: 60%;
    height: 80px;
    line-height: 40px;
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 0 10px;
    margin: 0 10px;

    &.active {
      box-shadow: 0 0 5px #ccc;
    }
  }

  button {
    height: 40px;
    line-height: 40px;
    color: #fff;
    border: none;
    border-radius: 5px;
    outline: none;
  }
}
</style>
