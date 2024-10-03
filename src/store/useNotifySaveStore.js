import { defineStore } from 'pinia'
import {ref} from 'vue'

//用于通知子组件保存更新
export const useNotifySaveStore = defineStore('notifySaveId', () => {
    //用于保存通知事件
    const saveEvent = ref(0)

    return{saveEvent}
})
