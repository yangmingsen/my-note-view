<script setup>
import axios from "axios";
import { useRoute, useRouter } from 'vue-router'
import {message} from 'ant-design-vue';
import {onMounted} from 'vue'

const router = useRouter()

axios.interceptors.request.use(config => {
      const checkSession = () => {
        let headers = config.headers
        let tokenStr = localStorage.getItem("token")
        if (tokenStr !== null) {
          headers.token = tokenStr
          headers.Authorization = tokenStr
        } else {
          router.push('/login')
        }
      }
      checkSession()

      return config;
    }, error => {
      console.log(error);
      return Promise.reject();
    }
);

//响应后拦截
axios.interceptors.response.use(res => {
      // 2xx 范围内的状态码都会触发该函数。
      // 对响应数据做点什么
      return res;
    },
    error => {
      // 超出 2xx 范围的状态码都会触发该函数。
      // 对响应错误做点什么
      console.error(error)
      let status = error.response.status;
      if (status === 401) {
        message.error("登录异常.....")
        localStorage.clear();

        router.push('/login')
      }

      return Promise.reject(error);
    });


onMounted(() => {
  const tokenKey = localStorage.getItem("token")
  if (tokenKey === null) {
    router.push('/login')
  }
})


</script>


<template>
  <RouterView />
</template>

<style scoped>

</style>
