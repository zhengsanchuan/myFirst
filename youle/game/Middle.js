/******************************************************************************
 * Author:      671643387
 * Created:     2016/10/26
 *****************************************************************************/

var util            = require("util");
var ProtoID         = require("../net/ProtoID.js").ProtoID;
var ProtoState      = require("../net/ProtoID.js").ProtoState;

///////////////////////////////////////////////////////////////////////////////
//>> 与中央服务器通信逻辑

// 服务器注册响应
exports.respRegServ = function(wsConn, rState, reqArgs){
    if (rState == ProtoState.STATE_OK) {
        GameMgr.setSid(+reqArgs.sid);
        GameMgr.setMiddleOk(true);
        LOG("Register server ok");
    } else {
        ERROR("Register server failed");
        setTimeout(function(){
            GameMgr.tryRegServ();
        }, 5000);
    }
};

// 服务器响应取消注册
exports.respUnregServ = function(wsConn, rState, reqArgs){
    if (rState == ProtoState.STATE_OK) {
        LOG("Unregister server ok");
    }
};

// 创建房间请求
exports.createRoom = function(wsConn, rState, reqArgs){
    var creator = reqArgs.uid;          // 房间创建者
    var gameType = reqArgs.gameType;    // 游戏类型
    var roomId = reqArgs.roomId;        // 房间号

    if (Config.GameType != gameType) {
        wsConn.sendMsg({
            code    : ProtoID.SMSG_RESP_CREATE_ROOM,
            state   : ProtoState.STATE_FAILED,
            args    : {
                creator : creator,
            }
        });
        ERROR(util.format("Middle request create %d game, but not support", gameType));
        return;
    }

    var SubGameLogic = GameMgr.getSubGame();
    var newRoom = SubGameLogic.createRoom(creator, roomId, reqArgs);
    if (newRoom) {
        wsConn.sendMsg({
            code    : ProtoID.SMSG_RESP_CREATE_ROOM,
            state   : ProtoState.STATE_OK,
            args    : {
                creator : creator,
                roomId  : newRoom.getId(),
            }
        });

        GameMgr.incUsage();
    } else {
        wsConn.sendMsg({
            code    : ProtoID.SMSG_RESP_CREATE_ROOM,
            state   : ProtoState.STATE_FAILED,
            args    : {
                creator : creator,
            }
        });

        ERROR(util.format("Create room failed, %d - %d", creator, gameType));
    }
};