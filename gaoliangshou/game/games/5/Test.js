var util = require("util");
var Enum = require("./Enum.js");
var Func = require("./Func.js");
// var Player = require("./Player.js").Player;
var HandCards = require("./Player.js").HandCards;

// function GetRandomNum(Min,Max)
// {
// var Range = Max - Min;
// var Rand = Math.random();
// return(Min + Math.round(Rand * Range));
// }


// console.log(Enum.validRoomRound(7));
// console.log(Enum.validEndPoint(20));
// console.log(Enum.validMaxLimit(3));
// console.log(Enum.validPlayMeThod1(3));
// console.log(Enum.validPlayMeThod2(3));
// console.log(Enum.validMaxLimit(3));

// console.log(isNaN(parseInt(2)));

// if(util.isNumber(arg);)
// var modScores = [1,1,2,1]
// // modScores = modScores || [0, 0, 1, 0];
// // console.log(modScores);
// // console.log(GetRandomNum(1,3));
// var set = [];

// for(var index in modScores){
// 	set.push(modScores[index]);
// }

// // set.push(modScores);
// // console.log(set);

// var a = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
// var b = a.splice(0,3)
// console.log(b);
// console.log(a);

// function getRandomArrayElements(arr, count) {
//     var shuffled = arr.slice(0), i = arr.length, min = i - count, temp, index;
//     while (i-- > min) {
//         index = Math.floor((i + 1) * Math.random());
//         temp = shuffled[index];
//         shuffled[index] = shuffled[i];
//         shuffled[i] = temp;
//     }
//     return shuffled.slice(min);
// }


// var items = ['1','2','4','5','6','7','8','9','10'];
// console.log( getRandomArrayElements(items, 4) );
// console.log( items);

// var player1Cards = [1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5,6];
// var player1Cards = [1, 2, 3, 7, 8, 9, 10, 10, 10, 11, 10, 12, 18,18];
// var player1Cards = [2, 2, 2, 5, 5, 5, 8, 8, 8, 11, 11, 11, 14,14];
// var player1Cards = [3, 3, 3, 2, 2, 2, 5, 6];
// var player1Cards = [1, 1, 9, 9, 10, 10, 18, 18, 19, 19, 27, 27, 1,1];
// var player1Cards = [1, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 9];
// var player1Cards = [10, 13, 14, 14, 14, 18, 25, 26, 27, 28, 19];
// var player1Cards = [2, 3, 4, 4, 6, 8, 11, 14, 15, 19, 20, 20, 26, 19];
// var player1Cards = [1, 2, 3, 14, 15, 22, 22, 24, 24, 24, 25, 26, 27, 28];
// var player1Cards = [15, 16, 17, 22, 22, 22, 23, 24, 25, 26, 27];
// var player1Cards = [5, 5, 10, 11, 19, 19, 24, 25, 28, 28, 26];
// var player1Cards = [13, 14, 15, 15, 26, 26, 27, 27, 27, 28, 28];
// var player1Cards = [2, 3, 3, 3, 13, 15, 17, 17, 28, 28, 28];
// var player1Cards = [6, 8, 12, 12, 15, 15, 20, 21, 25, 26, 28, 28, 28, 22];
// var player1Cards = [3, 4, 4, 5, 5, 6, 7, 7, 15, 15, 16, 16, 17, 28];
// var player1Cards = [16, 17, 18, 19, 19, 19, 4, 28]; //todo
// var player1Cards = [15, 16, 17, 22, 22, 22, 23, 24, 25, 26, 27]; //todo

// var player1Cards = [7, 8, 9, 13, 15, 26, 26, 28]; //todo
// var player1Cards = [2, 3, 4, 5, 5, 6, 6, 7, 7, 8, 8, 19, 21, 28]; //todo
// var player1Cards = [1, 2, 3, 4, 6, 10, 11, 12, 16, 5, 17, 18, 28, 16]; //todo
var player1Cards = [1, 2, 3, 4, 6, 10, 11, 12, 16, 16, 17, 18, 28, 16]; //todo
// var player1Cards = [1, 2, 3, 4, 6, 10, 11, 12, 5, 16, 15, 14, 28, 22]; //todo 红中当7不能胡
var h = new HandCards();
h.init(player1Cards);
// Func.isPinghu(h);
// console.log(h.isDaiYao());
// console.log(h.isJiangDui());
var result = Func.isPinghu(h);
// var result1 = Func.huPai(h);
console.log(result)
// console.log(result1)
// player1Cards.splice(0,1);
// player1Cards.slice()
// console.log(player1Cards)

