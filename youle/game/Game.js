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
    var errCode = SubGameLogic.joinRoom(roomId, reqArgs, wsConn);
    if (errCode != ProtoState.STATE_OK) {
        // 给客户端返回错误码
        wsConn.sendMsg({
            code    : ProtoID.SMSG_JOIN_ROOM,
            state   : errCode,
        });
    }

    // 通知中央服务器玩家加入房间
    GameMgr.sendMgrMsg({
        code    : ProtoID.SMSG_REQ_JOINED_ROOM,
        state   : errCode,
        args    : {
            uid     : uid,
            roomId  : roomId,
        },
    });
};