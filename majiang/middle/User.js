/******************************************************************************
 * Author:      671643387
 * Created:     2016/10/25
 *****************************************************************************/

var ProtoID         = require("../net/ProtoID.js").ProtoID;
var ProtoState      = require("../net/ProtoID.js").ProtoState;
var util            = require("util");

exports.reqReport = function(wsConn, rState, reqArgs, player) {
    if(wsConn.id != player.wsConn.id){
        player.setNewConn(wsConn);
    }

    wsConn.sendMsg({
        code    : ProtoID.SMSG_REQ_REPORT,
        state   : ProtoState.STATE_OK,
        args    : {
            reports : player.getReportsDetail(),
        },
    });
}

//请求房卡
exports.reqCard = function(wsConn, rState, reqArgs) {
    var uid = reqArgs.uid;
    PlayerMgr.getPlayer(uid, function(player){
        if (player) {
            var user = player.user;
            wsConn.sendMsg({
                code: ProtoID.SMSG_REQ_CARD,
                state: ProtoState.STATE_OK,
                args: {
                    // reports: user.reports || [],
                    card: user.status.card,
                },
            });
        } else {
            // 发送响应
            wsConn.sendMsg({
                code: ProtoID.SMSG_REQ_CARD,
                state: ProtoState.STATE_FAILED,
            });
            ERROR(util.format("Get player card %d failed", uid));
        }
    });
}

/**
 * 查询每条战绩中的单局数据
 * @param wsConn
 * @param rState
 * @param reqArgs
 * @param player
 */
exports.queryItenReportsOneDate = function(wsConn, rState, reqArgs, player) {

    if(wsConn.id != player.wsConn.id){
        player.setNewConn(wsConn);
    }
    var roomId = +reqArgs.roomId;
    if(!roomId){
        wsConn.sendMsg({
            code    : ProtoID.SMSG_ITEM_REPOR_ONE_DATE,
            state   : ProtoState.STATE_ROOM_NOT_EXISTS,
            args    : {
            },
        });
        return;
    }
    wsConn.sendMsg({
        code    : ProtoID.SMSG_ITEM_REPOR_ONE_DATE,
        state   : ProtoState.STATE_OK,
        args    : {
            ItenReportsDate : player.getItenReportsOneDate(roomId),
        },
    });
};


/**
 * 查询每局战绩回放
 * @param wsConn
 * @param rState
 * @param reqArgs
 * @param player
 */
exports.queryOnePlayBackDate = function(wsConn, rState, reqArgs, player) {

    if(wsConn.id != player.wsConn.id){
        player.setNewConn(wsConn);
    }
    var roomId = +reqArgs.roomId;
    var curRound = +reqArgs.curRound;
    if(!roomId || !curRound){
        wsConn.sendMsg({
            code    : ProtoID.SMSG_ONE_PLAYBACK_DATE,
            state   : ProtoState.STATE_ROOM_NOT_EXISTS,
            args    : {
            },
        });
        return;
    }
    wsConn.sendMsg({
        code    : ProtoID.SMSG_ONE_PLAYBACK_DATE,
        state   : ProtoState.STATE_OK,
        args    : {
            onePlaybackDate : player.getPlayBackDate(roomId, curRound),
        },
    });
};