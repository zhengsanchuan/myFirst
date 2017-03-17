/******************************************************************************
 * Author:      671643387
 * Created:     2016/10/25
 *****************************************************************************/

var util            = require("util");
var ProtoID         = require("../net/ProtoID.js").ProtoID;
var ProtoState      = require("../net/ProtoID.js").ProtoState;

var HttpReq         = require("../HttpRequest.js");
var BG              = require("../net/BackGroundID.js");

///////////////////////////////////////////////////////////////////////////////
//>> 用户登录逻辑

exports.login = function(wsConn, rState, reqArgs){
    var openid = reqArgs.openid;    // 平台ID

    var wx_name = reqArgs.name;
    //todo wx_name

    do {
        // 参数检查
        if (!openid) {
            break;
        }
        // 注册新账号
        PlayerMgr.addPlat(openid, wx_name, function (err, uid) {
            if (!err) {
                PlayerMgr.getPlayer(uid, function(player){
                    if (player) {
                        doLogin(wsConn, reqArgs, player);
                    } else {
                        sendStateFailed();
                        ERROR(util.format("Get player %d failed", uid));
                    }
                });
            } else {
                sendStateFailed();
            }
        });
        return;
    } while (false);

    sendStateFailed();

    function sendStateFailed() {
        wsConn.sendMsg({
            code    : ProtoID.SMSG_LOGIN,
            state   : ProtoState.STATE_LOGIN_FAILED,
        });
    }
};

function doLogin(wsConn, reqArgs, player) {
    var user = player.user;

    user.info.name = reqArgs.name;
    user.info.headpic = reqArgs.headpic;
    user.info.sex = reqArgs.sex;
    var notice = null;

    HttpReq.requestGame(BG.ReqArgs.NOTICE_API, player.uid, reqArgs.name, null, function (res) {
        notice = res.reason.content;
        wsConn.sendMsg({
            code: ProtoID.SMSG_LOGIN,
            state: ProtoState.STATE_OK,
            args: {
                uid: player.uid,
                info: user.info,
                status: user.status,
                marks: user.marks,
                reports: user.reports || [],
                ip: wsConn.getAddrString(),
                notice: notice,
            },
        });

        DEBUG(util.format("login - %j", user));
    })
}

exports.reqReport = function(wsConn, rState, reqArgs) {
    var uid = reqArgs.uid;
    PlayerMgr.getPlayer(uid, function(player){
        if (player) {
            var user = player.user;
            wsConn.sendMsg({
                code: ProtoID.SMSG_REQ_REPORT,
                state: ProtoState.STATE_OK,
                args: {
                    reports: user.reports || [],
                },
            });
        } else {
            // 发送响应
            wsConn.sendMsg({
                code: ProtoID.SMSG_REQ_REPORT,
                state: ProtoState.STATE_FAILED,
            });
            ERROR(util.format("Get player report %d failed", uid));
        }
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
            ERROR(util.format("Get player report %d failed", uid));
        }
    });
}
