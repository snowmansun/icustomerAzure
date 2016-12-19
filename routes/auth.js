var express = require('express');
var router = express.Router();

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

    var res_json = {
        token: "9508f2cfb4e24fd98405e46e847166c1",
        expires_in: "7200",
        outlets: ['58712312'],
        user_info: {
            uid: '00128000009h94AAAQ',
            name: 'Frank Schneider',
            mobile: '18300000000',
            tel: '021-64682167',
            address: 'NO.21, JALAN 13/10 TAMAN KOPERASI POLIS FASA 1 Kuala Lumpur Malaysia 68100',
            email: 'frank@ebestmobile.com',
            head_pic: 'https://ss1.baidu.com/6ONXsjip0QIZ8tyhnq/it/u=481252135,1456887421&fm=58'
        },
        order_view: 'grid'
    };

    res.json(res_json);
});

router.get('/logout', function (req, res) {
    var res_json = {
        err_code: "0",
        err_msg: "ok"
    }

    res.json(res_json);
});

module.exports = router;