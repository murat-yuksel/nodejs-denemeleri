var mysql = require('./db/mysql');
var Promise = require('bluebird');

var exports = module.exports = {};

exports.slugify = function(text) {
    var trMap = {
        'çÇ':'c',
        'ğĞ':'g',
        'şŞ':'s',
        'üÜ':'u',
        'ıİ':'i',
        'öÖ':'o'
    };
    for(var key in trMap) {
        text = text.replace(new RegExp('['+key+']','g'), trMap[key]);
    }
    return  text.replace(/[^-a-zA-Z0-9\s]+/ig, '') // remove non-alphanumeric chars
        .replace(/\s/gi, "-") // convert spaces to dashes
        .replace(/[-]+/gi, "-") // trim repeated dashes
        .toLowerCase();
};

exports.getUnluList = function () {
    return ['Gülben Ergen', 'Tarkan Tevetoğlu'];
};

exports.getMysqlConnection = function () {
    return mysql.getConnection({
        host     : 'localhost',
        user     : 'root',
        password : 'root',
        database : 'unluresim'
    });
};

exports.dateFormater = function (format, date) {
    var spliter = date.match(/\D/);
    var rawFormat = format.split(spliter, 3);
    var rawDate = date.split(spliter, 3);
    var jsonDate = { day: "", month: "", year: "" };

    if(rawFormat[0].indexOf('m') != -1) {
        jsonDate.month = rawDate[0];
    } else if(rawFormat[0].indexOf('d') != -1) {
        jsonDate.day = rawDate[0];
    } else if(rawFormat[0].indexOf('y') != -1) {
        jsonDate.year = rawDate[0];
    }

    if(rawFormat[1].indexOf('m') != -1) {
        jsonDate.month = rawDate[1];
    } else if(rawFormat[1].indexOf('d') != -1) {
        jsonDate.day = rawDate[1];
    } else if(rawFormat[1].indexOf('y') != -1) {
        jsonDate.year = rawDate[1];
    }

    if(rawFormat[2].indexOf('m') != -1) {
        jsonDate.month = rawDate[2];
    } else if(rawFormat[2].indexOf('d') != -1) {
        jsonDate.day = rawDate[2];
    } else if(rawFormat[2].indexOf('y') != -1) {
        jsonDate.year = rawDate[2];
    }

    if(jsonDate.day.year == 2) {
        jsonDate.day = '20' + jsonDate.day;
    }

    if(jsonDate.month.length == 1) {
        jsonDate.month = '0' + jsonDate.month;
    }

    if(jsonDate.day.length == 1) {
        jsonDate.day = '0' + jsonDate.day;
    }

    return jsonDate.year + '-' + jsonDate.month + '-' + jsonDate.day;
};

exports.insertArticleData = function(data, unluid) {

    return Promise.using(mysql.getConnection(), function (conn) {
        var sql = "INSERT INTO article (`content`, `title`, `image`, `resource`, `unlu`, `created_at`) VALUES ?";
        var values = [
            [data.content, data.title, data.image, data.resource, unluid, new Date().toISOString().slice(0, 19).replace('T', ' ')]
        ];

        conn.query(sql, [values], function(err) {
            if(err) {
                console.error(err + ' .');
            } else {
                console.log('success!');
            }
        });
    });
};