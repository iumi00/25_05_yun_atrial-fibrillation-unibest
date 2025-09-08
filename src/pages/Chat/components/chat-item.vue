<template>
  <div class="myContain" :class="{ right: position === 'right' }">
    <div class="avatar">
      <image src="../../../static/logo.png" alt="" />
    </div>
    <div class="text">
      <div v-if="textFlag">{{ text }}</div>
      <div class="img" v-if="imgFlag">
        <image :src="img" mode="aspectFit" alt="" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps({
  position: {
    type: String,
    default: 'left', // 默认值为 'left'
    validator: (value) => ['left', 'right'].includes(value), // 验证值只能是 'left' 或 'right'
  },
  text: {
    type: String,
    default: 'test',
  },
  img: {},
})

const textFlag = computed(() => props.text.length > 1)
const imgFlag = computed(() => props.img.length > 10)
</script>

<style scoped lang="scss">
.myContain {
  // background-color: pink;
  width: 100%;
  display: flex;
  align-items: flex-start;
  border: 1px solid transparent;
  // background-color: pink;
}

.right {
  flex-direction: row-reverse;
}

.avatar {
  width: 30px;
  height: 30px;

  image {
    width: 100%;
    height: 100%;
    vertical-align: top;
  }
}

.text {
  width: fit-content;
  word-wrap: break-word;
  white-space: normal;
  max-width: 70%;
  margin: 0 10px;
  line-height: 30px;
  padding: 10px;
  box-sizing: border-box;
  border-radius: 6px;
  background-color: rgb(244, 244, 244);

  .img {
    min-width: 50vw;
    width: 100%;
    height: 100%;
    background-color: white;
    box-sizing: border-box;
    padding: 10px;
    border-radius: 6px;
    margin-top: 6px;

    image {
      width: 100%;
    }
  }
}

.right .text {
  background-color: #3fe3a1;
}
</style>
