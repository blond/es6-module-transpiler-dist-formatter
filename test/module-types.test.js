var mock = require('mock-fs'),
    fs = require('fs'),
    vm = require('vm'),
    transpiler = require('es6-module-transpiler'),
    Container = transpiler.Container,
    FileResolver = transpiler.FileResolver,
    DistFormatter = require('../index.js'),
    ym = require('ym');

describe('module types', function () {
    var container,
        filename;

    beforeEach(function () {
        mock({
            fixtures: {
                'simple.js': 'export default "res";'
            }
        });

        container = new Container({
            resolvers: [new FileResolver(['fixtures/'])],
            formatter: new DistFormatter({ name: 'name' })
        });

        filename = [__dirname, 'dist.js'].join('/');

        container.getModule('simple');
        container.write(filename);
    });

    afterEach(function () {
        mock.restore();
    });

    it('must require module by Node.js', function () {
        require(filename).must.be('res');
    });

    it('must provide module to global var', function () {
        var code = fs.readFileSync(filename);

        vm.runInThisContext(code, filename);

        global.name.must.be('res');
    });

    it('must require module by ym', function (done) {
        var code = fs.readFileSync(filename),
            ctx = {
                modules: ym
            };

        vm.runInNewContext(code, ctx, filename);

        ctx.modules.require('name', function (res) {
            res.must.be('res');
            done();
        });
    });
});
