define(["handlebars.runtime","lodash","async","safe","module","json","text"], function (handlebars,_,async,safe,module) {
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
    handlebars.registerHelper('ifUserRole', function(value, value2) {
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
    handlebars.registerHelper('canEditUser', function (value, ctx) {
        var curUser = ctx.data.root.user;
        if (curUser && ((value && value.role && curUser.regRoles && curUser.regRoles.length && _.includes(_.pluck(curUser.regRoles, 'val'), value.role.val)) || !value || value._id == curUser._id)) {
            return ctx.fn(this);
        }else {
            return ctx.inverse(this);
        }
    });
    handlebars.registerHelper('canRegister', function (value, ctx) {
        var curUser = value;
        if (curUser && curUser.regRoles && curUser.regRoles.length){
            return ctx.fn(this);
        }else{
            return ctx.inverse(this);
        }
    });
    handlebars.registerHelper('canDeleteUser', function (value, ctx) {
        var curUser = ctx.data.root.user;
        if (curUser && curUser.regRoles && curUser.regRoles.length && (!value || value._id != curUser._id)) {
            return ctx.fn(this);
        } else {
            return ctx.inverse(this);
        }
    });
    handlebars.registerHelper('canCreateRest', function (ctx) {
        var curUser = ctx.data.root.user;
        if (curUser && curUser.role && curUser.role.val == 'admin'){
            return ctx.fn(this);
        }else{
            return ctx.inverse(this);
        }
    });
    handlebars.registerHelper('require', function (val, ctx) {
        var url = /(?:[A-Za-z0-9-._~!$&'()*+,;=:@]|%[0-9a-fA-F]{2})*(?:\/(?:[A-Za-z0-9-._~!$&'()*+,;=:@]|%[0-9a-fA-F]{2})*)*/.exec(this.url);
        var mod;
        if (ctx)
            mod = val;
        else if(url && url.length)
            mod = url[0].replace('/', '');
        if (mod)
            return "<script>require(['pages/" + mod + "'], function(mod){mod()});</script>";
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

            if (opts.ctx.user) {
                tasks.push(function (cb) {
                    require(["jsonrpc"], function (JsonRpc) {
                        var rpc = new JsonRpc('/jsonrpc');
                        rpc.call('core.getUser', _apiToken, {
                            success: function (data) {
                                var user = data[0];
                                ctx.user = user;
                                cb();
                            }, failure:cb});
                        })
                    }
                )
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
                opts.ctx.user = opts.ctx.user || scan.tf.indexOf("depth0.user")!=-1;
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
