/*jshint esnext:true*/

var debug = require('debug')('niffy');
var Nightmare = require('nightmare');
var mkdirp = require('mkdirp');
var fs = require('fs');
var thunkify = require('thunkify');
var defaults = require('defaults');
var sprintf = require('sprintf-js').sprintf;
var diff = require('./lib/diff');

/**
 * Export `Niffy`
 */

module.exports = Niffy;

/**
 * Initialize `Nightmare`
 *
 * @param {String} base
 * @param {String} test
 * @param {Object} options
 */

function Niffy(base, test, options) {
  if (!(this instanceof Niffy)) return new Niffy(base, test, options);
  options = defaults(options, { show: false, width: 1400, height: 1000, threshold: .2 });
  this.nightmare = new Nightmare(options);
  this.basehost = base;
  this.testhost = test;
  this.starts = {};
  this.profiles = {};
  this.errorThreshold = options.threshold;
}

/**
 * Generate a test function.
 *
 * @param {String} path
 * @param {Function} fn
 */

Niffy.prototype.test = function* (path, fn) {
  var diff = yield this.capture(path, fn);
  var pct = '' + Math.floor(diff.percentage * 10000) / 10000 + '%';
  var failMessage = sprintf('%s different, open %s', pct, diff.diffFilepath);
  var absolutePct = Math.abs(diff.percentage);
  if (diff.percentage > this.errorThreshold) {
    throw new Error(failMessage);
  }
};

/**
 * goto a specific path and optionally take some actions.
 *
 * @param {String} path
 * @param {Function} fn
 */

Niffy.prototype.goto = function* (path, fn) {
  this.startProfile('goto');
  yield this.gotoHost(this.basehost, path, fn);
  yield this.gotoHost(this.testhost, path, fn);
  this.stopProfile('goto');
};

/**
 * goto for a specific host, optionally take some actions.
 *
 * @param {String} host
 * @param {String} path
 * @param {Function} fn
 */

Niffy.prototype.gotoHost = function* (host, path, fn) {
  yield this.nightmare.goto(host + path);
  if (fn) {
    yield timeout(1000);
    yield fn(this.nightmare);
    yield timeout(1000);
  }
};

/**
 * capture a specific path after optionally taking some actions.
 *
 * @param {String} path
 * @param {Function} fn
 */

Niffy.prototype.capture = function* (path, fn) {

  /**
   * Capture the screenshots.
   */

  yield this.captureHost('base', this.basehost, path, fn);
  yield this.captureHost('test', this.testhost, path, fn);

  /**
   * Run the diff calculation.
   */

  this.startProfile('diff');
  var pathA = imgfilepath('base', path);
  var pathB = imgfilepath('test', path);
  var pathDiff = imgfilepath('diff', path);
  var result = yield diff(pathA, pathB, pathDiff);
  this.stopProfile('diff');

  /**
   * Prep the results.
   */

  result.percentage = result.differences / result.total * 100;
  result.diffFilepath = imgfilepath('diff', path);
  return result;
};

/**
 * capture for a specific host name + host, and optionally take some actions.
 *
 * @param {String} name
 * @param {String} host
 * @param {String} path
 * @param {Function} fn
 */

Niffy.prototype.captureHost = function* (name, host, path, fn) {

  this.startProfile('goto');
  yield this.gotoHost(host, path, fn);
  this.stopProfile('goto');

  this.startProfile('capture');

  this.nightmare.options.height = yield this.nightmare.evaluate(function() {
    return document.body.scrollHeight;
  });

  yield this.nightmare
    .viewport(this.nightmare.options.width, this.nightmare.options.height)
    .wait(1000)
    .screenshot(imgfilepath(name, path))
    // reset viewport to a smaller one, otherwise the next page will have
    // a wrong calulcation of document.body.scrollHeight
    .viewport(this.nightmare.options.width, 600);

  this.stopProfile('capture');
  yield timeout(250);
};

/**
 * End the capture session.
 */

Niffy.prototype.end = function* () {
  yield this.nightmare.end();

  debug(
    'profile\n\tgoto %s\n\tcapture %s\n\tdiff %s',
    this.profiles.goto,
    this.profiles.capture,
    this.profiles.diff
  );
};

/**
 * Mark an execution start time.
 *
 * @param {String} name
 */

Niffy.prototype.startProfile = function (name) {
  var start = new Date().getTime();
  this.starts[name] = start;
};

/**
 * Mark an execution stop time.
 *
 * @param {String} name
 */

Niffy.prototype.stopProfile = function (name) {
  var end = new Date().getTime();
  if (!this.starts[name]) return;
  if (this.profiles[name]) this.profiles[name] += (end - this.starts[name]);
  else this.profiles[name] = (end - this.starts[name]);
};

/**
 * Utils
 */

function imgfilepath(name, path) {
  var filepath = '/tmp/niffy' + path;
  if (filepath.slice(-1) !== '/') filepath += '/';
  mkdirp(filepath);
  return (filepath + name + '.png');
}

function* timeout(ms) {
  var to = function (ms, cb) {
    setTimeout(function () { cb(null); }, ms);
  };
  yield thunkify(to)(ms);
}
