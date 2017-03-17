/******************************************************************************
 * Author:      671643387
 * Created:     2016/10/25
 *****************************************************************************/

var ProtoID         = require("../net/ProtoID.js").ProtoID;

///////////////////////////////////////////////////////////////////////////////
//>> 中央服务器逻辑处理

function ProtoMap() {
    this.protoMap   = {};

    this.init();
}

ProtoMap.prototype = {

    // 初始化
    init: function() {
        // 初始化服务器管理消息
        var GSLogic = require("./GS.js");
        this.addProto(ProtoID.SMSG_REQ_REGISTER, GSLogic.register);
        this.addProto(ProtoID.SMSG_REQ_UNREGISTER, GSLogic.unregister);
        this.addProto(ProtoID.SMSG_REQ_INC_USAGE, GSLogic.incUsage);
        this.addProto(ProtoID.SMSG_REQ_DEC_USAGE, GSLogic.decUsage);
        this.addProto(ProtoID.SMSG_REQ_SAVE_REPORTS, GSLogic.saveReports);
        this.addProto(ProtoID.SMSG_REQ_DEC_PLAYER_CARDS, GSLogic.decCards);
        this.addProto(ProtoID.SMSG_REQ_DESTROY_ROOM, GSLogic.onRoomDestroy);

        // 初始化用户操作消息表
        var LogicLogic = require("./Login.js");
        this.addProto(ProtoID.CMSG_LOGIN, LogicLogic.login);

        // 游戏操作消息表
        var GameLogic = require("./Game.js");
        this.addProto(ProtoID.CMSG_CREATE_ROOM, GameLogic.createRoom);
        this.addProto(ProtoID.SMSG_RESP_CREATE_ROOM, GameLogic.onRoomCreated);
        this.addProto(ProtoID.CMSG_JOIN_ROOM, GameLogic.joinRoom);
        this.addProto(ProtoID.SMSG_REQ_JOINED_ROOM, GameLogic.onJoinedRoom);

        var UserLogic = require("./User.js");
        this.addProto(ProtoID.CMSG_QUERY_CARDS_DETAILS, UserLogic.queryCardsDetail);
        this.addProto(ProtoID.CMSG_GIVE_CARDS, UserLogic.giveCards);
        this.addProto(ProtoID.CMSG_UPDATE_CPWD, UserLogic.updateCardsPwd);
        this.addProto(ProtoID.CMSG_REQ_GAME_REPORTS, UserLogic.reqReports);
    },

    // 添加消息处理
    addProto: function(protoId, handler) {
        this.protoMap[protoId] = handler;
    },

    // 查找消息处理器
    findProtoHandler: function(protoId) {
        return this.protoMap[protoId];
    },
};

exports = module.exports = new ProtoMap();