import { defineStore } from 'pinia'
import {ref} from 'vue'

//全局通知
export const userGlobalNotifyStore = defineStore('userGlobalNotifyStoreId', () => {
    //用于通知MyNoteView组件更新配置
    const updateBgImgCnt = ref(0)

    return{updateBgImgCnt}
})
