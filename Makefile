GREP ?=.

test: node_modules
	@node_modules/.bin/mocha --harmony ./test/index.js

test/legacy: node_modules
	@node_modules/.bin/mocha --harmony ./test/indexLegacy.js

node_modules: package.json
	@npm install

.PHONY: test
