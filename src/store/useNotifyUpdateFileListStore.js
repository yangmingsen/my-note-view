import { defineStore } from 'pinia'
import {ref} from 'vue'

export const useNotifyUpdateFileListStore = defineStore('notifyUpdateFileListId', () => {
    //用于保存通知事件
    const updateFileList = ref(0)

    return{updateFileList}
})
