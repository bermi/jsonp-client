BUILD_DEPS = $(wildcard lib/*.js)
TEST_DEPS = $(wildcard test/*.test.js)

test:
	@NODE_ENV=test \
		./node_modules/.bin/mocha \
		--reporter spec \
		$(TESTFLAGS)

test-coverage-report:
	echo "Generating coverage report, please stand by"
	test -d node_modules/nyc/ || npm install nyc
	./node_modules/.bin/nyc ./node_modules/.bin/mocha && \
	./node_modules/.bin/nyc report --reporter=html
	open coverage/jsonp-node.js.html

test-coverage: test-clean-instrument test-instrument test-coverage-report

test-watch:
	@TESTFLAGS=--watch $(MAKE) test

test-browser:
	open test/browser.html

all: test build

lint: $(BUILD_DEPS) $(TEST_DEPS)
	./node_modules/.bin/eslint test/jsonp-client.test.js lib/*

dist/jsonp-client.min.js: $(BUILD_DEPS)
	./node_modules/.bin/uglifyjs $< > $@

build: lint dist/jsonp-client.min.js

docclean:
	rm -f docs/*.{1,html}


clean: docclean test-clean-instrument

.PHONY: test build lint test-cov docclean dev