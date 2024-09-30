import { defineStore } from 'pinia'
import {ref} from 'vue'

export const useNotifySaveStore = defineStore('notifySaveId', () => {
    //用于保存通知事件
    const saveEvent = ref(0)

    return{saveEvent}
})
