var express = require('express');
var router = express.Router();
var db = require('../db/db');

router.get('/info', function (req, res) {
    if (!req.query.accountnumber)
        res.json({ err_code: 1, err_msg: 'miss param accountnumber' });

    var query = 'select a.accountnumber customercode,c.name customername,c.accountid ' +
        '     , c.firstname,c.lastname, c.email, c.mobilephone ,u.Username salesrep,u.MobilePhone salesrepphone' +
        ' from contact  c ' +
        ' inner join account a on c.accountid = a.sfid ' +
        ' inner join user u on u.ebMobile__usercode__c = a.ebmobile__salesroute__c ' +
        ' where ebmobile__primary__c= true and a.accountnumber = \'' + req.query.accountnumber + '\'';
    db.query(query).then(function (result) {
        res.json(result.rows);
    }).catch(function (err) {
        console.error(err);
    });
});

router.post('/update', function (req, res) {
    var query = 'update contact set firstname=\'' + req.body.firstname + '\',lastname=\'' + req.body.lastname + '\',email=\'' + req.body.email + '\',mobilephone=\'' + req.body.mobile + '\' where accountid=\'' + req.body.accountid + '\'';
    db.query(query).then(function (result) {
        res.json({ err_code: 0, err_msg: 'insert success!' });
    }).catch(function (err) {
        res.json({ err_code: 1, err_msg: 'insert failed:' + err.message });
    });
});

module.exports = router;