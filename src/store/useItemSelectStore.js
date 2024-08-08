import { defineStore } from 'pinia'
import {ref} from 'vue'


export const useItemSelectStore = defineStore('itemSelectId', () => {
    //用于
    const itemSelectKey = ref(-1)

    return{itemSelectKey}
})
