GREP ?=.

test: node_modules
	@rm -rf ./screenshots
	@node_modules/.bin/mocha --harmony --grep "$(GREP)"

clean: screenshots
		@rm -rf ./screenshots
		
node_modules: package.json
	@npm install

.PHONY: test
