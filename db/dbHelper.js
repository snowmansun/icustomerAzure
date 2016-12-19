var mssql = require('mssql');
var config = require("config");
var dbHelper = {};

var conString = {
    user: config.user,//'ebestmobile',
    password: config.password,//'Sharepoint@admin',
    server: config.server,//'ga98eyp2ih.database.chinacloudapi.cn',
    database: config.database,//'ICustomer',
    port: config.port,//1433,
    options: {
        encrypt: config.encrypt//true // Use this if you're on Windows Azure  
    },
    pool: {
        min: config.min,//0,
        max: config.max,//10,
        idleTimeoutMillis: config.idleTimeoutMillis// 3000
    }
};  
//执行sql,返回数据.  
dbHelper.query = function (sql, callBack) {
    //var conString = config.conString;
    console.log('[SQL:]', sql, '[:SQL]');
    var connection = new mssql.Connection(config, function (err) {
        if (err) {
            console.log(err);
            return;


        }
        var ps = new mssql.PreparedStatement(connection);
        ps.prepare(sql, function (err) {
            if (err) {
                console.log(err);
                return;
            }
            ps.execute('', function (err, result) {
                if (err) {
                    console.log(err);
                    return;
                }

                ps.unprepare(function (err) {
                    if (err) {
                        console.log(err);
                        callback(err, null);
                        return;
                    }
                    callBack(err, result);
                });
            });
        });
    });
};

dbHelper.getTransaction = function (callback) {
    var connection = new mssql.Connection(conString, function (err) {
        var transaction = new mssql.Transaction(connection);
        callback(mssql, transaction);
    })
};


module.exports = dbHelper;   