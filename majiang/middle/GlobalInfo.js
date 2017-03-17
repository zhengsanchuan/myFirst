/******************************************************************************
 * Author:      671643387
 * Created:     2016/11/9
 *****************************************************************************/

///////////////////////////////////////////////////////////////////////////////
//>> 服务器全局数据

function GlobalInfo() {
    this.usedRoomIds        = null;     // 已经使用的房间号
}

GlobalInfo.prototype = {

    /**
     * 初始化
     * @param callback
     */
    init: function(callback) {
        MongoWorld.findOne({_id: "_usedRoomIds"}, {}, function(err, res){
            if (!err) {
                this.usedRoomIds = res.ids;
            }
            callback(!err);
        }.bind(this));
    },

    /**
     * 保存数据
     * @param callback
     */
    save: function(callback) {
        MongoWorld.save({_id:"_usedRoomIds", ids:this.usedRoomIds}, function(err){
            callback && callback();
        }.bind(this));
    },

    ///////////////////////////////////////////////////////////////////////////

    /**
     * 申请一个房间号
     * @param callback
     */
    allocRoomId: function(callback) {
        while (true) {
            var roomId = Math.floor(Math.random() * (Config.MaxRoomId - Config.MinRoomId));
            roomId += Config.MinRoomId;

            if (!this.usedRoomIds.hasOwnProperty(roomId)) {
                this.usedRoomIds[roomId] = 1;
                callback && callback(null, roomId);
                break;
            }
        }
    },

    freeRoomId: function(roomId) {
        delete this.usedRoomIds[roomId];
    }
};

exports = module.exports = new GlobalInfo();