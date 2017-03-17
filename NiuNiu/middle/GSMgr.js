/******************************************************************************
 * Author:      671643387
 * Created:     2016/10/25
 *****************************************************************************/

var util        = require("util");

///////////////////////////////////////////////////////////////////////////////
//>> 游戏服务器管理器

// 游戏服务器描述符
function GameServerDesc(id) {
    this.id         = id;   // 服务器编号
    this.ip         = null;
    this.port       = 0;
    this.game       = 0;    // 服务器支持的游戏类型
    this.capacity   = 0;    // 服务器容量
    this.usage      = 0;    // 服务器用量
    this.wsConn     = null; // 服务器之间通信的信道
    this.rArgs      = null; // 资源参数
}

GameServerDesc.prototype = {

    // 初始化
    init: function(ip, port, game, capacity, rArgs, wsConn) {
        this.ip = ip;
        this.port = port;
        this.game = game;
        this.capacity = capacity;
        this.wsConn = wsConn;
        this.rArgs = rArgs;
    },

    // 获取服务器编号
    getSid: function() {
        return this.id;
    },

    // 获取连接
    getConn: function() {
        return this.wsConn;
    },

    // 获取需要的房卡资源
    getCardRes: function(keyArg) {
        return this.rArgs[keyArg];
    },

    // 增加用量
    incUsage: function() {
        ++this.usage;

        DEBUG(util.format("INC %d USAGE, CUR IS %d", this.id, this.usage));
    },

    // 减少用量
    decUsage: function() {
        --this.usage;

        DEBUG(util.format("DEC %d USAGE, CUR IS %d", this.id, this.usage));
    },

    // 服务器是否繁忙
    isBusy: function() {
        return this.usage >= this.capacity;
    },

    // 判断服务器支持的是不是这个游戏
    isGame: function(game) {
        return this.game == game;
    },

    isConn: function(wsConn) {
        return this.wsConn == wsConn;
    },

    // 发送消息
    sendMsg: function(msg) {
        this.wsConn.sendMsg(msg);
    },

    // 获取服务器地址
    getAddress: function() {
        return util.format("ws://%s:%d/", this.ip, this.port);
    },
};

///////////////////////////////////////////////////////////////////////////////

function GameServerManager() {
    this.gameServIdGen  = 0;    // 服务器编号分配
    this.gameServs      = {};   // 游戏服务器表

    this.roomIds2Sid    = {};   // 房间号到服务器号映射
}

GameServerManager.prototype = {

    // 添加服务器
    addServ: function(sid, ip, port, game, capacity, rArgs, wsConn) {
        if ((sid == 0) || (!this.gameServs.hasOwnProperty(sid))) {
            sid = sid || ++this.gameServIdGen;

            var newServDesc = new GameServerDesc(sid);
            newServDesc.init(ip, port, game, capacity, rArgs, wsConn);
            this.gameServs[newServDesc.getSid()] = newServDesc;
            return newServDesc;
        } else {
            var servDesc = this.gameServs[sid];
            servDesc.init(ip, port, game, capacity, rArgs, wsConn);
            return servDesc;
        }
    },

    // 移除服务器
    rmServ: function(sid, wsConn) {
        var servDesc = this.gameServs[sid];
        if (servDesc && (servDesc.getConn() == wsConn)) {
            delete this.gameServs[sid];
        }
    },

    // 增加服务器用量
    incUsage: function(sid, wsConn) {
        var servDesc = this.gameServs[sid];
        if (servDesc && (servDesc.getConn() == wsConn)) {
            servDesc.incUsage();
        }
    },

    // 减少服务器用量
    decUsage: function(sid, wsConn) {
        var servDesc = this.gameServs[sid];
        if (servDesc && (servDesc.getConn() == wsConn)) {
            servDesc.decUsage();
        }
    },

    // 获取服务器
    getServer: function(game, includeBusy) {
        for (var sid in this.gameServs) {
            if (!this.gameServs.hasOwnProperty(sid)) {
                continue;
            }

            var serv = this.gameServs[sid];
            if (serv.isGame(game)) {
                if (serv.isBusy() && !includeBusy) {
                    continue;
                }
                return serv;
            }
        }
        return null;
    },

    // 获取服务器
    getServerByConn: function(wsConn) {
        for (var sid in this.gameServs) {
            if (!this.gameServs.hasOwnProperty(sid)) {
                continue;
            }

            var serv = this.gameServs[sid];
            if (serv.isConn(wsConn)) {
                return serv;
            }
        }
        return null;
    },

    // 获取服务器
    getServerBySid: function(sid) {
        return this.gameServs[sid];
    },

    // 获取服务器
    getServerByRoomId: function(roomId) {
        if (this.roomIds2Sid.hasOwnProperty(roomId)) {
            return this.getServerBySid(+(this.roomIds2Sid[roomId]));
        } else {
            return null;
        }
    },

    addRoomId2Sid: function(roomId, sid) {
        this.roomIds2Sid[roomId] = sid;
    },
};

exports.GameServerManager = GameServerManager;