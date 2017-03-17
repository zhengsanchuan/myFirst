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

function HandCards() {
    this.card = [];
    this.bestCards = []
    this.cardsType = null;
}
HandCards.prototype = {
    // 初始化
    init: function (cards) {
        for (var i = 0; i < cards.length; i++) {
            this.addMjs(cards[i]);
        }
        this.cardsType = Func.getCardsType(this.card, this.bestCards);
    },
    // 重置
    reset: function () {
        this.card = [];
        this.bestCards = []
        this.cardsType = null;
    },

    /**
     * 增加牌
     * @param mjId
     */
    addMjs: function (cardId) {
        this.card.push(cardId)

    },

    contains: function (cardId) {
        for (var index in this.card) {
            if (this.card[index].value == cardId.value && this.card[index].type == cardId.type) {
                return true;
            }
        }
        return false;
    }
};

///////////////////////////////////////////////////////////////////////////////
//>> 游戏玩家

function Player(owner, index, cardNum) {
    this.owner = owner;    // 房间对象
    this.index = index;    // 玩家位置
    this.uid = 0;        // 玩家ID
    this.info = {};       // 玩家信息
    this.wsConn = null;     // WebSocket连接对象
    this.online = false;    // 玩家是否在线
    this.queuedPackets = [];       // 数据包

    this.dealer = false;    // 是否庄家
    this.ready = false;    // 玩家是否就绪
    this.handCards = null;     // 手牌

    this.bet = 0; //买分数 (开局前下注数)
    this.showdown = false;

    //单局结算数据
    this.roundScore = 0;// 本轮积分情况(总计数)

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
        this.roundScore = 0;
        this.bet = 0;
        this.showdown = false;
        this.handCards.reset();
    },

    destroy: function () {
        if (this.isInited()) {
            this.online = false;
            setTimeout(function () {
                // 几秒钟后断开连接
                this.wsConn.close();
            }.bind(this), 2000);
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
            bet: this.bet,
        };
    },

    // 获取重新连接数据
    getRecInfo: function (isOwn) {
        var recArgs = {
            uid: this.uid,
            name: this.info.name,
            headpic: this.info.headpic,
            sex: this.info.sex,
            ready: this.ready,
            score: this.score,
        };

        if (this.online) {
            recArgs.ip = this.wsConn.getAddrString();
        }
        if (this.online) {
            recArgs.ip = this.wsConn.getAddrString();
        }
        if (isOwn) {
            recArgs.handCards = this.handCards.card;
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
        this.score += this.roundScore;
        if (!final) {
            return {
                bet: this.bet,                    //买分
                score: this.score,                // 总积分
                roundScore: this.roundScore,      // 单局积分
                cardInfo:  this.handCards.card,   // 手牌信息
            };
        } else {
            return {
                bet: this.bet,                    //买分
                score: this.score,                // 总积分
                roundScore: this.roundScore,      // 单局积分
                cardInfo:  this.handCards.card,   // 手牌信息
            };
        }
    },


    // 设置手牌
    setHandCards: function (cards) {
        // this.reset();
        this.handCards.init(cards);
        this.sendMsg(Opcodes.S2C_SET_PLAYER_CARDS, {'cards': this.handCards.card});
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
            time: time,
            roomId: roomId,
            score: this.score,
        };
    },

};
exports.Player = Player;