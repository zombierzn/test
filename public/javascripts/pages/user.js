define(['main'], function() {
    return function () {
        require(["jquery", "api", "safe", "clitpl", "jquery-block", "bootstrap-select", "bootstrap-modalmanager"], function ($, api, safe, tf) {
            $(function () {
                if (window.browser.device)
                    $('.selectpicker').selectpicker('mobile');
                else
                    $('.selectpicker').selectpicker();

                var $form = $('#userForm');

                function strEq(v) {
                    if (!v)
                        return "";
                    else
                        return v.toString();
                }

                $form.submit(function (e) {
                    e.preventDefault();
                    safe.run(function (cb) {
                        var toAdd = {};
                        if (!existing) {
                            if ($('#password').val().trim() != $('#password2').val().trim()) {
                                $('#password2').focus();
                                appError({message: "Введённые пароли не совпадают"}, null, '#user-ctx');
                                return false;
                            }
                            toAdd.password = $('#password').val().trim();
                        }
                        toAdd.login = $('#login').val().trim();
                        toAdd.restId = '54eee9ef2318bd66b21d79aa';// $('#rest').val();
                        toAdd.name = $('#name').val().trim();
                        toAdd.role = $('#role').val().trim();
                        if ($('#email').val().trim())
                            toAdd.email = $('#email').val().trim();
                        if ($('#phone').val().trim())
                            toAdd.phone = $('#phone').val().trim();
                        if ($('#extra').val().trim())
                            toAdd.extra = $('#extra').val().trim();
                        $form.block();
                        if (existing) {
                            toAdd._id = user._id;
                            if (strEq(toAdd.name) == user.name && strEq(toAdd.email) == user.email &&
                                strEq(toAdd.phone) == user.phone && strEq(toAdd.extra) == user.extra) {
                                $('#userInfo').modal('hide');
                                return false;
                            }
                            api.call("user.updateInfo", toAdd, cb);
                        } else {
                            api.call("user.register", toAdd, cb);
                        }
                    }, function (err) {
                        $form.unblock();
                        if (err) {
                            appError(err, null, '#user-ctx');
                        } else {
                            $('#userModalResult').val(existing ? 'update' : 'register');
                            setTimeout(function () {
                                appInfo({message: existing ? "Данные обновлены" : "Пользователь добавлен"})
                            }, 500);
                            $('#userInfo').modal('hide');
                        }
                    });
                    return false;
                });
                $('#resetpwd').click(function () {
                    tf.render('change-pwd', {id: user._id}, safe.sure(appError, function (text) {
                        $("#modal-2").html(text);
                        $('#userChangePwd').modal();
                    }));
                });
                $('#delete').click(function () {
                    tf.render('delete-user', {
                        id: user._id,
                        name: user.name
                    }, safe.sure(appError, function (text) {
                        $("#modal-2").html(text);
                        $('#userDelete').modal();
                    }));
                });
                $('body').on('hidden.bs.modal', '#userDelete', function () {
                    var result = $('#userModalResult').val();
                    if (result == 'delete') {
                        $('#userInfo').modal('hide');
                    } else {
                        $('#userModalResult').val('');
                    }
                });
            });
        });
    };
});
