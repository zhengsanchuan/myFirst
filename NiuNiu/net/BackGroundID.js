
exports.ProtoState = {
    //房卡
    CARD_NORMAL: 30000, //请求正常，给你房卡信息
    CARD_NOT_ENOUGH: 30001,//道具不够，请及时充值
    NO_CARD: 30002, //没有道具

    //新增玩家
    SUCCESS: 40000, // 导入成功！
    ID_NULL: 40001, //用户id为空
    WX_NULL: 40002, //微信名字为空！
    IMPORT_FAIL: 40003,// 用户信息导入失败！
    NET_ERROR: 40003, // 网络错误！


    //道具
    PRO_NORMAL: 20000,// 请求正常。给你当前用户剩余道具详细
    USER_NOT_MATH: 20001, //用户信息不匹配
    PRO_NET_ERROR: 20002,// 网络错误


    //输赢记录
    RECORD_SUCCESS: 50000, //日志记录成功！
    USER_ID_NULL: 50001, //用户id为空
    WX_NAME_NULL: 50002, //微信名字为空！


};

//后台请求参数
exports.ReqArgs = {
    //房卡接口
    ROOM_API: 'Roomapi',
    //公告接口
    NOTICE_API: 'Noticeapi',
    //新增用户接口
    NUMBERADD_API: 'Numberaddapi',
    //道具接口
    PROP_API: 'Propapi',
    //用户游戏胜负记录接口
    OUTCOME_API: 'Outcomeapi',

}