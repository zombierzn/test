define(['main'], function() {
    return function () {
        require(["jquery", "api", "safe", "jquery-block", "bootstrap-modalmanager"], function ($, api, safe) {
            $(function () {
                $('#acceptDelete').click(function(){
                    safe.run(function (cb) {
                        api.call("user.deleteUser", userId, cb);
                    }, function (err) {
                        if (err){
                            appError(err, null, '#usr-delete-ctx');
                        }else{
                            appInfo({message: "Пользователь удалён"});
                            $('#userModalResult').val('delete');
                            $('#userDelete').modal('hide');
                        }
                    });
                });
            })
        });
    }
})