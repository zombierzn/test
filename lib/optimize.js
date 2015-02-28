var requirejs = require('requirejs');
var path = require('path');
var fs = require('fs');
var async = require('async');
var _ = require('lodash');
var cfg = require(path.join(__dirname, 'config.js'))();

module.exports.run = function(cb){
    var pBase = path.join('public', 'javascripts');
    var oBase = path.join('public', 'prod');
    var pagesDir = 'pages';

    console.log('start optimizing js files ...');
    console.time('done optimizing');

    var conf = {
        appDir: pBase,
        baseUrl: '.',
        mainConfigFile: path.join(pBase, 'main.js'),
        dir: oBase,
        removeCombined: true,
        findNestedDependencies: true,
        optimize: cfg.optimize.strategy,
        fileExclusionRegExp: /^hbs$/,
        modules: [{name: 'main'}]
    };

    async.waterfall([
        function(cb){
            fs.readdir(path.join(__dirname, '..', pBase, pagesDir), cb);
        },
        function(files, cb){
            _.forEach(files, function(file){
                conf.modules.push({
                    name: pagesDir + '/' + /(.+?)(\.[^.]*$|$)/.exec(file)[1],
                    exclude: ['main']
                });
            });
            requirejs.optimize(conf, function(res){
                console.log(res);
                console.timeEnd('done optimizing');
                cb();
            });
        }
    ], cb);
}