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
import { ref, nextTick, onMounted, onUnmounted } from 'vue'

const waitingSendMessage = ref('')
const textareaActive = ref(false)
// 添加scrollTop响应式变量
const scrollTop = ref(0)
const scrollTimer = ref<any>(null)

let socketTask: any = null
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

// 自动滚动到最新消息
function scrollToBottom() {
  clearTimeout(scrollTimer.value)
  
  scrollTimer.value = setTimeout(() => {
    nextTick(() => {
      // 使用微信小程序的节点查询API
      const query = uni.createSelectorQuery()
      query.select('.message').boundingClientRect()
      query.selectViewport().scrollOffset()
      query.exec((res) => {
        if (res && res[0]) {
          // 计算需要滚动的高度
          const height = res[0].height
          scrollTop.value = height + 100 // 加一个缓冲值确保滚动到底
        }
      })
    })
  }, 100)
}

function sendBtnHandler() {
  console.log('发送按钮被点击') // 调试信息
  console.log('当前输入内容:', waitingSendMessage.value) // 调试信息
  
  const message = waitingSendMessage.value.trim()
  if (!message) {
    console.log('消息为空，不发送')
    return
  }
  
  console.log('准备发送消息:', message) // 调试信息
  
  messageList.value.push({
    text: message,
    position: 'right'
  })
  waitingSendMessage.value = ''
  
  // 强制刷新视图
  nextTick(() => {
    console.log('DOM更新完成') // 调试信息
    scrollToBottom()
  })
    
    // 发送消息
    if (socketTask && socketTask.readyState === 1) {
      socketTask.send({
        data: message,
        success() {
          console.log('消息发送成功')
        },
        fail(err) {
          console.error('消息发送失败', err)
          // 即使发送失败，也模拟AI回复
          simulateAIResponse()
        },
      })
    } else {
      console.log('WebSocket 连接未打开，使用模拟回复')
      // 模拟AI回复，提升用户体验
      simulateAIResponse()
      // 同时尝试重连
      reconnect()
    }
  }

// 模拟AI回复函数
function simulateAIResponse() {
  setTimeout(() => {
    const replies = [
      '我理解您的问题，让我思考一下...',
      '这是一个很好的问题！',
      '谢谢您的提问，根据我的分析...',
      '我需要更多信息来回答这个问题',
      '让我为您提供一些建议...'
    ];
    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    
    messageList.value.push({
      text: randomReply,
      position: 'left'
    });
    
    nextTick(() => {
      scrollToBottom()
    });
  }, 800); // 模拟思考时间
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
    // 将接收到的消息添加到列表
    messageList.value.push({
      text: res.data,
      position: 'left'
    })
    // 先等待DOM更新，再滚动
    nextTick(() => {
      scrollToBottom()
    })
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
    connectWebSocket();
    
    // 使用setTimeout确保页面渲染完成后再滚动
    setTimeout(() => {
      scrollToBottom()
    }, 500)
    
    // 模拟接收消息
  setTimeout(() => {
    messageList.value.push({
      position: 'left',
      text: '你好！我是AI助手，有什么可以帮助您的吗？',
      img: '',
    });
    // 先等待DOM更新，再滚动
    nextTick(() => {
      scrollToBottom()
    });
  }, 500);
  });

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
    <!-- 使用scroll-view替代普通view -->
    <scroll-view
      class="message"
      scroll-y
      :scroll-top="scrollTop"
      scroll-with-animation
      ref="messageContainer"
    >
      <view v-for="(item, index) in messageList" :key="index">
        <chat-item :position="item.position" :text="item.text" :img="item.img"></chat-item>
      </view>
    </scroll-view>
  </view>
  <!-- 仿照微信写一个发送信息的发送框 -->
  <view class="sendBox">
    <view class="input-wrapper">
      <textarea
        @confirm="sendBtnHandler"
        class="textarea-inner"
        :class="{ active: textareaActive }"
        @focus="textareaFocusHandler"
        @blur="textareaBlurHandler"
        v-model="waitingSendMessage"
        placeholder="请输入消息..."
        maxlength="500"
      ></textarea>
      <button 
        type="primary" 
        class="send-btn"
        @click="sendBtnHandler"
        :disabled="!waitingSendMessage.trim()"
      >发送</button>
    </view>
  </view>
</template>

<style scoped lang="scss">
.myContainer {
  box-sizing: border-box;
  padding: 10rpx;
  min-height: 100vh;
  width: 100vw;
  font-size: 16px;
  padding-bottom: 150px;
}

.message {
  height: calc(100vh - 180px); /* 确保有固定高度 */
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  /* 添加这些样式确保scroll-view正常工作 */
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
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
  box-sizing: border-box;
  padding: 6px;
  padding-bottom: env(safe-area-inset-bottom);
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.textarea-inner {
  flex: 1;
  min-width: 0;
  height: 50px;
  max-height: 120px;
  line-height: 1.5;
  box-sizing: border-box;
  border: 1px solid #dcdfe6;
  border-radius: 14px;
  padding: 4px 12px;
  background-color: #ffffff;
  resize: none;
  font-size: 12px;
  transition: all 0.3s ease;
  outline: none;
  pointer-events: auto;

  &.active {
    border-color: #409eff;
    background-color: #fff;
    box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
  }

  &::placeholder {
    color: #c0c4cc;
  }
}

.send-btn {
  min-width: 80px;
  height: 28px;
  line-height: 28px;
  color: #fff;
  border: none;
  border-radius: 14px;
  background-color: #007aff;
  font-size: 12px;
  padding: 0 15px;
  transition: all 0.3s ease;
  pointer-events: auto;

  &:active {
    background-color: #0062cc;
    transform: scale(0.98);
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
}
</style>
