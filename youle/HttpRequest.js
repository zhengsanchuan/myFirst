var http = require('http');
var util = require("util");
var qs = require('querystring');

// var url = 'http://test4.angkebrand.com/index.php/Home/api/Numberaddapi?uid=1&&wx_name=nananan'

exports.requestGame = function (api, uid, wx_name, args, callback) {
    var resp = {
        resultcode: 0,
        data: {},
    };

    var post_data = {
        uid: uid,
        wx_name: wx_name
    }

    var argsContent = '';

    if (args != null) {
        argsContent = qs.stringify(args)
    }

    var content = qs.stringify(post_data);

    var url = util.format(Config.backUrl, api, content, argsContent);

    http.get(url, function(res) {

        var resData = "";
        res.on("data", function (data) {
            resData += data;
        });
        res.on("end", function () {
            var gameResp = null;
            try {
                // console.log(data)
                gameResp = JSON.parse(resData);
            } catch (error) {
                // Logger.error(util.format("mahjong resp %s", data))
                gameResp = null;
            }
            if (!gameResp) {
                resp.resultcode = 1;
                resp.reason = 'request game error';
            } else {
                resp.resultcode = gameResp.resultcode;
                resp.reason = gameResp.data;

            }
            callback && callback(resp);

            // console.log(resData);
        });
    }).on('error', function (e) {
        resp.resultcode = 1;
        resp.reason = 'request game error';
        callback && callback(resp);
    });




    //
    // var resp = {
    //     resultcode: 0,
    //     data: {},
    // };
    //
    // var post_data = {
    //     uid: uid,
    //     wx_name: wx_name
    // }
    // var content = qs.stringify(post_data);
    // var req = http.request(options, function (res) {
    //     var chunks = [];
    //     res.on('data', function (chunk) {
    //         chunks.push(chunk);
    //     });
    //
    //     res.on('end', function () {
    //         var data = Buffer.concat(chunks).toString();
    //         var gameResp = null;
    //         try {
    //             console.log(data)
    //             gameResp = JSON.parse(data);
    //         } catch (error) {
    //             // Logger.error(util.format("mahjong resp %s", data))
    //             gameResp = null;
    //         }
    //
    //         if (!gameResp) {
    //             resp.resultcode = 1;
    //             resp.reason = 'request game error';
    //         } else {
    //             resp.resultcode = gameResp.resultcode;
    //             resp.reason = gameResp.data;
    //
    //         }
    //         callback && callback(resp);
    //     });
    // });
    //
    // req.on('error', function (err) {
    //     resp.resultcode = 1;
    //     resp.reason = 'request game error';
    //     callback && callback(resp);
    // });
    //
    // // req.end(util.format('?uid=%d&wx_name=%s', uid, wx_name
    // //     ));
    // req.end(content);
    // req.end();
    // req.end();
}

// this.requestGame('Outcomeapi', 10003, 'zhangsan', {record : -100}, function (res) {
//     console.log(res)
//     // console.log(res.data)
//
//
// })
