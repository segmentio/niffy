# niffy
Perceptual diffing suite for [Nightmare](github.com/segmentio/nightmare), built by [Segment](https://segment.com).

## Getting Started
You can look at [`test/index.js`](https://github.com/segmentio/niffy/blob/master/test/index.js) as an example for how to use Niffy. To run the example test just do `make test` after cloning this repo.

## Reference
Niffy is built on [Nightmare](github.com/segmentio/nightmare) and used in combination with [Mocha](https://mochajs.org/). You'll also need to read and use both of those library's APIs to use niffy effectively.

### Niffy(basehost, testhost[, options])
To create a new Niffy differ:

```js
let niffy = new Niffy(basehost, testhost, nightmareOptions);
```

* `basehost` is the url that is assumed "good"
* `testhost` is the url that you are comparing to the base
* `nightmareOptions` can be seen [here in the Nightmare docs](https://github.com/segmentio/nightmare#nightmareoptions)

### .test(url[, fn])
This method instructs niffy to go to a `url` (and optionally take additional actions like clicking, typing or checkboxing via the `fn` argument), and test `basehost` vs. `testhost` screenshots for pixel differences, and output the diff-highlight image. Typically you'll use `.test(url, fn)` in the body of a mocha test, like this:

```js
it('/news', function* () {
  yield niffy.test('/news');
});
```

### .goto(url[, fn])
This method instructs niffy to go to a `url` and optionally take additional actions like clicking, typing or checkboxing via the `fn` argument. Typically you'll use `.goto(url, fn)` in the `before` method of a mocha test suite, like this:

```js
before(function* () {
  yield niffy.goto('/logout', function* (nightmare) {
    yield nightmare
      .type('input[name="email"]', 'fake@faketestfaketest.com')
      .type('input[name="password"]', 'fakepassword')
      .click('button[type="submit"]');
  });
});
```

### .end()
This method closes the underlying Nightmare instance (e.g. freeing up memory). Typically you'll use `.end()` in the `after` method of a mocha test suite, like this:

```js
after(function* () {
  yield niffy.end();
});
```


## License (MIT)

```
WWWWWW||WWWWWW
 W W W||W W W
      ||
    ( OO )__________
     /  |           \
    /o o|    MIT     \
    \___/||_||__||_|| *
         || ||  || ||
        _||_|| _||_||
       (__|__|(__|__|
```
Copyright (c) 2017 Segment.io, Inc. friends@segment.com

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
