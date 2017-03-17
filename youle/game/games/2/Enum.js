/******************************************************************************
 * Author:      671643387
 * Created:     2016/10/26
 *****************************************************************************/

///////////////////////////////////////////////////////////////////////////////
//>> 游戏变量

// 房间人数
exports.ROOM_PLAYER_NUM = 4;

// 房间局数
var RoomRound = [8, 16, 24];
exports.validRoomRound = function(round) {
    return RoomRound.indexOf(round) != -1;
};

// 中庄机制
var MasterType = [1, 2]; // X2 - 连中
exports.validRoomMasterType = function(type) {
    return MasterType.indexOf(type) != -1;
};

// 胡牌方式
exports.HupaiMethod = {
    'METHOD_7_PAIRS'    : 1,    // 七对胡
    'METHOD_2_LONG'     : 2,    // 双龙
    'METHOD_TIAN_HU'    : 3,    // 天胡
    'METHOD_DI_HU'      : 4,    // 地胡
    'METHOD_SAO_HU'     : 5,    // 扫胡
    'METHOD_HU_NORMAL'  : 6,    // 普通胡牌
    'METHOD_PAO_HU'     : 7,    // 跑胡
    'METHOD_PENG_HU'    : 8,    // 碰胡
    'METHOD_TLLH'       : 9,    // 提龙连胡
    'METHOD_5_HU'       : 10,   // 五福
    'METHOD_KAN_5HU'    : 11,   // 开局坎五胡
};

// 玩家提示
exports.PlayerTips = {
    'PLAYER_TIP_HU'     : 1,    // 胡牌
    'PLAYER_TIP_PENG'   : 2,    // 碰牌
    'PLAYER_TIP_CHI'    : 3,    // 吃牌
    'PLAYER_TIP_PAO'    : 4,    // 跑牌
    'PLAYER_TIP_CANCEL' : 5,    // 取消提示
};

// 出牌类型
exports.PlayedCardType = {
    'PLAYED_CARD_PUB'   : 1,    // 公牌
    'PLAYED_CARD_OWN'   : 2,    // 私牌
};

// 获取坎牌分数
exports.getKANscore = function(room, order) {
    return (order <= 2) ? 2 : 6;
};

// 获取提牌分数
exports.getTIscore = function(room, type) {
    return (type == 1) ? 10 : 8;
};

// 获取扫牌分数
exports.getSAOscore = function(room, order) {
    if (order <= 2) {
        return 2;
    } else {
        return 6;
    }
};

// 获取碰牌分数
exports.getPENGscore = function(room, order) {
    if (order <= 2) {
        return 1;
    } else {
        return 5;
    }
};

// 胡牌分数
exports.HuCardScores = {
    'HU_CARD_SCORE_7_PAIRS' : 40 - 4,
    'HU_CARD_SCORE_2_LONG'  : 40 - 4,
    'HU_CARD_SCORE_TIANHU'  : 10 - 4,
    'HU_CARD_SCORE_DIHU'    : 24,
    'HU_CARD_SCORE_SAOHU'   : 6,
    'HU_CARD_SCORE_PENGHU'  : 5,
    'HU_CARD_SCORE_PAOHU'   : 8,
    'HU_CARD_SCORE_TLLHU'   : 12 - 4,
    'HU_CARD_SCORE_5_HU'    : 40 - 4,
    'HU_CARD_SCORE_PINGHU'  : 4 - 4,
};

// 获取扫胡分数
exports.getSaohuScore = function(player) {
    var score = 0;

    // 计算扫的分数
    var saoNum = player.handCards.getSaoNum();
    if (saoNum <= 2) {
        score = 2;
    } else {
        score = 6;
    }

    // 加上基础分数
    return score;
};

// 获取碰分数
exports.getPenghuScore = function(player) {
    var score = 0;

    // 计算碰的分数
    var pengNum = player.handCards.getSaoNum() + 1;
    if (pengNum <= 2) {
        score = 1;
    } else {
        score = 5;
    }

    // 加上基础分数
    return score;
};

// 房间销毁倒计时
exports.ROOM_DESTROY_TIME = 300;

// 获取需要的卡片
exports.getCardsNeed = function(round) {
    return Config.ResConf[round];
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