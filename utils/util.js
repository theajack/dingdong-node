function buildGetParam (param) {
    let search = '';
    for (const k in param) {
        search += `&${k}=${param[k]}`;
    }
    return search.replace('&', '?');
}

function buildPostData (param) {
    return buildGetParam(param).substring(1);
}

// js 创建uuid
function createUUID () {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = (d + Math.random() * 16) % 16 | 0;
        d = Math.floor(d / 16);
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    return uuid;
}
 
function debugLog (data) {
    console.log('debugLog', data);
}

function stringObject (obj) {
    return encodeURIComponent(JSON.stringify(obj));
}

function pick (json, attr) {
    const map = {};
    attr.forEach(key => {
        map[key] = json[key];
    });
    return map;
}

// 获取当前时间
function getDateStr (timestamp) {
    const date = timestamp ? new Date(timestamp * 1000) : new Date();
    return `${date.getFullYear()}-${fixNum(date.getMonth() + 1)}-${fixNum(date.getDate())} ${fixNum(date.getHours())}:${fixNum(date.getMinutes())}:${fixNum(date.getSeconds())}`;
}

function fixNum (num) {
    return num < 10 ? '0' + num : num;
}

function parseJSON (value) {
    try {
        return JSON.parse(value);
    } catch (e) {
        return null;
    }
}

module.exports = {
    buildGetParam,
    buildPostData,
    createUUID,
    debugLog,
    stringObject,
    pick,
    getDateStr,
    parseJSON,
};