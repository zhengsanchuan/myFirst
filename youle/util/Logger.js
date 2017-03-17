/******************************************************************************
 * Author:      671643387
 * Created:     2016/10/25
 *****************************************************************************/

var fs          = require("fs");
var util        = require("util");
var log4js      = require("log4js");

///////////////////////////////////////////////////////////////////////////////
//>> 日志记录器

function Logger() {
    this.debugLogger        = null; // 调试日志
    this.logLogger          = null; // 普通日志
    this.errorLogger        = null; // 错误日志
}

Logger.prototype = {
    /**
     * 初始化
     * @param initArgs
     */
    init: function(initArgs) {
        var servName = initArgs.servName;       // 服务器名字
        var logDir = initArgs.logDir || "log";  // 日志目录

        // 创建日志目录
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir);
        }

        var consoleAppender = {
            type: "console",
        };
        var debugAppender = {
            category: "debug",
            type: "file",
            filename: util.format("%s/%s-debug.log", logDir, servName),
            maxLogSize: 1024 * 1024 * 256,
            backups: 40,
            layout: {
                type: "pattern",
                pattern: "[%d] %m",
            },
        };
        var logAppender = {
            category: "info",
            type: "file",
            filename: util.format("%s/%s.log", logDir, servName),
            maxLogSize: 1024 * 1024 * 256,
            backups: 40,
            layout: {
                type: "pattern",
                pattern: "[%d] %m",
            },
        };
        var errorAppender = {
            category: "error",
            type: "file",
            filename: util.format("%s/%s-error.log", logDir, servName),
            maxLogSize: 1024 * 1024 * 256,
            backups: 40,
            layout: {
                type: "pattern",
                pattern: "[%d] %m",
            },
        };
        log4js.configure({
            "appenders": [
                consoleAppender,
                debugAppender,
                logAppender,
                errorAppender
            ],
            "replaceConsole": true,
        });

        this.debugLogger = log4js.getLogger("debug");
        this.debugLogger.setLevel("DEBUG");

        this.logLogger = log4js.getLogger("info");
        this.logLogger.setLevel("INFO");

        this.errorLogger = log4js.getLogger("error");
        this.errorLogger.setLevel("ERROR");
    },

    /**
     * 输出错误消息
     * @param msg
     */
    error: function(msg) {
        if (Config.LogLevel >= 1) {
            this.errorLogger.error(msg);
        }
    },

    /**
     * 输出日志消息
     * @param msg
     */
    info: function(msg) {
        if (Config.LogLevel >= 2) {
            this.logLogger.info(msg);
        }
    },

    /**
     * 输出调试消息
     * @param msg
     */
    debug: function(msg) {
        if (Config.LogLevel >= 3) {
            this.debugLogger.debug(msg);
        }
    },

    /**
     * 关闭日志
     * @param callback
     */
    shutdown: function(callback) {
        log4js.shutdown(callback);
    },
};

exports.Logger = Logger;