/******************************************************************************
 * Author:      671643387
 * Created:     2016/10/26
 *****************************************************************************/

// 消息定义
exports.Opcodes = {
    'SMSG_SET_PLAYER_CARDS'         : 11000,    // 服务器发送设置玩家手牌

    'SMSG_SET_PLAYER_KAN_CARD'      : 11001,    // 玩家坎牌
    'SMSG_SET_PLAYER_TI_CARD'       : 11002,    // 玩家提牌
    'SMSG_SET_PLAY_CARD_PLAYER'     : 11003,    // 设置出牌玩家
    'SMSG_SET_PLAYER_SAO_CARD'      : 11004,    // 玩家扫牌
    'SMSG_SET_PLAYED_CARD'          : 11005,    // 玩家出牌
    'SMSG_SET_TIPS'                 : 11006,    // 提示
    'CMSG_PLAYER_PENG_CARD'         : 11007,    // 玩家碰牌
    'SMSG_PLAYER_PENG_CARD'         : 11008,    // 服务器响应玩家碰牌请求
    'CMSG_PLAYER_PLAY_CARD'         : 11009,    // 玩家出手牌
    'SMSG_SET_PLAYER_PENG_CARD'     : 11010,    // 玩家碰牌
    'CMSG_PLAYER_CHI_CARD'          : 11011,    // 玩家吃牌
    'SMSG_SET_PLAYER_CHI_CARD'      : 11012,    // 服务器推送玩家吃牌
    'CMSG_PLAYER_HU_CARD'           : 11013,    // 玩家胡牌
    'CMSG_PLAYER_PASS'              : 11014,    // 玩家跳过
    'SMSG_SET_PLAYER_PLAY_CARD'     : 11015,    // 要求玩家出牌
    'SMSG_SET_REMAIN_CARD_NUM'      : 11016,    // 剩余公牌数量
    'SMSG_SET_ROUND_HUANGZHUANG'    : 11017,    // 黄庄
    'SMSG_SET_PLAYER_HU_CARD'       : 11018,    // 玩家胡牌
    'SMSG_SET_ROUND_SETTEMENT'      : 11019,    // 结算数据
    'SMSG_SET_PLAYER_PAO_CARD'      : 11020,    // 玩家跑牌
    'CMSG_PLAYER_CONTINUE'          : 11021,    // 玩家继续
    'SMSG_SET_PLAYER_READY'         : 11022,    // 玩家就绪
    'SMSG_SET_FROUND_SETTEMENT'     : 11023,    // 最终结算信息
    'SMSG_SET_ROOM_FINISHED'        : 11024,    // 房间完结
    'CMSG_PLAYER_DESTROY_ROOM'      : 11025,    // 解散房间
    'CMSG_PLAYER_REQ_DESTROY_ROOM'  : 11026,    // 用户申请解散房间
    'SMSG_SET_PLAYER_REQ_DROOM'     : 10027,    // 服务器通知有人解散房间
    'CMSG_PLAYER_RESP_DESTROY_ROOM' : 11028,    // 用户响应解散房间请求
    'SMSG_SET_PLAYER_RESP_DROOM'    : 11029,    // 玩家响应解散房间请求
    'SMSG_SET_PLAYER_OFFLINE'       : 11030,    // 玩家离线
    'SMSG_SET_PLAYER_RECONNECT'     : 11031,    // 玩家重连
    'SMSG_SET_PLAYER_ONLINE'        : 11032,    // 玩家上线
    'SMSG_BROADCAST_MESSAGE'        : 11033,    // 广播消息
    'CMSG_PLAYER_REQ_BROADCAST_MSG' : 11034,    // 请求广播消息
    'SMSG_SET_PLAYER_ZHUANGJIA'     : 11035,    // 玩家当庄家
    'SMSG_REQ_PLAYER_5HU_WARNING'   : 11036,    // 5胡报警
    'CMSG_PLAYER_RESP_5HU_WARNING'  : 11037,    // 玩家响应5胡报警
    'SMSG_SET_PLAYER_5HU_WARNING'   : 11038,    // 广播的5胡报警信息
    'CMSG_PLAYER_REQ_EXIT_ROOM'     : 11039,    // 玩家退出房间
    'SMSG_SET_PLAYER_EXIT_ROOM'     : 11040,    // 玩家退出房间
};