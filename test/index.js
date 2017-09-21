/*jshint esnext:true*/

var debug = require('debug')('niffy:test');
var Niffy = require('..');

describe('Google', function () {
    new Niffy(
    'https://google.com',
    'https://google.co.jp',
    {
      show: true,
      targets: {
        small: [100,200],
        big: [1000,2000]
      }
    }, ( niffy, size ) => {

    const { label, width, height } = size;

    describe(`${label} : ${width} x ${height}`, () => {

      before(function* () {);
        yield niffy.wait(100); // example
      });

      it('Homepage', function* () {
        yield niffy.test('/');
      })

      it('Services', function* () {
        yield niffy.test('/services');
      })

      after(function* () {
        yield niffy.end();
      })
    });
  });
});
