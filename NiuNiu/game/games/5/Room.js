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
    /**
     * 生成52张牌
     */
    gen: function () {
        this.num = 52;
        this.getIndex = 0;

        // 原始牌组
        var rawCards = [];
        for (var iCard = 0; iCard < 13; ++iCard) {
            rawCards.push({value: iCard + 1, type: 1, num: iCard + 1 > 10 ? 10 : iCard + 1});
            rawCards.push({value: iCard + 1, type: 2, num: iCard + 1 > 10 ? 10 : iCard + 1});
            rawCards.push({value: iCard + 1, type: 3, num: iCard + 1 > 10 ? 10 : iCard + 1});
            rawCards.push({value: iCard + 1, type: 4, num: iCard + 1 > 10 ? 10 : iCard + 1});
        }

        while (rawCards.length > 0) {
            var randomIndex = Math.floor(Math.random() * rawCards.length);
            this.cards.push(rawCards[randomIndex]);
            rawCards.splice(randomIndex, 1);
        }
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

};


///////////////////////////////////////////////////////////////////////////////
//>> 游戏房间

function Room(id) {
    this.id = id;       // 房间号
    this.creator = 0    //创建者(房主)
    this.gameType = 0;  //游戏类型
    this.round = 0;        // 总轮数
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
    this.nextDealer = 0;    // 下一个庄家
    this.state = Enum.GameState.READY;
}

Room.prototype = {
    // 初始化
    init: function (creator, cArgs) {
        var round = +cArgs.round;
        var playMeThod = cArgs.playMeThod;
        var gameType = cArgs.gameType;
        // 参数检查
        if (isNaN(round) || isNaN(playMeThod)) {
            DEBUG(util.format("创建房间参数错误,请检查参数"));
            return false;
        }
        if (!(Enum.validRoomRound(round)) || !(Enum.validPlayMeThod(playMeThod))) {
            DEBUG(util.format("创建房间参数错误,请检查参数"));
            return false;
        }
        this.cardNum = Enum.CARD_NUM;
        // 初始化房间全局数据
        this.round = round;
        this.playMeThod = playMeThod;
        this.gameType = gameType;

        // 初始化房间玩家数据
        for (var iPlayer = 1; iPlayer <= Enum.ROOM_PLAYER_NUM; ++iPlayer) {
            this.players[iPlayer] = new Player(this, iPlayer, this.cardNum);
        }

        this.publicCards = new PublicCards(this.cardNum);

        this.creator = creator;
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
        playerIndex = this.joinedPlayers + 1;
        var player = this.players[playerIndex];
        player.init(jArgs, wsConn);
        this.joinedPlayers += 1;
        this.onlinePlayers += 1;

        // 广播消息
        this.broadcastMsg(ProtoID.SMSG_PLAYER_JOIN_ROOM, {
            playerIndex: playerIndex,
            player: player.getInfo(),
        }, [playerIndex]);

        // 准备返回给玩家的初始化数据
        var initArgs = {
            round: this.round,
            curRound: this.curRound,
            playMeThod: this.playMeThod,
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
            playerIndex: playerIndex,      // 玩家位置
            cardNum: this.cardNum * 4,         //牌数
            gameType: this.gameType,            //游戏类型
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

        player.onReconnect();
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
    },

    // 结算
    onSettement: function () {
        DEBUG("Room::onSettement");
        this.readyPlayers = 0;
        this.dealer = this.nextDealer;
        // 发送结算信息
        var settementInfo = {
            dealer: this.dealer,
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
        this.state = Enum.GameState.READY;
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
        this.enumPlayers(function (eNotUse, ePlayer) {
            ePlayer.destroy();
        });
        this.onRoomDestroy();
        GameMgr.getSubGame().destroyRoom(this);
        GameMgr.decUsage();
        GameMgr.decPlayerCards(this.creator, Enum.getCardsNeed(this.round));
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
                scoreAdd: Enum.getScore(this.round, (this.curRound >= this.round)),
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
     * 玩家请求准备
     * @param uid
     */
    onPlayerReqReady: function (uid, ready) {
        var playerIndex = this.getPlayerIndex(uid);
        var player = this.players[playerIndex];
        if (this.state != Enum.GameState.READY) {
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
            this.broadcastMsg(Opcodes.S2C_PLAYER_READY_OVER, {});
            this.state = Enum.GameState.BET;
            this.curRound += 1;
        }
    },

    /**
     * 准备完成
     * @return {boolean}
     */
    readyOver: function () {
        for (var index in this.players) {
            if (!this.players[index].getReady() && this.players[index].isInited()) {
                return false;
            }
        }
        return true;
    },

    /**
     * 下注完成
     * @return {boolean}
     */
    betOver: function () {
        for (var index in this.players) {
            if (this.players[index].bet == 0) {
                return false;
            }
        }
        return true;
    },

    /**
     * 玩家请求下注
     * @param uid
     */
    onPlayerReqBetPoint: function (uid, point) {
        var playerIndex = this.getPlayerIndex(uid);
        var player = this.players[playerIndex];
        if(this.state != Enum.GameState.BET){
            DEBUG(util.format("玩家[%d],下注失败, 下注阶段才能下注", uid));
            return;
        }
        if (player.bet != 0) {
            DEBUG(util.format("玩家[%d],已下注,请勿重复下注", uid));
            return;
        }
        player.bet = point;
        this.broadcastMsg(Opcodes.S2C_PLAYER_BET_POINT, {
            playerIndex: playerIndex,
            bet: point,
        });

        if(this.betOver()){
            this.onRoomStartNewRound();
            this.publicCards.gen();
            this.enumPlayers(function (ePlayerIndex, ePlayer) {
                ePlayer.setHandCards(this.publicCards.getCards(5));
            }.bind(this));
            this.state = Enum.GameState.SHOW_DOWN;
        }
    },

    onPlayerReqShowDown: function (uid, playerCardIds) {
        var playerIndex = this.getPlayerIndex(uid);
        var player = this.players[playerIndex];
        var handCards = player.handCards;
        if(this.state != Enum.GameState.SHOW_DOWN){
            DEBUG(util.format("玩家[%d],不能摊牌,摊牌阶段才能摊牌", uid));
            return;
        }
        if (player.handCards.card.length == 0) {
            DEBUG(util.format("玩家[%d],不能摊牌,牌局还没开始", uid));
            return;
        }
        if (player.showdown) {
            DEBUG(util.format("玩家[%d],不能摊牌,请勿重复摊牌", uid));
            return
        }
        /*
         * 计算玩家自己选择的牌是不是最优的牌
         */
        // 玩家选择的3张数字和
        var totalNum = 0;
        // 玩家自定义的最优牌
        var playerBestCards = [];
        for (var i = 0; i < playerCardIds.length && i < 3; i++) {
            var card = playerCardIds[i];
            playerBestCards.push(card);
            if (handCards.contains(card)) {
                totalNum += card.num;
            } else {
                break;
            }
            //有牛情况
            if (i == 2 && (totalNum % 10 == 0)) {
                var seatCards = [];
                var seatTemp = [];
                handCards.card.forEach(function (card) {
                    seatCards.push(card);
                    seatTemp.push(card);
                })
                for (var index in seatTemp) {
                    for (var index1 in playerBestCards) {
                        if (seatTemp[index].type == playerBestCards[index1].type && seatTemp[index].value == playerBestCards[index1].value) {
                            seatCards.splice(index, 1);
                        }
                    }
                }
                // 玩家自定义牌组合的牛类型
                var niu = (seatCards[0].num + seatCards[1].num) % 10;
                var playerBestCardsType = (niu == 0 ? Enum.getNiuType(10)
                    : Enum.getNiuType(niu));
                if (handCards.cardsType == playerBestCardsType) {
                    handCards.bestCards = [];
                    playerBestCards.forEach(function (card) {
                        handCards.bestCards(card);
                    })
                    seatCards.forEach(function (card) {
                        handCards.bestCards(card);
                    })
                }
            }
        }
        this.doShowdown(playerIndex);
    },


    /**
     * 摊牌
     * @param playerIndex
     */
    doShowdown: function (playerIndex) {
        var player = this.players[playerIndex];
        player.showdown = true;
        var handCards = player.handCards;
        if (handCards.cardsType == null) {
            DEBUG(util.format("玩家[%d],摊牌错误,没有摊牌类型", uid));
            return;
        }
        this.broadcastMsg(Opcodes.S2C_PLAYER_SHOW_DOWN, {
            playerIndex: playerIndex,
            cardInfo: handCards.bestCards,
            cardsType: handCards.cardsType,
        });
        //所有人摊牌 结算
        if (this.showDownOver()) {
            var winPlayer = null;
            var maxCardType = null;
            var maxCard = null;
            for (var index in this.players) {
                var handCards = this.players[index].handCards;
                if (maxCard == null || maxCardType == null) {
                    maxCardType = handCards.cardsType;
                    maxCard = handCards.card;
                    continue;
                }
                if (!Func.compare(maxCard, maxCardType, handCards.card, handCards.cardsType)) {
                    maxCardType = handCards.cardsType;
                    maxCard = handCards.card;
                }
            }
            for (var index in this.players) {
                var handCards = this.players[index].handCards;
                if (handCards.cardsType == maxCardType && handCards.card == maxCard) {
                    winPlayer = this.players[index];
                }
            }

            var muti = Enum.getMutl(winPlayer.handCards.cardsType);

            for (var index in this.players) {
                var player = this.players[index];
                if (player.index != winPlayer.index) {
                    player.roundScore -= winPlayer.bet * muti;
                    winPlayer.roundScore += winPlayer.bet * muti;
                }
            }
            this.doRoundOver();
        }
    },

    /**
     * 所有人都摊牌
     * @return {boolean}
     */
    showDownOver: function () {
        for (var index in this.players) {
            if (!this.players[index].showdown) {
                return false;
            }
        }
        return true;
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
        this.broadcastMsg(Opcodes.S2C_PLAYER_EXIT_ROOM, {
            playerIndex: playerIndex,
        });

        this.players[playerIndex].wsConn.close();
        this.players[playerIndex] = new Player(this, playerIndex, this.cardNum);

        //标记玩家退出房间
        GameMgr.sendMgrMsg({
            code: ProtoID.SMSG_REQ_DESTROY_ROOM,
            args: {
                uids: [uid],
            },
        });
        this.joinedPlayers -= 1;

        //房主退出直接解散
        if (playerIndex == 1) {
            this.destroyRoomImmd();
        }
    },


    //本轮结束
    doRoundOver: function () {
        this.onSettement();

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

                if (this.curRound > 1) {
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