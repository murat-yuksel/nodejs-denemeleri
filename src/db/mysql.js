var mysql = require('mysql'),
    Promise = require('bluebird');
Promise.promisifyAll(require("mysql/lib/Connection").prototype);
Promise.promisifyAll(require("mysql/lib/Pool").prototype);

var pool = mysql.createPool({
    connectionLimit: 10,
    dateStrings: 'date',
    host     : 'localhost',
    user     : 'root',
    password : 'root',
    database : 'unluresim'
});

module.exports.mysql = pool;

module.exports.getConnection = function () {
    return pool.getConnectionAsync().disposer(function (conn) {
        conn.release();
    });
};