/******************************************************************************
 * Author:      671643387
 * Created:     2016/10/25
 *****************************************************************************/

var util            = require("util");
var ProtoID         = require("../net/ProtoID.js").ProtoID;
var HttpReq = require("../HttpRequest.js");
var ProtoState      = require("../net/ProtoID.js").ProtoState;
var BG = require("../net/BackGroundID.js");


///////////////////////////////////////////////////////////////////////////////
//>> 游戏服务器处理逻辑

exports.register = function(wsConn, rState, reqArgs){
    var servIp = reqArgs.ip;                // 服务器地址
    var servPort = reqArgs.port;            // 服务器端口
    var gameType = +reqArgs.gameType;       // 服务器支持的游戏类型
    var servCapacity = +reqArgs.capacity;   // 服务器容量
    var sid = +reqArgs.sid;                 // 服务器编号
    var rArgs = reqArgs.rArgs;              // 资源参数

    // 注册该服务器
    var newServ = GSMgr.addServ(sid, servIp, servPort, gameType, servCapacity, rArgs, wsConn);

    // 发送响应
    wsConn.sendMsg({
        code    : ProtoID.SMSG_RESP_REGISTER,
        state   : ProtoState.STATE_OK,
        args    : {
            sid : newServ.getSid(),
        }
    });

    LOG(util.format("%d server register with g: %d, c: %d", newServ.getSid(), gameType, servCapacity));
};

exports.unregister = function(wsConn, rState, reqArgs){
    var sid = +reqArgs.sid; // 服务器编号

    // 取消服务器注册
    GSMgr.rmServ(sid, wsConn);
    LOG(util.format("%d server unregistered", sid));
};

exports.incUsage = function(wsConn, rState, reqArgs){
    var sid = +reqArgs.sid; // 服务器编号

    // 增加服务器用量
    GSMgr.incUsage(sid, wsConn);
};

exports.decUsage = function(wsConn, rState, reqArgs){
    var sid = +reqArgs.sid; // 服务器编号

    // 减少服务器用量
    GSMgr.decUsage(sid, wsConn);
};

// 保存战报(回放数据)
exports.saveReports = function (wsConn, rState, reqArgs) {
    var players = reqArgs.players;
    var uids = reqArgs.uids;
    var playbackDate = reqArgs.playbackDate;
    var thisScore = 0;
    uids.forEach(function (uid) {
        PlayerMgr.getPlayer(uid, function (player) {
            if (player) {
                player.saveReport(players);
                player.savePlayBackDate(playbackDate);
            }
            var reportPlayer = players.reportsDate.player;

            reportPlayer.forEach(function (reportTemp) {
                if (reportTemp.uid == uid) {
                    thisScore = reportTemp.score;
                }
            });
            //todo
            HttpReq.requestGame(BG.ReqArgs.OUTCOME_API, player.uid, player.user.info.name, {record: thisScore}, function (res) {
                if (res.resultcode == BG.ProtoState.RECORD_SUCCESS) {
                    DEBUG(util.format("saveReports , %d, %d", reqArgs.uid, 0));
                }
            });
            thisScore = 0;
        });
    });
};

// 扣除玩家卡片
exports.decCards = function (wsConn, rState, reqArgs) {
    if (Config.CostCard) {
        var users = reqArgs;
        for (var userId in users) {
            if (users[userId] > 0) {
                PlayerMgr.getPlayer(userId, function (player) {
                    if (player) {
                        player.decCards(users[userId]);
                        HttpReq.requestGame(BG.ReqArgs.ROOM_API, player.uid, player.user.info.name, {card: users[userId]}, function (res) {
                            if (res.resultcode == BG.ProtoState.CARD_NORMAL) {
                                DEBUG(util.format("Notice BackGroud Desc Cards, %d, %d", player.uid, users[userId]));
                            }
                        })
                        DEBUG(util.format("decCards, %d, %d", userId, users[userId]));
                    }
                });

            }
        }
        // DEBUG(util.format("decCards, %d, %d", reqArgs.uid, reqArgs.cards));
    }
};

// 房间销毁
exports.onRoomDestroy = function(wsConn, rState, reqArgs) {
    var uids = reqArgs.uids || [];
    uids.forEach(function(uid){
        PlayerMgr.getPlayer(uid, function(player){
            if (player) {
                player.setOwnedRoomId(0);
                player.setJoinedRoomId(0);
                DEBUG(util.format("Player %d exit room", uid));
            }
        });
    });
};