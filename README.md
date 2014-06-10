# [gulp](http://gulpjs.com/)-taskfromstreams [![Build Status](https://travis-ci.org/pandell/gulp-taskfromstreams.svg?branch=master)](https://travis-ci.org/pandell/gulp-taskfromstreams) [![devDependencies Status](https://david-dm.org/pandell/gulp-taskfromstreams/dev-status.svg)](https://david-dm.org/pandell/gulp-taskfromstreams#info=devDependencies)

> Forward stream errors to a task

[Git repository](https://github.com/pandell/gulp-taskfromstreams)

[Changelog](https://github.com/pandell/gulp-taskfromstreams/releases)

Defines a utility function that can be used to wrap a sequence of gulp steps to ensure that any error will result in a task failure and not a hang or a crash.


## Install

```sh
$ npm install --save-dev gulp-taskfromstreams
```


## Usage

```js
var gulp = require('gulp');
var jslint = require('gulp-jslint-simple');
var taskFromStreams = require('gulp-taskfromstreams');

gulp.task('lint', taskFromStreams(function () {
    return [
        gulp.src('*.js'),
        jslint.run(),
        jslint.report(emitErrorAtEnd: true)
    ];
});
```


## API

Assuming:

```js
var taskFromStreams = require('gulp-taskfromstreams');
```

### `taskFromStreams([options], streamsProvider)`

Takes a function that generates an array of streams (`streamsProvider`) and produces an orchestrator-compatible task function. Each stream in the resulting array is piped into the next while any errors in any stream will result in a failed task.

#### options

_Type_: Object  
_Default_: no options

Options that customize behaviour of `taskFromStreams` function.

#### options.beepOnError

_Type_: Boolean  
_Default_: use global setting

When truthy, every time `taskFromStreams` function detects a stream error, it will play system _"beep"_ sound. This audible feedback is useful (for example) when running a watch task whose window is hidden behind other windows.

If not specified, global setting will be used. If an environment variable `GULP_BEEPONERROR` is defined and has truthy value, system _"beep"_ sound will be played, no sound will be played otherwise.

#### options.streamsProvider

_Type_: Function  
_Default_: use `streamsProvider` parameter

Alternative way of passing `streamsProvider` function to `taskFromStreams`. If both `streamsProvider` parameter and `options.streamsProvider` are specified, parameter will be used.

#### streamsProvider

_Type_: Function  
_Default_: no default, required

A function that will be called to determine streams that make up the task. Must return non-empty array. Each item in the array must be a valid stream. All the streams will be piped together (e.g. if an array `[s1, s2, s3,..., sN]` is returned, equivalent of `s1.pipe(s2).pipe(s3). ... .pipe(sN)` will be performed).


## Contributing

1. Clone git repository

2. `npm install` (will install dev dependencies needed by the next step)

3. `npm start` (will start a file system watcher that will re-lint JavaScript and JSON files + re-run all tests when change is detected)

4. Make changes, don't forget to add tests, submit a pull request.


## License

MIT © [Pandell Technology](http://pandell.com/)
