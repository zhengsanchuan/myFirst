/******************************************************************************
 * Author:      671643387
 * Created:     2016/10/25
 *****************************************************************************/

var util            = require("util");
var WebSocketClient = require("websocket").client;
var WssConnDef      = require("../net/WssServer.js").WssConn;
var ProtoID         = require("../net/ProtoID.js").ProtoID;
var ProtoState      = require("../net/ProtoID.js").ProtoState;
var GameLogic       = require("./index.js");

///////////////////////////////////////////////////////////////////////////////
//>> WebSocket客户端

function WssClient(id) {
    this.id                 = id;
    this.client             = null;
    this.conn               = null;

    this.onConnected        = null;
    this.onConnectedFailed  = null;
    this.onConnClosed       = null;
    this.onConnMsg       = null;

    this.init();
}

WssClient.prototype = {

    // 初始化
    init: function() {
        this.client = new WebSocketClient();

        this.client.on('connectFailed', function(error) {
            this.onConnectedFailed && this.onConnectedFailed();
        }.bind(this));

        this.client.on("connect", function(connection) {
            // 接受连接
            this.conn = WssConnDef.create(0, connection);
            this.conn.setLastActTime(Date.getStamp());
            // 设置连接关闭处理程序
            this.conn.pushCloseHandler(function () {
                this.onConnClosed && this.onConnClosed();
            }.bind(this));
            // 设置消息处理程序
            this.conn.setMessageHandler(function(wsMsg){
                this.onConnMsg && this.onConnMsg(wsMsg);
            }.bind(this));
            // 设置统计处理程序
            this.conn.setRecvCompHandler(function(byteSize){
                WssServer && WssServer.incBytesRecv(byteSize);
            }.bind(this));
            this.conn.setSendCompHandler(function(byteSize){
                WssServer && WssServer.incBytesSend(byteSize);
            }.bind(this));

            this.onConnected && this.onConnected();
        }.bind(this));
    },

    // 连接服务器
    connect: function(address) {
        this.client.connect(address, "default-protocol");
    },

    setOnConnectedHandler: function(handler) {
        this.onConnected = handler;
    },

    // 设置连接失败
    setOnConnectFailedHandler: function(handler) {
        this.onConnectedFailed = handler;
    },

    // 设置关闭连接
    setOnCloseHandler: function(handler) {
        this.onConnClosed = handler;
    },

    // 设置消息处理程序
    setOnMsgHandelr: function(handler) {
        this.onConnMsg = handler;
    },

    // 获取连接
    getConn: function() {
        return this.conn;
    },

    // 发送消息
    sendMsg: function(msg) {
        this.conn.sendMsg(msg);
    },
};

///////////////////////////////////////////////////////////////////////////////
//>> 游戏管理器

function GameManager() {
    this.sid            = 0;        // 服务器编号
    this.mgrClient      = null;     // 管理连接客户端

    // 状态数据
    this.middleOk       = false;    // 是否连接到中央服务器
    this.subGame        = null;     // 游戏逻辑
}

GameManager.prototype = {

    // 初始化
    init: function(callback) {

        // 初始化管理连接
        this.mgrClient = new WssClient(0);
        this.mgrClient.setOnConnectedHandler(function(){
            this.onMgrConnOpen();
            callback && callback(true);
        }.bind(this));
        this.mgrClient.setOnConnectFailedHandler(function(){
            callback && callback(false);
        });
        this.mgrClient.setOnCloseHandler(function(){
            this.onMgrConnClose();
        }.bind(this));
        this.mgrClient.setOnMsgHandelr(function(wsMsg){
            this.onMgrConnMsg(wsMsg);
        }.bind(this));

        // 连接中央服务器
        LOG("Try connect to middle server");
        this.mgrClient.connect(util.format("ws://%s:%d/", Config.MiddleHost, Config.MiddlePort));
    },

    setMiddleOk: function(ok) {
        this.middleOk = ok;
    },

    isMiddleOk: function() {
        return this.middleOk;
    },

    onMgrConnOpen: function() {
        // 注册服务器
        this.tryRegServ();
    },

    tryRegServ: function() {
        DEBUG("Try register server");

        // 注册服务器
        this.mgrClient.sendMsg({
            code    : ProtoID.SMSG_REQ_REGISTER,
            args    : {
                ip          : Config.GameHost,
                port        : Config.GamePort,
                gameType    : Config.GameType,
                capacity    : Config.GameCapacity,
                sid         : this.sid,
            }
        });
    },

    // 管理连接关闭
    onMgrConnClose: function() {
        LOG("Middle connection closed");
        this.middleOk = false;

        this.mgrClient.setOnConnectedHandler(function(){
            this.onMgrConnOpen();
        }.bind(this));
        this.mgrClient.setOnConnectFailedHandler(null);
        setInterval(function(){
            if (!this.middleOk) {
                // 连接中央服务器
                LOG("Try connect to middle server");
                this.mgrClient.connect(util.format("ws://%s:%d/", Config.MiddleHost, Config.MiddlePort));
            }
        }.bind(this), 5000);
    },

    setSid: function(sid) {
        this.sid = sid;
    },

    // 管理连接消息
    onMgrConnMsg: function(wsMsg) {
        if (wsMsg.code == ProtoID.SMSG_PING) {
            this.mgrClient.getConn().setLastActTime(Date.getStamp());
            this.mgrClient.sendMsg({
                code    : ProtoID.SMSG_PONG,
                state   : ProtoState.STATE_OK,
            });
            return;
        }

        var rCode = wsMsg.code;
        var rState = wsMsg.state || ProtoState.STATE_OK;
        var rArgs = wsMsg.args;

        var protoHandler = GameLogic.findProtoHandler(rCode);
        if (!protoHandler) {
            this.mgrClient.sendMsg({
                code    : (rCode + 1),
                status  : ProtoState.STATE_FAILED,
            });
            return;
        }

        protoHandler(this.mgrClient.getConn(), rState, rArgs);
    },

    // 获取游戏逻辑
    getSubGame: function() {
        if (!this.subGame) {
            this.subGame = require(util.format("./games/%d/SubGame.js", Config.GameType));
        }
        return this.subGame;
    },

    // 增加用量
    incUsage: function() {
        this.mgrClient.sendMsg({
            code    : ProtoID.SMSG_REQ_INC_USAGE,
            args    : {
                sid : this.sid,
            }
        });
    },

    // 减少用量
    decUsage: function() {
        this.mgrClient.sendMsg({
            code    : ProtoID.SMSG_REQ_DEC_USAGE,
            args    : {
                sid : this.sid,
            }
        });
    },

    //扣除房卡
    decPlayerCards: function(uid, cards) {
        this.mgrClient.sendMsg({
            code    : ProtoID.SMSG_REQ_DEC_PLAYER_CARDS,
            args    : {
                uid     : uid,
                cards   : cards,
            }
        });
    },

    // 发送管理消息
    sendMgrMsg: function(msg) {
        this.mgrClient.sendMsg(msg);
    },

    // 关闭游戏服务器
    shutdown: function() {
        this.getSubGame().shutdown();

        DEBUG("Do unregister server");

        // 取消注册服务器
        this.mgrClient.sendMsg({
            code    : ProtoID.SMSG_REQ_UNREGISTER,
            args    : {
                sid : this.sid,
            }
        });
    },
};

exports.GameManager = GameManager;