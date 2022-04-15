/*
 * @Author: tackchen
 * @Date: 2022-04-13 23:12:34
 * @LastEditors: tackchen
 * @LastEditTime: 2022-04-15 08:53:43
 * @FilePath: /dingdong-node/utils/request.js
 * @Description: Coding something
 */
const request = require('request');
// const fs = require('fs');
const {logger} = require('./logger');
const log = require('single-line-log').stdout;
const {commonConfig} = require('./common-config');

const {buildGetParam, buildPostData, getDateStr} = require('./util');
const {runInterval, useLogger} = require('../config');
const {orderEmialInfo} = require('./send-mail');

const RequestKeys = {
    GetAddress: 'address',
    GetCart: 'cart',
    GetTimes: 'times',
    CheckOrder: 'checkorder',
    SelectAll: 'all',
    AddOrder: 'add',
};

const AB_CONFIG = '%7B%22key_onion%22%3A%22D%22%2C%22key_cart_discount_price%22%3A%22C%22%7D';

const RequestMap = {
    [RequestKeys.GetAddress]: {
        method: 'GET',
        url: 'https://sunquan.api.ddxq.mobi/api/v1/user/address/',
        resolveData (data) {
            const address = data.valid_address;
            if (!address || address.length === 0) {
                console.log('没有默认地址，请先添加地址');
                return '';
            }
            const defaultAddress = address.find(item => item.is_default);
            if (!defaultAddress) {
                console.log('没有默认地址，请先添加地址');
                return '';
            }
            console.log('获取默认地址成功：' + defaultAddress.location.address);
            orderEmialInfo.address = `收货地址：${defaultAddress.location.address}; \n收货人: ${defaultAddress.user_name}; \n收货电话: ${defaultAddress.mobile}`;
            return defaultAddress.id;
        }
    },
    [RequestKeys.GetCart]: {
        method: 'GET',
        url: 'https://maicai.api.ddxq.mobi/cart/index',
        data: {
            'is_load': '1',
            'ab_config': AB_CONFIG
        },
        resolveData (data, useLog) {
            if (data.new_order_product_list.length > 0) {
                const result = data.new_order_product_list[0];
                result.parent_order_sign = data.parent_order_info.parent_order_sign;
                result.products.forEach(item => {
                    item.total_money = item.total_price;
                    item.total_origin_money = item.total_origin_price;
                });
                if (useLog) console.log(`获取购物车信息成功: 总价 = ${result.total_money}`);
                orderEmialInfo.price = (`订单总价： ${result.total_money}；`);
                return result;
            }
            return null;
        }
    },
    [RequestKeys.GetTimes]: {
        method: 'POST',
        url: 'https://maicai.api.ddxq.mobi/order/getMultiReserveTime',
        data: {
            'group_config_id': '',
            'isBridge': 'false'
        },
        resolveData (data, useLog) {
            const map = {};
            const times = data[0].time[0].times; // 今天的时间段
            for (let i = 0; i < times.length; i++) {
                if (times[i].disableType === 0) {
                    map.reserved_time_start = times[i].start_timestamp;
                    map.reserved_time_end = times[i].end_timestamp;
                    if (useLog) console.log('获取配送时间成功');
                    orderEmialInfo.times = (`配送时间：${getDateStr(map.reserved_time_start)} 至 ${getDateStr(map.reserved_time_end)}；`);
                    return map;
                }
            }
            return null;
        }
    },
    [RequestKeys.CheckOrder]: {
        method: 'POST',
        url: 'https://maicai.api.ddxq.mobi/order/checkOrder/',
        data: {
            'user_ticket_id': 'default',
            'freight_ticket_id': 'default',
            'is_use_point': '0',
            'is_use_balance': '0',
            'is_buy_vip': '0',
            'coupons_id': '',
            'is_buy_coupons': '0',
            'check_order_type': '0',
            'is_support_merge_payment': '1',
            'showData': 'true',
            'showMsg': 'false'
        },
        resolveData (data, useLog) {
            if (useLog) console.log('确认订单成功');
            return data.order;
        }
    },
    [RequestKeys.SelectAll]: {
        method: 'GET',
        url: 'https://maicai.api.ddxq.mobi/cart/allCheck',
        data: {
            'is_check': '1',
            'is_load': '1',
            'ab_config': AB_CONFIG
        },
        resolveData (data, useLog) {
            if (data.product.effective.length > 0) {
                const products = data.product.effective[0].products;
                if (useLog) console.log(`成功选择了${products.length}件商品: ${products.map(item => item.product_name).join(',')}`);
                orderEmialInfo.products = `商品列表:\n ${products.map(item => item.product_name).join(',\n')}`;
                return true;
            }
            return false;
        }
    },
    [RequestKeys.AddOrder]: {
        method: 'POST',
        url: 'https://maicai.api.ddxq.mobi/order/addNewOrder',
        data: {
            'showMsg': 'false',
            'showData': 'true',
            'ab_config': AB_CONFIG
        },
        resolveData (data, useLog) {
            if (useLog) console.log('下单成功！');
            return data;
        }
    },
};

function buildRequestStaff (headers, data, name) {
    return {
        headers: Object.assign(headers, commonConfig.hearder, RequestMap[name].header || {}),
        data: Object.assign(data, commonConfig.data, RequestMap[name].data || {}),
    };
}

function sendGetRequest ({
    name,
    data = {},
    headers = {},
}) {
    return new Promise(resolve => {
        const staff = buildRequestStaff(headers, data, name);
        request({
            url: RequestMap[name].url + buildGetParam(staff.data),
            method: 'GET',
            headers: staff.headers,
        }, function (error, response) {
            handleRequestResult(name, error, response, resolve);
        });
    });
}

function sendPostRequest ({
    name,
    data = {},
    headers = {},
}) {
    return new Promise(resolve => {
        const staff = buildRequestStaff(headers, data, name);
        // logger(`${name}: \n ${RequestMap[name].url} \n POST \n ${JSON.stringify(data)} \n ${JSON.stringify(headers)}`);
        request({
            url: RequestMap[name].url,
            method: 'POST',
            headers: staff.headers,
            body: buildPostData(staff.data),
        }, function (error, response) {
            // logger(`${name}: \n ${JSON.stringify(response.body)}`);
            handleRequestResult(name, error, response, resolve);
        });
    });
}

function handleRequestResult (name, error, response, resolve) {
    const body = JSON.parse(response.body);
    if (useLogger) {
        logger(`${name}: \n ${response.statusCode}; ${body.msg || body.message}`);
        if (name === 'checkorder' || name === 'add') {
            if (body.code === 0) {
                logger(`${name}: \n ${body.message}`);
            } else {
                if (body.tips) {
                    logger(`${name}: \n ${body.tips.limitMsg}`);
                } else {
                    logger(`${name}: \n ${body.message}`);
                }
            }
            logger(`${name}: \n ${JSON.stringify(body)}`);
        }
    }
    if (error || response.statusCode !== 200) {
        // console.log(error, response.statusCode); // 请求成功的处理逻辑
        // fs.writeFileSync('./_log/error/response-' + name + '-error.json', JSON.stringify(response, null, 4), 'utf-8');
        resolve(null);
    } else {
        // console.log(name + ' success');
        // fs.writeFileSync('./_log/response-' + name + '.json', JSON.stringify(JSON.parse(response.body), null, 4), 'utf-8');
        resolve(body);
    }
}

function requestBase ({
    name,
    data,
    headers,
    loop = true,
}) {
    const resolveData = RequestMap[name].resolveData;
    const requestMethod = RequestMap[name].method === 'GET' ? sendGetRequest : sendPostRequest;
    let index = 0;

    const base = async (resolve) => {
        const result = await requestMethod({
            name,
            data,
            headers,
        });
        if (result && result.success) {
            if (resolveData) {
                const resolveResult = resolveData(result.data, loop);
                if (resolveResult) {
                    return resolve(resolveResult);
                }
            } else {
                resolve(result.data);
                return;
            }
        }

        if (loop) {
            setTimeout(() => {
                index ++;
                log(`重新请求：${name} 第${index}次`);
                base(resolve);
            }, runInterval);
        } else {
            resolve(null);
        }
    };
    return new Promise((resolve) => {
        base(resolve);
    });
}

module.exports = {
    RequestKeys,
    RequestMap,
    sendGetRequest,
    sendPostRequest,
    requestBase,
};
