var safe = require('safe');
module.exports = function (ctx) {
    var app = ctx.webapp;
    var api = ctx.getModuleSync('core').api;
    app.get('/', isLogged, function(req, res, next){
        res.render('index', {title: 'Express'});
    });
    app.get('/login', function(req, res, next){
        res.render('login', {title: 'Express'});
    });
    function isLogged(req, res, next){
        if (res.locals.user && res.locals.user.loggedin) {
            next();
        } else {
            res.redirect('/login');
        }
    }
}
