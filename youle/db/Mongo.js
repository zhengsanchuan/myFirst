/******************************************************************************
 * Author:      671643387
 * Created:     2016/10/25
 *****************************************************************************/

var mongodb         = require("mongodb");

///////////////////////////////////////////////////////////////////////////////
//>> MongoDB数据库

// 加载数据库
function loadDB(callback) {
    var mongoServer = new mongodb.Server(Config.MongoHost, Config.MongoPort,
        {auto_reconnect: true, poolSize: 4});
    var db = new mongodb.Db(Config.MongoName, mongoServer,
        {'native_parser': false, 'w': 1, 'wtimeout': 10, 'fsync': true});

    db.open(function(err, db) {
        if (err) {
            ERROR(err);
            process.exit(-1);
        }
        callback && callback(db);
    });
}

exports.loadDB = loadDB;