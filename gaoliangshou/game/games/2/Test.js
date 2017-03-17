// // // 胡牌方式
// // exports.HupaiMethod = {
// //     'METHOD_7_PAIRS'    : 1,    // 七对胡
// //     'METHOD_7_LONG'     : 2,    // 龙七对
// //     'METHOD_TIAN_HU'    : 3,    // 天胡
// //     'METHOD_DI_HU'      : 4,    // 地胡
// //     'METHOD_DA_DUI'     : 5,    // 大对子
// //     'METHOD_HU_NORMAL'  : 6,    // 普通胡牌
// //     'METHOD_PAO_HU'     : 7,    // 跑胡
// //     'METHOD_PENG_HU'    : 8,    // 碰胡
// //     'METHOD_TLLH'       : 9,    // 提龙连胡
// //     'METHOD_5_HU'       : 10,   // 五福
// //     'METHOD_KAN_5HU'    : 11,   // 开局坎五胡
// //     'METHOD_PING_HU'    : 12,   // 平胡
// // };

// // console.log(this.HupaiMethod.METHOD_PING_HU);
// // var Func = require("./Func.js");
// // var Player = require("./Player.js");


// // var a = Func.twoDimensionalArray(3,9,null);
// var player1Cards = [1, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 9];

// var test = {}

// // for(var card in player1Cards){
// //     HandCards.addMjs(card);
// // }

// // HandCards.addMjs;
// // var p = new Player();
// // for(var card in player1Cards.values()){
// // 	console.log(card);
// // }

// // for(var i =0; i< player1Cards.length; i++){
// // 	// console.log(player1Cards[i]);
// // }

// // test[1] = 2;
// // test['dd'] = 3;

// // // console.log(test);

// // // modScores = [];

// // // modScores = modScores || [0, 0, 0, 0];
// // modScores =1;
// // modScores = modScores||2;

// // console.log(modScores);

// var players = {1:'zhangsan', 2: 'lisi', 3:'wangwu', 4:'zhaoliu'};

// // var b = 1
// // console.log(a[b]);

// // for(var i = 1 ; i <=4; i++ ){
// // 	key = (i + b) %4;
// // 	if(key == 0){
// // 		key +=1;
// // 	}
// // 	console.log(key);
// // 	var v = a[key];
// // 	// if(v == null){
// // 	// 	continue;
// // 	// }
// // 	console.log(v);
// // }

// // console.log(players[2]);

// // function nextPlayerIndex (starIndex) {
// //         for (var i = 1; i <= 4; i++) {
// //         	var k = (starIndex + i) % 4
// //         	if(k == 0){
// //         		k = 4;
// //         		// console.log('k : ' + k);
// //         	}
// //             var p = players[k];
// //             // if (p == null) {
// //             //     continue;
// //             // }
// //             // if (p.over && p.uid > 0) {
// //             //     return i;
// //             // }
// //             return { [k] : p};
// //         }
// //         return null;
// // }
// // // console.log(4%4);
// // console.log(nextPlayerIndex(7));


//     //下一个出牌玩家
// //  function nextPlayerIndex(starIndex) {
// //         for (var i = 1; i <= 4; i++) {
// //             var k = (starIndex + i) % 4;
// //             if(k == 0){
// //                 k = 4;
// //             }
// //             var p = players[k];
// //             // if (p == null) {
// //             //     continue;
// //             // }
// //             // if (p.over && p.uid > 0) {
// //             //     return k;
// //             // }
// //             return k;
// //         }
// //         return null;
// //  }

// // console.log(nextPlayerIndex(7));

// // // console.log(a[3] == null);


// function calcTingPai(){
// 	var ting = {};
// 	ting['name'] = 'zhangsan';
// 	ting['sex'] = 'Man';
// 	return ting;

// }


// function play() {
// 	var tingmjs = calcTingPai();
// 	var len = Object.keys(calcTingPai()).length;
// 	// console.log(len);
// 	// console.log(tingmjs.length());
// 	// console.log(tingmjs);
// 	if (tingmjs = Object.keys(calcTingPai()).length> 0) {
// 		console.log("helloWorld!!!~");
//      }
// }

// play();

var util = require("util");
var Enum = require("./Enum.js");
var Func = require("./Func.js");
var Player = require("./Player.js").Player;
var HandCards = require("./Player.js").HandCards;

// this.handCards = new HandCards();


// function HandCards() {
//     this.MJ_MAX_ID = 27;
//     // this.owner = owner;
//     // this.debug = true;
//     this.num = 0;
//     // this.cards = [];   // 手牌
//     this.mjs = Func.twoDimensionalArray(4, 9, null); //手牌
//     this.pengFlag = Func.twoDimensionalArray(3, 9, false); //碰的牌
//     this.gangFlag = Func.twoDimensionalArray(3, 9, false) //杠的牌
//     this.played = []; //打过的牌
//     this.lastMj = 0;//最后摸的牌
//     this.huMjs = {}; //胡的麻将
//     this.miss = 0; //定缺
//     this.mjCounts = Func.oneDimensionalArray(3);

// }

// var player1Cards = [1, 2, 5, 9, 4, 7, 8, 7, 3, 6, 11, 14, 17, 21, 24, 25];
// var player1Cards = [1, 2, 5, 9, 4, 7, 8, 7, 3, 6, 11, 14, 17, 21, 24, 25];
// var player1Cards = [4, 5, 6, 10, 11, 12, 25, 26, 27, 6, 7, 7, 8];
// var player1Cards = [1,2,3,3,4,5,13,13];
// var player1Cards = [2, 4, 5, 5, 7, 8, 9, 14, 15, 16, 27, 27, 27];
// var player1Cards = [2, 3, 5, 5, 19, 20, 21];
//
// var player1Cards = [5, 5, 2, 23, 5, 2, 8, 8, 5, 20, 26, 11, 14];
var player1Cards = [1, 4, 7, 12, 15, 18, 20, 23, 26, 28, 30, 32, 33, 31];
p = new Player();
var h = new HandCards(player1Cards);
h.init(player1Cards);
// h.calcHuMjs();
// var re = h.huAble(2, false)
// var result = Func.isPinghu(h);
// console.log(Func.isLanHu(h));
var re = Func.huPai(h);
console.log(re);

// var t = Enum.removeDuplicatedItem(arr);

// console.log(h.isYiTiaoLong());
//
// t.sort(function(x,y){
// if(x>y) {return 1;
// }else{
// return -1
// }
// }
// );


// var arrList = {1: 'zhangsam', 2: 'lisi', 3: 'wangwu', 4: 'zhaoliu'}
//
//
// //上一个玩家
// function prePlayerIndex(starIndex) {
//     for (var i = 1; i <= 4; i++) {
//         var k = (starIndex - i) % 4;
//         if (k <= 0) {
//             k = 4;
//         }
//         var p = arrList[k];
//         if (p == null) {
//             continue;
//         }
//         return k
//
//     }
//     return null;
// }
//
// console.log(prePlayerIndex(2));



// console.log(Enum.IsSeries(t));

// console.log(player1Cards.length);
// h.init(player1Cards);


// var p = new Player1(nu

// p.init(null, null);
// p.setHandCards(player1Cards);

// p.add
// var b = [3,1,2]

// var eatMj = {};

// var a = []
// a.push(2)
// a.push(3)

// eatMj[2] = a
// eatMj[3] = []

// console.log(eatMj[2].length > 0);

// var person = {
//     name: 'zero'
// };
// // 判断person里面有没有name这个键，可以这样
// var key = 'name';



//
// b.sort(function(x,y){
// if(x>y) {return 1;
// }else{
// return -1
// }
// }
// );
//
// console.log(b);

