define(['main'], function() {
    return function () {
        require(["jquery", "safe", "api", "clitpl", "lodash", "jquery-block", "jquery-ui", "bootstrap-select", "jquery-mixitup-pagination", "bootstrap-modalmanager"], function ($, safe, api, tf, _) {
            $(function () {
                var citySelect = $('#citySelect');
                var visibleSelect = $('#visibleSelect');

                if (window.browser.device)
                    $('.selectpicker').selectpicker('mobile');
                else
                    $('.selectpicker').selectpicker();
            });
        });
    };
});