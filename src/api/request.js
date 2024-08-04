import axios from "axios";
import Qs from 'qs'

/**
 * 获取请求主体
 * @param {Object} questData 请求数据
 * @param {String|Null} requestType json
 */
function getReqBody(questData, requestType) {
    let hasfile = false;
    for (let key in questData) {
        if (questData[key] == null) questData[key] = "";
        else if (!hasfile && questData[key].toString() == "[object File]") {
            hasfile = true;
        }
    }
    let formData;
    if (hasfile) {
        // 有文件类型的参数时
        formData = new FormData();
        for (let key in questData) {
            formData.append(key, questData[key]);
        }
    } else {
        if (requestType === "form") {
            // 使用form格式提交body
            let qs = Qs;
            formData = qs.stringify(questData, {arrayFormat: "repeat"});
        } else {
            // 使用json格式提交
            formData = questData;
        }
    }
    let ContentType = "";
    if (hasfile) {
        ContentType = "multipart/form-data";
    } else if (requestType === "form") {
        ContentType = "application/x-www-form-urlencoded";
    } else {
        ContentType = "application/json";
    }
    return {
        "Content-Type": ContentType,
        body: formData
    };
}


//请求默认地址
axios.defaults.baseURL = "http://api.note.yms.top/";
//设置cross跨域 并设置访问权限 允许跨域携带cookie信息
axios.defaults.withCredentials = true;

//请求前拦截
axios.interceptors.request.use(config => {
        const checkSession = () => {
            let headers = config.headers
            let sessionId = localStorage.getItem("SessionId")
            if (sessionId !== undefined || sessionId !== "") {
                headers.SessionId = sessionId;
            }
        }
        checkSession();

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
        let status = error.response.status;
        if (status === 401) {
            console.log("登录异常.....")
            localStorage.clear();
        }

        return Promise.reject(error);
    });




export default {
    /**
     * 基础请求
     * @param {String} type get/post/put/delete
     * @param {Object} options 基于axios的config
     */
    default(type, options) {
        const config = {
            method: type,
            timeout: 0,
            withCredentials: true,
            crossDomain: true,
            showLoading: true,
            ...options,
            headers: {
                lang: "ZH",
                ...options.headers,
            }
        };
        return  axios.request(config);
    },
    /**
     * GET请求
     * @param {String} url 请求地址（eg: /api）
     * @param {Object} params 请求参数
     * @param {Object} options config
     */
    get(url, params, options = {}) {

        let config = {
            url,
            params,
            responseType: options.isBlob ? "blob" : "json",
            ...options
        };
        return this.default("get", config);
    },
    /**
     * POST请求
     * @param {String} url 请求地址（eg: /api）
     * @param {Object} data 请求主体
     * @param {Object} options config
     */
    post(url, data, options = {}) {
        const requestBody = getReqBody(data, options.requestType);
        let config = {
            url,
            data: requestBody.body,
            responseType: options.isBlob ? "blob" : "json",
            ...options,
            headers: {
                "Content-Type": requestBody["Content-Type"],
                ...(options.headers || {})
            }
        };
        return this.default("post", config);
    },
    /**
     * PUT请求
     * @param {String} url 请求地址（eg: /api）
     * @param {Object} data 请求主体
     * @param {Object} options config
     */
    put(url, data, options = {}) {
        const requestBody = getReqBody(data, options.requestType);
        let config = {
            url,
            data: requestBody.body,
            ...options,
            headers: {
                "Content-Type": requestBody["Content-Type"],
                ...(options.headers || {})
            }
        };
        return this.default("put", config);
    },
    /**
     * DELETE请求
     * @param {String} url 请求地址（eg: /api）
     * @param {Object} params 请求参数
     * @param {Object} options config
     */
    delete(url, params, options = {}) {
        let config = {
            url,
            params,
            ...options
        };
        return this.default("delete", config);
    }
};

