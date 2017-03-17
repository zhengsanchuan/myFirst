/******************************************************************************
 * Author:      671643387
 * Created:     2016/10/25
 *****************************************************************************/

// 服务器名字
exports.ServerName      = "Middle";

// 日志级别(1-E, 2-L, 3-D)
exports.LogLevel        = 3;

// 开启PING检查
exports.SetPing         = false;

// 最小房间号
exports.MinRoomId       = 123456;
// 最大房间号
exports.MaxRoomId       = 999999;

// 初始玩家房卡
exports.InitPlayerCard  = 10;

// 初始玩家道具
exports.InitPlayerProp = 10;
// 是否扣除房卡
exports.CostCard        = true;

// 中央服务器地址

exports.MiddleHost      = "58.222.39.247";
// 中央服务器端口
exports.MiddlePort      = 6001;

// 游戏服务器地址
exports.GameHost        = "58.222.39.247";
// 游戏服务器端口
exports.GamePort        = 6002;
// 游戏服务器支持的游戏
exports.GameType        = 2;
// 游戏服务器容量
exports.GameCapacity    = 100;

// 游戏服资源配置
exports.ResConf         = {
    "8"     : 1,
    "16"    : 2,
    "24"    : 3,
};

// Mongo数据库地址
exports.MongoHost       = "127.0.0.1";
// Mongo数据库端口
exports.MongoPort       = 27017;
// Mongo数据库名字
exports.MongoName       = "Gao";
//后台地址
exports.backUrl = 'http://211.149.249.30/gaoliangshou/index.php/Home/Api/%s?%s&%s'