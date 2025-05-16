<template>
  <div v-if="showModel === showModelFlag.needPasswordModel">
    <div class="f-pd-tips">
      <span v-if="showErrorTips"> 密码错误，请重新输入</span>
    </div>
    <div class="f-pd-container">
      <input type="password" v-model="authPass" @keyup.enter="doPassAuth" class="f-pd-input" placeholder="请输入阅读密码">
      <button class="f-pd-button" @click="doPassAuth">确定</button>
    </div>
    <div><a href="#" @click="doReleaseReadPassword2">取消阅读密码</a></div>
  </div>

  <div v-if="showModel === showModelFlag.fileListModel" class="files-scope">
    <div class="f-search">
      <img @click="backParentDir" src="../assets/回车按钮.png">
      <div class="search-content">
        <input type="text" value="搜索...ctrl+k" @click.left="mouseClick">
      </div>
      <img @click.left="filterClick($event)" src="../assets/filter.png">
    </div>
    <div id="drop-file-area"   class="file-items" @contextmenu="spaceClick($event)">
      <div v-for="item in fileListData"
           :draggable="canDoDrag"
           class="note-item"
         :class="[item.id === fileSelectKey ? 'active' : '', item.id === dragingStyId ? 'dragging': '', item.id === dragOverStyId ? 'drag-over': '']"
         @click="oneceClick($emit, item)"
         @dblclick="doubleClick(item)"
         @contextmenu="itemRightClick($event, item)"
           @dragstart="doDragstart($event, item)"
           @dragend="doDragend($event)"
           @dragover="doDragover($event, item)"
           @dragleave="doDragleave($event)"
           @drop="doDrop($event, item)"
      >
        <div class="item-meta-info">
          <div class="item-meta-info-type">
            <span v-if="item.isFile === '0'"><FolderTwoTone /></span>
            <span v-else-if="item.type==='md'"><FileMarkdownTwoTone /></span>
            <span v-else-if="item.type==='wer'"><FileTwoTone /></span>
            <span v-else-if="item.type==='xls' || item.type==='xlsx'"><FileExcelTwoTone /></span>
            <span v-else-if="item.type==='doc' || item.type==='docx'"><FileWordTwoTone/></span>
            <span v-else-if="item.type==='ppt' || item.type==='pptx'"><FilePptTwoTone /></span>
            <span v-else-if="item.type==='jpg' || item.type==='jpeg'"><FileJpgOutlined/></span>
            <span v-else-if="item.type==='png'"><FileImageTwoTone/></span>
            <span v-else-if="item.type==='gif'"><FileGifOutlined /></span>
            <span v-else-if="item.type==='txt'"><FileTextTwoTone /></span>
            <span v-else-if="item.type==='zip'"><FileZipOutlined/></span>
            <span v-else-if="item.type==='pdf'"><FilePdfTwoTone /></span>
            <span v-else-if="item.type==='mindmap'"><BulbTwoTone  /></span>
            <span v-else><FileUnknownTwoTone /></span>
          </div>
          <div class="item-meta-info-name">
            <span class="item-name"> {{ item.name }}</span>
          </div>
          <div class="item-meta-info-encrypt">
            <span v-if="item.encrypted === '1'"><LockTwoTone /></span>
          </div>
        </div>
        <div>
          <span class="item-info-tip">{{item.createTime}}</span>
          <span class="item-info-tip" v-if="item.isFile === '0'"></span>
          <span class="item-info-tip" v-else-if="item.size > 1048576">&nbsp;&nbsp;&nbsp;{{(item.size / 1048576).toFixed(2)}}MB</span>
          <span class="item-info-tip" v-else-if="item.size > 1024">&nbsp;&nbsp;&nbsp;{{(item.size / 1024).toFixed(2)}}KB</span>
          <span class="item-info-tip" v-else>&nbsp;&nbsp;&nbsp;{{item.size}}B</span>
        </div>
      </div>
    </div>

    <!-- 文件上传-->
    <input type="file" id="file-upload" style="display: none; position: absolute;">
    <!-- 搜索框-->
    <div id="search-modal" class="search-modal">
      <input type="text" v-model="keyword" id="search-input" @input="searchEvent"  placeholder="Search...">
      <ul id="suggestions-list">
        <li
            v-for="sug in suggestionsList"
            @click="sugliClick(sug)"
        ><span v-html="sug.result"></span></li>
      </ul>
    </div>
    <div class="file-items-footer">
      <span>当前所在目录:</span>
      <a-breadcrumb v-if="menuSelected === itemList.treeFiles" >
        <a-breadcrumb-item v-for="item in breadcrumbList">
          <a href="#">{{ item.name }}</a>
        </a-breadcrumb-item>
      </a-breadcrumb>
      <div v-if="menuSelected === itemList.recentVisit">
        <span >最近访问</span>
      </div>
      <div v-if="menuSelected === itemList.rencentFiles">
        <span >最新文档</span>
      </div>
      <div v-if="menuSelected === itemList.delFiles">
        <span >最近删除</span>
      </div>
      <span>一共：{{ totalFileSize }}个项目</span>
    </div>
  </div>
  <!-- 对话框-->
  <a-modal v-model:open="progressOpen" title="上传进度">
    <a-progress :percent="progressPercent" />
  </a-modal>
</template>

<script setup>
import {FilePdfTwoTone,FileMarkdownTwoTone,FileImageTwoTone,FolderTwoTone,FileWordTwoTone,
  FilePptTwoTone,FileTextTwoTone,FileExcelTwoTone,FileTwoTone,FileUnknownTwoTone,
  FileMarkdownOutlined, FolderOutlined, FileZipOutlined,LockTwoTone,
  FileUnknownOutlined, FileOutlined, FileExcelOutlined, FileWordOutlined,
  FilePptOutlined, FileImageOutlined, FileJpgOutlined, FilePdfOutlined,
  PlusCircleOutlined, RollbackOutlined, UnorderedListOutlined,FileTextOutlined,FileGifOutlined,
  BulbTwoTone

} from '@ant-design/icons-vue';
import {message, Modal} from 'ant-design-vue';
import {shallowRef, ref, createVNode, onMounted} from "vue";
import {menusEvent} from 'vue3-menus';
import {RemoteApi as noteApi} from '../api/RemoteApi'
import {useSelectStore} from "../store/useSelectStore";
import {useItemSelectStore} from "../store/useItemSelectStore";
import {useNotifyUpdateFileListStore} from "../store/useNotifyUpdateFileListStore";
import {ConstansFlag as constFlag} from '../js/ConstansFlag.js'

const emitT = defineEmits(['choose-note'])

//flm 文件列表, npd需要密码验证面板
const showModelFlag = {fileListModel: 'flm', needPasswordModel: 'npd'}
const showModel = ref(showModelFlag.fileListModel)

//搜索关键字。 搜索功能实现
const keyword = ref('')
let timer = null
let keyLen = false
const searchEvent = () => {
  clearTimer()
  if (keyword.value && keyword.value.length > 0) {
    keyLen = true
    timer = setTimeout(() => {
      // console.log(`keyword: ${keyword.value}`)
      //此处为接口函数
      performSearch({searchContent: keyword.value})
    }, 500)
  } else {
    if (keyLen) {
      // console.log(`keyword: ${keyword.value}`)
      //此处为接口函数
      performSearch({searchContent: keyword.value})
    }
    if (keyword.value === '') {
      keyLen = false
      return
    }
  }
}
const clearTimer = () => {
  if (timer) {
    clearTimeout(timer)
  }
}
const performSearch = (info) => {
  const query = info.searchContent;
  noteApi.findNoteByCondition({searchContent: query}).then(res => {
    const resData = res.data;
    if (resData.respCode === 0) {
      suggestionsList.value = resData.datas.listResult;
    }
  }).catch(err => {
    message.error("搜索失败")
    console.error(err)
  })
}

//搜索列表
const suggestionsList = ref([])
//点击搜索列表中的某个时触发
const sugliClick = (info) => {
  const pid = info.parentId
  const id = info.id
  //更新目录列表
  // dirSelectKey = pid
  setDirSelectKey(pid)
  updateFileList({"nid": getDirSelectKey()})
  //更新面包线
  updateBreadcrumb({id: getDirSelectKey()})

  //向上父父组件传递信息
  info.upTree = true //通知tree组件更新选中情况
  emitT('choose-note', info)
  //更新当前选中
  // fileSelectKey.value = id
  setFileSelectKey(id)
  //关闭显示
  document.getElementById('search-modal').style.display = 'none';
  //clear search keyword
  keyword.value = ''
  suggestionsList.value = []
}

//同步一次当前选中的note
const syncLastVisit = () => {
  const lastvisit = {
    lastvisit: {
      parentId: getDirSelectKey(),
      id: getFileSelectKey()
    }
  }
  noteApi.updateUserConfig({content: JSON.stringify(lastvisit)}).then(res => {
    const resData = res.data
    if (resData.respCode === 0) {
      // message.success("同步LastVisit成功")
    } else {
      message.error("同步LastVisit失败")
    }
  }).catch(err => {
    message.error("同步LastVisit错误")
    console.error(err)
  })
}

//初始化加载
const initLoadFileList = () => {
  noteApi.findUserConfig().then(res => {
    const resData = res.data
    if (resData.respCode === 0) {
      const userConfigObj = JSON.parse(resData.datas)
      //set lastVisit
      const lastVisit = userConfigObj.lastvisit
      if (lastVisit !== undefined) {
        lastVisit.initFlag = true
        locationLastVisit(lastVisit)
      } else {
        locationDefault()
      }
    } else {
      message.warn("获取FileList初始化数据失败")
      locationDefault()
    }
  }).catch(err => {
    message.error("初始化FileList错误")
    console.error(err)
  })
}

//初始化，也就是定位root目录
const locationDefault = () => {
  //初始化内容
  noteApi.findRoot().then(res => {
    const resData = res.data;
    if (resData.respCode === 0) {
      const rootId = resData.datas.id;
      // dirSelectKey = rootId
      setDirSelectKey(rootId)
      //初始化文件列表
      updateFileList({nid: rootId})

      //面包线
      updateBreadcrumb({id: rootId})
    }
  }).catch(err => {
    message.error("获取root失败")
    console.error(err)
  })
}

//定位上一次访问点
const locationLastVisit = (info) => {
  const id = info.id
  const pid = info.parentId
  noteApi.findOne({id: id}).then(res => {
    const resData = res.data
    if (resData.respCode === 0) {
      const noteIndex = resData.datas;
      //更新目录列表
      // dirSelectKey = pid
      setDirSelectKey(pid)
      updateFileList({"nid": getDirSelectKey()})
      //更新面包线
      updateBreadcrumb({id: getDirSelectKey()})
      //向上父父组件传递信息
      //通知tree组件更新选中情况
      emitT('choose-note', noteIndex)
      //更新当前选中
      if (info.initFlag) {
        setFileSelectKey2(id)
      } else {
        setFileSelectKey(id)
      }
    }
  }).catch(err => {
    message.error("请求获取noteIndex错误")
    console.error(err)
  })
}

const mouseClick = () => {
  const searchModal = document.getElementById('search-modal');
  searchModal.classList.remove('hide');
  searchModal.style.display = 'block';
  document.getElementById('search-input').focus();
}

//右击空白区域时显示的菜单
const spaceClick = (event) => {
  if (menuCompKeySelected === itemList.treeFiles) {
    menusEvent(event, spaceMenus.value)
  } else if (menuCompKeySelected === itemList.delFiles) {
    menusEvent(event, delSpaceMenus.value)
  }

  event.preventDefault();
  event.stopPropagation();
}

const doReleaseReadPassword2 = () => {
  doReleaseReadPassword({id: tmpNoteIndexId})
}

const doReleaseReadPassword = (info) => {
  const arg = {
    title: '请输入取消密码',
    content: '',
    key: info.id,
    opType: opType.unEncrypted,
    inputType: 'password'
  }
  showInputModalConfirm(arg)
}

const needReadPasswordMenu =  {
  label: "阅读密码",
  tip: 'encrypted',
  click: (menu, arg) => {
    const id = arg.id;
    noteApi.encryptedReadNote({id: id}).then(res => {
      const resData = res.data
      if (resData.respCode === 0) {
        autoUpdateFileList()
        //通知更新面板
        arg.encrypted = '1'
        emitT('choose-note', arg)
      } else {
        message.error("网络请求加密笔记失败")
      }
    }).catch(err => {
      message.error("网络请求加密笔记错误")
      console.error(err)
    })

    return true;
  }
}
const releaseReadPasswordMenu = {
  label: "取消阅读密码",
  tip: 'UnEncrypted',
  click: (menu, arg) => {
    const id = arg.id;
    doReleaseReadPassword({id: id})
    return true;
  }
}

//右击某个项目区域时显示的菜单
const itemRightClick = (event, item) => {
  if (menuCompKeySelected === itemList.treeFiles) {
    const itemMenus = {menus: []}
    for (let item of fileItemMenus.value.menus) {
      itemMenus.menus.push(item)
    }
    if (item.encrypted === '0') {//无加密右击场景
      itemMenus.menus.push(needReadPasswordMenu)
      if (item.isFile === '1') { //文件场景需要copy,download. 文件夹不需要
        itemMenus.menus.push(copyPreviewAddrMenu, downloadNoteMenu, exportNoteMenu)
      }
    } else {
      itemMenus.menus.push(releaseReadPasswordMenu)
    }
    menusEvent(event, itemMenus, item)
  } else if (menuCompKeySelected === itemList.delFiles) {
    menusEvent(event, delItemMenus.value, item)
  }

  event.preventDefault();
  event.stopPropagation();
}

const selectStore = useSelectStore();
const itemSelectStore = useItemSelectStore();
const notifyUpdateFileListStore = useNotifyUpdateFileListStore();

//非常重要
//当前的父目录Key 或者 id 或者 parentId
let dirSelectKey = ref('');
const getDirSelectKey = () => {
  return dirSelectKey.value
}
const setDirSelectKey = (key) => {
  dirSelectKey.value = key
}

//总文件数
const totalFileSize = ref(0)
//当前选中的项目id或key, 也就是fileListData选中的其中一项
let fileSelectKey = ref('');
const setFileSelectKey = (key) => {
  fileSelectKey.value = key
  //同步一次
  syncLastVisit()
}
//不同步
const setFileSelectKey2 = (key) => {
  fileSelectKey.value = key
}
const getFileSelectKey = () => {
  return fileSelectKey.value
}

//笔记项目列表
const fileListData = ref([]);
//更新文件列表及总文件数量
const setFileListData = (info) => {
  const data = info.data
  fileListData.value = []
  for (let dt of data) {
    fileListData.value.push(dt)
  }
  totalFileSize.value = fileListData.value.length
}

//笔记目录进入，需要输入密码进入的相关
const showErrorTips = ref(false)
const authPass = ref('')
let tmpNoteIndexId = ''
//密码验证
const doPassAuth = () => {
  if  (authPass.value === '') {
    message.warn("请输入密码")
    return
  }
  noteApi.notePasswordAuth({id: tmpNoteIndexId, password: authPass.value}).then(res => {
    const resData = res.data
    if (resData.respCode === 0) {
      showModel.value = showModelFlag.fileListModel
      updateFileList({"nid": getDirSelectKey()});
      //更新面包线
      updateBreadcrumb({id: getDirSelectKey()})
    } else {
      if (showErrorTips.value === false) {
        showErrorTips.value = true
        setTimeout(() => {
          showErrorTips.value = false
        }, 1000)
      }
    }
  }).catch(err => {
    message.error("认证失败")
    console.error(err)
  })
}

//监听更新当前文件列表
notifyUpdateFileListStore.$subscribe((mutation, state) => {
  const changeKey = state.updateFileList
  if (changeKey !== undefined) {
    autoUpdateFileList()
  }
})

let addNoteUpdate = 0; //see useSelectStore.js
//订阅监听tree的key变更. 当鼠标点击menu tree组件上的某个节点时更新这里
let tmpChangeKey = '';
selectStore.$subscribe((mutation, state) => {
  const changeKey = state.dirSelectKey
  if (changeKey !== undefined && tmpChangeKey !== changeKey) {
    //todo 这个地方拦截加密的目录
    noteApi.findOne({id: changeKey}).then(res => {
      const resData = res.data
      if (resData.respCode === 0) {
        const noteIndex = resData.datas
        tmpChangeKey = changeKey
        setDirSelectKey(changeKey)
        if (showModel.value !== showModelFlag.fileListModel) {
          showModel.value = showModelFlag.fileListModel
        }
        if (noteIndex.encrypted === '1') {
          authPass.value = ''
          showModel.value = showModelFlag.needPasswordModel
          tmpNoteIndexId = changeKey
        } else {
          updateFileList({"nid": getDirSelectKey()});
          //更新面包线
          updateBreadcrumb({id: getDirSelectKey()})
        }
      }
    }).catch(err => {
        message.error("请求查询noteIndex错误")
        console.error(err)
    })
  }

  if (state.addNoteUpdate !== undefined && addNoteUpdate !== state.addNoteUpdate) {
    addNoteUpdate = state.addNoteUpdate
    updateFileList({"nid": getDirSelectKey()})
  }
})

//menu组件当前选中的item项
const itemList = constFlag.itemList
//当前left面板选中的item
let menuCompKeySelected = itemList.treeFiles
//是否显示面包线
const menuSelected = ref(menuCompKeySelected)
//监听menu组件item(最近删除,tree树,最近更新...)改变情况
itemSelectStore.$subscribe((mutation, state) => {
  const curKey = menuCompKeySelected = state.itemSelectKey
  menuSelected.value = curKey
  curKey === itemList.treeFiles ? canDoDrag.value = true : canDoDrag.value = false
  if (curKey !== undefined) {
    if (curKey === itemList.rencentFiles) {
      updateRecentFileLists()
    } else if (curKey === itemList.delFiles) {
      updateDeletedFileLists()
    } else if (curKey === itemList.recentVisit) {
      updateRecentVisitList()
    }
  }
})

//排序类型，如按创建时间，更新时间等进行排序
const sortType = {createTime: 0, updateTime: 1, fileName: 2, fileSize: 3, viewTime: 4}
//保存asc或desc信息。采用自增模除2 实现 0 desc, 1 asc
const itemAscType = {
  recentFile: 0, recentFileClickCnt: {createTime: 0, updateTime: 0, fileName: 0, fileSize: 0, viewTime: 0},
  delFile: 0,  delFileClickCnt: {createTime: 0, updateTime: 0, fileName: 0, fileSize: 0, viewTime: 0},
  treeFile: 0, treeFileClickCnt: {createTime: 0, updateTime: 0, fileName: 0, fileSize: 0, viewTime: 0}
}
//保存当前left组件item项的排序信息
const itemSortType = {recentFile: sortType.createTime, delFile: sortType.createTime, treeFile: sortType.viewTime}

//更新最近访问列表
const updateRecentVisitList = () => {
  noteApi.getRecentVisitList().then(res => {
    const resData = res.data
    if (resData.respCode === 0) {
      setFileListData({data: resData.datas})
    } else {
      message.warn("获取数据失败")
    }
  }).catch(err => {
    message.error("数据获取错误")
    console.error(err)
  })
}

//更新最近文件列表
const updateRecentFileLists = () => {
  const para = {}
  para.sortBy = itemSortType.recentFile
  para.asc = itemAscType.recentFile
  noteApi.getRecentFiles(para).then(res => {
    const recentFileDatas = res.data.datas
    setFileListData({data: recentFileDatas})
  }).catch(err => {
    console.error(err)
    message.error("获取最近文件数据失败")
  })
}

//更新已删除的文件列表
const updateDeletedFileLists = () => {
  const para = {}
  para.sortBy = itemSortType.delFile
  para.asc = itemAscType.delFile
  noteApi.getDeletedFiles(para).then(res => {
    const delFileDatas = res.data.datas
    setFileListData({data: delFileDatas})
  }).catch(err => {
    console.error(err)
    message.error("获取删除文件列表数据失败")
  })
}

//单击选中某个笔记
const oneceClick = (emit, info) => {
  // fileSelectKey.value = info.id;
  setFileSelectKey(info.id)
  //告诉主App组件当前menu组件选中的item情况
  info.curMenuItemType = menuCompKeySelected
  emit('choose-note', info)
}

//回到上一层
const backParentDir = () => {
  const id = getDirSelectKey();
  noteApi.findOne({id: id}).then(res => {
    const resData = res.data
    const parentId = resData.datas.parentId;
    if (parentId === '0' || parentId === 0) {//顶层目录不可再退回
      message.warning("当前[" + resData.datas.name + "]已是顶层目录,不可回退")
      return
    }

    updateFileList({nid: parentId})
    // dirSelectKey = parentId //更新当前父级目录id
    setDirSelectKey(parentId)
    //更新面包线
    updateBreadcrumb({id: getDirSelectKey()})
  }).catch(err => {
    message.error("操作失败...")
    console.error(err)
  })
}

//面包线列表数据
const breadcrumbList = ref([])
const updateBreadcrumb = (info) => {
  noteApi.findBreadcrumb({id: info.id}).then(res => {
    const data = res.data.datas
    breadcrumbList.value = []
    for (let dt of data) {
      breadcrumbList.value.push(dt)
    }
  }).catch(err => {
    message.error("获取面包线数据失败")
    console.error(err)
  })
}

//双击某个项目时
const doubleClick = (info) => {
  if (info.isFile !== '0') {
    return
  }
  if (menuCompKeySelected === itemList.delFiles) {
    return;
  }

  if (info.encrypted === '1') {
    const arg = {
      title: '请输入访问密码',
      content: '',
      key: info.id,
      opType: opType.encrypted,
      inputType: 'password'
    }
    showInputModalConfirm(arg)
  } else {
    // dirSelectKey = info.id
    setDirSelectKey(info.id)
    updateFileList({"nid": getDirSelectKey()})
    //更新面包线
    updateBreadcrumb({id: getDirSelectKey()})
  }

}

//更新文件列表
const updateFileList = (para) => {
  para.sortBy = itemSortType.treeFile
  para.asc = itemAscType.treeFile
  para.parentId = para.nid
  noteApi.getNoteList(para).then((res) => {
    const data = res.data.datas
    setFileListData({data: data})
  }).catch(err => {
    message.error('获取Note列表数据失败');
    console.error(err)
  })
}
//自动更新文件列表
const autoUpdateFileList = () => {
  updateFileList({nid: getDirSelectKey()})
}

//过滤菜单
const filterMenus = shallowRef({
  menus: [
    {
      label: "创建时间",
      tip: 'CreateTime',
      click: () => {
        if (menuCompKeySelected === itemList.treeFiles) {
          itemSortType.treeFile = sortType.createTime
          itemAscType.treeFile = (itemAscType.treeFileClickCnt.createTime++)%2
          autoUpdateFileList()
        } else if (menuCompKeySelected === itemList.delFiles) {
          itemSortType.delFile = sortType.createTime
          itemAscType.delFile = (itemAscType.delFileClickCnt.createTime++)%2
          updateDeletedFileLists()
        } else if (menuCompKeySelected === itemList.rencentFiles) {
          itemSortType.recentFile = sortType.createTime
          itemAscType.recentFile = (itemAscType.recentFileClickCnt.createTime++)%2
          updateRecentFileLists()
        }
        return true
      }
    },
    {
      label: "修改时间",
      tip: 'UpdateTime',
      click: () => {
        if (menuCompKeySelected === itemList.treeFiles) {
          itemSortType.treeFile = sortType.updateTime
          itemAscType.treeFile = (itemAscType.treeFileClickCnt.updateTime++)%2
          autoUpdateFileList()
        } else if (menuCompKeySelected === itemList.delFiles) {
          itemSortType.delFile = sortType.updateTime
          itemAscType.delFile = (itemAscType.delFileClickCnt.updateTime++)%2
          updateDeletedFileLists()
        } else if (menuCompKeySelected === itemList.rencentFiles) {
          itemSortType.recentFile = sortType.updateTime
          itemAscType.recentFile = (itemAscType.recentFileClickCnt.updateTime++)%2
          updateRecentFileLists()
        }
        return true
      }
    },
    {
      label: "文件名称",
      tip: 'FileName',
      click: () => {
        if (menuCompKeySelected === itemList.treeFiles) {
          itemSortType.treeFile = sortType.fileName
          itemAscType.treeFile = (itemAscType.treeFileClickCnt.fileName++)%2
          autoUpdateFileList()
        } else if (menuCompKeySelected === itemList.delFiles) {
          itemSortType.delFile = sortType.fileName
          itemAscType.delFile = (itemAscType.delFileClickCnt.fileName++)%2
          updateDeletedFileLists()
        } else if (menuCompKeySelected === itemList.rencentFiles) {
          itemSortType.recentFile = sortType.fileName
          itemAscType.recentFile = (itemAscType.recentFileClickCnt.fileName++)%2
          updateRecentFileLists()
        }

        return true
      }
    },
    {
      label: "文件大小",
      tip: 'FileSize',
      click: () => {
        if (menuCompKeySelected === itemList.treeFiles) {
          itemSortType.treeFile = sortType.fileSize
          itemAscType.treeFile = (itemAscType.treeFileClickCnt.fileSize++)%2
          autoUpdateFileList()
        } else if (menuCompKeySelected === itemList.delFiles) {
          itemSortType.delFile = sortType.fileSize
          itemAscType.delFile = (itemAscType.delFileClickCnt.fileSize++)%2
          updateDeletedFileLists()
        } else if (menuCompKeySelected === itemList.rencentFiles) {
          itemSortType.recentFile = sortType.fileSize
          itemAscType.recentFile = (itemAscType.recentFileClickCnt.fileSize++)%2
          updateRecentFileLists()
        }
        return true
      }
    },
    {
      label: "访问时间",
      tip: 'ViewTime',
      click: () => {
        if (menuCompKeySelected === itemList.treeFiles) {
          itemSortType.treeFile = sortType.viewTime
          itemAscType.treeFile = (itemAscType.treeFileClickCnt.viewTime++)%2
          autoUpdateFileList()
        } else if (menuCompKeySelected === itemList.delFiles) {
          itemSortType.delFile = sortType.viewTime
          itemAscType.delFile = (itemAscType.delFileClickCnt.viewTime++)%2
          updateDeletedFileLists()
        } else if (menuCompKeySelected === itemList.rencentFiles) {
          itemSortType.recentFile = sortType.viewTime
          itemAscType.recentFile = (itemAscType.recentFileClickCnt.viewTime++)%2
          updateRecentFileLists()
        }
        return true
      }
    }
  ]
});

function filterClick(event) {
  menusEvent(event, filterMenus.value);
}

//右击选择菜单时对话框
const showInputModalConfirm = (info) => {
  let iptV = info.content || ''
  const idKey = info.key || '' //当前节点id
  const parentId = info.parentId || '' //父节点id
  const inputType = info.inputType || 'text'
  Modal.confirm({
    title: info.title,
    icon: createVNode(PlusCircleOutlined),
    keyboard: true,
    closable: true,
    content: createVNode('input',
        {type: inputType, value: iptV, id: 'd-input02', style: {width: '100%'}}),
    onOk() {
      const iptE = document.querySelector("#d-input02");
      iptV = iptE.value; //输入值
      if (info.opType === opType.createNewFile || info.opType === opType.createDir) {
        const submitData = {
          parentId: parentId,
          name: iptV,
          isFile: info.isFile
        }
        if (info.isFile === '1') { //文件
          submitData.type = info.type
        }
        noteApi.addNote(submitData).then(res => {
          const resData = res.data
          if (resData.respCode === 0) {
            message.success("操作成功")
            const upPara = {nid: parentId}
            //新建成功后更新当前文件列表
            updateFileList(upPara)
            if (submitData.isFile === '0') {//是目录时更新父tree
              notifyParentDirUpdate()
            }
            //如果当前创建的是文件。就更新主editor面板为当前新建的文件
            if (info.isFile === '1') {
              const noteIndexData  = resData.datas

              //告诉主App组件当前menu组件选中的item情况
              noteIndexData.curMenuItemType = menuCompKeySelected
              console.log(noteIndexData)
              emitT('choose-note', noteIndexData)
              //更新当前选中的key
              // fileSelectKey.value = noteIndexData.id
              setFileSelectKey(noteIndexData.id)
            }
          } else {
            message.warning("操作失败")
            console.error(res)
          }
        }).catch(err => {
          message.warning("操作错误")
          console.error(err)
        })

      } else if (info.opType === opType.delNote) {
        noteApi.delNote({id: idKey}).then(res => {
          const resData = res.data
          if (resData.respCode === 0) {
            message.success("删除成功")
            const info = {nid: parentId}
            updateFileList(info)
            notifyParentDirUpdate()
          } else {
            message.warning("操作失败")
            console.error(res)
          }
        }).catch(err => {
          message.warning("操作错误")
          console.error(err)
        })

      } else if (info.opType === opType.rename) {
        const submitData = {id: idKey, name: iptV}
        noteApi.update(submitData).then(res => {
          const resData = res.data
          if (resData.respCode === 0) {
            message.success("操作成功")
            const info = {nid: parentId}
            updateFileList(info)
            notifyParentDirUpdate()
          } else {
            message.warning("操作失败")
            console.error(res)
          }
        }).catch(err => {
          message.warning("操作错误")
          console.error(err)
        })
      } else if (info.opType === opType.destroy) {
        noteApi.destroyNote({id: idKey}).then(res => {
          const resData = res.data
          if (resData.respCode === 0) {
            message.success("彻底删除成功")
            //更新当前列表
            updateDeletedFileLists()
          }
        }).catch(err => {
          message.error("彻底删除失败")
          console.error(err)
        })
      } else if (info.opType === opType.allDestroy) {
        noteApi.allDestroy().then(res => {
          const resData = res.data
          if (resData.respCode === 0) {
            message.success("全部删除成功")
            //更新当前列表
            updateDeletedFileLists()
          }
        }).catch(err => {
          message.error("全部删除失败")
          console.error(err)
        })
      } else if (info.opType === opType.url2pdf) {
        noteApi.url2pdf({url: iptV, parentId: parentId}).then(res => {
          const resData = res.data
          if (resData.respCode === 0) {
            autoUpdateFileList()
            message.success("url2pdf成功")
          }
        }).catch(err => {
          message.error("url2pdf转换失败")
          console.error(err)
        })
      } else if (info.opType === opType.url2md) {
        noteApi.url2md({url: iptV, parentId: parentId}).then(res => {
          const resData = res.data
          if (resData.respCode === 0) {
            autoUpdateFileList()
            message.success("url2markdown成功")
          }
        }).catch(err => {
          message.error("url2markdown转换失败")
          console.error(err)
        })
      } else if (info.opType === opType.encrypted) {
        noteApi.notePasswordAuth({id: idKey, password: iptV}).then(res => {
          const resData = res.data
          if (resData.respCode === 0) {
            message.success("密码正确")

            // dirSelectKey = idKey
            setDirSelectKey(idKey)
            updateFileList({"nid": getDirSelectKey()})
            //更新面包线
            updateBreadcrumb({id: getDirSelectKey()})
          } else {
            message.error("密码不正确")
          }
        }).catch(err => {
          message.error("网络请求数据失败")
          console.log(err)
        })
      } else if (info.opType === opType.unEncrypted) {
          noteApi.unEncryptedReadNote({id: idKey, password: iptV}).then(res => {
            const resData = res.data
            if (resData.respCode === 0) {
              message.success("取消成功")
              autoUpdateFileList()
            } else {
              message.error("密码不正确")
            }
          }).catch(err => {
            message.error("网络请求数据失败")
            console.log(err)
          })
      }

    },
    onCancel() {
      console.log('Cancel');
    },
    class: 'modal-file-list-input',
  });
}

//通知tree更新
const notifyParentDirUpdate = () => {
  selectStore.$patch((state) => {
    state.parentDirUpdate++;
  })
}

//右击菜单项
const createMarkdownMenu =  {
  label: "新笔记(Markdown)",
  tip: 'NewMarkdownNote',
  click: () => {
    const arg = {
      title: '新文件(Markdown)',
      content: '请输入文件名',
      isFile: '1',
      type: 'md',
      opType: opType.createNewFile,
      parentId: getDirSelectKey() //当前目录id
    }
    showInputModalConfirm(arg)
    return true;
  }
}
const createWerMenu = {
  label: "新文件(Wer)",
  tip: 'NewWerNote',
  click: () => {
    const arg = {
      title: '新文件(Wer)',
      content: '请输入文件名',
      isFile: '1',
      type: 'wer',
      opType: opType.createNewFile,
      parentId: getDirSelectKey() //当前目录id
    }
    showInputModalConfirm(arg)
    return true;
  }
}
const createMindMapMenu = {
  label: "新文件(MindMap)",
  tip: 'NewMindMapNote',
  click: () => {
    const arg = {
      title: '新文件(MindMap)',
      content: '请输入文件名',
      isFile: '1',
      type: 'mindmap',
      opType: opType.createNewFile,
      parentId: getDirSelectKey() //当前目录id
    }
    showInputModalConfirm(arg)
    return true;
  }
}
const createDirMenu = {
  label: "新目录",
  tip: 'NewDir',
  click: () => {
    const arg = {
      title: '新目录',
      content: '请输入目录名',
      isFile: '0',
      opType: opType.createDir,
      parentId: getDirSelectKey() //当前目录id
    }
    showInputModalConfirm(arg)
    return true;
  }
}
const copyPreviewAddrMenu =    {
  label: "复制预览地址",
  tip: 'preview',
  click: (menu, arg) => {
    if (arg.isFile === '0') {
      message.warning("不支持文件夹预览")
      return true
    }

    if (arg.type === 'md' ||
        arg.type === 'wer' ||
        arg.type === 'doc' ||
        arg.type === 'docx' ||
        arg.type === 'xls' ||
        arg.type === 'xlsx' ||
        arg.type === 'ppt' ||
        arg.type === 'pptx'
    ) {
      message.warning("不支持Md,Wer,Office文件预览")
      return true
    }

    const id = arg.id;
    noteApi.getNoteAndSite({id: id}).then(res => {
      const noteFile = res.data.datas.noteFile
      const previewUrl = noteFile.url
      navigator.clipboard.writeText(previewUrl).then(() => {
        message.success("复制到剪切板成功")
      }).catch(err => {
        message.error("复制到剪切板失败")
        console.error(err)
      })
    }).catch(err => {
      message.error("网络请求信息失败")
      console.error(err)
    })

    return true;
  }
}

const exportToPdfMenu = {
  label: "导出pdf",
  tip: 'pdf',
  click: (menu, arg) => {
    if (arg.isFile === '0') {
      message.warning("不支持文件夹下载")
      return true
    }
    const id = arg.id;
    noteApi.exportPdf({noteId: id}).then(res => {
      const resData = res.data
      if (resData.respCode === 0) {
        const downloadUrl = res.data.datas
        window.open(downloadUrl)
        message.success("导出成功")
      }
    }).catch(err => {
      message.error("网络请求信息下载失败")
      console.error(err)
    })
    return true;
  }
}

const exportToDocxMenu = {
  label: "导出docx",
  tip: 'docx',
  click: (menu, arg) => {
    if (arg.isFile === '0') {
      message.warning("不支持文件夹下载")
      return true
    }
    const id = arg.id;
    noteApi.exportDocx({noteId: id}).then(res => {
      const resData = res.data
      if (resData.respCode === 0) {
        const downloadUrl = res.data.datas
        window.open(downloadUrl)
        message.success("导出成功")
      }
    }).catch(err => {
      message.error("网络请求信息下载失败")
      console.error(err)
    })
    return true;
  }
}

//导出母菜单
const exportNoteMenu =  {
  label: "导出",
  tip: 'export Note',
  children: [
    exportToPdfMenu,
    exportToDocxMenu
  ]
}

//下载笔记菜单选项
const downloadNoteMenu = {
  label: "下载",
  tip: 'download',
  click: (menu, arg) => {
    if (arg.isFile === '0') {
      message.warning("不支持文件夹下载")
      return true
    }
    if (arg.type === 'md' ||
        arg.type === 'wer' ||
        arg.type === 'mindmap'

    ) {
      message.warning("不支持Md,Wer文件下载")
      return true
    }
    const id = arg.id;
    noteApi.getNoteAndSite({id: id}).then(res => {
      const noteFile = res.data.datas.noteFile
      const downloadUrl = noteFile.url.replace('view', 'download')
      window.open(downloadUrl)
      message.success("下载成功")
    }).catch(err => {
      message.error("网络请求信息下载失败")
      console.error(err)
    })
    return true;
  }
}

//鼠标右击菜单
const opType = {createNewFile: 0, createDir: 1, rename: 2, delNote: 3,
  destroy: 4,  allDestroy: 5, url2pdf: 6, encrypted: 7, unEncrypted: 8, url2md: 9}
//右击某个文件item的菜单 基础[新建笔记,新建目录,重命名,删除]
const fileItemMenus = shallowRef({
  menus: [
    {
      label: "新建笔记",
      tip: 'NewNote',
      children: [
        createMarkdownMenu,
        createWerMenu,
        createMindMapMenu
      ]
    },//1
    createDirMenu,
    {
      label: "重命名",
      tip: 'rename',
      click: (menu, arg) => {
        arg.title = menu.label
        arg.content = arg.name
        arg.opType = opType.rename
        arg.key = arg.id // 必须是当前选中的节点id
        showInputModalConfirm(arg)
        return true;
      }
    },//2
    {
      label: "删除",
      tip: 'del',
      click: (menu, arg) => {
        arg.title = menu.label
        arg.content = arg.name
        arg.opType = opType.delNote
        arg.key = arg.id // 必须是当前选中的节点id
        showInputModalConfirm(arg)
        return true;
      }
    }//3
  ]
})
//空白区域右击菜单列表
const spaceMenus = shallowRef({
  menus: [
    createMarkdownMenu,
    createWerMenu,
    createMindMapMenu,
    createDirMenu,
    {
      label: "上传",
      tip: 'Upload',
      click: () => {
        document.querySelector("#file-upload").click();
        return true;
      }
    },
    {
      label: "粘贴",
      tip: 'paste',
      click: (menu) => {
        readClipboardData();
        return true;
      }
    },
    {
      label: "url转pdf",
      tip: 'newPdf',
      click: () => {
        const arg = {
          title: 'url转pdf',
          content: '请输入url地址',
          opType: opType.url2pdf,
          parentId: getDirSelectKey() //当前目录id
        }
        showInputModalConfirm(arg)
        return true;
      }
    },
    {
      label: "url转markdown",
      tip: 'newMarkdown',
      click: () => {
        const arg = {
          title: 'url转markdown',
          content: '请输入url地址',
          opType: opType.url2md,
          parentId: getDirSelectKey() //当前目录id
        }
        showInputModalConfirm(arg)
        return true;
      }
    }
  ]
})

//已删除的文件item右击菜单
const delItemMenus = shallowRef({
  menus: [
    {
      label: "恢复",
      tip: 'Recover',
      click: (menu, arg) => {
        noteApi.update({id: arg.id, del: 0}).then(res => {
          const resData = res.data
          if (resData.respCode === 0) {
            message.success("恢复成功")
            //更新当前列表
            updateDeletedFileLists()
          }
        }).catch(err => {
          message.error("恢复失败")
          console.error(err)
        })

        return true;
      }
    },
    {
      label: "彻底删除",
      tip: 'delete',
      click: (menu, arg) => {
        arg.key = arg.id
        arg.title = '彻底删除'
        arg.content = arg.name
        arg.opType = opType.destroy
        showInputModalConfirm(arg)
        return true;
      }
    }
  ]
})
//已删除的文件空白区域右击菜单
const delSpaceMenus = shallowRef({
  menus: [
    {
      label: "全部恢复",
      tip: 'AllRecover',
      click: () => {
        noteApi.allRecover().then(res => {
          const resData = res.data
          if (resData.respCode === 0) {
            message.success("全部恢复除成功")
            //更新当前列表
            updateDeletedFileLists()
          }
        }).catch(err => {
          message.error("全部恢复失败")
          console.error(err)
        })
        return true;
      }
    },
    {
      label: "全部删除",
      tip: 'AllDestroy',
      click: () => {
        const arg = {
          title: '全部删除',
          content: '是否全部删除',
          opType: opType.allDestroy,
        }
        showInputModalConfirm(arg)
        return true;
      }
    }
  ]
})

//从剪贴板获取内容
const readClipboardData = () => {
  const pid = getDirSelectKey()
  navigator.clipboard.read()
    .then(data => {
      data.forEach(item => {
        if (item.types.length === 0) {
          message.warning("当前不支持粘贴")
          return
        }

        if (item.types[0].includes('image')) {
          item.getType(item.types[0]).then(blob => {
            let formData = new FormData();
            formData.append('file', blob, 'pasted-image.png'); // 添加文件名
            formData.append('parentId', pid);
            // 执行上传请求
            const reqUrl = constFlag.apiUrl+'/file/uploadNote'
            fetch(reqUrl, {
              method: 'POST',
              body: formData,
              headers: {Authorization: localStorage.getItem("token")}
            }).then(response => response.json())
                .then(data => {
                  message.success("上传成功...")
                  autoUpdateFileList()
                }).catch(error => {
              message.error("上传失败...")
              console.error('Error uploading image:', error);
            });
          });
        } else if (item.types[0] === 'text/plain') {
          item.getType('text/plain').then( textBlob => {
            // 将 Blob 转换为文本
            textBlob.text().then(text => {
              // 处理文本内容
              noteApi.uploadText({content: text, parentId: pid}).then(res => {
                const resData = res.data
                if (resData.respCode === 0) {
                  message.success("剪贴板文本上传成功")
                  autoUpdateFileList()
                }
              }).catch(err => {
                message.error("剪贴板文本上传失败")
                console.error(err)
              })
            });
          });
        } else {
          const newInfo = item.types[0]
          message.warning(`待支持${newInfo}`)
        }
      })
    }).catch(err => {
      console.error('读取剪贴板数据时出错:', err);
      message.error('读取剪贴板数据时出错')
  })
}

//检查当前环境是否可拖拽文件移动
const checkCanDrag = () => {
  return menuCompKeySelected === itemList.treeFiles
}
//当前是否开启笔记文件拖拽
const canDoDrag = ref(true)
//笔记拖拽移动
const dragingStyId = ref('')
const dragOverStyId = ref('')
let dragTargetInfo = null
//---drag
// 开始拖动
const doDragstart = (e, item) => {
  dragTargetInfo = item
  dragingStyId.value = item.id
}
// 结束拖动
const doDragend = (e) => {
  dragingStyId.value = ''
  dragTargetInfo = null
}
// 允许拖动目标悬停
const doDragover = (e, item) => {
  e.preventDefault();
  dragOverStyId.value = item.id
}
// 拖动离开目标
const doDragleave = (e) => {
  dragOverStyId.value = ''
}
// 放下拖动的文件
const doDrop = (e, toTarget) => {
  e.preventDefault();
  dragOverStyId.value = ''
  if (dragTargetInfo && dragTargetInfo !== toTarget) {
    //isFile: o dir, 1 file
    if (toTarget.isFile === '1') {
      message.warn("目标必须是目录")
      return
    }
    noteApi.noteMove({fromId: dragTargetInfo.id, toId: toTarget.id}).then(res => {
      const resData = res.data;
      if (resData.respCode === 0) {
        message.success("移动成功")
        autoUpdateFileList()
      } else {
        message.error("移动失败...")
      }
    }).catch(err => {
      message.error("移动错误")
      console.error(err)
    })
  }
}

//上传进度条
const progressOpen = ref(false)
const progressPercent =ref(0)

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 10MB in byte
onMounted(() => {
  document.getElementById('file-upload').addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        message.warning('File is too large. Maximum size allowed is 50MB.');
        return;
      }
      const formData = new FormData();
      formData.append('file', file);
      formData.append('parentId', getDirSelectKey());
      const reqUrl = constFlag.apiUrl+'/file/uploadNote'

      const xhr = new XMLHttpRequest();
      xhr.open('POST', reqUrl); // 替换成你的上传接口
      // 设置请求头并添加token
      xhr.setRequestHeader('Authorization', localStorage.getItem("token"));
      // 显示进度条
      progressOpen.value = true
      progressPercent.value = 0

      // 监听上传进度
      xhr.upload.onprogress = function(event) {
        if (event.lengthComputable) {
          progressPercent.value = (event.loaded / event.total) * 100;
        }
      };

      // 上传完成
      xhr.onload = function() {
        if (xhr.status === 200) {
          message.success("上传成功")
          autoUpdateFileList()
        } else {
          message.error("文件上传失败")
        }
        progressOpen.value = false
        progressPercent.value = 0
      };

      // 发送文件
      xhr.send(formData);
    }
  });

  //初始化内容
  initLoadFileList()

  //运行拖拽上传
  //drop-file-area
  let dropArea = document.getElementById('drop-file-area');
  dropArea.addEventListener('dragover', function(event) {
    event.preventDefault();  // 允许放置
    // dropArea.style.borderColor = 'blue';  // 改变边框颜色以指示可放置
    // event.dataTransfer.dropEffect = 'copy';  // 显示"复制"效果
  });
  dropArea.addEventListener('drop', function(event) {
    event.preventDefault();
    let files = event.dataTransfer.files;
    if (files.length > 0) {
      // 处理文件上传
      const formData = new FormData();
      formData.append('parentId', getDirSelectKey());
      formData.append('file', files[0]);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', constFlag.apiUrl+"/file/uploadNote"); // 替换成你的上传接口
      // 设置请求头并添加token
      xhr.setRequestHeader('Authorization', localStorage.getItem("token"));
      // 显示进度条
      progressOpen.value = true
      progressPercent.value = 0

      // 监听上传进度
      xhr.upload.onprogress = function(event) {
        if (event.lengthComputable) {
          progressPercent.value = (event.loaded / event.total) * 100;
        }
      };

      // 上传完成
      xhr.onload = function() {
        if (xhr.status === 200) {
          message.success("上传成功")
          autoUpdateFileList()
        } else {
          message.error("drop文件上传失败")
        }
        progressOpen.value = false
        progressPercent.value = 0
      };

      // 发送文件
      xhr.send(formData);
    }
  });
  //搜索
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      const searchModal = document.getElementById('search-modal');
      searchModal.classList.add('hide');
      setTimeout(() => searchModal.style.display = 'none', 300);
    }
  });
  document.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      //clear keyword
      keyword.value = ''
      const searchModal = document.getElementById('search-modal');
      searchModal.classList.remove('hide');
      searchModal.style.display = 'block';
      document.getElementById('search-input').focus();
    }
  });

})

</script>

<style scoped>
@import "../assets/search-sty.css";

.f-pd-container {
  width: 100%; /* 长方形的宽度 */
  height: 50px; /* 长方形的高度 */
  border: 1px solid #ccc;
  display: flex; /* 使用 flexbox 布局 */
  align-items: center; /* 垂直居中 */
  padding: 0; /* 去掉内边距 */
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
}
.f-pd-input {
  flex: 1; /* 输入框占据剩余空间 */
  border: none; /* 移除输入框的边框 */
  outline: none; /* 移除输入框的焦点样式 */
  padding: 0 5px; /* 设置左右内边距 */
  height: 100%; /* 输入框高度与外层相同 */
  font-size: 1rem;
}

.f-pd-button {
  padding: 0 10px; /* 按钮的内边距 */
  border: none; /* 移除按钮的边框 */
  cursor: pointer; /* 鼠标悬停时显示为指针 */
  height: 100%; /* 按钮高度与外层相同 */
  width: 30%;
  background-color: #5576BD; /* 默认按钮颜色 */
  transition: background-color 0.3s; /* 添加过渡效果 */
  color: white;
  font-size: small;
}
.f-pd-button:hover {
  background-color: #445E97; /* 鼠标悬停时的颜色 */
}
.f-pd-button:active {
  background-color: #b0b0b0; /* 点击时的颜色 */
}

.f-pd-tips {
  color: red;
  font-size: 1rem;
  height: 25px;
}

.files-scope {
  height: 100vh;
  position: relative;
}

.f-search {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.file-items {
  margin-top: 10px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 5px;
  height: 85vh;
}

.file-items > div {
  margin-top: 0;
  margin-bottom: 10px;
}

.file-items div:hover {
  background-color: antiquewhite;
  cursor: default;
}

.note-item.dragging {
  opacity: 0.5;
}
.note-item.drag-over {
  background-color: #b0e0e6;
}

.active {
  background-color: antiquewhite;
}

.item-meta-info {
  display: flex;
  align-items: center;
}

.item-meta-info-type {
  align-self: start;
  margin-right: 5px;
}
.item-meta-info-name {
  flex: 1;
  height: 25px;
  overflow: hidden;
}
.item-meta-info-encrypt {
  margin-left: 5px;
  align-self: end;
}

.item-name {
  margin-left: 5px;
  font-size: 0.9rem;
}

.item-info-tip {
  font-size: 0.7rem;
}

.file-items-footer {
  /*background-color: #cbc8c8;*/
  /*background-color: rgba(203,200,200, 0.8);*/
  position: absolute;
  width: 100%;
  bottom: 0
}

</style>
