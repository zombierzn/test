{"layout":{"p":"layout","tf":"{\"1\":function(depth0,helpers,partials,data) {\n    var stack1;\n\n  return ((stack1 = this.invokePartial(partials.menu,depth0,{\"name\":\"menu\",\"data\":data,\"helpers\":helpers,\"partials\":partials})) != null ? stack1 : \"\");\n},\"compiler\":[6,\">= 2.0.0-beta.1\"],\"main\":function(depth0,helpers,partials,data) {\n    var stack1, helper, options, alias1=helpers.helperMissing, alias2=\"function\", alias3=this.escapeExpression, buffer = \n  \"<!DOCTYPE html>\\n<head>\\n    <meta charset=\\\"utf-8\\\">\\n    <title>InFood - \"\n    + alias3(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{\"name\":\"title\",\"hash\":{},\"data\":data}) : helper)))\n    + \"</title>\\n    <link rel='stylesheet' href='/stylesheets/style.css' />\\n    <link rel='stylesheet' href='/stylesheets/bootstrap-select.min.css' />\\n    <link href=\\\"stylesheets/bootstrap.min.css\\\" rel=\\\"stylesheet\\\">\\n    <meta name=\\\"viewport\\\" content=\\\"width=device-width, initial-scale=1\\\">\\n    <script src=\\\"/javascripts/require.js\\\"></script>\\n    <script src=\\\"/javascripts/app.js\\\"></script>\\n    <script>\\n        var _apiToken = '\"\n    + alias3(((helper = (helper = helpers.apiToken || (depth0 != null ? depth0.apiToken : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{\"name\":\"apiToken\",\"hash\":{},\"data\":data}) : helper)))\n    + \"';\\n    </script>\\n</head>\\n<body>\\n\";\n  stack1 = ((helper = (helper = helpers.notAuth || (depth0 != null ? depth0.notAuth : depth0)) != null ? helper : alias1),(options={\"name\":\"notAuth\",\"hash\":{},\"fn\":this.noop,\"inverse\":this.program(1, data, 0),\"data\":data}),(typeof helper === alias2 ? helper.call(depth0,options) : helper));\n  if (!helpers.notAuth) { stack1 = helpers.blockHelperMissing.call(depth0,stack1,options)}\n  if (stack1 != null) { buffer += stack1; }\n  return buffer + \"<div class=\\\"container\\\" style=\\\"width: 95%\\\">\\n    <div class=\\\"row\\\">\\n\"\n    + ((stack1 = this.invokePartial(partials.content,depth0,{\"name\":\"content\",\"data\":data,\"indent\":\"        \",\"helpers\":helpers,\"partials\":partials})) != null ? stack1 : \"\")\n    + \"    </div>\\n</div>\\n\\n</body>\\n</html>\";\n},\"usePartial\":true,\"useData\":true}","mt":1424853811000,"pt":["menu","content"]},"menu":{"p":"menu","tf":"{\"compiler\":[6,\">= 2.0.0-beta.1\"],\"main\":function(depth0,helpers,partials,data) {\n    var stack1;\n\n  return \"<nav class=\\\"navbar navbar-default navbar-static-top\\\">\\n    <div class=\\\"container-fluid\\\">\\n        <!-- Brand and toggle get grouped for better mobile display -->\\n        <div class=\\\"navbar-header\\\">\\n            <button type=\\\"button\\\" class=\\\"navbar-toggle collapsed\\\" data-toggle=\\\"collapse\\\" data-target=\\\"#bs-example-navbar-collapse-1\\\">\\n                <span class=\\\"sr-only\\\">Toggle navigation</span>\\n                <span class=\\\"icon-bar\\\"></span>\\n                <span class=\\\"icon-bar\\\"></span>\\n                <span class=\\\"icon-bar\\\"></span>\\n            </button>\\n            <a class=\\\"navbar-brand\\\" href=\\\"/index\\\">InFood</a>\\n        </div>\\n\\n        <!-- Collect the nav links, forms, and other content for toggling -->\\n        <div class=\\\"collapse navbar-collapse\\\" id=\\\"bs-example-navbar-collapse-1\\\">\\n            <ul id=\\\"links\\\" class=\\\"nav navbar-nav\\\">\\n                <li><a href=\\\"/index\\\">Заказы</a></li>\\n                <li><a href=\\\"#\\\">Меню</a></li>\\n                <li><a href=\\\"#\\\">Акции</a></li>\\n                <li><a href=\\\"#\\\">Рестораны</a></li>\\n                <li><a href=\\\"/users\\\">Пользователи</a></li>\\n            </ul>\\n            <ul class=\\\"nav navbar-nav navbar-right\\\">\\n                <li class=\\\"dropdown\\\">\\n                    <a href=\\\"#\\\" class=\\\"dropdown-toggle\\\" data-toggle=\\\"dropdown\\\" role=\\\"button\\\" aria-expanded=\\\"false\\\"><i class=\\\"glyphicon glyphicon-user\\\"></i> &nbsp; \"\n    + this.escapeExpression(this.lambda(((stack1 = (depth0 != null ? depth0.user : depth0)) != null ? stack1.login : stack1), depth0))\n    + \" <span class=\\\"caret\\\"></span></a>\\n                    <ul class=\\\"dropdown-menu\\\" role=\\\"menu\\\">\\n                        <li><a href=\\\"#\\\">Профиль</a></li>\\n                        <li class=\\\"divider\\\"></li>\\n                        <li><a id=\\\"logout\\\" href=\\\"#\\\">Выход</a></li>\\n                    </ul>\\n                </li>\\n            </ul>\\n        </div>\\n    </div>\\n</nav>\\n<script>\\n    require([\\\"jquery\\\", \\\"safe\\\", \\\"api\\\", \\\"jquery-block\\\"], function ($, safe, api) {\\n        $(function () {\\n            $( \\\"#links\\\").find('li').each(function() {\\n                var l = $( this);\\n                l.removeClass('active');\\n                if (l.find('a').attr('href') == window.location.pathname)\\n                    l.addClass('active');\\n            });\\n            $('#logout').click(function(){\\n                safe.run(function (cb) {\\n                    api.call(\\\"core.logout\\\", cb);\\n                }, function (err) {\\n                    if (!err)\\n                        window.location.href = '/login';\\n                    else\\n                        appError(err);\\n                });\\n            });\\n        });\\n    });\\n</script>\";\n},\"useData\":true}","mt":1424849031000,"pt":[]},"content":{"p":"content","tf":"{\"compiler\":[6,\">= 2.0.0-beta.1\"],\"main\":function(depth0,helpers,partials,data) {\n    var helper, alias1=helpers.helperMissing, alias2=\"function\", alias3=this.escapeExpression;\n\n  return \"<div class=\\\"container\\\">\\n    <div class=\\\"jumbotron\\\">\\n<h1>\"\n    + alias3(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{\"name\":\"title\",\"hash\":{},\"data\":data}) : helper)))\n    + \"</h1>\\n<p>Welcome to \"\n    + alias3(((helper = (helper = helpers.title || (depth0 != null ? depth0.title : depth0)) != null ? helper : alias1),(typeof helper === alias2 ? helper.call(depth0,{\"name\":\"title\",\"hash\":{},\"data\":data}) : helper)))\n    + \"</p>\\n</div>\\n</div>\";\n},\"useData\":true}","mt":1424849031000,"pt":[]},"hogan":{"v":4,"st":"layout"}}