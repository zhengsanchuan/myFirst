/******************************************************************************
 * Author:      671643387
 * Created:     2016/10/25
 *****************************************************************************/

var util            = require("util");
var http            = require("http");
var url             = require("url");
var querystring     = require("querystring");
var WebSocketServer = require('websocket').server;
var ProtoID         = require("./ProtoID.js").ProtoID;

///////////////////////////////////////////////////////////////////////////////
//>> WebSocket 服务器

/**
 * WebSocket 连接
 * @constructor
 */
function WssConn() {
    this.id                 = 0;        // 连接编号
    this.conn               = null;     // 连接对象
    this.time               = 0;        // 连接时间
    this.lastActTime        = 0;        // 最后活动时间

    this.msgHandler         = null;     // 消息处理程序
    this.closeHandler       = [];       // 关闭处理程序

    this.recvCompHandler    = null;     // 接收消息回调
    this.sendCompHandler    = null;     // 消息发送完成回调

    this.isClose            = false;    // 是否已经关闭
}

WssConn.create = function(id, conn){
    var wsConn = new WssConn();
    wsConn.init(id, conn);
    return wsConn;
};

WssConn.prototype = {

    // 初始化
    init: function(id, conn) {
        this.id = id;
        this.conn = conn;
        this.time = Date.getStamp();

        this.conn.on("message", function(message){
            if (message.type === 'utf8') {

                // 统计接收数据长度
                this.recvCompHandler && this.recvCompHandler(message.utf8Data.length);

                // 解码消息
                var query = null;
                try {
                    query = JSON.parse(message.utf8Data);
                } catch(error) {
                    query = {};
                }

                if (typeof(query) != 'object') {
                    return;
                }

                if (!query.args) {
                    query.args = {};
                }

                //DEBUG(util.format("%d recv Proto > %d", this.id, query.code));

                this.msgHandler && this.msgHandler(query);
            }
        }.bind(this));

        // 依次调用关闭处理程序
        this.conn.on("close", function(){
            this.closeHandler.forEach(function(handler){
                handler(this);
            }.bind(this));
            this.isClose = true;
        }.bind(this));
    },

    // 设置消息处理程序
    setMessageHandler: function(handler) {
        this.msgHandler = handler;
    },

    // 设置连接关闭处理程序
    pushCloseHandler: function(handler) {
        this.closeHandler.push(handler);
    },

    // 设置接收数据回调
    setRecvCompHandler: function(handler) {
        this.recvCompHandler = handler;
    },

    // 设置发送数据回调
    setSendCompHandler: function(handler) {
        this.sendCompHandler = handler;
    },

    // 获取连接ID
    getId: function() {
        return this.id;
    },

    // 设置最后活动时间
    setLastActTime: function (time) {
        this.lastActTime = time;
    },

    // 获取最后活动时间
    getLastActTime: function() {
        return this.lastActTime;
    },

    // 发送消息
    sendMsg: function(sMsg) {
        if (this.isClose) {
            return;
        }

        var strMsg = JSON.stringify(sMsg);
        this.conn.sendUTF(strMsg, function(){
            // 统计发送数据长度
            this.sendCompHandler && this.sendCompHandler(strMsg.length);
        }.bind(this));
    },

    // 关闭连接
    close: function() {
        DEBUG(util.format("Close conn %d", this.id));
        this.isClose = true;
        this.conn.close();
    },

    // 获取地址字符串
    getAddrString: function() {
        return this.conn.remoteAddress;
    },
};

/**
 * WebSocket 服务器
 * @constructor
 */
function WssServer() {
    this.ip                     = null;     // 服务器监听地址
    this.port                   = 0;        // 服务器监听端口

    this.httpServ               = null;     // HTTP服务器
    this.wsServ                 = null;     // WebSocket服务器

    this.wsConnIdGen            = 0;        // WebSocket连接ID生成
    this.wsConnMap              = {};       // WebSocket连接表
    this.wsConnSize             = 0;        // WebSocket连接计数

    this.httpReqHandler         = null;     // HTTP请求处理程序
    this.wsOriginChecker        = null;
    this.wsConnMsgHandler       = null;     // WebSocket消息处理程序
    this.wsConnCloseHandler     = null;     // WebSocket连接关闭处理程序

    this.onServerStartupHandler = null;     // 服务器启动完成处理程序

    this.sendPing               = false;    // 连接保活
    this.dieConnTime            = 60;       // 连接多长时间没响应就认为挂了

    this.recvBytes              = 0;        // 接收到的数据长度
    this.sendBytes              = 0;        // 发送的数据长度
}

WssServer.create = function(ip, port){
    var wssServ = new WssServer();
    wssServ.init(ip, port);
    return wssServ;
};

WssServer.prototype = {

    // 初始化
    init: function(ip, port) {
        this.ip = ip;
        this.port = port;

        // 创建HTTP服务器
        this.httpServ = http.createServer(function (httpReq, httpRes) {
            this.onHttpRequest(httpReq, httpRes);
        }.bind(this));

        // 创建WebSocket服务器
        this.wsServ = new WebSocketServer({
            httpServer: this.httpServ,
        });
        this.wsServ.on("request", function (wsReq) {
            this.onWsRequest(wsReq);
        }.bind(this));

        // 启动定时任务
        setInterval(function(){
            this.onTimeTick();
        }.bind(this), 10000);
    },

    // 设置HTTP请求处理程序
    setHttpRequestHandler: function(handler) {
        this.httpReqHandler = handler;
    },

    // 设置WebSocket连接Origin检查器
    setWsOriginChecker: function(checker) {
        this.wsOriginChecker = checker;
    },

    // 设置WebSocket连接消息处理程序
    setWsConnMsgHandler: function(handler) {
        this.wsConnMsgHandler = handler;
    },

    // 设置WebSocket连接关闭处理程序
    setWsConnCloseHandler: function(handler) {
        this.wsConnCloseHandler = handler;
    },

    // 设置服务器启动成功处理程序
    setServerStartupHandler: function(handler) {
        this.onServerStartupHandler = handler;
    },

    // 设置开启/关闭连接保活
    setPing: function(open, time) {
        this.sendPing = open;
        if (time) this.dieConnTime = time;
    },

    // 获取服务器状态数据
    getStatics: function() {
        return {
            connSize:   this.wsConnSize,
            recvBytes:  this.recvBytes,
            sendBytes:  this.sendBytes,
        };
    },

    // 启动服务器
    start: function() {
        this.httpServ.listen(this.port, this.ip, function () {
            this.onServerStartup();
        }.bind(this));
    },

    // 停止服务器
    stop: function(callback){

    },

    // 增加发送数据
    incBytesSend: function(byteSize) {
        this.sendBytes += byteSize;
    },

    // 增加接收数据
    incBytesRecv: function(byteSize) {
        this.recvBytes += byteSize;
    },

    ///////////////////////////////////////////////////////////////////////////

    onHttpRequest: function(httpReq, httpRes) {
        // 服务器正在关闭，直接关闭连接
        if (Process.isExiting()) {
            httpReq.connection.destroy();
            return;
        }

        // 接收数据
        var reqBody = "";
        httpReq.on("data", function (chunk) {
            reqBody += chunk;
        });

        // 处理接收到的数据
        httpReq.on("end", function(){
            var reqStr = "";
            if (httpReq.method == "POST") {
                reqStr = reqBody;
            } else {
                reqStr = url.parse(httpReq.url).query;
            }

            var query = querystring.parse(reqStr);
            httpRes._query = query;
            httpRes._time = Date.getStamp();
            httpRes._ip = httpReq.connection.remoteAddress;

            // 调用客户请求处理程序
            this.httpReqHandler && this.httpReqHandler(query, httpReq, httpRes);
        }.bind(this));
    },

    onWsRequest: function(wsReq) {
        if ((this.wsOriginChecker ? this.wsOriginChecker(wsReq.origin) : true)) {
            // 接受连接
            var wsConn = WssConn.create(++this.wsConnIdGen,
                wsReq.accept("default-protocol", wsReq.origin));
            wsConn.setLastActTime(Date.getStamp());
            // 设置连接关闭处理程序
            wsConn.pushCloseHandler(function () {
                this.onWsConnClose(wsConn);
            }.bind(this));
            // 设置消息处理程序
            wsConn.setMessageHandler(function(wsMsg){
                this.onWsConnMsg(wsConn, wsMsg);
            }.bind(this));
            // 设置统计处理程序
            wsConn.setRecvCompHandler(function(byteSize){
                this.recvBytes += byteSize;
            }.bind(this));
            wsConn.setSendCompHandler(function(byteSize){
                this.sendBytes += byteSize;
            }.bind(this));
            // 加入连接表
            this.wsConnMap[wsConn.getId()] = wsConn;
            this.wsConnSize += 1;

            DEBUG(util.format("Conn %d connected from %s", wsConn.getId(), wsConn.getAddrString()));
        } else {
            // 拒绝连接
            wsReq.reject();
        }
    },

    onWsConnMsg: function(wsConn, wsMsg) {
        if (this.sendPing &&
            (wsMsg.code == ProtoID.CMSG_PONG || wsMsg.code == ProtoID.SMSG_PONG)) {
            wsConn.setLastActTime(Date.getStamp());
            return;
        }

        this.wsConnMsgHandler && this.wsConnMsgHandler(wsConn, wsMsg);
    },

    onWsConnClose: function(wsConn) {
        this.wsConnCloseHandler && this.wsConnCloseHandler(wsConn);

        // 从连接表移除连接
        delete this.wsConnMap[wsConn.getId()];
        this.wsConnSize -= 1;
    },

    onServerStartup: function() {
        this.onServerStartupHandler && this.onServerStartupHandler();
    },

    onTimeTick: function() {
        // 连接保活
        this.sendPing && this.doKeepAlive();
    },

    doKeepAlive: function() {
        // 获取当前时间
        var now = Date.getStamp();

        // 关闭不活动连接
        var needCloseCIds = [];
        for (var cId in this.wsConnMap) {
            if (!this.wsConnMap.hasOwnProperty(cId)) {
                continue;
            }
            var wsConn = this.wsConnMap[cId];
            if ((now - wsConn.getLastActTime()) >= this.dieConnTime) {
                needCloseCIds.push(+cId);
            }
        }
        needCloseCIds.forEach(function(cId){
            this.wsConnMap[cId].close();
        }.bind(this));

        // 发送PING
        var pingPkt = { code: ProtoID.SMSG_PING };
        for (var cId in this.wsConnMap) {
            if (!this.wsConnMap.hasOwnProperty(cId)) {
                continue;
            }
            this.wsConnMap[cId].sendMsg(pingPkt);
        }
    },
};

exports.WssConn = WssConn;
exports.WssServer = WssServer;