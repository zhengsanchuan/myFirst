/******************************************************************************
 * Author:      671643387
 * Created:     2016/11/19
 *****************************************************************************/

///////////////////////////////////////////////////////////////////////////////
//>> GM模块
var BG              = require("../net/BackGroundID.js");
/**
 * 查询玩家数据
 * @param query
 * @param httpReq
 * @param httpRes
 */
exports.queryUser = function(query, httpReq, httpRes) {
    var uid = +query.uid;
    PlayerMgr.findPlayer(uid, function (player) {
        if (player) {
            var user = player.user;
            endReq({
                name: user.info.name,       // 玩家名字
                card: user.status.card,     // 玩家房卡数量
                score: user.status.score,    // 玩家积分
                monthCard: user.status.monthCard, //玩家月卡
                status: BG.ProtoState.SUCCE,
            }, httpRes);

        } else {
            endReq({
                status: BG.ProtoState.PLAYER_NOT_EXIST,
            }, httpRes);
        }
    });
};

/**
 * 查询玩家积分
 * @param query
 * @param httpReq
 * @param httpRes
 */
exports.queryScore = function(query, httpReq, httpRes) {
    var uid = +query.uid;
    if (isNaN(uid)) {
        endReq({
            status: BG.ProtoState.ARGS_ERROR,
        }, httpRes);
        return;
    }

    PlayerMgr.findPlayer(uid, function(player){
        if (player) {
            endReq({
                status: BG.ProtoState.SUCCE,
                score   : player.user.status.score, // 玩家积分
            }, httpRes);
        } else {
            endReq({
                status: BG.ProtoState.PLAYER_NOT_EXIST,
            }, httpRes);
        }
    });
};

/**
 * 使用玩家积分
 * @param query
 * @param httpReq
 * @param httpRes
 */
exports.useScore = function(query, httpReq, httpRes) {
    var uid = +query.uid;
    var score = +query.score;

    PlayerMgr.findPlayer(uid, function(player){
        if (player) {
            if (player.useScore(score)) {
                endReq({
                    status: BG.ProtoState.SUCCE,
                    score   : player.user.status.score, // 玩家积分
                }, httpRes);
            } else {
                endReq({
                    status: BG.ProtoState.FAILED,
                }, httpRes);
            }
        }else{
            endReq({
                status: BG.ProtoState.PLAYER_NOT_EXIST,
            }, httpRes);
        }
    });
};

/**
 * 查询玩家房卡
 * @param query
 * @param httpReq
 * @param httpRes
 */
exports.queryCard = function(query, httpReq, httpRes) {
    var uid = +query.uid;
    if (isNaN(uid)) {
        endReq({
            status: BG.ProtoState.ARGS_ERROR,
        }, httpRes);
        return;
    }

    PlayerMgr.findPlayer(uid, function(player){
        if (player) {
            endReq({
                status: BG.ProtoState.SUCCE,
                card   : player.user.status.card, // 玩家房卡
            }, httpRes);
        } else {
            endReq({
                status: BG.ProtoState.PLAYER_NOT_EXIST,
            }, httpRes);
        }
    });
};

/**
 * 修改玩家房卡
 * @param query
 * @param httpReq
 * @param httpRes
 */
exports.modifyCard = function(query, httpReq, httpRes) {
    var uid = +query.uid;
    var card = +query.card;
    if (isNaN(uid) || isNaN(card)) {
        endReq({
            status: BG.ProtoState.ARGS_ERROR,
        }, httpRes);
        return;
    }
    PlayerMgr.findPlayer(uid, function(player){
        if (player) {
            if (player.modifyCard(card)) {
                endReq({
                    status: BG.ProtoState.SUCCE,
                }, httpRes);
                //why? 玩家没有登录时,在数据库查找后,修改数据库值
                player.save();
            } else {
                endReq({
                    status: BG.ProtoState.FAILED,
                }, httpRes);
            }
        }else{
            endReq({
                status: BG.ProtoState.PLAYER_NOT_EXIST,
            }, httpRes);
        }
    });
};

///////////////////////////////////////////////////////////////////////////////
//>> 帮助函数
function endReq(json, httpRes) {
    httpRes.end(JSON.stringify(json));
}