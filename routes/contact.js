﻿var express = require('express');
var router = express.Router();
var dbHelper = require('../db/dbHelper');

router.get('/info', function (req, res) {
    if (!req.query.accountnumber)
        res.json({ err_code: 1, err_msg: 'miss param accountnumber' });

    var query = 'select a.accountnumber customercode,c.name customername,c.accountid ' +
        '     , c.firstname,c.lastname, c.email, c.mobilephone ,u.Username salesrep,u.MobilePhone salesrepphone' +
        ' from contact  c ' +
        ' inner join account a on c.accountid = a.id ' +
        ' inner join [user] u on u.ebMobile__usercode__c = a.ebmobile__salesroute__c ' +
        ' where ebmobile__primary__c= 1 and a.accountnumber = \'' + req.query.accountnumber + '\'  and c.isdeleted=0 and a.isdeleted=0 ';
    dbHelper.query(query, function (err, result) {
        if (err) {
            console.error(err);
            return;
        }
        res.json(result);
    });
});

router.post('/update', function (req, res) {
    var query = 'update contact set SFDCSyncFlag=1,ebMobile__GUID__c=isnull(ebMobile__GUID__c,newid()),firstname=\'' + req.body.firstname + '\',lastname=\'' + req.body.lastname + '\',email=\'' + req.body.email + '\',mobilephone=\'' + req.body.mobile + '\' where accountid=\'' + req.body.accountid + '\' and ebmobile__primary__c= 1 ';
    dbHelper.query(query, function (err, result) {
        if (err) {
            res.json({ err_code: 1, err_msg: 'insert failed:' + err.message });
            return;
        }
        res.json({ err_code: 0, err_msg: 'insert success!' });
    });
});

module.exports = router;