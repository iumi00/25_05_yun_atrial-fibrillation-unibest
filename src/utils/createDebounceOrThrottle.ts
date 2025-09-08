export function createDebounceOrThrottle(func, wait, immediate, isDebounce) {
  let timeout
  let result
  const later = function (context, args) {
    clearTimeout(timeout)
    timeout = null
    if (args) func.apply(context, args)
  }

  return function (...args) {
    const context = this
    const callNow = immediate && !timeout
    if (isDebounce) {
      clearTimeout(timeout)
      timeout = setTimeout(later.bind(null, context, args), wait)
    } else {
      if (!timeout) {
        timeout = setTimeout(later.bind(null, context, args), wait)
        if (callNow) result = func.apply(context, args)
      }
    }
    return result
  }
}

// // 使用示例
// const debounceFunc = createDebounceOrThrottle(function () {
//   console.log('Debounced function called');
// }, 300, false, true); // 防抖

// const throttleFunc = createDebounceOrThrottle(function () {
//   console.log('Throttled function called');
// }, 1000, false, false); // 节流

// // 测试
// setInterval(() => {
//   debounceFunc();
//   throttleFunc();
// }, 100);
