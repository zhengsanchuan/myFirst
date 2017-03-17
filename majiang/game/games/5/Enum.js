/******************************************************************************
 * Author:      zsc
 * Created:     2016/10/26
 *****************************************************************************/

///////////////////////////////////////////////////////////////////////////////
//>> 游戏变量

// 房间人数
exports.ROOM_PLAYER_NUM = 4;

// 房间局数
var RoomRound = [8, 12];
exports.validRoomRound = function(round) {
    return RoomRound.indexOf(round) != -1;
};


//底分
var EndPoint = [0.5, 1, 2, 5, 10, 20];
exports.validEndPoint= function (round) {
    return EndPoint.indexOf(round) != -1;
};

//封顶限制(番数)
var MaxLimit = [3, 4, 5];
exports.validMaxLimit = function (round) {
    return MaxLimit.indexOf(round) != -1;
};

//玩法1
var PlayMeThod1 = [1, 2];
//1: 自摸加底 2: 自摸加番
exports.validPlayMeThod1 = function (round) {
    return PlayMeThod1.indexOf(round) != -1;
};
//玩法2
var PlayMeThod2 = [1, 2];
//1：点杠花(点炮) 2: 点杠花(自摸)
exports.validPlayMeThod2 = function (round) {
    return PlayMeThod2.indexOf(round) != -1;
};
//玩法3
var PlayMeThod3 = [0, 1, 2, 3, 4];
//1:幺九将对 2: 门清中张 3: 天地胡
exports.validPlayMeThod3 = function (round) {
    return PlayMeThod3.indexOf(round) != -1;
};

//是否包含
exports.validContains = function (arr, value) {
    return arr.indexOf(value) != -1;
};

// 将对
var Jiang = [1, 4, 7];
exports.validJiang = function (numIndex) {
    return Jiang.indexOf(numIndex) != -1;
};

//幺九
var YaoJiu = [0, 8];
exports.validYaoJiu = function (numIndex) {
    return YaoJiu.indexOf(numIndex) != -1;
};

//特殊牌型
exports.SpecialMethod = {
    YAO_JIU: 0,
    JIANG_DUI: 1,
};

exports.HupaiMulit = {};


// 可选玩法
exports.PlayMethod = {
    'HUAN_SAN_ZHANG': 0,    // 换三张
    'YAO_JIU_JIANG_DUI': 1,    // 妖九将对
    'MEN_QING_ZHONG_ZHANG': 2,    // 门清中张
    'TIAN_DI_HU': 3,    // 天地胡
    'DA_XIAO_YU': 4,    // 大小雨
};

// 可选玩法
//1: 自摸加底 2: 自摸加番
exports.PlayMethod1 = {
    'ZM_JIA_DI': 1,    // 自摸加底
    'ZM_JIA_FAN': 2,    // 自摸加番
};

// 可选玩法
//1：点杠花(点炮) 2: 点杠花(自摸)
exports.PlayMethod2 = {
    'DP_DIAN_GANG_HUA': 1,    // 点杠花(点炮)
    'ZM_DIAN_GANG_HUA': 2,    // 点杠花(自摸)
};

// 玩家提示
exports.PlayerTips = {
    'PLAYER_TIP_HU'     : 1,    // 胡牌
    'PLAYER_TIP_PENG'   : 2,    // 碰牌
    'PLAYER_TIP_CHI'    : 3,    // 吃牌
    'PLAYER_TIP_PAO'    : 4,    // 跑牌
    'PLAYER_TIP_CANCEL' : 5,    // 取消提示
};

exports.GangType = {
    'AN_GANG': 0,  //暗杠
    'ZHI_GANG': 1, //直杠
    'MIAN_XIA_GANG': 2, //面下杠
}

//结算详情
exports.RecordDetail = {
    AN_GANG: 0,  //暗杠
    MING_GANG: 1, //直杠
    BA_GANG: 2, //巴杠
    DIAN_GANG: 3, //点杠
    CHA_JIAO: 4, //查叫
    DIAN_PAO: 5, //点炮
    JIE_PAO: 6, //接炮
    ZI_MO: 7, //自摸
}

exports.GangTypeMuti = [2,2,1] ;


exports.GrabType = {
    'PASS': 1,  //过
    'PENG': 2, //碰
    'GANG': 3, //杠
    'HU': 4, //胡
}

//胡的类型
exports.HuType= {
    'PING_HU': 1,  //平胡
    'TIAN_HU': 2, //天胡
    'DI_HU': 3, //地胡
    'QIANG_GANG_HU': 4, //抢杠胡
    'GANG_SHANG_HUA': 5, //杠上花
    'GANG_SHANG_PAO': 6, //杠上炮
}

exports.HuTypeMuti =[0,1,1,1,1,1,1];


//牌的类型
exports.PaiType= {
    'DA_DUI': 0,  //大对子
    'QING_YI_SE': 1, //清一色
    'QI_DUI': 2, //七对
    'LONG_QI_DUI': 3, //龙七对
    'JING_DIAO_DIAO': 4, //金钓钓
    'DAI_YAO': 5, //带幺
    'JIANG_DUI': 6, //将对
    'HAI_DI_LAO': 7, //海底捞
    'JUE_ZHANG': 8, //绝张
    'ZI_MO_JIA_DI': 9, //自摸加底
}
//牌对应的翻数
//todo 配置对应的翻数
exports.PaiTypeMuti =[0,1,1,1,1,1,1,1,1];


exports.GrabState = {
    'GRABING': 1,  //正在抢
    'GRABED': 2, //已抢
    'PASS': 3, //过
}

exports.GameState = {
    'MISSING': 1,  //定缺
    'EXCHANGE': 2,  //换牌
    'PLAY': 3, //出牌
    'GRAB': 4, //抢牌
}

// 出牌类型
exports.PlayedCardType = {
    'PLAYED_CARD_PUB'   : 1,    // 公牌
    'PLAYED_CARD_OWN'   : 2,    // 私牌
};

// 房间销毁倒计时
exports.ROOM_DESTROY_TIME = 300;

// 获取需要的卡片
exports.getCardsNeed = function(round) {
    return Config.ResConf[round];
};

// 获取数组元素
exports.subList = function (arr, startIndex, num) {
    var rtnCards = [];
    while (num > 0) {
        rtnCards.push(arr[startIndex]);
        startIndex++;
        num -= 1;
    }
    return rtnCards;
};

// 获取积分
exports.getScore = function(round, ok) {
    if (!ok) {
        return 0;
    }

    if (round == 8) {
        return 1;
    } else if (round == 16) {
        return 2;
    } else {
        return 3;
    }
};


