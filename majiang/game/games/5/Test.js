
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
// var player1Cards = [12,15,1];
// var player1Cards = [1, 1, 1, 2, 3, 4, 5, 6, 7, 8, 8, 9, 9, 9];
// var player1Cards = [1, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 9, 9, 9];

// var player1Cards = [1, 1, 9, 9, 10, 10, 18, 18, 19, 19, 27, 27, 1, 1];
// var player1Cards = [10, 10, 12, 13, 14, 15, 16, 17, 19, 19, 19, 9, 9, 9];
// var player1Cards = [11, 11, 11, 12, 12, 12, 13, 13, 14, 14, 1, 1, 1, 13];
var player1Cards = [3, 3, 3, 4, 5, 6, 7, 8, 9, 9, 9];
// p = new Player();
var h = new HandCards();
h.init(player1Cards);
// var re = h.isSameKind(player1Cards);
var t = Func.isPinghu(h)
console.log(t)
console.log(Func.isPinghu(h) != null)

var gangScore = 0 ;

gangScore += Enum.GangTypeMuti[Enum.GangType.ZHI_GANG] * 1;
console.log(gangScore)

var a = {};
var b = 12
a[1] = 1;
if (!a.hasOwnProperty(1)) {
    a[1] = b;
} else {
    a[1] += b;
}

// a[1] += b
console.log(a)

var c = 12;
if(!isNaN(c)){
    console.log('helloworld')
}else {
    console.log('hahhaha')
}

var a = Enum.GangTypeMuti[Enum.GangType.ZHI_GANG]
console.log(a)

//
// var xy  =  1;
// if(xy){
//     console.log('True')
// }else {
//     console.log('False')
// }

// xy <<= 0;
// console.log(xy)

var t = 1;
var j = parseInt(Math.log(t) / Math.log(2));
console.log(j)

var j = 1;
j <<= 1;
console.log(j)


// console.log(isNaN(c))

// Func.isPinghu(h);
// console.log(h.isDaiYao());
// console.log(h.isJiangDui());
// Func.isPinghu(h);


// detail =[1:2,2:3,3:4]

// detail.forEach(function (p){
// 	console.log(p);

// }).bind(this);


// var ary = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
// var newary=ary.slice(2, 4);//newary=[1,2]，不包括下标2 所对应的元素3。
//
// console.log(newary);













// function hello(x) {
// 	player1Cards.forEach(function(card){
// 	if(card == 6){
// 		return;
// 	}
// 	console.log(card);
// 	return;
// 	});

// 	console.log('helloworld!');
// }


// hello(123);