/******************************************************************************
 * Author:      zsc
 * Created:     2016/10/26
 *****************************************************************************/

// var util = require("util");
var Enum = require("./Enum.js");

///////////////////////////////////////////////////////////////////////////////

/**
 * @Description: 获取牌型的同时将提示牌型计算出来
 * @param cards
 * @param destBestCards 需要的目标最优牌组合，如果是牛，前3张是整数，后2张是点数
 * @return
 */
function getCardsType(cards, destBestCards) {
    destBestCards.length = 0;
    cards.forEach(function (card) {
        destBestCards.push(card);
    })
    // destBestCards.addAll(cards);
    if (isWuXiao(cards)) {
        return Enum.NiuCardsType.WU_XIAO;
    } else if (isWuHua(cards)) {
        return Enum.NiuCardsType.WU_HUA;
    } else if (isSiZha(cards)) {
        return Enum.NiuCardsType.SI_ZHA;
    } else if (isSiHua(cards)) {
        return Enum.NiuCardsType.SI_HUA;
    } else {
        destBestCards.length = 0;
        return getNiuNiuType(cards, destBestCards);
    }
}

/**
 * @Description:是否是五小,五小：5张牌都小于5,并且全部加起来小于或等于10，有王不能组成五小
 * @param cards
 */
function isWuXiao(cards) {
    var totalNum = 0;
    for (var index in  cards) {
        if (cards[index].value >= 5) {
            return false;
        }
        totalNum += cards.num;
    }
    if (totalNum <= 10) {
        return true;
    } else {
        return false;
    }
}

/**
 * @Description:是否是五花,五花：5张牌全为花（如Q，J，J，Q，K），有王不能组成五花
 * @param cards
 * @return
 */
function isWuHua(cards) {
    for (var index in cards) {
        if (cards[index].value < 11) {
            return false;
        }
    }
    return true;
}

/**
 * @Description:是否是四花,四花：5张牌中一张为10，另外4张为花[指J、Q、K]（如10，J，J，Q，K），有王不能组成四花
 * @param cards
 * @return
 */
function isSiHua(cards) {
    // 10牌的个数
    var cardTenNum = 0;
    for (var index in cards) {
        if (cards[index].value == 10) {
            cardTenNum += 1;
        } else if (cards[index].value < 10) {
            return false;
        }
    }
    if (cardTenNum == 1) {
        return true;
    }
    return false;
}

/**
 * @Description:是否四炸,四炸：5张牌中有4张一样的牌，此时无需有牛。若庄家闲家都是四炸牌型，则比较4张一样的牌的大小。
 * @param cards
 * @return
 */
function isSiZha(cards) {
    //todo
    return false;

}

/**
 * @Description:只获取牛牛类型
 * @param cards
 * @param destTipCards
 * @return
 */
function getNiuNiuType(cards, destTipCards) {
    // 牌数字的合计
    var totalNum = 0;
    for (var index in cards) {
        totalNum += cards[index].num;
    }
    // 用于计算 提示牌(前3张是整数，后2张是点数)
    var destTipCardsTemp = [];
    for (var i = 0; i < cards.length; i++) {
        for (var j = i + 1; j < cards.length; j++) {
            for (var k = j + 1; k < cards.length; k++) {
                var numCount = cards[i].num + cards[j].num + cards[k].num;
                if (numCount % 10 == 0) {
                    destTipCardsTemp.push(cards[i]);
                    destTipCardsTemp.push(cards[j]);
                    destTipCardsTemp.push(cards[k]);
                    cards.forEach(function (card1) {
                        destTipCardsTemp.push(card1);
                        destTipCards.push(card1);
                    })
                    // destTipCardsTemp.addAll(cards);
                    // destTipCards.addAll(destTipCardsTemp);
                    var niu = (totalNum - numCount) % 10;
                    if (niu == 0) {
                        return Enum.getNiuType(10);
                    } else {
                        return Enum.getNiuType(niu);
                    }
                }
            }
        }
    }
    cards.forEach(function (card1) {
        destTipCards.push(card1);
    })
    // destTipCards.addAll(cards);
    return Enum.NiuCardsType.MEI_NIU;
}

/**
 * @Description:比较大小
 * @param myCards
 * @param myCardsType
 * @param otherCards
 * @param otherCardsType
 * @return boolean:我大  false：庄家大
 */
function compare(myCards, myCardsType, otherCards, otherCardsType) {
    if (myCardsType > otherCardsType) {
        return true;
    } else if (myCardsType < otherCardsType) {
        return false;
    } else {
        var myMaxCard = getMaxCard(myCards);
        var dealerMaxCard = getMaxCard(otherCards);
        if (myMaxCard.value > dealerMaxCard.value) {
            return true;
        } else if (myMaxCard.value < dealerMaxCard.value) {
            return false;
        } else {
            return myMaxCard.type > dealerMaxCard.type;
        }
    }
}

/**
 * @Description:获取最大的牌
 * @param cards
 * @return
 */
function getMaxCard(cards) {
    var maxCard = null;
    for (var index in cards) {
        if (maxCard == null || cards[index].value > maxCard.value
            || (cards[index].value == maxCard.value && cards[index].type > maxCard.type)) {
            maxCard = card;
        }
    }
    return maxCard;
}
exports.getCardsType = getCardsType
exports.compare = compare