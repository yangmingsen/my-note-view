<template>
  <a-tabs v-model:activeKey="activeKey" tab-position="left" animated>
    <a-tab-pane key="1" tab="账户信息">
      <div class="user-config-panel">
        <div class="user-info-line">
          <div class="user-info-line1">
            <img src="../assets/avtar.png">
            <span>不是火花呀</span>
          </div>
          <div class="user-info-line2">
              <div class="user-info-intro">
                <p><strong>昵称</strong>  不是火花呀</p>
                <p><strong>账号</strong>  yangmingsen16@163.com</p>
                <p><strong>性别</strong>  保密</p>
                <p><strong>地区</strong>  广东 深圳</p>
                <p><strong>签名</strong>  学习，成长。</p>
              </div>
          </div>
          <div class="user-info-line3">
            <button>修改信息</button>
          </div>
        </div>
      </div>
    </a-tab-pane>
    <a-tab-pane class="user-config-panel" key="2" tab="背景图片">
      <div class="cust-bg-img">
        <div class="cust-bg-img-show">
<!--          <img :src="bgImgSrc" v-if="hasDefaultImg">-->
          <a-image :src="bgImgSrc"   v-if="hasDefaultImg"  />
          <img src="../assets/empty-bg.png" v-if="!hasDefaultImg">
        </div>
        <div class="bg-upload-progress" v-if="progressOpen">
          <a-progress :percent="progressPercent" />
        </div>
        <div class="bg-upload-btn">
            <button @click="bgImgUpload">更换背景</button>
           <!-- 文件上传-->
          <input type="file" id="bg-file-upload" @change="doBgImgUpload($event)" style="display: none; position: absolute;">
        </div>
      </div>
    </a-tab-pane>
    <a-tab-pane class="user-config-panel" key="3" tab="设置">还没想好做什么呢</a-tab-pane>
  </a-tabs>
</template>

<script setup>
import { ref , onMounted} from 'vue';
import {message} from "ant-design-vue";
import {ConstansFlag as constFlag} from "../js/ConstansFlag";
import {RemoteApi as noteApi} from "../api/RemoteApi";
import {userGlobalNotifyStore} from "../store/userGlobalNotifyStore";

const globalNotifyStore = userGlobalNotifyStore()

const activeKey = ref('1');

//是否具有默认bg
const hasDefaultImg = ref(false)

const bgImgSrc = ref('')

const progressOpen = ref(false)
const progressPercent =ref(0)

const bgImgUpload = () => {
  document.querySelector("#bg-file-upload").click();
}
//背景图片上传
const doBgImgUpload = (event) => {
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in byte
  const file = event.target.files[0];
  if (file) {
    if (file.size > MAX_FILE_SIZE) {
      message.warning('File is too large. Maximum size allowed is 10MB.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    const reqUrl = constFlag.apiUrl+'/file/uploadTmpFile'

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
        const response = JSON.parse(xhr.responseText); // 解析 JSON 响应
        const resultInfo = response.datas
        //更新上传的文件
        bgImgSrc.value = resultInfo.url
        hasDefaultImg.value = true

        //同步一次
        syncCustConfig()
      } else {
        message.error("文件上传失败")
      }

      setTimeout(() => {
        progressOpen.value = false
      }, 2 * 1000)
    };

    // 发送文件
    xhr.send(formData);
  }
}

const syncCustConfig = () => {
  const obj = {
    bgImgInfo: {
      bgImg: bgImgSrc.value
    }
  }
  noteApi.updateUserConfig({content: JSON.stringify(obj)}).then(res => {
    const resData = res.data
    if (resData.respCode === 0) {
      notifyOtherCompUpdate()
    } else {
      message.error("同步userConfig失败")
    }
  }).catch(err => {
    message.error("同步userConfig错误")
    console.error(err)
  })
}

//通知其他组件更新用户配置
const notifyOtherCompUpdate = () => {
  globalNotifyStore.$patch((state) => {
    state.updateBgImgCnt++
  })
}

onMounted(() => {
  //初始化配置
  noteApi.findUserConfig().then(res => {
    const resData = res.data
    if (resData.respCode === 0) {
      const userConfigObj = JSON.parse(resData.datas)
      const bgImgInfo = userConfigObj.bgImgInfo
      if (bgImgInfo !== undefined) {
        bgImgSrc.value = bgImgInfo.bgImg
        //更新使用服务器的bg
        hasDefaultImg.value = true
      }
    }
  }).catch(err => {
    message.error("获取用户自定义数据错误")
    console.error(err)
  })
})


</script>

<style scoped>

.user-config-panel {
  height: 400px;
  background-color: #FAFAFA;
}


.user-info-line, .cust-bg-img {
  height: 100%;
  position: relative;
}

.user-info-line1 {
  padding-top: 10px;
  padding-left: 40px;
}

.user-info-line1 img {
  height: 60px;
  width: 60px;
  max-width: 100%;
  border: 3px solid white;
  border-radius: 50%;
}

.user-info-line1 span {
  margin-left: 20px;
  font-size: 1rem;
}

.user-info-line2 {
  margin-top: 15px;
  padding-left: 40px;
  padding-right: 40px;
}

.user-info-intro {
  background-color: white;
  padding: 20px;
}

.user-info-line3, .bg-upload-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
}

/*背景图片style*/

/*背景设置*/
.cust-bg-img-show {
  height: 250px;
}

.cust-bg-img-show img {
  max-width: 100%;
  height: 100%;
}

.bg-upload-progress {
  max-width: 100%;
}

</style>
