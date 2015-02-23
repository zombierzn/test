(function (require, window, document, undefined) {
    "use strict";
    window.appError = function(err, title) {
        if (err) {
            var message = "Unknown error";
            if (err.message) {
                message = err.message;
            }
            if (err.requireModules) {
                message += "<br>"+ err.requireType + " modules: " + JSON.stringify(err.requireModules);
            }
            if (window.$ == undefined) {
                return;
            }
            if (err.data && err.data.subject == "InvalidToken") {
                return window.location.reload();
            }

            var t = title || (err.data ? err.data.subject : null) || "Error";

            var $error = $('<div class="alert alert-danger" style="display: none;"><div type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</div><h4>' + t + '</h4><p>' + message + '</p></div>');
            setTimeout(function () { $error.fadeOut("slow", function () { $error.remove(); }); }, 30000);
            $error.fadeIn("slow");

            if ($('.local-ctx').filter(':visible').length)
                var $ctx = $('.local-ctx').filter(':visible').eq(0);
            else if ($('.modal').filter(':visible').length)
                var $ctx = $('.modal').filter(':visible').eq(0);
            else {
                $error.addClass("errorPlace");
                $(document.body).append($error);
                return;
            }

            $ctx.prepend($error);

            $('html, body').animate({"scrollTop":($ctx.offset().top - 30) + "px"}, function () {
                $(window).resize();
            });
        }
    }

    require.config({
        baseUrl: "/javascripts/",
        callback: appError,
        waitSeconds: 20,
        paths: {
            "hbs": "/hbs",
            "safe": "safe",
            "async": "async",
            "lodash": "lodash",
            "jsonrpc": "jsonrpc",
            "jquery-block": "jquery.blockUI",
            "jquery-validate": "jquery.validate.min",
            "jquery-form": "jquery.form.min",
            "moment": "moment/moment",
            "moment-pt": "moment/lang/pt",
            "bootstrap": "bootstrap-min",
            "paginator" : "paginator",
        },
        shim:{
            "bootstrap": {
                deps:["jquery"]
            },
            "paginator": {
                deps:["jquery"]
            },
            "jquery-validate": {
                deps:["jquery"]
            },
            "jquery-block": {
                deps:["jquery"]
            },
            "jquery-form":{
                deps:["jquery"]
            }
        }
    });
    require(["jquery","bootstrap"], function ($) {

    })
})(require, window, document);