
jest.dontMock('../utils/util');

var util = require('../utils/util');

describe('util.type_check', function() {
 it('converts a number type of "2.5" to the float 2.5', function() {
   expect(util.type_check("2.5", "number")).toBe(2.5);
 });
});

describe('util.toggleInList', function() {
 it('removes "dog" from a short array', function() {
   var res = util.toggleInList(["dog","cat"], "dog");
   expect(res[0]).toBe("cat");
   expect(res.length).toBe(1);
 });
});

describe('util.transp_color', function() {
 it('adds transparency to a hex color string (with hash)', function() {
   var res = util.transp_color('#CCCCCC', 0.5);
   expect(res).toBe("#7FCCCCCC");
 });
 it('adds transparency to a hex color string (without hash)', function() {
   var res = util.transp_color('CCCCCC', 0.5);
   expect(res).toBe("#7FCCCCCC");
 });
});