/**
 * Created by muraty on 30.07.2016.
 */

var express = require('express');
var router = express.Router();

var hurriyetfetcher = require("../src/hurriyet-fetcher.js");

/* GET home page. */
router.get('/hurriyet', function(req, res, next) {

    hurriyetfetcher.fetch();
    // var page = "http://www.hurriyet.com.tr/index/gulben-ergen";
    // console.log("Visiting page " + pageToVisit);

    res.render('index', { title: 'Express' });
});

module.exports = router;
