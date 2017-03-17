/******************************************************************************
 * Author:      671643387
 * Created:     2016/10/25
 *****************************************************************************/

// 消息定义
exports.ProtoID = {
    'SMSG_REQ_REGISTER'             : 1001,     // 请求注册服务器
    'SMSG_RESP_REGISTER'            : 1002,     // 响应服务器注册请求
    'SMSG_REQ_UNREGISTER'           : 1003,     // 请求取消注册服务器
    'SMSG_RESP_UNREGISTER'          : 1004,     // 响应取消注册服务器
    'SMSG_REQ_INC_USAGE'            : 1005,     // 增加服务器用量
    'SMSG_RESP_INC_USAGE'           : 1006,     // 响应增加服务器用量
    'SMSG_REQ_DEC_USAGE'            : 1007,     // 减少服务器用量
    'SMSG_RESP_DEC_USAGE'           : 1008,     // 响应减少服务器用量
    'SMSG_REQ_CREATE_ROOM'          : 1009,     // 服务器请求创建房间
    'SMSG_RESP_CREATE_ROOM'         : 1010,     // 服务器响应创建房间
    'SMSG_REQ_JOINED_ROOM'          : 1011,     // 服务器请求加入房间
    'SMSG_REQ_SAVE_REPORTS'         : 1012,     // 服务器请求保存战报
    'SMSG_REQ_DEC_PLAYER_CARDS'     : 1013,     // 服务器请求扣除玩家卡片
    'SMSG_REQ_DESTROY_ROOM'         : 1014,     // 房间解散

    'SMSG_PING'                     : 10001,    // 服务器发送PING消息
    'SMSG_PONG'                     : 10002,    // 服务器响应PONG消息
    'CMSG_PONG'                     : 10003,    // 客户端响应PONG消息
    'SMSG_LOGIN'                    : 10004,    // 服务器响应的登录消息 {{state, args{uid,info,status,marks,reports,ip,notice}}}
    'CMSG_LOGIN'                    : 10005,    // 客户端发送的登录消息 {openid, name}
    'CMSG_CREATE_ROOM'              : 10006,    // 客户端发送的创建房间消息 {gameType, round, playMeThod}
    'SMSG_CREATE_ROOM'              : 10007,    // 服务器响应的创建房间消息
    'CMSG_JOIN_ROOM'                : 10008,    // 客户端请求加入房间 {roomId, uid, name, headpic}
    'SMSG_JOIN_ROOM'                : 10009,    // 服务器响应加入房间
    'SMSG_PLAYER_JOIN_ROOM'         : 10010,    // 服务器发送有玩家加入房间的消息
    'SMSG_SET_ROOM_INFO'            : 10011,    // 服务器广播房间信息
    'SMSG_SET_USER_INFO'            : 10012,    // 更新玩家数据
    'SMSG_QUERY_CARDS_DETAILS'      : 10014,    // 查询房卡记录
    'CMSG_GIVE_CARDS'               : 10015,    // 赠送房卡
    'CMSG_REQ_REPORT'               : 10014,    // 客户端请求战报{uid}
    'SMSG_REQ_REPORT'               : 10015,    // 服务端返回战报{state, args{reports}}
    'SMSG_GIVE_CARDS'               : 10016,    // 赠送房卡
    'CMSG_UPDATE_CPWD'              : 10017,    // 更新房卡密码
    'SMSG_UPDATE_CPWD'              : 10018,    // 更新房卡密码
    'CMSG_REQ_CARD'                 : 10019,    // 客户端请求房卡数量{uid}
    'SMSG_REQ_CARD'                 : 10020,    // 服务端返回房卡数量{state, args{card}}
};

// 消息状态
exports.ProtoState = {
    'STATE_OK': 0,        // 处理成功
    'STATE_FAILED': 1,        // 处理失败

    // 登录
    'STATE_LOGIN_FAILED': 100,      // 登录失败

    // 游戏
    'STATE_GAME_NOT_SUPPORT': 200,      // 游戏类型不支持
    'STATE_GAME_HAVE_A_ROOM': 201,      // 已经创建了一个房间
    'STATE_GAME_CREATE_ROOM_FAILED': 202,      // 创建房间失败
    'STATE_GAME_JOIN_ROOM_FAILED': 203,      // 加入房间失败
    'STATE_GAME_NOT_E_CARD': 204,      // 房卡不足
    'STATE_GAME_PLAYER_NOT_FOUND': 205,      // 玩家没找到

    'STATE_ROOM_NOT_EXISTS': 301,      // 房间不存在
    'STATE_ROOM_FULL': 302,      // 房间满
}

exports.MAX_PUBLIC_PROTOID          = 11000;    // 最大公共消息码