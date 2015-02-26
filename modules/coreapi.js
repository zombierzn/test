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
    cb();
};

CoreApi.prototype.sessionRefreshTouch = function(token){
    var self = this;
    var session = self.getSession(token);
    if (session)
        session._dtlastaccess = Date.now();

    self.setSession(token, session);
}

CoreApi.prototype.getSession = function(token){
    return this._sessions[token];
}
CoreApi.prototype.setSession = function(token, session){
    this._sessions[token] = session;
}

CoreApi.prototype.getApiToken = function (appId, clientId, signature, cb) {
    var self = this;
    // 1st steep, check that appId+clientId are correct (signature matches)
    // this will later also check that app is known and so on
    var apiToken = null;
    var user;

    async.waterfall([
        // generate unique id
        function (cb) {
            async.whilst(
                function () {
                    return apiToken == null || self.getSession(apiToken) != null;
                },
                function (cb) {
                    self._ctx.getRandomString(128, safe.sure(cb, function (rnd) {
                        apiToken = rnd;
                        cb();
                    }))
                },
                cb);
        },
    ], safe.sure(cb, function () {
        var session = {clientId:clientId, appId:appId, user : {}, regRoles:[]};
        self.setSession(apiToken,session);
        cb(null, {newToken:apiToken});
    }));
}

CoreApi.prototype.checkToken = function (token, cb) {
    var self = this;
    var session = self.getSession(token);
    if (!session)
        return cb(new ApiError('Wrong access token',ApiError.Subject.INVALID_TOKEN));
    cb();
}

CoreApi.prototype.getUser = function (token, cb) {
    var self = this;
    var session = self.getSession(token);
    if (!session)
        return cb(new ApiError('Wrong access token', ApiError.Subject.INVALID_TOKEN));
    cb(null, session.user);
}

CoreApi.prototype.authenticate = function (token, login, password, cb) {
    var self = this;
    var session = self.getSession(token);
    if (!session)
        return cb(new ApiError('Wrong access token', ApiError.Subject.INVALID_TOKEN));

    if (session.user && session.user.loggedin)
        return cb(new ApiError('Вы уже вошли в систему', ApiError.Subject.ALREADY_LOGGED));
    login = login.toString().trim();

    safe.run(function (cb) {
        self._ctx.collection("users", safe.sure(cb, function(users) {
            users.findOne({login:login.toLowerCase(), password:password, deleted: {$exists: false}}, safe.sure(cb, function (user) {
                if (!user)
                    return cb(new ApiError(('Логин или пароль введены неверно'), ApiError.Subject.INVALID_DATA));

                user.regRoles = [];
                var admin = {
                    val: "admin",
                    text: "Администратор"
                };
                var manager = {
                    val:"manager",
                    text:"Менеджер"
                };
                var operator = {
                    val:"operator",
                    text:"Оператор"
                };
                user.allRoles = {
                    "admin": admin,
                    "manager": manager,
                    "operator": operator
                };
                if (user.role == 'admin')
                    user.regRoles.push(admin, manager, operator);
                else if (user.role == 'manager')
                    user.regRoles.push(operator);
                user.role = user.allRoles[user.role];
                session.user = user;
                self.setSession(token, session);
                cb(null, user);
            }))
        }))
    }, safe.sure_result(cb, function (user) {
        return user;
    }))
};

CoreApi.prototype.logout = function (token, cb) {
    var self = this;
    var session = self.getSession(token);
    if (!session)
        return cb(new ApiError('Token de acesso incorreto', ApiError.Subject.INVALID_TOKEN));
    self.setSession(token, null);
    cb();
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

    m.init2 = function (cb) {
        api.init(safe.sure(cb,function() {
            setInterval(function () {
                safe.yield(function () {
                    var self = api;
                    _.each(_.keys(self._sessions), function (k) {
                        if (!self._sessions[k] || !self._sessions[k].user || !self._sessions[k]._dtlastaccess) {
                            delete self._sessions[k];
                            return;
                        }
                        if (Date.now() - self._sessions[k]._dtlastaccess > 60 * 60 * 1000) { //15min
                            delete self._sessions[k];
                        }
                    });
                });
            }, 60000); // each 1 min
            cb();
        }));
    }

    cb(null, m);
}