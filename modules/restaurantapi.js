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

RestaurantApi.prototype.getAll = function(token, cb){
    var self = this;
    var session = self._api.core.getSession(token);
    if (!session || !session.user)
        return cb(new ApiError('Wrong access token', ApiError.Subject.INVALID_TOKEN));
    var query = {deleted: {$exists: false}};

    if (session.user.role.val == 'manager' || session.user.role.val == 'operator') {
        query._id = BSON.ObjectID(session.user.restId.toString());
    }
    else if (session.user.role.val == 'admin'){

    }else{
        return cb(null, []);
    }

    async.waterfall([
        function(cb){
            self._ctx.collection("users", cb);
        },
        function(users, cb){
            users.find(query).toArray(cb);
        },
        function(res, cb){
            _.forEach(res, function(user){
                delete user.password;
                user.role = session.user.allRoles[user.role]
            });
            cb(null, res);
        }
    ], cb);
}

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