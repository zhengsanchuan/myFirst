/******************************************************************************
 * Author:      671643387
 * Created:     2016/11/19
 *****************************************************************************/
var http = require('http');
var util            = require("util");
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
    PlayerMgr.getPlayer(uid, function (player) {
        if (player) {
            var user = player.user;
            endReq({
                name    : user.info.name,       // 玩家名字
                card    : user.status.card,     // 玩家房卡数量
                score   : user.status.score,    // 玩家积分
            }, httpRes);

        } else {
            endReq({
                ok: false,
            }, httpRes);
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

    PlayerMgr.delUser(uid, function (player) {
        if (player) {
            var user = player.user;
            endReq({
                name: user.info.name,       // 玩家名字
                uid: uid,
                ok: true,

            }, httpRes);
            delete PlayerMgr.players[uid];
        } else {
            endReq({
                ok: false,
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

    PlayerMgr.getPlayer(uid, function(player){
        if (player) {
            endReq({
                score   : player.user.status.score, // 玩家积分
            }, httpRes);
        } else {
            endReq({
                ok      : false,
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

    PlayerMgr.getPlayer(uid, function(player){
        if (player) {
            if (player.useScore(score)) {
                endReq({}, httpRes);
            } else {
                endReq({
                    ok      : false,
                }, httpRes);
            }
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

    PlayerMgr.getPlayer(uid, function(player){
        if (player) {
            endReq({
                card   : player.user.status.card, // 玩家房卡
            }, httpRes);
        } else {
            endReq({
                ok      : false,
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

    PlayerMgr.getPlayer(uid, function(player){
        if (player) {
            if (player.modifyCard(card)) {
                endReq({ok: true}, httpRes);
            } else {
                endReq({
                    ok      : false,
                }, httpRes);
            }
        }
    });
};

///////////////////////////////////////////////////////////////////////////////
//>> 帮助函数
function endReq(json, httpRes) {
    httpRes.end(JSON.stringify(json));
}
