# [叮咚买菜自动下单 Nodejs 脚本](https://www.github.com/theajack/dingdong-node)

## 0. 前言

**本项目仅供技术学习和交流，纯属学习使用，不可用作商业行为，任何违法违规造成的问题与本人无关**

2022年初，由于上海疫情告急，出现了全民线上抢菜盛况

叮咚买菜每6:00，8:30开放让人们睡不好还基本抢不到

于是研究了一下叮咚买菜小程序，搞了这么一个脚本可以自动下单脚本

**快速开始**

```
git clone git@github.com:theajack/dingdong-node.git
cd dingdong-node
npm i

# 按照 2.填入用户配置 自行配置用户信息

npm start
```

## 1. 特性

1. 自定义配置（用户相关信息需要自行抓包获取填入）
2. 下单成功发送提醒邮件，可以像闹钟一样的提醒（需要配置两个邮箱）- 非必需
3. 支持配置高峰和非高峰策略
4. 定时运行（借助crontab）- 非必需

## 2. 填入用户配置

### 注意事项

1. 本脚本针对的是叮咚买菜小程序，填入用户信息之后请不要再使用其他端，否则信息可能会失效
2. 使用 charles 抓包, [教程](https://blog.csdn.net/AI_Green/article/details/120168352)

抓包环境安装配置好之后，在叮咚买菜小程序上刷新购物车，找到一条 /cart/index的请求，找 query-string，基本需要的参数都在里面了

```js
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
};
```

## 3. 邮件通知 非必需

邮件通知需要准备两个邮箱，这里以两个QQ邮箱为例

另外还需要使用iphone自带的邮件APP

### 发送邮箱

发送邮箱需要到 设置 => 账户  => 开启 POP3/SMTP服务；

然后将授权码和邮箱配置到 emailCode 和 fromEmail

### 接收邮箱

接受邮箱需要到 设置 => 账户  => 开启 IMAP/SMTP服务，复制下授权码

然后邮件APP绑定QQ邮箱，需要填入授权码

然后将邮箱配置到 toEmail

[iphone绑定QQ邮箱教程](https://zhidao.baidu.com/question/1950479000046686868.html?qbl=relate_question_2&word=iphone%D3%CA%BC%FE%D4%F5%C3%B4%CC%ED%BC%D3qq%D3%CA%CF%E4);

另外，如要开启强通知（类似电话铃声），需要在iphone设置里面邮件提示声音

**这个功能搭配服务器定时任务，可以有很多种玩法，比如固定时间给你发送通知，收到评论、回复通知到手机，比一般的APP通知提醒更好，可以像闹钟一样的开启**

## 4. 配置抢菜策略

见config.js

```js
{
    'run_mode': 'normal', // normal 为非高峰期策略，traffic 为高峰期策略
    'run_interval': 1000, // 每一个请求的轮询间隔 可以自行修改
}
```

## 5. 定时运行 非必需

以下方案适用于mac和linux，windows系统请自行找方案

命令行运行

```
crontab -e
```

在vim窗口输入

```
{min} {hour} * * * {nodePath} {path}/dingdong-node/main.js
```

min和hour表示时间，比如每天5:50开始运行，就是：50 5

nodePath 为你本地node程序的绝对目录

path为当前项目的绝对目录

[定时运行教程](https://www.runoob.com/w3cnote/linux-crontab-tasks.html)