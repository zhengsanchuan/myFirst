/******************************************************************************
 * Author:      zsc
 * Created:     2016/10/26
 *****************************************************************************/

// 消息定义
exports.Opcodes = {
    //C2S
    'C2S_PLAYER_MISSING': 15001,//玩家请求定缺
    'C2S_PLAYER_PLAY_CARD': 15002,//玩家请求出牌
    'C2S_PLAYER_PENG_CARD': 15003,//玩家请求碰牌
    'C2S_PLAYER_GANG_CARD': 15004,//玩家请求杠牌
    'C2S_PLAYER_HU_CARD': 15005,//玩家请求胡牌
    'C2S_PLAYER_PASS_CARD': 15006,//玩家请求过
    'C2S_PLAYER_EAT_CARD': 15007,//玩家请求吃牌
    'C2S_PLAYER_CONTINUE': 15008,    // 玩家继续
    'C2S_PLAYER_DESTROY_ROOM': 15009,    // 解散房间(房主)
    'C2S_PLAYER_REQ_DESTROY_ROOM': 15010,    // 用户申请解散房间
    'C2S_PLAYER_RESP_DESTROY_ROOM': 15011,    // 用户响应解散房间请求
    'C2S_PLAYER_REQ_BROADCAST_MSG': 15012,    // 请求广播消息
    'C2S_PLAYER_READY': 15013,    // 玩家准备 {uid, roomId}
    'C2S_PLAYER_BUY_POINT': 15014,    // 玩家买分 {uid, roomId, point}

    'C2S_PLAYER_EXIT_ROOM': 15015,    // 玩家退出 {uid, roomId, 玩家退出}


    //S2C
    'S2C_SET_PLAYER_CARDS': 15100, // 服务器发送设置玩家手牌
    'S2C_PLAYER_MISSING': 15101,//返回玩家定缺
    'S2C_PLAYER_PLAY_CARD': 15102,//返回玩家出牌
    'S2C_PLAYER_PENG_CARD': 15103,//返回玩家碰牌
    'S2C_PLAYER_GANG_CARD': 15104,//返回玩家杠牌
    'S2C_PLAYER_DRAW_CARD': 15105,//发送玩家摸牌(给摸牌玩家)
    'S2C_PLAYER_DREW_CARD': 15106,//发送玩家摸牌(给其他玩家)
    'S2C_PLAYER_GRABA_CARD': 15108,//玩家抢牌信息(提示玩家可以抢牌)
    'S2C_PLAYER_TING_CARD': 15109,//玩家听牌消息
    'S2C_PLAYER_GRABA_CARD_INFO': 15110,//玩家抢牌结果
    'S2C_PLAYER_HU_CARD_INFO': 15111,//玩家胡牌信息
    'S2C_SET_REMAIN_CARD_NUM': 15118,    // 剩余公牌数量
    'S2C_SET_ROUND_SETTEMENT': 15121,    // 结算数据
    'S2C_SET_PLAYER_READY': 15123,    // 玩家就绪
    'S2C_SET_FROUND_SETTEMENT': 15124,    // 最终结算信息
    'S2C_SET_ROOM_FINISHED': 15125,    // 房间完结
    'S2C_SET_PLAYER_REQ_DROOM': 15126,    // 服务器通知有人解散房间
    'S2C_SET_PLAYER_RESP_DROOM': 15127,    // 玩家响应解散房间请求
    'S2C_SET_PLAYER_OFFLINE': 15128,    // 玩家离线
    'S2C_SET_PLAYER_RECONNECT': 15129,    // 玩家重连
    'S2C_SET_PLAYER_ONLINE': 15130,    // 玩家上线
    'SMSG_BROADCAST_MESSAGE'        : 11033,    // 广播消息
    'S2C_BROADCAST_MESSAGE': 15131,    // 广播消息

    'S2C_PLAYER_READY': 15033,    // 返回玩家准备 {players}
    'S2C_PLAYER_BUY_POINT': 15034, //返回玩家买分 {playerIndex, point}

    'S2C_PLAYER_EXIT_ROOM': 15035,    // 响应玩家退出 {playerIndex}
};
