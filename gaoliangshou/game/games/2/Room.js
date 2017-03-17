/******************************************************************************
 * Author:      zsc
 * Created:     2016/10/26
 *****************************************************************************/

var util = require("util");
var Enum = require("./Enum.js");
var Func = require("./Func.js");
var Player = require("./Player.js").Player;
var ProtoID = require("../../../net/ProtoID.js").ProtoID;
var Opcodes = require("./Opcodes.js").Opcodes;

///////////////////////////////////////////////////////////////////////////////
//>> 公牌

function PublicCards(cardNum) {
    this.num = 0;    // 剩余牌数量
    this.cards = [];   // 牌
    this.getIndex = 0; // 取牌位置
    this.CARD_NUM = cardNum; //牌张数,单张数量
}

PublicCards.prototype = {
    // 生成牌组
    gen: function () {
        this.num = this.CARD_NUM * 4;
        this.cards = [];
        this.getIndex = 0;
        // 生成108张牌
        var originCards = [];
        for (var iVal = 1; iVal <= this.CARD_NUM; ++iVal) {
            originCards.push(iVal);
            originCards.push(iVal);
            originCards.push(iVal);
            originCards.push(iVal);
        }

        //打乱牌
        while (originCards.length > 0) {
            var iRamdom = Math.floor(Math.random() * originCards.length);
            this.cards.push(originCards[iRamdom]);
            originCards.splice(iRamdom, 1);
        }
    },

    //测试数据
    /**
     *
     * @return {*[]}
     */
    genTemp1: function () {
        // 初始化数据
        this.num = 56;
        this.cards = [];
        this.getIndex = 0;
        // 生成108张牌
        var originCards = [];
        for (var iVal = 1; iVal <= this.CARD_NUM; ++iVal) {
            originCards.push(iVal);
            originCards.push(iVal);
            originCards.push(iVal);
            originCards.push(iVal);
        }

        var remainCard = [];

        // 玩家起手牌
        var player1Cards = [1, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 9];
        var player2Cards = [4, 5, 6, 10, 11, 12, 25, 26, 27, 6, 7, 5, 8];
        var player4Cards = [10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 8];
        var player3Cards = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 8];

        //统计每张牌的张数
        var cardMap = {};
        player1Cards.forEach(function (card) {
            // this.cards.push({value: card});
            if (cardMap.hasOwnProperty(card)) {
                cardMap[card] += 1;
            } else {
                cardMap[card] = 1;
            }
        }.bind(this));
        player2Cards.forEach(function (card) {
            // this.cards.push({value: card});
            if (cardMap.hasOwnProperty(card)) {
                cardMap[card] += 1;
            } else {
                cardMap[card] = 1;
            }
        }.bind(this));
        player3Cards.forEach(function (card) {
            // this.cards.push({value: card});
            if (cardMap.hasOwnProperty(card)) {
                cardMap[card] += 1;
            } else {
                cardMap[card] = 1;
            }
        }.bind(this));
        player4Cards.forEach(function (card) {
            // this.cards.push({value: card});
            if (cardMap.hasOwnProperty(card)) {
                cardMap[card] += 1;
            } else {
                cardMap[card] = 1;
            }
        }.bind(this));

        // 生成剩余的牌
        for (var iVal = 1; iVal <= this.CARD_NUM; ++iVal) {
            var needNum = 4 - (cardMap[iVal] || 0);
            for (var x = 0; x < needNum; ++x) {
                remainCard.push(iVal);
            }
        }

        while (remainCard.length > 0) {
            var iRamdom = Math.floor(Math.random() * remainCard.length);
            this.cards.push(remainCard[iRamdom]);
            remainCard.splice(iRamdom, 1);
        }

        return [player1Cards, player2Cards, player3Cards, player4Cards];
    },

    // 摸牌
    getCard: function () {
        var rtnCard = this.cards[this.getIndex];
        this.getIndex += 1;
        this.num -= 1;
        return rtnCard;
    },

    // 摸牌
    getCards: function (num) {
        var rtnCards = [];
        this.num -= num;
        while (num > 0) {
            rtnCards.push(this.cards[this.getIndex]);
            ++this.getIndex;
            num -= 1;
        }
        return rtnCards;
    },

    // 公牌是否已经摸完
    isEmpty: function () {
        return this.num == 0;
    },

    // 获取剩余牌数量
    getRemain: function () {
        return this.num;
    },

    // 获取剩余公牌
    getRemainCards: function () {
        return this.cards.slice(this.getIndex);
    },
};


///////////////////////////////////////////////////////////////////////////////
//>> 游戏房间

function Room(id) {
    this.id = id;       // 房间号
    this.creator = 0;    //房间创建者

    this.gameType = 0;  //游戏类型

    this.round = 0;        // 总轮数
    this.playMeThod = 0;        // 玩法
    this.maNum = 0;    // 抓鸟数

    this.cardNum = 0;  //牌张数
    this.maInfo = {};

    this.players = {};
    this.joinedPlayers = 0;        // 已经加入房间的人数
    this.readyPlayers = 0;        // 准备就绪的玩家
    this.onlinePlayers = 0;        // 在线玩家数量

    this.isReqDestroy = false;    // 是否申请解散
    this.destroyTime = 0;        // 销毁时间
    this.respDestroyOKs = {};       // 同意解散房间的人
    this.destroyTimer = null;     // 解散计时器
    this.destroyPlayers = 0;        // 解散时玩家数量

    // 游戏数据
    this.publicCards = null;   // 公牌
    this.curRound = 0;        // 当前轮
    this.dealer = 0;        // 庄家
    this.nextDealer = 0;        // 下一个庄家
    this.curPlay = 0;        // 当前出牌的人
    this.isHuangZhuang = false;    // 是否黄庄
    this.prePlayer = 0;        //上一个出牌玩家
    this.prePlayMj = 0;        //上一次玩家出的牌
    this.preEatType = 0;        //上一次吃牌类型
    this.preEatMj = [];        //上一次玩家出的牌
    this.nextPlayer = 0;        //下一个出牌玩家
    this.state = null;          //当前的状态
    this.preGangedPlayer = 0;     //上一次杠成功玩家
    this.preMianXiaGangMj = 0; //上一次面下杠的麻将(但是未杠成功的牌，主要被抢杠胡使用)
    this.preMianXiaPlayer = 0;  //上一个面下杠玩家
    this.started = false;       //游戏是否已经开始
}

Room.prototype = {
    // 初始化
    init: function (creator, cArgs) {
        var round = +cArgs.round;
        var playMeThod = cArgs.playMeThod;
        var maNum = cArgs.maNum;
        var gameType = cArgs.gameType;
        // 参数检查
        if (isNaN(round) || isNaN(maNum)) {
            DEBUG(util.format("创建房间参数错误,请检查参数"));
            return false;
        }
        if (!(Enum.validRoomRound(round)) || !(Enum.validZhuaMa(maNum))) {
            DEBUG(util.format("创建房间参数错误,请检查参数"));
            return false;
        }
        if (Enum.validContains(playMeThod, Enum.PlayMeThod.NO_FENG)) {
            //没风玩法
            this.cardNum = Enum.NO_FENG;
        } else {
            this.cardNum = Enum.FENG;
        }
        this.creator = creator;
        // 初始化房间全局数据
        this.round = round;
        this.playMeThod = playMeThod;
        this.gameType = gameType;
        this.maNum = maNum;

        // 初始化房间玩家数据
        for (var iPlayer = 1; iPlayer <= 4; ++iPlayer) {
            this.players[iPlayer] = new Player(this, iPlayer, this.cardNum);
        }

        this.publicCards = new PublicCards(this.cardNum);
        // 随机庄家
        // this.dealer = Math.floor(Math.random() * Enum.ROOM_PLAYER_NUM) + 1;
        this.dealer = 1;
        this.nextDealer = this.dealer;
        return true;
    },

    // 获取房间号
    getId: function () {
        return this.id;
    },

    // 枚举玩家
    enumPlayers: function (enumtor) {
        for (var playerIdx in this.players) {
            if (!this.players.hasOwnProperty(playerIdx)) {
                continue;
            }
            if (enumtor(+playerIdx, this.players[playerIdx]) === false) {
                break;
            }
        }
    },

    // 设置庄家
    setDealer: function () {
        this.enumPlayers(function (ePlayerIdx, ePlayer) {
            ePlayer.setDealer(ePlayerIdx == this.dealer);
        }.bind(this));
    },

    // 广播消息
    broadcastMsg: function (code, args, excludes) {
        excludes = excludes || [];
        this.enumPlayers(function (ePlayerIdx, ePlayer) {
            if ((excludes.indexOf(ePlayerIdx) == -1) && ePlayer.isInited()) {
                ePlayer.sendMsg(code, args);
            }
        });
    },

    /**
     * 获取playerIndex
     * @return {*}
     */
    findPlayerIndex: function () {
        for (var playerInx in this.players) {
            if (this.players[playerInx].uid == 0) {
                return playerInx;
            }
        }
        return 0;
    },

    // 添加一个玩家
    addPlayer: function (jArgs, wsConn) {
        var playerIndex = this.getPlayerIndex(jArgs.uid);
        if (playerIndex != 0) {
            return this.onPlayerReconnect(playerIndex, wsConn);
        }
        // 检查房间是否已满
        if (this.joinedPlayers == Enum.ROOM_PLAYER_NUM) {
            return false;
        }
        // playerIndex = this.joinedPlayers + 1;
        playerIndex = this.findPlayerIndex();
        var player = this.players[playerIndex];
        player.init(jArgs, wsConn);
        this.joinedPlayers += 1;
        this.onlinePlayers += 1;

        for (var index in this.players) {
            if (index != playerIndex) {
                this.players[index].sendMsg(ProtoID.SMSG_PLAYER_JOIN_ROOM, {
                    playerIndex: playerIndex,
                    player: player.getInfo(),
                })
            }
        }

        // 广播消息
        // this.broadcastMsg(ProtoID.SMSG_PLAYER_JOIN_ROOM, {
        //     playerIndex: playerIndex,
        //     player: player.getInfo(),
        // }, [playerIndex]);

        // 准备返回给玩家的初始化数据
        var initArgs = {
            round: this.round,
            curRound: this.curRound,
            playMeThod: this.playMeThod,
            maNum: this.maNum,
            cardNum: this.cardNum * 4,
            dealer: this.dealer,
            gameType: this.gameType,
            players: {},
        };
        this.enumPlayers(function (ePlayerIdx, ePlayer) {
            if (ePlayer.isInited()) {
                initArgs.players[ePlayerIdx] = ePlayer.getInfo();
            }
        });

        // 给新玩家推送消息
        player.sendMsg(ProtoID.SMSG_PLAYER_JOIN_ROOM, initArgs);
        // if (this.joinedPlayers == Enum.ROOM_PLAYER_NUM) {
        //     // 房间人满
        //     this.onRoomStartNewRound();
        // }
        return true;
    },

    //断线重连
    onPlayerReconnect: function (playerIndex, wsConn) {
        var player = this.players[playerIndex];

        // 发送房间数据
        var recArgs = {
            round: this.round,       // 总轮数
            playMeThod: this.playMeThod,  // 玩法
            maNum: this.maNum,  // 买码数
            players: {},               // 玩家数据
            curRound: this.curRound,      // 当前轮数
            dealer: this.dealer,        // 当前庄家
            curPlay: this.curPlay,       // 当前出牌玩家
            playerIndex: playerIndex,      // 玩家位置
            cardNum: this.cardNum * 4,         //牌数
            gameType: this.gameType,            //游戏类型
            reMain: this.publicCards.getRemain(), //剩余牌张数
            status: this.started ? 1 : 0,
            prePlayMj : this.prePlayMj, //上一次玩家出的牌
            prePlayer : this.prePlayer //上一次出牌玩家
        };
        // 获取玩家数据
        this.enumPlayers(function (ePlayerIdx, ePlayer) {
            if (ePlayer.isInited()) {
                recArgs.players[ePlayerIdx] = ePlayer.getRecInfo(ePlayerIdx == playerIndex);
            }
        });
        player.setNewConn(wsConn);
        player.sendMsg(Opcodes.S2C_SET_PLAYER_RECONNECT, recArgs);

        // 通知玩家上线
        this.broadcastMsg(Opcodes.S2C_SET_PLAYER_ONLINE, {
            playerIndex: playerIndex,
        });

        // player.onReconnect();
        this.onlinePlayers += 1;

        return true;
    },

    // 获取玩家索引
    getPlayerIndex: function (uid) {
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

    //下一个出牌玩家
    nextPlayerIndex: function (starIndex) {
        for (var i = 1; i <= 4; i++) {
            var k = (starIndex + i) % 4;
            if (k == 0) {
                k = 4;
            }
            var p = this.players[k];
            if (p == null) {
                continue;
            }
            if (!p.over && p.uid > 0) {
                return k;
            }
        }
        return null;
    },


    //上一个玩家
    prePlayerIndex: function (starIndex) {
        for (var i = 1; i <= 4; i++) {
            var k = (starIndex - i) % 4;
            if (k <= 0) {
                k = 4;
            }
            var p = this.players[k];
            if (p == null) {
                continue;
            }
            if (!p.over && p.uid > 0) {
                return k;
            }
        }
        return null;
    },

    // 输出房间信息
    dump: function () {
        DEBUG(util.format("Room %d created { round: %d, playMeThod: %d, maNum: %s }",
            this.id, this.round, this.playMeThod, this.maNum ? "true" : "false"));
    },

    ///////////////////////////////////////////////////////////////////////////


    //玩家离线
    onPlayerOffline: function (player) {
        var playerIndex = this.getPlayerIndex(player.uid);
        this.onlinePlayers -= 1;

        this.broadcastMsg(Opcodes.S2C_SET_PLAYER_OFFLINE, {
            playerIndex: playerIndex,
        }, [playerIndex]);
    },

    // 房间开始新一轮游戏
    onRoomStartNewRound: function () {
        if (this.curRound >= this.round) {
            // 游戏结束
            this.onGameOver();
            return;
        }


        this.setDealer();
        this.started = true;


        // 清除胡牌信息
        this.prePlayer = 0;
        this.prePlayMj = 0;
        this.preEatMj = [];
        this.nextPlayer = 0;
        this.state = null;
        this.preMianXiaGangMj = 0;
        this.preMianXiaPlayer = 0;
        this.preGangedPlayer = 0;
        this.maInfo = {};
        // 广播房间状态
        // this.broadcastMsg(ProtoID.SMSG_SET_ROOM_INFO, {
        //     curRound: this.curRound,
        //     dealer: this.dealer,
        // });

        if (this.curRound > 1) {
            this.dealer = this.nextDealer;
        }
        this.curPlay = this.dealer; // 设置出牌玩家为庄家
        this.nextPlayer = this.dealer;
    },

    // 结算
    onSettement: function () {
        DEBUG("Room::onSettement");
        this.readyPlayers = 0;

        this.dealer = this.nextDealer;
        // 发送结算信息
        var settementInfo = {
            curRound : this.curRound,
            dealer: this.dealer,
            maInfo: this.maInfo,
            players: {}, // 玩家数据
        };
        this.enumPlayers(function (ePlayerIndex, ePlayer) {
            settementInfo.players[ePlayerIndex]
                = ePlayer.getSettementInfo();
            ePlayer.setReady(false);
        }.bind(this));

        // 广播结算信息
        this.broadcastMsg(Opcodes.S2C_SET_ROUND_SETTEMENT, settementInfo);

        if (this.curRound >= this.round) {
            // 总结算
            this.onGameOver();
        }
        this.roomReset();
    },

    roomReset: function () {
        this.started = false;
        this.enumPlayers(function (ePlayerIndex, ePlayer) {
            ePlayer.reset();
        }.bind(this));

    },

    //游戏结束
    onGameOver: function () {
        DEBUG("======================= GAME OVER ==========================");

        // 发送结算信息
        var settementInfo = {
            players: {},                                   // 玩家数据
        };
        this.enumPlayers(function (ePlayerIndex, ePlayer) {
            settementInfo.players[ePlayerIndex]
                = ePlayer.getSettementInfo(true);
        }.bind(this));

        // 广播结算信息
        this.broadcastMsg(Opcodes.S2C_SET_FROUND_SETTEMENT, settementInfo);
        // 保存战报
        var playerReports = [];
        var time = Date.getStamp();
        var roomId = this.id;
        this.enumPlayers(function (ePlayerIndex, ePlayer) {
            playerReports.push(ePlayer.buildReport(roomId, time));
        }.bind(this));
        GameMgr.sendMgrMsg({
            code: ProtoID.SMSG_REQ_SAVE_REPORTS,
            args: {
                players: playerReports,
            },
        });

        // 房间结束
        this.broadcastMsg(Opcodes.S2C_SET_ROOM_FINISHED, {});

        // 销毁房间
        // this.enumPlayers(function (eNotUse, ePlayer) {
        //     ePlayer.destroy();
        //  });
        this.onRoomDestroy();
        GameMgr.getSubGame().destroyRoom(this);
        GameMgr.decUsage();
        GameMgr.decPlayerCards(this.creator, Enum.getCardsNeed(this.round));
    },

    // 发送剩余公牌数量
    sendPublicCardNum: function () {
        var cardNum = this.publicCards.getRemain();
        this.broadcastMsg(Opcodes.S2C_SET_REMAIN_CARD_NUM, {
            cardNum: cardNum
        })
    },

    // 立即销毁房间
    destroyRoomImmd: function () {
        // 房间结束
        this.broadcastMsg(Opcodes.S2C_SET_ROOM_FINISHED, {});

        // 销毁房间
        this.enumPlayers(function (eNotUse, ePlayer) {
            ePlayer.destroy();
        });
        this.onRoomDestroy();
        GameMgr.getSubGame().destroyRoom(this);
        GameMgr.decUsage();
    },

    onRoomDestroy: function () {
        var uids = [];
        this.enumPlayers(function (eNotUse, ePlayer) {
            if (ePlayer.isInited()) {
                uids.push(ePlayer.uid);
            }
        });

        GameMgr.sendMgrMsg({
            code: ProtoID.SMSG_REQ_DESTROY_ROOM,
            args: {
                uids: uids,
            },
        });
    },

    shutdown: function () {
        if (this.curRound > 1) {
            this.onGameOver();
        } else {
            this.destroyRoomImmd();
        }
    },

    ///////////////////////////////////////////////////////////////////////////

    /**
     * 玩家出牌
     * @param uid
     * @param card
     */
    onPlayerReqPlayCard: function (uid, card) {
        var playerIndex = this.getPlayerIndex(uid);
        if (playerIndex != this.nextPlayer) {
            ERROR(util.format("Not player %d's round", playerIndex));
            return;
        }
        if (this.state != Enum.GameState.PLAY) {
            ERROR(util.format("非出牌阶段不能出牌", playerIndex));
            return;
        }

        var player = this.players[playerIndex];
        if (!player.handCards.contains(card)) {
            DEBUG(util.format("Player %d play card %d failed, Not has This", uid, card));
            return;
        }
        var cards = player.handCards;
        if (cards.getEatMissingCount() > 0 && cards.eatMissing(card)) {
            DEBUG(util.format("Player %d play card %d failed, eat missing card have not over!", uid, card));
            return;
        }
        this.doPlay(playerIndex, card);
    },
    /**
     * 玩家吃牌
     * @param uid
     * @param card
     */
    onPlayerReqEatCard: function (uid, eatType) {
        var playerIndex = this.getPlayerIndex(uid);
        var player = this.players[playerIndex];
        var eatMj = this.prePlayMj;
        if (!Enum.validContains(this.playMeThod, Enum.PlayMeThod.CAN_EAT)) {
            DEBUG(util.format("玩家[%s]吃牌[%d]失败,该房间不支持吃牌", uid, eatMj));
            return
        }
        if (this.nextPlayerIndex(this.prePlayer) != playerIndex) {
            DEBUG(util.format("玩家[%s]吃牌[%d]失败,只能吃上家的牌", uid, eatMj));
            return;
        }

        // cards.push(eatMj);
        if (!player.handCards.eatAble(eatMj)) {
            DEBUG(util.format("玩家[%s]吃牌[%d]失败,未能满足吃牌条件", uid, eatMj));
            return;
        }
        this.preEatType = eatType;
        this.doEat(playerIndex, eatMj, eatType);
    },

    /**
     * 玩家吃牌
     * @param playerIndex
     * @param card
     */

    doEat: function (playerIndex, eatMj, eatType) {
        var player = this.players[playerIndex];
        player.eatState = Enum.GrabState.GRABED;
        player.pengState = null;
        player.gangState = null;
        player.huState = null;
        var hasPeng = false;
        var hasGang = false;
        for (var index in this.players) {
            if (this.players[index].index != playerIndex && this.players[index].pengState == Enum.GrabState.GRABING) {
                hasPeng = true;
                break;
            }
        }
        for (var index in this.players) {
            if (this.players[index].index != playerIndex && this.players[index].gangState == Enum.GrabState.GRABING) {
                hasGang = true;
                break;
            }
        }
        if (!this.huIng(playerIndex) && !this.hued(playerIndex) && (!hasPeng && !hasGang)) {
            this.curPlay = playerIndex;
            player.handCards.eat(eatMj, eatType);
            this.players[this.prePlayer].handCards.playedRemove(eatMj);
            DEBUG(util.format("玩家[%s]吃牌[%d]成功", player.uid, eatMj));
            var calcTingMjs = player.handCards.calcTingPai();
            if (Object.keys(calcTingMjs).length > 0) {
                player.sendMsg(Opcodes.S2C_PLAYER_TING_CARD, {
                    tingPai: calcTingMjs,
                })
            }
            this.nextPlayer = playerIndex;
            this.state = Enum.GameState.PLAY;
            var info = {
                type: Enum.GrabType.EAT,
                playerIndex: playerIndex,
                nextPlayer: playerIndex,
                card: eatMj,
                eatMj: eatType,
            }
            for (var index in this.players) {
                this.players[index].sendMsg(Opcodes.S2C_PLAYER_GRABA_CARD_INFO, info);
            }
            this.resetGrabState();

        } else if (this.grabOver()) {
            this.state = Enum.GameState.PLAY;
            var info = {
                type: Enum.GrabType.PASS,
                playerIndex: playerIndex,
                nextPlayer: playerIndex,
                card: eatMj,
            }
            for (var index in this.players) {
                this.players[index].sendMsg(Opcodes.S2C_PLAYER_GRABA_CARD_INFO, info);
            }
            this.doDraw(this.nextPlayer);
        }
    },
    /**
     * 玩家出牌
     * @param playerIndex
     * @param card
     */

    doPlay: function (playerIndex, card) {
        var player = this.players[playerIndex];
        player.handCards.playMj(card);
        this.prePlayMj = card;
        this.prePlayer = playerIndex;
        this.nextPlayer = this.nextPlayerIndex(playerIndex);
        // 广播玩家出牌
        this.broadcastMsg(Opcodes.S2C_PLAYER_PLAY_CARD, {
            playerIndex: playerIndex,
            card: card,
            reMain: this.publicCards.getRemain()
        });

        // 检查其他玩家
        this.enumPlayers(function (ePlayerIndex, ePlayer) {
            if (ePlayerIndex != playerIndex && !ePlayer.over) {
                var pengAble = ePlayer.handCards.pengAble(card);
                var huAble = ePlayer.handCards.huAble(card, false);
                // var huAble = ePlayer.handCards.huAble(card);
                var gangAble = ePlayer.handCards.gangAble(card);
                var eatAble = false;
                if (ePlayerIndex == this.nextPlayerIndex(this.prePlayer) && Enum.validContains(this.playMeThod, Enum.PlayMeThod.CAN_EAT)) {
                    eatAble = ePlayer.handCards.eatAble(card);
                }

                ePlayer.eatState = eatAble ? Enum.GrabState.GRABING : null;
                ePlayer.pengState = pengAble ? Enum.GrabState.GRABING : null;
                ePlayer.gangState = gangAble ? Enum.GrabState.GRABING : null;
                ePlayer.huState = huAble ? Enum.GrabState.GRABING : null;

                if (pengAble || huAble || gangAble || eatAble) {
                    this.state = Enum.GameState.GRAB;
                    ePlayer.sendMsg(Opcodes.S2C_PLAYER_GRABA_CARD, {
                        pengAble: pengAble,
                        huAble: huAble,
                        gangAble: gangAble,
                        eatAble: eatAble,
                        eatMj: eatAble ? ePlayer.handCards.eatType(card) : [],
                    });
                }
            }
        }.bind(this));

        // 在抢牌阶段不能出牌
        if (this.state == Enum.GameState.GRAB) {
            DEBUG(util.format("抢牌阶段不能摸牌"));
            return;
        }
        if (this.roundOver()) {
            DEBUG(util.format("============================回合[%d] / [%d]结束==========================", this.curRound, this.round));
            this.doRoundOver();
            return;
        }
        this.doDraw(this.nextPlayer);

    },

    /**
     * 摸牌
     * @param nextPlayer
     */
    doDraw: function (nextPlayer) {
        if (this.roundOver()) {
            this.nextDealer = this.prePlayer;
            for (var index in this.players) {
                this.players[index].gangScore = 0;
            }
            this.doRoundOver();
            return;
        }
        this.preMianXiaGangMj = 0;
        this.preMianXiaPlayer = 0;
        this.preGangedPlayer = 0;//重置上一次杠牌成功玩家

        this.curPlay = nextPlayer;
        var player = this.players[nextPlayer];
        var card = this.publicCards.getCard();
        player.sendMsg(Opcodes.S2C_PLAYER_DRAW_CARD, {
            drawPlayer: nextPlayer,
            card: card,
        });
        for (var p in this.players) {
            if (p != player.index) {
                this.players[p].sendMsg(Opcodes.S2C_PLAYER_DREW_CARD, {
                    drawPlayer: nextPlayer,
                });
            }
        }
        DEBUG(util.format("Player %d draw card %d ", player.uid, card));
        //听牌麻将
        var tingmjs = null;
        var gangAble = false;
        var huAble = player.handCards.huAble(card, true);
        player.handCards.drawMj(card);
        for (var i = 1; i <= this.cardNum; i++) {
            if (player.handCards.contains(i) && player.handCards.gangAble(i)) {
                gangAble = true;
                break;
            }
        }
        if (huAble || gangAble) {
            this.state = Enum.GameState.GRAB;
            player.pengState = null;
            player.eatState = null;
            player.gangState = gangAble ? Enum.GrabState.GRABING : null;
            player.huState = huAble ? Enum.GrabState.GRABING : null;
            //todo 超时自动进行过操作
            player.sendMsg(Opcodes.S2C_PLAYER_GRABA_CARD, {
                pengAble: false,
                gangAble: gangAble,
                huAble: huAble,
                eatAble: false,
            });
            return;
        } else if (Object.keys(player.handCards.calcTingPai()).length > 0) {
            tingmjs = player.handCards.calcTingPai();
            player.sendMsg(Opcodes.S2C_PLAYER_TING_CARD, {
                tingInfo: tingmjs,
            })
        }
        //todo 到时间没出牌,自动出牌

    },

    /**
     * 玩家请求碰牌
     * @param uid
     */
    onPlayerReqPengCard: function (uid) {
        var playerIndex = this.getPlayerIndex(uid);
        var player = this.players[playerIndex];
        var pengMj = this.prePlayMj;
        if (!player.handCards.pengAble(pengMj)) {
            DEBUG(util.format("玩家[%s]碰牌[%d]失败,未能满足碰牌条件", uid, pengMj));
            return;
        }
        this.doPeng(playerIndex, pengMj);

    },

    /**
     * 碰牌
     * @param playerIndex
     * @param card
     */
    doPeng: function (playerIndex, pengMj) {
        var player = this.players[playerIndex];
        player.pengState = Enum.GrabState.GRABED;
        player.gangState = null;
        player.huState = null;
        player.eatState = null;
        if (!this.huIng(playerIndex) && !this.hued(playerIndex)) {
            this.curPlay = playerIndex;
            player.handCards.peng(pengMj);
            player.pengdPlayer[pengMj] = this.prePlayer;
            //碰牌,被碰玩家打过的的牌清除
            this.players[this.prePlayer].handCards.playedRemove(pengMj);
            DEBUG(util.format("玩家[%s]碰牌[%d]成功", player.uid, pengMj));
            var calcTingMjs = player.handCards.calcTingPai();
            if (Object.keys(calcTingMjs).length > 0) {
                player.sendMsg(Opcodes.S2C_PLAYER_TING_CARD, {
                    tingPai: calcTingMjs,
                })
            }
            //碰牌成功,碰状态重置 (防止被可吃的玩家pass导致再碰一次)
            player.pengState = null;

            //有吃的玩家自动pass
            for (var index in this.players) {
                var p = this.players[index];
                if (p.index != playerIndex && p.uid > 0 && p.eatState == Enum.GrabState.GRABING) {
                    this.forcedoPass(p.index, pengMj);
                    break;
                }
            }

            this.nextPlayer = playerIndex;
            this.state = Enum.GameState.PLAY;
            var info = {
                type: Enum.GrabType.PENG,
                playerIndex: playerIndex,
                nextPlayer: playerIndex,
                card: pengMj,
                bePengdIndex : this.prePlayer
            }
            for (var index in this.players) {
                this.players[index].sendMsg(Opcodes.S2C_PLAYER_GRABA_CARD_INFO, info);
            }
            this.resetGrabState();

        } else if (this.grabOver()) {
            this.state = Enum.GameState.PLAY;
            var info = {
                type: Enum.GrabType.PASS,
                playerIndex: playerIndex,
                nextPlayer: playerIndex,
                card: pengMj,
            }
            for (var index in this.players) {
                this.players[index].sendMsg(Opcodes.S2C_PLAYER_GRABA_CARD_INFO, info);
            }
            this.doDraw(this.nextPlayer);
        }
    },


    /**
     * 玩家请求杠牌
     * @param uid
     * @param card
     */
    onPlayerReqGangCard: function (uid, card) {
        var playerIndex = this.getPlayerIndex(uid);
        var player = this.players[playerIndex];
        var cards = player.handCards;
        var gangMj = 0;
        if (card == 0) {//为0时由服务器计算
            if (cards.getTotalCount() % 3 == 2) {//摸牌
                var gangAbleMjs = [];
                for (var i = 1; i <= this.cardNum; i++) {
                    if (cards.contains(i) && cards.gangAble(i)) {
                        gangAbleMjs.push(i);
                    }
                }
                if (gangAbleMjs.length != 1) {
                    DEBUG(util.format("玩家[%d]不能杠牌", uid));
                    return;
                }
                gangMj = gangAbleMjs[0];
            } else {//未摸牌
                gangMj = this.prePlayMj;
                DEBUG(util.format("玩家-------------------[%d]请求杠牌 [%d]", uid, gangMj));
            }
        } else if (cards.gangAble(card)) {
            gangMj = card;
        } else {
            DEBUG(util.format("玩家[%d]不能杠牌,没能满足杠牌条件", uid));
            return;
        }
        var gangType = cards.gangType(gangMj);
        if (gangType == null) {
            DEBUG(util.format("玩家[%d]不能杠牌,没能满足杠牌条件 杠类型不满足", uid));
            return;
        }
        this.doGang(playerIndex, gangMj, gangType);
    },


    /**
     *杠牌
     * @param playerIndex
     * @param card
     * @param type
     */
    doGang: function (playerIndex, gangMj, gangType) {
        var player = this.players[playerIndex];
        var cards = player.handCards;
        player.gangState = Enum.GrabState.GRABED;
        player.pengState = null;
        player.eatState = null;
        player.huState = null;
        if (gangType == Enum.GangType.MIAN_XIA_GANG) {
            var qiangGangHu = false;
            for (var index in this.players) {
                var p = this.players[index];
                if (p.index != player.index && !p.over && p.uid > 0) {
                    var huAble = p.handCards.huAble(gangMj, false); //todo 后面可能需要增加不能胡条件 (倍数不够)
                    p.huState = huAble ? Enum.GrabState.GRABING : null;
                    if (huAble) {
                        qiangGangHu = true;
                        this.state = Enum.GameState.GRAB;
                        p.sendMsg(Opcodes.S2C_PLAYER_GRABA_CARD, {
                            pengAble: false,
                            huAble: huAble,
                            gangAble: false,
                            eatAble: false,
                        });
                    }
                }
            }
            //抢杠胡
            if (qiangGangHu) {
                this.preMianXiaGangMj = gangMj;
                this.preMianXiaPlayer = playerIndex;
                return;
            }
        }
        if (gangType == Enum.GangType.AN_GANG || (!this.hued(playerIndex) && !this.huIng(playerIndex))) {
            cards.gang(gangMj, gangType);
            //碰牌,被碰玩家打过的的牌清除
            this.players[this.prePlayer].handCards.playedRemove(gangMj);
            if (gangType == Enum.GangType.ZHI_GANG) {
                player.gangedPlayers[gangMj] = this.prePlayer;
            } else {
                player.gangedPlayers[gangMj] = playerIndex
            }
            this.preGangedPlayer = playerIndex;
            this.nextPlayer = playerIndex;
            this.state = Enum.GameState.PLAY;
            //杠牌成功,碰状态重置 (防止被可吃的玩家pass导致再碰一次)
            player.gangState = null;
            //有吃的玩家自动pass
            for (var index in this.players) {
                var p = this.players[index];
                if (p.index != playerIndex && p.uid > 0 && p.eatState == Enum.GrabState.GRABING) {
                    this.forcedoPass(p.index, gangMj);
                    break;
                }
            }

            this.resetGrabState();
            var beGanged = 0;
            switch (gangType) {
                case Enum.GangType.AN_GANG:
                    beGanged = playerIndex;
                    break;
                case Enum.GangType.ZHI_GANG:
                    beGanged = this.prePlayer;
                    break;
                case Enum.GangType.MIAN_XIA_GANG:
                    beGanged = player.pengdPlayer[gangMj];
                    break;
            }

            var info = {
                type: Enum.GrabType.GANG,
                playerIndex: playerIndex,
                nextPlayer: playerIndex,
                card: gangMj,
                gangType: gangType,
                beGanged: beGanged
            };
            for (var index in this.players) {
                var p = this.players[index];
                p.sendMsg(Opcodes.S2C_PLAYER_GRABA_CARD_INFO, info);
            }
            this.billGang(playerIndex, gangType, gangMj);
            this.doDraw(playerIndex);
        } else if (this.roundOver()) {
            this.state = Enum.GameState.PLAY;
            this.doDraw(playerIndex);
            var info = {
                type: Enum.GrabType.PASS,
                playerIndex: playerIndex,
                nextPlayer: playerIndex,
                card: gangMj,
            }
            for (var index in this.players) {
                var p = this.players[index];
                p.sendMsg(Opcodes.S2C_PLAYER_GRABA_CARD_INFO, info);
            }
        }
        DEBUG(util.format("玩家[%d]杠牌[%d]", player.uid, gangMj));
    },

    /**
     * 重置抢牌状态
     */
    resetGrabState: function () {
        for (var index in this.players) {
            var p = this.players[index];
            p.resetGrabState();
        }

    },

    /**
     * 抢牌是否有人正在胡
     * @param index
     * @return {boolean}
     */
    huIng: function (indexs) {
        for (var index in this.players) {
            var player = this.players[index];
            if (player.index != indexs && player.huState == Enum.GrabState.GRABING) {
                return true;
            }
        }
        return false;
    },

    /**
     * 抢牌是否有人胡过
     * @param index
     * @return {boolean}
     */
    hued: function (indexs) {
        for (var player in this.players) {
            if (player.index != indexs && player.huState == Enum.GrabState.GRABED) {
                return true;
            }
        }
        return false;

    },

    /**
     * 抢牌是否结束
     * @return {boolean}
     */
    grabOver: function () {
        for (var index in this.players) {
            var p = this.players[index];
            if (p.pengState == Enum.GrabState.GRABING || p.gangState == Enum.GrabState.GRABING || p.huState == Enum.GrabState.GRABING || p.eatState == Enum.GrabState.GRABING) {
                return false;
            }
        }
        return true;
    },
    /**
     * 玩家请求定缺
     * @param uid
     */
    onPlayerReqMissingCard: function (uid, miss) {
        var playerIndex = this.getPlayerIndex(uid);
        this.players[playerIndex].handCards.miss = miss;
        if (miss < 0 || miss > 3) {
            DEBUG(util.format("玩家[%d],定缺参数错误 [%miss]", uid, miss));
            return;
        }
        this.broadcastMsg(Opcodes.S2C_PLAYER_MISSING, {
            playerIndex: playerIndex,
            miss: miss,
        });
    },

    /**
     * 玩家请求准备
     * @param uid
     */
    onPlayerReqReady: function (uid, ready) {
        var playerIndex = this.getPlayerIndex(uid);
        var player = this.players[playerIndex];
        if (this.started) {
            DEBUG(util.format("游戏已经开始,玩家[%d],已经准备,请勿重复准备", uid));
            return;
        }
        if (ready) {
            if (player.getReady()) {
                DEBUG(util.format("玩家[%d],已经准备,请勿重复准备", uid));
                return;
            }
            player.setReady(true);

        } else {
            if (!player.getReady()) {
                DEBUG(util.format("玩家[%d],未准备,不需要准备", uid));
                return;
            }
            player.setReady(false);
        }
        this.broadcastMsg(Opcodes.S2C_PLAYER_READY, {
            playerIndex: playerIndex,
            ready: ready,
        });

        if (this.readyOver()) {
            this.onRoomStartNewRound();
            // var tempCard = this.publicCards.genTemp1(); //测试发牌
            this.publicCards.gen(); //正常发牌
            this.curRound += 1;
            this.enumPlayers(function (ePlayerIndex, ePlayer) {
                if (ePlayerIndex == this.dealer) {
                    ePlayer.setHandCards(this.publicCards.getCards(14));
                    // var card = tempCard[ePlayerIndex - 1];
                    //庄家多一张牌
                    // card.push(this.publicCards.getCard());
                    // ePlayer.setHandCards(card);
                    ePlayer.handCards.calcEatMjs();
                    //发牌时顺便重置玩家数据
                } else {
                    ePlayer.setHandCards(this.publicCards.getCards(13));
                    // ePlayer.setHandCards(tempCard[ePlayerIndex - 1]);
                    ePlayer.handCards.calcEatMjs();
                }
            }.bind(this));
            this.state = Enum.GameState.PLAY;
        }
    },

    /**
     * 准备完成
     * @return {boolean}
     */
    readyOver: function () {
        for (var index in this.players) {
            if (!this.players[index].getReady()) {
                return false;
            }
        }
        return true;
    },

    /**
     * 玩家请求买分
     * @param uid
     */
    onPlayerReqBuyPoint: function (uid, point) {
        var playerIndex = this.getPlayerIndex(uid);
        var player = this.players[playerIndex];
        if (!Enum.validContains(this.playMeThod, Enum.PlayMeThod.CAN_BUY)) {
            DEBUG(util.format("玩家[%d],不能买分,该房间不支持买分", uid));
            return;
        }

        if (player.buyNum != 0) {
            DEBUG(util.format("玩家[%d],已买分,请勿重复买分", uid));
            return;
        }
        player.buyNum = point;
        this.broadcastMsg(Opcodes.S2C_PLAYER_BUY_POINT, {
            playerIndex: playerIndex,
            point: point,
        });
    },

    /**
     * 玩家请求退出房间
     * @param uid
     */
    onPlayerReqExitRoom: function (uid) {
        var playerIndex = this.getPlayerIndex(uid);
        if (this.curRound > 1) {
            DEBUG(util.format("玩家[%d],已经开始游戏,不能退出,只能申请解散房间", uid));
            return;
        }
        var player = this.players[playerIndex];
        this.broadcastMsg(Opcodes.S2C_PLAYER_EXIT_ROOM, {
            playerIndex: playerIndex,
        });
        player.exit();
        //标记玩家退出房间

        GameMgr.sendMgrMsg({
            code: ProtoID.SMSG_REQ_DESTROY_ROOM,
            args: {
                uids: [uid],
            },
        });
        this.joinedPlayers -= 1;
        this.onlinePlayers -= 1;

        //房主退出直接解散
        if (playerIndex == 1) {
            this.destroyRoomImmd();
        }
    },

    /**
     * 玩家请求胡牌
     * @param uid
     */
    onPlayerReqHuCard: function (uid) {
        var playerIndex = this.getPlayerIndex(uid);
        var player = this.players[playerIndex];
        if (this.state != Enum.GameState.GRAB) {
            DEBUG(util.format("玩家[%d]正在处于抢牌阶段处于[%s]阶段，不能胡牌"), uid, this.state);
            return;
        }
        var cards = player.handCards;
        var huMj = this.nextPlayer == playerIndex && cards.getTotalCount() % 3 == 2 ? cards.getLastDrawMj() : this.preMianXiaGangMj == 0 ? this.prePlayMj : this.preMianXiaGangMj;
        if (this.nextPlayer == playerIndex && cards.getTotalCount() % 3 == 2) {//自摸
            huMj = cards.getLastDrawMj();
            if (!cards.huAble(huMj, true)) {
                DEBUG(util.format("玩家[%d]未能满足胡的条件，不能胡牌[%d]", uid, huMj));
                return;
            }
        } else if (this.preMianXiaGangMj != 0) { //抢杠胡
            huMj = this.preMianXiaGangMj;
            if (!cards.huAble(huMj, true)) { //todo 考虑倍数
                DEBUG(util.format("玩家[%d]未能满足胡的条件，不能胡牌[%d]", uid, huMj));
                return;
            }
        } else {//点炮
            huMj = this.prePlayMj;
            if (!cards.huAble(huMj, true)) {
                DEBUG(util.format("玩家[%d]未能满足胡的条件，不能胡牌[%d]", uid, huMj));
                return;
            }
        }
        this.doHu(playerIndex, huMj);

    },

    /**
     * 胡牌
     * @param playerIndex
     * @param card
     */
    doHu: function (playerIndex, card) {
        var player = this.players[playerIndex];
        var cards = player.handCards;
        var isZm = this.nextPlayer == playerIndex && cards.getTotalCount() % 3 == 2;
        var huType = this.huType(playerIndex, card, isZm);//胡的类型
        this.nextPlayer = this.nextPlayerIndex(playerIndex);
        player.over = true;
        player.huState = Enum.GrabState.GRABED;
        player.pengState = null;
        player.gangState = null;
        player.eatState = null;
        var info = {
            type: Enum.GrabType.HU,
            playerIndex: playerIndex,
            nextPlayer: this.nextPlayer,
            card: card,
        };
        for (var index in this.players) {
            var p = this.players[index];
            p.sendMsg(Opcodes.S2C_PLAYER_GRABA_CARD_INFO, info);
        }
        if (!isZm) {
            cards.addMjs(card);
        }
        cards.humj = card;
        //指定下一局的庄家
        this.nextDealer = playerIndex;
        var huPaiType = Func.huPai(cards);
        var detail = this.calcHuData(playerIndex, cards, huType, huPaiType, isZm);
        var totalMultiple = detail['totalMultiple'];
        this.billHu(playerIndex, totalMultiple, isZm);
        for (var index in this.players) {
            var p = this.players[index];
            p.sendMsg(Opcodes.S2C_PLAYER_HU_CARD_INFO, detail);
        }
        DEBUG(util.format("玩家[%d]胡牌[%d]", player.uid, card));
        if (isZm || this.canHuNum()) {
            this.doRoundOver();
        }
    },


    /**
     * 胡牌明细
     * @param cards 牌
     * @param huType 胡的类型(天胡,地胡,抢杠胡,杠上花等)
     * @param huPaiType 牌的类型(平胡,七对, 大对)
     */

    calcHuData: function (playerIndex, cards, huType, huPaiType, isZm) {
        var totalMultiple = 1;
        var base = 1;
        var detail = [];
        if (this.publicCards.isEmpty()) {
            base = 1.5;
        }
        var qys = cards.isQingYiSe();
        var longCount = cards.getLongCount();
        var fys = cards.isFengYiSe();
        var luanJiang = cards.isLuanJiang();
        var jiangDui = Enum.validJiang(cards.jiangNum, cards.jiangType);
        var daPeng = cards.isDaPeng();
        var ytl = cards.isYiTiaoLong();

        //牌的分数
        if (fys && huPaiType == Enum.PaiType.LONG_QI_DUI && longCount == 3) {
            //6、风一色三龙七对
            totalMultiple = 64 * base;
        } else if ((qys && huPaiType == Enum.PaiType.LONG_QI_DUI &&
            longCount == 3) || (fys && huPaiType == Enum.PaiType.LONG_QI_DUI && longCount == 2)
        ) {
            //5、清一色三龙七对，风一色双龙七对
            totalMultiple = 32 * base;
        } else if ((luanJiang && huPaiType == Enum.PaiType.LONG_QI_DUI && longCount == 1) ||
            (longCount == 2 && huPaiType == Enum.PaiType.LONG_QI_DUI) ||
            (qys && longCount == 2 && huPaiType == Enum.PaiType.LONG_QI_DUI) ||
            (qys && daPeng && jiangDui) ||
            (qys && ytl && jiangDui) ||
            (fys && daPeng) ||
            (fys && huPaiType == Enum.PaiType.QI_DUI)) {
            //4、乱将龙七小对、双龙七小对、清一色双龙七小对、清一色大碰胡（258做将）、清一色一条龙（258做将）、风一色大碰胡、风一色七小对
            totalMultiple = 16 * base;
        } else if ((luanJiang && huPaiType == Enum.PaiType.QI_DUI) ||
            (huPaiType == Enum.PaiType.LONG_QI_DUI && longCount == 1) ||
            (qys && huPaiType == Enum.PaiType.QI_DUI) ||
            (qys && jiangDui) ||
            (qys && ytl && !jiangDui) ||
            (fys) ||
            (huPaiType == Enum.PaiType.LAN_HU)) {
            //3、乱将七对、龙七对（有四张一样的牌）、清一色七小对、清一色（258做将）、清一色一条龙（非258做将）、风一色、烂胡
            totalMultiple = 8 * base;
        } else if ((luanJiang) ||
            (huPaiType == Enum.PaiType.QI_DUI) ||
            (huPaiType == Enum.PaiType.DA_DUI)||
            (ytl) ||
            (qys && !jiangDui) ||
            (daPeng)) {
            //2、乱将、七小对(可以不包含258)、一条龙（1-9，一条龙必须在手上，可以抓放炮）、清一色（非258做将）、大碰胡
            totalMultiple = 4 * base;
        } else {
            //1 小胡
            totalMultiple = base > 1 ? 2 : 1;
        }

        return {
            huPlayer: playerIndex,
            huType: huType,
            huPaiType: huPaiType,
            totalMultiple: totalMultiple,
            detail: detail,
            isQgh: huType == Enum.HuType.QIANG_GANG_HU,
            huedPlayer: isZm ? -1 : this.prePlayer,
            isZm: isZm,
        };
    },

    //结算胡

    billHu: function (winPlayerIndex, totalMultiple, isZm) {
        var maNum = 0;
        var maCards = [];
        if (this.maNum == 1) {
            //飞鸟
            var card = this.publicCards.getCard();
            if (card < 28) {
                maNum = (card - 1) % 9 + 1;
            } else if (card == 28) {
                maNum = 10;
            } else if (card > 28 && card <= 30) {
                maNum = card - 27
            } else {
                maNum = card - 30;
            }
            maCards.push(card);
        } else if (this.maNum > 1) {
            for (var num = 0; num < this.maNum; num++) {
                var card = this.publicCards.getCard();
                maCards.push(card);
                if (card < 28 && ((card - 1) % 9 == 0 || (card - 1) % 9 == 4 || (card - 1) % 9 == 8)) {
                    maNum++;
                } else if (card == 28 || card == 31) {
                    maNum++;
                }
            }
        }
        this.maInfo[winPlayerIndex] = maCards;
        var winPlayer = this.players[winPlayerIndex];
        var isContractor = false;
        if (Enum.validContains(this.playMeThod, Enum.PlayMeThod.CONTRACTOR) && winPlayer.handCards.eatMjsCount() > 2) {
            //有人承包
            isContractor = true;
        }

        if (isZm) {//自摸
            winPlayer.isZm = true;
            winPlayer.ziMoNum++;
            if (isContractor) {
                var preIndex = this.prePlayerIndex(winPlayerIndex);
                var preIndexPlayer = this.players[preIndex];
                preIndexPlayer.fanNum = -totalMultiple;
                preIndexPlayer.buyScore = -(winPlayer.buyNum + preIndexPlayer.buyNum) * 3;
                preIndexPlayer.maNum = -maNum * 3;

                winPlayer.fanNum += totalMultiple;
                winPlayer.buyScore += preIndexPlayer.buyScore;
                winPlayer.maNum += preIndexPlayer.maNum;

                winPlayer.huedPlayer.push(preIndexPlayer.index);

                return;

            }

            for (var index in this.players) {
                var p = this.players[index];
                if (p.index != winPlayerIndex && !p.over) {
                    p.fanNum += -totalMultiple;
                    p.buyScore += -(winPlayer.buyNum + p.buyNum);
                    p.maNum += -maNum;

                    winPlayer.fanNum += totalMultiple;
                    winPlayer.buyScore += (winPlayer.buyNum + p.buyNum);
                    winPlayer.maNum += maNum;
                    winPlayer.huedPlayer.push(p.index);
                }
            }

        } else {//放炮
            winPlayer.huPaiNum++;
            var p = this.players[this.prePlayer];
            p.dianPaoNum++;
            if (isContractor) {
                var preIndex = this.prePlayerIndex(winPlayerIndex);
                p = this.players[preIndex];
            }
            p.fanNum += -totalMultiple;
            p.buyScore += -(winPlayer.buyNum + p.buyNum);
            p.maNum += -maNum;

            winPlayer.fanNum += totalMultiple;
            winPlayer.buyScore += (winPlayer.buyNum + p.buyNum);
            winPlayer.maNum += maNum;
            winPlayer.huedPlayer.push(p.index);
        }
    },

    //结算杠
    billGang: function (winPlayerIndex, gangType, gangMj) {
        var player = this.players[winPlayerIndex];
        player.gangNum++;
        var losePlayer = [];
        var muti = 1;
        switch (gangType) {
            case Enum.GangType.AN_GANG:
                for (var index in this.players) {
                    var p = this.players[index];
                    if (p.index != player.index && p.uid > 0 && !p.over) {
                        losePlayer.push(p.index);
                    }
                }
                break;
            case Enum.GangType.MIAN_XIA_GANG:
                if (player.pengdPlayer.hasOwnProperty(gangMj)) {
                    losePlayer.push(player.pengdPlayer[gangMj]);
                }
                break;
            case Enum.GangType.ZHI_GANG:
                losePlayer.push(this.prePlayer);
                break;
        }

        for (var index in losePlayer) {
            this.players[losePlayer[index]].gangScore -= muti;
            player.gangScore += muti;
        }
    },


    /**
     * 可胡人数
     * @return {boolean}
     */
    canHuNum: function () {
        var num = 0;

        for (var index in this.players) {
            if (this.players[index].huState == Enum.GrabState.GRABING) {
                num++;
            }
        }
        return num == 0;

    },

    /**
     * 是否有人胡牌
     * @return {boolean}
     */

    hasHued: function () {
        var hu = false;
        for (var index in this.players) {
            if (this.players[index].over) {
                hu = true;
            }
        }
        return hu;
    },


    /**
     * 强制过牌
     * @param playerIndex
     * @param card
     */
    forcedoPass : function (playerIndex, card) {
        var player = this.players[playerIndex];
        var cards = player.handCards;
        player.resetGrabState();
        var info = {
            type: Enum.GrabType.PASS,
            playerIndex: playerIndex,
            nextPlayer: this.nextPlayer,
            card: card,
        };
        for (var index in this.players) {
            var p = this.players[index];
            p.sendMsg(Opcodes.S2C_PLAYER_GRABA_CARD_INFO, info);
        }
        DEBUG(util.format("玩家[%d]被强制过牌[%d]", player.uid, card));
    },


    /**
     * 过牌 ->不碰杠胡
     * @param playerIndex
     * @param card
     */
    doPass: function (playerIndex, card) {
        var player = this.players[playerIndex];
        var cards = player.handCards;
        player.resetGrabState();
        var info = {
            type: Enum.GrabType.PASS,
            playerIndex: playerIndex,
            nextPlayer: this.nextPlayer,
            card: card,
        };
        for (var index in this.players) {
            var p = this.players[index];
            p.sendMsg(Opcodes.S2C_PLAYER_GRABA_CARD_INFO, info);
        }
        DEBUG(util.format("玩家[%d]过牌[%d]", player.uid, card));

        // if (cards.getTotalCount() % 3 != 2 && cards.huAble(card)) { //放炮
        //     //todo 第一个玩家放炮，该玩家不胡，第二个玩家同样打这张牌是否可以胡?
        // }
        /**
         * 多人胡牌处理
         */
        if (this.hasHued()) {
            if (this.canHuNum()) {
                this.doRoundOver();
            }
            return;
        }

        /**
         * 抢牌结束后的操作
         * 该碰的碰
         * 该杠的杠
         */
        if (this.grabOver()) {
            if (!this.hued(null)) {
                for (var index in this.players) {
                    var p = this.players[index];
                    if (p.pengState == Enum.GrabState.GRABED) {
                        this.doPeng(p.index, this.prePlayMj);
                        break;
                    } else if (p.gangState == Enum.GrabState.GRABED) {
                        this.doGang(p.index, this.prePlayMj, p.handCards.gangType(this.prePlayMj));
                        break;
                    }
                    else if (p.eatState == Enum.GrabState.GRABED) {
                        this.doEat(p.index, this.prePlayMj, this.preEatType);
                        break;
                    }
                }
            }
            this.state = Enum.GameState.PLAY;
            this.resetGrabState();
            var nextP = this.players[this.nextPlayer];
            if (nextP.handCards.getTotalCount() % 3 == 2) {
                //todo 满足条件 要定时出牌..
            }
            if (!this.publicCards.isEmpty()) {
                if (nextP.handCards.getTotalCount() % 3 != 2) {
                    this.doDraw(this.nextPlayer);
                }
            } else {
                this.doRoundOver();
            }
        }
    },

    /**
     * 回合是否结束
     * @return {boolean|*}
     */
    roundOver: function () {
        if (this.publicCards.isEmpty()) {
            this.nextDealer = this.prePlayer;
            //todo 流局杠分都不计分
            for (var playerIndex in this.players) {
                this.players[playerIndex].gangScore = 0;
            }
            return true;
        }
        return false;
    },


    //本轮结束
    doRoundOver: function () {
        this.onSettement();

    },

    /**
     * 胡牌类型
     * @return {number}
     */

    huType: function (playerIndex, card, isZm) {
        var player = this.players[playerIndex];
        var cards = player.handCards;
        var dealer = this.dealer;
        var gangPlayer = this.gangedPlayer();
        var preGangedPlayer = this.preGangedPlayer;
        var type = null;
        if (this.publicCards.getIndex == 53 && playerIndex == dealer && cards.getTotalCount() == 14 && this.nextPlayer == dealer) {
            type = Enum.HuType.TIAN_HU;
        } else if ((this.publicCards.getIndex > 53 && this.publicCards.getIndex < 57) && cards.getTotalCount() == 14 && playerIndex != dealer) {
            type = Enum.HuType.DI_HU;
        } else if (gangPlayer != null && gangPlayer != playerIndex && this.players[gangPlayer].handCards.gangType(card) == Enum.GangType.MIAN_XIA_GANG) {
            type = Enum.HuType.QIANG_GANG_HU;
        } else if (preGangedPlayer != 0 && preGangedPlayer == playerIndex && isZm) {
            type = Enum.HuType.GANG_SHANG_HUA;
        } else if (preGangedPlayer != 0 && preGangedPlayer != playerIndex && !isZm) {
            type = Enum.HuType.GANG_SHANG_PAO;
        } else {
            type = Enum.HuType.PING_HU;
        }
        return type;
    },

    /**
     * 抢牌杠过的seat,但是还未成功
     * @return {*}
     */
    gangedPlayer: function () {
        for (var index in this.players) {
            var p = this.players[index];
            if (p.gangState == Enum.GrabState.GRABED) {
                return p;
            }
        }
        return null;
    },

    //玩家请求过
    onPlayerReqPass: function (uid) {
        var playerIndex = this.getPlayerIndex(uid);
        var player = this.players[playerIndex];
        if (this.state != Enum.GameState.GRAB) {
            DEBUG(util.format("玩家[%d]处于[%s]阶段不能过", uid, this.state));
            return;
        }
        var cards = player.handCards;
        var passMj = this.nextPlayer == playerIndex && cards.getTotalCount() % 3 == 2 ? cards.getLastDrawMj() : this.preMianXiaGangMj == 0 ? this.prePlayMj : this.preMianXiaGangMj;
        // var passMj = this.nextPlayer == playerIndex && cards.getTotalCount() % 3 == 2 ? cards.getLastDrawMj() : this.prePlayMj;
        this.doPass(playerIndex, passMj);
    },

    //请求开始游戏
    onPlayerReqContinue: function (uid) {
        var playerIndex = this.getPlayerIndex(uid);
        if (playerIndex != 0) {
            var player = this.players[playerIndex];
            if (!player.getReady()) {
                player.setReady(true);

                this.broadcastMsg(Opcodes.S2C_SET_PLAYER_READY, {
                    playerIndex: playerIndex,
                });

                this.readyPlayers += 1;
                if (this.readyPlayers == this.joinedPlayers) {
                    // 所有人就绪
                    // this.onRoomStartNewRound();
                }
            }
        }
    },

    /**
     * 房主解散房间
     * @param uid
     */
    onPlayerDestroyRoom: function (uid) {
        var playerIndex = this.getPlayerIndex(uid);
        if (playerIndex != 1) {
            DEBUG(util.format("Only roomer can  %d  destroy room", uid));
            return;
        }
        this.destroyRoomImmd();
    },

    /**
     * 发起解散房间请求
     * @param uid
     */
    onPlayerReqDestroyRoom: function (uid) {
        DEBUG(util.format("Player %d req destroy room", uid));
        var playerIndex = this.getPlayerIndex(uid);
        if (!this.isReqDestroy) {
            // 设置销毁人数
            this.destroyPlayers = this.onlinePlayers;

            if (this.onlinePlayers == 1) {
                // 只有房主一人
                DEBUG(util.format("Only Master %d, destroy immd", uid));
                this.destroyRoomImmd();
                return;
            }

            this.isReqDestroy = true;
            this.destroyTime = Enum.ROOM_DESTROY_TIME + Date.getStamp();
            this.destroyTimer = setTimeout(function () {
                this.destroyRoomImmd();
            }.bind(this), Enum.ROOM_DESTROY_TIME * 1000);

            // 该玩家同意解散
            this.respDestroyOKs[playerIndex] = 1;

            // 广播通知
            this.broadcastMsg(Opcodes.S2C_SET_PLAYER_REQ_DROOM, {
                playerIndex: playerIndex,
                destroyTime: this.destroyTime,
            });
        }
    },

    /**
     * 其他玩家响应解散房间请求
     * @param uid
     * @param ok
     */
    onPlayerRespDestroyRoom: function (uid, ok) {
        var playerIndex = this.getPlayerIndex(uid);
        if (ok) {
            if (this.respDestroyOKs.hasOwnProperty(playerIndex)) {
                return;
            }
            this.respDestroyOKs[playerIndex] = 1;
            var okNum = Object.keys(this.respDestroyOKs).length;
            if ((okNum >= this.destroyPlayers) || (okNum >= this.onlinePlayers)) {
                // 立即解散房间
                clearTimeout(this.destroyTimer);
                this.destroyTimer = null;
                this.isReqDestroy = false;
                this.destroyTime = 0;
                this.respDestroyOKs = {};
                //第一局结束,第二局未开始,也给总结算
                if (this.curRound > 1 || (!this.started && this.curRound == 1)) {
                    this.onGameOver();
                } else {
                    this.destroyRoomImmd();
                }
                return;
            }
        } else {
            // 该玩家不同意
            if (this.destroyTimer) {
                clearTimeout(this.destroyTimer);
                this.destroyTimer = null;
                this.isReqDestroy = false;
                this.destroyTime = 0;
                this.respDestroyOKs = {};
            }
        }

        // 广播消息
        this.broadcastMsg(Opcodes.S2C_SET_PLAYER_RESP_DROOM, {
            playerIndex: playerIndex,
            ok: ok,
        });
    },

    // 广播用户消息
    onPlayerReqBroadcastMessage: function (uid, message) {
        var playerIndex = this.getPlayerIndex(uid);
        this.broadcastMsg(Opcodes.S2C_BROADCAST_MESSAGE, {
            playerIndex: playerIndex,
            message: message,
        }, [playerIndex]);
    },
};

exports.Room = Room;
