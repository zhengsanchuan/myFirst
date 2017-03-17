/******************************************************************************
 * Author:      671643387
 * Created:     2016/10/26
 *****************************************************************************/

var util            = require("util");
var Enum            = require("./Enum.js");

///////////////////////////////////////////////////////////////////////////////
//>> 胡牌

function checkHupai(handCards, card, needCard, firstCheck) {
    // 返回数据
    var rtnArgs = {
        "HupaiMethod"   : 0,    // 胡牌方式
        "PublicPoint"   : 0,    // 公共点数
    };

    do {
        if (firstCheck) {
            // 检查双龙
            if (check2Long(handCards)) {
                rtnArgs.HupaiMethod = Enum.HupaiMethod.METHOD_2_LONG;
                rtnArgs.PublicPoint = 40;
                dumpCards("check2Long");
                break;
            }
            
            // 检查七对胡
            if (check7DuiHu(handCards)) {
                rtnArgs.HupaiMethod = Enum.HupaiMethod.METHOD_7_PAIRS;
                rtnArgs.PublicPoint = 40;
                dumpCards("check7DuiHu");
                break;
            }

            if (handCards.num == 15) {
                // 庄家
                if (checkKan5Hu(handCards)) {
                    rtnArgs.HupaiMethod = Enum.HupaiMethod.METHOD_KAN_5HU;
                    dumpCards("checkKan5Hu");
                    break;
                }

                if (checkNormalHu(clone(handCards), 0, false)) {
                    rtnArgs.HupaiMethod = Enum.HupaiMethod.METHOD_HU_NORMAL;
                    dumpCards("checkNormalHu");
                    break;
                }
            }
        } else {
            if (handCards.num == 0) {
                rtnArgs.HupaiMethod = Enum.HupaiMethod.METHOD_HU_NORMAL;
                dumpCards("NoHandCards");
            } else {
                if (checkNormalHu(clone(handCards), card, needCard)) {
                    rtnArgs.HupaiMethod = Enum.HupaiMethod.METHOD_HU_NORMAL;
                    dumpCards("checkNormalHu");
                } else if (check23m4n(clone(handCards), card, needCard)) {
                    rtnArgs.HupaiMethod = Enum.HupaiMethod.METHOD_HU_NORMAL;
                    dumpCards("check23m4n");
                }
            }
        }
    } while (false);

    return rtnArgs;
    
    function dumpCards(name) {
        DEBUG(util.format("%s, %j -> %d, %d, %s",
            name, handCards.cards, handCards.num, card, needCard ? "True" : "False"));
    }
}

// 检查七对胡
function check7DuiHu(handCards) {
    var numPairs = 0;
    handCards.enum(function(cardNum){
        if (cardNum == 2) {
            numPairs += 1;
        }
    })
    return numPairs == 7;
}

// 检查双龙
function check2Long(handCards) {
    var numFours = 0;
    handCards.enum(function(cardNum){
        if (cardNum == 4) {
            numFours += 1;
        }
    });
    return numFours >= 2;
}

// 检查坎五胡
function checkKan5Hu(handCards) {
    var numKan = 0;
    handCards.enum(function(cardNum){
        if (cardNum == 3) {
            numKan += 1;
        }
    });
    return numKan == 5;
}

// 检查2+3*m+4*n牌型
function check23m4n(handCards, card, needCard) {
    handCards.debug = false;
    if (needCard) {
        // 如果这张牌需要加入计算
        handCards.modifyCard(card, 1);
    }
    return check23m4nOk(handCards);
}
function check23m4nOk(handCards) {
    var cards = handCards.cards;
    for (var iCard = 0; iCard < cards.length; ++iCard) {
        if (cards[iCard] == 2) {
            handCards.modifyCard(iCard + 1, -2);
            if(check3m4nOk(clone(handCards))) {
                return true;
            }
            handCards.modifyCard(iCard + 1, 2);
        }
    }
    return false;
}
function check3m4nOk(handCards) {
    var n = handCards.PAOs.length + handCards.TIs.length;
    if (n != 0) {
        var m = handCards.getNumWords() - n;
        var info = { num : 0 };
        calcWordNum(handCards, info);
        m += info.num;
        return (m + n) == 4;
    }
    return false;
}

// 检查普通胡牌
function checkNormalHu(handCards, card, needCard) {
    handCards.debug = false;
    if (needCard) {
        // 如果这张牌需要加入计算
        handCards.modifyCard(card, 1);
    }

    var numWords = handCards.getNumWords();
    var info = { num : 0 };
    calcWordNum(handCards, info);
    numWords += info.num;
    return numWords == 5;
}

// 计算手牌语句数量
function calcWordNum(handCards, info) {
    info = info || { num : 0 };

    if (handCards.num > 0) {
        var cards = handCards.cards;
        for (var iCard = 0; iCard < cards.length; ++iCard) {
            if (cards[iCard] > 0) {

                ///////////////////////////////////////////////////////////////
                // 第一种情况(ABC)
                var checkPassed = true;
                var type1 = Math.floor(iCard / 10);
                var type3 = Math.floor((iCard + 2) / 10);

                // 这张牌不能构成一句话
                if (type1 != type3) {
                    checkPassed = false;
                }
                if (cards[iCard + 1] == 0 || cards[iCard + 2] == 0) {
                    checkPassed = false;
                }

                if (checkPassed) {
                    // 这张牌可以构成一句话
                    info.num += 1;
                    handCards.modifyCards([iCard + 1, iCard + 2, iCard + 3], -1);
                    if (calcWordNum(handCards, info)) {
                        return true;
                    }

                    //if (info.num != 0) {
                    //    continue;
                    //}

                    info.num -= 1;
                    handCards.modifyCards([iCard + 1, iCard + 2, iCard + 3], 1);
                }

                ///////////////////////////////////////////////////////////////
                checkPassed = false;
                var spType = 0; // 1小写 2大写
                var spCards = [2,7,10,12,17,20];
                if (spCards.indexOf(iCard + 1) != -1) {
                    if ((iCard + 1) <= 10) {
                        spType = 1;
                        if ((cards[1] > 0) && (cards[6] > 0) && (cards[9] > 0)) {
                            checkPassed = true;
                        }
                    } else {
                        spType = 2;
                        if ((cards[11] > 0) && (cards[16] > 0) && (cards[19] > 0)) {
                            checkPassed = true;
                        }
                    }
                }

                if (checkPassed) {
                    // 这张牌可以构成一句话
                    info.num += 1;
                    if (spType == 1) {
                        handCards.modifyCards([2, 7, 10], -1);
                    } else {
                        handCards.modifyCards([12, 17, 20], -1);
                    }
                    if (calcWordNum(handCards, info)) {
                        return true;
                    }

                    //if (info.num != 0) {
                    //    continue;
                    //}

                    if (spType == 1) {
                        handCards.modifyCards([2, 7, 10], 1);
                    } else {
                        handCards.modifyCards([12, 17, 20], 1);
                    }
                    info.num -= 1;
                }

                ///////////////////////////////////////////////////////////////
                var Oidx = (iCard <= 10) ? (iCard + 10) : (iCard - 10);
                if (cards[iCard] == 1) {
                    // 第二种情况(Aaa)
                    if (cards[Oidx] >= 2) {
                        info.num += 1;
                        handCards.modifyCards([iCard + 1, Oidx + 1, Oidx + 1], -1);
                        if (calcWordNum(handCards, info)) {
                            return true;
                        }

                        //if (info.num != 0) {
                        //    continue;
                        //}

                        handCards.modifyCards([iCard + 1, Oidx + 1, Oidx + 1], 1);
                        info.num -= 1;
                    }
                }

                if (cards[iCard] == 2) {
                    // 第三种情况(AAa)
                    if (cards[Oidx] >= 1) {
                        info.num += 1;
                        handCards.modifyCards([iCard + 1, iCard + 1, Oidx + 1], -1);
                        if (calcWordNum(handCards, info)) {
                            return true;
                        }

                        //if (info.num != 0) {
                        //    continue;
                        //}

                        handCards.modifyCards([iCard + 1, iCard + 1, Oidx + 1], 1);
                        info.num -= 1;
                    }
                }

                if (cards[iCard] == 3) {
                    // 第四种情况(AAA)
                    info.num += 1;
                    handCards.modifyCard(iCard + 1, -3);
                    if (calcWordNum(handCards, info)) {
                        return true;
                    }

                    //if (info.num != 0) {
                    //    continue;
                    //}

                    handCards.modifyCard(iCard + 1, 3);
                    info.num -= 1;
                }

                //info.num = 0;
                //break;

                return false;
            }
        }
    }

    return true;
}

///////////////////////////////////////////////////////////////////////////////
//>> 吃牌

// 计算吃牌
function calcChi(cards, card, info, isLuo, isLuo2) {
    // 检查第一种情况(A,B,C)
    if ((((card - 3) >= 0) && ((card - 1) < 10)) || (((card - 3) >= 10)) && ((card - 1) < 20)) {
        if ((cards[card - 3] > 0)
            && (cards[card - 2] > 0)
            && (cards[card - 1] > 0)) {

            // 可以吃这个牌型
            var cardSes = [card - 2, card - 1, card];
            if (!isLuo) {
                // 添加吃牌
                info.push({
                    chiSes  : cardSes,
                    luoSess : [],
                });
            } else if (!isLuo2) {
                // 添加落牌1
                info[info.length - 1].luoSess.push([cardSes]);
            } else {
                // 添加落牌2
                var luoSess = info[info.length - 1].luoSess;
                luoSess = luoSess[luoSess.length - 1];
                luoSess.push(cardSes);
            }

            // 扣除牌
            cards[card - 3] -= 1; cards[card - 2] -= 1; cards[card - 1] -= 1;
            if (cards[card - 1] > 0) {
                calcChi(cards, card, info, true, isLuo);
            }

            // 恢复牌组
            cards[card - 3] += 1; cards[card - 2] += 1; cards[card - 1] += 1;

            //if (isLuo) {
            //    return;
            //}
        }
    }

    // 检查第二种情况(B,C,D)
    if (((card - 2) >= 0 && (card < 10)) || (card - 2) >= 10 && (card < 20)) {
        if ((cards[card - 2] > 0)
            && (cards[card - 1] > 0)
            && (cards[card] > 0)) {

            // 可以吃这个牌型
            var cardSes = [card - 1, card, card + 1];
            if (!isLuo) {
                info.push({
                    chiSes  : cardSes,
                    luoSess : [],
                });
            } else if (!isLuo2) {
                // 添加落牌1
                info[info.length - 1].luoSess.push([cardSes]);
            } else {
                // 添加落牌2
                var luoSess = info[info.length - 1].luoSess;
                luoSess = luoSess[luoSess.length - 1];
                luoSess.push(cardSes);
            }

            // 扣除牌
            cards[card - 2] -= 1; cards[card - 1] -= 1; cards[card] -= 1;
            if (cards[card - 1] > 0) {
                calcChi(cards, card, info, true, isLuo);
            }
            // 恢复牌组
            cards[card - 2] += 1; cards[card - 1] += 1; cards[card] += 1;

            //if (isLuo) {
            //    return;
            //}
        }
    }

    // 检查第三种情况(C,D,E)
    if ((((card + 1) < 10) && ((card - 1) >= 0))
        || (((card + 1) < 20) && ((card - 1) >= 10))) {
        if ((cards[card - 1] > 0)
            && (cards[card] > 0)
            && (cards[card + 1] > 0)) {

            // 可以吃这个牌型
            var cardSes = [card, card + 1, card + 2];
            if (!isLuo) {
                info.push({
                    chiSes  : cardSes,
                    luoSess : [],
                });
            } else if (!isLuo2) {
                // 添加落牌1
                info[info.length - 1].luoSess.push([cardSes]);
            } else {
                // 添加落牌2
                var luoSess = info[info.length - 1].luoSess;
                luoSess = luoSess[luoSess.length - 1];
                luoSess.push(cardSes);
            }

            // 扣除牌
            cards[card - 1] -= 1; cards[card] -= 1; cards[card + 1] -= 1;
            if (cards[card - 1] > 0) {
                calcChi(cards, card, info, true, isLuo);
            }
            // 恢复牌组
            cards[card - 1] += 1; cards[card] += 1; cards[card + 1] += 1;

            //if (isLuo) {
            //    return;
            //}
        }
    }

    // 检查第四种情况(C,C,c)
    var Oidx = (card <= 10) ? (card + 10) : (card - 10);
    if ((cards[Oidx - 1] >= 1) && cards[card - 1] >= 2) {

        // 可以吃这个牌型
        var cardSes = [card, card, Oidx];
        if (!isLuo) {
            info.push({
                chiSes  : cardSes,
                luoSess : [],
            });
        } else if (!isLuo2) {
            // 添加落牌1
            info[info.length - 1].luoSess.push([cardSes]);
        } else {
            // 添加落牌2
            var luoSess = info[info.length - 1].luoSess;
            luoSess = luoSess[luoSess.length - 1];
            luoSess.push(cardSes);
        }

        // 扣除牌
        cards[card - 1] -= 2; cards[Oidx - 1] -= 1;
        if (cards[card - 1] > 0) {
            calcChi(cards, card, info, true, isLuo);
        }
        // 恢复牌组
        cards[card - 1] += 2; cards[Oidx - 1] += 1;

        //if (isLuo) {
        //    return;
        //}
    }

    // 检查第五种情况(c,c,C)
    if ((cards[Oidx - 1] >= 2) && (cards[card - 1] >= 1)) {

        // 可以吃这个牌型
        var cardSes = [card, Oidx, Oidx];
        if (!isLuo) {
            info.push({
                chiSes  : cardSes,
                luoSess : [],
            });
        } else if (!isLuo2) {
            // 添加落牌1
            info[info.length - 1].luoSess.push([cardSes]);
        } else {
            // 添加落牌2
            var luoSess = info[info.length - 1].luoSess;
            luoSess = luoSess[luoSess.length - 1];
            luoSess.push(cardSes);
        }

        // 扣除牌
        cards[card - 1] -= 1; cards[Oidx - 1] -= 2;
        if (cards[card - 1] > 0) {
            calcChi(cards, card, info, true, isLuo);
        }
        // 恢复牌组
        cards[card - 1] += 1; cards[Oidx - 1] += 2;

        //if (isLuo) {
        //    return;
        //}
    }

    // 第六种情况(2,7,10)
    var spCards = [2, 7, 10, 12, 17, 20];
    if (spCards.indexOf(card) != -1) {
        if (card <= 10) {
            if ((cards[1] > 0) && (cards[6] > 0) && (cards[9] > 0)) {
                // 可以吃这个牌
                var cardSes = [2, 7, 10];
                if (!isLuo) {
                    info.push({
                        chiSes  : cardSes,
                        luoSess : [],
                    });
                } else if (!isLuo2) {
                    // 添加落牌1
                    info[info.length - 1].luoSess.push([cardSes]);
                } else {
                    // 添加落牌2
                    var luoSess = info[info.length - 1].luoSess;
                    luoSess = luoSess[luoSess.length - 1];
                    luoSess.push(cardSes);
                }

                // 扣除牌
                cards[1] -= 1; cards[6] -= 1; cards[9] -= 1;
                if (cards[card - 1] > 0) {
                    calcChi(cards, card, info, true, isLuo);
                }
                // 恢复牌组
                cards[1] += 1; cards[6] += 1; cards[9] += 1;

                //if (isLuo) {
                //    return;
                //}
            }
        } else {
            if ((cards[11] > 0) && (cards[16] > 0) && (cards[19] > 0)) {
                // 可以吃这个牌
                var cardSes = [12, 17, 20];
                if (!isLuo) {
                    info.push({
                        chiSes  : cardSes,
                        luoSess : [],
                    });
                } else if (!isLuo2) {
                    // 添加落牌1
                    info[info.length - 1].luoSess.push([cardSes]);
                } else {
                    // 添加落牌2
                    var luoSess = info[info.length - 1].luoSess;
                    luoSess = luoSess[luoSess.length - 1];
                    luoSess.push(cardSes);
                }

                // 扣除牌
                cards[11] -= 1; cards[16] -= 1; cards[19] -= 1;
                if (cards[card - 1] > 0) {
                    calcChi(cards, card, info, true, isLuo);
                }
                // 恢复牌组
                cards[11] += 1; cards[16] += 1; cards[19] += 1;

                //if (isLuo) {
                //    return;
                //}
            }
        }
    }
}

// 计算吃牌序列
function calcChiInfo(cards, card) {
    var rtnInfo = [];
    var chiInfo = [];
    // 计算序列
    calcChi(cards, card, chiInfo, false);
    // 检查序列
    var cardNum = cards[card - 1];
    for (var iArr = 0; iArr < chiInfo.length; ++iArr) {
        var sChiInfo = chiInfo[iArr];

        var checkingChiInfo = {
            "chiSes"    : sChiInfo.chiSes,
            "luoSess"   : [],
        };

        var numCards = 0;
        sChiInfo.chiSes.forEach(function(eCard){
            if (eCard == card) {
                numCards += 1;
            }
        });

        var checkOk = false;
        if ((numCards == cardNum) && (sChiInfo.luoSess.length == 0)) {
            checkOk = true;
        } else {
            sChiInfo.luoSess.forEach(function(luoSes){
                var numLCards = 0;
                luoSes.forEach(function(sLuoSes){
                    sLuoSes.forEach(function (eCard) {
                        if (eCard == card) {
                            numLCards += 1;
                        }
                    });
                });
                if ((numLCards + numCards) == cardNum) {
                    checkingChiInfo.luoSess.push(luoSes);
                    checkOk = true;
                }
            });
        }
        if (checkOk) {
            rtnInfo.push(checkingChiInfo);
        }
    }
    return rtnInfo;
}

exports.checkHupai = checkHupai;
exports.calcChiInfo = calcChiInfo;