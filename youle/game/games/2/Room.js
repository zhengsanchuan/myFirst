/******************************************************************************
 * Author:      671643387
 * Created:     2016/10/26
 *****************************************************************************/

var util            = require("util");
var Enum            = require("./Enum.js");
var Player          = require("./Player.js").Player;
var ProtoID         = require("../../../net/ProtoID.js").ProtoID;
var ProtoState      = require("../../../net/ProtoID.js").ProtoState;
var Opcodes         = require("./Opcodes.js").Opcodes;

///////////////////////////////////////////////////////////////////////////////
//>> 公牌

function PublicCards() {
    this.num        = 0;    // 剩余牌数量
    this.cards      = [];   // 牌

    this.getIndex   = 0;    // 取牌位置
}

PublicCards.prototype = {

    // 生成牌组
    gen: function() {
        //this.genTemp();
        //return;

        // 初始化数据
        this.num = 80;
        this.cards = [];
        this.getIndex = 0;

        // 生成80张牌
        var originCards = [];
        for (var iVal = 1; iVal <= 20; ++iVal) {
            originCards.push(iVal);
            originCards.push(iVal);
            originCards.push(iVal);
            originCards.push(iVal);
        }

        while (originCards.length > 0) {
            var iRamdom = Math.floor(Math.random() * originCards.length);
            this.cards.push({
                value: originCards[iRamdom],
            });

            originCards.splice(iRamdom, 1);
        }
    },

    genTemp: function() {
        // 初始化数据
        this.num = 80;
        this.cards = [];
        this.getIndex = 0;

        // 玩家起手牌
        // var player1Cards = [1,1,1,2,2,2,3,3,3,4,4,5,5,7,7]; // 15
        var player2Cards = [1,1,1,10,10,10,2,3,4,14,15,16,9,9]; // 15
        var player1Cards = [4,5,7,9,11,13,15,17,20,20,20,19,19,19,4]; // 14
        var player3Cards = [8,10,12,14,16,20,17,17,17,16,16,16,14,14]; // 14
        var player4Cards = [8,8,8,10,10,10,12,12,12,13,16,19,15,15]; // 14

        var cardMap = {};
        player1Cards.forEach(function(card){
            this.cards.push({value:card});
            if (cardMap.hasOwnProperty(card)) {
                cardMap[card] += 1;
            } else {
                cardMap[card] = 1;
            }
        }.bind(this));
        player2Cards.forEach(function(card){
            this.cards.push({value:card});
            if (cardMap.hasOwnProperty(card)) {
                cardMap[card] += 1;
            } else {
                cardMap[card] = 1;
            }
        }.bind(this));
        player3Cards.forEach(function(card){
            this.cards.push({value:card});
            if (cardMap.hasOwnProperty(card)) {
                cardMap[card] += 1;
            } else {
                cardMap[card] = 1;
            }
        }.bind(this));
        player4Cards.forEach(function(card){
            this.cards.push({value:card});
            if (cardMap.hasOwnProperty(card)) {
                cardMap[card] += 1;
            } else {
                cardMap[card] = 1;
            }
        }.bind(this));

        // 生成剩余的牌
        cardMap[4] += 1;
        this.cards.push({value:4});
        for (var iVal = 1; iVal <= 20; ++iVal) {
            var needNum = 4 - (cardMap[iVal] || 0);
            for (var x = 0; x < needNum; ++x) {
                this.cards.push({value:iVal});
            }
        }
        return [player1Cards, player2Cards, player3Cards, player4Cards];
    },

    // 摸牌
    getCard: function() {
        var rtnCard = this.cards[this.getIndex];
        this.getIndex += 1;
        this.num -= 1;
        return rtnCard.value;
    },

    // 摸牌
    getCards: function(num) {
        var rtnCards = [];
        this.num -= num;
        while (num > 0) {
            rtnCards.push(this.cards[this.getIndex].value);
            ++this.getIndex;
            num -= 1;
        }
        return rtnCards;
    },

    // 公牌是否已经摸完
    isEmpty: function() {
        return this.num == 0;
    },

    // 获取剩余牌数量
    getRemain: function() {
        return this.num;
    },

    // 获取剩余公牌
    getRemainCards: function() {
        return this.cards.slice(this.getIndex);
    },
};

function HangupTask(owner) {
    this.owner              = owner;    // 房间

    this.sumAction          = 0;        // 动作数量
    this.submitAction       = 0;        // 已提交的动作数量

    this.curPlay            = 0;        // 当前出牌玩家
    this.card               = 0;        // 牌
    this.cardType           = 0;        // 牌类型(1公牌, 2私牌)

    this.pengCardPlayer     = 0;        // 能碰牌玩家索引
    this.chiCardPlayers     = [];       // 能吃牌的玩家
    this.chiCardInfos       = {};       // 吃牌信息
    this.paoCardPlayer      = 0;        // 能跑牌玩家索引
    this.paoCardInfo        = {};       // 跑牌玩家信息
    this.huCardPlayers      = [];       // 能胡牌玩家索引

    this.wantPengPlayer     = 0;        // 玩家想碰牌
    this.wantChiPlayers     = [];       // 玩家想吃牌
    this.wantPaoPlayer      = 0;        // 玩家想跑
    this.wantHuCardPlayers  = [];       // 玩家想胡

    this.processed          = false;    // 已经处理
}

HangupTask.prototype = {

    // 重置数据
    reset: function() {
        this.sumAction = 0;
        this.submitAction = 0;

        this.curPlay = 0;
        this.card = 0;
        this.cardType = 0;

        this.pengCardPlayer = 0;
        this.chiCardPlayers = [];
        this.chiCardInfos = {};
        this.paoCardPlayer = 0;
        this.paoCardInfo = {};
        this.huCardPlayers = [];

        this.wantPengPlayer = 0;
        this.wantChiPlayers = [];
        this.wantPaoPlayer = 0;
        this.wantHuCardPlayers = [];

        this.processed = false;
    },

    // 设置当前出牌玩家
    setCurPlay: function(playerIdx) {
        this.curPlay = playerIdx;
    },

    // 获取当前出牌玩家
    getCurPlay: function() {
        return this.curPlay;
    },

    // 设置出的牌
    setPlayedCard: function(card, type) {
        this.card = card;
        this.cardType = type;
    },

    // 获取出的牌
    getPlayedCard: function() {
        return this.card;
    },

    // 获取出的牌类型
    getPlayedCardType: function() {
        return this.cardType;
    },

    // 设置碰牌玩家位置
    setPengCardPlayer: function(playerIdx) {
        this.sumAction += 1;
        this.pengCardPlayer = playerIdx;
    },

    // 设置想碰牌的玩家位置
    setWantPengCardPlayer: function(playerIdx) {
        this.submitAction += 1;
        this.wantPengPlayer = playerIdx;

        this.checkTask();
        return false;
    },

    // 获取碰牌玩家位置
    getPengCardPlayer: function() {
        return this.pengCardPlayer;
    },

    // 添加能吃牌的玩家
    addChiCardPlayer: function(playerIdx, chiInfo) {
        this.sumAction += 1;
        this.chiCardPlayers.push(playerIdx);
        this.chiCardInfos[playerIdx] = chiInfo;
    },

    // 设置想吃牌的玩家位置
    addWantChiCardPlayer: function(playerIdx, chiSes, luoSess) {
        this.submitAction += 1;
        this.wantChiPlayers.push({
            playerIndex:  playerIdx,
            chiSes: chiSes,
            luoSess: luoSess,
        });

        // 如果该玩家既碰牌又吃牌，那么吃牌的时候默认取消碰
        if (this.pengCardPlayer == playerIdx) {
            this.submitAction += 1;
            this.wantPengPlayer = -1;
        }

        // 如果是打牌的玩家想吃牌，那么其他吃牌玩家默认取消
        if (this.curPlay == playerIdx) {
            if ((this.chiCardPlayers.length == 2)
                && (this.wantChiPlayers.length < this.chiCardPlayers.length)) {
                this.submitAction += 1;
                this.wantChiPlayers.push(-1);
            }
        }

        this.checkTask();
        return false;
    },

    // 获取能吃牌的玩家
    getChiCardPlayers: function() {
        return this.chiCardPlayers;
    },

    // 设置想胡牌的玩家位置
    addWantHuCardPlayer: function(playerIdx) {
        this.submitAction += 1;
        this.wantHuCardPlayers.push(playerIdx);

        this.checkTask();
        return false;
    },

    // 设置跑牌玩家位置
    setPaoCardPlayer: function(playerIdx, paoInfo) {
        this.sumAction += 1;
        this.paoCardPlayer = playerIdx;
        this.paoCardInfo = paoInfo;
    },

    // 获取跑牌玩家位置
    getPaoCardPlayer: function() {
        return this.paoCardPlayer;
    },

    // 设置胡牌玩家位置
    addHuCardPlayer: function(playerIdx) {
        this.sumAction += 1;
        this.huCardPlayers.push(playerIdx);
    },

    // 获取胡牌玩家位置
    getHuCardPlayers: function () {
        return this.huCardPlayers;
    },

    // 是否没有操作
    isEmpty: function() {
        return this.sumAction == 0;
    },

    // 获取玩家提示
    getPlayerTips: function(playerIndex) {
        var tips = {
            "marks" : [],
            "args"  : {},
        };
        if (this.huCardPlayers.indexOf(playerIndex) != -1) {
            tips.marks.push(Enum.PlayerTips.PLAYER_TIP_HU);
        }
        if (this.pengCardPlayer == playerIndex) {
            tips.marks.push(Enum.PlayerTips.PLAYER_TIP_PENG);
        }
        if (this.chiCardPlayers.indexOf(playerIndex) != -1) {
            tips.marks.push(Enum.PlayerTips.PLAYER_TIP_CHI);
            tips.args[Enum.PlayerTips.PLAYER_TIP_CHI] = this.chiCardInfos[playerIndex];
        }
        return tips;
    },

    addPlayerPass: function(playerIndex) {
        if (this.huCardPlayers.indexOf(playerIndex) != -1) {
            this.submitAction += 1;
            this.wantHuCardPlayers.push(-1);
        }
        if (this.pengCardPlayer == playerIndex) {
            this.submitAction += 1;
            this.wantPengPlayer = -1;
        }
        if (this.chiCardPlayers.indexOf(playerIndex) != -1) {
            this.submitAction += 1;
            this.wantChiPlayers.push(-1);
        }
        if (this.paoCardPlayer == playerIndex) {
            this.submitAction += 1;
            this.wantPaoPlayer = -1;
        }
        this.checkTask();
    },

    getPlayerPassType: function(playerIndex) {
        if (this.pengCardPlayer == playerIndex) {
            return 1;
        }

        if (this.chiCardPlayers.indexOf(playerIndex) != -1) {
            return 2;
        }

        return 0;
    },

    checkTask: function() {
        // 没有任务
        if ((this.sumAction == 0) || this.processed) {
            return false;
        }

        // 胡牌检查
        if (this.huCardPlayers.length > 0) {
            if (this.wantHuCardPlayers.length != this.huCardPlayers.length) {
                // 等待可以胡牌的玩家做出选择
                // return false;
            }

            // 计算离出牌人最近的人(多人胡牌的时候离出牌人最近的人胡牌)
            var nearPlayerIdx = 0;
            var curDiff = Enum.ROOM_PLAYER_NUM;
            this.wantHuCardPlayers.forEach(function(ePlayerIndex){
                if (ePlayerIndex != -1) {
                    var diff = ePlayerIndex - this.curPlay;
                    if (diff < 0) diff += 4;
                    if (diff < curDiff) {
                        curDiff = diff;
                        nearPlayerIdx = ePlayerIndex;
                    }
                }
            }.bind(this));

            if (nearPlayerIdx != -1) {
                // 有人选择了"胡牌"
                if (this.owner.forceHupai) {
                    this.processed = true;
                    this.notifyAddPlayedCard(true);
                    this.owner.onHangupTaskMsg(HangupTask.MSG_PLAYER_HU_CARD, {
                        playerIndex: this.huCardPlayers[0],
                    });
                }else {
                    this.owner.players[this.huCardPlayers[0]].sendMsg(Opcodes.SMSG_SET_TIPS, {
                        tips: {
                            marks: [Enum.PlayerTips.PLAYER_TIP_HU],
                            args: {},
                        }
                    });
                }
                return true;
            }
        }

        // 检查碰/跑
        if (this.pengCardPlayer != 0) {
            if (this.wantPengPlayer == 0) {
                // 等待可以碰牌的玩家做出选择
                return false;
            }
            if (this.wantPengPlayer != -1) {
                // 玩家选择"碰牌"
                this.processed = true;
                this.notifyAddPlayedCard(this.cardType != Enum.PlayedCardType.PLAYED_CARD_PUB);
                this.owner.onHangupTaskMsg(HangupTask.MSG_PLAYER_PENG_CARD, {
                    playerIndex : this.wantPengPlayer,
                });
                return true;
            }
        }
        if (this.paoCardPlayer != 0) {
            if (this.wantPaoPlayer == 0) {
                // 等待可以跑的玩家做出选择
                return false;
            }
            if (this.wantPaoPlayer != -1) {
                // 玩家选择"跑"
                this.processed = true;
                this.notifyAddPlayedCard(false);
                this.owner.onHangupTaskMsg(HangupTask.MSG_PLAYER_PAO_CARD, {
                    playerIndex : this.wantPaoPlayer,
                    paoInfo     : this.paoCardInfo,
                });
                return true;
            }
        }

        // 检查吃
        if (this.chiCardPlayers.length > 0) {
            if (this.wantChiPlayers.length != this.chiCardPlayers.length) {
                // 等待可以吃的玩家做出选择
                return false;
            }

            // 计算离出牌人最近的人
            var nearPlayerIdx = 0;
            var curDiff = Enum.ROOM_PLAYER_NUM;
            var chiInfo = null;
            this.wantChiPlayers.forEach(function(eChiInfo){
                if (eChiInfo != -1) {
                    var diff = eChiInfo.playerIndex - this.curPlay;
                    if (diff < 0) diff += 4;
                    if (diff < curDiff) {
                        curDiff = diff;
                        nearPlayerIdx = eChiInfo.playerIndex;
                        chiInfo = eChiInfo;
                    }
                }
            }.bind(this));

            if (nearPlayerIdx != 0) {
                // 有人选择"吃牌"
                this.processed = true;
                this.notifyAddPlayedCard(false);
                this.owner.onHangupTaskMsg(HangupTask.MSG_PLAYER_CHI_CARD, {
                    playerIndex : nearPlayerIdx,
                    chiSes: chiInfo.chiSes,
                    luoSess: chiInfo.luoSess,
                });
                return true;
            }
        }

        // 所有人都"过"
        if (this.submitAction >= this.sumAction) {
            this.processed = true;
            this.notifyAddPlayedCard(true);
            this.owner.onHangupTaskMsg(HangupTask.MSG_ALL_PASS, {});
            return true;
        }

        return false;
    },

    // 设置想跑牌的玩家
    setWantPao: function(playerIndex) {
        if (this.paoCardPlayer == playerIndex) {
            this.submitAction += 1;
            this.wantPaoPlayer = playerIndex;
            //return this.checkTask();
        }
        return false;
    },

    notifyAddPlayedCard: function(show) {
        //if (this.cardType != Enum.PlayedCardType.PLAYED_CARD_OWN) {
            this.owner.onHangupTaskMsg(HangupTask.MSG_ADD_PLAYED_CARD, {
                playerIndex : this.curPlay,
                card        : this.card,
                type        : this.cardType,
                passed      : (this.cardType == Enum.PlayedCardType.PLAYED_CARD_OWN),
                show        : show,
            });
        //}
    },
};

HangupTask.MSG_PLAYER_HU_CARD       = 201;    // 玩家胡牌
HangupTask.MSG_PLAYER_PENG_CARD     = 202;    // 玩家碰牌
HangupTask.MSG_PLAYER_PAO_CARD      = 203;    // 玩家跑牌
HangupTask.MSG_PLAYER_CHI_CARD      = 204;    // 玩家吃牌
HangupTask.MSG_ALL_PASS             = 205;    // 所有有操作的玩家都跳过
HangupTask.MSG_ADD_PLAYED_CARD      = 206;    // 添加出牌

///////////////////////////////////////////////////////////////////////////////
//>> 游戏房间

function Room(id) {
    this.creator        = 0;        // 房主
    this.id             = id;       // 房间号

    this.round          = 0;        // 总轮数
    this.masterType     = 0;        // 中庄机制
    this.forceHupai     = false;    // 强制胡牌

    this.players        = {};
    this.joinedPlayers  = 0;        // 已经加入房间的人数
    this.readyPlayers   = 0;        // 准备就绪的玩家
    this.onlinePlayers  = 0;        // 在线玩家数量

    this.isReqDestroy   = false;    // 是否申请解散
    this.destroyTime    = 0;        // 销毁时间
    this.respDestroyOKs = {};       // 同意解散房间的人
    this.destroyTimer   = null;     // 解散计时器
    this.destroyPlayers = 0;        // 解散时玩家数量

    // 游戏数据
    this.publicCards    = null;     // 公牌
    this.curRound       = 0;        // 当前轮
    this.dealer         = 0;        // 庄家
    this.curPlay        = 0;        // 当前出牌的人
    this.canHupais      = [];       // 能胡牌的玩家索引
    this.isHupai        = false;    // 房间是否有人胡牌
    this.hangupTask     = null;     // 挂起的任务
    this.isHuangZhuang  = false;    // 是否黄庄
    this.lastMopai      = 0;        // 最后摸牌的人
    this.huCardPlayer   = 0;        // 胡牌的玩家

    this.hasSendCards   = false;    // 是否已经发牌
    this.hangupStart    = false;    // 挂起的开始游戏
    this.isSendSett     = false;    // 是否发送结算
    this.canDiHu        = true;     // 能否地胡

    this.roundReports   = [];       // 每局战报

    this.playing        = false;    // 正在打牌
}

Room.prototype = {

    // 初始化
    init: function(creator, cArgs) {
        var round = +cArgs.round;
        var masterType = +cArgs.masterType;
        var forceHupai = cArgs.forceHupai;

        // 参数检查
        if (isNaN(round) || isNaN(masterType)) {
            return false;
        }
        if (!(Enum.validRoomRound(round)
            && Enum.validRoomMasterType(masterType))) {
            return false;
        }

        // 初始化房间全局数据
        this.creator = creator;
        this.round = round;
        this.masterType = masterType;
        this.forceHupai = forceHupai;

        // 初始化房间玩家数据
        for (var iPlayer = 1; iPlayer <= 4; ++iPlayer) {
            this.players[iPlayer] = new Player(this, iPlayer);
        }

        this.publicCards = new PublicCards();

        // 随机庄家
        this.dealer = Math.floor(Math.random() * Enum.ROOM_PLAYER_NUM) + 1;
        //this.dealer = 1;
        this.hangupTask = new HangupTask(this);

        return true;
    },

    // 获取房间号
    getId: function() {
        return this.id;
    },

    // 枚举玩家
    enumPlayers: function(enumtor) {
        for (var playerIdx in this.players) {
            if (!this.players.hasOwnProperty(playerIdx)) {
                continue;
            }
            if (enumtor(+playerIdx, this.players[playerIdx]) === false) {
                break;
            }
        }
    },

    enumPlayersWithOrder: function(playerIndex, enumtor) {
        var nPlayerIndex = playerIndex;
        while (true) {
            if (enumtor(+nPlayerIndex, this.players[nPlayerIndex]) === false) {
                break;
            }
            nPlayerIndex += 1;
            if (nPlayerIndex > 4) {
                nPlayerIndex = 1;
            }
            if (nPlayerIndex == playerIndex) {
                break;
            }
        }
    },

    // 设置庄家
    setDealer: function(Ok) {
        this.enumPlayers(function(ePlayerIdx, ePlayer){
            ePlayer.setDealer(ePlayerIdx == this.dealer, Ok);
        }.bind(this));
    },

    // 广播消息
    broadcastMsg: function(code, args, excludes) {
        excludes = excludes || [];
        this.enumPlayers(function(ePlayerIdx, ePlayer){
            if ((excludes.indexOf(ePlayerIdx) == -1) && ePlayer.isInited()) {
                ePlayer.sendMsg(code, args);
            }
        });
    },

    modifyOnlinePlayers: function(val) {
        this.onlinePlayers += val;
        Assert((this.onlinePlayers >= 0 && this.onlinePlayers <= 4)
            , "修改在线玩家出错, onlinePlayers=" + this.onlinePlayers);
    },


    // 添加一个玩家
    addPlayer: function(jArgs, wsConn) {
        var playerIndex = this.getPlayerIndex(jArgs.uid);
        if (playerIndex != 0) {
            return this.onPlayerReconnect(playerIndex, wsConn);
        }

        // 检查房间是否已满
        if (this.joinedPlayers == Enum.ROOM_PLAYER_NUM) {
            return false;
        }

        //playerIndex = this.joinedPlayers + 1;
        for (var iK in this.players) {
            if (!this.players[iK].isInited()) {
                playerIndex = +iK;
                break;
            }
        }

        var player = this.players[playerIndex];
        player.init(jArgs, wsConn);
        if (playerIndex == this.dealer) {
            player.zhongMasterNum += 1;
        }
        this.joinedPlayers += 1;
        this.modifyOnlinePlayers(1);

        // 广播消息
        this.broadcastMsg(ProtoID.SMSG_PLAYER_JOIN_ROOM, {
            playerIndex : playerIndex,
            player      : player.getInfo(),
        }, [playerIndex]);

        // 准备返回给玩家的初始化数据
        var initArgs = {
            round       : this.round,
            masterType  : this.masterType,
            forceHupai  : this.forceHupai,
            dealer      : this.dealer,
            players     : {},
            playerIndex : playerIndex,
        };
        this.enumPlayers(function(ePlayerIdx, ePlayer){
            if (ePlayer.isInited()) {
                initArgs.players[ePlayerIdx] = ePlayer.getInfo();
            }
        });

        // 给新玩家推送消息
        player.sendMsg(ProtoID.SMSG_JOIN_ROOM, initArgs);

        // 开始游戏
        if (this.joinedPlayers == Enum.ROOM_PLAYER_NUM) {
            setTimeout(function(){
                this.onRoomStartNewRound();
            }.bind(this), 200);
        }
        return true;
    },

    onPlayerReconnect: function(playerIndex, wsConn) {
        var player = this.players[playerIndex];

        var isOnline = player.online;

        // 发送房间数据
        var recArgs = {
            round       : this.round,       // 总轮数
            masterType  : this.masterType,  // 中庄机制
            forceHupai  : this.forceHupai,  // 胡牌机制
            players     : {},               // 玩家数据
            curRound:   this.curRound,      // 当前轮数
            dealer:     this.dealer,        // 当前庄家
            curPlay:    this.curPlay,       // 当前出牌玩家
            playerIndex : playerIndex,      // 玩家位置
        };

        player.setNewConn(wsConn);

        // 获取玩家数据
        this.enumPlayers(function(ePlayerIdx, ePlayer){
            if (ePlayer.isInited()) {
                recArgs.players[ePlayerIdx] = ePlayer.getRecInfo(ePlayerIdx == playerIndex, this.playing);
            }
        }.bind(this));
        player.sendMsg(Opcodes.SMSG_SET_PLAYER_RECONNECT, recArgs);

        // 通知玩家上线
        this.broadcastMsg(Opcodes.SMSG_SET_PLAYER_ONLINE, {
            playerIndex : playerIndex,
        });

        if (!isOnline) {
            this.modifyOnlinePlayers(1);
        }
        player.onReconnect();
        return true;
    },

    // 获取玩家索引
    getPlayerIndex: function(uid) {
        for (var playerIdx in this.players) {
            if (!this.players.hasOwnProperty(playerIdx)) {
                continue;
            }

            if (this.players[playerIdx].isPlayer(uid)) {
                return +playerIdx;
            }
        }
        return 0;
    },

    // 摸牌并发送通知
    sendNewCard: function(incCurPlay) {
        if (this.publicCards.isEmpty()) {
            // 黄庄
            this.isHuangZhuang = true;

            // 设置其他人
            this.enumPlayers(function(eNotUse, ePlayer){
                ePlayer.huCard(false);
            }.bind(this));

            this.onSettement();
            return;
        }

        if (incCurPlay) {
            this.curPlay += 1;
            if (this.curPlay > 4) {
                this.curPlay = 1;
            }
        }

        var moPaiPlayer = this.players[this.curPlay];
        var newPubCard = this.publicCards.getCard();

        // 设置最后摸牌玩家
        this.lastMopai = this.curPlay;

        this.sendPublicCardNum();

        // 广播当前出牌玩家
        this.enumPlayers(function(ePlayerIdx, ePlayer){
            if (ePlayerIdx != this.curPlay) {
                ePlayer.sendMsg(Opcodes.SMSG_SET_PLAY_CARD_PLAYER, {
                    playerIndex : this.curPlay,
                });
            } else {
                ePlayer.sendMsg(Opcodes.SMSG_SET_PLAY_CARD_PLAYER, {
                    playerIndex : this.curPlay,
                    card        : newPubCard,
                });
            }
        }.bind(this));

        this.hangupTask.reset();
        this.hangupTask.setCurPlay(this.curPlay);

        if (!moPaiPlayer.setPubCard(newPubCard, this.hangupTask)) {
            // 该玩家不能对这张牌进行扫/提操作(玩家出的是公牌)
            this.hangupTask.setPlayedCard(newPubCard, Enum.PlayedCardType.PLAYED_CARD_PUB);

            if (this.curPlay != this.dealer) {
                this.canDiHu = false;
            }

            // 出牌
            this.broadcastMsg(Opcodes.SMSG_SET_PLAYED_CARD, {
                playerIndex: this.curPlay,
                card: newPubCard,
            });

            // 检查其他玩家
            this.enumPlayersWithOrder(this.curPlay, function (eNotUse, ePlayer) {
                if (ePlayer.checkWithPlayedPubCard(this.curPlay, newPubCard, this.hangupTask)) {
                    return false;
                }
            }.bind(this));

            // 如果有人胡牌就停止流程
            if (this.isHupai) {
                return;
            }

            // 检查任务
            if (this.hangupTask.checkTask()) {
                return;
            }

            if (this.hangupTask.isEmpty()) {
                // 所有玩家不能对这张牌有任何操作
                moPaiPlayer.addPlayedCard(newPubCard, Enum.PlayedCardType.PLAYED_CARD_PUB, true, true);
                this.sendNewCard(true);
            } else {
                if ((this.hangupTask.getHuCardPlayers().length > 0) && this.forceHupai) {
                    // 有人可以胡牌并且房间强制胡牌
                    this.onSettement();
                    return;
                }

                // 给玩家发提示
                this.enumPlayers(function(ePlayerIndex, ePlayer){
                    var TIPs = this.hangupTask.getPlayerTips(ePlayerIndex);
                    if (TIPs.marks.length > 0) {
                        ePlayer.sendMsg(Opcodes.SMSG_SET_TIPS, {
                            tips    : TIPs,
                            card    : newPubCard,
                        });
                    }
                }.bind(this));
            }
        }
    },

    // 输出房间信息
    dump: function() {
        DEBUG(util.format("Room %d created { round: %d, masterType: %d, forceHupai: %s }",
            this.id, this.round, this.masterType, this.forceHupai ? "true" : "false"));
    },

    ///////////////////////////////////////////////////////////////////////////

    // 任务消息
    onHangupTaskMsg: function(opCode, rArgs) {
        DEBUG(util.format("%d - %j", opCode, rArgs));

        // 推取消提示消息
        this.broadcastMsg(Opcodes.SMSG_SET_TIPS, {
            tips: {
                marks   : [Enum.PlayerTips.PLAYER_TIP_CANCEL],
                args    : {},
            }
        });

        switch (opCode) {
            // 胡别人的牌
            case HangupTask.MSG_PLAYER_HU_CARD:
                var huCardPlayerIndex = rArgs.playerIndex;
                var huCardPlayer = this.players[huCardPlayerIndex];

                this.onPlayerHuCard(huCardPlayer, huCardPlayerIndex);
                break;

            case HangupTask.MSG_PLAYER_PENG_CARD:
                var pengCardPlayerIndex = rArgs.playerIndex;
                this.players[pengCardPlayerIndex].pengCard(
                    this.hangupTask.getCurPlay(),
                    this.hangupTask.getPlayedCard(),
                    this.hangupTask.getPlayedCardType());
                break;

            case HangupTask.MSG_PLAYER_PAO_CARD:
                var paoCardPlayerIndex = rArgs.playerIndex;
                var paoInfo = rArgs.paoInfo;

                this.players[paoCardPlayerIndex].paoCard(paoInfo);
                break;

            case HangupTask.MSG_PLAYER_CHI_CARD:
                var chiCardPlayerIndex = rArgs.playerIndex;
                var chiSes = rArgs.chiSes;
                var luoSess = rArgs.luoSess;

                this.players[chiCardPlayerIndex].chiCard(
                    this.hangupTask.getCurPlay(),
                    this.hangupTask.getPlayedCard(),
                    chiSes,
                    luoSess
                );
                break;

            case HangupTask.MSG_ALL_PASS:
                this.sendNewCard(true);
                break;

            case HangupTask.MSG_ADD_PLAYED_CARD:
                var playerIndex = rArgs.playerIndex;
                var playedCard = rArgs.card;
                var playedCardType = rArgs.type;
                var passed = rArgs.passed;
                var show = rArgs.show;
                var player = this.players[playerIndex];
                player.addPlayedCard(playedCard, playedCardType, passed, show);
                break;
        }
    },

    // 玩家消息
    onPlayerMsg: function(player, msg) {
        DEBUG(util.format("onPlayerMsg -> %d, %j", player.uid, msg));

        switch (msg.code) {
            case Player.MSG_5HU_WARNING:
                break;

            case Player.MSG_CAN_HUPAI:
                var playerIndex = this.getPlayerIndex(player.uid);

                // 清理标记
                this.enumPlayers(function(ePlayerIndex, ePlayer){
                    if (ePlayerIndex != playerIndex) {
                        ePlayer.onPlayerResped([Opcodes.SMSG_SET_PLAYED_CARD]);
                    }
                });

                this.canHupais.push(playerIndex);
                break;

            case Player.MSG_KAN_CARD:
                var kanOrder = msg.args.order;
                var kanCard = msg.args.card;
                var kanScore = Enum.getKANscore(this, kanOrder);
                var kanPlayerIdx = this.getPlayerIndex(player.uid);
                // 修改玩家积分
                var modScores = [];
                this.enumPlayers(function(ePlayerIndex, ePlayer){
                    if (ePlayerIndex != kanPlayerIdx) {
                        ePlayer.modifyScore(0 - kanScore);
                        modScores.push(0 - kanScore);
                    } else {
                        player.modifyScore(kanScore * 3);
                        modScores.push(kanScore * 3);
                    }
                }.bind(this));
                // 广播消息
                this.broadcastMsg(Opcodes.SMSG_SET_PLAYER_KAN_CARD, {
                    playerIndex : kanPlayerIdx,
                    modScores   : modScores,
                    card        : kanCard,
                });
                break;

            case Player.MSG_TI_CARD:
                var tiType = msg.args.type;
                var tiCard = msg.args.card;
                var tiScore = Enum.getTIscore(this, tiType);
                var tiPlayerIndex = this.getPlayerIndex(player.uid);
                // 修改玩家积分
                var modScores = [];
                this.enumPlayers(function(ePlayerIndex, ePlayer){
                    if (ePlayerIndex != tiPlayerIndex) {
                        ePlayer.modifyScore(0 - tiScore);
                        modScores.push(0 - tiScore);
                    } else {
                        player.modifyScore(tiScore * 3);
                        modScores.push(tiScore * 3);
                    }
                }.bind(this));
                // 广播消息
                this.broadcastMsg(Opcodes.SMSG_SET_PLAYER_TI_CARD, {
                    playerIndex : tiPlayerIndex,
                    modScores   : modScores,
                    card        : tiCard,
                });
                // 开局提牌不出牌
                if (tiType != 1) {
                    if (player.isFirstTiPao()) {
                        // 要求玩家出牌
                        player.sendMsg(Opcodes.SMSG_SET_PLAYER_PLAY_CARD, {});
                    } else {
                        // 下家摸牌
                        this.curPlay = tiPlayerIndex;
                        this.sendNewCard(true);
                    }
                }
                break;

            case Player.MSG_SAO_CARD:
                var saoOrder = msg.args.order;
                var saoCard = msg.args.card;
                var saoScore = Enum.getSAOscore(this, saoOrder);
                var saoPlayerIndex = this.getPlayerIndex(player.uid);
                // 修改玩家积分
                var modScores = [];
                this.enumPlayers(function(ePlayerIndex, ePlayer){
                    if (ePlayerIndex != saoPlayerIndex) {
                        ePlayer.modifyScore(0 - saoScore);
                        modScores.push(0 - saoScore);
                    } else {
                        player.modifyScore(saoScore * 3);
                        modScores.push(saoScore * 3);
                    }
                }.bind(this));
                // 广播消息
                this.broadcastMsg(Opcodes.SMSG_SET_PLAYER_SAO_CARD, {
                    playerIndex : saoPlayerIndex,
                    modScores   : modScores,
                    card        : saoCard,
                    num         : player.handCards.getSaoNum(),
                });
                // 要求玩家出牌
                player.sendMsg(Opcodes.SMSG_SET_PLAYER_PLAY_CARD, {});
                break;

            case Player.MSG_PENG_CARD:
                var pengCard = msg.args.card;
                var pengCardType = msg.args.cardType;
                var pengCurPlay = msg.args.curPlay;
                var pengOrder = msg.args.order;
                var pengBaseScore = Enum.getPENGscore(this, pengOrder);
                var pengPlayerIndex = this.getPlayerIndex(player.uid);
                var modScores = [];
                if (pengCardType == Enum.PlayedCardType.PLAYED_CARD_PUB) {
                    // 玩家碰公牌

                    // 扣除其他玩家分数并推送通知
                    this.enumPlayers(function(ePlayerIndex, ePlayer) {
                        if (ePlayerIndex != pengPlayerIndex) {
                            ePlayer.modifyScore(0 - pengBaseScore);
                            modScores.push(0 - pengBaseScore);
                        } else {
                            ePlayer.modifyScore(pengBaseScore * 3);
                            modScores.push(pengBaseScore * 3);
                        }
                    }.bind(this));
                } else {
                    var playCardPlayer = this.players[pengCurPlay];
                    playCardPlayer.modifyScore(0 - (pengBaseScore * 3));
                    player.modifyScore(pengBaseScore * 3);

                    modScores = [0,0,0,0];
                    modScores[pengCurPlay - 1] = (0 - (pengBaseScore * 3));
                    modScores[pengPlayerIndex - 1] = pengBaseScore * 3;
                }

                // 清理标记
                this.enumPlayers(function(ePlayerIndex, ePlayer){
                    if (ePlayerIndex != pengPlayerIndex) {
                        ePlayer.onPlayerResped([Opcodes.SMSG_SET_PLAYED_CARD]);
                    }
                });

                // 广播消息
                this.broadcastMsg(Opcodes.SMSG_SET_PLAYER_PENG_CARD, {
                    playerIndex : pengPlayerIndex,
                    modScores   : modScores,
                    card        : pengCard,
                    cardType    : pengCardType,
                    num         : player.handCards.getSaoNum(),
                });
                // 修改出牌玩家
                this.curPlay = pengPlayerIndex;
                this.broadcastMsg(Opcodes.SMSG_SET_PLAY_CARD_PLAYER, {
                    playerIndex : pengPlayerIndex,
                });
                // 要求玩家出牌
                player.sendMsg(Opcodes.SMSG_SET_PLAYER_PLAY_CARD, {});
                break;

            case Player.MSG_CHI_CARD:
                var chiCard = msg.args.card;
                var chiCurPlay = msg.args.curPlay;
                var chiSes = msg.args.chiSes;
                var luoSess = msg.args.luoSess;
                var chiPlayerIndex = this.getPlayerIndex(player.uid);

                // 清理标记
                this.enumPlayers(function(ePlayerIndex, ePlayer){
                    if (ePlayerIndex != chiPlayerIndex) {
                        ePlayer.onPlayerResped([Opcodes.SMSG_SET_PLAYED_CARD]);
                    }
                });

                // 广播消息
                this.enumPlayers(function(eNotUse, ePlayer){
                    ePlayer.sendMsg(Opcodes.SMSG_SET_PLAYER_CHI_CARD, {
                        playerIndex: chiPlayerIndex,
                        card: chiCard,
                        chiSes: chiSes,
                        luoSess: luoSess
                    });
                });
                // 修改出牌玩家
                this.curPlay = chiPlayerIndex;
                this.broadcastMsg(Opcodes.SMSG_SET_PLAY_CARD_PLAYER, {
                    playerIndex : chiPlayerIndex,
                });
                // 要求玩家出牌
                player.sendMsg(Opcodes.SMSG_SET_PLAYER_PLAY_CARD, {});
                break;

            // 跑牌
            case Player.MSG_PAO_CARD:
                var paoCard = msg.args.card;
                var paoScores = msg.args.scores;
                var paoPlayerIndex = msg.args.playerIndex;

                // 计算分数
                var paoScore = 0;
                paoScores[paoPlayerIndex - 1] = 0;
                paoScores.forEach(function(score){
                    paoScore += score;
                });
                paoScores[paoPlayerIndex - 1] = Math.abs(paoScore);

                // 扣分加分
                for (var iScore = 0; iScore < Enum.ROOM_PLAYER_NUM; ++iScore) {
                    this.players[(iScore + 1)].modifyScore(paoScores[iScore]);
                }

                // 清理标记
                this.enumPlayers(function(ePlayerIndex, ePlayer){
                    if (ePlayerIndex != paoPlayerIndex) {
                        ePlayer.onPlayerResped([Opcodes.SMSG_SET_PLAYED_CARD]);
                    }
                });

                // 广播消息
                this.broadcastMsg(Opcodes.SMSG_SET_PLAYER_PAO_CARD, {
                    playerIndex : paoPlayerIndex,
                    modScores   : paoScores,
                    card        : paoCard,
                });

                // 修改出牌玩家
                this.curPlay = paoPlayerIndex;
                this.broadcastMsg(Opcodes.SMSG_SET_PLAY_CARD_PLAYER, {
                    playerIndex : paoPlayerIndex,
                });

                if (player.isFirstTiPao()) {
                    // 要求玩家出牌
                    player.sendMsg(Opcodes.SMSG_SET_PLAYER_PLAY_CARD, {});
                } else {
                    // 下家摸牌
                    this.curPlay = paoPlayerIndex;
                    this.sendNewCard(true);
                }
                break;

            // 自摸胡牌消息
            case Player.MSG_HU_CARD:
                var showCard = msg.args.showCard;
                var card = msg.args.card;
                var playerIndex = this.getPlayerIndex(player.uid);
                if (showCard) {
                    this.broadcastMsg(Opcodes.SMSG_SET_PLAYED_CARD, {
                        playerIndex: playerIndex,
                        card: card,
                    });
                }
                this.onPlayerHuCard(player, playerIndex);
                break;

            // 玩家离线
            case Player.MSG_PLAYER_OFFLINE:
                this.onPlayerOffline(player);
                break;
        }
    },

    onPlayerOffline: function(player) {
        var playerIndex = this.getPlayerIndex(player.uid);
        DEBUG(util.format("Player %d is offline", player.uid));
        this.modifyOnlinePlayers(-1);

        this.broadcastMsg(Opcodes.SMSG_SET_PLAYER_OFFLINE, {
            playerIndex     : playerIndex,
        }, [playerIndex]);
    },

    // 玩家胡牌处理
    onPlayerHuCard: function(player, playerIndex) {
        // 判断是否地胡
        var curPlay = this.hangupTask.getCurPlay();
        if ((curPlay == this.dealer)
            && this.canDiHu
            && (playerIndex != this.dealer)) {
            if (player.getHupaiMethods().indexOf(Enum.HupaiMethod.METHOD_5_HU) == -1) {
                player.clearHupaiMethods();
                player.pushHupaiMethod(Enum.HupaiMethod.METHOD_DI_HU);
            }
        }

        // 增加玩家胡牌次数
        player.huCard(true);
        // 设置其他人
        this.enumPlayers(function(ePlayerIndex, ePlayer){
            if (ePlayerIndex != playerIndex) {
                ePlayer.huCard(false);
            }
        }.bind(this));

        // 增加玩家点炮次数
        var curPlay = this.hangupTask.getCurPlay();
        if ((curPlay != playerIndex)) {
            this.players[curPlay].incDianPao();
        }

        // 计算分数
        var scoreInfo = player.calcHuCardScores(this.hangupTask, this.masterType);

        // 扣分加分
        for (var iScore = 0; iScore < Enum.ROOM_PLAYER_NUM; ++iScore) {
            this.players[(iScore + 1)].modifyScore(scoreInfo[iScore]);
        }

        // 替换坎五胡标志为五胡
        var clonedHuMethods = clone(player.getHupaiMethods());
        var kan5HuIndex = clonedHuMethods.indexOf(Enum.HupaiMethod.METHOD_KAN_5HU);
        if (kan5HuIndex != -1) {
            clonedHuMethods[kan5HuIndex] = Enum.HupaiMethod.METHOD_5_HU;
        }

        // 广播玩家胡牌消息
        this.broadcastMsg(Opcodes.SMSG_SET_PLAYER_HU_CARD, {
            playerIndex     : playerIndex,
            card            : player.getHuNeedCard(),
            modScores       : scoreInfo,
            huPaiMethods    : clonedHuMethods,
        });

        // 设置胡牌玩家
        this.huCardPlayer = playerIndex;
        // 设置房间有人胡牌
        this.isHupai = true;
        // 设置庄家
        this.dealer = playerIndex;

        // 设置就绪状态
        this.readyPlayers = 0;
        this.enumPlayers(function (eNotUse, ePlayer) {
           ePlayer.setReady(false);
        });

        // 结算当前局
        this.onSettement(scoreInfo);
    },

    // 房间开始新一轮游戏
    onRoomStartNewRound: function() {
        if (this.curRound >= this.round) {
            // 游戏结束
            //this.onGameOver();
            Assert(false, "Not reach here");
            return;
        }

        // 初始化游戏数据
        this.publicCards.gen();
        this.curRound += 1;
        this.setDealer((this.curRound != 1) && (!this.isHuangZhuang));
        this.curPlay = this.dealer; // 设置出牌玩家为庄家
        this.hasSendCards = false;
        this.hangupStart = false;
        this.isSendSett = false;
        this.canDiHu = true;
        this.playing = true;

        // 清除胡牌信息
        this.isHupai = false;
        this.canHupais = [];
        this.isHuangZhuang = false;
        this.lastMopai = 0;
        this.huCardPlayer = 0;

        // 广播房间状态
        this.broadcastMsg(ProtoID.SMSG_SET_ROOM_INFO, {
            curRound:   this.curRound,
            dealer:     this.dealer,
            dealerNum:  this.players[this.curPlay].getLianZhuangNum(),
        });

        // 给玩家发牌
        this.enumPlayers(function(ePlayerIndex, ePlayer){
            if (ePlayerIndex != this.dealer) {
                ePlayer.setHandCards(this.publicCards.getCards(14));
            } else {
                ePlayer.setHandCards(this.publicCards.getCards(15));
            }
        }.bind(this));

        this.hasSendCards = true;

        this.sendPublicCardNum();
        this.onSetPlayersHandCards();
    },


    /**
     * 数据重置
     */
    roomRest : function () {
        this.enumPlayers(function (ePlayerIndex, ePlayer) {
            ePlayer.reset();
        });
    },

    // 开局给玩家发完手牌后逻辑
    onSetPlayersHandCards: function() {
        if (this.canHupais.length != 0) {
            // 有人可以胡牌

            // 开局多人胡牌的时候计算胡牌玩家位置
            var huPlayerIndex = 0;
            var huCardWeight = 0; // 4双龙>3七对>2坎五胡>1普通胡牌(开局只有庄家有可能)
            var huPlayerDiff = Enum.ROOM_PLAYER_NUM;
            this.canHupais.forEach(function(playerIndex){
                var tempWeight = 0;
                var hupaiMethods = this.players[playerIndex].getHupaiMethods();
                if (hupaiMethods.indexOf(Enum.HupaiMethod.METHOD_2_LONG) != -1) {
                    tempWeight = 4;
                } else if (hupaiMethods.indexOf(Enum.HupaiMethod.METHOD_7_PAIRS) != -1) {
                    tempWeight = 3;
                } else if (hupaiMethods.indexOf(Enum.HupaiMethod.METHOD_KAN_5HU) != -1){
                    tempWeight = 2;
                } else {
                    tempWeight = 1;
                }

                var diff = playerIndex - this.dealer;
                if (diff < 0) diff += Enum.ROOM_PLAYER_NUM;

                if ((tempWeight > huCardWeight)
                    || ((tempWeight == huCardWeight) && (diff < huPlayerDiff))) {
                    huCardWeight = tempWeight;
                    huPlayerIndex = playerIndex;
                    huPlayerDiff = diff;
                }
            }.bind(this));

            if (huPlayerIndex == this.dealer) {
                // 庄家天胡
                if (huCardWeight == 1) {
                    this.players[this.dealer].clearHupaiMethods();
                    this.players[this.dealer].pushHupaiMethod(Enum.HupaiMethod.METHOD_TIAN_HU);
                }
            }

            this.hangupTask.reset();
            if (this.forceHupai) {
                // 强制胡牌
                //this.onSettement();

                this.hangupTask.setCurPlay(huPlayerIndex);
                this.hangupTask.setPlayedCard(0, Enum.PlayedCardType.PLAYED_CARD_PUB);
                this.onPlayerHuCard(this.players[huPlayerIndex], huPlayerIndex);
            } else {
                this.hangupTask.setCurPlay(this.curPlay);

                // 给可以胡牌的玩家发提示
                this.canHupais.forEach(function(ePlayerIndex){
                    this.hangupTask.addHuCardPlayer(ePlayerIndex);
                    this.players[ePlayerIndex].sendMsg(Opcodes.SMSG_SET_TIPS, {
                        tips    : [ Enum.PlayerTips.PLAYER_TIP_HU ]
                    });
                }.bind(this));
            }
        } else {
            // 没人可以胡牌

            // 处理开局提/坎
            this.enumPlayers(function(eNotUse, ePlayer){
                ePlayer.onSetHandCards();
            });

            // 修改出牌玩家
            this.curPlay = this.dealer;
            this.broadcastMsg(Opcodes.SMSG_SET_PLAY_CARD_PLAYER, {
                playerIndex : this.dealer,
            });
            // 要求庄家出牌
            this.players[this.dealer].sendMsg(Opcodes.SMSG_SET_PLAYER_PLAY_CARD, {});
        }
    },

    // 结算
    onSettement: function(modScores, endRoom) {
        DEBUG("Room::onSettement");

        modScores = modScores || [0, 0, 0, 0];

        this.isSendSett = true;
        this.playing = false;

        if (this.isHuangZhuang) {
            // 黄庄
            this.dealer = this.lastMopai;
            this.players[this.dealer].zhongMasterNum++;

            // 设置就绪状态
            this.readyPlayers = 0;
            this.enumPlayers(function (eNotUse, ePlayer) {
                ePlayer.setReady(false);
            });
        }

        var dianPaoPlayer = this.hangupTask.getCurPlay();
        if ((dianPaoPlayer == this.huCardPlayer)
            || this.isHuangZhuang
            || (this.hangupTask.getPlayedCardType() == Enum.PlayedCardType.PLAYED_CARD_PUB)) {
            dianPaoPlayer = 0;
        }

        // 发送结算信息
        var settementInfo = {
            modScores       : modScores,                            // 扣分信息
            huCardPlayer    : this.huCardPlayer,                    // 胡牌玩家
            dianPaoPlayer   : dianPaoPlayer,                        // 点炮玩家
            publicCards     : this.publicCards.getRemainCards(),    // 剩余公牌
            players         : {},                                   // 玩家数据
        };

        var roundReport = { "time" : Date.getStamp(), };

        this.enumPlayers(function(ePlayerIndex, ePlayer){
            settementInfo.players[ePlayerIndex]
                = ePlayer.getSettementInfo();
            roundReport[ePlayerIndex] = {
                name: ePlayer.info.name,
                score: ePlayer.roundScore,
            };
        }.bind(this));


        this.roundReports.push(roundReport);

        // 广播结算信息
        this.broadcastMsg(Opcodes.SMSG_SET_ROUND_SETTEMENT, settementInfo);

        // 设置玩家状态
        this.enumPlayers(function (eNotUse, ePlayer) {
            ePlayer.setSendRst();
        });
        this.roomRest();
        if ((this.curRound >= this.round) || endRoom) {
            // 总结算
            this.onGameOver();
        }
    },

    // 发送剩余公牌数量
    sendPublicCardNum: function() {
        var cardNum = this.publicCards.getRemain();
        this.broadcastMsg(Opcodes.SMSG_SET_REMAIN_CARD_NUM, {
            cardNum    : cardNum
        })
    },

    // 游戏结束
    onGameOver: function() {
        DEBUG("==== GAME OVER");

        // 发送结算信息
        var settementInfo = {
            players         : {},                                   // 玩家数据
        };
        this.enumPlayers(function(ePlayerIndex, ePlayer){
            settementInfo.players[ePlayerIndex]
                = ePlayer.getSettementInfo(true);
        }.bind(this));

        // 广播结算信息
        this.broadcastMsg(Opcodes.SMSG_SET_FROUND_SETTEMENT, settementInfo);

        // 保存战报
        var playerReports = [];
        var time = Date.getStamp();
        var roomId = this.id;
        var report = {};
        this.enumPlayers(function(ePlayerIndex, ePlayer){
            //playerReports.push(ePlayer.buildReport(roomId, time));
            report[ePlayerIndex] = {
                uid: ePlayer.uid,
                name: ePlayer.info.name,
                headpic: ePlayer.info.headpic,
                score: ePlayer.score,
            };
        }.bind(this));
        report.rounds = this.roundReports;
        report.time = Date.getStamp();
        report.roomId = roomId;
        playerReports.push({ uid: this.players[1].uid, report: report , score: this.players[1].score });
        playerReports.push({ uid: this.players[2].uid, report: report , score: this.players[2].score });
        playerReports.push({ uid: this.players[3].uid, report: report , score: this.players[3].score });
        playerReports.push({ uid: this.players[4].uid, report: report , score: this.players[4].score });

        GameMgr.sendMgrMsg({
            code    : ProtoID.SMSG_REQ_SAVE_REPORTS,
            args    : {
                players : playerReports,
            },
        });

        // 房间结束
        this.broadcastMsg(Opcodes.SMSG_SET_ROOM_FINISHED, {});

        // 销毁房间
        GameMgr.decPlayerCards(this.creator, Enum.getCardsNeed(this.round));
        this.onRoomDestroy();
        GameMgr.decUsage();
        setTimeout(function(){
            this.enumPlayers(function(eNotUse, ePlayer){
                ePlayer.destroy();
            });
            GameMgr.getSubGame().destroyRoom(this);
        }.bind(this), 2000);
    },

    // 立即销毁房间
    destroyRoomImmd: function() {
        // 房间结束
        this.broadcastMsg(Opcodes.SMSG_SET_ROOM_FINISHED, {});

        // 销毁房间
        this.onRoomDestroy();
        GameMgr.decUsage();
        setTimeout(function(){
            this.enumPlayers(function(eNotUse, ePlayer){
                ePlayer.destroy();
            });
            GameMgr.getSubGame().destroyRoom(this);
        }.bind(this), 2000);
    },

    onRoomDestroy: function() {
        var uids = [];
        this.enumPlayers(function (eNotUse, ePlayer) {
            if (ePlayer.isInited()) {
                uids.push(ePlayer.uid);
            }
        });

        GameMgr.sendMgrMsg({
            code    : ProtoID.SMSG_REQ_DESTROY_ROOM,
            args    : {
                uids        : uids,
                scoreAdd    : Enum.getScore(this.round, (this.curRound >= this.round)),
            },
        });
    },

    shutdown: function() {
        DEBUG(util.format("Shutdown room %d", this.id));

        if ((this.curRound > 1) || this.isHupai) {
            this.onGameOver();
        } else {
            this.destroyRoomImmd();
        }
    },

    ///////////////////////////////////////////////////////////////////////////

    onPlayerReqPlayCard: function(uid, card) {
        var playerIndex = this.getPlayerIndex(uid);
        if (playerIndex != this.curPlay) {
            ERROR(util.format("Not player %d's round"));
            return;
        }
        if (playerIndex != this.dealer) {
            this.canDiHu = false;
        }
        var player = this.players[playerIndex];

        player.onPlayerResped();
        if (!player.playCard(card)) {
            return;
        }

        this.playCard(playerIndex, player, card);
    },

    playCard: function(playerIndex, player, card) {
        this.hangupTask.reset();
        this.hangupTask.setCurPlay(this.curPlay);
        this.hangupTask.setPlayedCard(card, Enum.PlayedCardType.PLAYED_CARD_OWN);

        // 出牌
        this.broadcastMsg(Opcodes.SMSG_SET_PLAYED_CARD, {
            playerIndex: this.curPlay,
            card: card,
        });

        // 检查其他玩家
        this.enumPlayersWithOrder(playerIndex, function (ePlayerIndex, ePlayer) {
            if (ePlayerIndex != playerIndex) {
                if(ePlayer.checkWithPlayedPubCard(this.curPlay, card, this.hangupTask)) {
                    return false;
                }
            }
        }.bind(this));

        // 如果有人胡牌就停止流程
        if (this.isHupai) {
            return;
        }

        if (this.hangupTask.checkTask()) {
            return;
        }

        if (this.hangupTask.isEmpty()) {
            // 所有玩家不能对这张牌有任何操作
            this.sendNewCard(true);
        } else {
            if ((this.hangupTask.getHuCardPlayers().length > 0) && this.forceHupai) {
                // 有人可以胡牌并且房间强制胡牌
                this.onSettement();
                return;
            }

            // 给玩家发提示
            this.enumPlayers(function(ePlayerIndex, ePlayer){
                if (ePlayerIndex != playerIndex) {
                    var TIPs = this.hangupTask.getPlayerTips(ePlayerIndex);
                    if (TIPs.marks.length > 0) {
                        ePlayer.sendMsg(Opcodes.SMSG_SET_TIPS, {
                            tips    : TIPs,
                            card    : card,
                        });
                    }
                }
            }.bind(this));
        }
    },

    onPlayerReqPengCard: function(uid) {
        var playerIndex = this.getPlayerIndex(uid);

        this.players[playerIndex].onPlayerResped();

        // 检查玩家能否碰牌
        if (this.hangupTask.getPengCardPlayer() != playerIndex) {
            return;
        }

        if (this.hangupTask.setWantPengCardPlayer(playerIndex)) {
        }
    },

    onPlayerReqChiCard: function(uid, chiSes, luoSess) {
        var playerIndex = this.getPlayerIndex(uid);

        this.players[playerIndex].onPlayerResped();

        // 检查玩家能否吃牌
        if (this.hangupTask.getChiCardPlayers().indexOf(playerIndex) == -1) {
            return;
        }

        if (this.hangupTask.addWantChiCardPlayer(playerIndex, chiSes, luoSess)) {
            // 可以直接吃牌
        }
    },

    onPlayerReqHuCard: function(uid) {
        var playerIndex = this.getPlayerIndex(uid);

        this.players[playerIndex].onPlayerResped();

        // 检查玩家能否胡牌
        if (this.hangupTask.getHuCardPlayers().indexOf(playerIndex) == -1) {
            return;
        }

        this.hangupTask.processed = true;
        this.hangupTask.notifyAddPlayedCard(true);
        this.onHangupTaskMsg(HangupTask.MSG_PLAYER_HU_CARD, {
            playerIndex: playerIndex,
        });

        // if (this.hangupTask.addWantHuCardPlayer(playerIndex)) {
        //     // 可以直接胡牌
        // }
    },

    onPlayerReqPass: function(uid) {
        var playerIndex = this.getPlayerIndex(uid);
        var player = this.players[playerIndex];
        player.onPlayerResped();
        var passCardType = this.hangupTask.getPlayerPassType(playerIndex);
        if (passCardType != 0) {
            player.addPassInfo(this.hangupTask.getPlayedCard(), passCardType);
        }

        this.hangupTask.addPlayerPass(this.getPlayerIndex(uid));
    },

    onPlayerReqContinue: function(uid) {
        var playerIndex = this.getPlayerIndex(uid);
        if (playerIndex != 0) {
            var player = this.players[playerIndex];

            this.players[playerIndex].onPlayerResped();
            if (!player.getReady()) {
                player.setReady(true);

                this.broadcastMsg(Opcodes.SMSG_SET_PLAYER_READY, {
                    playerIndex : playerIndex,
                });

                this.readyPlayers += 1;
                if (this.readyPlayers == this.joinedPlayers) {
                    // 所有人就绪
                    if (!this.hangupStart) {
                        this.onRoomStartNewRound();
                    }
                }
            }
        }
    },

    onPlayerDestroyRoom: function(uid) {
        DEBUG(util.format("Player %d destroy room", uid));
        var playerIndex = this.getPlayerIndex(uid);
        if (playerIndex == this.creator) {
            this.destroyRoomImmd();
        }
    },

    onPlayerReqDestroyRoom: function(uid) {
        DEBUG(util.format("Player %d req destroy room", uid));
        var playerIndex = this.getPlayerIndex(uid);
        if (playerIndex == 0) {
            // 该玩家不在这个房间
            return;
        }

        if (!this.isReqDestroy) {
            // 设置销毁人数
            this.destroyPlayers = this.onlinePlayers;

            if ((uid == this.creator) && (!this.hasSendCards)) {
                // 房主申请解散并且还没有发牌，直接解散
                this.destroyRoomImmd();
                return;
            } else if (!this.hasSendCards) {
                // 还没发牌
                this.removePlayer(playerIndex);
                return;
            }

            if (this.isSendSett) {
                this.hangupStart = true;
            }

            this.isReqDestroy = true;
            this.destroyTime = Enum.ROOM_DESTROY_TIME + Date.getStamp();
            this.destroyTimer = setTimeout(function(){
                this.onSettement([0, 0, 0, 0], true);
            }.bind(this), Enum.ROOM_DESTROY_TIME * 1000);

            // 该玩家同意解散
            this.respDestroyOKs[playerIndex] = 1;

            // 广播通知
            this.broadcastMsg(Opcodes.SMSG_SET_PLAYER_REQ_DROOM, {
                playerIndex : playerIndex,
                destroyTime : this.destroyTime,
            });
        }
    },

    removePlayer: function(playerIndex) {
        var player = this.players[playerIndex];

        this.joinedPlayers -= 1;
        this.onlinePlayers -= 1;


        // 这个玩家滚蛋
        player.sendMsg(Opcodes.SMSG_SET_ROOM_FINISHED, {});
        player.exit();


        // 通知其他人这个SB滚蛋了
        this.broadcastMsg(Opcodes.SMSG_SET_PLAYER_EXIT_ROOM, {
            playerIndex : playerIndex,
        });
    },

    onPlayerRespDestroyRoom: function(uid, ok) {
        var playerIndex = this.getPlayerIndex(uid);
        if (playerIndex == 0) {
            // 该玩家不在这个房间
            return;
        }

        if (ok) {
            if (this.respDestroyOKs.hasOwnProperty(playerIndex)) {
                DEBUG("Player already OK");
                return;
            }

            // 广播消息
            this.broadcastMsg(Opcodes.SMSG_SET_PLAYER_RESP_DROOM, {
                playerIndex : playerIndex,
                ok          : ok,
            });

            this.respDestroyOKs[playerIndex] = 1;
            var okNum = Object.keys(this.respDestroyOKs).length;
            DEBUG(util.format("okNum: %d, destroyPlayers: %d, onlinePlayers: %d"
                , okNum, this.destroyPlayers, this.onlinePlayers));
            if ((okNum >= 2) && (okNum >= this.onlinePlayers)) {
                DEBUG("解散房间");

                // 清理标记
                this.enumPlayers(function(ePlayerIndex, ePlayer){
                    ePlayer.onPlayerResped([Opcodes.SMSG_SET_PLAYER_REQ_DROOM]);
                });

                // 立即解散房间
                clearTimeout(this.destroyTimer);
                this.destroyTimer = null;
                this.isReqDestroy = false;
                this.destroyTime = 0;
                this.respDestroyOKs = {};

                if (this.hasSendCards) {
                    this.onSettement([0, 0, 0, 0], true);
                    return;
                    if (!this.isSendSett) {
                        this.onSettement([0, 0, 0, 0], true);
                    } else {
                        this.onGameOver();
                    }
                } else {
                    this.destroyRoomImmd();
                }
                return;
            }
        } else {
            if (this.respDestroyOKs.hasOwnProperty(playerIndex)) {
                DEBUG("Player already OK");
                return;
            }

            DEBUG("有人不同意");

            // 广播消息
            this.broadcastMsg(Opcodes.SMSG_SET_PLAYER_RESP_DROOM, {
                playerIndex : playerIndex,
                ok          : ok,
            });

            // 清理标记
            this.enumPlayers(function(ePlayerIndex, ePlayer){
                ePlayer.onPlayerResped([Opcodes.SMSG_SET_PLAYER_REQ_DROOM]);
            });

            // 该玩家不同意
            if (this.destroyTimer) {
                clearTimeout(this.destroyTimer);
                this.destroyTimer = null;
                this.isReqDestroy = false;
                this.destroyTime = 0;
                this.respDestroyOKs = {};
            }

            if (this.hangupStart) {
                this.onRoomStartNewRound();
            }
        }
    },

    // 广播用户消息
    onPlayerReqBroadcastMessage: function(uid, message) {
        var playerIndex = this.getPlayerIndex(uid);
        this.broadcastMsg(Opcodes.SMSG_BROADCAST_MESSAGE, {
            playerIndex : playerIndex,
            message     : message,
        }, [playerIndex]);
    },

    onPlayerResp5HuWarning: function(uid, ok) {
        var playerIndex = this.getPlayerIndex(uid);
        var player = this.players[playerIndex];
        if (ok) {
            player.setFiveHuWarning();

            this.broadcastMsg(Opcodes.SMSG_SET_PLAYER_5HU_WARNING, {
                playerIndex : playerIndex,
            });
        }

        this.playCard(playerIndex, player, player.playingCard);
    },

    onPlayerReqExitRoom: function(uid) {
        var playerIndex = this.getPlayerIndex(uid);
        if (playerIndex != 0) {

        }
        var player = this.players[playerIndex];

        if (this.hasSendCards) {
            // 已经发牌，不能退出了
            return;
        }

        this.joinedPlayers -= 1;
        this.onlinePlayers -= 1;
        player.exit();

        this.broadcastMsg(Opcodes.SMSG_SET_PLAYER_EXIT_ROOM, {
            playerIndex : playerIndex,
        });
    }
};

exports.Room = Room;