/*jshint esversion: 6 */


const assert = require('assert');
const messageBuilder = require('../lib/database.js');

const movie = [
  {
  	name: "Dear John",
    releaseDate: "2010-06-22",
    genres: "romance drama",
    description: "يسرد الفيلم قصة حب جندي أمريكي وفتاة جامعية محافظة، ينقل لنا الفيلم لحظات حب جميلة ورسائل مفعمة بالأحاسيس بين الاثنين، لكن أحداث 11\9 تهدد استقرار العلاقة!"
  }
];

// describe('Array', function() {
// 	describe('#indexOf()', function() {
// 		it('should return -1 when the value is not present', function() {
// 			assert.equal(-1, [1, 2, 3].indexOf(4));
// 		});
// 	});
// });
