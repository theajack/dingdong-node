const {SMTPClient} = require('emailjs');
const userConfig = require('../config');
const client = new SMTPClient({
    user: userConfig.fromEmail, // 你的QQ用户
    password: userConfig.emailCode, // 这里是上面生成的授权码，不是QQ密码
    host: userConfig.emailHost, // 主机，不改
    ssl: true // 开启ssl
});

const emialData = {
    message: '',
    title: ''
};

const orderEmialInfo = {
    address: '',
    price: '',
    times: '',
    products: '',
};

 
module.exports = {
    orderEmialInfo,
    setMessage (message) {
        emialData.message = message;
    },
    addMessage (message) {
        emialData.message += message;
    },
    setTitle (title) {
        emialData.title = title;
    },
    sendEmail ({
        title = emialData.title || '标题',
        message = emialData.message || '内容'
    }) {
        // 开始发送邮件
        client.send({
            text: message, // 邮件内容
            from: userConfig.fromEmail, // 你的邮箱号
            to: userConfig.toEmail, // 发送给谁的
            subject: title // 邮件主题
    
        }, function (err) {
            if (!err) {
                console.log('发送通知邮件成功!');
            }
        });
    }
};