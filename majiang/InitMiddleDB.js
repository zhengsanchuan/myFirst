/******************************************************************************
 * Author:      671643387
 * Created:     2016/10/25
 *****************************************************************************/

var mongodb     = require("mongodb");
global.Config   = require(require("fs").existsSync("../Config.js") ? "../Config.js" : "./Config.js");
var TaskLoader  = require("./util/Common.js").TaskLoader;
var LoggerDef   = require("./util/Logger.js").Logger;

///////////////////////////////////////////////////////////////////////////////
//>> 创建中央服务器数据库结构

function main() {

    // 初始化日志
    setupLogger();

    // 创建数据库结构
    var mongoServer = new mongodb.Server(Config.MongoHost, Config.MongoPort,
        {auto_reconnect:true, poolSize:4});
    var db = new mongodb.Db(Config.MongoName, mongoServer,
        {'native_parser':false, 'w':1, 'wtimeout':2, 'fsync':true});

    db.open(function(err, db) {
        if( err ) {
            ERROR('db open err!');
            process.exit(-1);
        }

        var loader = new TaskLoader(function() {
            LOG('Middle database created');
            process.exit(0);
        });

        loader.addLoad('empty');

        // 创建plat数据库
        loader.addLoad('plat');
        db.createCollection('plat', {}, function(err, result){
            var gDBPlat = db.collection('plat');
            gDBPlat.insertOne({_id:'_userid', 'ai': 1000000}, function(err, result){
                loader.onLoad('plat');
            });
        });

        // 创建user数据库
        loader.addLoad('user');
        db.createCollection('user', {}, function(err, result){
            loader.onLoad('user');
        });

        // 创建world数据库
        loader.addLoad('world');
        db.createCollection('world', {}, function(err, result){
            var gDBWorld = db.collection("world");
            // 保存已经使用的房间号
            gDBWorld.insertOne({_id:'_usedRoomIds', 'ids': {}}, function(err, result){
                loader.onLoad('world');
            });
        });

        loader.onLoad('empty');
    });
}
main();

// 初始化日志
function setupLogger() {
    global.Logger = new LoggerDef();
    Logger.init({
        servName    : Config.ServerName,
    });
    global.DEBUG = function(msg) { Logger.debug(msg); };
    global.LOG = function(msg) { Logger.info(msg); };
    global.ERROR = function(msg) { Logger.error(msg); };
    LOG("Logger inited");
}