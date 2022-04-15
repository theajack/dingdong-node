/*
 * @Author: tackchen
 * @Date: 2022-04-12 21:33:50
 * @LastEditors: tackchen
 * @LastEditTime: 2022-04-15 22:58:52
 * @FilePath: /dingdong-node/utils/logger.js
 * @Description: Coding something
 */

const fs = require('fs');
const path = require('path');
const {useLogger} = require('../config');

const logPath = path.resolve(__dirname, '../_log/log.log');

if (!fs.existsSync(logPath)) {
    fs.writeFileSync(logPath, '', 'utf-8');
}

const main = {
    logger (str) {
        if (useLogger) {
            fs.appendFileSync(logPath, str + '\n\n');
        }
    }
};

module.exports = main;