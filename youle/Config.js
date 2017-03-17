/******************************************************************************
 * Author:      671643387
 * Created:     2016/10/25
 *****************************************************************************/

// 服务器名字
exports.ServerName      = "XIAN_DAN";

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
// 是否扣除房卡
exports.CostCard        = true;

// 中央服务器地址
exports.MiddleHost      = "106.15.1.107";
// 中央服务器端口
exports.MiddlePort      = 7020;

// 游戏服务器地址
exports.GameHost        = "106.15.1.107";
// 游戏服务器端口
exports.GamePort        = 7021;
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
exports.MongoName       = "XIAN_DAN";

//后台地址
exports.backUrl = 'http://211.149.249.30/xiandanpenghu/index.php/Home/Api/%s?%s&%s'
