define(['main'], function() {
    return function () {
        require(["jquery", "api", "safe", "jquery-block", "bootstrap-modalmanager"], function ($, api, safe) {
            $(function () {
                var $form = $('#changePwdForm');
                $form.submit(function(e){
                    e.preventDefault();
                    $form.block();
                    safe.run(function (cb) {
                        var oldpwd = $('#oldpwd').val();
                        var newpwd = $('#newpwd').val();
                        api.call("user.changePassword",userId, oldpwd, newpwd, cb);
                    }, function (err, res) {
                        if (err){
                            $form.unblock();
                            appError(err, null, '#usr-chpwd-ctx');
                            if (res && res.wrongPwd)
                                $('#oldpwd').focus().select();
                        }else{
                            appInfo({message: "Пароль изменён"}, null, '#usr-chpwd-ctx');
                            setTimeout(function(){
                                $form.unblock();
                                $('#userChangePwd').modal('hide');
                            }, 1300);
                        }
                    });
                    return false;
                });
            })
        });
    }
})