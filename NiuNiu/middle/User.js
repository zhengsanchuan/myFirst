/******************************************************************************
 * Author:      671643387
 * Created:     2016/10/25
 *****************************************************************************/

var ProtoID         = require("../net/ProtoID.js").ProtoID;
var ProtoState      = require("../net/ProtoID.js").ProtoState;

/**
 * 查询卡片详情
 * @param wsConn
 * @param rState
 * @param reqArgs
 * @param player
 */
exports.queryCardsDetail = function(wsConn, rState, reqArgs, player) {
    wsConn.sendMsg({
        code    : ProtoID.SMSG_QUERY_CARDS_DETAILS,
        state   : ProtoState.STATE_OK,
        args    : {
            details : player.getCardsDetail(),
        },
    });
};

/**
 * 赠送房卡
 * @param wsConn
 * @param rState
 * @param reqArgs
 * @param player
 */
exports.giveCards = function(wsConn, rState, reqArgs, player) {
    var cards = +reqArgs.cards;
    var toUid = +reqArgs.toUid;
    var curPwd = reqArgs.curPwd;

    if ((cards <= 0) || (curPwd != player.user.cardsPwd)) {
        wsConn.sendMsg({
            code    : ProtoID.SMSG_GIVE_CARDS,
            state   : ProtoState.STATE_FAILED,
        });
        return;
    }

    PlayerMgr.getPlayer(toUid, function(toPlayer){
        if (toPlayer) {
            if (player.modifyCard(0 - cards)) {
                // 赠送成功
                player.addCardsRecord(cards, toPlayer.uid, toPlayer.user.info.name);
                toPlayer.modifyCard(cards);
                wsConn.sendMsg({
                    code    : ProtoID.SMSG_GIVE_CARDS,
                    state   : ProtoState.STATE_OK,
                });
            } else {
                // 卡片不足
                wsConn.sendMsg({
                    code    : ProtoID.SMSG_GIVE_CARDS,
                    state   : ProtoState.STATE_GAME_NOT_E_CARD,
                });
            }
        } else {
            // 没有找到目标玩家
            wsConn.sendMsg({
                code    : ProtoID.SMSG_GIVE_CARDS,
                state   : ProtoState.STATE_GAME_PLAYER_NOT_FOUND,
            });
        }
    });
};

/**
 * 更新房卡密码
 * @param wsConn
 * @param rState
 * @param reqArgs
 * @param player
 */
exports.updateCardsPwd = function(wsConn, rState, reqArgs, player) {
    var curPwd = reqArgs.curPwd;
    var newPwd = reqArgs.newPwd;

    if (player.updateCardsPwd(curPwd, newPwd)) {
        wsConn.sendMsg({
            code    : ProtoID.SMSG_UPDATE_CPWD,
            state   : ProtoState.STATE_OK,
        });
    } else {
        wsConn.sendMsg({
            code    : ProtoID.SMSG_UPDATE_CPWD,
            state   : ProtoState.STATE_FAILED,
        });
    }
};