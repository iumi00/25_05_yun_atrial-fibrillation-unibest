export function formatTime2yyyymmddhhmmss(date = new Date()) {
  let year = date.getFullYear()
  // 月份是从0开始的
  let month = String(date.getMonth() + 1).padStart(2, '0')
  let day = String(date.getDate()).padStart(2, '0')
  let hours = String(date.getHours()).padStart(2, '0')
  let minutes = String(date.getMinutes()).padStart(2, '0')
  let seconds = String(date.getSeconds()).padStart(2, '0')

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

/**
 * 获取当前时间的ISO格式时间戳，并将其中的冒号和点替换为短横线
 * @returns {string} 替换后的ISO格式时间戳
 */
export function getFormattedTimestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-')
}
