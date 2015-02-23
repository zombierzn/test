"use strict";

var util = require("util");
var fs = require("fs");
var moment = require("moment");

var ApiError = module.exports.ApiError = function(message, subject, details) {
    this.code = -14;
    this.name = "ApiError";
    this.message = message;
    this.data = {subject:subject};
    if (details)
        this.data.details = details;

    var logFile = __dirname +'/../../logs/error_' + moment().format("YYYY-MM-DD") + '.log';
    fs.appendFile(logFile, moment().format("HH:mm:ss") + " ApiError:" + new Error(this).stack + "\n\n", function (err) {
        if (err)
            console.log(err.message ? err.message.red : err.red);
    });

    return this;

    //Error.captureStackTrace(this);
};

util.inherits(ApiError, Error);

ApiError.Subject = {
    INVALID_DATA:'InvalidData',
    DUPLICATE_DATA:'DuplicateData',
    INVALID_TOKEN:'InvalidToken',
    ACCESS_DENIED:'AccessDenied',
    NOT_FOUND:'NotFound',
    GENERIC_ERROR:'GenericError',
    ALREADY_LOGGED:'AlreadyLogged'
};

module.exports = ApiError;