/*jshint esnext:true*/

var debug = require('debug')('niffy');
var Nightmare = require('nightmare');
var mkdirp = require('mkdirp');
var fs = require('fs');
var thunkify = require('thunkify');
var defaults = require('defaults');
var sprintf = require('sprintf-js').sprintf;
var diff = require('./lib/diff');
var path = require('path');

function* timeout(ms) {
  var to = function (ms, cb) {
    setTimeout(function () { cb(null); }, ms);
  };
  yield thunkify(to)(ms);
}

class Niffy
{
  /**
   * capture a specific url after optionally taking some actions.
   *
   * @param {String} pngPath
   * @param {Function} fn
   */
  * capture(pngPath, fn) {

    /**
     * Capture the screenshots.
     */

    yield this.captureHost('base', this.basehost, pngPath, fn);
    yield this.captureHost('test', this.testhost, pngPath, fn);

    /**
     * Run the diff calculation.
     */

    this.startProfile('diff');
    var pathA = this.imgfilepath('base', pngPath);
    var pathB = this.imgfilepath('test', pngPath);
    var pathDiff = this.imgfilepath('diff', pngPath);
    var result = yield diff(pathA, pathB, pathDiff);
    this.stopProfile('diff');

    /**
     * Prep the results.
     */

    result.percentage = result.differences / result.total * 100;
    result.diffFilepath = this.imgfilepath('diff', pngPath);
    return result;
  }


  /**
   * capture for a specific host name + host, and optionally take some actions.
   *
   * @param {String} name
   * @param {String} host
   * @param {String} pngPath
   * @param {Function} fn
   */
  * captureHost(name, host, pngPath, fn) {

    this.startProfile('goto');
    yield this.gotoHost(host, pngPath, fn);
    this.stopProfile('goto');

    this.startProfile('capture');
    yield this.nightmare.wait(1000).screenshot(this.imgfilepath(name, pngPath));
    this.stopProfile('capture');
    yield timeout(250);
  }


  /**
   * Initialize `Nightmare`
   *
   * @param {String} base
   * @param {String} test
   * @param {Object} options
   */
  constructor(base, test, options) {
    options = defaults(options, { show: false, width: 1400, height: 1000, threshold: .2, pngPath: path.resolve(process.cwd(), './niffy') });
    this.nightmare = new Nightmare(options);
    this.pngPath = options.pngPath;
    this.basehost = base;
    this.testhost = test;
    this.starts = {};
    this.profiles = {};
    this.errorThreshold = options.threshold;
  }


  /**
   * End the capture session.
   */
  * end() {
    yield this.nightmare.end();

    debug(
      'profile\n\tgoto %s\n\tcapture %s\n\tdiff %s',
      this.profiles.goto,
      this.profiles.capture,
      this.profiles.diff
    );
  }


  /**
   * goto a specific path and optionally take some actions.
   *
   * @param {String} pngPath
   * @param {Function} fn
   */
  * goto(url, fn) {
    this.startProfile('goto');
    yield this.gotoHost(this.basehost, url, fn);
    yield this.gotoHost(this.testhost, url, fn);
    this.stopProfile('goto');
  }


  /**
   * goto for a specific host, optionally take some actions.
   *
   * @param {String} host
   * @param {String} url
   * @param {Function} fn
   */
  * gotoHost(host, url, fn) {
      yield this.nightmare.goto(host + url);
      if (fn) {
        yield timeout(1000);
        yield fn(this.nightmare);
        yield timeout(1000);
      }
  }


  /**
   * Utils
   */
  imgfilepath(name, pngPath) {
    var filepath = this.pngPath + pngPath;
    if (filepath.slice(-1) !== '/') filepath += '/';
    if (filepath[0] === '.') {
      filepath = path.join( __dirname, filepath.slice(1));
    }
    mkdirp(filepath, function (err) {
      if (err) console.error(err.toString());
    });
    return (filepath + name + '.png');
  }


  /**
   * Mark an execution start time.
   *
   * @param {String} name
   */
  startProfile(name) {
    var start = new Date().getTime();
    this.starts[name] = start;
  }


  /**
   * Mark an execution stop time.
   *
   * @param {String} name
   */
  stopProfile(name) {
    var end = new Date().getTime();
    if (!this.starts[name]) return;
    if (this.profiles[name]) this.profiles[name] += (end - this.starts[name]);
    else this.profiles[name] = (end - this.starts[name]);
  }


  /**
  * Generate a test function.
  *
  * @param {String} url
  * @param {Function} fn
  */
  * test(url, fn) {
    console.log(url)
    var diff = yield this.capture(url, fn);
    var pct = '' + Math.floor(diff.percentage * 10000) / 10000 + '%';
    var failMessage = sprintf('%s different, open %s', pct, diff.diffFilepath);
    var absolutePct = Math.abs(diff.percentage);
    if (diff.percentage > this.errorThreshold) {
      throw new Error(failMessage);
    }
  }
}


/**
 * Export `Niffy`
 */
module.exports = Niffy;
