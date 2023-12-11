"use strict";

var Mocha = require("mocha");
var path = require("path");
var fs = require("fs");
var _ = require("underscore");

var testsDir = path.resolve(__dirname, "tests");

const files = [
    '2.1.2.js',
    '2.1.3.js',
    '2.2.1.js',
    '2.2.2.js',
    '2.2.3.js',
    '2.2.4.js',
    '2.2.5.js',
    '2.2.6.js',
    '2.2.7.js',
    '2.3.1.js',
    '2.3.2.js',
    // '2.3.3.js',
    // '2.3.4.js',
]

function normalizeAdapter(adapter) {
    if (!adapter.resolved) {
        adapter.resolved = function (value) {
            var d = adapter.deferred();
            d.resolve(value);
            return d.promise;
        };
    }

    if (!adapter.rejected) {
        adapter.rejected = function (reason) {
            var d = adapter.deferred();
            d.reject(reason);
            return d.promise;
        };
    }
}

module.exports = function (adapter, mochaOpts, cb) {
    if (typeof mochaOpts === "function") {
        cb = mochaOpts;
        mochaOpts = {};
    }
    if (typeof cb !== "function") {
        cb = function () { };
    }

    normalizeAdapter(adapter);
    mochaOpts = _.defaults(mochaOpts, { timeout: 200, slow: Infinity });

    fs.readdir(testsDir, function (err, testFileNames) {
        if (err) {
            cb(err);
            return;
        }

        var mocha = new Mocha(mochaOpts);
        testFileNames.forEach(function (testFileName) {
            if (path.extname(testFileName) === ".js" && files.includes(testFileName)) {
                var testFilePath = path.resolve(testsDir, testFileName);
                mocha.addFile(testFilePath);
            }
        });

        global.adapter = adapter;
        mocha.run(function (failures) {
            delete global.adapter;
            if (failures > 0) {
                var err = new Error("Test suite failed with " + failures + " failures.");
                err.failures = failures;
                cb(err);
            } else {
                cb(null);
            }
        });
    });
};

module.exports.mocha = function (adapter) {
    normalizeAdapter(adapter);

    global.adapter = adapter;

    require("./testFiles");

    delete global.adapter;
};
