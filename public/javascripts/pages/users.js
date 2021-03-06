define(['main'], function() {
    return function () {
        require(["jquery", "safe", "api", "clitpl", "lodash", "jquery-block", "jquery-ui", "bootstrap-select", "jquery-mixitup-pagination", "bootstrap-modalmanager"], function ($, safe, api, tf, _) {
            $(function () {
                var roleSelect = $('#roleSelect');
                var citySelect = $('#citySelect');
                var restSelect = $('#restSelect');
                var users = {};
                var mixShown = false;

                function loadUsers() {
                    $("#roleFilter, #cityFilter, #restFilter").css('display', 'none');
                    safe.run(function (cb) {
                        $(".container").block();
                        if (mixShown) {
                            users = {};
                            mixShown = false;
                            $("#mixit").mixItUp('destroy', true);
                        }
                        api.call("user.getAll", cb);
                    }, function (err, _users) {
                        if (err) {
                            appError(err);
                        } else {
                            if (!_users.length) {
                                appInfo({message: "Пользователи не найдены"});
                                return;
                            }
                            var roles = {_sz: 1};
                            var restaurants = {_sz: 1};
                            var cities = {_sz: 1};
                            $('.selectpicker').find('option').remove();
                            roleSelect.append($("<option></option>")
                                .attr("value", 'all')
                                .text('Все'));
                            citySelect.append($("<option></option>")
                                .attr("value", 'all')
                                .text('Все'));
                            restSelect.append($("<option></option>")
                                .attr("value", 'all')
                                .text('Все'));
                            _.forEach(_users, function (user) {
                                if (!roles[user.role.val]) {
                                    roles[user.role.val] = roles._sz;
                                    roleSelect.append($("<option></option>")
                                        .attr("value", '.role-' + roles[user.role.val])
                                        .text(user.role.text));
                                    roles._sz++;
                                    $("#roleFilter").css('display', 'inline-block');
                                }
                                if (user.сity && !cities[user.сity]) {
                                    cities[user.сity] = cities._sz;
                                    citySelect.append($("<option></option>")
                                        .attr("value", '.сity-' + cities[user.сity])
                                        .text(user.сity));
                                    cities._sz++;
                                    $("#cityFilter").css('display', 'inline-block');
                                }
                                if (user.restaurant && !restaurants[user.restaurant]) {
                                    restaurants[user.restaurant] = restaurants._sz;
                                    restSelect.append($("<option></option>")
                                        .attr("value", '.restaurant-' + restaurants[user.restaurant])
                                        .text(user.restaurant));
                                    restaurants._sz++;
                                    $("#restFilter").css('display', 'inline-block');
                                }
                                user.roleId = 'role-' + roles[user.role.val];
                                user.сityId = 'сity-' + cities[user.сity];
                                user.restaurantId = 'restaurant-' + restaurants[user.restaurant];
                                users[user._id] = user;
                            });
                            $('.selectpicker').selectpicker('refresh');
                            tf.render('users-item', {users: _.toArray(users)}, safe.sure(appError, function (text) {
                                $("#mixit").html(text).mixItUp({
                                    animation: {
                                        duration: window.browser.device ? 1 : 400
                                    },
                                    callbacks: {
                                        onMixLoad: function () {
                                            $(".container").unblock();
                                            $(this).mixItUp('setOptions', {
                                                animation: {
                                                    duration: 400
                                                }
                                            });
                                            mixShown = true;
                                        }
                                    },
                                    pagination: {
                                        limit: 10,
                                        pagerClass: 'pag-btn'
                                    }
                                });
                            }));
                        }
                    });
                }

                $('.selectpicker').on('change', function () {
                    var filter = [];
                    if (roleSelect.val() != 'all')
                        filter.push(roleSelect.val());
                    if (citySelect.val() != 'all')
                        filter.push(citySelect.val());
                    if (restSelect.val() != 'all')
                        filter.push(restSelect.val());
                    if (filter.length == 0) {
                        filter = 'all';
                    } else if (filter.length == 1) {
                        filter = filter[0];
                    } else {
                        filter = filter.join('');
                    }
                    $("#mixit").mixItUp('filter', filter);
                });

                if (window.browser.device)
                    $('.selectpicker').selectpicker('mobile');
                else
                    $('.selectpicker').selectpicker();

                $('body').on('click', '.mix', function () {
                    var id = $(this).data().id;
                    tf.render('user', {usr: users[id], existing: true, ro: false}, safe.sure(appError, function (text) {
                        $("#modal-1").html(text);
                        $('#userInfo').modal();
                    }));
                }).on('mouseenter', '.mix', function () {
                    $(this).animate({'backgroundColor': 'rgba(14, 0, 79, 0.60)'}, 300);
                }).on('mouseleave', '.mix', function () {
                    $(this).animate({'backgroundColor': 'rgba(0, 79, 39, 0.60)'}, 300);
                });
                $('#newuser').click(function () {
                    tf.render('user', {existing: false, ro: false}, safe.sure(appError, function (text) {
                        $("#modal-1").html(text);
                        $('#userInfo').modal();
                    }));
                });
                $('body').on('hidden.bs.modal', '#userInfo', function () {
                    var result = $('#userModalResult').val();
                    $('#userModalResult').val('');
                    if (result == 'register' || result == 'update' || result == 'delete') {
                        loadUsers();
                    }
                });
                loadUsers();
            });
        });
    }
})