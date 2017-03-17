//
var util = require("util");
// var util = require("util");
// var Enum = require("./Enum.js");
// var Func = require("./Func.js");
// var Player = require("./Player.js").Player;
// var HandCards = require("./HandCards.js").HandCards;
//
// // function GetRandomNum(Min,Max)
// // {
// // var Range = Max - Min;
// // var Rand = Math.random();
// // return(Min + Math.round(Rand * Range));
// // }
//
//
// // console.log(Enum.validRoomRound(7));
// // console.log(Enum.validEndPoint(20));
// // console.log(Enum.validMaxLimit(3));
// // console.log(Enum.validPlayMeThod1(3));
// // console.log(Enum.validPlayMeThod2(3));
// // console.log(Enum.validMaxLimit(3));
//
// // console.log(isNaN(parseInt(2)));
//
// // if(util.isNumber(arg);)
// // var modScores = [1,1,2,1]
// // // modScores = modScores || [0, 0, 1, 0];
// // // console.log(modScores);
// // // console.log(GetRandomNum(1,3));
// // var set = [];
//
// // for(var index in modScores){
// // 	set.push(modScores[index]);
// // }
//
// // // set.push(modScores);
// // // console.log(set);
//
// // var a = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
// // var b = a.splice(0,3)
// // console.log(b);
// // console.log(a);
//
// // function getRandomArrayElements(arr, count) {
// //     var shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
// //     while (i-- > min) {
// //         index = Math.floor((i + 1) * Math.random());
// //         temp = shuffled[index];
// //         shuffled[index] = shuffled[i];
// //         shuffled[i] = temp;
// //     }
// //     return shuffled.slice(min);
// // }
//
//
// // var items = ['1','2','4','5','6','7','8','9','10'];
// // console.log( getRandomArrayElements(items, 4) );
// // console.log( items);
//
// // var player1Cards = [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5,6];
// // var player1Cards = [1, 2, 3, 7, 8, 9, 10, 10, 10, 11, 10, 12, 18,18];
// // var player1Cards = [2, 2, 2, 5, 5, 5, 8, 8, 8, 11, 11, 11, 14,14];
// // var player1Cards = [3, 3, 3, 2, 2, 2, 5, 6];
// // var player1Cards = [1, 1, 9, 9, 10, 10, 18, 18, 19, 19, 27, 27, 1,1];
// // var player1Cards = [1, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 9];
// // var player1Cards = [10, 13, 14, 14, 14, 18, 25, 26, 27, 28, 19];
// var player1Cards = [2, 3, 4, 4, 6, 8, 11, 14, 15, 19, 20, 20, 26, 19];
// // p = new Player();
// var h = new HandCards();
// h.init(player1Cards);
// Func.isPinghu(h);
// // console.log(h.isDaiYao());
// // console.log(h.isJiangDui());
// // Func.isPinghu(h);
//
// Array.prototype.indexOf = function (val) {
//     for (var i = 0; i < this.length; i++) {
//         if (typeof this[i] == 'object') {
//             if (this[i].value == val.value && this[i].type == val.type) return i;
//         } else {
//             if (this[i] == val) return i;
//         }
//     }
//     return -1;
// };
//
// Array.prototype.remove = function(val) {
//     var index = this.indexOf(val);
//     if (index > -1) {
//         this.splice(index, 1);
//     }
// };
//
//
// var card = []
//
// function gen(card) {
//     this.num = 52;
//     this.getIndex = 0;
//
//     // 原始牌组
//     var rawCards = [];
//     for (var iCard = 0; iCard < 2; ++iCard) {
//         rawCards.push({value: iCard + 1, type: 1});
//         rawCards.push({value: iCard + 1, type: 2});
//         // rawCards.push({value: iCard + 1, type: 3});
//         // rawCards.push({value: iCard + 1, type: 4});
//     }
//
//     while (rawCards.length > 0) {
//         var randomIndex = Math.floor(Math.random() * rawCards.length);
//         card.push(rawCards[randomIndex]);
//         rawCards.splice(randomIndex, 1);
//     }
// }
// gen(card);
//
// console.log(card)
//
// var a = {value: 1, type: 1}
//
// function contains(card) {
//     for(var index in card){
//         if(card[index].value == a.value && card[index].type==a.type){
//             return true;
//         }
//     }
//     return false;
// }
//
// card.slice(1,1,a);
//
// card.remove(a);
//
// console.log(card)
//
// for(var index in card){
//     console.log(card[index])
// }
//
// console.log(typeof card)
// console.log(contains(card))

function test1(a, b) {
    // b = []
    a.forEach(function (index) {
        b.push(index)
    })
    // b.slice(0, b.length)
    b.length = 0;
    test2(b)
}

function test2(x) {
    var c = [10, 11, 12];
    c.forEach(function (v) {
        x.push(v);
    })
}

var a = [1, 2, 3, 4, 5];
var b = [];
test1(a,b)

console.log(b)

