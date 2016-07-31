/**
 * Created by muraty on 31.07.2016.
 */

var request = require('request');
var file = require('file-system');
var cheerio = require('cheerio');
var helper = require('../src/helpers');
var fs = require('fs');
var mysql = require('mysql');
var async = require('async');

var exports = module.exports = {};


exports.fetch = function () {
    this.hurriyetFetch().
    then(this.fetchUnlulerHurriyet).
    catch(function (err) {
        console.log('ERROR: ' + err.message);
    });
};

exports.hurriyetFetch = function() {
    return new Promise(function (fulfill, reject) {
        var res = getUnluList();
        fulfill({'names': res, 'results': []});
    });
};

function getUnluList() {
    return ['Gülben Ergen', 'Tarkan Tevetoğlu'];
}

exports.fetchUnlulerHurriyet = function (args) {
    var names = args.names, results = args.results;
    try {
        while( names.length ) {
            var name = names.pop();
            if(name) {
                console.log('Name: ' + name);
                exports.fetchUnluHurriyet(name);
            }
        }
        return null;
    } catch (e) {
        console.error('Unluleri çekerken sıkıntı oldu', e);
        throw new Error('Unluleri çekerken sıkıntı oldu');
    }
};

exports.fetchUnluHurriyet = function (name) {
    var url = "http://www.hurriyet.com.tr/index/" + helper.slugify(name);
    console.log('url: ' + url);

    request.followRedirect = true;
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {

            var $ = cheerio.load(body);
            $('.news').each(function (i, elem) {

                var data = { unlu: '', 'title': '', image: '', content: '', resource: ''};
                data.unlu = name;
                data.title = $(this).find('.desc h3 a').attr('title');
                data.image = $(this).find('img').attr('src');
                data.content = $(this).find('.desc p').html();
                data.resource = 'http://www.hurriyet.com.tr' + $(this).find('.desc h3 a').attr('href');

                exports.persistFetchedData(data);
            });

        } else {
            console.log('200 değil:' + response);
        }
    });
};

exports.persistFetchedData = function (data) {
    // data veritabanına yaz
    console.log(data.unlu);
    exports.connection = mysql.createConnection({
        host     : 'localhost',
        user     : 'root',
        password : 'root',
        database : 'unluresim'
    });
    checkUnluId(data);
    // async.waterfall([
    //     checkUnluId,
    //     insertArticleData
    // ], function (err, result) {
    //     exports.connection.end();
    //     if (err) {
    //         throw err;
    //     }
    //     console.log('success! ' + result);
    // });

    return true;
};

function checkUnluId(data) {
    exports.connection.query('SELECT id FROM unluler WHERE isim = ? LIMIT 1', [data.unlu], function (err, results) {
        exports.insertArticleData(data, results[0].id);
    });
}

exports.insertArticleData = function(data, unluid) {

    var sql = "INSERT INTO article (`content`, `title`, `image`, `resource`, `unlu`, `created_at`) VALUES ?";
    var values = [
        [data.content, data.title, data.image, data.resource, unluid, Date.now()]
    ];

    console.log(values);
    exports.connection.query(sql, [values], function(err) {
        if(err) {
            console.error(err + ' .');
        } else {
            console.log('success!');
        }
    });
};