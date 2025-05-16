<template>
  <div class="archive-cls">
    <a-input-search v-model:value="searchValue" style="margin-bottom: 8px" placeholder="Search" />
    <a-tree
        :tree-data="treeData"
        v-model:expandedKeys="treeExpandKeys"
        :auto-expand-parent="autoExpandParent"
        @expand="onExpand"
    >
      <template #title="{ title }">
        <span v-if="title.indexOf(searchValue) > -1">
          {{ title.substring(0, title.indexOf(searchValue)) }}
          <span style="color: #f50">{{ searchValue }}</span>
          {{ title.substring(title.indexOf(searchValue) + searchValue.length) }}
        </span>
        <span v-else>{{ title }}</span>
      </template>
    </a-tree>
  </div>
</template>

<script setup>
//当前展开树节点，是treeSelectKeys的父节点id
import {ref, watch} from "vue";
import {RemoteApi as noteApi} from "../api/RemoteApi";
import {message} from "ant-design-vue";

const props = defineProps(['noteid'])

const treeExpandKeys = ref([])
//当前挑选的key..;  我现在在想要不要替换掉curSelectKey这个，但是吧这个又是数组
const treeSelectKeys = ref([])

//tree树存储
const treeData = ref([]);

//为搜索准备
let dataList = [];
const generateList = data => {
  for (let i = 0; i < data.length; i++) {
    const node = data[i];
    const key = node.key;
    const title = node.title;
    dataList.push({
      key: key,
      title: title,
    });
    if (node.children) {
      generateList(node.children);
    }
  }
};

watch(() => props.noteid, (noteidNew, noteidOld) => {
  const param = {id: noteidNew};
  noteApi.noteContentGet(param).then(res => {
    const resData = res.data
    if (resData.respCode === 0) {
      let jsObj = JSON.parse(resData.datas.content)
      treeData.value = []
      treeData.value.push(jsObj)
      //for search
      const daList = [jsObj]
      dataList = []
      generateList(daList)
    }
  }).catch(err => {
    message.error("获取压缩文件预览内容失败")
    console.error(err)
  })
}, {immediate: true})


const searchValue = ref('')
//是否自动展开父节点
const autoExpandParent = ref(true)
//	展开/收起节点时触发
const onExpand = keys => {
   treeExpandKeys.value = keys;
   autoExpandParent.value = false;
}

const getParentKey = (key, tree) => {
  let parentKey;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some(item => item.key === key)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey;
};

watch(searchValue, value => {
  //数量太大非常卡
  if (dataList.length > 400) {
    dataList = []
    return
  }
  const expanded = dataList
      .map(item => {
        if (item.title.indexOf(value) > -1) {
          return getParentKey(item.key, treeData.value);
        }
        return null;
      }).filter((item, i, self) => item && self.indexOf(item) === i);
  treeExpandKeys.value = expanded;
  searchValue.value = value;
  autoExpandParent.value = true;
});

</script>

<style scoped>
.archive-cls {
  height: 95vh;
  overflow-y: auto;
}
</style>