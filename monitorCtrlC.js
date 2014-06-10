/*jslint node: true, vars: true */

"use strict";

var log = require("gulp/node_modules/gulp-util").log;
var chalk = require("gulp/node_modules/chalk");

function defaultCtrlCHandler() {
    log("'" + chalk.cyan('^C') + "'" + ', exiting');
    process.exit();
}

module.exports = function monitorCtrlC(cb) {
    var stdin = process.stdin;
    if (stdin && stdin.isTTY) {
        if (typeof cb !== 'function') { cb = defaultCtrlCHandler; }
        stdin.setRawMode(true);
        stdin.on('data', function monitorCtrlCOnData(data) {
            if (data.length === 1 && data[0] === 0x03) { // Ctrl+C
                cb();
            }
        });
    }
};
