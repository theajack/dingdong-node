const fs = require('fs');
const path = require('path');
// 请填写下面的userConfig
const userConfig = {
    // 叮咚买菜小程序用户信息
    'uid': '',
    'longitude': '',
    'latitude': '',
    'station_id': '',
    'city_number': '',
    's_id': '',
    'openid': '',
    'device_token': '',
    'api_version': '9.49.2', // 如果与抓包到的不一致，换成最新的
    'app_version': '2.82.4', // 如果与抓包到的不一致，换成最新的

    // 以下为邮箱配置 非必需 如果要启动定时发送邮件提醒可以选一下 详情见readme.md
    'fromEmail': '', // 发送邮件的邮箱
    'toEmail': '', // 接受邮件的邮箱
    'emailCode': '', // 邮箱授权码， QQ邮箱在 设置 -> 账户 -> POP3/SMTP服务 中开启
    'emailHost': 'smtp.qq.com', // 邮箱服务器地址 如非qq邮箱 请自行更改

    // 抢菜策略，
    'runMode': 'traffic', // normal 为非高峰期策略，traffic 为高峰期策略
    'runInterval': 1000, // 每一个请求的轮询间隔
    'maxTime': 5, // 单次运行最长时间 防止被风控 单位为分钟

    'useLogger': true, // 是否开启logger 调试使用
};

if (fs.existsSync(path.resolve(__dirname, './_dev_scripts/my-config.js'))) {
    // 请忽略这部分，填写上面的config
    module.exports = require('./_dev_scripts/my-config');
} else {
    module.exports = userConfig;
}