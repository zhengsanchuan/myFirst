/******************************************************************************
 * Author:      zsc
 * Created:     2016/10/26
 *****************************************************************************/

// 消息定义
exports.Opcodes = {
    //C2S
    'C2S_PLAYER_CONTINUE': 15008,    // 玩家继续 {uid, roomId}
    'C2S_PLAYER_DESTROY_ROOM': 15009,    // 解散房间(房主) {uid, roomId}
    'C2S_PLAYER_REQ_DESTROY_ROOM': 15010,    // 用户申请解散房间 {uid, roomId}
    'C2S_PLAYER_RESP_DESTROY_ROOM': 15011,    // 用户响应解散房间请求 {uid, roomId, ok}
    'C2S_PLAYER_REQ_BROADCAST_MSG': 15012,    // 请求广播消息 {uid, roomId, message}
    'C2S_PLAYER_READY': 15013,        // 玩家准备 {uid, roomId, ready}
    'C2S_PLAYER_BET_POINT': 15014,    // 玩家下注 {uid, roomId, bet}
    'C2S_PLAYER_SHOW_DOWN': 15016,    // 玩家摊牌 {uid, roomId, cards}
    'C2S_PLAYER_EXIT_ROOM': 15015,    // 玩家退出 {uid, roomId}

    //S2C
    'S2C_SET_PLAYER_CARDS': 15100,       // 服务器发送设置玩家手牌 {cards}
    'S2C_PLAYER_BET_POINT': 15105,      //返回玩家下注{playerIndex, bet}
    'S2C_SET_ROUND_SETTEMENT': 15121,  // 结算数据 {{bet, score, randScore, cardInfo} * 4}
    'S2C_SET_PLAYER_READY': 15123,    //  玩家就绪{playerIndex}
    'S2C_SET_FROUND_SETTEMENT': 15124, // 最终结算信息 {{bet, score, randScore, cardInfo} * 4}
    'S2C_SET_ROOM_FINISHED': 15125,    // 房间完结{}
    'S2C_SET_PLAYER_REQ_DROOM': 15126, // 服务器通知有人解散房间 {playerIndex, destroyTime}
    'S2C_SET_PLAYER_RESP_DROOM': 15127, // 玩家响应解散房间请求 {playerIndex, ok}
    'S2C_SET_PLAYER_OFFLINE': 15128,    // 玩家离线 {playerIndex}
    'S2C_SET_PLAYER_RECONNECT': 15129,    // 玩家重连
    'S2C_SET_PLAYER_ONLINE': 15130,    // 玩家上线{playerIndex}
    'SMSG_BROADCAST_MESSAGE' :11033,    // 广播消息
    'S2C_BROADCAST_MESSAGE': 15131,    // 广播消息 {playerIndex, message}
    'S2C_PLAYER_READY': 15033,    // 返回玩家准备 {playerIndex, ready}
    'S2C_PLAYER_SHOW_DOWN': 15034,    // 返回玩家摊牌 {playerIndex, cardInfo, cardsType}
    'S2C_PLAYER_EXIT_ROOM': 15035,    // 响应玩家退出 {playerIndex}
    'S2C_PLAYER_READY_OVER': 15036,    // 返回所有玩家准备完成 {}
};
