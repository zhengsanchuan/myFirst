/******************************************************************************
 * Author:      zsc
 * Created:     2016/10/26
 *****************************************************************************/

// var util = require("util");
var Enum = require("./Enum.js");

///////////////////////////////////////////////////////////////////////////////
/**
 * 创建二维数组
 */

function twoDimensionalArray(xMax, yMax, flag) {
    var arr = new Array()
    for (var i = 0; i < xMax; i++) {
        arr[i] = new Array();
        for (var j = 0; j < yMax; j++) {
            if (flag == null) {
                arr[i][j] = 0;
            } else {
                arr[i][j] = flag;
            }
        }
    }
    return arr;
}

/**
 * 创建一维数组
 * @param xMax
 * @return {Array}
 */
function oneDimensionalArray(xMax) {
    var arr = new Array();
    for (var i = 0; i < xMax; i++) {
        arr[i] = 0;
    }
    return arr;
}

/**
 * 数组复制
 * @param source
 * @return {Array}
 */
function copyArray(source) {
    var array = oneDimensionalArray(source.length);
    for (var i = 0; i < source.length; i++) {
        array[i] = source[i];
    }
    return array;
}

/**
 * 数组复制
 * @param source
 * @param spos
 * @param target
 * @param tpos
 * @return {*}
 */
function copyArrays(source, spos, target, tpos) {
    if (source.length != target.length) {
        return null;
    }
    for (var i = spos; i < source.length; i++) {
        target[i] = source[i];
    }
    return target;
}

/**
 * 胡牌
 * @param handCards
 * @return {*}
 */
function huPai(handCards) {
    var miss = handCards.miss;
    var wanCount = handCards.getWanCount();
    var tongCont = handCards.getTongCount();
    var tiaoCount = handCards.getTiaoCount();
    if (miss == 0 && tongCont > 0) {
        return null;
    } else if (miss == 1 && tiaoCount > 0) {
        return null;
    } else if (miss == 2 && wanCount > 0) {
        return null;
    }

    var dui = isDui(handCards);

    //对对胡
    if (dui != null) {
        return dui;
    }
    //平胡
    if (isPinghu(handCards)) {
        return Enum.HuType.PING_HU;
        ;
    }
    return null;
}

/**
 * 计算平胡
 * @param handCards
 * @returns {boolean}
 */
function isPinghu(handCards) {
    var mjs = handCards.mjs;
    var typelen = handCards.mjs.length;
    for (var typeIndex = 0; typeIndex < typelen; typeIndex++) {
        for (var numIndex = 0; numIndex < 9; numIndex++) {
            if (mjs[typeIndex][numIndex] > 1) {
                //复制麻将,复制过程中会改变值,先复制再计算
                var mjCp = handCards.copyMjs();
                var typeMjs = mjCp[typeIndex];
                //去掉对子
                typeMjs[numIndex] -= 2;
                //能否组成4副牌
                if (threeGroupAble(typeMjs) && threeGroupAble(mjCp[(typeIndex + 1) % typelen]) && threeGroupAble(mjCp[(typeIndex + 2) % typelen])) {
                    // console.log('-----------------------Hu LE');
                    handCards.jiangNum = numIndex + 1;
                    return true;
                }
            }
        }
    }
    // console.log('Mei you -----------------------Hu LE');
    return false;
}

//幺九
function isDaiYao(handCards) {
    var mjs = handCards.mjs;
    var typelen = handCards.mjs.length;
    for (var typeIndex = 0; typeIndex < typelen; typeIndex++) {
        for (var numIndex = 0; numIndex < 9; numIndex++) {
            if (mjs[typeIndex][numIndex] > 1 && Enum.validYaoJiu(numIndex)) {
                //复制麻将,复制过程中会改变值,先复制再计算
                var mjCp = handCards.copyMjs();
                var typeMjs = mjCp[typeIndex];
                //去掉对子
                typeMjs[numIndex] -= 2;
                //能否组成4副牌
                if (threeGroupAble(typeMjs, Enum.SpecialMethod.YAO_JIU)
                    && threeGroupAble(mjCp[(typeIndex + 1) % typelen], Enum.SpecialMethod.YAO_JIU)
                    && threeGroupAble(mjCp[(typeIndex + 2) % typelen], Enum.SpecialMethod.YAO_JIU)) {
                    return true;
                }
            }
        }
    }
    return false;
}
//将对
function isJiangDui(handCards) {
    var mjs = handCards.mjs;
    var typelen = handCards.mjs.length;
    for (var typeIndex = 0; typeIndex < typelen; typeIndex++) {
        for (var numIndex = 0; numIndex < 9; numIndex++) {
            if (mjs[typeIndex][numIndex] > 1 && Enum.validJiang(numIndex)) {
                //复制麻将,复制过程中会改变值,先复制再计算
                var mjCp = handCards.copyMjs();
                var typeMjs = mjCp[typeIndex];
                //去掉对子
                typeMjs[numIndex] -= 2;
                //能否组成4副牌
                if (threeGroupAble(typeMjs, Enum.SpecialMethod.JIANG_DUI)
                    && threeGroupAble(mjCp[(typeIndex + 1) % typelen], Enum.SpecialMethod.JIANG_DUI)
                    && threeGroupAble(mjCp[(typeIndex + 2) % typelen], Enum.SpecialMethod.JIANG_DUI)) {
                    return true;
                }
            }
        }
    }
    return false;
}

/**
 * 七对和大对子判断
 * @param handCards
 * @return {*}
 */
function isDui(handCards) {
    var gangCount = 0;
    var duiCount = 0;
    var newMj = handCards.mjs;
    for (var typeIndex = 0; typeIndex < newMj.length; typeIndex++) {
        var tyMjs = newMj[typeIndex];
        for (var numIndex = 0; numIndex < tyMjs.length; numIndex++) {
            var count = tyMjs[numIndex];
            if (count == 4) {
                gangCount++;
                duiCount += 2;
            } else if (count == 3) {
                continue;
            } else if (count == 2) {
                duiCount++;
            } else if (count == 1) {
                return null;
            }
        }
    }
    if (gangCount == 1 && duiCount == 5) {
        return Enum.PaiType.LONG_QI_DUI;
    }
    if (duiCount == 7) {
        return Enum.PaiType.QI_DUI;
    }
    if (duiCount == 1 && gangCount == 0) {
        return Enum.PaiType.DA_DUI;
    }
    return null;
}


/**
 * 麻将是否满足3N条件
 * @param number
 */

function threeGroupAble(typeMjs, special) {
    for (var numIndex = 0; numIndex < 9; numIndex++) {
        if (!threeGroupAbl(typeMjs, numIndex, special)) {
            return false;
        }
    }
    return true;

}


/**
 * 同种麻将是否满足3n(3顺和3刻)的组合,0是满足3n的
 * @param typeMjs
 * @param numIndex
 */
function threeGroupAbl(typeMjs, numIndex, special) {
    var count = typeMjs[numIndex];
    if (count == 1) {
        return removeShun(typeMjs, numIndex, special);
    } else if (count == 2) {
        return removeShun(typeMjs, numIndex, special) && removeShun(typeMjs, numIndex, special);
    } else if (count == 3) {
        var mjBackup = copyArray(typeMjs);
        var shunAble = true;
        if (shunAble = (removeShun(typeMjs, numIndex, special)) && removeShun(typeMjs, numIndex, special) && removeShun(typeMjs, numIndex, special)) {
            for (var i = numIndex + 1; i < 9; i++) {
                if (!threeGroupAbl(typeMjs, i)) {
                    shunAble = false;
                    break;
                }
            }
        }
        if (!shunAble) {
            //todo 需要复制数组 mjBackup
            copyArrays(mjBackup, 0, typeMjs, 0);
            return removeKe(typeMjs, numIndex);
        }

    } else if (count == 4) {
        var mjBackup = copyArray(typeMjs);
        if (!removeShun(typeMjs, numIndex, special) && !removeShun(typeMjs, numIndex, special) && !removeShun(typeMjs, numIndex, special) && !removeShun(typeMjs, numIndex, special)) {
            //todo 需要复制数组 mjBackup
            copyArrays(mjBackup, 0, typeMjs, 0);
            return removeKe(typeMjs, numIndex) && removeShun(typeMjs, numIndex, special);
        }
    }

    return true;

}
/**
 * 移除三顺
 * @param typeMjs
 * @param numIndex
 * @return {boolean}
 */
function removeShun(typeMjs, numIndex, special) {
    if (numIndex > 6 || typeMjs[numIndex] == 0 || typeMjs[numIndex + 1] == 0 || typeMjs[numIndex + 2] == 0) {
        return false;
    }
    if (special == Enum.SpecialMethod.YAO_JIU && numIndex != 0 && numIndex != 6) {
        return false;
    } else if (special == Enum.SpecialMethod.JIANG_DUI) {
        return false;
    }
    typeMjs[numIndex]--;
    typeMjs[numIndex + 1]--;
    typeMjs[numIndex + 2]--;
    return true;
}
/**
 * 移除刻
 * @param typeMjs
 * @param numIndex
 */
function removeKe(typeMjs, numIndex, special) {
    if (typeMjs[numIndex] < 3) {
        return false;
    }
    if (special == Enum.SpecialMethod.YAO_JIU && !Enum.validYaoJiu(numIndex)) {
        return false;
    } else if (special == Enum.SpecialMethod.JIANG_DUI && !Enum.validJiang(numIndex)) {
        return false;
    }
    typeMjs[numIndex] -= 3;
    return true;
}

/**
 * 计算胡的倍数
 * @param huType
 * @return {number}
 */
function calcHuMultiple(cards, huPaiType) {
    var totalMultiple = 1;
    var maxLimit = 1;
    //最大番
    maxLimit <<= cards.owner.owner.maxLimit;
    var qys = cards.isQingYiSe();
    var jDui = cards.isJiangDui();
    var dY = cards.isDaiYao();
    var dDd = cards.isJingDiaoDiao();
    var mq = cards.isMenQing();
    var zhongZhang = cards.isZhongZhang();
    var playMethod3 = cards.owner.owner.playMeThod3;
    if (qys) {
        //清一色两翻
        totalMultiple <<= 2;
    }
    if (huPaiType == Enum.PaiType.QI_DUI || huPaiType == Enum.PaiType.QI_DUI) {
        //七对和龙七对统一两翻(因为龙七对很定有根或者杠后面会算翻)
        totalMultiple <<= 2;
    }
    if (huPaiType == Enum.PaiType.DA_DUI) {
        totalMultiple <<= 1;
    }
    //门清
    if (mq && Enum.validContains(playMethod3, Enum.PlayMethod.MEN_QING_ZHONG_ZHANG)) {
        totalMultiple <<= 1;
    }
    //中张
    if(zhongZhang && Enum.validContains(playMethod3, Enum.PlayMethod.MEN_QING_ZHONG_ZHANG)){
        totalMultiple <<= 1;
    }
    //幺九将对
    if ((jDui && Enum.validContains(playMethod3, Enum.PlayMethod.YAO_JIU_JIANG_DUI))||
        (dY && Enum.validContains(playMethod3, Enum.PlayMethod.YAO_JIU_JIANG_DUI))) {
        totalMultiple <<= 2;
    }
    //金钩钓(大单吊)
    if (dDd) {
        //大单吊肯定是大对子所以这里只加一番
        totalMultiple <<= 1;
    }
    //(海底捞)
    // if (cards.owner.owner.publicCards.isEmpty()) {
    //     totalMultiple <<= 1;
    // }
    //计算杠和根
    totalMultiple <<= (cards.getGangMj().length + cards.getGenCount());
    if (totalMultiple > maxLimit) {
        totalMultiple = maxLimit;
    }
    return totalMultiple;
}
exports.huPai = huPai;
exports.isPinghu = isPinghu;
exports.isDaiYao = isDaiYao;
exports.isJiangDui = isJiangDui;
exports.twoDimensionalArray = twoDimensionalArray;
exports.copyArray = copyArray;
exports.calcHuMultiple = calcHuMultiple;
exports.oneDimensionalArray = oneDimensionalArray;