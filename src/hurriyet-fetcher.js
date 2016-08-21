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
    hurriyetFetch().
    then(fetchUnlulerHurriyet).
    catch(function (err) {
        console.log('ERROR: ' + err.message);
    });
};

var hurriyetFetch = function() {
    return new Promise(function (fulfill, reject) {
        var res = helper.getUnluList();
        fulfill(res);
    });
};

var fetchUnlulerHurriyet = function (names, results) {
    return new Promise(function (fulfill, reject) {
        try {
            while( names.length ) {
                var name = names.pop();
                if(name) {
                    fetchUnluHurriyet(name);
                }
            }
            fulfill(null);
        } catch (e) {
            console.error('Unluleri çekerken sıkıntı oldu', e);
            throw new Error('Unluleri çekerken sıkıntı oldu');
        }
    });
};

var fetchUnluHurriyet = function (name) {
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
                var rawDate = $(this).find('.desc .bottom-line span.date').html();
                data.created_at = helper.dateFormater('d.m.y',rawDate);
                data.resource = 'http://www.hurriyet.com.tr' + $(this).find('.desc h3 a').attr('href');
                // console.log(data);
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
                // if(err) {
                //     console.log('Error: ');
                //     console.log(err);
                // }
                if(results && results.length > 0) {
                    helper.insertArticleData(data, results[0].id);
                }
            });
    });
};