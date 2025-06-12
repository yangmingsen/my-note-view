export const ConstansFlag = {
    // 最近文件：0， 最近删除：1，我的目录树：2
    itemList : {rencentFiles: 0, delFiles: 1, treeFiles: 2, recentVisit: 4},
    apiUrl: 'http://api.note.yms.top/note',
    fileType: {jpg: 'jpg', wer: 'wer', docx: 'docx', markdown: 'md', png: 'png',
        unknow: 'unknow', jpeg: 'jpeg', pdf: 'pdf', xlsx: 'xlsx', mindmap: 'mindmap', archive: 'zip'},
    username: 'username',
    userId: "userId",
    token: 'token',
    tmpToken: 'tmpToken',
    archiveList: ['zip','jar','war','7z','tar','gz','tar.gz','tgz','rar'],
    editorFlag : {
        markdwon: 0, wangEditor: 1,  blank: 2, notSupport: 3, img: 4,
        pdf: 5, doc: 6, excel: 7, tiny: 8, textPreview: 9, mindmap: 10, needPassword: 11, archive: 12
    }
}
