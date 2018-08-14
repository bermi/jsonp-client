BUILD_DEPS = $(wildcard lib/*.js)
TEST_DEPS = $(wildcard test/*.test.js)

test: FORCE
	@NODE_ENV=test \
		./node_modules/.bin/mocha \
		--reporter spec \
		$(TESTFLAGS)

test-coverage: test-clean-instrument test-instrument test-coverage-report

test-watch:
	@TESTFLAGS=--watch $(MAKE) test

test-browser:
	open test/browser.html

all: test build

lint: FORCE $(BUILD_DEPS) $(TEST_DEPS)
	./node_modules/.bin/eslint test/jsonp-client.test.js lib/*

clean: FORCE
	rm -rf dist/*

dist/jsonp-client.min.js: $(BUILD_DEPS)
	mkdir -p $(@D)
	./node_modules/.bin/uglifyjs $< > $@

build: clean lint dist/jsonp-client.min.js

FORCE: