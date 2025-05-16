<script setup>
import MenuList from './components/MenuList.vue'
import FileList from './components/FileList.vue'
import MarkdownEditorPanel from './components/MarkdownEditorPanel.vue'
import WangEditor from './components/WangEditor.vue'
import NotSupportEditor from './components/NotSupportEditor.vue'
import ImageViewer from './components/ImageViewer.vue'
import PdfViewer from './components/PdfViewer.vue'
import WordViewer from './components/WordViewer.vue'
import ExcelViewer from './components/ExcelViewer.vue'
// import TinyMCEPanel from './components/TinyMCEPanel.vue'
import MarkdownPreview from './components/MarkdownPreview.vue'
import MindMapPanel from './components/MindMapPanel.vue'
import NeedPassword from './components/NeedPassword.vue'
import {RemoteApi as noteApi} from "./api/RemoteApi"
import {ConstansFlag as constFlag} from './js/ConstansFlag.js'
import {ref,  onMounted} from 'vue'
import {message} from "ant-design-vue";
import {useNotifySaveStore} from './store/useNotifySaveStore'
import {userGlobalNotifyStore} from "./store/userGlobalNotifyStore";
import ArchivePreview from "./components/ArchivePreview.vue";

const notifySaveStore = useNotifySaveStore()

const globalNotifyStore = userGlobalNotifyStore()

const mdNoteId = ref('')
const werNoteId = ref ('')
const imgNoteId = ref('')
const pdfNoteId = ref('')
const wordNoteId = ref('')
const excelNoteId = ref('')
const textNoteId = ref('')
const mindMapNoteId = ref('')

//needPasswordId 零时
const needPasswordId = ref('')

const archiveId = ref('')

const fileType = constFlag.fileType

const editorFlag = {
  markdwon: 0, wangEditor: 1,  blank: 2, notSupport: 3, img: 4,
  pdf: 5, doc: 6, excel: 7, tiny: 8, textPreview: 9, mindmap: 10, needPassword: 11, archive: 12
}
//当前选中的editor, 默认markdown
const editorSelected = ref(editorFlag.blank)

//当前选中的父目录, 由FileList组件传入, 通知到MenuList组件
const treeSelectKeys = ref('')

//判断当前支持的压缩类型
const checkSupportArchive = (curType, supportTypeList) => {
  for (const st of supportTypeList) {
    if (st === curType) return true;
  }
  return false;
}

//动态选择当前合适的预览或者编辑组件
const chooseEditor = (info) => {
  if (info.curMenuItemType === constFlag.itemList.delFiles) { //如果是menu组件选中的是删除item项,则不展示内容
    editorSelected.value = editorFlag.blank
    showNoteTitleName.value = false
    return
  }
  //更新选中的父目录, 它会去更新menu组件的tree树
  if (treeSelectKeys.value !== info.parentId) {
    treeSelectKeys.value = info.parentId
  }
  const noteId = info.id
  noteTitleName.value = info.name //更新标题
  showNoteTitleName.value = true
  //加密拦截点
  if (info.encrypted === '1' && info.isFile === '1') {
    editorSelected.value = editorFlag.needPassword
    needPasswordId.value = noteId
    return
  }
  if (info.isFile === '0') {
    editorSelected.value = editorFlag.blank
    showNoteTitleName.value = false
  } else {
    if (info.type === fileType.markdown) {
      editorSelected.value = editorFlag.markdwon
      mdNoteId.value = noteId
    } else if (info.type === fileType.wer) {
      werNoteId.value = noteId
      editorSelected.value = editorFlag.wangEditor
    } else if (
        info.type === fileType.jpeg ||
        info.type === fileType.jpg ||
        info.type === fileType.png ) {
      imgNoteId.value = noteId
      editorSelected.value = editorFlag.img
    } else if(info.type === fileType.pdf) {
      pdfNoteId.value = noteId
      editorSelected.value = editorFlag.pdf
    } else if (info.type === fileType.docx) {
      wordNoteId.value = noteId
      editorSelected.value = editorFlag.doc
    } else if (info.type === fileType.xlsx) {
      excelNoteId.value = noteId
      editorSelected.value = editorFlag.excel
    } else if (info.type === fileType.mindmap) {
      mindMapNoteId.value = noteId
      editorSelected.value = editorFlag.mindmap
    } else if (checkSupportArchive(info.type, constFlag.archiveList)) {
      archiveId.value = noteId
      editorSelected.value = editorFlag.archive
    } else {
      noteApi.noteContentCanPreview({id: noteId}).then(res => {
        const data = res.data
        if (data.success === true) {
          textNoteId.value = noteId
          editorSelected.value = editorFlag.textPreview
          return
        }
        editorSelected.value = editorFlag.notSupport
      }).catch(err => {
        editorSelected.value = editorFlag.notSupport
      })
    }
  }
}

//标题显示
const noteTitleName = ref('')
//控制标题是否显示
const showNoteTitleName = ref(false)

//布局模式
const layoutModel = {defualt: 'container', simple: 'container2', edit: 'container3'}
const containerSty = ref(layoutModel.defualt)
const menuSty = ref('menu')
const fileListSty = ref('file')
//改变布局模式
const changeLayoutSty = (para) => {
  if (para.layout === layoutModel.defualt) {
    containerSty.value = layoutModel.defualt
    menuSty.value = 'menu'
    fileListSty.value = 'file'
    containerSty.value = layoutModel.defualt
    layoutImgFlag.value = 3
  } else if (para.layout === layoutModel.simple) {
    menuSty.value = 'menu2'
    fileListSty.value = 'file2'
    containerSty.value = layoutModel.simple
    layoutImgFlag.value = 2
  } else {
    menuSty.value = 'menu3'
    fileListSty.value = 'file3'
    containerSty.value = layoutModel.edit
    layoutImgFlag.value = 1
  }

  const tooltip = document.getElementById('layout-tooltip-id');
  tooltip.style.display = 'none'; // 选择后隐藏弹框

  syncMainLayout()
}
//点击开启对话框
const clickShowTips = () => {
  // 获取按钮和弹框
  const tooltip = document.getElementById('layout-tooltip-id');
  const button = document.querySelector('.main-layout-change');

  // 如果弹框是隐藏的，显示出来并相对按钮定位
  if (tooltip.style.display === 'none' || tooltip.style.display === '') {
    tooltip.style.display = 'block';
    const rect = button.getBoundingClientRect();
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 10}px`; // 位于按钮左上角
    tooltip.style.left = `${rect.left - tooltip.offsetWidth}px`;
  } else {
    tooltip.style.display = 'none';
  }
}

//同步布局
const syncMainLayout = () => {
  const layout = {
    layout: {
      containerSty: containerSty.value,
      menuSty: menuSty.value,
      fileListSty: fileListSty.value,
      layoutImgFlag: layoutImgFlag.value
    }
  }
  noteApi.updateUserConfig({content: JSON.stringify(layout)}).then(res => {
    const resData = res.data
    if (resData.respCode === 0) {
      // message.success("同步layout成功")
    } else {
      message.error("同步layout失败")
    }
  }).catch(err => {
    message.error("同步layout错误")
    console.error(err)
  })

}

//通知子编辑组件保存
const notifySaveEvent = () => {
  notifySaveStore.$patch((state) => {
    state.saveEvent++
  })
}

const initCustConfig =  () => {
  noteApi.findUserConfig().then(res => {
    const resData = res.data
    if (resData.respCode === 0) {
      const userConfigObj = JSON.parse(resData.datas)
      //set layout
      const layout = userConfigObj.layout
      if (layout !== undefined) {
        containerSty.value = layout.containerSty
        menuSty.value = layout.menuSty
        fileListSty.value = layout.fileListSty
        layoutImgFlag.value = layout.layoutImgFlag
      }
      //set bgImg
      const bgImgInfo = userConfigObj.bgImgInfo
      if (bgImgInfo !== undefined) {
        bgImg.value = bgImgInfo.bgImg
      }
    } else {
      message.error("获取userConfig数据失败")
    }
  }).catch(err => {
    message.error("获取userConfig数据错误")
    console.error(err)
  })
}

onMounted(() => {
  initCustConfig()
  document.addEventListener('keydown', function (event) {
    // 检查是否按下了 Ctrl (或 Cmd) + S
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault(); // 阻止默认的保存行为
      // message.warn('保存功能已被禁用！'); // 可选：给用户提示
      notifySaveEvent()
    }
  });
})

//监听重新加载用户配置
const bgImg = ref('')
let tmpUpdateBgImgCnt = 0
globalNotifyStore.$subscribe((mutation, state) => {
  if (state.updateBgImgCnt !== undefined && state.updateBgImgCnt !== tmpUpdateBgImgCnt) {
    tmpUpdateBgImgCnt = state.updateBgImgCnt
    //重新加载配置
    initCustConfig()
  }
})

// 1 => editor(1栏模式), 2 => simple模式(2栏模式),  3 => 3栏模式
const layoutImgFlag = ref(3)
</script>

<template>
  <div class="main-component" :style="{'background-image': 'url('+bgImg+')'}">
    <div :class="containerSty">
      <div :class="menuSty">
        <MenuList :up-select-key="treeSelectKeys"></MenuList>
      </div>
      <div :class="fileListSty">
        <FileList @choose-note="(info) => {chooseEditor(info)}"></FileList>
      </div>
      <div class="content">
        <div class="content-title">
          <h2 v-if="showNoteTitleName">{{noteTitleName}}</h2>
        </div>
        <div class="content-scope">
          <div class="content-scope-component">
            <MarkdownEditorPanel
                :noteid="mdNoteId"
                v-if="editorSelected === editorFlag.markdwon">
            </MarkdownEditorPanel>
            <WangEditor
                :noteid="werNoteId"
                v-if="editorSelected === editorFlag.wangEditor">
            </WangEditor>
            <ImageViewer
                :noteid="imgNoteId"
                v-if="editorSelected === editorFlag.img">
            </ImageViewer>
            <PdfViewer
                :noteid="pdfNoteId"
                v-if="editorSelected === editorFlag.pdf">
            </PdfViewer>
            <WordViewer
                :noteid="wordNoteId"
                v-if="editorSelected === editorFlag.doc"></WordViewer>
            <ExcelViewer
                :noteid="excelNoteId"
                v-if="editorSelected === editorFlag.excel"></ExcelViewer>
            <!--        <TinyMCEPanel-->
            <!--            v-if="editorSelected === editorFlag.tiny"></TinyMCEPanel>-->
            <MarkdownPreview
                :noteid="textNoteId"
                v-if="editorSelected === editorFlag.textPreview"></MarkdownPreview>
            <MindMapPanel
                :noteid="mindMapNoteId"
                v-if="editorSelected === editorFlag.mindmap"></MindMapPanel>
            <NeedPassword
                @choose-note="(info) => {chooseEditor(info)}"
                :noteid="needPasswordId"
                v-if="editorSelected === editorFlag.needPassword"></NeedPassword>
            <NotSupportEditor v-if="editorSelected === editorFlag.notSupport"></NotSupportEditor>
            <ArchivePreview
                :noteid="archiveId"
                v-if="editorSelected === editorFlag.archive"></ArchivePreview>
          </div>
          <div class="content-scope-fun">
<!--            <div class="content-fun">-->
<!--              <img src="./assets/export-img.png">-->
<!--            </div>-->
            <div class="main-layout-change" @click="clickShowTips">
              <img v-if="layoutImgFlag === 1" src="./assets/layout-editor.png">
              <img v-if="layoutImgFlag === 2" src="./assets/layout-simple.png">
              <img v-if="layoutImgFlag === 3" src="./assets/layout-3.png">
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div id="layout-tooltip-id"  class="layout-tooltip">
    <img src="./assets/layout-editor.png" @click="changeLayoutSty({layout: layoutModel.edit})">
    <img src="./assets/layout-simple.png" @click="changeLayoutSty({layout: layoutModel.simple})">
    <img src="./assets/layout-3.png" @click="changeLayoutSty({layout: layoutModel.defualt})">
  </div>

</template>

<style scoped>

.main-component {
  /*background-image: url('http://api.note.yms.top/note/file/view?id=66d9c9fe1d085541cc962801');*/
  background-size: cover; /* 使图片覆盖整个区域 */
}

.container {
  display: grid;
  grid-template-columns: 1fr 1fr 4fr;
  min-height: 100vh;
  background-color: rgba(255, 255, 255, 0.5);
  /*position: relative;*/
}

.container2 {
  display: grid;
  grid-template-columns: 1fr 5fr;
  min-height: 100vh;
  background-color: rgba(255, 255, 255, 0.5);
}

.container3 {
  min-height: 100vh;
  background-color: rgba(255, 255, 255, 0.5);
}


/*.container::before {*/
/*  content: '';*/
/*  position: absolute;*/
/*  top: 0;*/
/*  left: 0;*/
/*  right: 0;*/
/*  bottom: 0;*/
/*  background: url('http://api.note.yms.top/note/file/view?id=66d9c9fe1d085541cc962801') no-repeat ;*/
/*  background-size: cover;*/
/*  opacity: 0.5; !* 调整透明度 *!*/
/*  z-index: -1; !* 保证背景图在内容后面 *!*/
/*}*/


.menu {

}

.menu2, .menu3 {
  display: none;
}


.file, .file2 {
  /*background-color: rgba(255, 255, 255, 0.8); !* 半透明背景颜色 *!*/
  -webkit-user-select: none;
  -moz-user-select: none;
  -o-user-select: none;
  user-select: none;
}

.file3 {
  display: none;
}

.content {
  /* 解决编辑面板x方向内容太多时, 造成的布局失效问题*/
  overflow-x: auto;
}

.content-title {
  min-height: 5vh;
  padding-left: 2%;
}

.content-scope {
  display: grid;
  grid-template-columns: 29fr 1fr;
  min-height: 95vh;
}
.content-scope-component {
  min-width: 100%;
  overflow-y: auto;
}
.content-scope-fun {
  display: flex;
  flex-direction: column; /* 垂直方向排列图片 */
  align-items: center;    /* 水平居中对齐 */
  /*justify-content: center; !* 垂直居中对齐 *!*/
  position: relative;
  height: 95vh;

}

.content-fun {
  bottom: 30px;
  height: 31px;
  width: 31px;
  background-color: #f0f0f0; /* 默认背景色 */
  border: 1px solid #ddd; /* 默认边框 */
  border-radius: 1px; /* 圆角 */
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); /* 阴影 */
  transition: all 0.2s ease; /* 平滑过渡效果 */
  text-align: center;
}

.main-layout-change {
  position: absolute;
  bottom: 30px;
  height: 31px;
  width: 31px;
  background-color: #f0f0f0; /* 默认背景色 */
  border: 1px solid #ddd; /* 默认边框 */
  border-radius: 1px; /* 圆角 */
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); /* 阴影 */
  transition: all 0.2s ease; /* 平滑过渡效果 */
  text-align: center;
}
/* 鼠标悬停时 */
.main-layout-change, .content-fun:hover {
  background-color: #e0e0e0; /* 鼠标悬停背景色 */
  border-color: #bbb; /* 边框颜色变化 */
}

/* 点击时的状态 */
.main-layout-change, .content-fun:active {
  background-color: #ccc; /* 点击时背景色 */
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2); /* 阴影减弱 */
  transform: scale(0.95); /* 点击时缩小按钮，模拟按压效果 */
}


/* 弹框样式 */
.layout-tooltip {
  display: none; /* 默认隐藏 */
  position: absolute;
  top: -10px; /* 相对按钮左上角位置 */
  left: -150px; /* 左移 */
  background-color: white;
  border: 1px solid #ddd;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  z-index: 100;
  padding: 10px;
  width: 150px;
}

.layout-tooltip::before {
  content: '';
  position: absolute;
  bottom: -10px; /* 调整箭头的位置 */
  left: 100%;
  margin-left: -10px;
  border-width: 10px;
  border-style: solid;
  border-color: transparent transparent white transparent;
}
</style>
