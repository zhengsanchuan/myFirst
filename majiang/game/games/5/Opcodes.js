/******************************************************************************
 * Author:      zsc
 * Created:     2016/10/26
 *****************************************************************************/

// 消息定义
exports.Opcodes = {
    //C2S
    'C2S_PLAYER_EXCHANGE': 15000,//玩家请求换牌 {uid, roomId, card[]}
    'C2S_PLAYER_MISSING': 15001,//玩家请求定缺 {uid, roomId, missType}
    'C2S_PLAYER_PLAY_CARD': 15002,//玩家请求出牌 {uid, roomId,card}
    'C2S_PLAYER_PENG_CARD': 15003,//玩家请求碰牌{uid, roomId}
    'C2S_PLAYER_GANG_CARD': 15004,//玩家请求杠牌{uid, roomId, card}
    'C2S_PLAYER_HU_CARD': 15005,//玩家请求胡牌 {uid, roomId}
    'C2S_PLAYER_PASS_CARD': 15006,//玩家请求过{uid, roomId}
    'C2S_PLAYER_CONTINUE': 15008,    // 玩家继续{uid, roomId}
    'C2S_PLAYER_DESTROY_ROOM': 15009,    // 解散房间(房主) {uid, roomId}
    'C2S_PLAYER_REQ_DESTROY_ROOM': 15010,    // 用户申请解散房间 {uid, roomId}
    'C2S_PLAYER_RESP_DESTROY_ROOM': 15011,    // 用户响应解散房间请求 {uid, roomId, ok}
    'C2S_PLAYER_REQ_BROADCAST_MSG': 15012,    // 请求广播消息 {uid, roomId, message}
    'C2S_PLAYER_USE_PROP': 15013,    // 玩家使用道具 {uid, roomId, type, tarUid}
    'C2S_PLAYER_EXIT_ROOM': 15015,    // 玩家退出 {uid, roomId, 玩家退出}
    'C2S_PLAYER_READY': 15016,    // 玩家准备 {uid, roomId, ready}

    //S2C
    'S2C_SET_PLAYER_CARDS': 15100, // 服务器发送设置玩家手牌 {cards}
    'S2C_PLAYER_MISSING': 15101,//返回玩家定缺 {playerIndex,miss}
    'S2C_PLAYER_PLAY_CARD': 15102,//返回玩家出牌 {playerIndex, card}
    'S2C_PLAYER_DRAW_CARD': 15105,//发送玩家摸牌(给摸牌玩家) { drawPlayer: , card,}
    'S2C_PLAYER_DREW_CARD': 15106,//发送玩家摸牌(给其他玩家) {drawPlayer}
    'S2C_PLAYER_GRABA_CARD': 15108,//玩家抢牌信息(提示玩家可以抢牌) {pengAble,gangAble,huAble}
    'S2C_PLAYER_TING_CARD': 15109,//玩家听牌消息 {tingInfo: {k : v}}
    'S2C_PLAYER_GRABA_CARD_INFO': 15110,//玩家抢牌结果 { type,pengPlayer,nextPlayercard}
    'S2C_PLAYER_HU_CARD_INFO': 15111,//玩家胡牌信息 {huPlayer,huType,huPaiType,totalMultiple,detail,isQgh,huedPlayer,isZm}
    'S2C_SET_REMAIN_CARD_NUM': 15118,    // 剩余公牌数量
    'S2C_SET_ROUND_SETTEMENT': 15121,    // 结算数据 {players}
    'S2C_SET_PLAYER_READY': 15123,    // 玩家就绪 {playerIndex}
    'S2C_SET_FROUND_SETTEMENT': 15124,    // 最终结算信息{players}
    'S2C_SET_ROOM_FINISHED': 15125,    // 房间完结 {}
    'S2C_SET_PLAYER_REQ_DROOM': 15126,    // 服务器通知有人解散房间 {playerIndex, destroyTime}
    'S2C_SET_PLAYER_RESP_DROOM': 15127,    // 玩家响应解散房间请求 {playerIndex, ok}
    'S2C_SET_PLAYER_OFFLINE': 15128,    // 玩家离线
    'S2C_SET_PLAYER_RECONNECT': 15129,    // 玩家重连
    'S2C_SET_PLAYER_ONLINE': 15130,    // 玩家上线
    'S2C_BROADCAST_MESSAGE': 15131,    // 广播消息
    'S2C_CHAT_MESSAGE': 15132,    // 广播玩家聊天消息
    'S2C_PLAYER_EXCHANGE': 15133,//返回玩家换牌 {playerIndex}
    'S2C_PLAYER_EXCHANGE_INFO': 15134,//返回玩家换牌 {cards}
    'S2C_PLAYER_EXIT_ROOM': 15035,    // 响应玩家退出 {playerIndex}
    'S2C_PLAYER_USE_PROP': 15036,    // 玩家使用道具 {playerIndex, tarPlayerIndex, type}
    'S2C_PLAYER_READY': 15037,    // 返回玩家准备 {players}
};
