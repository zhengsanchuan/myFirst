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

function PublicCards() {
    this.num = 0;    // 剩余牌数量
    this.cards = [];   // 牌
    this.getIndex = 0;    // 取牌位置
}

PublicCards.prototype = {
    // 生成牌组
    gen: function () {
        //this.genTemp();
        //return;
        // 初始化数据
        this.num = 108;
        this.cards = [];
        this.getIndex = 0;
        // 生成108张牌
        var originCards = [];
        for (var iVal = 1; iVal <= 27; ++iVal) {
            originCards.push(iVal);
            originCards.push(iVal);
            originCards.push(iVal);
            originCards.push(iVal);
        }

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
        for (var iVal = 1; iVal <= 27; ++iVal) {
            originCards.push(iVal);
            originCards.push(iVal);
            originCards.push(iVal);
            originCards.push(iVal);
        }

        var remainCard = [];

        // 玩家起手牌
        var player1Cards = [1, 1, 1, 2, 3, 4, 5, 6, 7, 9, 9, 9, 9];
        var player2Cards = [10, 10, 10, 11, 11, 11, 12, 12, 12, 13, 13, 14, 14];
        var player3Cards = [19, 19, 19, 20, 20, 21, 21, 22, 22, 23, 23, 24, 24];
        var player4Cards = [2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8];

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
        for (var iVal = 1; iVal <= 27; ++iVal) {
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
    this.id = id;        // 房间号
    this.creator = 0;    //房间创建者
    //玩法
    this.round = 0;        // 总轮数
    this.endPoint = 0;        // 底分
    this.maxLimit = 0;    // 番数上限
    this.playMeThod1 = 0;    // 玩法1 (自摸加底, 自摸加番)
    this.playMeThod2 = 0;    // 玩法2  (点杠花(自摸), 点杠花(点炮))
    this.playMeThod3 = [];    // 玩法3  妖九将对, 门清中张, 天地胡, 金钩钩 , 定缺 , 换三张

    //房间数据
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
    this.prePlayer = 0;        //上一个出牌玩家
    this.prePlayMj = 0;        //上一次玩家出的牌
    this.nextPlayer = 0;        //下一个出牌玩家
    this.state = null;          //当前的状态
    this.preGangedPlayer = 0;     //上一次杠成功玩家
    this.preGangedType = null;     //上一次杠成功的杠类型
    this.preMianXiaGangMj = 0; //上一次面下杠的麻将(但是未杠成功的牌，主要被抢杠胡使用)
    this.preMianXiaPlayer = 0;
    this.started = false; //是否已经开始
    this.exchangeMjs = {};

    //回放数据
    this.roomPlayInfoPage = {};
    this.playBackPage   = [];
    this.playBackDates   = [];
}

Room.prototype = {
    // 初始化
    init: function (creator, cArgs) {
        var round = +cArgs.round;
        var endPoint = 1;
        var maxLimit = +cArgs.maxLimit;
        var playMeThod1 = +cArgs.playMeThod1;
        var playMeThod2 = +cArgs.playMeThod2;
        var playMeThod3 = cArgs.playMeThod3;
        // 参数检查
        if (isNaN(round) || isNaN(endPoint) || isNaN(maxLimit) || isNaN(playMeThod2)) {
            DEBUG(util.format("创建房间参数错误,请检查参数 roud[%d], endPoint[%d], maxLimit[%d], playMeThod2[%d]", round, endPoint, maxLimit, playMeThod2));
            return false;
        }
        if (!(Enum.validRoomRound(round)) || !(Enum.validEndPoint(endPoint)) || !(Enum.validMaxLimit(maxLimit))) {
            DEBUG(util.format("创建房间参数错误,请检查参数,未满足设置需求 roud[%d], endPoint[%d], maxLimit[%d], playMeThod2[%d]", round, endPoint, maxLimit, playMeThod2));
            return false;
        }
        this.creator = creator;
        // 初始化房间全局数据
        this.round = round;
        this.endPoint = endPoint;
        this.maxLimit = maxLimit;
        this.playMeThod1 = playMeThod1;
        this.playMeThod2 = playMeThod2;
        this.playMeThod3 = playMeThod3;


        // 初始化房间玩家数据
        for (var iPlayer = 1; iPlayer <= 4; ++iPlayer) {
            this.players[iPlayer] = new Player(this, iPlayer);
        }

        this.publicCards = new PublicCards();
        // 随机庄家
        // this.dealer = Math.floor(Math.random() * Enum.ROOM_PLAYER_NUM) + 1;
        this.dealer = 1;
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

        //todo 广播消息某些消息需要屏蔽
        // if(Opcodes.SMSG_SET_PLAYER_TAKE_CARD != code) {
        //     this.playBackPage.push({
        //         code: code, args: args
        //     });
        // }
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
        playerIndex = this.findPlayerIndex();
        // playerIndex = this.joinedPlayers + 1;

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

        // 准备返回给玩家的初始化数据
        var initArgs = {
            round: this.round,
            endPoint: this.endPoint,
            maxLimit: this.maxLimit,
            playMeThod1: this.playMeThod1,
            playMeThod2: this.playMeThod2,
            playMeThod3: this.playMeThod3,
            dealer: this.dealer,
            players: {},
            playerIndex: playerIndex
        };
        this.enumPlayers(function (ePlayerIdx, ePlayer) {
            if (ePlayer.isInited()) {
                initArgs.players[ePlayerIdx] = ePlayer.getInfo();

                ePlayer.owner.roomPlayInfoPage[ePlayerIdx] = {
                    info: ePlayer.info,
                    score: ePlayer.score,
                    index: ePlayerIdx,
                };
            }
        });

        // 给新玩家推送消息
        player.sendMsg(ProtoID.SMSG_PLAYER_JOIN_ROOM, initArgs);
        return true;
    },

    onPlayerReconnect: function (playerIndex, wsConn) {
        var player = this.players[playerIndex];

        // 发送房间数据
        var recArgs = {
            round: this.round,       // 总轮数
            endPoint: this.endPoint,
            maxLimit: this.maxLimit,
            playMeThod1: this.playMeThod1,
            playMeThod2: this.playMeThod2,
            playMeThod3: this.playMeThod3,
            players: {},               // 玩家数据
            curRound: this.curRound,      // 当前轮数
            dealer: this.dealer,        // 当前庄家
            curPlay: this.curPlay,       // 当前出牌玩家
            playerIndex: playerIndex,      // 玩家位置
            started: this.started ? 1 : 0,
            reMain: this.publicCards.getRemain(), // 剩余牌数
            state: this.state, // 当前阶段
            destroy: this.respDestroyOKs //{k,v} k : playerIndex  v : 1  //是否处于解散房间状态(玩家在解散房间情况下掉线,给当前状态)
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

    // 输出房间信息
    dump: function () {
        DEBUG(util.format("Room %d created { round: %d, masterType: %d, forceHupai: %s }",
            this.id, this.round, this.masterType, this.forceHupai ? "true" : "false"));
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
        // 初始化游戏数据
        this.publicCards.gen(); //->以后会恢复正常发牌
        // var tempCard = this.publicCards.genTemp1(); //测试发牌
        this.curPlay = this.dealer; // 设置出牌玩家为庄家
        // 清除胡牌信息
        this.prePlayer = 0;
        this.prePlayMj = 0;
        this.nextPlayer = 0;
        this.state = null;
        this.preMianXiaGangMj = 0;
        this.preMianXiaPlayer = 0;
        this.preGangedPlayer = 0;
        this.preGangedType = null;
        if (this.curRound >= 1) {
            this.dealer = this.getNextDealer();
        }
        this.setDealer();
        this.curRound++;
        // 广播房间状态
        this.broadcastMsg(ProtoID.SMSG_SET_ROOM_INFO, {
            curRound: this.curRound,
            round: this.round,
            dealer: this.dealer,
        });
        this.nextPlayer = this.dealer;
        this.playBackPage.push({
            code: ProtoID.SMSG_SET_ROOM_INFO,
            args: {
                curRound: this.curRound,
                round: this.round,
                dealer: this.dealer,
                endPoint: this.endPoint,
                maxLimit: this.maxLimit,
                playMeThod1: this.playMeThod1,
                playMeThod2: this.playMeThod2,
                playMeThod3: this.playMeThod3,
            }
        });
        this.enumPlayers(function (ePlayerIndex, ePlayer) {
            if (ePlayerIndex == this.dealer) {
                ePlayer.setHandCards(this.publicCards.getCards(14));
                ePlayer.huSqu = 0;
            } else {
                ePlayer.setHandCards(this.publicCards.getCards(13));
                ePlayer.huSqu = 0;
            }
            this.playBackPage.push({
                code: Opcodes.S2C_SET_PLAYER_CARDS,
                args: {
                    cards: ePlayer.handCards.getSync(),
                    playerIndex: ePlayerIndex,
                }
            });
        }.bind(this));
        this.started = true;
        if (Enum.validContains(this.playMeThod3, Enum.PlayMethod.HUAN_SAN_ZHANG)) {
            this.state = Enum.GameState.EXCHANGE;
        } else {
            this.state = Enum.GameState.MISSING;
        }

        // this.sendPublicCardNum();
        //todo
        // this.onSetPlayersHandCards();
    },

    // 结算
    onSettement: function () {
        DEBUG("Room::onSettement");
        // 发送结算信息
        var settementInfo = {
            players: {},
        };
        var playBattle = {};
        this.enumPlayers(function (ePlayerIndex, ePlayer) {
            settementInfo.players[ePlayerIndex]
                = ePlayer.getSettementInfo();
            ePlayer.setReady(false);

            //回放数据
            playBattle[ePlayerIndex] = {
                name: ePlayer.info.name,
                score: ePlayer.roundScore,
            };
            ePlayer.owner.roomPlayInfoPage[ePlayerIndex].score = ePlayer.score;

        }.bind(this));


        //replayeData 回放数据
        this.playBackDates.push({
            curRound: this.curRound,
            roomId: this.id,
            time: Date.getStamp(),
            playBattle: playBattle,
            operation: this.playBackPage,
            roomInfo: this.roomPlayInfoPage,
        });

        this.playBackPage = [];


        this.readyPlayers = 0;
        this.exchangeMjs = {};
        this.state = null;

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

    /**
     * 下一个庄家
     * @return {string}
     */
    getNextDealer: function () {
        for (var playerIndex in this.players) {
            if (this.players[playerIndex].uid > 0 && this.players[playerIndex].huSqu == 1) {
                return playerIndex;
            }
        }
        return this.nextDealer;
    },


    //游戏结束
    onGameOver: function () {
        DEBUG("==== GAME OVER");

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
        var playerReports = {};
        var uids = [];
        playerReports["roomID"] = this.id;
        playerReports["time"] = Date.getStamp();
        var reports = [];
        this.enumPlayers(function (ePlayerIndex, ePlayer) {
            uids.push(ePlayer.uid);
            reports.push({
                uid: ePlayer.uid,
                name: ePlayer.info.name,
                score: ePlayer.score,
            });
        });
        playerReports["player"] = reports;
        GameMgr.sendMgrMsg({
            code: ProtoID.SMSG_REQ_SAVE_REPORTS,
            args: {
                uids: uids,
                players: {
                    reportsDate: playerReports,
                    ///////////////////// save playback date
                    playBackDate: this.playBackDates,
                },
            },
        });

        // 房间结束
        this.broadcastMsg(Opcodes.S2C_SET_ROOM_FINISHED, {});

        var Args = {};

        // 销毁房间
        for (var playerIndex in this.players) {
            var player = this.players[playerIndex];
            if (player.uid == this.creator) {
                Args[player.uid] = player.useRoomCard + Enum.getCardsNeed(this.round);
            } else {
                Args[player.uid] = player.useRoomCard;
            }
            player.destroy();
        }
        this.onRoomDestroy();
        GameMgr.getSubGame().destroyRoom(this);
        GameMgr.decUsage();
        GameMgr.decPlayerCards(Args);
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

        this.roomPlayInfoPage = {};
        this.playBackPage = [];
        this.playBackDates = [];

        GameMgr.sendMgrMsg({
            code: ProtoID.SMSG_REQ_DESTROY_ROOM,
            args: {
                uids: uids,
            },
        });
    },

    shutdown: function () {
        if (this.curRound > 1 || this.isHupai) {
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
            DEBUG(util.format("Player %d play card %d failed, Not GameState.PLAY", uid, card));
            return;
        }
        var player = this.players[playerIndex];
        if (!player.handCards.contains(card)) {
            DEBUG(util.format("Player %d play card %d failed, Not has This", uid, card));
            return;
        }
        var cards = player.handCards;

        if (cards.getMissingCount() > 0 && !cards.missing(card)) {
            DEBUG(util.format("Player %d play card %d failed, missing card have not over!", uid, card));
            return;
        }

        this.doPlay(playerIndex, card);

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
        });

        this.playBackPage.push({
            code: Opcodes.S2C_PLAYER_PLAY_CARD,
            args: {
                playerIndex: playerIndex,
                card: card,
            }
        });

        //出牌后重置上一个杠牌玩家
        if (this.preGangedPlayer != playerIndex) {
            this.preGangedPlayer = 0;
            this.preGangedType = null;     //上一次杠成功的杠类型
        }

        // 检查其他玩家
        this.enumPlayers(function (ePlayerIndex, ePlayer) {
            if (ePlayerIndex != playerIndex && !ePlayer.over) {
                var pengAble = ePlayer.handCards.pengAble(card);
                var huAble = ePlayer.handCards.huAble(card);
                var gangAble = ePlayer.handCards.gangAble(card);
                //最后一张牌不能杠
                if (gangAble && this.publicCards.isEmpty()) {
                    gangAble = false;
                }
                ePlayer.pengState = pengAble ? Enum.GrabState.GRABING : null;
                ePlayer.gangState = gangAble ? Enum.GrabState.GRABING : null;
                ePlayer.huState = huAble ? Enum.GrabState.GRABING : null;
                if (pengAble || huAble || gangAble) {
                    this.state = Enum.GameState.GRAB;
                    ePlayer.sendMsg(Opcodes.S2C_PLAYER_GRABA_CARD, {
                        pengAble: pengAble,
                        huAble: huAble,
                        gangAble: gangAble,
                        bePeng: playerIndex,
                    });

                    this.playBackPage.push({
                        code: Opcodes.S2C_PLAYER_GRABA_CARD,
                        args: {
                            playerIndex: ePlayer.index,
                            pengAble: pengAble,
                            huAble: huAble,
                            gangAble: gangAble,
                            bePeng: playerIndex,
                        }
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
            DEBUG(util.format("---------------回合结束"));
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
        this.preMianXiaGangMj = 0;
        this.preMianXiaPlayer = 0;
        this.curPlay = nextPlayer;
        var player = this.players[nextPlayer];
        var card = this.publicCards.getCard();
        player.handCards.drawMj(card);
        // 放了后除非高于已放炮翻数否则不能胡,摸牌后至为0
        player.handCards.passHuMaxMultiple = 0;
        player.sendMsg(Opcodes.S2C_PLAYER_DRAW_CARD, {
            drawPlayer: nextPlayer,
            card: card,
        });

        this.playBackPage.push({
            code: Opcodes.S2C_PLAYER_DRAW_CARD,
            args: {
                drawPlayer: nextPlayer,
                card: card,
            }
        });

        //todo 是否要记录广播消息 告知其他玩家该玩家摸了牌

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
        var huAble = player.handCards.huAble(card);
        for (var i = 1; i <= 27; i++) {
            if (player.handCards.contains(i) && player.handCards.gangAble(i)) {
                var Num = player.handCards.mjs[parseInt((i - 1) / 9)][(i - 1) % 9];
                DEBUG(util.format("Print ZiMO Gang ---------Player %d gang card %d ,cardNum %d cardList : %s ", player.uid, i, Num, player.handCards.mjList()));
                gangAble = true;
                break;
            }
        }
        //最后一张牌不能杠
        if (this.publicCards.isEmpty()) {
            gangAble = false;
        }
        if (huAble || gangAble) {
            this.state = Enum.GameState.GRAB;
            player.pengState = null;
            player.gangState = gangAble ? Enum.GrabState.GRABING : null;
            player.huState = huAble ? Enum.GrabState.GRABING : null;
            //todo 超时自动进行过操作
            player.sendMsg(Opcodes.S2C_PLAYER_GRABA_CARD, {
                pengAble: false,
                gangAble: gangAble,
                huAble: huAble
            });

            this.playBackPage.push({
                code: Opcodes.S2C_PLAYER_GRABA_CARD,
                args: {
                    playerIndex: player.index,
                    pengAble: false,
                    gangAble: gangAble,
                    huAble: huAble
                }
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
        if (!this.huIng(playerIndex) && !this.hued(playerIndex)) {
            this.curPlay = playerIndex;
            player.handCards.peng(pengMj);
            this.players[this.prePlayer].handCards.playedRemove(pengMj);
            DEBUG(util.format("玩家[%s]碰牌[%d]成功", player.uid, pengMj));
            var calcTingMjs = player.handCards.calcTingPai();
            if (Object.keys(calcTingMjs).length > 0) {
                player.sendMsg(Opcodes.S2C_PLAYER_TING_CARD, {
                    tingPai: calcTingMjs,
                })
            }
            this.nextPlayer = playerIndex;
            this.state = Enum.GameState.PLAY;
            var info = {
                type: Enum.GrabType.PENG,
                playerIndex: playerIndex,
                nextPlayer: playerIndex,
                card: pengMj,
                beGrab: this.prePlayer,
            }
            for (var index in this.players) {
                this.players[index].sendMsg(Opcodes.S2C_PLAYER_GRABA_CARD_INFO, info);
            }


            this.playBackPage.push({
                code: Opcodes.S2C_PLAYER_GRABA_CARD_INFO,
                args: info
            });


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

            this.playBackPage.push({
                code: Opcodes.S2C_PLAYER_GRABA_CARD_INFO,
                args: info
            });

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
                for (var i = 1; i <= 27; i++) {
                    if (cards.contains(i) && cards.gangAble(i)) {
                        gangAbleMjs.push(i);
                    }
                }
                if (gangAbleMjs.length < 1) {
                    DEBUG(util.format("玩家[%d]不能杠牌", uid));
                    return;
                }
                gangMj = gangAbleMjs[0];
            } else {//未摸牌
                gangMj = this.prePlayMj;
                DEBUG(util.format("玩家-------------------[%d]请求杠牌 [%d]", uid, gangMj));
            }
        } else if (cards.contains(card) && cards.gangAble(card)) {
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
        player.huState = null;
        if (gangType == Enum.GangType.MIAN_XIA_GANG) {
            var qiangGangHu = false;
            for (var index in this.players) {
                var p = this.players[index];
                if (p.index != player.index && !p.over && p.uid > 0) {
                    var huAble = p.handCards.huAble(gangMj); //todo 后面可能需要增加不能胡条件 (倍数不够)
                    p.huState = huAble ? Enum.GrabState.GRABING : null;
                    if (huAble) {
                        qiangGangHu = true;
                        this.state = Enum.GameState.GRAB;
                        p.sendMsg(Opcodes.S2C_PLAYER_GRABA_CARD, {
                            pengAble: false,
                            huAble: huAble,
                            gangAble: false,
                        });

                        this.playBackPage.push({
                            code: Opcodes.S2C_PLAYER_GRABA_CARD_INFO,
                            args: {
                                playerIndex: p.index,
                                pengAble: false,
                                huAble: huAble,
                                gangAble: false,
                            }
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
            if (gangType == Enum.GangType.ZHI_GANG) {
                this.players[this.prePlayer].handCards.playedRemove(gangMj);
                this.players[this.prePlayer].recordDetai.push(Enum.RecordDetail.DIAN_GANG);
            }
            this.preGangedPlayer = playerIndex;
            this.preGangedType = gangType;//todo
            this.nextPlayer = playerIndex;
            this.state = Enum.GameState.PLAY;
            this.resetGrabState();
            var info = {
                type: Enum.GrabType.GANG,
                playerIndex: playerIndex,
                nextPlayer: playerIndex,
                card: gangMj,
                beGrab: gangType == Enum.GangType.ZHI_GANG ? this.prePlayer : playerIndex
            };
            for (var index in this.players) {
                var p = this.players[index];
                p.sendMsg(Opcodes.S2C_PLAYER_GRABA_CARD_INFO, info);
            }

            //回放
            this.playBackPage.push({
                code: Opcodes.S2C_PLAYER_GRABA_CARD_INFO,
                args: info
            });

            player.recordDetai.push(gangType);
            player.gangRecord[gangMj] = gangType;
            this.billGang(playerIndex, gangType, gangMj);
            player.handCards.calcHuMjs();
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
            if (p.pengState == Enum.GrabState.GRABING || p.gangState == Enum.GrabState.GRABING || p.huState == Enum.GrabState.GRABING) {
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
        if (this.state != Enum.GameState.MISSING) {
            DEBUG(util.format("玩家[%d],定缺失败,定缺阶段才能定缺", uid));
            return;
        }
        if (miss < 0 || miss > 3) {
            DEBUG(util.format("玩家[%d],定缺参数错误 [%d]", uid, miss));
            return;
        }
        if (this.players[playerIndex].handCards.miss != null) {
            DEBUG(util.format("玩家[%d],已经定缺,请勿重复定缺 [%d]", uid, miss));
            return;
        }
        var playerIndex = this.getPlayerIndex(uid);
        this.doMissing(playerIndex, miss);

    },

    /**
     * 定缺
     * @param playerIndex
     * @param miss
     */

    doMissing: function (playerIndex, miss) {
        this.players[playerIndex].handCards.miss = miss;
        this.broadcastMsg(Opcodes.S2C_PLAYER_MISSING, {
            playerIndex: playerIndex,
            miss: miss,
        });

        this.playBackPage.push({
            code: Opcodes.S2C_PLAYER_MISSING,
            args: {
                playerIndex: playerIndex,
                miss: miss,
            }
        });

        if (Enum.validContains(this.playMeThod3, Enum.PlayMethod.TIAN_DI_HU)) {
            if (playerIndex == this.dealer) {
                var lasMj = this.players[playerIndex].handCards.getLastDrawMj();
                this.players[playerIndex].handCards.removeMjs(lasMj);
                this.players[playerIndex].handCards.calcHuMjs();
                this.players[playerIndex].handCards.addMjs(lasMj)
            } else {
                this.players[playerIndex].handCards.calcHuMjs();
            }
            // this.players[playerIndex].handCards.calcHuMjs(); //天地胡计算查听
        }

        if (this.missingOver()) {
            this.state = Enum.GameState.PLAY;
            if (Enum.validContains(this.playMeThod3, Enum.PlayMethod.TIAN_DI_HU)) { //针对庄家天胡
                var player = this.players[this.dealer];
                var huType = Func.huPai(player.handCards);
                if (huType != null) {
                    this.state = Enum.GameState.GRAB;
                    player.sendMsg(Opcodes.S2C_PLAYER_GRABA_CARD, {
                        pengAble: false,
                        huAble: true,
                        gangAble: false,
                    });

                    this.playBackPage.push({
                        code: Opcodes.S2C_PLAYER_GRABA_CARD,
                        args: {
                            playerIndex: player.index,
                            pengAble: false,
                            huAble: true,
                            gangAble: false,
                        }
                    });
                }
            }
        }
    },


    /**
     *
     * @return {boolean}
     */

    missingOver: function () {
        for (var index in this.players) {
            if (this.players[index].handCards.miss == null) {
                return false;
            }
        }
        return true;
    },

    /**
     * 玩家请求换牌
     * @param uid
     */
    onPlayerReqExchangeCard: function (uid, cards) {
        var playerIndex = this.getPlayerIndex(uid);
        var player = this.players[playerIndex];
        var handCards = player.handCards;
        if (!Enum.validContains(this.playMeThod3, Enum.PlayMethod.HUAN_SAN_ZHANG)) {
            DEBUG(util.format("玩家[%d]换牌失败, 本房间规则不支持换牌", uid));
            return;
        }

        if (handCards.exchangeNum > 0) {
            DEBUG(util.format("玩家[%d]换牌失败, 已换牌, 不能重复换牌", uid, cards));
            return;
        }
        if (!handCards.containsMjs(cards)) {
            DEBUG(util.format("玩家[%d]换牌失败, 没有换牌麻将[%s]", uid, cards));
            return;
        }
        if (!handCards.isSameKind(cards)) {
            DEBUG(util.format("玩家[%d]换牌失败, 换牌麻将必须为同种花色", uid, cards));
            return;
        }

        // this.broadcastMsg(Opcodes.S2C_PLAYER_EXCHANGE, {
        //     playerIndex: playerIndex,
        //     miss: miss,
        // });
        this.doExchange(playerIndex, cards);
    },


    /**
     * 换牌
     * @param playerIndex
     * @param cards
     */
    doExchange: function (playerIndex, cards) {
        var player = this.players[playerIndex];
        var handCards = player.handCards;
        handCards.removeMjsByMjs(cards);
        handCards.exchangeNum = cards.length;
        // for (var index in cards) {
        //     this.exchangeMjs.push(cards[index]);
        //     // this.publicCards.cards.push(cards[index]);
        // }
        this.exchangeMjs[playerIndex] = cards;

        //广播换牌
        this.broadcastMsg(Opcodes.S2C_PLAYER_EXCHANGE, {
            playerIndex: playerIndex,
        });


        this.playBackPage.push({
            code: Opcodes.S2C_PLAYER_EXCHANGE,
            args: {
                playerIndex: playerIndex,
            }
        });

        // var excards = this.publicCards.getCards(handCards.exchangeNum);
        // handCards.addMjsByMjs(excards);
        //
        // //发送换牌
        // player.sendMsg(Opcodes.S2C_PLAYER_EXCHANGE_INFO, {
        //     cards: excards,
        // });

        if (this.doExchangeOver()) {
            // var startIndex = 0;
            for (var index in this.players) {
                var p = this.players[index];
                // var card = this.exchangeMjs.splice(startIndex, startIndex + p.handCards.exchangeNum);
                // var card = Enum.subList(this.exchangeMjs, startIndex, p.handCards.exchangeNum);
                var nextIndex = this.nextPlayerIndex(p.index);
                var card = this.exchangeMjs[nextIndex];
                p.handCards.addMjsByMjs(card);
                p.sendMsg(Opcodes.S2C_PLAYER_EXCHANGE_INFO, {
                    cards: card,
                    exchangeCards: this.exchangeMjs[p.index]
                });

                this.playBackPage.push({
                    code: Opcodes.S2C_PLAYER_EXCHANGE_INFO,
                    args: {
                        playerIndex: p.index,
                        cards: card,
                        exchangeCards: this.exchangeMjs[p.index]
                    }
                });

                // startIndex += p.handCards.exchangeNum;
            }
            this.exchangeMjs = {};
            this.state = Enum.GameState.MISSING;
        }
    },

    /**
     * 换牌结束
     * @return {boolean}
     */

    doExchangeOver: function () {
        for (var index in this.players) {
            var p = this.players[index];
            if (p.handCards.exchangeNum == 0) {
                return false;
            }
        }
        return true;
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
            if (!cards.huAble(huMj)) {
                DEBUG(util.format("玩家[%d]未能满足胡的条件，不能胡牌[%d]", uid, huMj));
                return;
            }
        } else if (this.preMianXiaGangMj != 0) { //抢杠胡
            huMj = this.preMianXiaGangMj;
            if (!cards.huAble(huMj)) { //todo 考虑倍数
                DEBUG(util.format("玩家[%d]未能满足胡的条件，不能胡牌[%d]", uid, huMj));
                return;
            }
        } else {//点炮
            huMj = this.prePlayMj;
            if (!cards.huAble(huMj)) {
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
        if ((huType == Enum.HuType.TIAN_HU || huType == Enum.HuType.DI_HU) && !Enum.validContains(this.playMeThod3, Enum.PlayMethod.TIAN_DI_HU)) {
            DEBUG(util.format("玩家[%d]胡牌[%d]失败, 该房间不支持天地胡", player.uid, card));
            return;
        }
        this.nextPlayer = this.nextPlayerIndex(playerIndex);
        player.over = true;
        player.huState = Enum.GrabState.GRABED;
        player.pengState = null;
        player.gangState = null;
        var info = {
            type: Enum.GrabType.HU,
            playerIndex: playerIndex,
            nextPlayer: this.nextPlayer,
            card: card,
            beGrab: isZm ? playerIndex : this.prePlayer,
        };
        for (var index in this.players) {
            var p = this.players[index];
            p.sendMsg(Opcodes.S2C_PLAYER_GRABA_CARD_INFO, info);
        }

        this.playBackPage.push({
            code: Opcodes.S2C_PLAYER_GRABA_CARD_INFO,
            args: info
        });

        if (!isZm) {
            cards.addMjs(card);
            player.huPaiNum += 1;
            //打过的牌被移除
            this.players[this.prePlayer].handCards.playedRemove(card);
        } else {
            player.ziMoNum += 1;
        }
        cards.huMj = card;
        var notOver = this.notOverNum();
        switch (notOver) {
            case  3:
                //下一局庄家
                // this.nextDealer = playerIndex;
                player.huSqu = 1;
                break;
            case 2:
                player.huSqu = 2;
                break;
            case 1:
                player.huSqu = 3;
                break;
        }

        var huPaiType = Func.huPai(cards);
        var detail = this.calcHuData(playerIndex, cards, huType, huPaiType, isZm, card);
        var totalMultiple = detail['totalMultiple'];
        var fanNum = detail['fanNum'];
        this.billHu(playerIndex, totalMultiple, isZm, huType, fanNum);
        // player.score += loserNum * totalMultiple;
        // player.roundScore = loserNum * totalMultiple;

        detail['roundScore'] = player.roundScore;
        for (var index in this.players) {
            var p = this.players[index];
            p.sendMsg(Opcodes.S2C_PLAYER_HU_CARD_INFO, detail);
        }
        DEBUG(util.format("玩家[%d]胡牌[%d]", player.uid, card));
        for (var index in this.players) {
            var p = this.players[index];
            if (p.index != playerIndex && p.uid > 0 && p.huState != Enum.GrabState.GRABING && (p.pengState == Enum.GrabState.GRABING || p.gangState == Enum.GrabState.GRABING)) {
                this.doPass(p.index, card);//todo 强制玩家过牌
            }
        }
        if (this.roundOver()) {
            // this.onRoomStartNewRound();
            this.doRoundOver();
        } else if (!this.huIng(playerIndex)) {
            this.state = Enum.GameState.PLAY;
            this.resetGrabState();
            if (this.players[this.nextPlayer].handCards.getTotalCount() % 3 != 2) {
                this.doDraw(this.nextPlayer)
            }
        }
    },


    /**
     * 绝张
     * @param mj
     * @return {boolean}
     */
    lastOne: function (mj, isZm) {
        var num = 0;
        for (var index in this.players) {
            var player = this.players[index];
            var cards = player.handCards.played;
            var pengCards = player.handCards.getPengMj();
            cards.forEach(function (card) {
                if (card == mj) {
                    num++;
                }
            });
            pengCards.forEach(function (card) {
                if (card == mj) {
                    num += 3;
                }
            });
        }
        if (isZm) {
            return num == 3;
        }
        return num == 4;
    },

    /**
     * 胡牌明细
     * @param cards 牌
     * @param huType 胡的类型(天胡,地胡,抢杠胡,杠上花等)
     * @param huPaiType 牌的类型(平胡,七对, 大对)
     */

    /**
     * 胡牌明细
     * @param cards 牌
     * @param huType 胡的类型(天胡,地胡,抢杠胡,杠上花等)
     * @param huPaiType 牌的类型(平胡,七对, 大对)
     */

    calcHuData: function (playerIndex, cards, huType, huPaiType, isZm, card) {
        var totalMultiple = 1;
        var detail = [];
        var maxLimit = 1;
        //最大番
        maxLimit <<= this.maxLimit;
        var qys = cards.isQingYiSe();
        var jDui = cards.isJiangDui();
        var dY = cards.isDaiYao();
        var dDd = cards.isJingDiaoDiao();
        var mq = cards.isMenQing();
        var zhongZhang = cards.isZhongZhang();

        //牌的基础类型翻数
        if (huType == Enum.HuType.TIAN_HU) {
            //天胡三翻
            totalMultiple <<= 3;
        } else if (huType == Enum.HuType.DI_HU) {
            //地胡两翻
            totalMultiple <<= 2;
        }
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
        if ((mq && Enum.validContains(this.playMeThod3, Enum.PlayMethod.MEN_QING_ZHONG_ZHANG))) {
            totalMultiple <<= 1;
        }
        //中张
        if ((zhongZhang && Enum.validContains(this.playMeThod3, Enum.PlayMethod.MEN_QING_ZHONG_ZHANG))) {
            totalMultiple <<= 1;
        }
        //幺九将对
        if ((jDui && Enum.validContains(this.playMeThod3, Enum.PlayMethod.YAO_JIU_JIANG_DUI)) ||
            (dY && Enum.validContains(this.playMeThod3, Enum.PlayMethod.YAO_JIU_JIANG_DUI))) {
            totalMultiple <<= 2;
        }
        //金钩钓(大单吊)
        if (dDd) {
            //大单吊肯定是大对子所以这里只加一番
            totalMultiple <<= 1;
        }
        //(海底捞)
        if (this.publicCards.isEmpty()) {
            totalMultiple <<= 1;
        }
        var extra = 0;
        if (huType == Enum.HuType.QIANG_GANG_HU || huType == Enum.HuType.GANG_SHANG_HUA || huType == Enum.HuType.GANG_SHANG_PAO) {
            //抢杠胡和杠上花都加一番(杠上花是自摸根据规则选择是加底还是加番)
            if (huType == Enum.HuType.GANG_SHANG_PAO) {
                //转雨
                this.transferGang(playerIndex);
            }
            extra = 1;
        }
        //计算杠和根
        totalMultiple <<= (cards.getGangMj().length + cards.getGenCount() + extra);
        //自摸加番(如果有该选项)
        if (isZm && this.playMeThod1 == Enum.PlayMethod1.ZM_JIA_FAN) {
            totalMultiple <<= 1;
        }
        if (totalMultiple > maxLimit) {
            totalMultiple = maxLimit;
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
            fanNum : parseInt(Math.log(totalMultiple) / Math.log(2))
        };
    },

    //转雨
    transferGang: function (playerIndex) {
        var winPlayer = this.players[playerIndex];
        var paoPlayer = this.players[this.prePlayer];

        winPlayer.gangScore += paoPlayer.lastGangPoint;
        paoPlayer.gangScore -= paoPlayer.lastGangPoint;
    },


    //结算胡

    billHu: function (winPlayerIndex, totalMultiple, isZm, huType, fanNum) {
        var num = 0;
        var winPlayer = this.players[winPlayerIndex];
        winPlayer.totalMultiple = fanNum;
        if (isZm) {//自摸
            winPlayer.recordDetai.push(Enum.RecordDetail.ZI_MO);
            if (huType == Enum.HuType.GANG_SHANG_HUA && this.preGangedType == Enum.GangType.ZHI_GANG && this.playMeThod2 == Enum.PlayMethod2.DP_DIAN_GANG_HUA) {
                //点杠花(点炮)
                //点杠花(点炮)
                var prePlayer = this.players[this.prePlayer];
                if (this.playMeThod1 == Enum.PlayMethod1.ZM_JIA_FAN) {
                    //自摸加番
                    prePlayer.roundScore -= totalMultiple * this.endPoint;
                    winPlayer.roundScore += totalMultiple * this.endPoint;
                } else {
                    //自摸加底
                    prePlayer.roundScore -= totalMultiple * this.endPoint + this.endPoint;
                    winPlayer.roundScore += totalMultiple * this.endPoint + this.endPoint;
                }
                for (var index in this.players) {
                    if (this.players[index].index != winPlayerIndex && this.players[index].index != this.prePlayer) {
                        this.players[index].gangScore += Enum.GangTypeMuti[Enum.GangType.ZHI_GANG] * this.endPoint;
                    }
                }
                winPlayer.huedPlayer[this.prePlayer] = totalMultiple;
                return 0;
            }
            for (var index in this.players) {
                var p = this.players[index];
                if (p.index != winPlayerIndex && !p.over) {
                    // p.score -= totalMultiple;
                    if (this.playMeThod1 == Enum.PlayMethod1.ZM_JIA_FAN) {
                        p.roundScore -= totalMultiple * this.endPoint
                        winPlayer.roundScore += totalMultiple * this.endPoint;
                        winPlayer.huedPlayer[p.index] = totalMultiple;
                    } else {
                        p.roundScore -= totalMultiple * this.endPoint + this.endPoint;
                        winPlayer.roundScore += totalMultiple * this.endPoint + this.endPoint;
                        winPlayer.huedPlayer[p.index] = totalMultiple;
                    }
                    num++;
                }
            }
        } else {//放炮
            var paoPlayer = this.players[this.prePlayer];
            paoPlayer.recordDetai.push(Enum.RecordDetail.DIAN_PAO);
            winPlayer.recordDetai.push(Enum.RecordDetail.JIE_PAO);
            paoPlayer.roundScore -= totalMultiple * this.endPoint;
            paoPlayer.dianPaoNum += 1;
            winPlayer.roundScore += totalMultiple * this.endPoint;
            winPlayer.huedPlayer[this.prePlayer] = totalMultiple;
            num = 1;
        }
        return num;
    },

    //结算杠
    billGang: function (winPlayerIndex, gangType, gangMj) {
        var player = this.players[winPlayerIndex];
        var losePlayer = [];
        var muti = Enum.GangTypeMuti[gangType];
        switch (gangType) {
            case Enum.GangType.AN_GANG:
                player.anGangNum += 1;
                for (var index in this.players) {
                    var p = this.players[index];
                    if (p.index != player.index && p.uid > 0 && !p.over) {
                        losePlayer.push(p.index);
                    }
                }
                break;
            case Enum.GangType.MIAN_XIA_GANG:
                player.mingGangNum += 1;
                for (var index in this.players) {
                    var p = this.players[index];
                    if (p.index != player.index && p.uid > 0 && !p.over) {
                        losePlayer.push(p.index);
                    }
                }
                break;
            case Enum.GangType.ZHI_GANG:
                player.mingGangNum += 1;
                if (Enum.validContains(this.playMeThod3, Enum.PlayMethod.DA_XIAO_YU)) {
                    for (var index in this.players) {
                        var p = this.players[index];
                        if (p.index != player.index && p.uid > 0 && !p.over) {
                            losePlayer.push(p.index);
                        }
                    }
                } else {
                    losePlayer.push(this.prePlayer);
                }
        }

        var gangPoint = 0;
        for (var index in losePlayer) {
            if (Enum.validContains(this.playMeThod3, Enum.PlayMethod.DA_XIAO_YU) && gangType == Enum.GangType.ZHI_GANG) {
                if (this.players[losePlayer[index]].index != this.prePlayer) {
                    this.players[losePlayer[index]].gangScore -= muti * this.endPoint / 2;
                    player.gangScore += muti * this.endPoint / 2;
                    gangPoint += muti * this.endPoint / 2;
                    if (!player.gangDtail.hasOwnProperty(losePlayer[index])) {
                        player.gangDtail[losePlayer[index]] = muti * this.endPoint / 2;
                    } else {
                        player.gangDtail[losePlayer[index]] += muti * this.endPoint / 2;
                    }
                    if (isNaN(player.gangDtail[losePlayer[index]])) {
                        ERROR(util.format("billGang ERROR %s ", player.gangDtail));
                    }
                } else {
                    this.players[losePlayer[index]].gangScore -= muti * this.endPoint;
                    player.gangScore += muti * this.endPoint;
                    gangPoint += muti * this.endPoint;
                    if (!player.gangDtail.hasOwnProperty(losePlayer[index])) {
                        player.gangDtail[losePlayer[index]] = muti * this.endPoint;
                    } else {
                        player.gangDtail[losePlayer[index]] += muti * this.endPoint;
                    }
                    if (isNaN(player.gangDtail[losePlayer[index]])) {
                        ERROR(util.format("billGang ERROR %s ", player.gangDtail));
                    }
                }

            } else {
                this.players[losePlayer[index]].gangScore -= muti * this.endPoint;
                player.gangScore += muti * this.endPoint;
                gangPoint += muti * this.endPoint;
                //杠牌明细记录
                if (!player.gangDtail.hasOwnProperty(losePlayer[index])) {
                    player.gangDtail[losePlayer[index]] = muti * this.endPoint;
                } else {
                    player.gangDtail[losePlayer[index]] += muti * this.endPoint;
                }
                if (isNaN(player.gangDtail[losePlayer[index]])) {
                    ERROR(util.format("billGang ERROR %s", player.gangDtail));
                }
                if (isNaN(player.gangScore)) {
                    ERROR(util.format("billGang ERROR %s ", player.gangScore));
                }
            }
            player.lastGangPoint = gangPoint;
        }
    },

    //查牌
    billCheckCard: function (playerIndex) {
        var player = this.players[playerIndex];
        var cards = player.handCards;
        var isHuaZhu = cards.isHuaZhu();
        var isWuTing = cards.isWuTing();
        var maxLimit = 1;
        // if (!isWuTing) {
        //     var totalMultiple = player.handCards.maxHuPaiMultiple();
        //     player.totalMultiple = parseInt(Math.log(totalMultiple) / Math.log(2));
        // }
        maxLimit <<= this.maxLimit;
        if (isHuaZhu || isWuTing) {
            player.recordDetai.push(Enum.RecordDetail.CHA_JIAO);
            player.chaDaJiao++;
            player.chaJiao = true;
            for (var index in this.players) {
                var p = this.players[index];
                //返杠钱
                if (player.gangDtail.hasOwnProperty(p.index)) {
                    p.gangScore += player.gangDtail[p.index];
                    player.gangScore -= player.gangDtail[p.index];
                    if (isNaN(p.gangScore)) {
                        ERROR(util.format("billCheckCard ERROR %s ", p.gangScore));
                    } else if (isNaN(player.gangScore)) {
                        ERROR(util.format("billCheckCard ERROR %s ", player.gangScore));
                    }
                }
                if (p.index != playerIndex && Object.keys(p.handCards.huMjs).length > 0 && !p.over) {
                    var maxMuliti = isHuaZhu ? maxLimit : p.handCards.maxHuPaiMultiple();
                    p.roundScore += maxMuliti * this.endPoint;
                    player.roundScore -= maxMuliti * this.endPoint;
                }
            }
        }
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

        //回放
        this.playBackPage.push({
            code: Opcodes.S2C_PLAYER_GRABA_CARD_INFO,
            args: info
        });

        DEBUG(util.format("玩家[%d]过牌[%d]", player.uid, card));

        if (cards.getTotalCount() % 3 != 2 && cards.huAble(card)) { //放炮
            cards.passHuMaxMultiple = cards.huMjs[card];
            //todo 第一个玩家放炮，该玩家不胡，第二个玩家同样打这张牌是否可以胡?
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
                    ;
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
        // return this.notOverNum() < 2 && this.publicCards.isEmpty();
        if (this.publicCards.isEmpty()) {
            this.nextDealer = this.prePlayer;
            return true;
        }
        if (this.notOverNum() < 2) {
            return true;
        }
        return false;
        // return !this.publicCards.isEmpty() ? this.notOverNum() < 2 : true;
    },

    /**
     * 没有胡牌玩家数量
     * @return {number}
     */

    notOverNum: function () {
        var notOver = 0;
        for (var index in this.players) {
            var p = this.players[index];
            if (p.uid > 0 && !p.over) {
                notOver++;
            }
        }
        return notOver;
    },


    //本轮结束
    doRoundOver: function () {
        var notOver = [];
        for (var index in this.players) {
            var p = this.players[index];
            if (p.uid > 0 && !p.over) {
                notOver.push(p.index);
            }
        }
        if (this.publicCards.isEmpty() && notOver.length > 1) {
            for (var playerIndex in notOver) {
                this.billCheckCard(notOver[playerIndex]);
            }
        }
        this.onSettement();

        //todo  sendMsg;

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
        if (cards.played.length == 0 && cards.getTotalCount() == 14 && playerIndex == dealer) {
            type = Enum.HuType.TIAN_HU;
        } else if (cards.played.length == 0 && cards.getTotalCount() == 14 && playerIndex != dealer) {
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
                return p.index;
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
        var passMj = this.nextPlayer == playerIndex && cards.getTotalCount() % 3 == 2 ? cards.getLastDrawMj() : this.prePlayMj;
        // var passMj = this.nextPlayer == playerIndex && cards.getTotalCount() % 3 == 2 ? cards.getLastDrawMj() : this.preMianXiaGangMj == 0 ? this.prePlayMj : this.preMianXiaGangMj;
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
                    this.onRoomStartNewRound();

                }
            }
        }
    },


    /**
     * 玩家请求退出房间
     * @param uid
     */
    onPlayerReqExitRoom: function (uid) {
        var playerIndex = this.getPlayerIndex(uid);
        if (this.started) {
            DEBUG(util.format("玩家[%d],已经开始游戏,不能退出,只能申请解散房间", uid));
            return;
        }
        var player = this.players[playerIndex];
        this.broadcastMsg(Opcodes.S2C_PLAYER_EXIT_ROOM, {
            playerIndex: playerIndex,
        });

        // this.players[playerIndex].destroy();

        // delete this.players[playerIndex];

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


    onPlayerDestroyRoom: function (uid) {
        this.destroyRoomImmd();
    },

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

                if (this.curRound > 1 || (this.curRound == 1 && !this.started)) {
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

    // 广播用户使用道具
    onPlayerReqUseProp: function (uid, tarUid, type) {
        var playerIndex = this.getPlayerIndex(uid);
        var player = this.players[playerIndex];
        if ((player.uid == this.creator && player.roomCard <= player.useRoomCard + Enum.getCardsNeed(this.round) && player.freeUseProp == 0)
            || (player.roomCard <= player.useRoomCard && player.freeUseProp == 0)) {
            player.sendMsg(Opcodes.S2C_PLAYER_USE_PROP, {
                status: false
            })
            return;
        }
        if (player.freeUseProp == 0) {
            player.useRoomCard++;
            player.freeUseProp = 9;
        } else {
            player.freeUseProp--;
        }
        var tarPlayerIndex = this.getPlayerIndex(tarUid);
        this.broadcastMsg(Opcodes.S2C_PLAYER_USE_PROP, {
            status: true,
            playerIndex: playerIndex,
            tarPlayerIndex: tarPlayerIndex,
            roomCard: player.roomCard,
            freeUseProp: player.freeUseProp,
            type: type,
        });
    },

};

exports.Room = Room;