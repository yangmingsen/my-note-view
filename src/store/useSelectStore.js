import { defineStore } from 'pinia'
import {ref} from 'vue'

export const useSelectStore = defineStore('selectKeyId', () => {
    //用于选中新目录时，更新文件列表组件的文件列表
    const dirSelectKey = ref('')

    //用作目录更新时，通知文件列表组件更新文件列表
    const addNoteUpdate = ref(0)

    const parentDirUpdate = ref(0)

    function getDirSelectKeyValue() {

    }
    return{dirSelectKey, addNoteUpdate, parentDirUpdate, getDirSelectKeyValue}
})
