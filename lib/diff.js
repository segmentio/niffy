
var debug = require('debug')('niffy:diff');
var PNG = require('pngjs').PNG;
var fs = require('fs');
var thunkify = require('thunkify');

module.exports = diff;

/**
 * Diff two pngs into an img and stats.
 *
 * @param {String} pathA
 * @param {String} pathB
 * @param {String} pathDiff
 *
 * @returns {Object} stats
 */

function* diff(pathA, pathB, pathDiff) {

  debug('starting img diffing %s', new Date());

  var imgA = yield thunkify(readPNG)(pathA);
  var imgB = yield thunkify(readPNG)(pathB);

  debug('finished loading imgs %s', new Date());

  var stats = diffAnalyze(imgA, imgB);

  debug('finished analyzing imgs %s', new Date());

  var png = diffImg(imgA, imgB);

  debug('finished diffing imgs %s', new Date());

  yield thunkify(writePNG)(png, pathDiff);

  debug('finished img diffing %s', new Date());

  return stats;
}

/**
 * Read in a png file.
 *
 * @param {String} path
 * @param {Function} callback
 */

function readPNG(path, callback) {
  fs.createReadStream(path)
    .pipe(new PNG({
      filterType: 4
    }))
    .on('parsed', function() {
      callback(null, this);
    });
}

/**
 * write out a png file
 *
 * @param {PNG} png
 * @param {String} path
 */

function writePNG(png, path, callback) {
  png
    .pack()
    .pipe(fs.createWriteStream(path))
    .on('close', function() {
      callback(null, this);
    });
}

/**
 * diff two png images into a third img
 *
 * @param {PNG} imgA
 * @param {PNG} imgB
 *
 * @return {PNG} diff
 */

function diffImg(imgA, imgB) {
  var png = new PNG({
    filterType: 4,
    width: imgA.width,
    height: imgB.height
  });
  for (var y = 0; y < png.height; y++) {
    for (var x = 0; x < png.width; x++) {
      var idx = (png.width * y + x) << 2;

      if (
        imgA.data[idx  ] !== imgB.data[idx  ] ||
        imgA.data[idx+1] !== imgB.data[idx+1] ||
        imgA.data[idx+2] !== imgB.data[idx+2] ||
        imgA.data[idx+3] !== imgB.data[idx+3]
      ) {
        // color
        png.data[idx  ] = 0xff;
        png.data[idx+1] = (imgA.data[idx+1] + imgB.data[idx+1])/5;
        png.data[idx+2] = (imgA.data[idx+2] + imgB.data[idx+2])/5;

        // opacity
        png.data[idx+3] = 0xff;
      }
      else {
        // color
        png.data[idx  ] = imgA.data[idx  ];
        png.data[idx+1] = imgA.data[idx+1];
        png.data[idx+2] = imgA.data[idx+2];

        // opacity
        png.data[idx+3] = imgA.data[idx+3]/3;
      }
    }
  }
  return png;
}

/**
 * diff two images into an analysis
 *
 * @param {PNG} imgA
 * @param {PNG} imgB
 *
 * @return {Object} stats
 */

function diffAnalyze(imgA, imgB) {
  var stats = {
    total: 0,
    differences: 0
  };
  for (var i = 0; i < imgA.data.length; i++) {
    stats.total++;
    if (imgA.data[i] !== imgB.data[i]) stats.differences++;
  }
  return stats;
}
