define(["handlebars.runtime","lodash","async","safe","module"], function (handlebars,_,async,safe,module) {
    var handlebars = handlebars.default;
    handlebars.registerHelper('when', function(lvalue, op, rvalue, options) {
        if (arguments.length < 4)
            throw new Error("Handlerbars Helper 'compare' needs 3 parameters");

        var result = false;

        try {
            result = eval(JSON.stringify(lvalue)+op+JSON.stringify(rvalue));
        } catch (err) {
        }

        return result?options.fn(this):options.inverse(this);
    });

    return {
        compile:function(scans,opts, cb) {
            if (typeof cb !== "function") {
                cb = opts;
                opts = {};
            }
            var templates = {};
            _.forEach(scans, function (scan) {
                if (scan.v) return;

                var tpl = new handlebars.template(eval("("+scan.tf+")"))
                templates[scan.p]=tpl;
            })
            handlebars.partials = templates;
            cb(null, templates);
        },
        corectx:function(ctx,opts,cb) {
            if (typeof cb !== "function") {
                cb = opts;
            }
            ctx.uniq = Date.now();
            ctx.apiToken = _apiToken;

            if (!opts.ctx)
                return cb(null, ctx);

            var tasks = [function (cb) {cb()}];

            if (opts.ctx.i18n) {
                tasks.push(function (cb) {
                    var deps = ["gettext"];
                    var mPath =  module.config().mPath;
                    var mName =  module.config().mName;
                    deps.push("json!"+mPath+"locale/"+mName+"."+_user.language+".json");
                    require(deps, function (Gettext, locale) {
                        var locale_data = {};
                        locale_data[mName] = locale;
                        var _gt = new Gettext({  "domain" : mName,
                            "locale_data" : locale_data})
                        handlebars.registerHelper('i18n',function(options) {
                            return _gt.gettext(options.fn(this));
                        })
                        cb();
                    });
                })
            }
            if (opts.ctx.user) {
                tasks.push(function (cb) {
                    require(["jsonrpc"], function (JsonRpc) {
                        var rpc = new JsonRpc('/jsonrpc');
                        rpc.call('core.getUser', _apiToken, {
                            success: function (data) {
                                var user = data[0];
                                user[user.language]=1;
                                ctx.user = user;
                                cb();
                            }, failure:cb});
                        })
                    }
                )
            }
            if (opts.ctx.format_cost) {
                handlebars.registerHelper('format_cost',function(options) {
                    var price = options.fn(this);
                    console.log(price);
                    if (price.match(/^\d+$/))
                        return '$'+price+".00";
                    else if (price.match(/^\d+\.\d+$/))
                        return '$'+ parseFloat(price).toFixed(2);
                    else return price;

                });
                cb();
            }
            if (opts.ctx.format_cost) {
                handlebars.registerHelper('format_cost',function(options) {
                    var price = options.fn(this);
                    if (price.match(/^\d+$/))
                        return '$'+price+".00";
                    else if (price.match(/^\d+\.\d+$/))
                        return '$'+ parseFloat(price).toFixed(2);
                    else return price;

                });
                cb();
            }
            if (opts.ctx.array_element) {
                handlebars.registerHelper('array_element',function(_arr, num, options) {
                    return _arr[num]
                });
                cb();
            }

            if (opts.ctx.ifHelper) {
                handlebars.registerHelper('ifHelper',function(type, retType, options) {
                    if (type == retType) {
                        return options.fn(this);
                    } else {
                        return "";
                    }
                });
                cb();
            }

            if (opts.ctx.subStr) {
                handlebars.registerHelper('subStr',function(type, num, options) {
                    var retStr = type.toString().substring(0, num.parseInt()) + "...";
                    return retStr;
                });
                cb();
            }

            if (opts.ctx.time_string) {
                handlebars.registerHelper('time_string',function(options) {
                    var time = options.fn(this);
                    if (time.toString().length<2)
                        return '0'+time;
                    else return time;
                });
                cb();
            }
            async.parallel(tasks,function (err) {
                if (err) return cb(err);
                cb(null,ctx);
            })
        },
        make:function(scans,ctx_,opts,cb) {
            var ctx = _.cloneDeep(ctx_);
            if (typeof cb !== "function") {
                cb = opts;
                opts = {ctx:{}};
            }
            var self = this;
            // autodetect some common stuff
            _.forEach(scans, function (scan) {
                if (scan.v) return;
                opts.ctx.i18n = opts.ctx.i18n || scan.tf.indexOf("helpers.i18n")!=-1;
                opts.ctx.user = opts.ctx.user || scan.tf.indexOf("depth0.user")!=-1;
                opts.ctx.i18n_currency = opts.ctx.i18n_currency || scan.tf.indexOf("helpers.i18n_currency")!=-1;
                opts.ctx.format_cost = opts.ctx.i18n_cost || scan.tf.indexOf("helpers.format_cost")!=-1;
                opts.ctx.ifCond = opts.ctx.ifCond || scan.tf.indexOf("helpers.ifCond")!=-1;
                opts.ctx.array_element = opts.ctx.array_element || scan.tf.indexOf("helpers.array_element")!=-1;
                opts.ctx.ifHelper = opts.ctx.ifHelper || scan.tf.indexOf("helpers.ifHelper")!=-1;
                opts.ctx.subStr = opts.ctx.subStr || scan.tf.indexOf("helpers.subStr")!=-1;
                opts.ctx.time_string = opts.ctx.time_string || scan.tf.indexOf("helpers.time_string")!=-1;
            })
            this.compile(scans,opts, function (err, templates) {
                if (err) return cb(err);
                self.corectx(ctx,opts,function(err, ctx) {
                    if (err) return cb(err);
                    cb(null, templates, ctx);
                })
            })
        },
        render: function(tname, ctx, opts, cb) {
            var self = this;
            if (typeof cb !== "function") {
                cb = opts;
                opts = {ctx:{}};
            }
            require(["json!hbs/"+tname+".js"], function (scans) {
                self.make(scans,ctx,opts,safe.sure(cb, function (tpl,ctx) {
                    cb(null, tpl[tname](ctx), ctx);
                }))
            },cb)
        }
    };
})
