/******************************************************************************
 * Author:      671643387
 * Created:     2016/10/26
 *****************************************************************************/

var util            = require("util");
var Room            = require("./Room.js").Room;
var Opcodes         = require("./Opcodes.js").Opcodes;
var ProtoState      = require("../../../net/ProtoID.js").ProtoState;

///////////////////////////////////////////////////////////////////////////////
//>> 湖南碰胡子游戏

function SubGame() {
    this.protoMap       = {};   // 协议表

    this.roomCnt        = 0;
    this.rooms          = {};

    this.init();
}

SubGame.prototype = {

    // 初始化
    init: function() {
        this.initProtoMap();
    },

    // 初始化协议表
    initProtoMap: function() {
        this.onProto(Opcodes.CMSG_PLAYER_PENG_CARD, this.onPlayerReqPengCard);
        this.onProto(Opcodes.CMSG_PLAYER_PLAY_CARD, this.onPlayerReqPlayCard);
        this.onProto(Opcodes.CMSG_PLAYER_CHI_CARD, this.onPlayerReqChiCard);
        this.onProto(Opcodes.CMSG_PLAYER_HU_CARD, this.onPlayerReqHuCard);
        this.onProto(Opcodes.CMSG_PLAYER_PASS, this.onPlayerReqPass);
        this.onProto(Opcodes.CMSG_PLAYER_CONTINUE, this.onPlayerReqContinue);
        this.onProto(Opcodes.CMSG_PLAYER_DESTROY_ROOM, this.onPlayerDestroyRoom);
        this.onProto(Opcodes.CMSG_PLAYER_REQ_DESTROY_ROOM, this.onPlayerReqDestroyRoom);
        this.onProto(Opcodes.CMSG_PLAYER_RESP_DESTROY_ROOM, this.onPlayerRespDestroyRoom);
        this.onProto(Opcodes.CMSG_PLAYER_REQ_BROADCAST_MSG, this.onPlayerReqBroadcastMessage);
        this.onProto(Opcodes.CMSG_PLAYER_RESP_5HU_WARNING, this.onPlayerResp5HuWarning);
        this.onProto(Opcodes.CMSG_PLAYER_REQ_EXIT_ROOM, this.onPlayerReqExitRoom);
    },

    onProto: function(opCode, handler) {
        this.protoMap[opCode] = handler;
    },

    // 创建房间
    createRoom: function(creator, roomId, cArgs) {
        var newRoom = new Room(roomId);
        if (newRoom.init(creator, cArgs)) {
            this.roomCnt += 1;
            this.rooms[roomId] = newRoom;

            newRoom.dump();
            return newRoom;
        }
        return null;
    },

    // 销毁房间
    destroyRoom: function(room) {
        delete this.rooms[room.id];
    },

    // 关闭
    shutdown: function() {
        for (var rId in this.rooms) {
            if (!this.rooms.hasOwnProperty(rId)) {
                continue;
            }
            this.rooms[rId].shutdown();
        }
    },

    // 加入房间
    joinRoom: function(roomId, jArgs, wsConn) {
        var wantRoom = this.rooms[roomId];
        if (!wantRoom) {
            DEBUG(util.format("Room %d not exists", roomId));
            return ProtoState.STATE_ROOM_NOT_EXISTS;
        }

        if (!wantRoom.addPlayer(jArgs, wsConn)) {
            return ProtoState.STATE_ROOM_FULL;
        }
        return ProtoState.STATE_OK;
    },

    // 查找协议处理程序
    findProtoHandler: function(rCode) {
        return this.protoMap[rCode];
    },

    ///////////////////////////////////////////////////////////////////////////

    // 玩家出牌
    onPlayerReqPlayCard: function(wsConn, rState, rArgs){
        var uid = +rArgs.uid;
        var roomId = +rArgs.roomId;
        var card = +rArgs.card;
        var wantRoom = this.rooms[roomId];
        if (!wantRoom) {
            DEBUG(util.format("Room %d not exists", roomId));
            return;
        }

        DEBUG(util.format("Player %d request CHU, %d", uid, card));
        wantRoom.onPlayerReqPlayCard(uid, card);
    },

    // 玩家请求碰牌
    onPlayerReqPengCard: function(wsConn, rState, rArgs) {
        var uid = +rArgs.uid;
        var roomId = +rArgs.roomId;
        var wantRoom = this.rooms[roomId];
        if (!wantRoom) {
            DEBUG(util.format("Room %d not exists", roomId));
            return;
        }

        DEBUG(util.format("Player %d request PENG", uid));
        wantRoom.onPlayerReqPengCard(uid);
    },

    // 玩家请求吃牌
    onPlayerReqChiCard: function(wsConn, rState, rArgs) {
        var uid = +rArgs.uid;
        var roomId = +rArgs.roomId;
        var wantRoom = this.rooms[roomId];
        var chiSes = rArgs.chiSes; // 吃牌
        var luoSess = rArgs.luoSess; // 落牌
        if (!wantRoom) {
            DEBUG(util.format("Room %d not exists", roomId));
            return;
        }

        DEBUG(util.format("Player %d request CHI, %j - %j", uid, chiSes, luoSess));
        wantRoom.onPlayerReqChiCard(uid, chiSes, luoSess);
    },

    // 玩家请求胡牌
    onPlayerReqHuCard: function(wsConn, rState, rArgs) {
        var uid = +rArgs.uid;
        var roomId = +rArgs.roomId;
        var wantRoom = this.rooms[roomId];
        if (!wantRoom) {
            DEBUG(util.format("Room %d not exists", roomId));
            return;
        }

        DEBUG(util.format("Player %d request HU", uid));
        wantRoom.onPlayerReqHuCard(uid);
    },

    // 玩家请求过
    onPlayerReqPass: function(wsConn, rState, rArgs) {
        var uid = +rArgs.uid;
        var roomId = +rArgs.roomId;
        var wantRoom = this.rooms[roomId];
        if (!wantRoom) {
            DEBUG(util.format("Room %d not exists", roomId));
            return;
        }

        DEBUG(util.format("Player %d request PASS", uid));
        wantRoom.onPlayerReqPass(uid);
    },

    // 玩家请求继续
    onPlayerReqContinue: function(wsConn, rState, rArgs) {
        var uid = +rArgs.uid;
        var roomId = +rArgs.roomId;
        var wantRoom = this.rooms[roomId];
        if (!wantRoom) {
            DEBUG(util.format("Room %d not exists", roomId));
            return;
        }

        DEBUG(util.format("Player %d request Continue", uid));
        wantRoom.onPlayerReqContinue(uid);
    },

    // 房主解散房间
    onPlayerDestroyRoom: function(wsConn, rState, rArgs) {
        var uid = +rArgs.uid;
        var roomId = +rArgs.roomId;
        var wantRoom = this.rooms[roomId];
        if (!wantRoom) {
            DEBUG(util.format("Room %d not exists", roomId));
            return;
        }

        DEBUG(util.format("Player %d request DestroyRoom", uid));
        wantRoom.onPlayerDestroyRoom(uid);
    },

    onPlayerReqDestroyRoom: function(wsConn, rState, rArgs) {
        var uid = +rArgs.uid;
        var roomId = +rArgs.roomId;
        var wantRoom = this.rooms[roomId];
        if (!wantRoom) {
            DEBUG(util.format("Room %d not exists", roomId));
            return;
        }

        DEBUG(util.format("Player %d request ReqDestroyRoom", uid));
        wantRoom.onPlayerReqDestroyRoom(uid);
    },

    onPlayerRespDestroyRoom: function(wsConn, rState, rArgs) {
        var uid = +rArgs.uid;
        var roomId = +rArgs.roomId;
        var ok = rArgs.ok;
        var wantRoom = this.rooms[roomId];
        if (!wantRoom) {
            DEBUG(util.format("Room %d not exists", roomId));
            return;
        }

        DEBUG(util.format("Player %d request RespDestroyRoom", uid));
        wantRoom.onPlayerRespDestroyRoom(uid, ok);
    },

    // 广播用户消息
    onPlayerReqBroadcastMessage: function(wsConn, rState, rArgs) {
        var uid = +rArgs.uid;
        var roomId = +rArgs.roomId;
        var message = rArgs.message;
        var wantRoom = this.rooms[roomId];
        if (!wantRoom) {
            DEBUG(util.format("Room %d not exists", roomId));
            return;
        }

        DEBUG(util.format("Player %d request BroadcastMessage", uid));
        wantRoom.onPlayerReqBroadcastMessage(uid, message);
    },

    // 玩家响应5胡报警
    onPlayerResp5HuWarning: function(wsConn, rState, rArgs) {
        var uid = +rArgs.uid;
        var roomId = +rArgs.roomId;
        var ok = rArgs.ok;
        var wantRoom = this.rooms[roomId];
        if (!wantRoom) {
            DEBUG(util.format("Room %d not exists", roomId));
            return;
        }

        DEBUG(util.format("Player %d request Resp5HuWarning %j", uid, ok));
        wantRoom.onPlayerResp5HuWarning(uid, ok);
    },

    onPlayerReqExitRoom: function(wsConn, rState, rArgs) {
        var uid = +rArgs.uid;
        var roomId = +rArgs.roomId;
        var wantRoom = this.rooms[roomId];
        if (!wantRoom) {
            DEBUG(util.format("Room %d not exists", roomId));
            return;
        }

        DEBUG(util.format("Player %d request ReqExitRoom %j", uid, ok));
        wantRoom.onPlayerReqExitRoom(uid);
    },
};

exports = module.exports = new SubGame();