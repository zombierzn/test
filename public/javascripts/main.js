/**
 * Created by zombierzn on 28.02.15.
 */
require.config({
    baseUrl: "/javascripts/",
    waitSeconds: 20,
    paths: {
        "hbs": "hbs",
        "jquery": "jquery",
        "clitpl": "clitpl",
        "safe": "safe",
        "async": "async",
        "lodash": "lodash",
        "jsonrpc": "jsonrpc",
        "jquery-block": "jquery.blockUI",
        "jquery-validate": "jquery.validate.min",
        "jquery-form": "jquery.form.min",
        "moment": "moment/moment",
        "moment-ru": "moment/locale/ru",
        "bootstrap": "bootstrap-min",/**/
        "paginator" : "paginator",
        "jquery-mixitup" : "jquery.mixitup.min",/**/
        "jquery-ui" : "jquery-ui.min",
        "bootstrap-select" : "bootstrap-select.min",/**/
        "jquery-mixitup-pagination" : "jquery.mixitup-pagination.min",/**/
        "bootstrap-modal" : "bootstrap-modal",/**/
        "bootstrap-modalmanager" : "bootstrap-modalmanager",/**/
        "custom": "custom"
    },
    shim:{
        "bootstrap": {
            deps:["jquery"]
        },
        "jquery-mixitup":{
            deps:["jquery"]
        },
        "bootstrap-select":{
            deps:["bootstrap"]
        },
        "jquery-mixitup-pagination":{
            deps:["jquery-mixitup"]
        },
        "bootstrap-modal":{
            deps:["bootstrap"]
        },
        "bootstrap-modalmanager":{
            deps:["bootstrap-modal"]
        }
    }
});

require(["bootstrap", "custom"], function () {});