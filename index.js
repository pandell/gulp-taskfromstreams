/*jslint node: true, vars: true, unparam: true, nomen: true */

"use strict";

var util = require("util");

var stream = require("readable-stream");

var globalBeepOnError = !!process.env.GULP_BEEPONERROR;


function Sink() {
    stream.Writable.call(this, { objectMode: true });
}

util.inherits(Sink, stream.Writable);

Sink.prototype._write = function (chunk, enc, cb) {
    return cb();
};


module.exports = function taskFromStreams(options, streamsProvider) {
    if (streamsProvider === undefined) {
        streamsProvider = options;
        options = undefined;
    }

    if (options && typeof streamsProvider !== "function") {
        streamsProvider = options.streamsProvider;
    }
    if (typeof streamsProvider !== "function") {
        throw new Error("Streams provider is required");
    }

    var beepOnError = (options && options.hasOwnProperty("beepOnError")
        ? options.beepOnError
        : globalBeepOnError);

    return function taskFromStreamsRun(cb) {
        // define error/success handlers
        var failed = false;
        function onError(err) {
            failed = true;
            if (beepOnError && process.stdout && process.stdout.isTTY) {
                process.stdout.write('\x07'); // system beep
            }
            return cb(err);
        }
        function onSuccess() {
            if (!failed) {
                return cb();
            }
        }

        // run provider to get streams
        var s;
        try {
            s = streamsProvider();
        } catch (e) {
            return onError(e);
        }

        // validate streams
        if (!Array.isArray(s) || s.length === 0) {
            return onError(new Error("Streams provider must return a non-empty array"));
        }

        // connect streams
        var lastStream, stream, i, l;
        for (i = 0, l = s.length; i < l; i += 1) {
            stream = s[i];
            if (!stream || !stream.on || !stream.pipe) {
                return onError(new Error("Invalid stream at position " + i));
            }

            stream.on("error", onError);
            if (lastStream) { lastStream.pipe(stream); }
            lastStream = stream;
        }

        // terminate stream pipe with a writable "sink";
        // this is to prevent buffering/back-pressure mechanism
        // in stream2 from kicking in and blocking task completion
        if (lastStream.readable) {
            var sink = new Sink();
            lastStream.pipe(sink);
            lastStream = sink;
        }

        // when the last stream is done, task is done too
        lastStream.on("finish", onSuccess);
    };
};
