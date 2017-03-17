/******************************************************************************
 * Author:      671643387
 * Created:     2016/11/19
 *****************************************************************************/
var http = require('http');
var util            = require("util");
var BG              = require("../net/BackGroundID.js");
///////////////////////////////////////////////////////////////////////////////
//>> GM模块
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
            ERROR(util.format("查询玩家[%d]成功", uid));

        } else {
            endReq({
                status: BG.ProtoState.PLAYER_NOT_EXIST,
            }, httpRes);
            ERROR(util.format("查询玩家[%d]失败,玩家不存在", uid));
        }
    });
};

/**
 * 删除玩家账号
 * @param query
 * @param httpReq
 * @param httpRes
 */
exports.delPlayer = function(query, httpReq, httpRes) {
    var uid = +query.uid;

    // PlayerMgr.delPlat(uid);

    PlayerMgr.findPlayer(uid, function (player) {
        if (player) {
            var user = player.user;
            endReq({
                name: user.info.name,       // 玩家名字
                uid: uid,
                status: BG.ProtoState.SUCCE,

            }, httpRes);
            ERROR(util.format("删除玩家[%d]充值月卡成功", uid));
            delete PlayerMgr.players[uid];
        } else {
            endReq({
                status: BG.ProtoState.PLAYER_NOT_EXIST,
            }, httpRes);
            ERROR(util.format("删除玩家[%d]失败,玩家不存在", uid));
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
        ERROR(util.format("查询玩家积分[%d]失败,参数不正确", uid));
        return;
    }

    PlayerMgr.findPlayer(uid, function(player){
        if (player) {
            endReq({
                status: BG.ProtoState.SUCCE,
                score   : player.user.status.score, // 玩家积分
            }, httpRes);
            ERROR(util.format("查询玩家积分[%d]成功", uid));
        } else {
            endReq({
                status: BG.ProtoState.PLAYER_NOT_EXIST,
            }, httpRes);
            ERROR(util.format("玩家[%d]充值月卡失败,玩家不存在", uid));
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
                ERROR(util.format("玩家[%d]使用积分成功", uid));
            } else {
                endReq({
                    status: BG.ProtoState.FAILED,
                }, httpRes);
                ERROR(util.format("玩家[%d]使用积分失败", uid));
            }
        }else{
            endReq({
                status: BG.ProtoState.PLAYER_NOT_EXIST,
            }, httpRes);
            ERROR(util.format("玩家[%d]使用积分失败，玩家不存在", uid));
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
        ERROR(util.format("查询玩家[%d]房卡失败, 参数不正确", uid));
        return;
    }

    PlayerMgr.findPlayer(uid, function(player){
        if (player) {
            endReq({
                status: BG.ProtoState.SUCCE,
                card   : player.user.status.card, // 玩家房卡
            }, httpRes);
            ERROR(util.format("查询玩家[%d]房卡成功", uid));
        } else {
            endReq({
                status: BG.ProtoState.PLAYER_NOT_EXIST,
            }, httpRes);
            ERROR(util.format("查询玩家[%d]房卡失败,玩家不存在", uid));
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
        ERROR(util.format("玩家[%d]充值失败,参数错误", uid, card));
        return;
    }
    PlayerMgr.findPlayer(uid, function(player){
        if (player) {
            if (player.modifyCard(card)) {
                endReq({
                    status: BG.ProtoState.SUCCE,
                }, httpRes);
                ERROR(util.format("玩家[%d]充值成功,充值数量[%d]", uid, card));
                //why? 玩家没有登录时,在数据库查找后,修改数据库值
                player.save();
            } else {
                endReq({
                    status: BG.ProtoState.FAILED,
                }, httpRes);
                ERROR(util.format("玩家[%d]充值失败,充值数量[%d]", uid, card));
            }
        }else{
            endReq({
                status: BG.ProtoState.PLAYER_NOT_EXIST,
            }, httpRes);
            ERROR(util.format("玩家[%d]充值失败,玩家不存在", uid, card));
        }
    });
};

/**
 * 增加月卡用户
 * @param query
 * @param httpReq
 * @param httpRes
 */
exports.modifyMonthCard = function(query, httpReq, httpRes) {
    var uid = +query.uid;
    var starTime = + query.startTime
    var endTime = + query.endTime
    if (isNaN(uid) || isNaN(starTime) || isNaN(endTime) || starTime > endTime) {
        endReq({
            status: BG.ProtoState.ARGS_ERROR,
        }, httpRes);
        ERROR(util.format("玩家[%d]充值月卡失败,参数不正确", uid));
        return;
    }
    PlayerMgr.findPlayer(uid, function(player){
        if (player) {
            if (player.modifyMonthCard(starTime, endTime)) {
                endReq({
                    status: BG.ProtoState.SUCCE,
                }, httpRes);
                ERROR(util.format("玩家[%d]充值月卡成功", uid));
                //why? 玩家没有登录时,在数据库查找后,修改数据库值
                player.save();
            } else {
                endReq({
                    status: BG.ProtoState.FAILED,
                }, httpRes);
                ERROR(util.format("玩家[%d]充值月卡失败", uid));
            }
        }else{
            endReq({
                status: BG.ProtoState.PLAYER_NOT_EXIST,
            }, httpRes);
            ERROR(util.format("玩家[%d]充值月卡失败,玩家不存在", uid));
        }
    });
};

///////////////////////////////////////////////////////////////////////////////
//>> 帮助函数
function endReq(json, httpRes) {
    httpRes.end(JSON.stringify(json));
}
