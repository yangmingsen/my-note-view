import request from "./request";
import {ConstansFlag} from "../js/ConstansFlag";

const rurl = ConstansFlag.apiUrl

export const RemoteApi = {
    /**
     * 获取目录树(不含文件)
     * @param params
     * @returns {Promise<AxiosResponse<any>>}
     */
    async getNoteTree(params) {
        return await request.get(rurl+"/note-index/tree", params)
    },

    /**
     * 获取Ant组件tree树 数据
     * @param params
     * @returns {Promise<AxiosResponse<any>>}
     */
    async getAntNoteTree(params) {
        return await request.get(rurl+"/note-index/antTree", params)
    },

    /**
     * 面包线接口, id为parentId
     * @param params {id: xxxx}
     * @returns {Promise<AxiosResponse<any>>}
     */
    async findBreadcrumb(params) {
        return await request.get(rurl+"/note-index/findBreadcrumb", params)
    },


    /**
     * @params params {nid: '父目录id'}
     * 获取子目录数据(目录和文件)
     */
    async getNoteList(params) {
        return await request.get(rurl+"/note-index/sub", params);
    },


    async getMenuList(params) {
        return await request.get(rurl+"/note-index/menuList", params);
    },


    async findOne(params) {
        return await request.get(rurl+"/note-index/findOne", params);
    },

    /**
     * 搜索笔记
     * @param params
     * @returns {Promise<AxiosResponse<any>>}
     */
    async findNoteByCondition(params) {
        return await request.post(rurl+"/note-index/findNoteByCondition", params);
    },

    /**
     * 找某个用户的根节点
     * @param params
     * @returns {Promise<AxiosResponse<any>>}
     */
    async findRoot(params) {
        return await request.get(rurl+"/note-index/findRoot", params);
    },

    /**
     * 更新note信息
     * @param params
     * @returns {Promise<AxiosResponse<any>>}
     */
    async update(params) {
        return await request.post(rurl+"/note-index/update", params);
    },

    /**
     * 删除note或目录信息
     * @param params {id: xxxxx}
     * @returns {Promise<AxiosResponse<any>>}
     */
    async delNote(params) {
        return await request.post(rurl+"/note-index/delNote", params);
    },

    /**
     * 物理删除
     * @param params {id: xxxx}
     * @returns {Promise<AxiosResponse<any>>}
     */
    async destroyNote(params) {
        return await request.get(rurl+"/note-index/destroyNote", params);
    },

    /**
     * 获取最近10个修改的文件
     * @param params
     * @returns {Promise<AxiosResponse<any>>}
     */
    async getRecentFiles(params) {
        return await request.get(rurl+"/note-index/getRecentFiles", params);
    },

    /**
     * 获取删除的列表，按删除时间排序
     * @param params
     * @returns {Promise<AxiosResponse<any>>}
     */
    async getDeletedFiles(params) {
        return await request.get(rurl+"/note-index/getDeletedFiles", params);
    },

    async allDestroy(params) {
        return await request.get(rurl+"/note-index/allDestroy", params);
    },

    async allRecover(params) {
        return await request.get(rurl+"/note-index/allRecover", params);
    },



    /**
     * 删除目录下的所有数据
     * @param params
     * @returns {Promise<void>}
     */
    async delDir(params) {
        return await request.get(rurl+"/note-index/delDir", params);
    },


    async addNote(params) {
        return await request.post(rurl+"/note-index/add", params);
    },


    /**
     * 上传文件接口
     * 文件可以是图片，文本等...
     *
     * @param params
     * @returns {Promise<AxiosResponse<any>>}
     */
    async fileUpload(params) {
        return await request.post(rurl+"/file/uploadV2", params);
    },

    /**
     * 上传文本，将剪贴板的文本内容上传
     * @param params {parentId: 'xxxx', text: 'xxxx'}
     * @returns {Promise<AxiosResponse<any>>}
     */
    async uploadText(params) {
        return await request.post(rurl+"/file/uploadText", params);
    },

    /**
     * 上传note文件
     * 如果是md文件会被解析后保存到mysql, 其他暂时放入mongo中
     * @param params {file: 'file', parentId: 'xxxx'}
     * @returns {Promise<AxiosResponse<any>>}
     */
    async uploadNote(params) {
        return await request.post(rurl+"/file/uploadNote", params);
    },

    /**
     * url转pdf
     * @param params {url: xxx, parentId: xxx}
     * @returns {Promise<AxiosResponse<any>>}
     */
    async url2pdf(params) {
        return await request.get(rurl+"/file/url2pdf", params);
    },


    /**
     * 添加或更新笔记内容
     * @param params
     * @returns {Promise<AxiosResponse<any>>}
     */
    async noteContentAddAndUpdate(params) {
        return await request.post(rurl+"/note-data/addAndUpdate", params);
    },

    noteContentAddAndUpdateSync(params) {
        return request.post(rurl+"/note-data/addAndUpdate", params);
    },

    /**
     * 获取笔记内容
     * @param params
     * @returns {Promise<AxiosResponse<any>>}
     */
    async noteContentGet(params) {
        return await request.get(rurl+"/note-data/get", params);
    },


    /**
     * 获取笔记信息和存储信息(有存储在mongo的url等..)
     * @param params {id: xxxxx}
     * @returns {Promise<AxiosResponse<any>>}
     */
    async getNoteAndSite(params) {
        return await request.get(rurl+"/note-index/getNoteAndSite", params);
    },


    /**
     * 查看当前笔记内容是否可预览
     * @param params {id: xxxx}
     * @returns {Promise<AxiosResponse<any>>}
     */
    async noteContentCanPreview(params) {
        return await request.get(rurl+"/note-data/checkFileCanPreview", params);
    },


    /**
     * 登录通过账号密码
     * @param params {username: xx , password: xx}
     * @returns {Promise<AxiosResponse<any>>}
     */
    async noteLogin(params) {
        return await request.post(rurl+"/user/login", params);
    },

}
