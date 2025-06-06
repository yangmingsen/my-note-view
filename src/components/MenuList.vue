<template>
  <div class="menu-list">
    <div class="avtar">
      <img src="../assets/avtar.png" @click="showUserConfigModal">
    </div>
    <!--    <p class="flush-tag"><a href="#">会员</a> | <a href="#">刷新</a></p>-->
<!--    <div class="new-content">+ 新文档</div>-->
    <div class="item-li"
         @click="clickManualItem({id: itemList.recentVisit})"
         :class="itemSelected === itemList.recentVisit ? 'item-active' : ''"
    >
      <span><FireTwoTone /> &nbsp;&nbsp;最近访问</span>
    </div>
    <div class="item-li"
         @click="clickManualItem({id: itemList.rencentFiles})"
         :class="itemSelected === itemList.rencentFiles ? 'item-active' : ''"
    >
      <span><HistoryOutlined/> &nbsp;&nbsp;最新文档</span>
    </div>
    <div class="item-li"
         @click="clickManualItem({id: itemList.delFiles})"
         :class="itemSelected === itemList.delFiles ? 'item-active' : ''"
    >
      <span><DeleteTwoTone/> &nbsp;&nbsp;最近删除</span>
    </div>
    <div class="dir-list">
      <a-tree
          class="draggable-tree"
          draggable
          block-node
          :tree-data="treeData"
          v-model:expandedKeys="treeExpandKeys"
          v-model:selectedKeys="treeSelectKeys"
          @rightClick="rightClick"
          @select="clickKey"
      />
    </div>
  </div>

  <a-modal v-model:open="showUserConfigFlag"  width="800px"  title="用户配置" @cancel="closeUserConfigModal">
    <template #footer>
    </template>
    <UserConfigPanel></UserConfigPanel>
  </a-modal>

</template>

<script setup>
import {ref, shallowRef, createVNode, watch, onMounted} from 'vue';
import {menusEvent} from 'vue3-menus';
import {message, Modal} from 'ant-design-vue';
import {
  PlusCircleOutlined, DeleteOutlined, HistoryOutlined,
  DeleteTwoTone, FireTwoTone
} from '@ant-design/icons-vue';
import {RemoteApi as noteApi} from '../api/RemoteApi'
import {useSelectStore} from "../store/useSelectStore";
import {useItemSelectStore} from "../store/useItemSelectStore";
import {ConstansFlag as constFlag} from '../js/ConstansFlag.js'
import UserConfigPanel from './UserConfigPanel.vue'

const props = defineProps(['upSelectKey'])

//观察selectKey动态变化
watch(() => props.upSelectKey, (pidN, pidO) => {
  if (pidN === undefined || pidN === '') {
    return
  }
  noteApi.findBreadcrumb({id: pidN}).then(res => {
    const data = res.data.datas
    treeExpandKeys.value = []
    treeSelectKeys.value = []
    for (let dt of data) {
      treeExpandKeys.value.push(dt.id)
    }
    if (data.length > 0) {
      treeSelectKeys.value.push(pidN)
    }
  }).catch(err => {
    message.error("MenuList组件获取面包线数据失败")
    console.error(err)
  })
})

//是否开启用户设置面板
const showUserConfigFlag = ref(false)
const showUserConfigModal = () => {
  showUserConfigFlag.value = true
}
const closeUserConfigModal = () => {
  showUserConfigFlag.value = false
}

//当前展开树节点，是treeSelectKeys的父节点id
const treeExpandKeys = ref([])
//当前挑选的key..;  我现在在想要不要替换掉curSelectKey这个，但是吧这个又是数组
const treeSelectKeys = ref([])

const setTreeExpandKeys = (info) => {
  treeExpandKeys.value = info.ids
}

const setTreeSelectKeys = (info) => {
  treeSelectKeys.value = info.ids
}

const itemSelectStore = useItemSelectStore();
const itemSelected = ref(-1)
const itemList = constFlag.itemList
//当点击left1面板某个item时，通知文件列表组件进行动态更新
const clickManualItem = (info) => {
  const itemId = info.id
  if (itemSelected.value !== itemId) {
    itemSelected.value = itemId

    //通知文件列表组件更新
    itemSelectStore.$patch((state) => {
      state.itemSelectKey = itemId
    })

  }
}

//记录点击情况
const recordClick = (info) => {
  const noteId = info.id
  noteApi.treeClick({id: noteId}).catch(err => {
    message.error("treeClick异常")
    console.error(err)
  })
}

//右击选择菜单时对话框
const showInputModalConfirm = (info) => {
  let iptV = info.title || ' '
  const nid = info.key //这里的nid代表要创建的笔记/文件夹的parentId
  Modal.confirm({
    title: info.name,
    icon: createVNode(PlusCircleOutlined),
    content: createVNode('input',
        {type: 'text', value: iptV, id: 'd-input01', style: {width: '100%'}}),
    onOk() {
      const iptE = document.querySelector("#d-input01");
      iptV = iptE.value;

      if (info.opType === opType.createNewFile || info.opType === opType.createDir) {
        if (info.isFile === '0') { //目录
          const submitData = {
            parentId: nid,
            name: iptV,
            isFile: '0'
          }
          noteApi.addNote(submitData).then(res => {
            const resData = res.data
            if (resData.respCode === 0) {
              const info = {nid: nid}
              reloadDirAndFileList(info);
            } else {
              message.warning("操作失败")
              console.error(res)
            }
          }).catch(err => {
            message.warning("操作错误")
            console.error(err)
          })

        } else { //文件

        }
      } else if (info.opType === opType.delNote) {
        noteApi.delNote({id: nid}).then(res => {
          const resData = res.data
          if (resData.respCode === 0) {
            message.success("删除成功")
            const info = {nid: nid}
            reloadDirAndFileList(info);
          } else {
            message.warning("操作失败")
            console.error(res)
          }
        }).catch(err => {
          message.warning("操作错误")
          console.error(err)
        })

      } else if (info.opType === opType.rename) {
        const submitData = {id: nid, name: iptV}
        noteApi.update(submitData).then(res => {
          const resData = res.data
          if (resData.respCode === 0) {
            message.success("操作成功")
            const info = {nid: nid}
            reloadDirAndFileList(info);
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
    class: 'modal-menu-list-input',
  });
}

//重新加载tree树及通知文件列表组件更新
const reloadDirAndFileList = (info) => {
  const nid = info.nid;
  //重新加载目录树
  loadTree()

  //通知文件列表组件更新最新数据
  if (nid !== curSelectKey) {
    //更新当前选中的目录Key
    //这种情况是如果用户在没有选中父目录的情况，直接右击某个目录进行新建
    selectStore.$patch((state) => {
      state.dirSelectKey = nid;
      //todo 这里考虑是否更新页面上的tree选中聚焦
    })
  } else { //因为父目录已经选中, $subscribe只对新值进行回调,
    //所以使用addNoteUpdate++来通知更新
    selectStore.$patch((state) => {
      state.addNoteUpdate++;
    })
  }
}

//目录选择时，key在兄弟组件之间的动态传递
const selectStore = useSelectStore();

//当前目录选中的key(也就是上次选中的目录)
let curSelectKey = '';
//当前鼠标点击某个tree节点时
const clickKey = (key) => {
  //更新当前选中的treeid, 也就是父目录id
  curSelectKey = key[0];

  //更新选中的item项
  clickManualItem({id: itemList.treeFiles})

  //更新当前选中的目录Key
  selectStore.$patch((state) => {
    state.dirSelectKey = curSelectKey;
  })

  //记录
  recordClick({id: curSelectKey})
}

//监听子目录变化，及时更新tree
let parentDirUpdate = 0;
selectStore.$subscribe((mutation, state) => {
  if (state.parentDirUpdate !== undefined && parentDirUpdate !== state.parentDirUpdate) {
    parentDirUpdate = state.parentDirUpdate
    loadData()
  }
})

//鼠标右击tree情况
const rightClick = info => {
  //更新选中的item项
  clickManualItem({id: itemList.treeFiles})

  //鼠标右击事件
  const dObj = {title: info.node.title, key: info.node.key}
  menusEvent(info.event, menus.value, dObj);
}

//重新加载tree且指定expendKeys和selectKeys
const loadTree = (info) => {
  noteApi.getAntNoteTree().then((res) => {
    const resData = res.data
    if (resData.respCode === 0) {
      treeData.value = []
      for (let v of resData.datas) {
        treeData.value.push(v);
      }
    } else {
      message.error("请求数据失败")
    }
  }).catch((err) => {
    message.error("调用出错了")
    console.log(err)
  });
}

//store treeData
//tree树存储
const treeData = ref([]);
//加载目录树(all)
const loadData = () => {
  noteApi.getAntNoteTree().then((res) => {
    let tmpNotes = res.data.datas;
    treeData.value = []
    for (let i = 0; i < tmpNotes.length; i++) {
      treeData.value.push(tmpNotes[i]);
    }
    //默认展开root目录
    if (tmpNotes.length > 0) {
      const rootKey = tmpNotes[0].key
      setTreeExpandKeys({ids: [rootKey]})
    }
  }).catch((err) => {
    message.error("调用出错了")
    console.log(err)
  });
}


//鼠标右击菜单
const opType = {createNewFile: 0, createDir: 1, rename: 2, delNote: 3}
const menus = shallowRef({
  menus: [
    {
      label: "新文档",
      tip: '(new)',
      children: [
        {
          label: "新建笔记",
          click: (menu, arg) => {//arg 是传入的参数
            arg.name = menu.label
            arg.title = '请输入新文件名称'
            arg.isFile = '1' //文件
            arg.type = 'wer' //暂时默认wer文件
            arg.opType = opType.createNewFile //
            showInputModalConfirm(arg)
            return true;
          }
        },
        {
          label: "新建目录",
          click: (menu, arg) => {//arg 是传入的参数
            arg.name = menu.label
            arg.title = '请输入新目录名称'
            arg.isFile = '0' //目录
            arg.opType = opType.createDir
            showInputModalConfirm(arg)
            return true;
          }
        },
      ]
    },
    {
      label: "重命名",
      tip: '(Rename)',
      click: (menu, arg) => {
        arg.name = menu.label //对话框的标题
        arg.opType = opType.rename
        showInputModalConfirm(arg)
        return true;
      }
    },
    {
      label: "删除",
      tip: '(Delete)',
      click: (menu, arg) => {
        arg.name = menu.label //对话框的标题
        arg.opType = opType.delNote
        showInputModalConfirm(arg)
        return true;
      }
    }
  ]
});

onMounted( () => {
  //init load
  loadData();
})

</script>

<style scoped>

.menu-list {

}

.avtar {
  height: 80px;
  width: 80px;
  margin-left: 35%;
  margin-top: 10px;
}

.avtar img {
  max-width: 100%;
  border: 3px solid white;
  border-radius: 50%;
}

.flush-tag {
  text-align: center;
  font-size: 1.5rem;
}

.flush-tag a {
  text-decoration: none;
}

.flush-tag a:visited {
  color: black;
}

.flush-tag a:focus {
  color: blueviolet;
}

.flush-tag a:hover {
  color: aqua;
}

.flush-tag a:active {
  color: red;
}

.flush-tag a:nth-child(1) {
  background: url("../assets/砖石.png") no-repeat 0 0;
  background-size: 30px 30px;
  padding-left: 35px;
}

.flush-tag a:nth-child(2) {
  background: url("../assets/flush.png") no-repeat 0 0;
  background-size: 30px 30px;
  padding-left: 35px;
}

.new-content {
  background-color: #5576BD;
  width: 50%;
  height: 30px;
  font-size: 1rem;
  text-align: center;
  margin-left: 25%;
  color: white;
  padding-top: 3px;
  margin-top: 5px;
  margin-bottom: 5px;
  border-radius: 30%;
}

.new-content:hover {
  background-color: #445E97;
}

.item-li {
  cursor: default;
  margin-bottom: 9px;
}

.item-li:hover {
  background-color: #E8F0FF;
}

.item-active {
  background-color: #D2E2FF;
}

.dir-list {
  height: 500px;
  overflow-y: auto;
  /*background-color: rgba(255, 255, 255, 0.8); !* 半透明背景颜色 *!*/
  /*border: 1px solid;*/
}

.dir-list :deep(.ant-tree ) {
  background: unset;
}

</style>
