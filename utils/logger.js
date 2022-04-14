/*
 * @Author: tackchen
 * @Date: 2022-04-12 21:33:50
 * @LastEditors: tackchen
 * @LastEditTime: 2022-04-14 07:29:42
 * @FilePath: /dingdong-node/utils/logger.js
 * @Description: Coding something
 */

const fs = require('fs');
const path = require('path');

const logPath = path.resolve('', '../_log/log.log');

const useLog = false;

if (!fs.existsSync(logPath)) {
    fs.writeFileSync(logPath, '', 'utf-8');
}

const main = {
    logger (str) {
        if (useLog) {
            fs.appendFileSync(logPath, str + '\n\n');
        }
    }
};

module.exports = main;