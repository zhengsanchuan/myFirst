/******************************************************************************
 * Author:      671643387
 * Created:     2016/10/26
 *****************************************************************************/

var util            = require("util");
var ProtoID         = require("../net/ProtoID.js").ProtoID;
var ProtoState      = require("../net/ProtoID.js").ProtoState;

///////////////////////////////////////////////////////////////////////////////
//>> 游戏相关逻辑

// 请求加入房间
exports.joinRoom = function(wsConn, rState, reqArgs){
    var roomId = +reqArgs.roomId;       // 房间号
    var uid = +reqArgs.uid;             // 玩家UID
    var name = reqArgs.name;            // 玩家昵称
    var headpic = reqArgs.headpic;      // 玩家头像

    DEBUG(util.format("Player %d req join room %d", uid, roomId));

    var SubGameLogic = GameMgr.getSubGame();
    if (!SubGameLogic.joinRoom(roomId, reqArgs, wsConn)) {
        wsConn.sendMsg({
            code    : ProtoID.SMSG_JOIN_ROOM,
            state   : ProtoState.STATE_GAME_JOIN_ROOM_FAILED,
        });
    } else {
        GameMgr.sendMgrMsg({
            code    : ProtoID.SMSG_REQ_JOINED_ROOM,
            args    : {
                uid     : uid,
                roomId  : roomId,
            },
        });
    }
};