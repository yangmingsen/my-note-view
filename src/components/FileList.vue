<template>
  <div class="f-search">
    <img @click="backParentDir" src="../assets/回车按钮.png">
    <div class="search-content">
      <input type="text" value="搜索...">
    </div>
    <img @click.left="filterClick($event)" src="../assets/filter.png">
  </div>
  <div class="file-items">
    <p v-for="item in fileListData" @dblclick="doubleClick(item)"  @contextmenu="($event) => menusEvent($event, fileItemMenus, item)">
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
</template>

<script setup>
import {FileMarkdownOutlined, FolderOutlined, FileZipOutlined,
  FileUnknownOutlined, FileOutlined,FileExcelOutlined,FileWordOutlined,
  FilePptOutlined,FileImageOutlined,FileJpgOutlined,FilePdfOutlined,
  PlusCircleOutlined} from '@ant-design/icons-vue';
import { message, Modal  } from 'ant-design-vue';
import { shallowRef, ref, createVNode  } from "vue";
import { menusEvent } from 'vue3-menus';
import {RemoteApi as noteApi} from '../api/RemoteApi'
import {useSelectStore} from "../store/useSelectStore";


const selectStore = useSelectStore();

//当前的父目录Key 或者 id 或者 parentId
let dirSelectKey = '';


let fileSelectKey = '';
const fileListData = ref([]);
let addNoteUpdate = 0; //see useSelectStore.js
selectStore.$subscribe((mutation, state) =>{
  const changeKey = state.dirSelectKey;
  if (changeKey != undefined && dirSelectKey != changeKey) {
    dirSelectKey =  changeKey
    updateFileList({"nid": dirSelectKey});
  }

  if (state.addNoteUpdate != undefined && addNoteUpdate != state.addNoteUpdate) {
    addNoteUpdate = state.addNoteUpdate
    updateFileList({"nid": dirSelectKey})
  }

})

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

  }).catch(err => {
    message.error("操作失败...")
    console.error(err)
  })
}

const doubleClick = (info) => {
  console.log(info)
  const dClickId = info.id;
  dirSelectKey = dClickId;
  updateFileList({"nid": dirSelectKey});
}

//更新文件列表
const updateFileList = (para) => {
  noteApi.getNoteList(para).then((res) => {
    const data  = res.data.datas;
    fileListData.value = [];
    for (let dt of data) {
      fileListData.value.push(dt);
    }
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
  console.log(event)
  menusEvent(event, filterMenus.value);
}

const spaceMenus = shallowRef({
  menus: [
    {
      label: "新文件",
      tip: 'NewFile',
      click: () => {
        console.log("创建时间")
        return true;
      }
    },
    {
      label: "新目录",
      tip: 'NewDir',
      click: () => {
        return true;
      }
    }
  ]
})

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
      label: "新文件(wer)",
      tip: 'NewFile',
      click: (menu, arg) => {
        arg.title = menu.label
        arg.content = '请输入新文件名称'
        arg.isile = '1' //文件
        arg.type  = 'wer' //暂时默认wer文件
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

</script>

<style scoped>
.f-search {
  display: flex;
  align-items: center;
  justify-content: space-around;
}
.file-items {
  margin-top: 10px;
  overflow: auto;
  height: 800px;
  padding: 5px;
}
.file-items p:hover {
  background-color: antiquewhite;
  cursor: default;

}

.item-name {
  margin-left: 5px;
}

</style>
