/*
 * @Author: tackchen
 * @Date: 2022-04-11 07:17:45
 * @LastEditors: tackchen
 * @LastEditTime: 2022-04-14 11:07:39
 * @FilePath: /dingdong-node/main.js
 * @Description: Coding something
 */

// const {logger} = require('./utils/logger');
const {requestBase, RequestKeys} = require('./utils/request');
const {createUUID, stringObject, pick, getDateStr} = require('./utils/util');
const UserConfig = require('./config');
const log = require('single-line-log').stdout;
const {sendEmail, orderEmialInfo} = require('./utils/send-mail');

async function startTrafficMode () {
    const addressId = await getDefaultAddressId(); // 固定地址

    let cartMap = null,
        multiReserveTimeMap = null,
        checkOrderMap = null;

    let index = 0;
    const interval = setInterval(() => {
        // [全选 - 获取购物车信息] - 获取配送信息(cart) - 确认订单(cart, times) - 提交订单(cart, times, check)
        requestBase({
            name: RequestKeys.SelectAll,
            loop: false,
        }).then(async (success) => {
            
            log(`全选物品${success ? '成功' : '失败'}(${index++})`);
            if (success) {
                cartMap = await requestBase({
                    name: RequestKeys.GetCart,
                    loop: false,
                });
                log(`获取购物车${cartMap ? '成功' : '失败'}. (${index++})`);
            } else {
                cartMap = null;
            }
        });

        if (cartMap) {
            requestBase({
                name: RequestKeys.GetTimes,
                data: {
                    address_id: addressId,
                    products: stringObject([cartMap.products])
                },
                loop: false,
            }).then((data) => {
                multiReserveTimeMap = data;
                log(`获取配送时间${data ? '成功' : '失败'}. (${index++})`);
            });
        }
        if (cartMap && multiReserveTimeMap) {
            requestBase({
                name: RequestKeys.CheckOrder,
                data: {
                    address_id: addressId,
                    packages: stringObject([
                        Object.assign({}, cartMap, {reserved_time: multiReserveTimeMap})
                    ])
                },
                loop: false,
            }).then(data => {
                checkOrderMap = data;
                log(`确认订单${data ? '成功' : '失败'}. (${index++})`);
            });
        }
        if (cartMap && multiReserveTimeMap && checkOrderMap) {
            requestBase(buildAddOrderArgs({
                addressId,
                cartMap,
                multiReserveTimeMap,
                checkOrderMap,
                loop: false,
            })).then(data => {
                if (data) {
                    clearInterval(interval);
                    onAddOrderSuccess();
                    log(`下单${data ? '成功' : '失败'}. (${index++})`);
                }
            });
        }
    }, UserConfig.run_interval);
}

async function startNormalMode () {
    const addressId = await getDefaultAddressId(); // 固定地址
    // 全选物品
    await requestBase({
        name: RequestKeys.SelectAll,
    });

    // 获取购物车信息
    const cartMap = await requestBase({
        name: RequestKeys.GetCart,
    });

    // 获取配送信息
    // return {reserved_time_start, reserved_time_end}
    const multiReserveTimeMap = await requestBase({
        name: RequestKeys.GetTimes,
        data: {
            address_id: addressId,
            products: stringObject([cartMap.products])
        },
    });
    
    // 确认订单
    const checkOrderMap = await requestBase({
        name: RequestKeys.CheckOrder,
        data: {
            address_id: addressId,
            packages: stringObject([
                Object.assign({}, cartMap, {reserved_time: multiReserveTimeMap})
            ])
        },
    });

    await requestBase(buildAddOrderArgs({
        addressId,
        cartMap,
        multiReserveTimeMap,
        checkOrderMap,
    }));

    onAddOrderSuccess();
}

function buildAddOrderArgs ({
    addressId, // string,
    cartMap, // json
    multiReserveTimeMap, // json,
    checkOrderMap, // json
    loop = true,
}) {
    const paymentOrderMap = {
        ...multiReserveTimeMap,
        ...pick(checkOrderMap, ['freight_discount_money', 'freight_money', 'user_ticket_id']),
        price: checkOrderMap.total_money,
        order_freight: checkOrderMap.freight_real_money,
        parent_order_sign: cartMap.parent_order_sign,
        product_type: 1,
        address_id: addressId,
        form_id: createUUID().replace(/-/g, ''),
        receipt_without_sku: null,
        pay_type: 6,
        vip_money: '',
        vip_buy_user_ticket_id: '',
        coupons_money: '',
        coupons_id: '',
    };
    const packagesMap = {
        ...pick(cartMap, ['products', 'total_money', 'goods_real_money', 'total_count', 'cart_count', 'is_presale', 'instant_rebate_money', 'coupon_rebate_money', 'total_rebate_money', 'used_balance_money', 'can_used_balance_money', 'used_point_num', 'used_point_money', 'can_used_point_num', 'can_used_point_money', 'is_share_station', 'only_today_products', 'only_tomorrow_products', 'package_type', 'package_id', 'front_package_text', 'front_package_type', 'front_package_stock_color', 'front_package_bg_color']),
        total_origin_money: cartMap.total_money,
        eta_trace_id: '',
        ...multiReserveTimeMap,
        soon_arrival: '',
        first_selected_big_time: 1,
    };
    const packageOrderMap = {
        payment_order: paymentOrderMap,
        packages: [packagesMap],
    };
    return {
        name: RequestKeys.AddOrder,
        data: {
            package_order: stringObject(packageOrderMap),
        },
        loop,
    };
}

function getDefaultAddressId () {
    return requestBase({
        name: RequestKeys.GetAddress,
    });
}

function main () {
    if (typeof Object.values(UserConfig).find(v => v === '') !== 'undefined') {
        console.log('请先到config.js中完成所有配置');
        return;
    }
    const mode = UserConfig.run_mode; // traffic
    if (mode === 'normal') {
        startNormalMode();
    } else if (mode === 'traffic') {
        startTrafficMode();
    }
}

function onAddOrderSuccess () {
    if (UserConfig.emailCode) {
        sendEmail({
            title: `下单成功通知（${getDateStr()}）`,
            message: Object.values(orderEmialInfo).join(';\n')
        });
    }
}

main();