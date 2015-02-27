var path = require('path');
var cf = require(path.join(__dirname, '..', 'lib', 'config.js'));
var ApiError = require('./ApiError');
var _ = require('lodash');
var BSON = require('mongodb').BSONPure;
var async = require('async');
var safe = require('safe');

function UserApi(ctx) {
    this._ctx = ctx;
    this._sessions = {};
    this._config = {};
    this._api = {};
}

UserApi.prototype.init = function (cb) {
    var self = this;
    self._config = cf();
    self._api.core = self._ctx.getModuleSync('core').api;
    cb();
};

UserApi.prototype.register = function(token, user, cb){
    var self = this;
    var session = self._api.core.getSession(token);
    if (!session || !session.user)
        return cb(new ApiError('Wrong access token', ApiError.Subject.INVALID_TOKEN));
    if (!user || !user.login ||!_.isString(user.login) || !user.password || !_.isString(user.password) || !user.restId || !user.name || !_.isString(user.name) || !user.role)
        return cb(new ApiError('Незаполнены обязательны поля', ApiError.Subject.INVALID_DATA));
    if (user.password.length < 5)
        return cb(new ApiError('Разрешены пароли > 5 символов', ApiError.Subject.INVALID_DATA));
    if (!session.user.allRoles[user.role] || !_.includes(session.user.regRoles, session.user.allRoles[user.role]) /*|| !session.user.allRests[user.restId]*/)
        return cb(new ApiError('Недостаточно прав', ApiError.Subject.ACCESS_DENIED));

    var toAdd = {
        login: user.login.toLowerCase(),
        password: user.password,
        name: user.name,
        role: user.role,
        restId: BSON.ObjectID(user.restId)
    };
    if (user.phone && _.isString(user.phone))
        toAdd.phone = user.phone;
    if (user.email && _.isString(user.email))
        toAdd.email = user.email;
    if (user.extra && _.isString(user.extra))
        toAdd.extra = user.extra;
    var users;
    async.waterfall([
        function(cb){
            self._ctx.collection("users", cb);
        },
        function(_users, cb){
            users = _users;
            users.findOne({login: toAdd.login}, cb);
        },
        function(res, cb){
            if (res)
              return cb(new ApiError('Пользователь с таким логином уже существует', ApiError.Subject.DUPLICATE_DATA));
              users.insert(toAdd, safe.sure(cb, function(){cb()}));
            cb();
        }
    ], cb)
}

UserApi.prototype.getUsers = function(token, cb){
    var self = this;
    var session = self._api.core.getSession(token);
    if (!session || !session.user)
        return cb(new ApiError('Wrong access token', ApiError.Subject.INVALID_TOKEN));
    var query = {deleted: {$exists: false}};

    if (session.user.role.val == 'manager' || session.user.role.val == 'operator') {
        query.restId = session.user.restId;
        query.role = {$ne: 'admin'};
        query.restId = session.user.restId;
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

UserApi.prototype.deleteUser = function(token, userId, cb) {
    var self = this;
    var session = self._api.core.getSession(token);
    if (!session || !session.user)
        return cb(new ApiError('Wrong access token', ApiError.Subject.INVALID_TOKEN));
    if (!userId)
        return cb(new ApiError('Указаны не все данные', ApiError.Subject.INVALID_DATA));
    self._ctx.collection("users", safe.sure(cb, function (users) {
        users.findOne({_id: BSON.ObjectID(userId), deleted: {$exists: false}}, safe.sure(cb, function (user) {
            if (!user)
                return cb(new ApiError('Пользователь не найден', ApiError.Subject.NOT_FOUND));
            if (!session.user.allRoles[user.role] || !_.includes(session.user.regRoles, session.user.allRoles[user.role]) /*|| !session.user.allRests[user.restId]*/)
                return cb(new ApiError('Недостаточно прав', ApiError.Subject.ACCESS_DENIED));
            users.update({_id: user._id}, {$set: {deleted: true}}, safe.sure(cb, function(){cb()}));
        }));
    }));
}

UserApi.prototype.changePassword = function(token, userId, oldPwd, newPwd, cb){
    var self = this;
    var session = self._api.core.getSession(token);
    if (!session || !session.user)
        return cb(new ApiError('Wrong access token', ApiError.Subject.INVALID_TOKEN));
    if (!oldPwd || !newPwd || !userId)
        return cb(new ApiError('Указаны не все данные', ApiError.Subject.INVALID_DATA));
    if (newPwd.length < 5)
        return cb(new ApiError('Разрешены пароли > 5 символов', ApiError.Subject.INVALID_DATA));
    if (oldPwd.toString() == newPwd.toString())
        return cb();
    self._ctx.collection("users", safe.sure(cb, function(users){
        users.findOne({_id: BSON.ObjectID(userId), deleted: {$exists: false}}, safe.sure(cb, function(user){
            if (!user)
                return cb(new ApiError('Пользователь не найден', ApiError.Subject.NOT_FOUND));
            if (user.password != oldPwd)
                return cb(new ApiError('Указан неверный пароль', ApiError.Subject.INVALID_DATA), {wrongPwd: 1});
            if (!session.user.allRoles[user.role] || !_.includes(session.user.regRoles, session.user.allRoles[user.role]) /*|| !session.user.allRests[user.restId]*/)
                return cb(new ApiError('Недостаточно прав', ApiError.Subject.ACCESS_DENIED));
            users.update({_id: user._id}, {$set: {password: newPwd}}, safe.sure(cb, function(){cb()}));
        }))
    }));
}

UserApi.prototype.updateInfo = function(token, user, cb){
    var self = this;
    var session = self._api.core.getSession(token);
    if (!session || !session.user)
        return cb(new ApiError('Wrong access token', ApiError.Subject.INVALID_TOKEN));
    if (!user || !user.login ||!_.isString(user.login) || !user.name || !_.isString(user.name) || !user._id)
        return cb(new ApiError('Незаполнены обязательны поля', ApiError.Subject.INVALID_DATA));
    user._id = BSON.ObjectID(user._id);
    var users;
    async.waterfall([
        function(cb){
            self._ctx.collection("users", cb);
        },
        function(_users, cb){
            users = _users;
            users.findOne({_id: user._id, deleted: {$exists: false}}, cb);
        },
        function(res, cb){
            if (!res)
                return cb(new ApiError('Пользователь не найден', ApiError.Subject.NOT_FOUND));
            //TODO add restaurant check
            if (res._id.toString() != session.user._id.toString() && !_.includes(session.user.regRoles, session.user.allRoles[res.role]))
                return cb(new ApiError('Недостаточно прав', ApiError.Subject.ACCESS_DENIED));
            var nUp = false;
            var sObj = {};
            if (res.name != user.name){
                nUp = true;
                if (res.login == session.user.login)
                    session.user.name = user.name;
                sObj.name = user.name;
            }
            if (res.email != user.email){
                nUp = true;
                if (res.login == session.user.login)
                    session.user.email = user.email;
                sObj.email = user.email;
            }
            if (res.phone != user.phone){
                nUp = true;
                if (res.login == session.user.login)
                    session.user.phone = user.phone;
                sObj.phone = user.phone;
            }
            if (res.extra != user.extra){
                nUp = true;
                if (res.login == session.user.login)
                    session.user.extra = user.extra;
                sObj.extra = user.extra;
            }
            if (nUp){
                users.update({_id: res._id}, {$set: sObj}, safe.sure(cb, function(){cb();}));
            }else{
                cb();
            }
        }
    ], cb);
}

module.exports.init = function (ctx, cb) {
    var api = new UserApi(ctx);
    var m = {api:api};

    m.getModuleInfo = function (token, cb) {
        var i = {};
        i.url = '/user/';
        i.id = 'user';
        cb(null,i);
    };
    m.init2 = function (cb) {
        api.init(cb);
    };
    cb(null, m);
}