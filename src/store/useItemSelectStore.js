import { defineStore } from 'pinia'
import {ref} from 'vue'

//当点击left1面板某个item时，通知文件列表组件进行动态更新
//通知文件列表组件更新
export const useItemSelectStore = defineStore('itemSelectId', () => {
    //用于
    const itemSelectKey = ref(-1)

    return{itemSelectKey}
})
