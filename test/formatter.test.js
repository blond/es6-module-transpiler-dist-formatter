var mock = require('mock-fs'),
    fs = require('fs'),
    vm = require('vm'),
    transpiler = require('es6-module-transpiler'),
    Container = transpiler.Container,
    FileResolver = transpiler.FileResolver,
    DistFormatter = require('../index.js');

describe('formatter', function () {
    var container,
        filename;

    afterEach(function () {
        mock.restore();
    });

    it('must support CamelCase for global var', function () {
        mock({
            fixtures: {
                'simple.js': 'export default "res";'
            }
        });

        container = new Container({
            resolvers: [new FileResolver(['fixtures/'])],
            formatter: new DistFormatter({ name: 'two-word' })
        });

        filename = [__dirname, 'dist.js'].join('/');

        container.getModule('simple');
        container.write(filename);

        var code = fs.readFileSync(filename);

        vm.runInThisContext(code, filename);

        global.twoWord.must.be('res');
    });

    it('must use default module name', function () {
        mock({
            fixtures: {
                'simple.js': 'export default "res";'
            }
        });

        container = new Container({
            resolvers: [new FileResolver(['fixtures/'])],
            formatter: new DistFormatter()
        });

        filename = [__dirname, 'dist.js'].join('/');

        container.getModule('simple');
        container.write(filename);

        var code = fs.readFileSync(filename);

        vm.runInThisContext(code, filename);

        global.default.must.be('res');
    });

    it('must build bundle', function () {
        mock({
            fixtures: {
                '1.js': 'export default 1;',
                '2.js': 'export default 2;',
                'main.js': 'import r1 from \'./1.js\'; import r2 from \'./2.js\'; export default 1 + 2;'
            }
        });

        container = new Container({
            resolvers: [new FileResolver(['fixtures/'])],
            formatter: new DistFormatter()
        });

        filename = [__dirname, 'dist.js'].join('/');

        container.getModule('main');
        container.write(filename);

        var code = fs.readFileSync(filename);

        vm.runInThisContext(code, filename);

        global.default.must.be(3);
    });
});
