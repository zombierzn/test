var path = require('path');
var cf = require(path.join(__dirname, '..', 'lib', 'config.js'));
var ApiError = require('./ApiError');
var _ = require('lodash');
var BSON = require('mongodb').BSONPure;
var async = require('async');
var safe = require('safe');

function RestaurantApi(ctx) {
    this._ctx = ctx;
    this._sessions = {};
    this._config = {};
    this._api = {};
}

RestaurantApi.prototype.init = function (cb) {
    var self = this;
    self._config = cf();
    self._api.core = self._ctx.getModuleSync('core').api;
    cb();
};

module.exports.init = function (ctx, cb) {
    var api = new RestaurantApi(ctx);
    var m = {api:api};

    m.getModuleInfo = function (token, cb) {
        var i = {};
        i.url = '/restaurant/';
        i.id = 'restaurant';
        cb(null,i);
    };
    m.init2 = function (cb) {
        api.init(cb);
    };
    cb(null, m);
}