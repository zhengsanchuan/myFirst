/******************************************************************************
 * Author:      671643387
 * Created:     2016/10/25
 *****************************************************************************/

var util = require("util");
var HttpReq         = require("../HttpRequest.js");
var BG              = require("../net/BackGroundID.js");

///////////////////////////////////////////////////////////////////////////////
//>> 玩家数据

// 玩家数据
function Player(uid) {
    this.uid        = uid;      // 玩家编号
    this.user       = {};       // 玩家数据

    this.wsConn     = null;     // WebSocket连接
    this.isDirty    = false;    // 数据是否被修改
}

Player.create = function(uid) {
    var initUser = {
        "_id"       : uid,                  // 角色编号
        "lock"      : 0,
        "ai"        : 1,
        "info"      : {
            "name"      : "",               // 角色名
            "headpic"   : "",               // 头像
            "sex"       : 1,                // 性别
            "cTime"     : Date.getStamp(),  // 创建时间
        },
        "status"    : {
            "card"      : Config.InitPlayerCard,                // 房卡
            "score"     : 0,                // 积分
            "playedNum" : 0,                // 总局数
            "winNum"    : 0,                // 赢的局数
            "monthCard": {'start': 0, 'end': 0}, //月卡
        },
        "marks"     : {
            "isAgent"   : false,            // 是否代理
            "ownRoomId" : 0,                // 玩家创建的房间号
            "roomId"    : 0,                // 玩家加入的房间号
        },

        "reports"   : [],                   // 战报

        "cardsList" : [],                   // 房卡记录
        "cardsPwd"  : "0000",               // 初始化房卡密码
    };
    return initUser;
};

Player.prototype = {

    // 初始化角色
    init: function(fields, callback) {
        if (fields && (typeof(fields) == "object")
            && Object.getOwnPropertyNames(fields) > 0) {
            // 加载部分数据
            fields["ai"] = 1;
        }

        var player = this;

        // 加载玩家数据
        MongoUser.findOne({_id: player.uid}, fields, function(err, doc){
            if (doc) {
                // 清理部分数据
                doc.marks.ownRoomId = 0;
                doc.marks.roomId = 0;

                player.user = doc;
                callback && callback(true);
            } else {
                if (err) {
                    callback && callback(false);
                } else {
                    // 创建新用户
                    player.user = Player.create(player.uid);
                    MongoUser.insertOne(player.user, function(err, res){
                        if (err) {
                            callback && callback(false);
                        } else {
                            callback && callback(true);
                        }
                    });
                }
            }
        });
    },

    // 保存用户数据
    save: function() {
        if (this.isDirty) {
            MongoUser.save(this.user, function(err){
                if (!err) {
                    this.isDirty = false;
                }
            }.bind(this));
        }
    },

    // 标记数据被修改
    markDirty: function() {
        this.isDirty = true;
    },

    /**
     * 给玩家加卡
     * @param card
     * @param from
     */
    addCards: function(card, from) {
        if (card <= 0) {
            return;
        }

        var user = this.user;
        user.status.card += card;
        user.cardsList.push({
            type    : 1,    // 加卡
            card    : card, // 卡片数量
            from    : from, // 来源
        });
        this.markDirty();
    },

    /**
     * 添加房卡记录
     * @param card
     * @param from
     */
    addCardsRecord: function(card, to, name) {
        var user = this.user;
        user.cardsList.push({
            type    : 1,                // 加卡
            card    : card,             // 卡片数量
            to      : to,               // 来源
            name    : name,             // 名字
            time    : Date.getStamp(),  // 时间
        });
        this.markDirty();
    },

    /**
     * 更新房卡密码
     * @param curPwd
     * @param newPwd
     */
    updateCardsPwd: function(curPwd, newPwd) {
        if (curPwd == this.user.cardsPwd) {
            this.user.cardsPwd = newPwd;
            this.markDirty();
            return true;
        }
        return false;
    },

    /**
     * 获取卡片详情
     * @returns {Array}
     */
    getCardsDetail: function() {
        return this.user.cardsList;
    },

    // 使用分数
    useScore: function(score) {
        if ((score + this.user.status.score) < 0) {
            return false;
        }

        this.user.status.score -= score;

        LOG(util.format("useScore, USE-%d, CUR-%d"
            , score, this.user.status.score));

        this.markDirty();
        return true;
    },

    // 修改房卡
    modifyCard: function(card) {
        if ((card + this.user.status.card) < 0) {
            return false;
        }

        this.user.status.card += card;

        LOG(util.format("modifyCard, MOD-%d, CUR-%d"
            , card, this.user.status.card));
        this.markDirty();
        return true;
    },

    // 修改月卡玩家
    modifyMonthCard: function (startTime, endTime) {
        var monthCard = this.user.status.monthCard;
        monthCard['start'] = startTime
        monthCard['end'] = endTime
        // this.user.status.card += card;
        LOG(util.format("modifyMothCard, start-%d, end-%d"
            , startTime, endTime));
        this.markDirty();
        return true;
    },

    // 设置连接对象
    setConn: function (conn) {
        this.wsConn = conn;
    },

    // 获取连接对象
    getConn: function() {
        return this.wsConn;
    },

    // 设置玩家创建的房间号
    setOwnedRoomId: function(roomId) {
        this.user.marks.ownRoomId = roomId;
        this.markDirty();
    },

    // 判断房间是否已经创建了房间
    hasOwnedRoom: function() {
        return this.user.marks.ownRoomId != 0;
    },

    setJoinedRoomId: function(roomId) {
        this.user.marks.roomId = roomId;
        this.markDirty();
    },

    hasJoinedRoom: function() {
        return this.user.marks.roomId != 0;
    },

    incPlayedNum: function() {
        this.user.status.playedNum += 1;
        //if ((this.user.status.playedNum % 8) == 0) {
        //    this.user.status.score += 1;
        //}
        LOG(util.format("incPlayedNum, CUR-%d"
            , this.user.status.playedNum));
        this.markDirty();
    },

    incScore: function(score) {
        this.user.status.score += score;
        LOG(util.format("incScore, INC-%d, CUR-%d"
            , score, this.user.status.score));
        this.markDirty();
    },

    // 保存战报
    saveReport: function(report) {
        var reports = this.user.reports || [];
        reports.push(report);
        // TODO 战报数量
        if (reports.length > 30) {
            reports = reports.splice(0, reports.length - 30);
        }
        this.user.reports = reports;
        this.markDirty();
    },

    decCards: function(cards) {
        this.user.status.card -= cards;
        LOG(util.format("decCards, DEC-%d, CUR-%d"
            , cards, this.user.status.card));
        this.markDirty();
    },
};

///////////////////////////////////////////////////////////////////////////////
// 玩家管理器
function PlayerManager() {
    this.plats          = {};   // 平台数据
    this.players        = {};   // 玩家数据缓存
}

PlayerManager.prototype = {

    // 初始化
    init: function(callback) {
        // 加载平台数据
        var cursor = MongoPlat.find();
        cursor.each(function(err, item){
            if (err) {
                ERROR(err);
                process.exit(-1);
            }

            if (item) {
                this.plats[item._id] = +item.uid;
            }

            if (cursor.isClosed()) {
                callback && callback();
            }
        }.bind(this));

        // 定时保存玩家数据
        setInterval(function(){
            //DEBUG("Save players");
            for (var sUid in this.players) {
                if (!this.players.hasOwnProperty(sUid)) {
                    continue;
                }
                this.players[sUid].save();
            }
        }.bind(this), 10000);
    },

    // 检查平台编号是否已经存在
    hasOpenid: function(openid) {
        return this.plats.hasOwnProperty(openid);
    },

    // 获取用户编号
    getUid: function(openid) {
        return +(this.plats[openid]);
    },

    // 注册一个新平台帐号
    addPlat: function(openid, wx_name, callback) {
        if (this.plats.hasOwnProperty(openid)) {
            callback(null, +(this.plats[openid]));
        } else {
            MongoPlat.findOneAndUpdate({_id: '_userid'}, {$inc: {'ai': 1}}, {'returnOriginal': false}, function(err, result) {
                if (!err) {
                    var newUID = +(result.value.ai);
                    MongoPlat.insertOne({_id: openid, uid: newUID, time: Date.getStamp()}, function(err, result) {
                        if (err) {
                            callback(err);
                        } else {
                            this.plats[openid] = newUID;
                            callback(null, newUID);
                            //新用户通知后台
                            HttpReq.requestGame(BG.ReqArgs.NUMBERADD_API, newUID, wx_name, null, function (res) {
                                if (res.resultcode == BG.ProtoState.SUCCESS) {
                                    LOG(util.format("OpenID %s import Success uid %d wx_name %s", openid, newUID, wx_name));
                                } else {
                                    LOG(util.format("OpenID %s import Failed ErrorCode %d", openid, res.resultcode));
                                }
                            })

                            LOG(util.format("OpenID %s registerd as %d", openid, newUID));
                        };
                    }.bind(this));
                } else {
                    callback(err);
                }
            }.bind(this));
        }
    },

    // 删除一个玩家账号
    delUser: function (uid, callback) {
        if (!this.players.hasOwnProperty(uid)) {
            callback(null);
        } else {
            MongoUser.findOneAndDelete({_id: uid}, function (err, result) {
                if (!err) {
                    callback(this.players[uid])
                    LOG(util.format("OpenID %s Removed", uid));
                } else {
                    callback(err);
                }
            }.bind(this));
        }
    },

    // 获取玩家数据
    getPlayer: function(uid, callback) {
        if (this.players.hasOwnProperty(uid)) {
            callback(this.players[uid]);
        } else {
            this.loadPlayer(uid, function(player){
                this.players[uid] = player;
                callback(player);
            }.bind(this));
        }
    },


    //查找玩家，先从内存里面找，找不到再去数据库里面找
    //todo
    findPlayer: function (uid, callback) {
        if(this.players.hasOwnProperty(uid)){
            callback(this.players[uid]);
        }else{
            MongoUser.findOne({_id: uid}, {}, function(err, doc){
                if (doc) {
                    var player = new Player(uid);
                    player.user = doc;
                    // player.isDirty = true;
                    callback(player);
                } else {
                    callback(false);
                }
            });
        }
    },

    // 加载玩家数据
    loadPlayer: function(uid, callback) {
        var player = new Player(uid);
        player.init({}, function(suss){
            if (suss) {
                this.players[uid] = player;
                callback && callback(player);
            } else {
                callback && callback();
            }
        }.bind(this));
        player.save();
    },

    // 保存所有数据
    saveAll: function(callback) {
        for (var sUid in this.players) {
            if (!this.players.hasOwnProperty(sUid)) {
                continue;
            }
            this.players[sUid].save();
        }
        callback && callback();
    },
};

exports.PlayerManager = PlayerManager;