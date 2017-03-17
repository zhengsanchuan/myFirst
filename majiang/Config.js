/******************************************************************************
 * Author:      671643387
 * Created:     2016/10/25
 *****************************************************************************/

// 服务器名字
exports.ServerName      = "queque";

// 日志级别(1-E, 2-L, 3-
exports.LogLevel        = 3;

// 开启PING检查
exports.SetPing         = false;

// 最小房间号
exports.MinRoomId       = 123456;
// 最大房间号
exports.MaxRoomId       = 999999;

// 中央服务器地址
exports.MiddleHost      = "192.168.2.100";
// 中央服务器端口
exports.MiddlePort      = 4000;

// 游戏服务器地址
exports.GameHost        = "192.168.2.100";
// 游戏服务器端口
exports.GamePort        = 4001;
// 游戏服务器支持的游戏
exports.GameType        = 5;
// 游戏服务器容量
exports.GameCapacity    = 100;

// 是否扣除房卡
exports.CostCard        = true;

// 游戏服资源配置
exports.ResConf         = {
    "4"     : 2,
    "8"    : 3,
};

// Mongo数据库地址
exports.MongoHost       = "127.0.0.1";
// Mongo数据库端口
exports.MongoPort       = 27017;
// Mongo数据库名字
exports.MongoName       = "queque";
//后台地址
exports.backUrl = 'http://211.149.249.30/queque/index.php/Home/Api/%s?%s&%s'