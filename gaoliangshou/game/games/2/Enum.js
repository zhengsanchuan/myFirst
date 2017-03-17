/******************************************************************************
 * Author:      zsc
 * Created:     2016/10/26
 *****************************************************************************/

///////////////////////////////////////////////////////////////////////////////
//>> 游戏变量

// 房间人数
exports.ROOM_PLAYER_NUM = 4;

//麻将张数(牌面数,未乘数量)
exports.CARD_NUM = 34;

//有风
exports.FENG = 34;
//无风
exports.NO_FENG = 30;

// 房间局数
var RoomRound = [8, 16,24];
exports.validRoomRound = function (round) {
    return RoomRound.indexOf(round) != -1;
};

// 将对
var Jiang = [2, 5, 8];
exports.validJiang = function (round, typIndex) {
    return Jiang.indexOf(round) != -1 && typIndex < 3;
};

//玩法1
var PlayMeThod = [1, 2, 3, 4, 5];
//1:屁股只能自摸 2: 可以买分 3：不要风 4: 承包制 5 :随意吃
exports.validPlayMeThod = function (round) {
    return PlayMeThod.indexOf(round) != -1;
};

//1,4,6 个鸟 抓码个数
var ZhuaMa = [0, 1, 4, 6];
//1:妖九将对 2: 门清中张 3: 天地胡
exports.validZhuaMa = function (round) {
    return ZhuaMa.indexOf(round) != -1;
};

//查找
exports.validContains = function (arr, value) {
    return arr.indexOf(value) != -1;
};

//1:随意吃 2: 可以买分 3：不要风 4: 承包制
exports.PlayMeThod = {
    CAN_EAT: 1,
    CAN_BUY: 2,
    NO_FENG: 3,
    CONTRACTOR: 4,
};

exports.GangType = {
    'AN_GANG': 0,  //暗杠
    'ZHI_GANG': 1, //直杠
    'MIAN_XIA_GANG': 2, //面下杠
}

//吃的类型
exports.EatType = {
    SMALL: 1,  //吃小(比吃的牌小)
    MIDDLE: 2, //吃中()
    BIG: 3, //吃大(比吃的牌大)
}

exports.GangTypeMuti = [1, 1, 1];


exports.GrabType = {
    'PASS': 1,  //过
    'PENG': 2, //碰
    'GANG': 3, //杠
    'HU': 4, //胡
    'EAT': 5,//吃
}

//胡的类型
exports.HuType = {
    'PING_HU': 1,  //平胡
    'TIAN_HU': 2, //天胡
    'DI_HU': 3, //地胡
    'QIANG_GANG_HU': 4, //抢杠胡
    'GANG_SHANG_HUA': 5, //杠上花
    'GANG_SHANG_PAO': 6, //杠上炮
}

exports.HuTypeMuti = [0, 1, 1, 1, 1, 1, 1];


//牌的类型
exports.PaiType = {
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
    'LAN_HU': 10, //烂胡
    'LUAN_JIANG': 11, //乱将
}
//牌对应的翻数
//todo 配置对应的翻数
exports.PaiTypeMuti = [0, 1, 1, 1, 1, 1, 1, 1, 1];


exports.GrabState = {
    'GRABING': 1,  //正在抢
    'GRABED': 2, //已抢
    'PASS': 3, //过
}

exports.GameState = {
    'PLAY': 1, //出牌
    'GRAB': 2, //抢牌
}

// 出牌类型
exports.PlayedCardType = {
    'PLAYED_CARD_PUB': 1,    // 公牌
    'PLAYED_CARD_OWN': 2,    // 私牌
};

// 房间销毁倒计时
exports.ROOM_DESTROY_TIME = 30;

//随机数
exports.RandomUtil = function GetRandomNum(Min, Max) {
    var Range = Max - Min;
    var Rand = Math.random();
    return (Min + Math.round(Rand * Range));
}


//判断是否连续
exports.IsSeries = function(arr, diff){
    var b = true;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] != i + diff) {
            b = false;
            break;
        }
    }
    return b;
}

//扣除房卡

// 获取需要的卡片
exports.getCardsNeed = function(round) {
    return Config.ResConf[round];
};


//数组去重
exports.removeDuplicatedItem = function(ar) {
    var ret = [];

    ar.forEach(function(e, i, ar) {
        if (ar.indexOf(e) === i) {
            ret.push(e);
        }
    });

    return ret;
}
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