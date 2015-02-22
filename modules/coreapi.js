var path = require('path');
var cf = require(path.join(__dirname, '..', 'lib', 'config.js'));
var _ = require('lodash');
var async = require('async');
var safe = require('safe');
var ApiError = require('./ApiError');

function CoreApi(ctx) {
    this._ctx = ctx;
    this._sessions = {};
    this._config = {};
    this._api = {};
}

CoreApi.prototype.init = function (cb) {
    var self = this;
    self._config = cf();
    self._api.group = self._ctx.getModuleSync('group').api;
    cb();
};

CoreApi.prototype.test = function(cb){
    return cb(new ApiError('Token de acesso incorreto', ApiError.Subject.ACCESS_DENIED));
}

module.exports.init = function (ctx, cb) {
    var api = new CoreApi(ctx);
    var m = {api:api};

    m.getModuleInfo = function (token, cb) {
        var i = {};
        i.url = '/core/';
        i.id = 'core';
        cb(null,i);
    };

    /*m.init2 = function (cb) {
        api.init(safe.sure(cb,function(){
            setInterval(function () {
                safe.yield(function () {
                    var self = api;
                    _.each(_.keys(self._sessions), function (k) {
                        if (!self._sessions[k] || !self._sessions[k].user || !self._sessions[k]._dtlastaccess) {
                            delete self._sessions[k];
                            return;
                        }
                        if (Date.now() - self._sessions[k]._dtlastaccess > 60*60*1000) { //15min
                            delete self._sessions[k];
                            return;
                        }
                    });
                });
            }, 60000); // each 1 min
            cb();
        }))
    }*/

    cb(null, m);
}