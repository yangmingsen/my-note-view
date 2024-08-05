<template>
  <div class="f-search">
    <img @click="backParentDir" src="../assets/回车按钮.png">
    <div class="search-content">
      <input type="text" value="搜索...">
    </div>
    <img @click.left="filterClick($event)" src="../assets/filter.png">
  </div>
  <div class="file-items" @contextmenu="spaceClick($event)">
    <div class="item-space">
      <p v-for="item in fileListData"
         :class="item.id == fileSelectKey ? 'active' : ''"
         @click="oneceClick($emit, item)"
         @dblclick="doubleClick(item)"
         @contextmenu="itemClick($event, item)"
      >
        <span v-if="item.isile == 0"><FolderOutlined /></span>
        <span v-else-if="item.type=='md'"><FileMarkdownOutlined /></span>
        <span v-else-if="item.type=='wer'"><FileOutlined /></span>
        <span v-else-if="item.type=='xls' || item.type=='xlsx'"><FileExcelOutlined /></span>
        <span v-else-if="item.type=='doc' || item.type=='docx'"><FileWordOutlined /></span>
        <span v-else-if="item.type=='ppt' || item.type=='pptx'"><FilePptOutlined /></span>
        <span v-else-if="item.type=='jpg' || item.type=='jpeg'"><FileJpgOutlined /></span>
        <span v-else-if="item.type=='png'"><FileImageOutlined /></span>
        <span v-else-if="item.type=='zip'"><FileZipOutlined /></span>
        <span v-else-if="item.type=='pdf'"><FilePdfOutlined /></span>
        <span v-else><FileUnknownOutlined /></span>
        <span class="item-name">{{item.name}}</span>
      </p>
    </div>
    <input type="file" id="file-upload" style="display: none;">
    <div class="file-items-footer">
      <span>当前所在目录:</span>
        <a-breadcrumb>
          <a-breadcrumb-item v-for="item in breadcrumbList">
            <a href="#">{{item.name}}</a>
          </a-breadcrumb-item>
        </a-breadcrumb>
      <span>一共：{{totalFileSize}}个项目</span>
    </div>

  </div>
</template>

<script setup>
import {FileMarkdownOutlined, FolderOutlined, FileZipOutlined,
  FileUnknownOutlined, FileOutlined,FileExcelOutlined,FileWordOutlined,
  FilePptOutlined,FileImageOutlined,FileJpgOutlined,FilePdfOutlined,
  PlusCircleOutlined} from '@ant-design/icons-vue';
import { message, Modal  } from 'ant-design-vue';
import { shallowRef, ref, createVNode, onMounted  } from "vue";
import { menusEvent } from 'vue3-menus';
import {RemoteApi as noteApi} from '../api/RemoteApi'
import {useSelectStore} from "../store/useSelectStore";

defineEmits(['choose-note'])

//右击空白区域时显示的菜单
const spaceClick = (event) => {
  menusEvent(event,spaceMenus.value)
  event.preventDefault();
  event.stopPropagation();
}

//右击某个项目区域时显示的菜单
const itemClick = (event, item) => {
  menusEvent(event, fileItemMenus.value, item)
  event.preventDefault();
  event.stopPropagation();
}

const selectStore = useSelectStore();

//当前的父目录Key 或者 id 或者 parentId
let dirSelectKey = '';

//总文件数
const totalFileSize = ref(0)

//当前选中的项目id或key, 也就是fileListData选中的其中一项
let fileSelectKey = ref('');
//笔记项目列表
const fileListData = ref([]);
let addNoteUpdate = 0; //see useSelectStore.js
//订阅监听tree的key变更
selectStore.$subscribe((mutation, state) =>{
  const changeKey = state.dirSelectKey;
  if (changeKey != undefined && dirSelectKey != changeKey) {
    dirSelectKey =  changeKey
    updateFileList({"nid": dirSelectKey});
    //更新面包线
    updateBreadcrumb({id: dirSelectKey})
  }

  if (state.addNoteUpdate != undefined && addNoteUpdate != state.addNoteUpdate) {
    addNoteUpdate = state.addNoteUpdate
    updateFileList({"nid": dirSelectKey})
  }
})

//单击选中某个笔记
const oneceClick = (emit, info) => {
  fileSelectKey.value = info.id;
  emit('choose-note', info)
}

//回到上一层
const backParentDir = () => {
  const id = dirSelectKey;
  noteApi.findOne({id: id}).then(res => {
    const resData = res.data
    const parentId = resData.datas.parentId;
    if (parentId == '0' || parentId == 0) {//顶层目录不可再退回
      message.warning("当前["+resData.datas.name+"]已是顶层目录,不可回退")
      return
    }

    updateFileList({nid: parentId})
    dirSelectKey = parentId //更新当前父级目录id
    //更新面包线
    updateBreadcrumb({id: dirSelectKey})
  }).catch(err => {
    message.error("操作失败...")
    console.error(err)
  })
}

//面包线列表数据
const breadcrumbList = ref([])
const updateBreadcrumb = (info) => {
  noteApi.findBreadcrumb({id: info.id}).then(res => {
    const data  = res.data.datas
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
  if (info.isile != '0') {
    return
  }
  const dClickId = info.id
  dirSelectKey = dClickId
  updateFileList({"nid": dirSelectKey})

  //更新面包线
  updateBreadcrumb({id: dirSelectKey})
}

//更新文件列表
const updateFileList = (para) => {
  noteApi.getNoteList(para).then((res) => {
    const data  = res.data.datas
    fileListData.value = []
    for (let dt of data) {
      fileListData.value.push(dt)
    }
    totalFileSize.value = fileListData.value.length

  }).catch(err => {
    message.error('数据交互失败');
    console.error(err)
  })
}

const filterMenus = shallowRef({
  menus: [
    {
      label: "创建时间",
      tip: 'CreateTime',
      click: () => {
        console.log("创建时间")
        return true;
      }
    },
    {
      label: "修改时间",
      tip: 'UpdateTime',
      click: () => {
        return false;
      }
    },
    {
      label: "文件名称",
      tip: 'FileName',
      click: () => {
        return false;
      }
    },
    {
      label: "文件大小",
      tip: 'FileSize',
      click: () => {
        return false;
      }
    }
  ]
});

function filterClick(event) {
  menusEvent(event, filterMenus.value);
}

//右击选择菜单时对话框
const showInputModalConfirm = (info) => {
  let iptV = info.content || ' '
  const idKey = info.key //当前节点id
  const parentId = info.parentId //父节点id
  Modal.confirm({
    title: info.title,
    icon: createVNode(PlusCircleOutlined),
    content: createVNode('input',
        {type: 'text', value: iptV, id: 'd-input02', style: {width: '100%'}}),
    onOk() {
      const iptE = document.querySelector("#d-input02");
      iptV = iptE.value; //输入值
      if (info.opType == opType.createNewFile || info.opType == opType.createDir) {
        const submitData = {
          parentId: parentId,
          name: iptV,
          isile: info.isile
        }
        if (info.isile == '1') { //文件
            submitData.type = info.type
        }
        noteApi.addNote(submitData).then(res => {
          const resData = res.data
          if (resData.respCode === 0) {
            message.success("操作成功")
            const info = {nid: parentId}
            updateFileList(info)
            if (submitData.isile == '0') {//是目录时更新父tree
              notifyParentDirUpdate()
            }
          } else {
            message.warning("操作失败")
            console.error(res)
          }
        }).catch(err => {
          message.warning("操作错误")
          console.error(err)
        })

      } else if (info.opType == opType.delNote) {
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

      } else if (info.opType == opType.rename) {
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

//鼠标右击菜单
const opType = {createNewFile: 0, createDir: 1, rename: 2, delNote: 3}
const fileItemMenus = shallowRef({
  menus: [
    {
      label: "新文件(markdown)",
      tip: 'NewFile',
      click: (menu, arg) => {
        arg.title = menu.label
        arg.content = '请输入新文件名称'
        arg.isile = '1' //文件
        arg.type  = 'md' //暂时默认wer文件
        arg.opType = opType.createNewFile //
        arg.key = arg.parentId //必须是当前选中的节点父节点id
        showInputModalConfirm(arg)
        return true;
      }
    },
    {
      label: "新目录",
      tip: 'NewDir',
      click: (menu, arg) => {
        arg.title = menu.label
        arg.content = '请输入新目录名称'
        arg.isile = '0' //目录
        arg.opType = opType.createDir
        arg.key = arg.parentId //必须是当前选中的节点父节点id
        showInputModalConfirm(arg)
        return true;
      }
    },
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
    },
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
    }
  ]
})
const spaceMenus = shallowRef({
  menus: [
    {
      label: "新文件(Wer)",
      tip: 'NewFile',
      click: () => {
        const arg = {
          title: '新文件(Wer)',
          content: '请输入文件名',
          isile: '1',
          type: 'wer',
          opType: opType.createDir,
          parentId: dirSelectKey //当前目录id
        }
        showInputModalConfirm(arg)
        return true;
      }
    },
    {
      label: "新文件(Markdown)",
      tip: 'NewFile',
      click: () => {
        const arg = {
          title: '新文件(Markdown)',
          content: '请输入文件名',
          isile: '1',
          type: 'md',
          opType: opType.createDir,
          parentId: dirSelectKey //当前目录id
        }
        showInputModalConfirm(arg)
        return true;
      }
    },
    {
      label: "新目录",
      tip: 'NewDir',
      click: () => {
        const arg = {
          title: '新目录',
          content: '请输入目录名',
          isile: '0',
          opType: opType.createNewFile,
          parentId: dirSelectKey //当前目录id
        }
        showInputModalConfirm(arg)
        return true;
      }
    },
    {
      label: "上传",
      tip: 'Upload',
      click: () => {
        document.querySelector("#file-upload").click();
        return true;
      }
    }
  ]
})

onMounted(() => {
  document.getElementById('file-upload').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('parentId', dirSelectKey);
      formData.append('userId', '1111');
      fetch('http://api.note.yms.top/note/file/uploadNote', { // 替换成你的上传接口
        method: 'POST',
        body: formData
      })
          .then(response => response.json())
          .then(data => {
            message.success("上传文件成功")
            // console.log('File uploaded successfully:', data);
            //更新文件列表
            updateFileList({nid: dirSelectKey})
          })
          .catch(error => {
            message.error("上传文件失败")
            console.error('Error uploading file:', error);
          });
    }
  });
})

</script>

<style scoped>
.f-search {
  display: flex;
  align-items: center;
  justify-content: space-around;
}
.file-items {
  margin-top: 10px;
  overflow-y: auto;
  overflow-x: hidden;
  height: 800px;
  padding: 5px;
  position: relative;
}
.file-items p:hover {
  background-color: antiquewhite;
  cursor: default;
}

.active {
  background-color: antiquewhite;
}

.item-name {
  margin-left: 5px;
}

.file-items-footer {
  background-color: #cbc8c8;
  position: absolute;
  width: 100%;
  bottom: 0
}

</style>
