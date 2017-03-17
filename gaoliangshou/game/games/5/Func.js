/******************************************************************************
 * Author:      zsc
 * Created:     2016/10/26
 *****************************************************************************/

// var util = require("util");
var Enum = require("./Enum.js");
var FuncSpcial = require("./FuncSpcial.js");

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
    return tpos;
}

/**
 * 胡牌
 * @param handCards
 * @return {*}
 */
function huPai(handCards) {
    if (handCards.mjs[3][0] == 0 || !Enum.validContains(handCards.owner.owner.playMeThod, Enum.PlayMeThod.RASCAL)) {
        //非癞子算法
        return FuncSpcial.huPai(handCards);
    }

    //癞子算法
    var dui = isDui(handCards);

    //对对胡
    if (dui != null) {
        return dui;
    }
    //平胡
    if (isPinghu(handCards)) {
        return Enum.HuType.PING_HU;
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
            if (mjs[typeIndex][numIndex] > 0) {
                //复制麻将,复制过程中会改变值,先复制再计算
                var mjCp = handCards.copyMjs();
                var typeMjs = mjCp[typeIndex];
                var zhongMjs = mjCp[3];
                //去掉对子
                if (typeMjs[numIndex] > 1) {
                    typeMjs[numIndex] -= 2;
                } else {
                    typeMjs[numIndex]--;
                    zhongMjs[0]--;
                }
                if (threeGroupAble(typeMjs, zhongMjs, typeIndex) &&
                    threeGroupAble(mjCp[(typeIndex + 1) % typelen], zhongMjs, (typeIndex + 1) % typelen) &&
                    threeGroupAble(mjCp[(typeIndex + 2) % typelen], zhongMjs, (typeIndex + 2) % typelen) &&
                    threeGroupAble(mjCp[(typeIndex + 3) % typelen], zhongMjs, (typeIndex + 3) % typelen)) {
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
        if (typeIndex > 3) {
            break;
        }
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
        if (Enum.validContains(handCards.owner.owner.playMeThod, Enum.PlayMeThod.CAN_SEVER_PAIRE)) {
            return Enum.PaiType.LONG_QI_DUI;
        }else {
            return null;
        }
    }
    if (duiCount == 7) {
        if (Enum.validContains(handCards.owner.owner.playMeThod, Enum.PlayMeThod.CAN_SEVER_PAIRE)) {
            return Enum.PaiType.QI_DUI;
        } else {
            return null;
        }
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

function threeGroupAble(typeMjs, zhongMjs, typeIndex) {
    for (var numIndex = 0; numIndex < 9; numIndex++) {
        if (!threeGroupAbl(typeMjs, numIndex, zhongMjs, typeIndex)) {
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
function threeGroupAbl(typeMjs, numIndex, zhongMjs, typeIndex) {
    var count = typeMjs[numIndex];
    if (typeIndex == 3 && numIndex == 0) {
        //红中不验证
        return true;
    }
    if (count == 1) {
        if (typeIndex == 3 && numIndex != 0) {
            return removeKe(typeMjs, numIndex, zhongMjs)
        }

        if (removeShun(typeMjs, numIndex, zhongMjs) || removeKe(typeMjs, numIndex, zhongMjs)) {
            return true;
        } else {
            return false;
        }
    } else if (count == 2) {
        if (typeIndex == 3 && numIndex != 0) {
            return removeKe(typeMjs, numIndex, zhongMjs)
        }
        //两张要么组成刻,要么组成两顺 (如果两顺没有组成成功, 再去尝试去组成刻. 此时癞子的牌已经消耗,需要还原)
        var mjBackup = copyArray(typeMjs);
        var zhongMjsBack = copyArray(zhongMjs);

        var shunAble = true;
        if (shunAble = (removeShun(typeMjs, numIndex, zhongMjs)) && removeShun(typeMjs, numIndex, zhongMjs)) {
            for (var i = numIndex + 1; i < 9; i++) {
                if (!threeGroupAbl(typeMjs, i, zhongMjs, typeIndex)) {
                    shunAble = false;
                    break;
                }
            }
        }
        if (!shunAble) {
            //todo 需要复制数组 mjBackup
            copyArrays(mjBackup, 0, typeMjs, 0);
            copyArrays(zhongMjsBack, 0, zhongMjs, 0);
            return removeKe(typeMjs, numIndex, zhongMjs);
        }
    } else if (count == 3) {
        if (typeIndex == 3 && numIndex != 0) {
            return removeKe(typeMjs, numIndex, zhongMjs)
        }
        var mjBackup = copyArray(typeMjs);
        var shunAble = true;
        if (shunAble = (removeShun(typeMjs, numIndex, zhongMjs)) && removeShun(typeMjs, numIndex, zhongMjs) && removeShun(typeMjs, numIndex, zhongMjs)) {
            for (var i = numIndex + 1; i < 9; i++) {
                if (!threeGroupAbl(typeMjs, i, zhongMjs, typeIndex)) {
                    shunAble = false;
                    break;
                }
            }
        }
        if (!shunAble) {
            //todo 需要复制数组 mjBackup
            copyArrays(mjBackup, 0, typeMjs, 0);
            return removeKe(typeMjs, numIndex, zhongMjs);
        }

    } else if (count == 4) {
        if(typeIndex == 3){
            return removeKe(typeMjs, numIndex, zhongMjs)
        }
        var mjBackup = copyArray(typeMjs);
        if (!removeShun(typeMjs, numIndex, zhongMjs) && !removeShun(typeMjs, numIndex, zhongMjs) && !removeShun(typeMjs, numIndex, zhongMjs) && !removeShun(typeMjs, numIndex, zhongMjs)) {
            //todo 需要复制数组 mjBackup
            copyArrays(mjBackup, 0, typeMjs, 0);
            return removeKe(typeMjs, numIndex, zhongMjs) && removeShun(typeMjs, numIndex, zhongMjs);
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
function removeShun(typeMjs, numIndex, zhongMjs) {
    if (numIndex > 6 || typeMjs[numIndex] == 0 || typeMjs[numIndex + 1] == 0 || typeMjs[numIndex + 2] == 0) {
        if (numIndex > 6 || typeMjs[numIndex] == 0) {
            if (numIndex == 7 && typeMjs[numIndex] > 0 && typeMjs[numIndex + 1] > 0 && zhongMjs[0] > 0) {
                //89 红中当7的情况
                typeMjs[numIndex]--;
                typeMjs[numIndex + 1]--;
                zhongMjs[0]--;
                return true;
            }
            return false;
        }
        var needCount = 0;
        if (typeMjs[numIndex + 1] == 0) {
            needCount += 1;
        }
        if (typeMjs[numIndex + 2] == 0) {
            needCount += 1;
        }
        if (needCount > zhongMjs[0]) {
            return false;
        }
        typeMjs[numIndex]--;
        if (typeMjs[numIndex + 1] != 0) {
            typeMjs[numIndex + 1]--;
        } else {
            zhongMjs[0]--;
        }
        if (typeMjs[numIndex + 2] != 0) {
            typeMjs[numIndex + 2]--;
        } else {
            zhongMjs[0]--;
        }
        return true;
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
function removeKe(typeMjs, numIndex, zhongMjs) {
    if (typeMjs[numIndex] < 3) {
        if ((typeMjs[numIndex] + zhongMjs[0]) >= 3) {
            zhongMjs[0] -= (3 - typeMjs[numIndex]);
            typeMjs[numIndex] = 0;
            return true;
        }
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
function calcHuMultiple(huType) {
    //todo
    var mutiple = 1;
    return mutiple;
}
exports.huPai = huPai;
exports.twoDimensionalArray = twoDimensionalArray;
exports.copyArray = copyArray;
exports.calcHuMultiple = calcHuMultiple;
exports.oneDimensionalArray = oneDimensionalArray;
exports.isPinghu = isPinghu;