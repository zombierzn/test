define(['main'], function() {
    return function () {
        require(["jquery", "safe", "api", "jquery-block"], function ($, safe, api) {
            $(function () {
                var $form = $('.form-signin');
                $form.submit(function (e) {
                    e.preventDefault();
                    safe.run(function (cb) {
                        var user = {};
                        user.login = $form.find('input[name="Ulogin"]').val();
                        user.password = $form.find('input[name="Upassword"]').val();
                        $form.block();
                        api.call("core.authenticate", user.login, user.password, cb);
                    }, function (err) {
                        $form.unblock();
                        if (!err || (err.data && err.data.subject && err.data.subject == 'AlreadyLogged'))
                            window.location.href = '/index';
                        else
                            appError(err);
                    });
                    return false;
                });
            });
        });
    };
});
