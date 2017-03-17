/******************************************************************************
 * Author:      671643387
 * Created:     2016/10/25
 *****************************************************************************/

var ProtoID         = require("../net/ProtoID.js").ProtoID;

///////////////////////////////////////////////////////////////////////////////
//>> 游戏服务器逻辑处理

function ProtoMap() {
    this.protoMap   = {};

    this.init();
}

ProtoMap.prototype = {

    // 初始化
    init: function() {
        // 初始化与中央服务器通信逻辑
        var MiddleLogic = require("./Middle.js");
        this.addProto(ProtoID.SMSG_RESP_REGISTER, MiddleLogic.respRegServ);
        this.addProto(ProtoID.SMSG_RESP_UNREGISTER, MiddleLogic.respUnregServ);
        this.addProto(ProtoID.SMSG_REQ_CREATE_ROOM, MiddleLogic.createRoom);
        this.addProto(ProtoID.SMSG_REQ_START_MATCH, MiddleLogic.matchGame);

        // 游戏逻辑消息表
        var GameLogic = require("./Game.js");
        this.addProto(ProtoID.CMSG_JOIN_ROOM, GameLogic.joinRoom);
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