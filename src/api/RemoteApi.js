import request from "./request";

const rurl = "http://api.note.yms.top/note"

export const RemoteApi = {
    /**
     * 获取目录树(不含文件)
     * @param params
     * @returns {Promise<AxiosResponse<any>>}
     */
    async getNoteTree(params) {
        return await request.get(rurl+"/note-index/tree", params)
    },

    async getAntNoteTree(params) {
        return await request.get(rurl+"/note-index/antTree", params)
    },


    /**
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
     * 添加或更新笔记内容
     * @param params
     * @returns {Promise<AxiosResponse<any>>}
     */
    async noteContentAddAndUpdate(params) {
        return await request.post(rurl+"/note-data/addAndUpdate", params);
    },

    /**
     * 获取笔记内容
     * @param params
     * @returns {Promise<AxiosResponse<any>>}
     */
    async noteContentGet(params) {
        return await request.get(rurl+"/note-data/get", params);
    },



}
