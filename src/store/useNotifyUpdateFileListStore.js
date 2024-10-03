import { defineStore } from 'pinia'
import {ref} from 'vue'

//用于通知更新FileList组件更新
export const useNotifyUpdateFileListStore = defineStore('notifyUpdateFileListId', () => {
    //用于保存通知事件
    const updateFileList = ref(0)

    return{updateFileList}
})
