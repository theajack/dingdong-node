// const myConfig = require('./_dev_scripts/my-config');
// module.exports = myConfig;

module.exports = {
    // 叮咚买菜小程序用户信息
    'uid': '',
    'longitude': '',
    'latitude': '',
    'station_id': '',
    'city_number': '',
    's_id': '',
    'openid': '',
    'device_token': '',

    // 以下为邮箱配置 非必需 如果要启动定时发送邮件提醒可以选一下 详情见readme.md
    'fromEmail': '', // 发送邮件的邮箱
    'toEmail': '', // 接受邮件的邮箱
    'emailCode': '', // 邮箱授权码， QQ邮箱在 设置 -> 账户 -> POP3/SMTP服务 中开启
    'emailHost': 'smtp.qq.com', // 邮箱服务器地址 如非qq邮箱 请自行更改

    // 抢菜策略，
    'run_mode': 'normal', // normal 为非高峰期策略，traffic 为高峰期策略
    'run_interval': 1000, // 每一个请求的轮询间隔

    'useLogger': false, // 是否开启logger 调试使用
};