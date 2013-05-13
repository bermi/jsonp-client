(function (root) {
  "use strict";

  var expect = root.expect || require('expect.js'),
    jsonpClient,
    isNode = (typeof window === 'undefined'),
    baseLocation = isNode ? __dirname + '/' : root.baseLocation || '';

  if (isNode) {
    root.jsonpClient = "original";
    jsonpClient = require('../');
  } else {
    jsonpClient = root.jsonpClient;
  }

  describe('jsonpClient', function () {
    before(function () {});

    describe('No conflict', function () {
      it('should restore original jsonpClient', function () {
        var b = jsonpClient.noConflict(),
          currentVersion = b.noConflict();
        expect(currentVersion).to.be(b);
        expect(root.jsonpClient).to.be("original");
      });
    });

    describe("When fetching jsonp from " + (isNode ? "Node.js" : "a browser"), function () {
      var expected_one = {"one": "First"},
        expected_two = {"two": "Second"};

      it('should get a list of URLS', function (done) {
        jsonpClient(baseLocation + 'fixtures/one.js?callback=one', baseLocation + 'fixtures/two.js?callback=two', function (err, one, two) {
          if (err) { throw err; }
          expect(one).to.be.eql(expected_one);
          expect(two).to.be.eql(expected_two);
          done();
        });
      });
      it('should get an array of URLS', function (done) {
        jsonpClient([baseLocation + 'fixtures/one.js?callback=one', baseLocation + 'fixtures/two.js?callback=two'], function (err, one, two) {
          if (err) { throw err; }
          expect(one).to.be.eql(expected_one);
          expect(two).to.be.eql(expected_two);
          done();
        });
      });

      it('should fail when no callback is provided', function () {
        expect(function () {
          jsonpClient('foo');
        }).to.throwException(/jsonpClient expects a callback/);
      });

      if (!isNode) {
        it('should fail when no callback is included on the URL', function (done) {
          jsonpClient(baseLocation + 'fixtures/one.js', function (err, one, two) {
            expect(err).to.be.a(Error);
            done();
          });
        });
      }

      it('should fail when no file is found', function (done) {
        jsonpClient(baseLocation + 'error', function (err, one, two) {
          expect(err).to.be.a(Error);
          done();
        });
      });

    });

  });

}(this));