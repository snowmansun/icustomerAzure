var express = require('express');
var router = express.Router();
var dbHelper = require('../db/dbHelper');

/* GET home page. */
router.post('/login', function (req, res) {
    var model = {
        login: {
            required: true,
            isnull: false
        },
        pwd: {
            required: true,
            isnull: false
        }
    };

    for (var item in model) {

    }

    var query = 'select a.accountnumber customercode,c.name customername,c.accountid ' +
        '     , c.firstname,c.lastname, c.email, c.mobilephone ,u.Username salesrep,u.MobilePhone salesrepphone' +
        ' from contact  c ' +
        ' inner join account a on c.accountid = a.id ' +
        ' inner join [user] u on u.ebMobile__usercode__c = a.ebmobile__salesroute__c ' +
        ' where ebmobile__primary__c= 1 and a.accountnumber = \'503566289\'';
    dbHelper.query(query, function (err, result) {
        if (err) {
            console.error(err);
            return;
        }
            var res_json = {
                token: "9508f2cfb4e24fd98405e46e847166c1",
                expires_in: "7200",
                outlets: [result[0].customercode],
                user_info: {
                    uid: '00128000009h94AAAQ',
                    accountid: result[0].accountid,
                    firstname: result[0].firstname,
                    lastname: result[0].lastname,
                    customername: result[0].customername,
                    salesrepphone: result[0].salesrepphone,
                    mobile: result[0].mobilephone,
                    tel: result[0].phone,
                    address: result[0].ebmobile__address__c,
                    email: result[0].email,
                    head_pic: 'https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=481252135,1456887421&fm=58'
                },
                order_view: 'grid'
            };
            res.json(res_json);

    });
});

router.get('/logout', function (req, res) {
    var res_json = {
        err_code: "0",
        err_msg: "ok"
    }

    res.json(res_json);
});

module.exports = router;