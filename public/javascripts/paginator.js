/*global define, $, appError*/
/*jslint nomen : true, browser: true, eqeq : true*/
define(["lodash", "clitpl", "safe"], function (_, tf, safe) {
    "use strict";
    function setPrint(element, index, array) {
        element.printFriendly = 1;
        return element;
    }
    function generatepArr(total, current_page) {
        var ret = {
            ul: []
        };
        for (var i = 1; i<=total; i++){
            ret.ul.push({
                num: i,
                active: (i == current_page + 1)
            });
        }
        return ret;
    }
    var paginator = {
        template: "",
        array: [],
        appendTo: "",
        total: 0,
        current_page: 0,
        perpage: 10,

        initialize : function (_tml, source, perpage, appTo, printFriendly, tplData) {
            $("th.sorted-asc").removeClass("sorted-asc");
            $("th.sorted-desc").removeClass("sorted-desc");
            var self = this, 
                templateData = {};
            self.template = _tml;
            self.source = source;
            if (printFriendly) {
                source.every(setPrint);
            }
            self.perpage = perpage;
            self.appTo = appTo;
            self.current_page = 0;
            if (self.source.length % self.perpage != 0) {
                self.total = Math.floor(self.source.length / self.perpage) + 1;
            } else {
                self.total = Math.floor(self.source.length / self.perpage);
            }
            self.pArr = generatepArr(self.total, self.current_page);
	          templateData = {data: _.clone(self.source).splice(self.current_page * self.perpage, self.perpage)};
	        
	          // additional data for _tml
	          if(tplData) {
		          templateData.tplData = tplData;
	          }
            tf.render(self.template, templateData, safe.sure(appError, function (text, ctx) {
                tf.render("paginator", self.pArr, safe.sure(appError, function (pagi, ctx) {
                    self.appTo.empty();
                    self.appTo.append(text);
                    $(".paginator-case").empty();
                    $(".paginator-case").append(pagi);
                    return false;
                }));
            }));
        },

        sortBy : function (key, asc) {
            var self = this;
            self.source = _.sortBy(self.source, key);
            if (!asc) {
                self.source.reverse();
            }
            tf.render(self.template, {
                data: _.clone(self.source).splice(self.current_page * self.perpage, self.perpage)
            }, safe.sure(appError, function (text, ctx) {
                tf.render("paginator", self.pArr, safe.sure(appError, function (pagi, ctx) {
                    self.appTo.empty();
                    self.appTo.append(text);
                    $(".paginator-case").empty();
                    $(".paginator-case").append(pagi);
                    return false;
                }));
            }));
        },

        moveTo : function (page) {
            var self = this;
            self.current_page = page - 1;
            tf.render(self.template, {
                data: _.clone(self.source).splice(self.current_page * self.perpage, self.perpage)
            }, safe.sure(appError, function (text, ctx) {
                self.appTo.empty();
                self.appTo.append(text);
                return false;
            }));
        },

        renderXls: function (template, cb) {
            var self = this;
            tf.render(template, {
                data: self.source
            }, safe.sure(cb, function (html) {
                cb(null, html);
            }));
        }
    };

    //sortable th
    $("body").on("click", "th", function () {
        if (!$(this).is("[data-sort]")) {
            return false;
        }
        var asc = 0,
            key = $(this).attr("data-sort");
        if ($(this).hasClass("sorted-desc")) {
            asc = 1;
        }
        $("th").removeClass("sorted-desc sorted-asc");
        $(this).addClass((asc ? "sorted-asc" : "sorted-desc"));
        paginator.sortBy(key, asc);
    });

    $("body").on("click", ".pagination li", function () {
        var num = $(this).text();
        $(this).closest("ul").find(".active").removeClass("active");
        $(this).addClass("active");
        paginator.moveTo(num);
    });
    return paginator;
});