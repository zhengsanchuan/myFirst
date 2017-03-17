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
    this.MJ_MAX_ID = 27;
    this.owner = owner;
    this.num = 0;
    this.mjs = Func.twoDimensionalArray(3, 9, null); //手牌 (筒条万)
    this.pengFlag = Func.twoDimensionalArray(3, 9, false); //碰的牌
    this.gangFlag = Func.twoDimensionalArray(3, 9, false) //杠的牌
    this.mjCounts = Func.oneDimensionalArray(3); //数量统计
    this.played = []; //打过的牌
    this.lastMj = 0;//最后摸的牌
    this.huMjs = {}; //胡的麻将
    this.huMj = null;//最后胡的麻将
    this.miss = null; //缺
    this.exchangeNum = 0;
    this.jiangNum = null; // 将牌
    this.passHuMaxMultiple = 0;

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
        this.num = 0;
        this.mjs = Func.twoDimensionalArray(3, 9, null); //手牌 (筒条万)
        this.pengFlag = Func.twoDimensionalArray(3, 9, false); //碰的牌
        this.gangFlag = Func.twoDimensionalArray(3, 9, false) //杠的牌
        this.mjCounts = Func.oneDimensionalArray(3); //数量统计
        this.played = []; //打过的牌
        this.lastMj = 0;//最后摸的牌
        this.huMjs = {}; //胡的麻将
        this.huMj = null;//最后胡的麻将
        this.miss = null; //缺
        this.exchangeNum = 0;
        this.jiangNum = null; // 将牌
        this.passHuMaxMultiple = 0;
    },

    /**
     * 增加麻将
     * @param mjId
     */
    addMjs: function (mjId) {
        // console.log(mjId);
        this.mjs[parseInt((mjId - 1) / 9)][(mjId - 1) % 9]++;
        this.mjCounts[parseInt((mjId - 1) / 9)]++;
        this.lastMj = mjId;
    },

    /**
     * 增加麻将
     * @param mjs
     */
    addMjsByMjs: function (mjs) {
        for (var index in mjs) {
            this.addMjs(mjs[index]);
        }
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
     * 移除麻将
     * @param mjId
     */
    removeMjsByMjs: function (mjs) {
        for (var index in mjs) {
            this.removeMjs(mjs[index]);
        }
    },

    /**
     * 万的张数
     * @returns {*}
     */
    getWanCount: function () {
        return this.getCount(2);
    },

    /**
     * 筒的张数
     * @returns {*}
     */
    getTongCount: function () {
        return this.getCount(0);

    },

    /**
     * 缺的张数
     * @return {*}
     */
    getMissingCount: function () {
        return this.getCount(this.miss);

    },

    /**
     * 条的张数
     * @returns {*}
     */
    getTiaoCount: function () {
        return this.getCount(1);
    },

    getCount: function (index) {
        return this.mjCounts[index];
    },

    getLastDrawMj: function () {
        return this.lastMj;
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
     * 获取根数
     * @return {number}
     */
    getGenCount: function () {
        var count = 0;
        for (var typeIndex = 0; typeIndex < this.mjs.length; typeIndex++) {
            for (var numIndex = 0; numIndex < this.mjs[typeIndex].length; numIndex++) {
                if (this.mjs[typeIndex][numIndex] == 4) {
                    count++;
                }
                if (this.pengFlag[typeIndex][numIndex] && this.mjs[typeIndex][numIndex] == 1) {
                    count++;
                }
            }
        }
        return count;
    },


    /**
     * 计算查听
     * @returns {{}}
     */
    calcTingPai: function () {
        var tingPai = {}
        for (var playMj = 1; playMj <= this.MJ_MAX_ID; playMj++) {
            if (this.contains(playMj)) {
                this.removeMjs(playMj);
                for (var huMj = 1; huMj <= this.MJ_MAX_ID; huMj++) {
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
     * 是否有该麻将
     * @param mjId
     */
    containsMjs: function (mjs) {
        for (var index in mjs) {
            if (!this.contains(mjs[index])) {
                return false;
            }
        }
        return true;
    },


    /**
     * 复制麻将
     * @returns {Array}
     */
    copyMjs: function () {
        var len = this.mjs.length;
        var cp = Func.twoDimensionalArray(3, 9, null);
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
     * 是否花猪
     * @param mjId
     * @return {boolean}
     */

    isHuaZhu: function () {
        return this.getCount(this.miss) != 0;
    },

    /**
     * 是否无听
     * @param mjId
     * @return {boolean}
     */

    isWuTing: function () {
        return Object.keys(this.huMjs).length == 0;
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
     * 同种花色
     * @param cards
     * @return {boolean}
     */
    isSameKind: function (cards) {
        var sameType = null;
        for (var index in cards) {
            var typeIndex = parseInt((cards[index] - 1) / 9);
            if (typeIndex != sameType && sameType != null) {
                return false;
            } else {
                sameType = typeIndex;
            }
            if (index == cards.length - 1) {
                return true;
            }
        }
        return false;
    },


    /**
     * 出牌
     * @param mjId
     */
    playMj: function (mjId) {
        this.removeMjs(mjId);
        this.calcHuMjs();
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
     * @Description:计算自动出牌的麻将,先出缺，再出最后摸的牌
     * @return		number
     */
    autoPlayMj :function() {
        // 缺牌的合计数量
        var missingCount = this.getCount(this.miss);
        if (missingCount > 0) {
            var typeMjs = this.mjs[this.miss];
            for (var numIndex = 0; numIndex < typeMjs.length; numIndex++) {
                var count = typeMjs[numIndex];
                if (count > 0) {
                    return (this.miss * 9 + numIndex+ 1);
                }
            }
        }

        return this.lastMj;
    },


    /**
     * 计算胡牌麻将
     */

    calcHuMjs: function () {
        this.huMjs = {};
        for (var huMj = 1; huMj <= this.MJ_MAX_ID; huMj++) {
            this.addMjs(huMj);
            var huType = Func.huPai(this);
            if (huType != null) {
                // this.huMjs.put(huMj, Func.calcHuMultiple(huType));
                this.huMjs[huMj] = Func.calcHuMultiple(this, huType);
            }
            this.removeMjs(huMj);
        }
    },

    /**
     * 被抢牌
     * @param mjId
     */
    playedRemove : function (mjId) {
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
     * 是否可以碰
     * @param mjId
     * @return {boolean}
     */
    pengAble: function (mjId) {
        var typeIndex = parseInt((mjId - 1) / 9);
        return this.mjs[typeIndex][(mjId - 1) % 9] > 1 && typeIndex != this.miss;

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
    huAble: function (mjId) {
        // if (this.played.length == 0 && !Enum.validContains(this.owner.owner.playMeThod3, Enum.PlayMethod.TIAN_DI_HU)) {
        //     return false;
        // }
        return this.huMjs.hasOwnProperty(mjId) && this.huMjs[mjId] > this.passHuMaxMultiple;
    },

    /**
     *
     * 是否可以杠
     * @param mjId
     * @return {boolean}
     */

    gangAble: function (mjId) {
        var typeIndex = parseInt((mjId - 1) / 9);
        return this.gangType(mjId) != null && typeIndex != this.miss;
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
        return this.mjCounts[0] + this.mjCounts[1] + this.mjCounts[2];
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

    //清一色
    isQingYiSe: function () {
        var wanFlg = false;
        var tongFlg = false;
        var tiaoFlg = false;
        for (var mjId = 1; mjId <= this.MJ_MAX_ID; mjId++) {
            var typeIndex = parseInt((mjId - 1) / 9);
            var numIndex = (mjId - 1) % 9;
            if (this.mjs[typeIndex][numIndex] > 0 || this.pengFlag[typeIndex][numIndex] || this.gangFlag[typeIndex][numIndex]) {
                if (typeIndex == 0) {
                    wanFlg = true;
                } else if (typeIndex == 1) {
                    tongFlg = true;
                } else if (typeIndex == 2) {
                    tiaoFlg = true;
                }
            }
        }
        return (wanFlg && !tongFlg && !tiaoFlg) || (!wanFlg && tongFlg && !tiaoFlg) || (!wanFlg && !tongFlg && tiaoFlg);

    },
    //金钓钓
    isJingDiaoDiao: function () {
        return this.getTotalCount() == 2;
    },

    //门清
    isMenQing: function () {
        return this.getTotalCount() == 14;

    },

    //中张
    isZhongZhang: function () {
        var flag = null;
        if (this.jiangNum == 1 || this.jiangNum == 9) {
            return false;
        }
        this.getPengMj().forEach(function (mj) {
            var numIndex = (mj - 1) % 9;
            if (numIndex == 0 || numIndex == 8) {
                flag = false;
                return;
            }
        });
        this.getGangMj().forEach(function (mj) {
            var numIndex = (mj - 1) % 9;
            if (numIndex == 0 || numIndex == 8) {
                flag = false;
                return;
            }
        });

        if (flag != null && !flag) {
            return flag;
        }
        for (var typeIndex = 0; typeIndex < this.mjs.length; typeIndex++) {
            var typeMjs = this.mjs[typeIndex];
            for (var numIndex = 0; numIndex < typeMjs.length; numIndex++) {
                if (typeMjs[numIndex] > 0 && (numIndex == 0 || numIndex == 8)) {
                    return false;
                }
            }
        }
        return true;
    },
    //带幺(幺九)
    isDaiYao: function () {
        var pengMj = this.getPengMj();
        var gangMj = this.getGangMj();
        for (var mId in pengMj) {
            if (!Enum.validYaoJiu((pengMj[mId] - 1)) % 9) {
                return false;
            }
        }
        for (var mId in gangMj) {
            if (!Enum.validJiang((gangMj[mId] - 1)) % 9) {
                return false;
            }
        }
        return Func.isDaiYao(this);
    },
    //将对
    isJiangDui: function () {
        var pengMj = this.getPengMj();
        var gangMj = this.getGangMj();
        for (var mId in pengMj) {
            if (!Enum.validJiang((pengMj[mId] - 1)) % 9) {
                return false;
            }
        }
        for (var mId in gangMj) {
            if (!Enum.validJiang((gangMj[mId] - 1)) % 9) {
                return false;
            }
        }
        return Func.isJiangDui(this);

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

function Player(owner, index) {
    this.owner = owner;    // 房间对象
    this.index = index;    // 玩家位置

    this.uid = 0;        // 玩家ID
    this.info = {};       // 玩家信息
    this.wsConn = null;     // WebSocket连接对象
    this.online = false;    // 玩家是否在线
    this.queuedPackets = [];       // 数据包

    this.roomCard = 0; // 房卡数量
    this.useRoomCard = 0 //道具使用的房卡

    this.freeUseProp = 0 ; // 免费使用道具次数

    this.score = 0;        // 积分
    this.roundScore = 0;        // 本轮积分情况
    this.gangScore = 0;        //杠分
    this.gangDtail = {};       //杠分明细

    this.dealer = false;    // 是否庄家
    this.ready = false;    // 玩家是否就绪
    this.handCards = null;     // 手牌

    this.totalMultiple = 0;    //胡牌番数

    this.huPaiNum = 0;        // 胡牌次数
    this.ziMoNum = 0 ;         //自摸次数
    this.dianPaoNum = 0;      // 点炮次数
    // this.jiePaoNum = 0;              // 接炮次数
    this.mingGangNum = 0;              // 明杠次数
    this.anGangNum = 0;               // 暗杠次数
    this.chaDaJiao = 0            // 查叫次数

    this.chaJiao = false;             // 查叫

    this.over = false; //是否结束
    this.huSqu = 0; //第几个胡

    this.gangRecord = {};      //记录杠类型

    this.gangState = null;  //杠的状态
    this.pengState = null; //碰的状态
    this.huState = null; //胡的状态

    this.huedPlayer = {}; //被胡的玩家
    this.recordDetai = []; //结算详情

    this.lastGangPoint = 0;  //上一个杠分
}

Player.prototype = {

    // 初始化
    init: function (initArgs, wsConn) {
        this.uid = initArgs.uid;
        this.info.name = initArgs.name;
        this.info.headpic = initArgs.headpic;
        this.info.sex = initArgs.sex;
        this.roomCard = initArgs.roomCard;
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
        this.roundScore = 0;
        this.handCards.reset();
        this.totalMultiple = 0;
        this.gangScore = 0 ;
        this.gangDtail = {};
        this.gangState = null;
        this.pengState = null;
        this.huState = null;
        this.over = false;
        // this.huSqu = 0;
        this.ready = false;
        this.huedPlayer = {}; //被胡的玩家
        this.gangRecord = {}; //记录杠类型
        this.chaJiao = false;
        this.recordDetai = []; //结算详情
        this.lastGangPoint = 0;  //上一个杠分
    },

    destroy: function () {
        if (this.isInited()) {
            this.online = false;
            setTimeout(function () {
                // 几秒钟后断开连接
                this.wsConn.close();
            }.bind(this), 2000);
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

    exit: function() {
        this.uid = 0;
        this.ready = false;
        this.handCards = null;
        this.online = false;
        this.wsConn.close();
        this.wsConn = null;
    },

    // 获取数据 ->基础数据
    getInfo: function () {
        return {
            uid: this.uid,
            name: this.info.name,
            headpic: this.info.headpic,
            sex: this.info.sex,
            ip: this.wsConn.getAddrString(),
            ready: this.ready,
            online : this.online
        };
    },

    // 获取重新连接数据
    getRecInfo: function (isOwn) {
        var recArgs = {
            uid: this.uid,
            name: this.info.name,
            headpic: this.info.headpic,
            roomCard: this.roomCard, //房卡
            useRoomCard: this.useRoomCard, //道具使用的房卡
            freeUseProp: this.freeUseProp = 0, // 免费使用道具次数
            sex: this.info.sex,
            ready: this.ready,
            playedCards: this.handCards.played,
            pengedCards: this.handCards.getPengMj(),
            gangedCards: this.handCards.getGangMj(),
            huedCards: this.handCards.huMj,
            miss: this.handCards.miss,
            score: this.score,
            exchange: this.handCards.exchangeNum,
            exchangeCard: this.handCards.exchangeNum > 0 ? this.owner.exchangeMjs[this.index] : [],
            huSqu: this.huSqu, //胡的顺序
            grab: {
                pengState: this.pengState,
                gangState: this.gangState,
                huState: this.huState,
            }, //抢牌的状态
            huedPlayer : this.huedPlayer, //被胡的玩家{k,v} k玩家位置, v 番数
            online : this.online,
            gangRecord: this.gangRecord,                    //杠记录 {k, v} k杠的牌, v杠的类型
            recordDetai: this.recordDetai                   //结算详情
        };
        if (this.online) {
            recArgs.ip = this.wsConn.getAddrString();
        }
        if (isOwn) {
            recArgs.handCards = this.handCards.getSync();
            recArgs.lastMoPai = this.handCards.getLastDrawMj()
        } else {
            recArgs.handCards = null;
            recArgs.lastMoPai = null;
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
            this.roundScore += this.gangScore; // 加上杠分
            this.score += this.roundScore;
            return {
                score: this.score,                              //总积分
                roundScore: this.roundScore,                  // 单局积分
                gangScore : this.gangScore,                    //杠分
                totalMultiple: this.totalMultiple,            // 单局番数
                cardInfo: this.handCards.getSync(),             //手牌信息
                pengedCards: this.handCards.getPengMj(),        //碰的牌
                gangedCards: this.handCards.getGangMj(),        //杠的牌
                huCard: this.handCards.huMj,                     // 胡的牌
                chaJiao : this.chaJiao,                         //查叫
                gangRecord: this.gangRecord,                    //杠记录
                recordDetai: this.recordDetai                   //结算详情
            };
        } else {
            return {
                score: this.score,                             // 当前积分
                huPaiNum: this.huPaiNum,                       // 胡牌(接炮)次数
                ziMoNum : this.ziMoNum,                        //自摸次数
                dianPaoNum: this.dianPaoNum,                   //  点炮次数
                // jiePaoNum: this.jiePaoNum,                     // 接炮次数
                mingGangNum: this.mingGangNum,                 // 明杠次数
                anGangNum: this.anGangNum,                     // 暗杠次数
                chaDaJiao: this.chaDaJiao,                     // 查叫次数
            };
        }
    },


    // 设置手牌
    setHandCards: function (cards) {
        this.handCards.init(cards);
        this.sendMsg(Opcodes.S2C_SET_PLAYER_CARDS, {
            cards: this.handCards.getSync()
        });
    },


    /**
     * 重置抢牌状态
     */
    resetGrabState: function () {
        this.pengState = null;
        this.gangState = null;
        this.huState = null;

    },
    // 发送消息
    sendMsg: function (code, msg) {
        if (this.online) {
            this.wsConn.sendMsg({
                code: code,
                args: msg,
            });

            if (code != Opcodes.S2C_BROADCAST_MESSAGE1) {
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
            name: this.info.name,
            time: time,
            roomId: roomId,
            score: this.score,
        };
    },

};
Player.MSG_PLAYER_OFFLINE = 108;  // 玩家离线
exports.Player = Player;
exports.HandCards = HandCards;