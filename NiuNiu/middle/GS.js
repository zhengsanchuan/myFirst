/******************************************************************************
 * Author:      671643387
 * Created:     2016/10/25
 *****************************************************************************/

var util = require("util");
var ProtoID = require("../net/ProtoID.js").ProtoID;
var ProtoState = require("../net/ProtoID.js").ProtoState;
var HttpReq = require("../HttpRequest.js");
var BG = require("../net/BackGroundID.js");

///////////////////////////////////////////////////////////////////////////////
//>> 游戏服务器处理逻辑

exports.register = function (wsConn, rState, reqArgs) {
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
        code: ProtoID.SMSG_RESP_REGISTER,
        state: ProtoState.STATE_OK,
        args: {
            sid: newServ.getSid(),
        }
    });

    LOG(util.format("%d server register with g: %d, c: %d", newServ.getSid(), gameType, servCapacity));
};

exports.unregister = function (wsConn, rState, reqArgs) {
    var sid = +reqArgs.sid; // 服务器编号

    // 取消服务器注册
    GSMgr.rmServ(sid, wsConn);
    LOG(util.format("%d server unregistered", sid));
};

exports.incUsage = function (wsConn, rState, reqArgs) {
    var sid = +reqArgs.sid; // 服务器编号

    // 增加服务器用量
    GSMgr.incUsage(sid, wsConn);
};

exports.decUsage = function (wsConn, rState, reqArgs) {
    var sid = +reqArgs.sid; // 服务器编号

    // 减少服务器用量
    GSMgr.decUsage(sid, wsConn);
};

// 保存战报
exports.saveReports = function (wsConn, rState, reqArgs) {
    var players = reqArgs.players;
    players.forEach(function (report) {
        PlayerMgr.getPlayer(report.uid, function (player) {
            if (player) {
                player.saveReport(players);
                //todo
                HttpReq.requestGame(BG.ReqArgs.OUTCOME_API, player.uid, player.user.info.name, {record: report.score}, function (res) {
                    if (res.resultcode == BG.ProtoState.RECORD_SUCCESS) {
                        DEBUG(util.format("Notice BackGroud, %d, %d", player.uid, report.score));
                    }
                })
            }
        });
    });
};

// 扣除玩家卡片
exports.decCards = function (wsConn, rState, reqArgs) {
    if (Config.CostCard) {
        PlayerMgr.getPlayer(reqArgs.uid, function (player) {
            if (player) {
                player.decCards(reqArgs.cards);
                HttpReq.requestGame(BG.ReqArgs.ROOM_API, player.uid, player.user.info.name, {card: reqArgs.cards}, function (res) {
                    if (res.resultcode == BG.ProtoState.CARD_NORMAL) {
                        DEBUG(util.format("Notice BackGroud, %d, %d", player.uid, reqArgs.cards));
                    }
                })
            }
        });

        DEBUG(util.format("decCards, %d, %d", reqArgs.uid, reqArgs.cards));
    }
};

// 房间销毁
exports.onRoomDestroy = function (wsConn, rState, reqArgs) {
    var uids = reqArgs.uids || [];
    var scoreAdd = +reqArgs.scoreAdd;
    uids.forEach(function (uid) {
        PlayerMgr.getPlayer(uid, function (player) {
            if (player) {
                player.setOwnedRoomId(0);
                player.setJoinedRoomId(0);
                player.incScore(scoreAdd);
                if (scoreAdd != 0) {
                    player.incPlayedNum();
                }

                var user = player.user;
                player.getConn().sendMsg({
                    code: ProtoID.SMSG_SET_USER_INFO,
                    args: {
                        uid: player.uid,
                        info: user.info,
                        status: user.status,
                        marks: user.marks,
                        reports: user.reports || [],
                    },
                });

                DEBUG(util.format("Player %d exit room", uid));
            }
        });
    });
};