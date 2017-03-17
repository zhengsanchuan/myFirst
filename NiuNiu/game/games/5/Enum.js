/******************************************************************************
 * Author:      zsc
 * Created:     2016/10/26
 *****************************************************************************/

///////////////////////////////////////////////////////////////////////////////
//>> 游戏变量

// 房间人数
exports.ROOM_PLAYER_NUM = 2;

//牌张数(牌面数,未乘数量)
exports.CARD_NUM = 13;

// 房间局数
var RoomRound = [4, 8, 16];
exports.validRoomRound = function (round) {
    return RoomRound.indexOf(round) != -1;
};

//玩法1
var PlayMeThod = [1, 2, 3];
//1:疯狂抢庄 2: 轮流坐庄 3：固定坐庄
exports.validPlayMeThod = function (round) {
    return PlayMeThod.indexOf(round) != -1;
};

//查找
exports.validContains = function (arr, value) {
    return arr.indexOf(value) != -1;
};

exports.GameState = {
    'READY': 1, //准备
    'BET': 2, //下注
    'SHOW_DOWN': 3, //摊牌
}
exports.NiuCardsType = {
    MEI_NIU: (0),			  //没牛
    NIU_1: (1),               //牛1
    NIU_2: (2),               //牛2
    NIU_3: (3),               //牛3
    NIU_4: (4),               //牛4
    NIU_5: (5),               //牛5
    NIU_6: (6),               //牛6
    NIU_7: (7),               //牛7
    NIU_8: (8),               //牛8
    NIU_9: (9),               //牛9
    NIU_NIU: (10),            //牛牛
    SI_HUA: (11),             //四花
    SI_ZHA: (12),             //四炸
    WU_HUA: (13),             //五花
    WU_XIAO: (14)             //五小
}

var cardsMutl = [1, 1, 1, 1, 1, 1, 1, 2, 3, 4, 5, 5, 6, 7, 8];

exports.getMutl = function (index) {
    return cardsMutl[index];
}

/**
 * 获取牛的类型
 * @param niu
 */
exports.getNiuType = function (niu) {
    for (var index in this.NiuCardsType) {
        if (niu == this.NiuCardsType[index]) {
            return this.NiuCardsType[index]
        }
    }
    return null;
}


// 房间销毁倒计时
exports.ROOM_DESTROY_TIME = 300;

//随机数
exports.RandomUtil = function GetRandomNum(Min, Max) {
    var Range = Max - Min;
    var Rand = Math.random();
    return (Min + Math.round(Rand * Range));
}


//判断是否连续
exports.IsSeries = function(arr){
    var b = true;
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] != i + 1) {
            b = false;
            break;
        }
    }
    return b;
}

//扣除房卡
exports.getCardsNeed = function(round) {
    if (round == 8) {
        return 1;
    } else if (round == 16) {
        return 2;
    } else {
        return 3;
    }
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