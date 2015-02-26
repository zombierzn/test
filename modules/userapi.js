var path = require('path');
var cf = require(path.join(__dirname, '..', 'lib', 'config.js'));
var ApiError = require('./ApiError');
var _ = require('lodash');

function UserApi(ctx) {
    this._ctx = ctx;
    this._sessions = {};
    this._config = {};
    this._api = {};
}

UserApi.prototype.init = function (cb) {
    var self = this;
    self._config = cf();
    cb();
};

UserApi.prototype.register = function(token, user, cb){
    var self = this;
    var session = self.getSession(token);
    if (!session || !session.user)
        return cb(new ApiError('Wrong access token', ApiError.Subject.INVALID_TOKEN));
    if (!user || !user.login ||!_.isString(user.login) || !user.password || !_.isString(user.password) || !user.restId || !user.name || !_.isString(user.name) || !user.role)
        return cb(new ApiError('Незаполнены обязательны поля', ApiError.Subject.INVALID_DATA));
    if (user.password.length < 5)
        return cb(new ApiError('Разрешены пароли > 5 символов', ApiError.Subject.INVALID_DATA));
    if (!session.user.role.alowRegister || !session.user.allRoles[user.role] || !_.includes(session.user.regRoles, session.user.allRoles[user.role]))
        return cb(new ApiError('Недостаточно прав', ApiError.Subject.ACCESS_DENIED));
    var toAdd = {
        login: user.login,
        password: user.password
    };


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

    cb(null, m);
}