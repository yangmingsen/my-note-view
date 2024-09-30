<template>
  <div class="main">
    <div class="form">
      <h1 class="text-center">Wecome Noter</h1>
      <form action="#" method="post">
        <div class="wthree-field">
          <input name="text1" id="text1" type="text" v-model="username" placeholder="Username" required>
        </div>
        <div class="wthree-field">
          <input name="password" id="myInput" type="Password"  placeholder="Password"
                 v-model="password"
                 @keyup.enter="doLogin" >
        </div>
        <div class="wthree-field">
          <button type="button" class="btn" @click="doLogin">登 入</button>
        </div>
        <div class="login-bottom">
          <a href="#url" class="">Create An Account</a>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import {RemoteApi as noteApi} from './api/RemoteApi'
import { useRoute, useRouter } from 'vue-router'
import {ref, onMounted} from 'vue'
import {message} from 'ant-design-vue';
import {ConstansFlag as constansFlag} from "./js/ConstansFlag";


const router = useRouter()

const username = ref('')
const password = ref('')

const doLogin = () => {
  const loginData = {
    username: username.value,
    password: password.value
  }
  noteApi.noteLogin(loginData).then(res => {
    const resData = res.data;
    if (resData.respCode === 0) {
      message.success("登录成功...")

      localStorage.setItem(constansFlag.token, resData.datas.token)
      localStorage.setItem(constansFlag.username, resData.datas.username)
      // localStorage.setItem("avtarUrl", resData.datas.avtarUrl)
      localStorage.setItem(constansFlag.userId, resData.datas.userId)

      router.push('/')
    } else {
      message.error(resData.respMsg)
    }
  }).catch(err => {
    message.error("login错误")
    console.error(err)
  })
}

const initLoad = () => {
  const cacheUsername = localStorage.getItem(constansFlag.username)
  if (cacheUsername !== undefined) {
    username.value = cacheUsername
  }
}

onMounted(() => {
  initLoad()
})

</script>

<style scoped>
@import "assets/login.css";


</style>
