GREP ?=.

test: node_modules
	@node_modules/.bin/mocha --harmony ./test/index.js

test/simple: node_modules
	@node_modules/.bin/mocha --harmony ./test/indexSimple.js

node_modules: package.json
	@npm install

.PHONY: test
