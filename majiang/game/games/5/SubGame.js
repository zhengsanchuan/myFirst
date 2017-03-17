/******************************************************************************
 * Author:      zsc
 * Created:     2016/10/26
 *****************************************************************************/

var util = require("util");
var Room = require("./Room.js").Room;
var Opcodes = require("./Opcodes.js").Opcodes;

///////////////////////////////////////////////////////////////////////////////
//>> 雀雀麻将

function SubGame() {
    this.protoMap = {};   // 协议表

    this.roomCnt = 0;
    this.rooms = {};

    this.init();
}

SubGame.prototype = {

    // 初始化
    init: function () {
        this.initProtoMap();
    },

    // 初始化协议表
    initProtoMap: function () {
        this.onProto(Opcodes.C2S_PLAYER_MISSING, this.onPlayerReqMissingCard);
        this.onProto(Opcodes.C2S_PLAYER_EXCHANGE, this.onPlayerReqExchangeCard);
        this.onProto(Opcodes.C2S_PLAYER_PENG_CARD, this.onPlayerReqPengCard);
        this.onProto(Opcodes.C2S_PLAYER_PLAY_CARD, this.onPlayerReqPlayCard);
        this.onProto(Opcodes.C2S_PLAYER_GANG_CARD, this.onPlayerReqGangCard);
        this.onProto(Opcodes.C2S_PLAYER_HU_CARD, this.onPlayerReqHuCard);
        this.onProto(Opcodes.C2S_PLAYER_PASS_CARD, this.onPlayerReqPass);
        this.onProto(Opcodes.C2S_PLAYER_CONTINUE, this.onPlayerReqContinue);
        this.onProto(Opcodes.C2S_PLAYER_DESTROY_ROOM, this.onPlayerDestroyRoom);
        this.onProto(Opcodes.C2S_PLAYER_EXIT_ROOM, this.onPlayerReqExitRoom);
        this.onProto(Opcodes.C2S_PLAYER_REQ_DESTROY_ROOM, this.onPlayerReqDestroyRoom);
        this.onProto(Opcodes.C2S_PLAYER_RESP_DESTROY_ROOM, this.onPlayerRespDestroyRoom);
        this.onProto(Opcodes.C2S_PLAYER_REQ_BROADCAST_MSG, this.onPlayerReqBroadcastMessage);
        this.onProto(Opcodes.C2S_PLAYER_USE_PROP, this.onPlayerReqUseProp);
        this.onProto(Opcodes.C2S_PLAYER_READY, this.onPlayerReqReady);
    },

    onProto: function (opCode, handler) {
        this.protoMap[opCode] = handler;
    },

    // 创建房间
    createRoom: function (creator, roomId, cArgs) {
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
    destroyRoom: function (room) {
        delete this.rooms[room.id];
    },

    // 关闭
    shutdown: function () {
        for (var rId in this.rooms) {
            if (!this.rooms.hasOwnProperty(rId)) {
                continue;
            }
            this.rooms[rId].shutdown();
        }
    },

    // 加入房间
    joinRoom: function (roomId, jArgs, wsConn) {
        var wantRoom = this.rooms[roomId];
        if (!wantRoom) {
            DEBUG(util.format("Room %d not exists", roomId));
            return false;
        }

        return wantRoom.addPlayer(jArgs, wsConn);
    },

    // 查找协议处理程序
    findProtoHandler: function (rCode) {
        return this.protoMap[rCode];
    },

    ///////////////////////////////////////////////////////////////////////////

    // 玩家出牌
    onPlayerReqPlayCard: function (wsConn, rState, rArgs) {
        var uid = +rArgs.uid;
        var roomId = +rArgs.roomId;
        var card = +rArgs.card;
        var wantRoom = this.rooms[roomId];
        if (!wantRoom) {
            DEBUG(util.format("Room %d not exists", roomId));
            return;
        }
        if (isNaN(card)) {
            DEBUG(util.format("card %d must be Number ", card));
            return;
        }
        if (card > 27) {
            DEBUG(util.format("card %d not exists", card));
            return;
        }
        DEBUG(util.format("Player %d request CHU, %d", uid, card));
        wantRoom.onPlayerReqPlayCard(uid, card);
    },

    // 玩家杠牌
    onPlayerReqGangCard: function (wsConn, rState, rArgs) {
        var uid = +rArgs.uid;
        var roomId = +rArgs.roomId;
        var card = +rArgs.card;
        var wantRoom = this.rooms[roomId];
        if (!wantRoom) {
            DEBUG(util.format("Room %d not exists", roomId));
            return;
        }
        if (isNaN(card)) {
            DEBUG(util.format("card %d must be Number ", card));
            return;
        }

        DEBUG(util.format("Player %d request Gang, %d", uid, card));
        wantRoom.onPlayerReqGangCard(uid, card);
    },

    // 玩家请求碰牌
    onPlayerReqPengCard: function (wsConn, rState, rArgs) {
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

    // 玩家请求定缺
    onPlayerReqMissingCard: function (wsConn, rState, rArgs) {
        var uid = +rArgs.uid;
        var roomId = +rArgs.roomId;
        var wantRoom = this.rooms[roomId];
        var type = rArgs.missType;
        if (!wantRoom) {
            DEBUG(util.format("Room %d not exists", roomId));
            return;
        }
        if (isNaN(type)) {
            DEBUG(util.format("missType %d must be Number ", type));
            return;
        }
        DEBUG(util.format("Player %d request Missing", uid));
        wantRoom.onPlayerReqMissingCard(uid, type);
    },

    // 玩家请求换牌(换三张)
    onPlayerReqExchangeCard: function (wsConn, rState, rArgs) {
        var uid = +rArgs.uid;
        var roomId = +rArgs.roomId;
        var wantRoom = this.rooms[roomId];
        var cards = rArgs.card;
        if (!wantRoom) {
            DEBUG(util.format("Room %d not exists", roomId));
            return;
        }
        // if (isNaN(type)) {
        //     DEBUG(util.format("missType %d must be Number ", type));
        //     return;
        // }
        DEBUG(util.format("Player %d request Exchange", uid));
        wantRoom.onPlayerReqExchangeCard(uid, cards);
    },

    // 玩家请求胡牌
    onPlayerReqHuCard: function (wsConn, rState, rArgs) {
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
    onPlayerReqPass: function (wsConn, rState, rArgs) {
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
    onPlayerReqContinue: function (wsConn, rState, rArgs) {
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
    onPlayerDestroyRoom: function (wsConn, rState, rArgs) {
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

    // 玩家请求准备 (取消准备)
    onPlayerReqReady: function(wsConn, rState, rArgs) {
        var uid = +rArgs.uid;
        var roomId = +rArgs.roomId;
        var wantRoom = this.rooms[roomId];
        var ready = rArgs.ready
        if (!wantRoom) {
            DEBUG(util.format("Room %d not exists", roomId));
            return;
        }
        DEBUG(util.format("Player %d request Ready", uid));
        wantRoom.onPlayerReqReady(uid, ready);
    },


    // 玩家请求退出房间
    onPlayerReqExitRoom: function(wsConn, rState, rArgs) {
        var uid = +rArgs.uid;
        var roomId = +rArgs.roomId;
        var wantRoom = this.rooms[roomId];
        if (!wantRoom) {
            DEBUG(util.format("Room %d not exists", roomId));
            return;
        }
        DEBUG(util.format("Player %d request Exit Room ", uid ));
        wantRoom.onPlayerReqExitRoom(uid);
    },


    //其他玩家发起解散房间请求
    onPlayerReqDestroyRoom: function (wsConn, rState, rArgs) {
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

    onPlayerRespDestroyRoom: function (wsConn, rState, rArgs) {
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
    onPlayerReqBroadcastMessage: function (wsConn, rState, rArgs) {
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

    // 广播玩家使用道具
    onPlayerReqUseProp: function (wsConn, rState, rArgs) {
        var uid = +rArgs.uid;
        var tarUid = +rArgs.tarUid;
        var roomId = +rArgs.roomId;
        var type = +rArgs.type;
        var wantRoom = this.rooms[roomId];
        if (!wantRoom) {
            DEBUG(util.format("Room %d not exists", roomId));
            return;
        }
        if (isNaN(type)) {
            DEBUG(util.format("type %d must be Number ", type));
            return;
        }
        DEBUG(util.format("Player %d request UseProp %d", uid, type));
        wantRoom.onPlayerReqUseProp(uid, tarUid, type);
    },
};

exports = module.exports = new SubGame();