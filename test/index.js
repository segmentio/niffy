/*jshint esnext:true*/

var debug = require('debug')('niffy:test');
var should = require('chai').should();
var Niffy = require('..');

describe('Segment App', function () {

  var basehost = 'https://www.google.com';
  var testhost = 'https://www.google.co.jp';
  var niffy;

  before(function () {
    niffy = new Niffy(basehost, testhost, { show: true });
  });

  after(function* () {
    yield niffy.end();
  });

  /**
   * Logged out.
   */

  describe('Logged Out', function () {

    it('/', function* () {
      yield niffy.test('/');
    });

    it('/news', function* () {
      yield niffy.test('/news');
    });
  });

});
