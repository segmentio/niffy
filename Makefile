GREP ?=.

test: node_modules
	@rm -rf ./screenshots
	@node_modules/.bin/mocha --harmony --grep "$(GREP)"

node_modules: package.json
	@npm install

.PHONY: test
