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

//-----Vue-markdown-editor  编辑组件
// import VueMarkdownEditor from '@kangc/v-md-editor';
import VMdEditor from '@kangc/v-md-editor';
import '@kangc/v-md-editor/lib/style/base-editor.css';
// import vuepressTheme from '@kangc/v-md-editor/lib/theme/vuepress.js';
// import '@kangc/v-md-editor/lib/theme/style/vuepress.css';
// import Prism from 'prismjs';
// VueMarkdownEditor.use(vuepressTheme, {
//     Prism,
// });

import VMdPreview from '@kangc/v-md-editor/lib/preview';
import '@kangc/v-md-editor/lib/style/preview.css';
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js';
import '@kangc/v-md-editor/lib/theme/style/github.css';


// highlightjs
import hljs from 'highlight.js';

VMdPreview.use(githubTheme, {
    Hljs: hljs,
});
VMdEditor.use(githubTheme, {
    Hljs: hljs,
});

//----v-viewer 图片浏览组件
import 'viewerjs/dist/viewer.css'
import VueViewer from 'v-viewer'
import { createRouter, createWebHistory } from 'vue-router'
import MyNoteView from './MyNoteView.vue'
import MyNoteLogin from './MyNoteLogin.vue'
import ShareNoteView from './components/ShareNoteView.vue'

const routes = [
    { path: '/',  name: 'home', component: MyNoteView },
    { path: '/login', name: 'login', component: MyNoteLogin },
    { path: '/share/:noteId', name: 'share', component: ShareNoteView },
]
const router = createRouter({
    history: createWebHistory(),
    routes,
})

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(VMdPreview);
app.use(VMdEditor)
app.use(pinia)
app.use(Antd)
app.use(Menus)
app.use(VueViewer)
app.mount('#app')
