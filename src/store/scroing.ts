import { defineStore } from 'pinia'

const useScroingData = defineStore('scroing', {
  state: () => {
    return {
      scroingList: [],
    }
  },
  getters: {
    score() {
      let sum = 0
      for (let i in this.scroingList) {
        sum += this.scroingList[i]
      }
      return sum
    },
  },
  actions: {
    changeScroingList(index, val) {
      this.scroingList[index] = parseFloat(val)
    },
    resetScroingList() {
      this.scroingList = {}
    },
  },
})

export default useScroingData
