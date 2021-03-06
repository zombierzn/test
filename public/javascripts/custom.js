define(function(){
    window.appError = function(err, title, selector) {
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
            setTimeout(function () { $error.fadeOut("slow", function () { $error.remove(); }); }, 10000);
            $error.fadeIn("slow");

            if (selector){
                var $ctx = $(selector)
            }else if ($('.modal-ctx').filter(':visible').length)
                var $ctx = $('.modal-ctx').filter(':visible').eq(0);
            else if ($('.local-ctx').filter(':visible').length)
                var $ctx = $('.local-ctx').filter(':visible').eq(0);
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

    window.appInfo = function(info, title, selector) {
        if (info) {
            var message = "Info!";
            if (info.message) {
                message = info.message;
            }
            if (window.$ == undefined) {
                return;
            }

            var t = title || (info.data ? info.data.subject : null) || "info";

            var $error = $('<div class="alert alert-info" style="display: none;"><div type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</div><h4>' + t + '</h4><p>' + message + '</p></div>');
            setTimeout(function () { $error.fadeOut("slow", function () { $error.remove(); }); }, 5000);
            $error.fadeIn("slow");

            if (selector){
                var $ctx = $(selector);
            }else if ($('.modal-ctx').filter(':visible').length)
                var $ctx = $('.modal-ctx').filter(':visible').eq(0);
            else if ($('.local-ctx').filter(':visible').length)
                var $ctx = $('.local-ctx').filter(':visible').eq(0);
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

    window.browser = {
        device: (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase()))
    };
})