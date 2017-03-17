/******************************************************************************
 * Author:      zsc
 * Created:     2016/10/26
 *****************************************************************************/

var util = require("util");
var Enum = require("./Enum.js");
var ProtoID = require("../../../net/ProtoID.js").ProtoID;
var ProtoState = require("../../../net/ProtoID.js").ProtoState;
var Opcodes = require("./Opcodes.js").Opcodes;
var Func = require("./Func.js");

///////////////////////////////////////////////////////////////////////////////
//>> 玩家手牌

function HandCards(owner) {
    this.owner = owner;
    this.num = 0;

    this.mjs = Func.twoDimensionalArray(4, 9, null); //手牌
    this.pengFlag = Func.twoDimensionalArray(4, 9, false); //碰的牌
    this.eatMjs = Func.twoDimensionalArray(4, 9, null); //吃的牌
    this.gangFlag = Func.twoDimensionalArray(4, 9, false) //杠的牌
    this.mjCounts = Func.oneDimensionalArray(4);
    this.eatCounts = Func.oneDimensionalArray(3);

    this.played = []; //打过的牌
    this.lastMj = 0;//最后摸的牌
    this.huMjs = {}; //可以胡的麻将
    this.eatAbleMjs = {}; //可以吃的麻将
    this.jiangNum = null; //将牌
    this.jiangType = null; //将牌类型(万筒条字)
    this.humj = null; //最后胡的牌
    this.miss = null; //定缺
    this.eatMiss = null; //吃的类型(万铜条)
    this.gangFlagType = {};


}

HandCards.prototype = {

    // 初始化
    init: function (cards) {
        for (var i = 0; i < cards.length; i++) {
            this.addMjs(cards[i]);
        }
    },

    // 重置
    reset: function () {
        this.mjs = Func.twoDimensionalArray(4, 9, null);
        this.pengFlag = Func.twoDimensionalArray(4, 9, false);
        this.eatMjs = Func.twoDimensionalArray(4, 9, null); //吃的牌
        this.gangFlag = Func.twoDimensionalArray(4, 9, false)
        this.mjCounts = Func.oneDimensionalArray(4);
        this.eatCounts = Func.oneDimensionalArray(3);

        this.played = []; //打过的牌
        this.lastMj = 0;//最后摸的牌
        this.huMjs = {}; //可以胡的麻将
        this.eatAbleMjs = {}; //可以吃的麻将
        this.jiangNum = null; //将牌
        this.jiangType = null; //将牌类型(万筒条字)
        this.humj = null; //最后胡的牌
        this.miss = null; //定缺
        this.eatMiss = null; //吃的类型(万铜条)
        this.gangFlagType = {};
    },

    /**
     * 增加麻将
     * @param mjId
     */
    addMjs: function (mjId) {
        this.mjs[parseInt((mjId - 1) / 9)][(mjId - 1) % 9]++;
        this.mjCounts[parseInt((mjId - 1) / 9)]++;
        this.lastMj = mjId;
    },

    /**
     * 移除麻将
     * @param mjId
     */
    removeMjs: function (mjId) {
        this.mjs[parseInt((mjId - 1) / 9)][(mjId - 1) % 9]--;
        this.mjCounts[parseInt((mjId - 1) / 9)]--;
    },

    /**
     * 万的张数
     * @returns {*}
     */
    getWanCount: function () {
        return this.getCount(1);
    },

    /**
     * 筒的张数
     * @returns {*}
     */
    getTongCount: function () {
        return this.getCount(2);

    },

    /**
     * 字的张数
     * @returns {*}
     */
    getFengCount: function () {
        return this.getCount(4);
    },

    /**
     * 缺的张数
     * @return {*}
     */
    getMissingCount: function () {
        return this.getCount(this.miss);

    },

    /**
     * 吃的那色牌张数
     * @return {*}
     */
    getEatMissingCount: function () {
        return this.getTotalCount() - this.getCount(this.eatMiss + 1);
    },

    /**
     * 条的张数
     * @returns {*}
     */
    getTiaoCount: function () {
        return this.getCount(3);
    },

    getCount: function (index) {
        return this.mjCounts[index - 1];
    },

    getLastDrawMj: function () {
        return this.lastMj;
    },


    /**
     * 龙的数量(4)
     * @return {number}
     */
    getLongCount: function () {
        var num = 0;
        for (var typIndex = 0; typIndex < this.mjs.length; typIndex++) {
            for (var numIndex = 0; numIndex < this.mjs[typIndex].length; numIndex++) {
                if (this.mjs[typIndex][numIndex] == 4) {
                    num++;
                }
            }
        }
        return num;

    },


    /**
     * 获取吃的麻将
     * @return {Array}
     */
    getEatMj: function () {
        var eatList = [];
        for (var typeIndex = 0; typeIndex < this.eatMjs.length; typeIndex++) {
            var typeMjs = this.eatMjs[typeIndex];
            for (var numIndex = 0; numIndex < typeMjs.length; numIndex++) {
                var count = typeMjs[numIndex];
                for (var k = 0; k < count; k++) {
                    eatList.push(typeIndex * 9 + numIndex + 1)
                }
            }
        }
        return eatList;
    },


    /**
     * 获取碰的麻将
     * @return {Array}
     */
    getPengMj: function () {
        var pengMj = [];
        for (var typeIndex = 0; typeIndex < this.pengFlag.length; typeIndex++) {
            for (var numIndex = 0; numIndex < this.pengFlag[typeIndex].length; numIndex++) {
                if (this.pengFlag[typeIndex][numIndex]) {
                    pengMj.push(typeIndex * 9 + numIndex + 1)
                }
            }
        }

        return pengMj;
    },

    /**
     * 获取杠的麻将
     * @return {Array}
     */
    getGangMj: function () {
        var gangMj = [];
        for (var typeIndex = 0; typeIndex < this.gangFlag.length; typeIndex++) {
            for (var numIndex = 0; numIndex < this.gangFlag[typeIndex].length; numIndex++) {
                if (this.gangFlag[typeIndex][numIndex]) {
                    gangMj.push(typeIndex * 9 + numIndex + 1)
                }
            }
        }
        return gangMj;
    },


    /**
     * 计算查听
     * @returns {{}}
     */
    calcTingPai: function () {
        var tingPai = {}
        for (var playMj = 1; playMj <= this.owner.owner.cardNum; playMj++) {
            if (this.contains(playMj)) {
                this.removeMjs(playMj);
                for (var huMj = 1; huMj <= this.owner.owner.cardNum; huMj++) {
                    if (huMj != playMj) {
                        this.addMjs(huMj);
                        if (Func.huPai(this) != null) {
                            // tingPai.put(playMj, huMj);
                            tingPai[playMj] = huMj;
                        }
                        this.removeMjs(huMj);
                    }
                }
                this.addMjs(playMj);
            }
        }
        return tingPai;
    },


    /**
     * 是否有该麻将
     * @param mjId
     */
    contains: function (mjId) {
        return this.mjs[parseInt((mjId - 1) / 9)][(mjId - 1) % 9] > 0;
    },


    /**
     * 复制麻将
     * @returns {Array}
     */
    copyMjs: function () {
        var len = this.mjs.length;
        var cp = Func.twoDimensionalArray(4, 9, null);
        for (var typeIndex = 0; typeIndex < len; typeIndex++) {
            cp[typeIndex] = Func.copyArray(this.mjs[typeIndex]);
        }
        return cp;
    },

    /**
     * 是否是定缺牌
     * @param mjId
     * @return {boolean}
     */
    missing: function (mjId) {
        return parseInt((mjId - 1) / 9) == this.miss;

    },

    /**
     * 是否是吃的那门牌
     * @param mjId
     * @return {boolean}
     */
    eatMissing: function (mjId) {
        return parseInt((mjId - 1) / 9) == this.eatMiss;

    },

    /**
     * 是否花猪
     * @param mjId
     * @return {boolean}
     */

    isHuaZhu: function (mjId) {
        return this.getCount(this.miss) != 0;
    },

    /**
     * 是否无听
     * @param mjId
     * @return {boolean}
     */

    isWuTing: function (mjId) {
        return this.huMjs.length == 0;

    },

    //无听时最大倍数
    maxHuPaiMultiple: function () {
        var maxMu = 0;
        for (var i in this.huMjs) {
            if (maxMu < this.huMjs[i]) {
                maxMu = this.huMjs[i];
            }
        }
        return maxMu;
    },


    /**
     * 出牌
     * @param mjId
     */
    playMj: function (mjId) {
        this.removeMjs(mjId);
        this.calcHuMjs();
        this.calcEatMjs();
        this.played.push(mjId);
    },

    /**
     * 摸牌
     * @param mjId
     */
    drawMj: function (mjId) {
        this.addMjs(mjId);
    },

    /**
     * 计算胡牌麻将
     */

    calcHuMjs: function () {
        this.huMjs = {};
        for (var huMj = 1; huMj <= this.owner.owner.cardNum; huMj++) {
            this.addMjs(huMj);
            var huType;
            if (huType = Func.huPai(this) != null) {
                // this.huMjs.put(huMj, Func.calcHuMultiple(huType));
                this.huMjs[huMj] = Func.calcHuMultiple(huType);
            }
            this.removeMjs(huMj);
        }
    },

    /**
     * 获取吃的类型
     * @param eatMj
     * @return {Array}
     */

    eatType: function (eatMj) {
        var eatType = [];
        for (var type in this.eatAbleMjs[eatMj]) {
            eatType.push(type);
        }
        return eatType;

    },

    /**
     * 计算吃牌
     */
    calcEatMjs: function () {
        this.eatAbleMjs = {};
        for (var eatMj = 1; eatMj <= 27; eatMj++) {
            var typeIndex = parseInt((eatMj - 1) / 9);
            var numIndex = (eatMj - 1) % 9;
            var eat = {};
            if (numIndex < 7 && this.mjs[typeIndex][numIndex + 1] > 0 && this.mjs[typeIndex][numIndex + 2] > 0) {
                // this.huMjs[1] = [huMj + 1, huMj + 2];
                var mj = [];
                mj.push(eatMj + 1);
                mj.push(eatMj + 2);
                eat[Enum.EatType.BIG] = mj;
                // 6 (7,8) eg
                //8以上不能吃大

            }

            if ((numIndex > 0 && numIndex < 8)&& this.mjs[typeIndex][numIndex - 1] > 0 && this.mjs[typeIndex][numIndex + 1] > 0) {
                // this.huMjs[1] = [huMj - 1, huMj + 1];
                var mj = [];
                mj.push(eatMj - 1);
                mj.push(eatMj + 1);
                eat[Enum.EatType.MIDDLE] = mj;
                // 6(5,7) eg

                //1, 9 不能吃中

            }
            if (numIndex > 1 && this.mjs[typeIndex][numIndex - 1] && this.mjs[typeIndex][numIndex - 2]) {
                // this.huMjs[1] = [huMj - 2, huMj - 1];
                var mj = [];
                mj.push(eatMj - 2);
                mj.push(eatMj - 1);
                eat[Enum.EatType.SMALL] = mj;
                // 6 (4,5) eg
                // 1不能吃小
            }
            this.eatAbleMjs[eatMj] = eat;
        }
    },


    /**
     * @Description:吃
     * @param mjId
     */
    eat: function (mjId, eatType) {
        var mjIds = [];
        // mjIds.push(mjId);
        if (eatType == Enum.EatType.BIG) {
            mjIds.push(mjId + 1);
            mjIds.push(mjId + 2);
        } else if (eatType == Enum.EatType.MIDDLE) {
            mjIds.push(mjId + 1);
            mjIds.push(mjId - 1);
        } else if (eatType == Enum.EatType.SMALL) {
            mjIds.push(mjId - 1);
            mjIds.push(mjId - 2);
        }
        for (var index in mjIds) {
            if (this.contains(mjIds[index])) {
                this.removeMjs(mjIds[index]);
                this.eatMjs[parseInt((mjIds[index] - 1) / 9)][(mjIds[index] - 1) % 9]++;
                this.eatCounts[parseInt((mjIds[index] - 1) / 9)]++;
            }
        }
        // mjIds.forEach(function (mj) {
        //     if(this.contains(mj)){
        //         this.removeMjs(mj);
        //         this.eatMjs[parseInt((mj - 1) / 9)][(mj - 1) % 9]++;
        //     }
        // });
        this.eatMjs[parseInt((mjId - 1) / 9)][(mjId - 1) % 9]++;
        this.eatCounts[parseInt((mjId - 1) / 9)]++;
        this.eatMiss = parseInt((mjId - 1) / 9);

    },


    /**
     * 是否可以吃
     * @param mjId
     * @return {boolean}
     */
    eatAble: function (mjId) {
        // console.log(this.eatAbleMjs[mjId]);
        var pengMj = this.getPengMj();
        var gangMj = this.getGangMj();
        var typeIndex = parseInt((mjId - 1) / 9);
        for (var pMj in pengMj) {
            var pengTypeIndex = parseInt((pengMj[pMj] - 1) / 9);
            if (pengTypeIndex != typeIndex) {
                return false;
            }
        }
        for (var gMj in gangMj) {
            var gangTypeIndex = parseInt((gangMj[gMj] - 1) / 9);
            if (gangTypeIndex != typeIndex) {
                return false;
            }
        }
        if (typeIndex > 2 || (this.eatMiss != null && this.eatMiss != typeIndex)) {
            return false;
        }
        if (typeof this.eatAbleMjs[mjId] == 'undefined') {
            return false;
        }
        return (Object.keys(this.eatAbleMjs[mjId]).length) > 0;
    },


    /**
     * 是否可以碰
     * @param mjId
     * @return {boolean}
     */
    pengAble: function (mjId) {
        var typeIndex = parseInt((mjId - 1) / 9);
        if (this.eatMiss != null && typeIndex != this.eatMiss && Enum.validContains(this.owner.owner.playMeThod, Enum.PlayMeThod.CAN_EAT)) {
            return false;
        }
        return this.mjs[typeIndex][(mjId - 1) % 9] > 1;

    },

    /**
     * @Description:碰
     * @param mjId
     */
    peng: function (mjId) {
        this.removeMjs(mjId);
        this.removeMjs(mjId);
        this.pengFlag[parseInt((mjId - 1) / 9)][(mjId - 1) % 9] = true;
    },


    /**
     * 是否可以胡
     * @param mjId
     * @return {boolean}
     */

    huAble: function (mjId, ziMo) {
        if (this.huMjs.hasOwnProperty(mjId)) {
            if (this.isSmallHu(mjId, ziMo)) {
                return false;
            }
            return true;
        }
        return this.huMjs.hasOwnProperty(mjId);
    },


    /**
     * 小胡和吃牌只能胡清一色
     * @param mjId
     * @return {boolean}
     */
    isSmallHu: function (mjId, ziMo) {
        var add = false;
        if (this.getTotalCount() % 3 != 2) {
            this.addMjs(mjId);
            add = true;
        }
        //吃牌后,只能胡清一色
        if (Enum.validContains(this.owner.owner.playMeThod, Enum.PlayMeThod.CAN_EAT) && this.isEated() && !this.isQingYiSe()) {
            if (add) {
                this.removeMjs(mjId);
            }
            return true;
        }
        if (this.isQingYiSe() || this.isDaPeng() || this.isFengYiSe() ||
            Func.isDui(this) != null || this.isYiTiaoLong() ||
            (Func.isPinghu(this) && Enum.validJiang(this.jiangNum, this.jiangType) && ziMo) ||
            (Func.huPai(this) == Enum.PaiType.LAN_HU) ||
            (Func.huPai(this) == Enum.PaiType.LUAN_JIANG)) {
            if (add) {
                this.removeMjs(mjId);
            }
            return false;
        }
        if (add) {
            this.removeMjs(mjId);
        }
        return true;
    },

    /**
     * 是否吃牌
     * @return {boolean}
     */
    isEated: function () {
        return this.eatMiss != null
    },


    /**
     * 被抢牌
     * @param mjId
     */
    playedRemove: function (mjId) {
        var playedTemp = [];
        this.played.forEach(function (mj) {
            playedTemp.push(mj);
        })
        for (var index in playedTemp) {
            if (playedTemp[index] == mjId) {
                this.played.splice(index, 1);
                break;
            }
        }
    },

    /**
     * 吃牌数量
     * @return {number}
     */
    eatMjsCount: function () {
        if (this.eatMiss != null) {
            return this.eatCounts[this.eatMiss];
        }
        return 0;
    },


    /**
     *
     * 是否可以杠
     * @param mjId
     * @return {boolean}
     */

    gangAble: function (mjId) {
        var typeIndex = parseInt((mjId - 1) / 9);
        if (this.eatMiss != null && typeIndex != this.eatMiss && Enum.validContains(this.owner.owner.playMeThod, Enum.PlayMeThod.CAN_EAT)) {
            return false;
        }
        return this.gangType(mjId) != null;
    },

    /**
     * 杠
     * @param mjId
     * @param gangType
     */
    gang: function (mjId, gangType) {
        var typeIndex = parseInt((mjId - 1) / 9);
        var numIndex = (mjId - 1) % 9;
        switch (gangType) {
            case Enum.GangType.AN_GANG:
                this.removeMjs(mjId);
                this.removeMjs(mjId);
                this.removeMjs(mjId);
                this.removeMjs(mjId);
                break;
            case Enum.GangType.MIAN_XIA_GANG:
                this.removeMjs(mjId);
                this.pengFlag[typeIndex][numIndex] = false;
                break;
            case Enum.GangType.ZHI_GANG:
                this.removeMjs(mjId);
                this.removeMjs(mjId);
                this.removeMjs(mjId);
                break;
        }
        this.gangFlag[typeIndex][numIndex] = true;
        this.gangFlagType[mjId] = gangType;
    },

    /**
     * 获取杠的类型
     * @param mjId
     * @return {*}
     */
    gangType: function (mjId) {
        var typeIndex = parseInt((mjId - 1) / 9);
        var numIndex = (mjId - 1) % 9;
        if (this.getTotalCount() % 3 == 2) {
            // 该麻将数量
            var mjCount = this.mjs[typeIndex][numIndex];
            if (mjCount == 4) {
                return Enum.GangType.AN_GANG;
            } else if (this.pengFlag[typeIndex][numIndex] && mjCount == 1) {
                return Enum.GangType.MIAN_XIA_GANG;
            }
        } else if (this.mjs[typeIndex][numIndex] == 3) {
            return Enum.GangType.ZHI_GANG;
        }
        return null;
    },


    /**
     * 手上麻将数量
     * @return {*}
     */
    getTotalCount: function () {
        return this.mjCounts[0] + this.mjCounts[1] + this.mjCounts[2] + this.mjCounts[3];
    },


    /**
     * 麻将转换
     * @return {Array}
     */
    mjList: function () {
        var mjList = [];
        for (var typeIndex = 0; typeIndex < this.mjs.length; typeIndex++) {
            var typeMjs = this.mjs[typeIndex];
            for (var numIndex = 0; numIndex < typeMjs.length; numIndex++) {
                var count = typeMjs[numIndex];
                for (var k = 0; k < count; k++) {
                    mjList.push(typeIndex * 9 + numIndex + 1)
                }
            }
        }
        return mjList;
    },


    //一条龙
    isYiTiaoLong: function () {
        var wanlong = []
        var tonglong = []
        var tiaolong = []
        for (var typeIndex = 0; typeIndex < 3; typeIndex++) {
            var typeMjs = this.mjs[typeIndex];
            for (var numIndex = 0; numIndex < 9; numIndex++) {
                if (numIndex > 6) {
                    break
                }
                if (typeMjs[numIndex] > 0 && typeMjs[numIndex + 1] > 0 && typeMjs[numIndex + 2] > 0) {
                    if (typeIndex == 0) {
                        wanlong.push(numIndex + 1)
                        wanlong.push(numIndex + 2)
                        wanlong.push(numIndex + 3)
                    } else if (typeIndex == 1) {
                        tonglong.push(numIndex + 1)
                        tonglong.push(numIndex + 2)
                        tonglong.push(numIndex + 3)
                    } else {
                        tiaolong.push(numIndex + 1)
                        tiaolong.push(numIndex + 2)
                        tiaolong.push(numIndex + 3)
                    }
                }
                numIndex += 2
            }
        }

        // console.log(wanlong)
        // console.log(tonglong)
        // console.log(tiaolong)


        // var result = wanlong.concat(tonglong).concat(tiaolong)
        // console.log(result)

        var result = Enum.removeDuplicatedItem(wanlong.concat(tonglong).concat(tiaolong)).sort(function (x, y) {
                if (x > y) {
                    return 1
                } else {
                    return -1
                }
            }
        );

        if (result.length != 9) {
            return false;
        }


        return Enum.IsSeries(result, 1);
    },


    //大碰胡
    isDaPeng: function () {
        return this.getTotalCount() == 2 && !this.isEated();
    },

    //乱将
    isLuanJiang: function () {
        var flag = null;
        if (!Enum.validJiang(this.jiangNum, this.jiangType)) {
            //判断对子
            // return false;
        }

        this.getPengMj().forEach(function (mj) {
            var numIndex = (mj - 1) % 9;
            var typeIndex = parseInt((mj - 1) / 9);
            if (!Enum.validJiang(numIndex, typeIndex)) {
                flag = false;
                return;
            }
        });

        this.getGangMj().forEach(function (mj) {
            var numIndex = (mj - 1) % 9;
            var typeIndex = parseInt((mj - 1) / 9);
            if (!Enum.validJiang(numIndex, typeIndex)) {
                flag = false;
                return;
            }
        });

        if (!flag && flag != null) {
            return flag;
        }
        var cardNum = 14 - (this.getPengMj().length + this.getGangMj().length) * 3
        var yjNum = 0;
        for (var typeIndex = 0; typeIndex < this.mjs.length; typeIndex++) {
            var typeMjs = this.mjs[typeIndex];
            for (var numIndex = 0; numIndex < typeMjs.length; numIndex++) {
                if (typeMjs[numIndex] > 0 && Enum.validJiang(numIndex + 1, typeIndex)) {
                    yjNum += typeMjs[numIndex];
                }
            }
        }
        return yjNum == cardNum;

    },


    //清一色
    isQingYiSe: function () {
        var wanFlg = false;
        var tongFlg = false;
        var tiaoFlg = false;
        for (var mjId = 1; mjId <= this.owner.owner.cardNum; mjId++) {
            var typeIndex = parseInt((mjId - 1) / 9);
            var numIndex = (mjId - 1) % 9;
            if (this.mjs[typeIndex][numIndex] > 0 || this.pengFlag[typeIndex][numIndex] || this.gangFlag[typeIndex][numIndex] || this.eatMjs[typeIndex][numIndex] > 0) {
                if (typeIndex == 0) {
                    wanFlg = true;
                } else if (typeIndex == 1) {
                    tongFlg = true;
                } else if (typeIndex == 2) {
                    tiaoFlg = true;
                } else if (typeIndex == 3) {
                    return false;
                }
            }
        }
        return (wanFlg && !tongFlg && !tiaoFlg) || (!wanFlg && tongFlg && !tiaoFlg) || (!wanFlg && !tongFlg && tiaoFlg);
    },

    //风一色
    isFengYiSe: function () {
        var num = 0;
        this.getPengMj().forEach(function (mjId) {
            var typeIndex = parseInt((mjId - 1) / 9);
            if (typeIndex == 3) {
                num += 3;
            }
        });
        this.getGangMj().forEach(function (mjId) {
            var typeIndex = parseInt((mjId - 1) / 9);
            if (typeIndex == 3) {
                num += 3;
            }
        });
        return this.getCount(4) + num == 14;
    },

    /**
     * 手牌
     * @return {*|Array}
     */

    getSync: function () {
        return this.mjList();
    },
};

///////////////////////////////////////////////////////////////////////////////
//>> 游戏玩家

function Player(owner, index, cardNum) {
    this.owner = owner;    // 房间对象
    this.index = index;    // 玩家位置

    this.cardNum = cardNum; //牌张数

    this.uid = 0;        // 玩家ID
    this.info = {};       // 玩家信息
    this.wsConn = null;     // WebSocket连接对象
    this.online = false;    // 玩家是否在线
    this.queuedPackets = [];       // 数据包


    this.dealer = false;    // 是否庄家
    this.ready = false;    // 玩家是否就绪
    this.handCards = null;     // 手牌
    this.lianZhuangNum = 0;    // 连庄次数

    this.buyNum = 0; //买分数 (开局前的买分数)

    //单局结算数据
    this.buyScore = 0;// 买分结算分
    this.maNum = 0; // 码数(抓鸟 中码数量)
    this.gangScore = 0; //杠分数
    this.roundScore = 0;// 本轮积分情况(总计数)
    this.fanNum = 0;  //番数
    this.isZm = false;


    //状态数据
    this.over = false; //是否结束
    this.gangState = null;  //杠的状态
    this.pengState = null; //碰的状态
    this.huState = null; //胡的状态
    this.eatState = null; //吃的状态
    this.huedPlayer = []; //被胡的玩家

    this.pengdPlayer = {} //碰的麻将和人 {k,v} k 麻将 v对应的人
    this.gangedPlayers = {} //杠的麻将和人 {k,v} k 麻将 v对应的人

    //结算数据
    this.huPaiNum = 0;        // 胡牌次数
    this.dianPaoNum = 0;      // 点炮次数
    this.gangNum = 0;         // 杠次数
    this.ziMoNum = 0;          // 自摸次数
    this.score = 0;        //   总积分(最总结算)

}

Player.prototype = {

    // 初始化
    init: function (initArgs, wsConn) {
        this.uid = initArgs.uid;
        this.info.name = initArgs.name;
        this.info.headpic = initArgs.headpic;
        this.info.sex = initArgs.sex;

        // this.info.card = initArgs.card;
        // this.info.score = initArgs.score;
        this.info.playedNum = initArgs.playedNum;
        this.info.winNum = initArgs.winNum;

        this.wsConn = wsConn;
        this.wsConn.pushCloseHandler(function () {
            this.onConnClosed();
        }.bind(this));
        this.online = true;
        this.dealer = false;
        this.ready = false;
        this.handCards = new HandCards(this);
        this.score = 0;
    },

    // 新一轮游戏重置数据
    reset: function () {
        this.handCards.reset();
        this.gangState = null;
        this.pengState = null;
        this.huState = null;
        this.eatState = null;
        this.over = false;

        this.buyNum = 0; //买分重置
        this.buyScore = 0;// 买分结算分
        this.maNum = 0; // 码数(抓鸟 中码数量)
        this.gangScore = 0; //杠分数
        this.roundScore = 0;// 本轮积分情况(总计数)
        this.fanNum = 0;  //番数
        this.isZm = false;

        this.pengdPlayer = {}; //碰的玩家{k,v} k碰的麻将, v被碰的玩家
        this.gangedPlayers = {}; //杠的玩家{k,v} k碰的麻将, v被碰的玩家
        this.huedPlayer = []; //被胡的玩家
    },

    destroy: function () {
        if (this.isInited()) {
            this.online = false;
            // this.wsConn.close();
        }
    },
    //关闭连接
    onConnClosed: function () {
        if (this.online) {
            this.online = false;
            this.owner.onPlayerOffline(this);
        }
    },

    /**
     * 设置新连接
     * @param wsConn
     */
    setNewConn: function (wsConn) {
        this.wsConn = wsConn;
        this.wsConn.pushCloseHandler(function () {
            this.onConnClosed();
        }.bind(this));
        this.online = true;
    },

    onReconnect: function () {
        // 发送缓存的数据包
        if (this.queuedPackets.length > 0) {
            this.queuedPackets.forEach(function (msg) {
                this.sendMsg(msg.code, msg.args);
            }.bind(this));
            this.queuedPackets = [];
        }
    },

    // 获取玩家胡的牌
    getHuNeedCard: function () {
        return this.handCards.huMjs;
    },

    //退出
    exit: function() {
        this.uid = 0;
        this.ready = false;
        this.handCards = null;
        this.online = false;
        this.wsConn.close();
        this.wsConn = null;
    },

    // 判断玩家是否已经初始化
    isInited: function () {
        return this.uid != 0;
    },

    // 设置是否庄家
    setDealer: function (dealer) {
        this.dealer = dealer;
    },

    //是否有人
    isPlayer: function (uid) {
        return this.uid == uid;
    },

    // 获取数据 ->基础数据
    getInfo: function () {
        return {
            uid: this.uid,
            name: this.info.name,
            headpic: this.info.headpic,
            sex: this.info.sex,
            // card: this.info.card,
            // score: this.info.score,
            playedNum: this.info.playedNum,
            winNum: this.info.winNum,
            ip: this.wsConn.getAddrString(),
            ready: this.ready,
            buyNum: this.buyNum,
        };
    },

    // 获取重新连接数据
    getRecInfo: function (isOwn) {
        var preMj = this.owner.prePlayMj;
        var recArgs = {
            uid: this.uid,
            name: this.info.name,
            headpic: this.info.headpic,
            sex: this.info.sex,
            ready: this.ready,
            playedCards: this.handCards.played,
            pengedCards: this.handCards.getPengMj(),
            gangedCards: this.handCards.getGangMj(),
            eatedCards: this.handCards.getEatMj(),
            gangType: this.handCards.gangFlagType,
            score: this.score,
            buyNum: this.buyNum,
            isZm : this.isZm,
            huedPlayer : this.huedPlayer,
            grab: {
                pengState: this.pengState,
                gangState: this.gangState,
                huState: this.huState,
                eatState: this.eatState == Enum.GrabState.GRABING ? [preMj, this.handCards.eatType(preMj)] : null
            }, //抢牌的状态
            pengdPlayer: this.pengdPlayer,
            gangedPlayer: this.gangedPlayers,
        };

        if (this.online) {
            recArgs.ip = this.wsConn.getAddrString();
        }

        if (this.online) {
            recArgs.ip = this.wsConn.getAddrString();
        }
        if (isOwn) {
            recArgs.handCards = this.handCards.getSync();
        } else {
            recArgs.handCards = null;
        }
        return recArgs;
    },

    //准备
    setReady: function (ready) {
        this.ready = ready;
    },

    getReady: function () {
        return this.ready;
    },

    // 获取结算信息
    getSettementInfo: function (final) {
        if (!final) {
            this.roundScore = this.buyScore + this.maNum + this.gangScore + this.fanNum;
            this.score += this.roundScore;
            if (this.handCards.humj != null) {
                this.handCards.removeMjs(this.handCards.humj);
            }
            return {
                buyScore: this.buyScore,                    //买分
                maNum: this.maNum,                          //码分
                gangScore: this.gangScore,                  //杠分
                fanNum: this.fanNum,                       //番分
                score: this.score,                       // 总积分
                roundScore: this.roundScore,             // 单局积分
                cardInfo: this.handCards.getSync(),   // 手牌信息
                pengedCards: this.handCards.getPengMj(), //碰牌
                gangedCards: this.handCards.getGangMj(), //杠牌
                eatedCards: this.handCards.getEatMj(), //吃牌
                huMj: this.handCards.humj,              //胡牌
                gangType: this.handCards.gangFlagType,
                isZm : this.isZm,
                huedPlayer : this.huedPlayer,
            };
        } else {
            return {
                uid: this.uid,                             // uid
                score: this.score,                         // 结算总积分
                huPaiNum: this.huPaiNum,                   //胡牌次数
                dianPaoNum: this.dianPaoNum,               //自摸次数
                gangNum: this.gangNum,                     //杠次数
                ziMoNum: this.ziMoNum,                     //点炮次数
            };
        }
    },


    // 设置手牌
    setHandCards: function (cards) {
        // this.reset();
        this.handCards.init(cards);
        this.sendMsg(Opcodes.S2C_SET_PLAYER_CARDS, {
            cards: this.handCards.getSync(),
            curRound: this.owner.curRound,
            reMain: this.owner.cardNum * 4 - 13 * 4 - 1
        });
    },


    /**
     * 重置抢牌状态
     */
    resetGrabState: function () {
        this.pengState = null;
        this.gangState = null;
        this.huState = null;
        this.eatState = null;

    },
    // 发送消息
    sendMsg: function (code, msg) {
        if (this.online) {
            this.wsConn.sendMsg({
                code: code,
                args: msg,
            });

            if (code != Opcodes.SMSG_BROADCAST_MESSAGE) {
                DEBUG(util.format("Send %d - \"%j\" To %d", code, msg, this.uid));
            }
        } else {
            this.queuedPackets.push({
                code: code,
                args: msg,
            });
        }
    },

    // 生成战报
    buildReport: function (roomId, time) {
        return {
            uid: this.uid,
            wx_name: this.info.name,
            time: time,
            roomId: roomId,
            score: this.score,
        };
    },

};
Player.MSG_PLAYER_OFFLINE = 108;  // 玩家离线
exports.Player = Player;
exports.HandCards = HandCards;