/******************************************************************************
 * Author:      671643387
 * Created:     2016/10/25
 *****************************************************************************/

///////////////////////////////////////////////////////////////////////////////
//>> 时间相关函数

/**
 * 格式化时间
 * @param fmt
 * @returns {*}
 */
Date.prototype.format = function(fmt)   {
    var o = {
        'M+' : this.getMonth()+1,                 //月份
        'd+' : this.getDate(),                    //日
        'h+' : this.getHours(),                   //小时
        'm+' : this.getMinutes(),                 //分
        's+' : this.getSeconds(),                 //秒
        'q+' : Math.floor((this.getMonth()+3)/3), //季度
        'S'  : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt)) {
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+'').substr(4 - RegExp.$1.length));
    }
    for(var k in o) {
        if(new RegExp('('+ k +')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ?
                (o[k]) : (('00'+ o[k]).substr((''+ o[k]).length)));
        }
    }
    return fmt;
};

/**
 * 计算UTC毫秒
 * @returns {number}
 */
Date.prototype.getUTCFullMilliseconds = function() {
    return this.getTime() - this.getTimezoneOffset()*60000;
};

/**
 * 计算UTC天数
 * @returns {number}
 */
Date.prototype.getDays = function() {
    return Math.floor(this.getUTCFullMilliseconds()/86400000);
};

/**
 * 获取距离refTime经过的天数, refTime(时间戳|2013-01-01|2013-01-01 00:00:00)
 * @param refTime
 * @returns {number}
 */
Date.prototype.getDayPassed = function(refTime) {
    if( isNaN(refTime) ) {
        if( refTime.length > 10 ) {
            refTime = refTime.substr(0, 10);
        }
        refTime = new Date(refTime + ' 00:00:00');
    }else{
        refTime = new Date(refTime * 1000);
    }

    refTime.setHours(0);
    refTime.setMinutes(0);
    refTime.setSeconds(0);

    return Math.ceil((this - refTime)/1000/86400);
}

/**
 * 计算UTC时间戳
 * @returns {number}
 */
Date.prototype.getUTCStamp = function() {
    return Math.floor(this.getUTCFullMilliseconds()/1000);
}

/**
 * 计算本地时间戳
 * @returns {number}
 */
Date.prototype.getStamp = function() {
    return Math.floor(this.getTime()/1000);
}

/**
 * 设置当天的时间,支持小数,比如setFloatTime(10.5, 0, 0)即为设置为10点半
 * @param hour
 * @param minute
 * @param second
 * @returns {Date}
 */
Date.prototype.setFloatTime = function(hour, minute, second) {
    var totalMinutes = Math.ceil(hour*3600 + minute*60 + second);
    hour = Math.floor(totalMinutes/3600);
    totalMinutes = totalMinutes%3600;
    minute = Math.floor(totalMinutes/60);
    second = totalMinutes%60;

    this.setHours(hour);
    this.setMinutes(minute);
    this.setSeconds(second);
    return this;
}

/**
 * 当天0点
 * @returns {Date}
 */
Date.prototype.zeroTime = function() {
    return new Date(this.getFullYear(), this.getMonth(), this.getDate());
}

/**
 * 相对时间(秒)
 * @param seconds
 * @returns {Date}
 */
Date.prototype.relativeTime = function(seconds) {
    return new Date(this.getTime() + seconds*1000);
}

/**
 * 标准格式化字符串
 * @returns {*}
 */
Date.prototype.stdFormatedString = function() {
    return this.format('yyyy-MM-dd hh:mm:ss');
}

/**
 * 以数据形式表示的年月日
 * @returns {number}
 */
Date.prototype.getDateNumber = function() {
    return this.getFullYear()*10000 + (this.getMonth()+1)*100 + this.getDate();
}

/**
 * 获取当前时间是当天的第几秒
 * @returns {number}
 */
Date.prototype.getTodaySeconds = function() {
    return this.getHours()*3600 + this.getMinutes()*60 + this.getSeconds();
}

/**
 * 获取相对于refTime已经过了几天
 * @param refTime
 * @returns {number}
 */
Date.getDayPassed = function(refTime) {
    return (new Date()).getDayPassed(refTime);
}

/**
 * 获取当前时间戳
 * @returns {number}
 */
Date.getStamp = function() {
    return (new Date()).getStamp();
}

/**
 * 从时间戳创建Date对象
 * @param stamp
 * @returns {Date}
 */
Date.createFromStamp = function(stamp) {
    return new Date(stamp*1000);
}

/**
 * 获取当前时间的格式化字符串
 * @returns {*}
 */
Date.stdFormatedString = function() {
    return (new Date()).stdFormatedString();
};