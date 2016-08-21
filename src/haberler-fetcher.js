/**
 * Created by muraty on 31.07.2016.
 */

var request = require('request');
var file = require('file-system');
var cheerio = require('cheerio');
var Promise = require('bluebird');
var helper = require('../src/helpers');
var fs = require('fs');
var mysql = require('./db/mysql');

var exports = module.exports = {};


exports.fetch = function () {
    haberlerFetch().
    then(fetchUnlulerHaberler).
    catch(function (err) {
        console.log('ERROR: ' + err.message);
    });
};

var haberlerFetch = function() {
    return new Promise(function (fulfill, reject) {
        var res = helper.getUnluList();
        fulfill(res);
    });
};

var fetchUnlulerHaberler = function (names) {
    return new Promise(function (fulfill, reject) {
        try {
            while( names.length ) {
                var name = names.pop();
                if(name) {
                    fetchUnluHaberler(name);
                }
            }
            fulfill(null);
        } catch (e) {
            console.error('Unluleri çekerken sıkıntı oldu', e);
            throw new Error('Unluleri çekerken sıkıntı oldu');
        }
    });
};

var fetchUnluHaberler = function (name) {
    var url = "http://www.haberler.com/" + helper.slugify(name);
    console.log('url: ' + url);

    request.followRedirect = true;
    request(url, function (error, response, body) {
        if (!error && response.statusCode == 200) {

            var $ = cheerio.load(body);
            $('.type1').each(function (i, elem) {

                var data = { unlu: '', 'title': '', image: '', content: '', resource: ''};
                data.unlu = name;
                data.title = $(this).find('.hbrListLink').attr('title');
                var image = $(this).find('.divboximgA > img').attr('data-original');
                data.image = image ? image : '';
                var content = $(this).find('.desc p').html();
                data.content = content ? content : '';
                data.resource = $(this).find('.hbrListLink').attr('href');

                console.log(data);
                exports.persistFetchedData(data);
            });

        } else {
            console.log('200 değil:' + response);
        }
    });
};

exports.persistFetchedData = function (data) {
    return Promise.using(mysql.getConnection(), function (conn) {
        conn.queryAsync('SELECT id FROM unluler WHERE isim = ? LIMIT 1', [data.unlu])
            .then(function (results) {
                if(results && results.length > 0) {
                    helper.insertArticleData(data, results[0].id);
                }
            });
    });
};