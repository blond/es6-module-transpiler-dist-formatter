var recast = require('recast'),
    types = recast.types,
    b = types.builders,
    utils = require('es6-module-transpiler/lib/utils'),
    IFFE = utils.IFFE,
    extend = utils.extend,
    sort = require('es6-module-transpiler/lib/sorting').sort,
    BundleFormatter = require('es6-module-transpiler/lib/formatters').bundle;

function DistFormatter(opts) {
    opts || (opts = {});

    this._name = opts.name || 'default';
    this._varname = opts.varname || (this._name.replace(/[_.-](\w|$)/g, function (_, x) {
        return x.toUpperCase();
    }));

    BundleFormatter.call(this);
}
extend(DistFormatter, BundleFormatter);

/**
 * @override
 */
DistFormatter.prototype.build = function (modules) {
    var code, main, exportId;

    modules = sort(modules);
    main = modules[modules.length - 1];
    exportId = main.id + 'default';

    code = [
        'var defineAsGlobal = true',
        '// Node.js',
        'if (typeof exports === \'object\') {',
        '    module.exports = ' + exportId + ';',
        '    defineAsGlobal = false;',
        '}',
        '',
        '// YModules',
        'if (typeof modules === \'object\') {',
        '    modules.define(\'' + this._name + '\', function (provide) {',
        '        provide(' + exportId + ');',
        '    });',
        '    defineAsGlobal = false;',
        '}',
        '',
        'defineAsGlobal && (global.' + this._varname + ' = ' + exportId + ');'
    ].join('\n');

    return [b.file(b.program([b.expressionStatement(IFFE(
        b.expressionStatement(b.literal('use strict')),
        this.buildNamespaceImportObjects(modules),
        modules.length === 1 ?
            modules[0].ast.program.body :
            modules.reduce(function (statements, mod) {
                return statements.concat(mod.ast.program.body);
            }, []),
        recast.parse(code).program.body
    ))]))];
};

module.exports = DistFormatter;
