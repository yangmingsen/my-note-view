# my-note-view
###  实现类似有道云笔记的前端页面
1. 目前笔记具备tree目录树,文件列表,文件搜索,文件显示等功能。
2. tree目录树使用蚂蚁组件；笔记显示及编辑主要采用markdwon和wangeditor组件。tinymce暂不使用。
3. 同时支持pdf, office(xlsx,docx),图片文件格式数据显示
4. 支持笔记全文搜索(lucene)
5. 支持任意笔记文件上传

### 效果展示
![登录](./resources/note-login.png)
![主页](./resources/main-show.png)
![wer](./resources/wer-input.png)
![md](./resources/markdown-show.png)
图片
![图片show](./resources/img-show.png)
代码
![codeshow](./resources/code-show.png)
pdf
![pdfshow](./resources/pdf-show.png)


### 服务端程序
地址：[my-note-server](https://github.com/yangmingsen/my-note-server)

## Recommended IDE Setup
- WebStorm
- [VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### 为什么要写个类似笔记软件？
有道云(v6.10)用了好几年,个人觉得还不错. 不过后续新版本的有道云windows版本收回了一些功能,特别是导出功能.
还有我在网页版本写新笔记,旧的v6.10旧显示不了了. 还有特别担心有道云服务器关闭后,多年笔记就没了.


>有道云数据获取工具： 本来想过去所有的笔记都通过有道云导出pdf, 不过最近发现有获取有道云笔记数据的软件工具[youdaonote-pull](https://github.com/DeppWang/youdaonote-pull))
可以全部导出为marKdown挺好用的
