var main = require(__dirname+'/modules/core.js');
var app = main.createApp();

app.startApp(function (err) {
    if (err) console.log(err);
});