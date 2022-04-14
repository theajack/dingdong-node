/*
 * @Author: tackchen
 * @Date: 2022-04-14 07:30:06
 * @LastEditors: tackchen
 * @LastEditTime: 2022-04-14 08:49:20
 * @FilePath: /dingdong-node/utils/common-config.js
 * @Description: Coding something
 */

const userConfig = require('../config');
const {pick} = require('./util');

const commonConfig = {
    data: {
        'api_version': '9.49.2',
        'app_version': '2.82.0',
        'app_client_id': '4',
        'channel': 'applet',
        'applet_source': '',
        'sharer_uid': '',
        'h5_source': '',
        ...pick(userConfig, ['uid', 'longitude', 'latitude', 'station_id', 'city_number', 's_id', 'openid', 'device_token'])
    },
    hearder: {
        'ddmc-api-version': '9.49.2',
        'ddmc-build-version': '2.82.0',
        'ddmc-app-client-id': '4',
        'ddmc-channel': 'applet',
        'ddmc-os-version': '[object Undefined]',
        'ddmc-ip': '',
        'accept-encoding': 'utf-8',
        'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.16(0x18001042) NetType/WIFI Language/zh_CN',
        'content-type': 'application/x-www-form-urlencoded',
        'referer': 'https://servicewechat.com/wx1e113254eda17715/422/page-frame.html',
        'ddmc-city-number': userConfig.city_number,
        'ddmc-device-id': userConfig.openid,
        'ddmc-station-id': userConfig.station_id,
        'cookie': `DDXQSESSID=${userConfig.s_id}`,
        'ddmc-longitude': userConfig.longitude,
        'ddmc-latitude': userConfig.latitude,
        'ddmc-uid': userConfig.uid,
    }
};


module.exports = {
    commonConfig
};