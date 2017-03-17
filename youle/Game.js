/******************************************************************************
 * Author:      671643387
 * Created:     2016/10/25
 *****************************************************************************/

require("./util/Date.js");
var util                = require("util");
var fs                  = require("fs");
var LoggerDef           = require("./util/Logger.js").Logger;
var Mongo               = require("./db/Mongo.js");
var ProcessDef          = require("./sys/Process.js").Process;
var WssServerDef        = require("./net/WssServer.js").WssServer;
var GameLogic           = require("./game/index.js");
var ProtoID             = require("./net/ProtoID.js").ProtoID;
var ProtoState          = require("./net/ProtoID.js").ProtoState;
var GameMgrDef          = require("./game/GameMgr.js").GameManager;
global.Assert           = require("assert");
global.clone            = require("clone");

var MAX_PUBLIC_PROTOID  = require("./net/ProtoID.js").MAX_PUBLIC_PROTOID;

///////////////////////////////////////////////////////////////////////////////
//>> 游戏服务器
global.Process      = new ProcessDef(); // 进程
global.WssServer    = null;             // WebSocket服务器
global.GameMgr      = null;             // 游戏管理器
global.Logger       = null;             // 日志记录器
var PidFilename     = "";               // PID文件名

function main() {
    // 进程消息处理
    Process.setUncaughtExceptionHandler(onUncaughtException);
    Process.setExitHandler(onProcessExit);

    // 加载配置
    loadConf();

    // 初始化日志
    setupLogger();

    // 初始化游戏管理器
    global.GameMgr = new GameMgrDef();
    GameMgr.init(function(suss){
        if (suss) {
            // 初始化WebSocket服务器
            global.WssServer = WssServerDef.create(Config.GameHost, Config.GamePort);
            WssServer.setHttpRequestHandler(onHttpRequest);
            WssServer.setWsOriginChecker(wsOriginChecker);
            WssServer.setWsConnMsgHandler(wsConnMsgHandler);
            WssServer.setWsConnCloseHandler(wsConnCloseHandler);
            WssServer.setServerStartupHandler(function(){
                onServerStartup();
            });
            WssServer.setPing(Config.SetPing);

            // 开始监听
            WssServer.start();
        } else {
            ERROR("Connect to middle server failed");
            process.exit(-1);
        }
    });
}
main();

///////////////////////////////////////////////////////////////////////////////

// 加载配置
function loadConf() {
    global.Config = require(fs.existsSync('../Config.js') ? '../Config.js' : './Config.js');
}

// 初始化日志
function setupLogger() {
    global.Logger = new LoggerDef();
    Logger.init({
        servName    : Config.ServerName,
    });
    global.DEBUG = function(msg) { Logger.debug(msg); };
    global.LOG = function(msg) { Logger.info(msg); };
    global.ERROR = function(msg) { Logger.error(msg); };
    LOG("Logger inited");
}

// HTTP请求处理程序
function onHttpRequest(query, httpReq, httpRes) {
    // 本服务器使用WebSocket连接
    ERROR("Received HTTP request");
    httpReq.connection.destroy();
}

// WebSocket连接Origin检查
function wsOriginChecker(origin) {
    return true;
}

// WebSocket消息处理
function wsConnMsgHandler(wsConn, wsMsg) {
    var rCode = wsMsg.code;
    var rState = wsMsg.state || ProtoState.STATE_OK;
    var rArgs = wsMsg.args;

    DEBUG(util.format("Received opcode %d", rCode));

    var protoHandler = null;
    var caller = global;
    if (rCode >= MAX_PUBLIC_PROTOID) {
        // 将请求转发到游戏模块
        var SubGame = GameMgr.getSubGame();
        var protoHandler = SubGame.findProtoHandler(rCode);
        caller = SubGame;
    } else {
        var protoHandler = GameLogic.findProtoHandler(rCode);
    }

    if (!protoHandler) {
        ERROR(util.format("Received unknown opcode %d", rCode));
        return;
    }

    protoHandler.call(caller, wsConn, rState, rArgs);
}

// WebSocket连接关闭处理程序
function wsConnCloseHandler(wsConn) {
    DEBUG(util.format("Conn %d disconnected", wsConn.getId()));
}

// 服务器启动完成
function onServerStartup() {
    // 写PID文件
    PidFilename = Config.ServerName + ".pid";
    fs.writeFileSync(PidFilename, process.pid, 'utf8');

    LOG("Server startup");
}

// 未处理异常
function onUncaughtException(err) {
    if (err.code == "EADDRINUSE") {
        return false;
    }

    return true;
}

// 进程退出
function onProcessExit() {
    // 关闭游戏
    GameMgr.shutdown();

    // 删除PID文件
    fs.existsSync(PidFilename) && fs.unlinkSync(PidFilename);
    LOG("Server shutdown");

    process.exit(0);
}