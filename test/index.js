/*jshint esnext:true*/

var debug = require('debug')('niffy:test');
var should = require('chai').should();
var Niffy = require('..');

describe('Google', function () {
  var niffy

  before(function () {
    niffy = new Niffy(
      'https://google.com',
      'https://google.co.jp',
      { show: true }
    )
  })

  it('Homepage', function* () {
    yield niffy.test('/')
  })

  it('Services', function* () {
    yield niffy.test('/services')
  })

  after(function* () {
    yield niffy.end()
  })
})
