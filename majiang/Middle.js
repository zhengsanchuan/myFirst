/******************************************************************************
 * Author:      671643387
 * Created:     2016/10/25
 *****************************************************************************/

require("./util/Date.js");
var util            = require("util");
var fs              = require("fs");
var LoggerDef       = require("./util/Logger.js").Logger;
var Mongo           = require("./db/Mongo.js");
var ProcessDef      = require("./sys/Process.js").Process;
var WssServerDef    = require("./net/WssServer.js").WssServer;
var MiddleLogic     = require("./middle/index.js");
var ProtoID         = require("./net/ProtoID.js").ProtoID;
var ProtoState      = require("./net/ProtoID.js").ProtoState;
var PlayerMgrDef    = require("./middle/Player").PlayerManager;
var GSMgrDef        = require("./middle/GSMgr.js").GameServerManager;
var TaskLoader      = require("./util/Common.js").TaskLoader;
global.GlobalInfo   = require("./middle/GlobalInfo.js");
global.Assert       = require("assert");
var GMLogic         = require("./middle/GM.js");

///////////////////////////////////////////////////////////////////////////////
//>> 中央服务器
global.Process      = new ProcessDef(); // 进程
global.MongoPlat    = null;             // MongoDB平台数据库
global.MongoUser    = null;             // MongoDB用户数据库
global.MongoWorld   = null;             // MongoDB全局数据库
global.PlayerMgr    = null;             // 玩家管理器
global.WssServer    = null;             // WebSocket服务器
global.GSMgr        = null;             // 游戏服务器管理器
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

    // 加载数据库
    Mongo.loadDB(function(mDB){
        global.MongoPlat = mDB.collection("plat");
        global.MongoUser = mDB.collection("user");
        global.MongoWorld = mDB.collection("world");
        LOG("MongoDB connected");

        // 初始化全局数据
        GlobalInfo.init(function(suss){
            // 初始化玩家管理器
            global.PlayerMgr = new PlayerMgrDef();
            PlayerMgr.init(function(){
                // 初始化游戏服务器管理器
                global.GSMgr = new GSMgrDef();

                // 初始化WebSocket服务器
                global.WssServer = WssServerDef.create(Config.MiddleHost, Config.MiddlePort);
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
            });
        });
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
    var mod = query.mod;
    if (mod == 'gm') {
        var act = query.act;
        var handler = GMLogic[act];
        if (handler) {
            handler(query, httpReq, httpRes);
            return;
        }
    }
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

    var protoHandler = MiddleLogic.findProtoHandler(rCode);
    if (!protoHandler) {
        ERROR(util.format("Received unknown opcode %d", rCode));
        return;
    }

    var rUid = +rArgs.uid;
    if (((rCode != ProtoID.CMSG_LOGIN) || (rCode < ProtoID.SMSG_PING)) && !isNaN(rUid)) {
        PlayerMgr.getPlayer(rUid, function(player){
            if (player) {
                player.setConn(wsConn);
                protoHandler(wsConn, rState, rArgs, player);
            } else {
                LOG(util.format("Player %d not found", rUid));
            }
        });
    } else {
        protoHandler(wsConn, rState, rArgs);
    }
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
    var loader = new TaskLoader(function() {
        // 删除PID文件
        fs.existsSync(PidFilename) && fs.unlinkSync(PidFilename);
        LOG("Server shutdown");

        process.exit(0);
    });

    loader.addLoad("empty");

    // 保存玩家数据
    loader.addLoad("Player");
    PlayerMgr.saveAll(function(){
        LOG("Player saved");
        loader.onLoad("Player");
    });

    // 保存全局数据
    loader.addLoad("GlobalInfo");
    GlobalInfo.save(function(){
        LOG("GlobalInfo saved");
        loader.onLoad("GlobalInfo");
    });

    loader.onLoad("empty");
}