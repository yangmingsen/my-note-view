import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'

//---状态管理Pinia
import { createPinia } from 'pinia'

//----蚂蚁UI组件
import 'ant-design-vue/dist/reset.css';
import Antd from 'ant-design-vue';

//---菜单UI组件
import Menus from 'vue3-menus';

//-----Vue-markdown-editor 组件
import VueMarkdownEditor from '@kangc/v-md-editor';
import '@kangc/v-md-editor/lib/style/base-editor.css';
import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js';
import '@kangc/v-md-editor/lib/theme/style/vuepress.css';
import Prism from 'prismjs';
VueMarkdownEditor.use(vuepressTheme, {
    Prism,
});


const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(Antd)
app.use(Menus)
app.use(VueMarkdownEditor);
app.mount('#app')
