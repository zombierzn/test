var path = require('path');
var cf = require(path.join(__dirname, '..', 'lib', 'config.js'));

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