/******************************************************************************
 * Author:      671643387
 * Created:     2016/10/26
 *****************************************************************************/

var util            = require("util");
var Enum            = require("./Enum.js");
var ProtoID         = require("../../../net/ProtoID.js").ProtoID;
var ProtoState      = require("../../../net/ProtoID.js").ProtoState;
var Opcodes         = require("./Opcodes.js").Opcodes;
var Func            = require("./Func.js");

///////////////////////////////////////////////////////////////////////////////
//>> 玩家手牌

function HandCards(owner) {
    this.owner  = owner;
    this.debug  = true;
    this.num    = 0;
    this.cards  = [];   // 手牌

    this.KANs   = [];   // 坎
    this.TIs    = [];   // 提
    this.SAOs   = [];   // 扫
    this.PENGs  = [];   // 碰
    this.CHIs   = [];   // 吃
    this.LUOs   = [];   // 落
    this.PAOs   = [];   // 跑

    this.chiInfo = [];  // 计算的吃牌信息

    this.passInfo = []; // 过牌信息

    this.paoRevInfo = {};
}

HandCards.prototype = {

    // 初始化
    init: function (cards) {
        // 初始化结构
        for (var iCard = 0; iCard < 20; ++iCard) {
            this.cards.push(0);
        }

        // 初始化牌组
        cards.forEach(function(card){
            this.cards[card - 1] += 1;
            this.num += 1;
        }.bind(this));
    },

    // 重置
    reset: function() {
        this.num = 0;
        this.cards = [];

        this.KANs   = [];
        this.TIs    = [];
        this.SAOs   = [];
        this.PENGs  = [];
        this.CHIs   = [];
        this.LUOs   = [];
        this.PAOs   = [];

        this.chiInfo = [];
        this.passInfo = [];
    },

    /**
     * 添加过牌信息
     * @param card
     * @param type(1碰2吃)
     */
    addPassInfo: function(card, type) {
        this.passInfo.push({
            card    : card,
            type    : type,
        });
    },

    // 获取有多少个字
    getNumWords: function () {
        return this.KANs.length + this.TIs.length
            + this.SAOs.length + this.PENGs.length
            + this.CHIs.length + this.LUOs.length
            + this.PAOs.length;
    },

    // 获取卡牌结算信息
    getSettementInfo: function() {
        return {
            kanSes      : this.KANs,
            tiSes       : this.TIs,
            saoSes      : this.SAOs,
            pengSes     : this.PENGs,
            chiSes      : this.CHIs,
            paoSes      : this.PAOs,
            luoSess     : this.LUOs,
            remainCards : this.cards,
        };
    },

    // 获取卡片数量
    getCardsNum: function() {
        return this.num;
    },

    // 枚举手牌
    enum: function(enumtor) {
        this.cards.forEach(enumtor);
    },

    getSync: function() {
        return { cards: this.cards };
    },

    modifyCard: function(card, num) {
        this.cards[card - 1] += num;
        this.num += num;

        if (!((this.cards[card - 1] >= 0)
            && (this.cards[card - 1] <= 4) && (this.num >= 0))) {
            DEBUG(util.format("Player %d, card -> %d, num -> %d, cards -> %j",
            this.owner.uid, card, num, this.cards));
            Assert(false, "MODIFY CARD BUG");
        }
        if (this.debug) {
            DEBUG(util.format("Player %d card -> %d", this.owner.uid, this.num));
        }
    },

    modifyCards: function(cards, num, excludes) {
        excludes = excludes || [];
        cards.forEach(function(card){
            if ((excludes.indexOf(card) == -1) && (card != 0)) {
                this.modifyCard(card, num);
            }
        }.bind(this));
    },

    // 出牌
    play: function(card) {
        if (this.cards[card - 1] > 0) {
            this.modifyCard(card, -1);
            return true;
        }
        return false;
    },

    peng: function(card, curPlay, cardType) {
        this.modifyCard(card, -2);
        this.PENGs.push({
            card    : card,
            owner   : curPlay,
            type    : cardType,
        });
    },

    revPeng: function(card) {
        this.modifyCard(card, 2);
        this.PENGs.splice(-1, 1);
    },

    getPengs: function() {
        return this.PENGs;
    },

    chi: function(card, curPlay, chiSes, luoSess) {
        // 扣除吃牌
        var chiIndex = chiSes.indexOf(card);
        chiSes[chiIndex] = 0;
        this.modifyCards(chiSes, -1);
        chiSes[chiIndex] = card;
        // 扣除落牌
        luoSess.forEach(function (luoSes) {
            this.modifyCards(luoSes, -1);
        }.bind(this));

        this.CHIs.push({
            card    : card,
            owner   : curPlay,
            ses     : chiSes,
        });
        if (luoSess.length > 0) {
            this.LUOs.push({
                card    : card,
                owner   : curPlay,
                ses     : luoSess
            });
        }

        return true;
    },

    getChis: function() {
        return this.CHIs;
    },

    // 检查坎
    checkKan: function() {
        for (var idx = 0; idx < this.cards.length; ++ idx) {
            var cardNum = this.cards[idx];
            if (cardNum == 3) {
                this.KANs.push(idx + 1);
                this.modifyCard(idx + 1, -3);
            }
        }
        return this.KANs.length != 0;
    },

    // 获取坎
    getKANs: function() {
        return this.KANs;
    },

    // 检查提
    checkTi: function(card) {
        card = card || 0;
        if (card == 0) {
            for (var idx = 0; idx < this.cards.length; ++idx) {
                var cardNum = this.cards[idx];
                if (cardNum == 4) {
                    this.TIs.push({
                        card    : idx + 1,
                        type    : 1,        // 开局提
                    });
                    this.modifyCard(idx + 1, -4);
                    return true;
                }
            }
        } else {
            // 检查坎牌能否提
            for (var idx = 0; idx < this.KANs.length; ++idx) {
                if (this.KANs[idx] == card) {
                    this.KANs.splice(idx, 1);
                    this.TIs.push({
                        card    : card,
                        type    : 2,        // 坎/扫提
                    });
                    return true;
                }
            }

            // 检查扫牌能否提
            for (var idx = 0; idx < this.SAOs.length; ++idx) {
                if (this.SAOs[idx] == card) {
                    this.SAOs.splice(idx, 1);
                    this.TIs.push({
                        card    : card,
                        type    : 2,        // 坎/扫提
                    });
                    return true;
                }
            }
        }

        return false;
    },

    // 获取提
    getTis: function() {
        return this.TIs;
    },

    // 检查扫牌
    checkSao: function(card) {
        if (this.cards[card - 1] == 2) {
            // 可以扫牌
            this.SAOs.push(card);
            this.modifyCard(card, -2);

            return true;
        }
        return false;
    },

    // 获取已经扫拍次数
    getSaoNum: function() {
        return this.SAOs.length
            + this.PENGs.length
            + this.TIs.length
            + this.KANs.length
            + this.PAOs.length;
    },

    // 是否5胡
    is5Hu: function() {
        var numCheck = (this.SAOs.length + this.PENGs.length + this.KANs.length);
        return (numCheck == 4) || (numCheck == 5);
    },

    // 能否碰牌
    checkPeng: function(card) {
        // 检查过张
        for (var key in this.passInfo) {
            if (!this.passInfo.hasOwnProperty(key)) {
                continue;
            }
            var passedCard = this.passInfo[key];
            if (passedCard.type == 1 && passedCard.card == card) {
                return false;
            }
        }

        return (this.cards[card - 1] == 2);
    },

    // 检查能否吃牌
    checkChi: function(card) {
        // 检查过张
        for (var key in this.passInfo) {
            if (!this.passInfo.hasOwnProperty(key)) {
                continue;
            }
            var passedCard = this.passInfo[key];
            if (passedCard.type == 2 && passedCard.card == card) {
                DEBUG(util.format("检查过张失败, %d-%d", this.owner.uid, card));
                return false;
            }
        }

        var checkCards = clone(this.cards);
        checkCards[card - 1] += 1;
        var chiInfo = Func.calcChiInfo(checkCards, card);
        this.chiInfo = chiInfo;
        return chiInfo.length != 0;
    },

    // 获取计算的吃牌信息
    getCheckedChiInfo: function() {
        return this.chiInfo;
    },

    // 检查能否跑牌
    checkPao: function(hangupTask, isOwn) {
        var card = hangupTask.getPlayedCard();
        var cardType = hangupTask.getPlayedCardType();
        var curPlay = hangupTask.getCurPlay();

        if (this.KANs.length > 0 && !isOwn) {
            if (this.KANs.indexOf(card) != -1) {
                if (cardType == Enum.PlayedCardType.PLAYED_CARD_PUB) {
                    // 公牌
                    return {
                        card    : card,
                        type    : 1,
                        scores  : [-4, -4, -4, -4],
                    };
                } else {
                    // 手牌
                    var scores = [0, 0, 0, 0];
                    scores[curPlay - 1] = -12;
                    return {
                        card    : card,
                        type    : 1,
                        scores  : scores,
                    };
                }
            }
        }

        if ((this.PENGs.length > 0) && (cardType == Enum.PlayedCardType.PLAYED_CARD_PUB)) {
            for (var key in this.PENGs) {
                if (!this.PENGs.hasOwnProperty(key)) {
                    continue;
                }

                var PENG = this.PENGs[key];
                if (PENG.card == card) {
                    if (PENG.type == Enum.PlayedCardType.PLAYED_CARD_PUB) {
                        // 公牌
                        return {
                            card    : card,
                            type    : 2,
                            scores  : [-4, -4, -4, -4],
                        };
                    } else {
                        // 手牌
                        var scores = [0, 0, 0, 0];
                        scores[PENG.owner - 1] = -12;
                        return {
                            card    : card,
                            type    : 2,
                            scores  : scores,
                            owner   : PENG.owner,
                        };
                    }
                    break;
                }
            }
        }

        if (this.SAOs.length > 0 && !isOwn) {
            if (this.SAOs.indexOf(card) != -1) {
                if (cardType == Enum.PlayedCardType.PLAYED_CARD_PUB) {
                    // 公牌
                    return {
                        card    : card,
                        type    : 3,
                        scores  : [-4, -4, -4, -4],
                    };
                } else {
                    // 手牌
                    var scores = [0, 0, 0, 0];
                    scores[curPlay - 1] = -12;
                    return {
                        card    : card,
                        type    : 3,
                        scores  : scores,
                    };
                }
            }
        }

        return null;
    },

    // 跑牌
    pao: function(card, type) {
        switch (type) {
            case 1:
                var kanIndex = this.KANs.indexOf(card);
                if (kanIndex != -1) {
                    this.paoRevInfo = {
                        type : 1,
                        card : card,
                    };
                    this.KANs.splice(kanIndex, 1);
                    this.PAOs.push(card);
                    return true;
                }
                break;

            case 2:
                var pengIndex = -1;
                for (var key in this.PENGs) {
                    if (!this.PENGs.hasOwnProperty(key)) {
                        continue;
                    }

                    var PENG = this.PENGs[key];
                    if (PENG.card == card) {
                        pengIndex = +key;
                        break;
                    }
                }
                if (pengIndex != -1) {
                    this.paoRevInfo.type = 2;
                    this.paoRevInfo.peng = this.PENGs.splice(pengIndex, 1);
                    this.PAOs.push(card);
                    return true;
                }
                break;

            case 3:
                var saoIndex = this.SAOs.indexOf(card);
                if (saoIndex != -1) {
                    this.paoRevInfo = {
                        type : 3,
                        card : card,
                    };
                    this.SAOs.splice(saoIndex, 1);
                    this.PAOs.push(card);
                    return true;
                }
                break;
        }

        return false;
    },

    revPao: function() {
        switch (this.paoRevInfo.type) {
            case 1:
                this.KANs.push(this.paoRevInfo.card);
                this.PAOs.splice(-1, 1);
                break;

            case 2:
                this.PENGs.push(this.paoRevInfo.peng[0]);
                this.PAOs.splice(-1, 1);
                break;

            case 3:
                this.SAOs.push(this.paoRevInfo.card);
                this.PAOs.splice(-1, 1);
                break;
        }
        this.paoRevInfo = {};
    },

    getPAOs: function() {
        return this.PAOs;
    },

    can5Hu: function() {
        var checkOk = false;
        var numPS = this.PENGs.length + this.KANs.length + this.SAOs.length;
        if ((numPS == 4)) {
            Assert(this.num == 2, "MUST RES 2 CARD");
            this.cards.forEach(function(card){
                if (card == 2) {
                    checkOk = true;
                }
            });
        }
        return checkOk;
    },
};

///////////////////////////////////////////////////////////////////////////////
//>> 游戏玩家

function Player(owner, index) {
    this.owner          = owner;    // 房间对象
    this.index          = index;    // 玩家位置

    this.uid            = 0;        // 玩家ID
    this.info           = {};       // 玩家信息
    this.wsConn         = null;     // WebSocket连接对象
    this.online         = false;    // 玩家是否在线
    this.queuedPackets  = [];       // 数据包

    this.score          = 0;        // 积分
    this.roundScore     = 0;        // 本轮积分情况
    this.dealer         = false;    // 是否庄家
    this.ready          = false;    // 玩家是否就绪
    this.handCards      = null;     // 手牌
    this.lianZhuangNum  = 0;        // 连庄次数
    this.lianHuNum      = 0;        // 连续胡牌次数

    this.huNeedCard     = 0;        // 胡的牌
    this.huPaiMethods   = [];       // 胡牌方式
    this.huPaiMethod    = 0;        // 胡牌方式

    this.huPaiNum       = 0;        // 胡牌次数
    this.zhongMasterNum = 0;        // 中庄次数
    this.calcZMaster    = 0;        // 计算中庄次数
    this.dianPaoNum     = 0;        // 点炮次数

    this.playedCards    = [];       // 出的牌
    this.paoInfo        = null;     // 检查的跑牌信息

    this.sendRst        = false;    // 是否发送结算数据

    this.fiveHuWarning  = false;    // 5胡报警
    this.playingCard    = 0;        // 正在出的牌

    this.ppOwner        = 0;        // 跑胡碰的牌的所有者

    this.isZM           = false;    //是否自摸胡
}

Player.prototype = {

    // 初始化
    init: function(initArgs, wsConn) {
        this.uid = initArgs.uid;
        this.info.name = initArgs.name;
        this.info.headpic = initArgs.headpic;
        this.info.sex = initArgs.sex;
        this.wsConn = wsConn;
        this.wsConn.pushCloseHandler(function(){
            this.onConnClosed(wsConn.getId());
        }.bind(this));
        this.online = true;

        this.dealer = false;
        this.ready = true;
        this.handCards = new HandCards(this);

        this.playedCards = [];
    },

    exit: function() {
        this.uid = 0;
        this.ready = false;
        this.handCards = null;
        this.online = false;
        this.wsConn.close();
        this.wsConn = null;
    },

    // 新一轮游戏重置数据
    reset: function() {
        this.roundScore = 0;

        this.handCards.reset();

        this.huNeedCard = 0;
        this.huPaiMethods = [];
        this.huPaiMethod = 0;

        this.playedCards = [];

        this.sendRst = false;
        this.fiveHuWarning = false;

        this.isZM = false;
    },

    setSendRst: function() {
        this.sendRst = true;
    },

    destroy: function() {
        if (this.isInited()) {
            this.online = false;
            this.wsConn.close();
        }
    },

    onConnClosed: function(cid) {
        if (this.online && (cid == this.wsConn.getId())) {
            this.online = false;
            this.owner.onPlayerMsg(this, {
                code    : Player.MSG_PLAYER_OFFLINE,
                args    : {

                }
            });
        }
    },

    onPlayerResped: function(codes) {
        codes = codes || [];
        if (codes.length == 0) {
            // 清理缓存的包
            this.queuedPackets = [];
            return;
        }

        codes.forEach(function(code){
            for (var iPkt = 0; iPkt < this.queuedPackets.length;) {
                if (this.queuedPackets[iPkt].code == code) {
                    this.queuedPackets.splice(iPkt, 1);
                    continue;
                }

                iPkt += 1;
            }
        }.bind(this));
    },

    /**
     * 设置新连接
     * @param wsConn
     */
    setNewConn: function(wsConn) {
        if (this.online) {
            this.kick();
        }

        this.wsConn = wsConn;
        this.wsConn.pushCloseHandler(function(){
            this.onConnClosed(wsConn.getId());
        }.bind(this));
        this.online = true;
    },

    kick: function() {
        this.sendMsg(Opcodes.SMSG_SET_ROOM_FINISHED, {});
        this.online = false;
        this.wsConn.close();
        this.wsConn = null;
        this.onPlayerResped([Opcodes.SMSG_SET_ROOM_FINISHED]);
    },

    onReconnect: function() {
        // 发送缓存的数据包
        if (this.queuedPackets.length > 0) {
            var clonedPackets = clone(this.queuedPackets);
            this.queuedPackets = [];

            setTimeout(function(){
                clonedPackets.forEach(function(msg){
                    this.sendMsg(msg.code, msg.args);
                }.bind(this));
            }.bind(this), 200);
        }
    },

    // 获取玩家胡的牌
    getHuNeedCard: function() {
        return this.huNeedCard;
    },

    setFiveHuWarning: function() {
        this.fiveHuWarning = true;
    },

    // 判断玩家是否已经初始化
    isInited: function() {
        return this.uid != 0;
    },

    // 设置是否庄家
    setDealer: function(dealer, Ok) {
        this.dealer = dealer;
        if (!dealer) {
            this.lianZhuangNum = 0;
        } else if (this.dealer) {
            this.lianZhuangNum += 1;
        }
    },

    getLianZhuangNum : function() {
        return this.lianZhuangNum;
    },

    isPlayer: function(uid) {
        return this.uid == uid;
    },

    isFirstTiPao: function() {
        return ((this.handCards.getTis().length
        + this.handCards.getPAOs().length) == 1);
    },

    // 修改分数
    modifyScore: function(score) {
        // this.score += score;
        this.roundScore += score;
    },

    // 获取数据
    getInfo: function() {
        return {
            uid     : this.uid,
            name    : this.info.name,
            headpic : this.info.headpic,
            sex     : this.info.sex,
            ip      : this.wsConn.getAddrString(),

            online  : this.online,
            ready   : this.ready,

            showReady   : true,
        };
    },

    // 获取重新连接数据
    getRecInfo: function(isOwn, isPlaying) {
        // 过滤不显示的牌
        var playedCards = [];
        this.playedCards.forEach(function(playedCard){
            if (playedCard.show) {
                playedCards.push(playedCard);
            }
        });

        var recArgs = {
            uid     : this.uid,
            name    : this.info.name,
            headpic : this.info.headpic,
            sex     : this.info.sex,

            online  : this.online,
            ready   : this.ready,
            playedCards : playedCards,

            roundScore: this.roundScore,
            score: this.score,
            showReady   : !isPlaying,
        };
        if (this.online) {
            recArgs.ip = this.wsConn.getAddrString();
        }
        recArgs.handCards = this.handCards.getSettementInfo();
        return recArgs;
    },

    setReady: function(ready) {
        this.ready = ready;
    },

    getReady: function() {
        return this.ready;
    },

    // 获取结算信息
    getSettementInfo: function(final) {
        // 替换坎五胡标志为五胡
        var clonedHuMethods = clone(this.huPaiMethods);
        var kan5HuIndex = clonedHuMethods.indexOf(Enum.HupaiMethod.METHOD_KAN_5HU);
        if (kan5HuIndex != -1) {
            clonedHuMethods[kan5HuIndex] = Enum.HupaiMethod.METHOD_5_HU;
        }
        this.score += this.roundScore;

        if (!final) {
            return {
                score       : this.score,                           // 当前积分
                roundScore  : this.roundScore,                      // 累计积分
                huCard      : this.huNeedCard,                      // 胡的牌
                huMethods   : clonedHuMethods,                      // 胡牌方式
                cardInfo    : this.handCards.getSettementInfo(),    // 牌组信息
                subType     : this.isZM ? this.handCards.getSaoNum() : this.handCards.getSaoNum() + 1,       // 碰胡/扫胡
            };
        } else {
            if (this.zhongMasterNum == 0) {
                this.zhongMasterNum = this.calcZMaster;
            }

            return {
                score           : this.score,                           // 当前积分
                roundScore      : this.roundScore,                      // 累计积分
                huCardNum       : this.huPaiNum,                        // 胡牌次数
                zhongZhuangNum  : this.zhongMasterNum,                  // 中庄次数
                dianPaoNum      : this.dianPaoNum,                      // 点炮次数
            };
        }
    },

    // 添加一种胡牌方式
    pushHupaiMethod: function(method) {
        this.huPaiMethods.push(method);
    },

    // 清除胡牌方式
    clearHupaiMethods: function() {
        this.huPaiMethods = [];
    },

    // 获取胡牌方式
    getHupaiMethods: function () {
        return this.huPaiMethods;
    },

    // 设置手牌
    setHandCards: function(cards) {
        this.reset();

        this.handCards.init(cards);
        this.sendMsg(Opcodes.SMSG_SET_PLAYER_CARDS, this.handCards.getSync());

        // 检查能否胡牌
        this.checkHupai(0, false, true);
    },

    // 设置摸的公牌
    setPubCard: function(card, hangupTask) {
        // 检查能否扫牌
        if (this.handCards.checkSao(card)) {

            // 检查能否胡牌(扫胡)
            if (this.checkHupai(card, false, false)) {
                this.isZM = true;
                // 修改胡牌方式
                this.huPaiMethods = [];
                if (this.handCards.is5Hu() && this.fiveHuWarning) {
                    this.pushHupaiMethod(Enum.HupaiMethod.METHOD_5_HU);
                } else {
                    this.pushHupaiMethod(Enum.HupaiMethod.METHOD_SAO_HU);
                }

                if (this.owner.forceHupai) {
                    // 强制胡牌，立即胡牌
                    this.owner.onPlayerMsg(this, {
                        code    : Player.MSG_HU_CARD,
                        args    : {
                            card    : card,
                        }
                    });
                } else {
                    // 发送通知，等待玩家选择
                    hangupTask.addHuCardPlayer(this.index);
                    this.sendMsg(Opcodes.SMSG_SET_TIPS, {
                        tips: {
                            marks   : [Enum.PlayerTips.PLAYER_TIP_HU],
                            args    : {},
                        }
                    });
                }
                return true;
            }

            this.owner.onPlayerMsg(this, {
                code    : Player.MSG_SAO_CARD,              // 玩家扫牌
                args    : {
                    order   : this.handCards.getSaoNum(),   // 第几次扫
                    card    : card,                         // 扫的牌
                }
            });
            return true;
        }

        // 检查能否提牌
        if (this.handCards.checkTi(card)) {
            // 检查能否胡牌(提胡)
            if (this.checkHupai(card, false, false)) {

                // 修改胡牌方式
                this.huPaiMethods = [];
                this.pushHupaiMethod(Enum.HupaiMethod.METHOD_TLLH);

                if (this.owner.forceHupai) {
                    // 强制胡牌，立即胡牌
                    this.owner.onPlayerMsg(this, {
                        code    : Player.MSG_HU_CARD,
                        args    : {
                            card    : card,
                        }
                    });
                } else {
                    // 发送通知，等待玩家选择
                    hangupTask.addHuCardPlayer(this.index);
                    this.sendMsg(Opcodes.SMSG_SET_TIPS, {
                        tips: {
                            marks   : [Enum.PlayerTips.PLAYER_TIP_HU],
                            args    : {},
                        }
                    });
                }
                return true;
            }

            var TIs = this.handCards.getTis();
            var TI = TIs[TIs.length - 1];
            this.owner.onPlayerMsg(this, {
                code    : Player.MSG_TI_CARD,   // 玩家提牌
                args    : {
                    type    : TI.type,          // 提牌类型, 1开局提牌, 2摸公牌提牌
                    card    : TI.card,          // 提的牌
                },
            });
            return true;
        }

        // 检查能否胡牌
        if ((!this.fiveHuWarning) && this.checkHupai(card, true, false)) {
            // 该玩家可以胡牌
            if (this.owner.forceHupai) {
                // 强制胡牌，立即胡牌
                this.owner.onPlayerMsg(this, {
                    code    : Player.MSG_HU_CARD,
                    args    : {
                        card        : card,
                        showCard    : true,
                    }
                });
            } else {
                // 发送通知，等待玩家选择
                hangupTask.addHuCardPlayer(this.index);
                this.sendMsg(Opcodes.SMSG_SET_TIPS, {
                    tips: {
                        marks   : [Enum.PlayerTips.PLAYER_TIP_HU],
                        args    : {},
                    }
                });
            }
            return true;
        }

        return false;
    },

    // 发送消息
    sendMsg: function(code, msg) {
        var mThis = this;
        var uniquePkt = false;

        // 缓存需要玩家响应的包
        switch (code) {
            case Opcodes.SMSG_SET_PLAY_CARD_PLAYER:
            case Opcodes.SMSG_SET_PLAYED_CARD:
            case Opcodes.SMSG_SET_PLAYER_REQ_DROOM:
            case Opcodes.SMSG_SET_PLAYER_RESP_DROOM:
            case Opcodes.SMSG_SET_TIPS:
            case Opcodes.SMSG_SET_PLAYER_PLAY_CARD:
            case Opcodes.SMSG_SET_ROUND_SETTEMENT:
            case Opcodes.SMSG_SET_FROUND_SETTEMENT:
            case Opcodes.SMSG_SET_ROOM_FINISHED:
                addPacket(code, msg, true);
                break;
        }

        if (this.online) {
            this.wsConn.sendMsg({
                code:   code,
                args:   msg,
            });

            if (code != Opcodes.SMSG_BROADCAST_MESSAGE) {
                DEBUG(util.format("Send %d - \"%j\" To %d", code, msg, this.uid));
            }
        }

        function addPacket(code, msg, unique) {
            var lastPktIndex = mThis.queuedPackets.length;
            mThis.queuedPackets.push({
                code:   code,
                args:   msg,
            });
            if (unique) {
                var newQueue = [];
                for (var key in mThis.queuedPackets) {
                    if (!mThis.queuedPackets.hasOwnProperty(key)) {
                        continue;
                    }
                    var Pkt = mThis.queuedPackets[key];
                    if (Pkt.code == code) {
                        if ((+key) != lastPktIndex) {
                            continue;
                        }
                    }
                    newQueue.push(Pkt);
                }
                mThis.queuedPackets = newQueue;
            }
        }
    },

    addPlayedCard: function(card, type, passed, show) {
        DEBUG("addPlayedCard " + card);
        this.playedCards.push({card: card, type: type, show: show});
        if (passed) {
            this.handCards.addPassInfo(card, 2);
        }
    },

    addPassInfo: function(card, type) {
        this.handCards.addPassInfo(card, type);
    },

    getPlayedCards: function() {
        return this.playedCards;
    },

    playCard: function(card) {
        if (this.handCards.play(card)) {
            this.playingCard = card;

            //this.addPlayedCard(card, Enum.PlayedCardType.PLAYED_CARD_OWN, true);
            if (this.handCards.can5Hu()) {
                this.sendMsg(Opcodes.SMSG_REQ_PLAYER_5HU_WARNING, {});
                return false;
            }
            return true;
        }
        DEBUG(util.format("Player %d play card %d failed", this.uid, card));
        return false;
    },

    pengCard: function(curPlay, card, cardType) {
        this.handCards.peng(card, curPlay, cardType);
        this.owner.onPlayerMsg(this, {
            code:   Player.MSG_PENG_CARD,
            args:   {
                card        : card,
                curPlay     : curPlay,
                cardType    : cardType,
                order       : this.handCards.getSaoNum(),
            }
        });
    },

    chiCard: function(curPlay, card, chiSes, luoSess) {
        if (this.handCards.chi(card, curPlay, chiSes, luoSess)) {
            this.owner.onPlayerMsg(this, {
                code:   Player.MSG_CHI_CARD,
                args:   {
                    card        : card,
                    curPlay     : curPlay,
                    chiSes      : chiSes,
                    luoSess      : luoSess,
                }
            });
        }
    },

    paoCard: function(paoInfo) {
        if (this.handCards.pao(paoInfo.card, paoInfo.type)) {
            this.owner.onPlayerMsg(this, {
                code    : Player.MSG_PAO_CARD,
                args    : {
                    card    : paoInfo.card,
                    scores  : paoInfo.scores,
                    playerIndex : this.index,
                },
            });
        }
    },

    huCard: function(ok) {
        if (ok) {
            // 增加胡牌次数
            this.huPaiNum += 1;
            // 增加连胡次数
            this.lianHuNum += 1;
            if (this.owner.curRound != this.owner.round) {
                this.zhongMasterNum += 1;
            }
            this.calcZMaster = (this.lianHuNum - 1);
        } else {
            // 别人胡牌，连胡次数置0
            this.lianHuNum = 0;

            // this.zhongMasterNum += this.calcZMaster;
        }
    },

    incDianPao: function() {
        this.dianPaoNum += 1;
    },

    calcHuCardScores: function(hangupTask, masterType) {
        if (masterType == 1) {
            return this.calcHuCardScoresType1(hangupTask);
        } else {
            return this.calcHuCardScoresType2(hangupTask);
        }
    },

    /**
     * 计算x2玩法分数
     * @param hangupTask
     * @returns {number[]}
     */
    calcHuCardScoresType1: function(hangupTask) {
        var cardType = hangupTask.getPlayedCardType();
        var lianHuNum = this.lianHuNum; // 玩家连胡次数

        DEBUG("lianHuNum " + lianHuNum);

        // 计算扣分
        var huScores = [0, 0, 0, 0];
        this.huPaiMethods.forEach(function(huMethod){
            switch (huMethod) {
                case Enum.HupaiMethod.METHOD_7_PAIRS:
                    var TypeScore = 40;
                    huScores[0] -= TypeScore;
                    huScores[1] -= TypeScore;
                    huScores[2] -= TypeScore;
                    huScores[3] -= TypeScore;
                    break;
                case Enum.HupaiMethod.METHOD_2_LONG:
                    var TypeScore = 40;
                    huScores[0] -= TypeScore;
                    huScores[1] -= TypeScore;
                    huScores[2] -= TypeScore;
                    huScores[3] -= TypeScore;
                    break;
                case Enum.HupaiMethod.METHOD_SAO_HU:
                    var SaoScore = Enum.getSaohuScore(this) + 4;
                    huScores[0] -= SaoScore;
                    huScores[1] -= SaoScore;
                    huScores[2] -= SaoScore;
                    huScores[3] -= SaoScore;
                    break;
                case Enum.HupaiMethod.METHOD_PENG_HU:
                    var PengScore = Enum.getPenghuScore(this) + 4;
                    if (cardType == Enum.PlayedCardType.PLAYED_CARD_OWN) {
                        huScores[hangupTask.getCurPlay() - 1] -= PengScore * 3;
                    } else {
                        huScores[0] -= PengScore;
                        huScores[1] -= PengScore;
                        huScores[2] -= PengScore;
                        huScores[3] -= PengScore;
                    }
                    break;
                case Enum.HupaiMethod.METHOD_PAO_HU:
                    // 跑的分数
                    var paoScore = 4 + 4;

                    // 胡的分数
                    if (((hangupTask.getCurPlay() == this.index)
                        || (cardType == Enum.PlayedCardType.PLAYED_CARD_PUB))
                        && (this.ppOwner == 0)) {
                        huScores[0] -= paoScore;
                        huScores[1] -= paoScore;
                        huScores[2] -= paoScore;
                        huScores[3] -= paoScore;
                    } else {
                        if (this.ppOwner != 0) {
                            huScores[this.ppOwner - 1] -= paoScore * 3;
                        } else {
                            huScores[hangupTask.getCurPlay() - 1] -= paoScore * 3;
                        }
                    }
                    break;
                case Enum.HupaiMethod.METHOD_5_HU:
                    var TypeScore = 40;
                    if ((hangupTask.getCurPlay() == this.index)
                        || (cardType == Enum.PlayedCardType.PLAYED_CARD_PUB)) {
                        huScores[0] -= TypeScore;
                        huScores[1] -= TypeScore;
                        huScores[2] -= TypeScore;
                        huScores[3] -= TypeScore;
                    } else {
                        huScores[hangupTask.getCurPlay() - 1] -= TypeScore * 3;
                    }
                    break;
                case Enum.HupaiMethod.METHOD_KAN_5HU:
                    var TypeScore = 16 + 36 + 4;
                    huScores[0] -= TypeScore;
                    huScores[1] -= TypeScore;
                    huScores[2] -= TypeScore;
                    huScores[3] -= TypeScore;
                    break;
                case Enum.HupaiMethod.METHOD_TIAN_HU:
                    var TypeScore = 10;
                    huScores[0] -= TypeScore;
                    huScores[1] -= TypeScore;
                    huScores[2] -= TypeScore;
                    huScores[3] -= TypeScore;
                    break;
                case Enum.HupaiMethod.METHOD_DI_HU:
                    var TypeScore = 24;
                    switch (this.huPaiMethod) {
                        case Enum.HupaiMethod.METHOD_PENG_HU:
                            TypeScore += (Enum.getPENGscore(this.owner
                                , this.handCards.getSaoNum() + 1) * 3);
                            break;
                        case Enum.HupaiMethod.METHOD_PAO_HU:
                            TypeScore += 12;
                            break;
                    }
                    huScores[hangupTask.getCurPlay() - 1] -= TypeScore;
                    break;
                case Enum.HupaiMethod.METHOD_HU_NORMAL:
                    var TypeScore = 4;
                    if ((hangupTask.getCurPlay() == this.index)
                        || (cardType == Enum.PlayedCardType.PLAYED_CARD_PUB)) {
                        huScores[0] -= TypeScore;
                        huScores[1] -= TypeScore;
                        huScores[2] -= TypeScore;
                        huScores[3] -= TypeScore;
                    } else {
                        huScores[hangupTask.getCurPlay() - 1] -= TypeScore * 3;
                    }
                    break;
            }
        }.bind(this));

        DEBUG(util.format("%j", huScores));

        // 连中/X2玩法分数计算
        this.huPaiMethods.forEach(function(huMethod){
            switch (huMethod) {
                case Enum.HupaiMethod.METHOD_SAO_HU:
                case Enum.HupaiMethod.METHOD_PENG_HU:
                case Enum.HupaiMethod.METHOD_PAO_HU:
                case Enum.HupaiMethod.METHOD_HU_NORMAL:
                case Enum.HupaiMethod.METHOD_TIAN_HU:
                    if (lianHuNum >= 2) {
                        for (var key in huScores) {
                            if (huScores[key] != 0) {
                                huScores[key] *= 2;
                            }
                        }
                    }
                    break;
            }
        }.bind(this));

        DEBUG(util.format("%j", huScores));

        // 计算得分
        huScores[this.index - 1] = 0;
        var getScore = 0;
        huScores.forEach(function(score){
            getScore += score;
        });
        huScores[this.index - 1] = Math.abs(getScore);

        return huScores;
    },

    /**
     * 计算连中分数
     * @param hangupTask
     * @param masterType
     * @returns {number[]}
     */
    calcHuCardScoresType2: function(hangupTask) {
        var cardType = hangupTask.getPlayedCardType();
        var lianHuNum = this.lianHuNum; // 玩家连胡次数
        var MinusNum = 0;               // 扣几人低分

        DEBUG("lianHuNum " + lianHuNum);

        // 计算扣分
        var huScores = [0, 0, 0, 0];
        this.huPaiMethods.forEach(function(huMethod){
            switch (huMethod) {
                case Enum.HupaiMethod.METHOD_7_PAIRS:
                    var TypeScore = 36;
                    huScores[0] -= TypeScore;
                    huScores[1] -= TypeScore;
                    huScores[2] -= TypeScore;
                    huScores[3] -= TypeScore;
                    MinusNum = 1;   // 每人扣底
                    break;
                case Enum.HupaiMethod.METHOD_2_LONG:
                    var TypeScore = 36;
                    huScores[0] -= TypeScore;
                    huScores[1] -= TypeScore;
                    huScores[2] -= TypeScore;
                    huScores[3] -= TypeScore;
                    MinusNum = 1;   // 每人扣底
                    break;
                case Enum.HupaiMethod.METHOD_SAO_HU:
                    var SaoScore = Enum.getSaohuScore(this);
                    huScores[0] -= SaoScore;
                    huScores[1] -= SaoScore;
                    huScores[2] -= SaoScore;
                    huScores[3] -= SaoScore;
                    MinusNum = 1;   // 每人扣底
                    break;
                case Enum.HupaiMethod.METHOD_PENG_HU:
                    var PengScore = Enum.getPenghuScore(this);
                    if (cardType == Enum.PlayedCardType.PLAYED_CARD_OWN) {
                        huScores[hangupTask.getCurPlay() - 1] -= PengScore * 3;
                        MinusNum = 3;   // 单人扣3底
                    } else {
                        huScores[0] -= PengScore;
                        huScores[1] -= PengScore;
                        huScores[2] -= PengScore;
                        huScores[3] -= PengScore;
                        MinusNum = 1;   // 每人扣底
                    }
                    break;
                case Enum.HupaiMethod.METHOD_PAO_HU:
                    // 跑的分数
                    var paoScore = 4;
                    // 胡的分数
                    if (((hangupTask.getCurPlay() == this.index)
                        || (cardType == Enum.PlayedCardType.PLAYED_CARD_PUB))
                        && (this.ppOwner == 0)) {
                        huScores[0] -= paoScore;
                        huScores[1] -= paoScore;
                        huScores[2] -= paoScore;
                        huScores[3] -= paoScore;
                        MinusNum = 1;   // 每人扣底
                    } else {
                        if (this.ppOwner != 0) {
                            huScores[this.ppOwner - 1] -= paoScore * 3;
                        } else {
                            huScores[hangupTask.getCurPlay() - 1] -= paoScore * 3;
                        }
                        MinusNum = 3;   // 单人扣3底
                    }
                    break;
                case Enum.HupaiMethod.METHOD_5_HU:
                    var TypeScore = 36;
                    if ((hangupTask.getCurPlay() == this.index)
                        || (cardType == Enum.PlayedCardType.PLAYED_CARD_PUB)) {
                        huScores[0] -= TypeScore;
                        huScores[1] -= TypeScore;
                        huScores[2] -= TypeScore;
                        huScores[3] -= TypeScore;
                        MinusNum = 1;   // 每人扣底
                    } else {
                        huScores[hangupTask.getCurPlay() - 1] -= TypeScore * 3;
                        MinusNum = 3;   // 单人扣3底
                    }
                    break;
                case Enum.HupaiMethod.METHOD_KAN_5HU:
                    var TypeScore = 16 + 36;
                    huScores[0] -= TypeScore;
                    huScores[1] -= TypeScore;
                    huScores[2] -= TypeScore;
                    huScores[3] -= TypeScore;
                    MinusNum = 1;   // 每人扣底
                    break;
                case Enum.HupaiMethod.METHOD_TIAN_HU:
                    var TypeScore = 6;
                    huScores[0] -= TypeScore;
                    huScores[1] -= TypeScore;
                    huScores[2] -= TypeScore;
                    huScores[3] -= TypeScore;
                    MinusNum = 1;   // 每人扣底
                    break;
                case Enum.HupaiMethod.METHOD_DI_HU:
                    var TypeScore = 24;
                    lianHuNum = 0;  // 不加额外底分
                    switch (this.huPaiMethod) {
                        case Enum.HupaiMethod.METHOD_PENG_HU:
                            TypeScore += (Enum.getPENGscore(this.owner
                                , this.handCards.getSaoNum() + 1) * 3);
                            break;
                        case Enum.HupaiMethod.METHOD_PAO_HU:
                            TypeScore += 12;
                            break;
                    }
                    huScores[hangupTask.getCurPlay() - 1] -= TypeScore;
                    break;
                case Enum.HupaiMethod.METHOD_HU_NORMAL:
                    var TypeScore = 4;
                    lianHuNum -= 1;
                    if ((hangupTask.getCurPlay() == this.index)
                        || (cardType == Enum.PlayedCardType.PLAYED_CARD_PUB)) {
                        huScores[0] -= TypeScore;
                        huScores[1] -= TypeScore;
                        huScores[2] -= TypeScore;
                        huScores[3] -= TypeScore;
                        MinusNum = 1;   // 每人扣底
                    } else {
                        huScores[hangupTask.getCurPlay() - 1] -= TypeScore * 3;
                        MinusNum = 3;   // 单人扣3底
                    }
                    break;
            }
        }.bind(this));

        DEBUG(util.format("%j", huScores));

        // 连中玩法分数计算
        this.huPaiMethods.forEach(function(huMethod){
            switch (huMethod) {
                case Enum.HupaiMethod.METHOD_7_PAIRS:
                case Enum.HupaiMethod.METHOD_2_LONG:
                case Enum.HupaiMethod.METHOD_5_HU:
                case Enum.HupaiMethod.METHOD_KAN_5HU:
                case Enum.HupaiMethod.METHOD_SAO_HU:
                case Enum.HupaiMethod.METHOD_PENG_HU:
                case Enum.HupaiMethod.METHOD_PAO_HU:
                case Enum.HupaiMethod.METHOD_HU_NORMAL:
                    for (var key in huScores) {
                        if (huScores[key] != 0) {
                            huScores[key] += -(lianHuNum * (4 * MinusNum));
                        }
                    }
                    break;
            }
        }.bind(this));

        DEBUG(util.format("%j", huScores));

        // 计算得分
        huScores[this.index - 1] = 0;
        var getScore = 0;
        huScores.forEach(function(score){
            getScore += score;
        });
        huScores[this.index - 1] = Math.abs(getScore);

        return huScores;
    },

    // 生成战报
    buildReport: function(roomId, time) {
        return {
            uid     : this.uid,
            time    : time,
            roomId  : roomId,
            score   : this.score,
        };
    },

    ///////////////////////////////////////////////////////////////////////////

    // 在发完手牌并且检查完没有玩家开局胡牌或者胡牌玩家不胡后调用
    onSetHandCards: function() {
        // 处理坎牌
        if (this.handCards.checkKan()) {
            var KANs = this.handCards.getKANs();
            var numKan = 1;
            KANs.forEach(function(card){
                this.owner.onPlayerMsg(this, {
                    code    : Player.MSG_KAN_CARD,  // 玩家坎牌
                    args    : {
                        order   : numKan,           // 第几次坎
                        card    : card,             // 坎的牌
                    }
                });
                ++numKan;
            }.bind(this));
        }

        // 处理提牌
        if (this.handCards.checkTi(0)) {
            var TIs = this.handCards.getTis();  // TIs里面一定只有一个元素
            var TI = TIs[0];
            this.owner.onPlayerMsg(this, {
                code    : Player.MSG_TI_CARD,   // 玩家提牌
                args    : {
                    type    : TI.type,          // 提牌类型, 1开局提牌, 2摸公牌提牌
                    card    : TI.card,          // 提的牌
                },
            });
        }
    },

    checkHupai: function(card, needCard, firstCheck) {
        // 不能胡自己出的牌
        for (var key in this.playedCards) {
            if (!this.playedCards.hasOwnProperty(key)) {
                continue;
            }
            var playedCard = this.playedCards[key];
            if ((playedCard.card == card)
                && (playedCard.type == Enum.PlayedCardType.PLAYED_CARD_OWN)) {
                return false;
            }
        }

        var checkRes = Func.checkHupai(this.handCards, card, needCard, firstCheck);
        if (checkRes.HupaiMethod == 0) {
            return false;
        }

        // 玩家可以胡牌
        this.huNeedCard = card;
        this.pushHupaiMethod(checkRes.HupaiMethod);

        this.owner.onPlayerMsg(this, {
            code:   Player.MSG_CAN_HUPAI,
        });

        return true;
    },

    checkWithPlayedPubCard: function(curPlay, card, hangupTask) {
        if (curPlay == this.index) {

            // 检查跑牌
            var PaoInfo = this.handCards.checkPao(hangupTask, true);
            if (PaoInfo) {
                // 检查玩家能否胡牌

                this.ppOwner = PaoInfo.owner || 0;

                this.handCards.pao(card, PaoInfo.type);

                if (this.checkHupai(card, false, false)) {

                    this.handCards.revPao();

                    this.paoInfo = PaoInfo;

                    // 修改胡牌方式
                    this.huPaiMethods = [];
                    this.pushHupaiMethod(Enum.HupaiMethod.METHOD_PAO_HU);

                    if (this.owner.forceHupai) {
                        // 强制胡牌，立即胡牌
                        this.owner.onPlayerMsg(this, {
                            code    : Player.MSG_HU_CARD,
                            args    : {
                                card    : card,
                            }
                        });
                        return true;
                    } else {
                        // 发送通知，等待玩家选择
                        hangupTask.addHuCardPlayer(this.index);
                        this.sendMsg(Opcodes.SMSG_SET_TIPS, {
                            tips: {
                                marks   : [Enum.PlayerTips.PLAYER_TIP_HU],
                                args    : {},
                            }
                        });
                    }
                } else {
                    this.handCards.revPao();

                    hangupTask.setPaoCardPlayer(this.index, PaoInfo);
                    hangupTask.setWantPao(this.index);
                }
                return;
            }

            // 自己吃
            if (this.handCards.checkChi(card)) {
                hangupTask.addChiCardPlayer(this.index,
                    this.handCards.getCheckedChiInfo());
            }
        } else {

            // 检查碰牌
            if (this.handCards.checkPeng(card)) {

                // 检查玩家能否胡牌

                // 扣除要碰的牌
                this.handCards.peng(card, curPlay, hangupTask.getPlayedCardType());

                if (this.checkHupai(card, false, false)) {

                    this.handCards.revPeng(card);

                    // 修改胡牌方式
                    this.huPaiMethods = [];
                    if (this.handCards.is5Hu() && this.fiveHuWarning) {
                        this.pushHupaiMethod(Enum.HupaiMethod.METHOD_5_HU);
                    } else {
                        this.pushHupaiMethod(Enum.HupaiMethod.METHOD_PENG_HU);
                        this.huPaiMethod = Enum.HupaiMethod.METHOD_PENG_HU;
                    }

                    if (this.owner.forceHupai) {
                        // 强制胡牌，立即胡牌
                        this.owner.onPlayerMsg(this, {
                            code    : Player.MSG_HU_CARD,
                            args    : {
                                card    : card,
                            }
                        });
                        return true;
                    } else {
                        // 发送通知，等待玩家选择
                        hangupTask.addHuCardPlayer(this.index);
                        this.sendMsg(Opcodes.SMSG_SET_TIPS, {
                            tips: {
                                marks   : [Enum.PlayerTips.PLAYER_TIP_HU],
                                args    : {},
                            }
                        });
                    }
                } else {
                    this.handCards.revPeng(card);
                    hangupTask.setPengCardPlayer(this.index);
                }
            }

            // 检查跑牌
            var PaoInfo = this.handCards.checkPao(hangupTask, false);
            if (PaoInfo) {
                // 检查玩家能否胡牌
                this.ppOwner = PaoInfo.owner || 0;

                this.handCards.pao(card, PaoInfo.type);

                if (this.checkHupai(card, false, false)) {

                    this.handCards.revPao();

                    this.paoInfo = PaoInfo;

                    // 修改胡牌方式
                    this.huPaiMethods = [];
                    this.pushHupaiMethod(Enum.HupaiMethod.METHOD_PAO_HU);
                    this.huPaiMethod = Enum.HupaiMethod.METHOD_PAO_HU;

                    if (this.owner.forceHupai) {
                        // 强制胡牌，立即胡牌
                        this.owner.onPlayerMsg(this, {
                            code    : Player.MSG_HU_CARD,
                            args    : {
                                card    : card,
                            }
                        });
                        return true;
                    } else {
                        // 发送通知，等待玩家选择
                        hangupTask.addHuCardPlayer(this.index);
                        this.sendMsg(Opcodes.SMSG_SET_TIPS, {
                            tips: {
                                marks   : [Enum.PlayerTips.PLAYER_TIP_HU],
                                args    : {},
                            }
                        });
                    }
                } else {
                    this.handCards.revPao();

                    hangupTask.setPaoCardPlayer(this.index, PaoInfo);
                    hangupTask.setWantPao(this.index);
                }
                return;
            }

            // 检查胡牌
            if ((!this.fiveHuWarning) && this.checkHupai(card, true, false)) {
                if (this.owner.forceHupai) {
                    // 强制胡牌，立即胡牌
                    this.owner.onPlayerMsg(this, {
                        code    : Player.MSG_HU_CARD,
                        args    : {
                            card    : card,
                        }
                    });
                    return true;
                } else {
                    hangupTask.addHuCardPlayer(this.index);
                }
            }

            // 检查能否吃上家的牌
            var posCheck = this.index - curPlay;
            if ((posCheck == 1) || (posCheck == -3)) {
                if (this.handCards.checkChi(card)) {
                    hangupTask.addChiCardPlayer(this.index,
                        this.handCards.getCheckedChiInfo());
                }
            }
        }
    },
};

Player.MSG_CAN_HUPAI        = 100;  // 玩家能胡牌
Player.MSG_KAN_CARD         = 101;  // 玩家坎牌
Player.MSG_TI_CARD          = 102;  // 玩家提牌
Player.MSG_SAO_CARD         = 103;  // 玩家扫牌
Player.MSG_PENG_CARD        = 104;  // 玩家碰牌
Player.MSG_CHI_CARD         = 105;  // 玩家吃牌
Player.MSG_HU_CARD          = 106;  // 玩家胡牌
Player.MSG_PAO_CARD         = 107;  // 玩家跑牌
Player.MSG_PLAYER_OFFLINE   = 108;  // 玩家离线
Player.MSG_5HU_WARNING      = 109;  // 五胡报警

exports.Player = Player;