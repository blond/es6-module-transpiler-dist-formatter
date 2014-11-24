es6-module-transpiler-dist-formatter
====================================

[![NPM version](http://img.shields.io/npm/v/es6-module-transpiler-dist-formatter.svg?style=flat)](http://www.npmjs.org/package/es6-module-transpiler-dist-formatter) [![Build Status](http://img.shields.io/travis/andrewblond/es6-module-transpiler-dist-formatter/master.svg?style=flat)](https://travis-ci.org/andrewblond/es6-module-transpiler-dist-formatter) [![Coverage Status](https://img.shields.io/coveralls/andrewblond/es6-module-transpiler-dist-formatter.svg?branch=master&style=flat)](https://coveralls.io/r/andrewblond/es6-module-transpiler-dist-formatter) [![dependency Status](http://img.shields.io/david/andrewblond/es6-module-transpiler-dist-formatter.svg?style=flat)](https://david-dm.org/andrewblond/es6-module-transpiler-dist-formatter)

ES6 Module Transpiler Extension to Output Dist Bundle Format.

## Usage

### Build tools

Since this formatters is an plugin for [es6-module-transpiler], you can use it with any existing build tool that supports [es6-module-transpiler] as the underlaying engine to transpile the ES6 modules.

You just need to make sure that `es6-module-transpiler-dist-formatter` is accessible for those tools, and pass the proper `formatter` option thru the [es6-module-transpiler][] configuration.

### Executable

If you plan to use the `compile-module` CLI, the formatters can be used directly from the command line:

```
$ npm install es6-module-transpiler
$ npm install es6-module-transpiler-dist-formatter
$ ./node_modules/.bin/compile-modules convert -f es6-module-transpiler-dist-formatter path/to/**/*.js -o build/
```

__The `-f` option allow you to specify the path to the specific formatter, which is this case is an installed module called `es6-module-transpiler-dist-formatter`.__

### Library

You can also use the formatter with the transpiler as a library:

```javascript
var transpiler = require('es6-module-transpiler');
var DistFormatter = require('es6-module-transpiler-dist-formatter');
var Container = transpiler.Container;
var FileResolver = transpiler.FileResolver;

var container = new Container({
  resolvers: [new FileResolver(['lib/'])],
  formatter: new DistFormatter({ name: 'module-name' })
});

container.getModule('index');
container.write('out/mylib.js');
```

## Supported ES6 Module Syntax

Again, this syntax is in flux and is closely tracking the module work being done by TC39. This package relies on the syntax supported by [es6-module-transpiler], which relies on [esprima], you can have more information about the supported syntax here: https://github.com/square/es6-module-transpiler#supported-es6-module-syntax

[esprima]: https://github.com/ariya/esprima

## Compiled Output

First of all, the output format for `define()` might looks alien even for many developers, but considering that [es6-module-transpiler] relies on [Recast] to mutate the original ES6 code, it can output the corresponding [sourceMap], you should be able to debug the module code without having to understand the actual output format.

[sourceMap]: http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/
[Recast]: https://github.com/benjamn/recast

### Default export

For a module without imports, and a single default exports:

```js
export default function (a, b) {
    return a + b;
}
```

will produce something like this:

```js
(function() {
    "use strict";
    var index$$default = function (a, b) {
        return a + b;
    };
    var defineAsGlobal = true;

    // Node.js
    if (typeof exports === 'object') {
        module.exports = index$$default;
        defineAsGlobal = false;
    }

    // YModules
    if (typeof modules === 'object') {
        modules.define('module-name', function (provide) {
            provide(index$$default);
        });
        defineAsGlobal = false;
    }

    defineAsGlobal && (global.moduleName = index$$default);
}).call(this);
```
