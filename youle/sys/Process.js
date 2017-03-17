/******************************************************************************
 * Author:      671643387
 * Created:     2016/10/25
 *****************************************************************************/

/**
 * 进程
 * @constructor
 */
function Process() {
    this.exiting                    = false;    // 进程正在退出

    this.sigHandlerMap              = {};       // 信号处理表
    this.uncaughtExceptionHandler   = null;     // 未处理异常处理程序
    this.endExitHandler             = null;     // 退出处理程序

    this.init();
}

Process.prototype = {

    // 初始化
    init: function() {
        // 注册信号处理程序
        process.on("SIGINT", function(){
            regSigHandler("SIGINT");
        }.bind(this));
        process.on("SIGTERM", function(){
            regSigHandler("SIGTERM");
        }.bind(this));

        var me = this;
        function regSigHandler(sig) {
            me.findSighandlers(sig).forEach(function(handler){
                handler();
            });
        }

        this.addSigHandler("SIGINT", function () {
            this.endExitHandler && this.endExitHandler();
        }.bind(this));
        this.addSigHandler("SIGTERM", function(){
            this.endExitHandler && this.endExitHandler();
        }.bind(this));

        // 注册异常处理程序
        process.on("uncaughtException", function(err){
            ERROR(err.stack);
            if (this.uncaughtExceptionHandler && !this.uncaughtExceptionHandler(err)) {
                this.exiting = true;
                this.endExitHandler && this.endExitHandler();
            }
        }.bind(this));
    },

    // 设置未处理异常处理程序
    setUncaughtExceptionHandler: function(handler) {
        this.uncaughtExceptionHandler = handler;
    },

    // 退出处理程序
    setExitHandler: function(handler) {
        this.endExitHandler = handler;
    },

    // 进程退出状态
    isExiting: function() {
        return this.exiting;
    },

    // 添加信号处理程序
    addSigHandler: function(sig, handler) {
        var sigHandlerArr = this.sigHandlerMap[sig] || [];
        sigHandlerArr.push(handler);
        this.sigHandlerMap[sig] = sigHandlerArr;
    },

    // 查找信号处理程序
    findSighandlers: function(sig) {
        return this.sigHandlerMap[sig] || [];
    },
};

exports.Process = Process;