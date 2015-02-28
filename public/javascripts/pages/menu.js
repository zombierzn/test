define(['main'], function() {
    return function () {
        require(["jquery", "safe", "api", "clitpl", "bootstrap-modalmanager"], function ($, safe, api, tf) {
            $(function () {
                $("#links").find('li').each(function () {
                    var l = $(this);
                    l.removeClass('active');
                    if (l.find('a').attr('href') == window.location.pathname)
                        l.addClass('active');
                });
                $('#logout').click(function () {
                    safe.run(function (cb) {
                        api.call("core.logout", cb);
                    }, function (err) {
                        if (!err)
                            window.location.href = '/login';
                        else
                            appError(err);
                    });
                });
                $('#profile').click(function () {
                    safe.run(function (cb) {
                        api.call("core.getUser", cb);
                    }, safe.sure(appError, function (user) {
                        tf.render('user', {
                            usr: user,
                            existing: true,
                            ro: false
                        }, safe.sure(appError, function (text) {
                            $("#modal-1").html(text);
                            $('#userInfo').modal();
                        }));
                    }));
                });
            });
        });
    };
});