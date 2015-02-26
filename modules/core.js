var express = require('express');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Handlebars = require('handlebars');
var hbs = require(path.join(__dirname, '..', 'lib', 'handlebars.js'));
var session = require('express-session');
var lessMiddleware = require('less-middleware');
var config = require(path.join(__dirname, '..', 'lib', 'config.js'))();
var async = require('async');
var safe = require('safe');
var _ = require('lodash');
var ApiError = require('./ApiError');
var mongo = require('mongodb');

(function handelbarsHelpers(){
    Handlebars.registerHelper('ifUserRole',function(value, value2) {
        var user;
        var fn;
        if (!value2 && value && value.data && value.data.root && value.data.root.user) {
            user = value.data.root.user;
            fn = value;
        }
        else if (value && _.isObject(value)) {
            user = value;
            fn = value2;
        }
        if (user && user.role && user.role.val && this && this.val && user.role.val == this.val){
            return fn.fn(this);
        }
    });

    Handlebars.registerHelper('canEditUser',function(value, ctx) {
        var curUser = ctx.data.root.user;
        if (value && value.role && curUser && curUser.regRoles && _.includes(curUser.regRoles, curUser.allRoles[value.role.val])){
            return ctx.fn(this);
        }
    });
})();

function foodApp(){
    var self = this;
    var sessions = {};
    var tmodules = [
        {name:"core",require:"./coreapi"},
        {name:"user",require:"./userapi"}
    ];
    var modules = {};
    var cfg = config;
    self.startApp = function(cb){
        process.on('uncaughException', function (e) {
            console.trace(e);
        });
        console.time("startApp");
        async.series([
            function initBasics(cb){
                var app = module.exports = express();
                self.webapp = app;
                app.set('views', path.join(__dirname, '..', 'views'));
                app.set('view engine', 'hbs');
                app.engine('hbs', hbs.handlebarsEngine(Handlebars, {dest: path.join(__dirname, '..', 'public', 'hbs'), debug: false}));

                app.set('port', process.env.PORT || 80);
                app.use(hbs.handlebarsMiddleware({dest: path.join(__dirname, '..', 'public', 'hbs'), src: path.join(__dirname, '..', 'views'), prefix:'/hbs/'}));
                app.use(session({secret: 'monster mutant boogie', saveUninitialized: true, resave: false}));
                app.use(lessMiddleware({src :path.join(__dirname, '..', 'views', 'less'), dest: path.join(__dirname,'..', 'public', 'stylesheets'), prefix:'/stylesheets/',debug: false}));
                app.use(favicon());
                app.use(logger('dev'));
                app.use(bodyParser.json());
                app.use(bodyParser.urlencoded());
                app.use(cookieParser());
                app.use(express.static(path.join(__dirname, '..' ,'public')));
                app.use(function (req, res, next) {
                    modules['core'].api.sessionRefreshTouch(req.session.apiToken);
                    var clientId = req.cookies[cfg.app.cookie];
                    async.series([
                        function getToken (cb) {
                            if (clientId == null) {
                                delete req.session.apiToken;
                                self.getRandomString(128, safe.sure(cb, function (rnd) {
                                    clientId = rnd;
                                    res.cookie(cfg.app.cookie, clientId, { maxAge: 3600000, path: '/' }); // 1000*60*60 = 1 hour
                                    cb();
                                }));
                            } else {
                                res.cookie(cfg.app.cookie, clientId, { maxAge: 3600000, path: '/' }); // 1000*60*60 = 1 hour
                                cb();
                            }
                        },
                        function checkTokenValid (cb) {
                            if (req.session.apiToken != null) {
                                modules['core'].api.checkToken(req.session.apiToken, safe.sure(function (err) { delete req.session.apiToken; cb(); }, cb));
                            } else
                                cb();
                        },
                        function ensureToken (cb) {
                            if (req.session.apiToken == null) {
                                modules['core'].api.getApiToken('default', clientId, 'fake', safe.sure(cb, function (result) {
                                    req.session.apiToken = result.newToken;
                                    cb();
                                }));
                            } else
                                cb();
                        },
                        function (cb) {
                            modules['core'].api.getUser(req.session.apiToken, safe.sure(cb, function (user) {
                                if (user.password) {
                                    delete user.password;
                                }
                                user.loggedin = !!(user._id);
                                res.locals.user = user;
                                //res.locals.user.admin = _.contains(user.access, "85");
                                cb();
                            }));
                        },
                    ], next);
                });
                app.use(function(req,res,next){
                    res.locals.uniq = Date.now();
                    res.locals.url = req.url;
                    res.locals.query = req._parsedUrl.query;
                    res.locals.host = req.hostname;
                    res.locals.apiToken =req.session.apiToken;
                    res.locals.layout = "layout";
                    next();
                });
                function handleJsonRpc(jsonrpc, req, res, next) {
                    var startTime = new Date();
                    var id = null; var out = false;
                    try {
                        id = jsonrpc.id;
                        var params = jsonrpc.params;
                        if (typeof(params) != 'object')
                            params = JSON.parse(params);
                        var func = jsonrpc.method.match(/^(.*)\.(.*)$/);
                        var module = func[1];
                        func = func[2];
                        var api =  modules[module].api;

                        var fn = api[func];
                        params.push(function () {
                            var jsonres = {};
                            if (arguments[0]) {
                                var err = arguments[0];

                                jsonres.error = {message:err.message,code:-1,data:err.data || {subject: "GenericError"}}
                                jsonres.result = null;
                            } else {
                                jsonres.error = null;
                                jsonres.result = Array.prototype.slice.call(arguments,1);
                            }
                            jsonres.id = jsonrpc.id;
                            if (jsonres.result && _.isArray(jsonres.result) && jsonres.result.length==1 && jsonres.result[0].newToken) {
                                console.log('renew_token:',jsonres.result[0].newToken);
                                req.session.apiToken = jsonres.result[0].newToken;
                                res.locals.apiToken = req.session.apiToken;
                            }
                            res.json(jsonres);
                            if (self.newrelic) {
                                self.newrelic.endTransaction();
                            }
                        })
                        fn.apply(api, params);
                    } catch (err) {
                        if (!out)
                            res.json({error:{message:err.message,code:-1,data:err.data || {subject: "GenericError"}}, result:null, id:id});
                    }
                };
                app.post("/jsonrpc", function (req,res,next) {
                    handleJsonRpc(req.body, req, res, next);
                });
                self.db(cb);
            },
            function initModules(cb) {
                // first pass, create module, grab all info
                async.forEachSeries(tmodules, function (minfo, cb) {
                    console.time("Create " + minfo.name);
                    var module = require(minfo.require);
                    module.init(self, safe.sure(cb, function (moduleObj) {
                        modules[minfo.name] = moduleObj;
                        console.timeEnd("Create " + minfo.name);
                        cb();
                    }));
                },safe.sure(cb, function () {
                    // second pass, allow to set links between modules, all modules are there
                    // so they can link to each other
                    async.forEachSeries(_.keys(modules), function (mname, cb) {
                        var module = modules[mname];
                        if (module.init2) {
                            console.time("Init2 " + mname);
                            module.init2(safe.sure(cb, function () {
                                console.timeEnd("Init2 " + mname);
                                cb();
                            }))
                        }
                        else cb();
                    },safe.sure(cb, function () {
                        // and now we can init modules that need express app
                        async.forEachSeries(_.keys(modules), function (mname, cb) {
                            var module = modules[mname];
                            if (module.initWeb) {
                                console.time("InitWeb " + mname);
                                module.initWeb(self.webapp,safe.sure(cb,function () {
                                    console.timeEnd("InitWeb " + mname);
                                    cb();
                                }))
                            }
                            else cb();
                        },cb);
                    }))
                }))
            },
            function instrumentApi(cb) {
                var po = _.reduce(modules, function (memo, m, mname) {
                    if (m.api) {
                        memo.push({obj:m.api.constructor.prototype,name:mname});
                    }
                    return memo;
                }, [])
                _.each(po, function (m) {
                    var mname = m.name;
                    _.each(m.obj, function (f,k) {
                        if (!_.isFunction(f))
                            return;

                        var p = function () {
                            var fname = mname + ":" + k;
                            var cb = arguments[arguments.length-1];
                            var args = {arguments: arguments, t: this};
                            if (_.isFunction(cb)) {
                                arguments[arguments.length-1] = function () {
                                    if (arguments[0] && arguments[0] instanceof Error) // only first in stack raw error must dump
                                        self.dumpErrors(arguments[0], fname, args);

                                    cb.apply(this, arguments);
                                }
                            }

                            return f.apply(this, arguments);
                        };
                        m.obj[k] = p;
                    });
                })
                cb();
            }
        ], function end(err){
            console.timeEnd("startApp");
            if (err) {
                console.trace(err);
                return cb(err);
            }
            require(path.join(__dirname, '..', 'routes', 'index.js'))(self);
            self.webapp.use(function(err, req, res, next) {
                if (err.data && (err.data.subject == ApiError.Subject.ACCESS_DENIED))
                    return res.send(403);

                if ((err.toString().indexOf("Failed to decode param") !== -1) || err.data && (err.data.subject == ApiError.Subject.NOT_FOUND))
                    return res.send(404);

                if (err.name != "ApiError") {
                    err.url = req.originalUrl;
                    err.params = JSON.parse(JSON.stringify({
                        ref: req.headers.referer,
                        body: req.body
                    }));
                    self.dumpErrors(err);
                }

                if (req.url == "/jsonrpc") {
                    res.json({jsonrpc: "2.0", error:{message: err.message, code:-1, data:err.data || {subject: "GenericError"}}, result:null, id:req.body});
                } else
                    res.send(500);
            });
            var httpsrv = http.createServer(self.webapp);
            httpsrv.listen(self.webapp.get('port'), function() {
                console.log('Express server listening on port ' + self.webapp.get('port'));
                cb();
            });
        });
    }
    var _db = null;
    this.db = function (cb) {
        // return db if we already have it
        if (_db) {
            return cb(null, _db);
        }
        console.log("Connecting to: " + cfg.mongo.host);
        var dbc = new mongo.Db(
            cfg.mongo.db,
            new mongo.Server(cfg.mongo.host, cfg.mongo.port, cfg.mongo.opts), {native_parser: false, safe:true, maxPoolSize: 100}
        );
        async.waterfall([
            function(cb){
                dbc.open(cb);
            },
            function (db, cb){
                _db = db;
                dbc.authenticate(cfg.mongo.user, cfg.mongo.password, cb);
            }
        ], safe.sure(cb, function(){
            cb(null, _db);
        }));
    };
    this.collection = function(name,cb) {
        this.db(safe.sure(cb,function(db) {
            db.collection(name,function (err, collection) {
                cb(err, collection);
            })
        }))
    };

    this.getModule = function (name, cb) {
        cb(null, modules[name]);
    }
    this.getRandomString = function (bits,cb) {
        var chars,rand,i,ret;
        chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        ret = '';
        // in v8, Math.random() yields 32 pseudo-random bits (in spidermonkey it gives 53)
        while (bits > 0) {
            rand = Math.floor(Math.random()*0x100000000) // 32-bit integer
            // base 64 means 6 bits per character, so we use the top 30 bits from rand to give 30/6=5 characters.
            for (i=26; i>0 && bits>0; i-=6, bits-=6)
                ret += chars[0x3F & rand >>> i]
        }
        return cb(null,ret);
    }
    this.getModuleSync = function (name) {
        return modules[name];
    }
    this.dumpErrors = function (err, fname, args) {
        try {
            if (err && err.name != "ApiError") {
                var params = err.params || {};
                if (fname) {
                    params.fname = err.action = fname;
                }
                if (args) {
                    err.params = {} || err.params;
                    err.params.args = args.arguments;
                    params.args = args.arguments;
                    if (args.arguments[0] && args.t && modules['core'] && modules['core'].api) {
                        var ses = modules['core'].api.getSession(args.arguments[0]);
                        if (ses)
                            params.user = ses.user;
                    }
                }
                console.trace(err);
            }
        } catch (err) {
            console.trace(err);
        }
    }
}

module.exports.createApp = function () {
    return new foodApp();
};
