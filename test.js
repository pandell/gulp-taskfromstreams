/*jslint node: true, vars: true, unparam: true */
/*global describe: true, it: true */

"use strict";

var assert = require("assert");

var concat = require("concat-stream");
var given = require("mocha-testdata");
var gulp = require("gulp");
var through = require("through2");

var taskFromStreams = require("./");

describe("taskFromStreams", function () {

    given(undefined, null, {}, [[]]).it("requires valid streams provider", function (o) {
        assert.throws(
            function () { taskFromStreams(o); },
            "Streams provider is required"
        );
    });

    it("catches streams provider errors", function (cb) {
        var task = taskFromStreams({ beepOnError: false }, function () { throw new Error("Streams provider error"); });
        assert.strictEqual("function", typeof task);

        task(function (err) {
            assert(err);
            assert.strictEqual("Streams provider error", err.message);
            cb();
        });
    });

    given.async(undefined, null, {}, [[]]).it("rejects invalid streams provider results", function (cb, o) {
        var task = taskFromStreams({ beepOnError: false }, function () { return o; });
        assert.strictEqual("function", typeof task);

        task(function (err) {
            assert(err);
            assert.strictEqual("Streams provider must return a non-empty array", err.message);
            cb();
        });
    });

    it("rejects invalid streams", function (cb) {
        var task = taskFromStreams({ beepOnError: false }, function () { return [1]; });
        assert.strictEqual("function", typeof task);

        task(function (err) {
            assert(err);
            assert.strictEqual("Invalid stream at position 0", err.message);
            cb();
        });
    });

    it("pipes all specified streams together", function (cb) {
        var files = null;
        var task = taskFromStreams(function () {
            return [
                gulp.src("*.json"),
                concat(function (f) { files = f; })
            ];
        });
        assert.strictEqual("function", typeof task);

        task(function (err) {
            assert(!err);
            assert(files);
            assert.strictEqual(1, files.length);
            cb();
        });
    });

    it("works with many files", function (cb) {
        var count = 0;
        var task = taskFromStreams(function () {
            return [
                gulp.src("node_modules/gulp-mocha/**/*.js"),
                through.obj(function (file, enc, cb2) { count += 1; return cb2(null, file); })
            ];
        });

        task(function (err) {
            assert(!err);
            assert(count > 40);
            cb();
        });
    });

});
