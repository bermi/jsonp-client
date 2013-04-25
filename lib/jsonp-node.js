"use strict";

var httpClient = require('http-get'),
  vm = require('vm'),
  fs = require('fs'),
  evalJsonp,
  fetchRemoteJsonp,
  fetchUrl,
  fetchLocalJsonp;

// Creates a JavaScript VM in order to evaluate
// javascript from jsonp calls. This is expensive
// so make sure you cache the results
evalJsonp = function (javascript, callback) {
  javascript = (javascript || '') + '';
  var
    cb = function (err, json) {
      if (err) {
        err = new Error(err);
      }
      callback(err, json);
    },
    context = vm.createContext({
      context_callback: function (err, json) {
        cb(err, json);
      }
    }),
    callback_function_name = (javascript.match(/([\w\d_]*)\(/) || [null, false])[1],
    code = "function " + callback_function_name + " (data) { context_callback(null, data); } ";

  code = code + ' try { ' + javascript + ' } catch(e) { context_callback(e); } ';
  try {
    if (!callback_function_name) {
      throw new Error('Could not discover jsonp callback name on "' + javascript + '"');
    }
    vm.runInContext(code, context);
  } catch (e) {
    cb(e);
  }
};

// Fetches a URL and returns a buffer with the response
fetchUrl = function (url_to_fetch, callback) {
  httpClient.get({
    url: url_to_fetch,
    bufferType: "buffer"
  }, function (err, res) {
    if (err) {
      err = new Error('Could not fetch url ' + url_to_fetch + '. Got error: ' + err.message + '.');
    }
    callback(err, res && res.buffer);
  });
};

// Fetches a jsonp response from a remote service
// Make sure you cache the responses as this process
// creates a JavaScript VM to safely evaluate the javascript
fetchRemoteJsonp = function (remote_url, callback) {
  fetchUrl(remote_url, function (err, body) {
    if (err) {
      return callback(err);
    }
    try {
      evalJsonp(body.toString(), function (err, json) {
        callback(err, json);
      });
    } catch (e) {
      callback(e);
    }
  });
};

// Retrieves a local file and evaluates the JSON script on a JS VM
fetchLocalJsonp = function (file_path, callback) {
  file_path = file_path.split('?')[0];
  fs.readFile(file_path, function (err, jsonp) {
    if (err) { return callback(err); }
    evalJsonp(jsonp, callback);
  });
};

module.exports = function (jsonp_path_or_url, callback) {
  if (jsonp_path_or_url.match(/^http/)) {
    fetchRemoteJsonp(jsonp_path_or_url, callback);
  } else {
    fetchLocalJsonp(jsonp_path_or_url, callback);
  }
};
