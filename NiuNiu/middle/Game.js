/******************************************************************************
 * Author:      671643387
 * Created:     2016/10/26
 *****************************************************************************/

var util            = require("util");
var ProtoID         = require("../net/ProtoID.js").ProtoID;
var ProtoState      = require("../net/ProtoID.js").ProtoState;

///////////////////////////////////////////////////////////////////////////////
//>> 游戏相关逻辑

// 创建游戏房间 - 客户端请求
exports.createRoom = function(wsConn, rState, reqArgs, player){
    var gameType = +reqArgs.gameType;

    // 查找游戏服务器
    var gameServ = GSMgr.getServer(gameType, false);
    if (!gameServ) {
        wsConn.sendMsg({
            code    : ProtoID.SMSG_CREATE_ROOM,
            state   : ProtoState.STATE_GAME_NOT_SUPPORT
        });
        ERROR(util.format("Player %d request create %d game room", player.uid, gameType));
        return;
    }

    // 检查玩家是否有足够的房卡
    if (Config.CostCard) {
        var keyArgs = +reqArgs.round;
        var needCard = gameServ.getCardRes(keyArgs);
        if (player.user.status.card < needCard) {
            wsConn.sendMsg({
                code    : ProtoID.SMSG_CREATE_ROOM,
                state   : ProtoState.STATE_GAME_NOT_E_CARD
            });
            ERROR(util.format("Player %d not have enught card", player.uid));
            return;
        }
    }

    // 检查玩家是否已经创建了房间
    if (player.hasOwnedRoom()) {
        wsConn.sendMsg({
            code    : ProtoID.SMSG_CREATE_ROOM,
            state   : ProtoState.STATE_GAME_HAVE_A_ROOM
        });
        DEBUG(util.format("Player %d already create a room", player.uid));
        return;
    }

    allocRoomId(function(err, roomId){
        if (err) {
            // 申请房间号失败
            wsConn.sendMsg({
                code    : ProtoID.SMSG_CREATE_ROOM,
                state   : ProtoState.STATE_GAME_CREATE_ROOM_FAILED
            });
        } else {
            // 将请求转到游戏服务器
            reqArgs["uid"] = player.uid;
            reqArgs["roomId"] = roomId;

            gameServ.sendMsg({
                code    : ProtoID.SMSG_REQ_CREATE_ROOM,
                args    : reqArgs
            });
        }
    });
};

// 房间创建成功 - 游戏服务器响应
exports.onRoomCreated = function(wsConn, rState, reqArgs){
    var uid = +reqArgs.creator;

    var serv = GSMgr.getServerByConn(wsConn);
    if (!serv) {
        ERROR("Game::onRoomCreated Get Server Failed - NEVER HAPPEN");
        return;
    }

    PlayerMgr.getPlayer(uid, function(player){
        if (player) {
            if (rState == ProtoState.STATE_OK) {
                GSMgr.addRoomId2Sid(reqArgs.roomId, serv.getSid());

                player.setOwnedRoomId(reqArgs.roomId);
                player.getConn().sendMsg({
                    code    : ProtoID.SMSG_CREATE_ROOM,
                    state   : ProtoState.STATE_OK,
                    args    : {
                        roomId  : reqArgs.roomId,
                    }
                });
                DEBUG(util.format("Player %d create room %d", player.uid, reqArgs.roomId));
            } else {
                player.getConn().sendMsg({
                    code    : ProtoID.SMSG_CREATE_ROOM,
                    state   : ProtoState.STATE_GAME_CREATE_ROOM_FAILED,
                });
            }
        } else {
            ERROR(util.format("Player %d not found", uid));
        }
    });
};

// 加入游戏房间 - 客户端请求
exports.joinRoom = function(wsConn, rState, reqArgs, player){
    var roomId = reqArgs.roomId;

    do {
        // TODO
        //if (player.hasJoinedRoom()) {
        //    break;
        //}

        var serv = GSMgr.getServerByRoomId(roomId);
        if (!serv) {
            break;
        }

        player.getConn().sendMsg({
            code    : ProtoID.SMSG_JOIN_ROOM,
            state   : ProtoState.STATE_OK,
            args    : {
                gsAddr      : serv.getAddress(),
                gsRoomId    : roomId,
            },
        });

        return;
    } while (false);

    player.getConn().sendMsg({
        code    : ProtoID.SMSG_JOIN_ROOM,
        state   : ProtoState.STATE_GAME_JOIN_ROOM_FAILED,
    });
};

// 加入游戏房间 - 游戏服务器请求
exports.onJoinedRoom = function(wsConn, rState, reqArgs){
    var uid = +reqArgs.uid;
    var roomId = +reqArgs.roomId;
    var serv = GSMgr.getServerByConn(wsConn);
    if (!serv) {
        return;
    }

    PlayerMgr.getPlayer(uid, function(player){
        if (player) {
            if (rState == ProtoState.STATE_OK) {
                player.setJoinedRoomId(roomId);
                DEBUG(util.format("Player %d joined room %d", player.uid, roomId));
            } else {
                player.setJoinedRoomId(0);
                player.setOwnedRoomId(0);
            }
        } else {
            ERROR(util.format("Player %d not found", uid));
        }
    });
};

///////////////////////////////////////////////////////////////////////////////

/**
 * 申请一个房间号
 * @param callback
 */
function allocRoomId(callback) {
    /*MongoWorld.findOneAndUpdate({_id: '_roomId'}, {$inc: {'ai': 1}}, {'returnOriginal': false}, function(err, result) {
        if (!err) {
            callback(null, +(result.value.ai));
        } else {
            callback(err);
        }
    }.bind(this));*/

    GlobalInfo.allocRoomId(callback);
}