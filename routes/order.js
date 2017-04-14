var express = require('express');
var router = express.Router();
//var db = require('../db/db');
var dbHelper = require('../db/dbHelper');
var uuid = require('node-uuid');
var sd = require('silly-datetime'); 
var async = require('async');  

router.post('/', function (req, res) {
    var sql = 'select ebmobile__ordernumber__c from [order] where ebmobile__ordernumber__c=\'' + req.body.order_no + '\'';
    dbHelper.query(sql, function (err, OrderNumber) {
        if (err) {
            console.error(err);
            return;
        }
        if (OrderNumber.length == 0) {
            var time = sd.format(new Date(), 'YYYY-MM-DD');
            var guid = uuid.v4();
            var sqlHeader = 'insert into [order](ebMobile__OrderNumber__c,' +
                '       SFDCSyncFlag,'+
                '       ebmobile__erpordernumber__c,' +
                '       ebmobile__guid__c,' +
                '       accountid,' +
                '       TYPE,' +
                '       ebmobile__orderdate__c,' +
                '       ebMobile__TotalQuantity__c,' +
                '       ebmobile__totalquantitycs__c,' +
                '       ebmobile__totalquantityea__c,' +
                '       ebmobile__totalamount__c,' +
                '       totalamount,' +
                '       ebmobile__taxamount__c,' +
                '       ebmobile__netamount__c,' +
                '       ebmobile__discamount__c,' +
                '       ebmobile__deliverydate__c,' +
                '       ebmobile__deliverynotes__c,' +
                '       Status,' +
                '       ebmobile__isactive__c, ' +
                '       effectivedate)' +
                '   VALUES(\'' + req.body.order_no + '\',' +
                '       1,'+
                '       \'' + req.body.order_no + '\',' +
                '       \'' + guid + '\',' +
                '       \'' + req.body.outlet_id + '\',' +
                '       \'' + req.body.order_type + '\',' +
                //'       \'' + new Date(req.body.order_date).toISOString() + '\',' +
                '       \'' + req.body.order_date + '\',' +
                '       ' + req.body.qty + ',' +
                '       ' + req.body.qty_cs + ',' +
                '       ' + req.body.qty_ea + ',' +
                '       ' + req.body.total_price + ',' +
                '       ' + req.body.total_price + ',' +
                '       ' + req.body.tax + ',' +
                '       ' + req.body.net_price + ',' +
                '       ' + req.body.discount + ',' +
                '       \'' + req.body.delivery_date + '\',' +
                '       N\'' + req.body.delivery_note + '\',' +
                '       \'' + req.body.status + '\',' +
                '       1,' +
                '       \'' + time+'\')';
            dbHelper.getTransaction(function (sql, transaction) {
                transaction.begin(function (err) {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    //定义一个变量,如果自动回滚,则监听回滚事件并修改为true,无须手动回滚  
                    var rolledBack = false;

                    //监听回滚事件  
                    transaction.on('rollback', function (aborted) {
                        console.log('监听回滚');
                        console.log('aborted值 :', aborted);
                        rolledBack = true;
                    });

                    //监听提交事件  
                    transaction.on('commit', function () {
                        console.log('监听提交');
                        rolledBack = true;
                    });

                    var request = new sql.Request(transaction);

                    var tasks = [];
                    tasks[0] = function (callback) {
                        console.log("sql[0]:" + sqlHeader);
                        request.query(sqlHeader, function (err, result) {
                            if (err) {
                                console.log(err);
                                callback(err, null);
                                return;
                            }
                            console.log('第1条语句成功');
                            callback(null, result)
                        })
                    };  

                    var sqlItem = '';
                    var sqlProduct = '';
                    var items = req.body.items
                    var i = 1;
                    var seq = 0;
                    items.forEach(function (item) {
                        tasks.push(function (callback) {
                            seq++;
                            var itemSequence = ('00000' + (seq * 10).toString());
                            itemSequence = itemSequence.substring(itemSequence.length - 5, itemSequence.length);

                            sqlItem = 'declare @pId nvarchar(50) select @pId = id from product2 where productcode=\'' + item.product_code + '\' ' +
                                '   insert into orderitem(ebMobile__OrderNumber__c, ' +
                                '       SFDCSyncFlag,' +
                                '		ebmobile__product2__c,' +
                                '       ebmobile__orderdate__c,' +
                                '       ebmobile__uomcode__c,' +
                                '       ebmobile__orderquantity__c,' +
                                '       quantity,' +
                                '       unitprice,' +
                                '       ebMobile__LineAmount__c,' +
                                '       ebMobile__LineNetAmount__c,' +
                                '       ebMobile__LineTaxAmount__c,' +
                                '       ebmobile__isactive__c,' +
                                '       ebmobile__orderitemstatus__c,' +
                                '       ebMobile__LineDiscAmount__c,' +
                                '       ebmobile__guid__c, ' +
                                '       ebMobile__ItemSequence__c)' +
                                '   values(\'' + req.body.order_no + '\',' +
                                '       1,'+
                                '       @pId,' +
                                //'       \'' + new Date(req.body.order_date).toISOString() + '\',' +
                                '       \'' + req.body.order_date + '\',' +
                                '       \'' + item.uom_code + '\',' +
                                '       \'' + item.qty + '\',' +
                                '       \'' + item.qty + '\',' +
                                '       \'' + item.unit_price + '\',' +
                                '       ' + item.lineamount + ',' +
                                '       ' + item.linenetamount + ',' +
                                '       ' + item.linetaxamount + ',' +
                                '       1,' +
                                '       \'' + req.body.status+'\',' +
                                '       \'' + item.discount + '\',' +
                                '        \'' + uuid.v4() + '\', ' +
                                '       \'' + itemSequence + '\')';

                            console.log("sql[" + i + "]:" + sqlItem);
                            request.query(sqlItem, function (err, result) {
                                if (err) {
                                    console.log(err);
                                    callback(err, null);
                                    return;
                                }
                                console.log('第' + (i + 1) + '条语句成功');
                                callback(null, result)
                                i++;
                            });
                        });
                    });

                    async.series(tasks, function (err, result) {
                        if (err) {
                            console.log('出现错误,执行回滚');
                            if (!rolledBack) {
                                //如果sql语句错误会自动回滚,如果程序错误手动执行回滚,不然事物会一致挂起.  
                                transaction.rollback(function (err) {
                                    if (err) {
                                        console.log('rollback err :', err);
                                        return;
                                    }
                                    console.log('回滚成功');
                                });
                            }
                            res.json({ err_code: 1, err_msg: err });
                        } else {
                            console.log('无错误,执行提交');
                            //执行提交  
                            transaction.commit(function (err) {
                                if (err) {
                                    console.log('commit err :', err);
                                    return;
                                }
                                console.log('提交成功');
                                res.json({ err_code: 0, err_msg: 'insert success!' });
                            });
                        }
                    });
                });
            });
        }
        else {
            res.json({ err_code: 2, err_msg: 'order_no have exists.'});
        }
    });


    //var res_jsons = {
    //    "order_no": "20161212000001",                      // ebMobile__OrderNumber__c
    //    "outlet_id": "00128000009h94AAAQ",          // accountid
    //    "order_type":"Sales Order",                 // Type
    //    "user_code": "13811981123",                 //
    //    "order_date": "2016-12-09 15:56",           // ebmobile__orderdate__c
    //    "qty_cs": "12",                             // ebmobile__totalquantitycs__c
    //    "qty_ea": "8",                              // ebmobile__totalquantityea__c
    //    "total_price": "86.4",                      // ebmobile__totalamount__c
    //    "tax": "10.6",                              // ebmobile__taxamount__c
    //    "net_price": "87.00",                       // ebmobile__netamount__c
    //    "discount": "10",                           // ebmobile__discamount__c
    //    "delivery_date": "2016-12-09",              // ebmobile__deliverydate__c
    //    "delivery_note": "",                        // ebmobile__deliverynotes__c
    //    "status":"New",                             // Status
    //    "items": [                                  
    //        {                                       
    //            "product_code": "00000131",         // ebmobile__product2__c
    //            "uom_code": "cs",                   // ebmobile__uomcode__c
    //            "qty": "8",                         // ebmobile__orderquantity__c
    //            "unit_price": "5.0",                // unitprice
    //            "discount": "5.2"                   // ebemobile__LineDiscAmount__c
    //            "lineamount": "5.3"                   // ebMobile__LineAmount__c
    //            "linenetamount": "5.4"                   // ebMobile__LineNetAmount__c
    //            "linetaxamount": "5.5"                   // ebMobile__LineTaxAmount__c
    //        }
    //    ]
    //};

});

router.get('/download', function (req, res) {
    if (!req.query.accountnumber)
        res.json({ err_code: 1, err_msg: 'miss param accountnumber' });

    var sql = 'select top 10 COALESCE(o.ordernumber,o.ebmobile__ordernumber__c) order_no, ' +
        '     o.accountid outlet_id, ' +
        '     o."type" order_type, ' +
        '     CONVERT(VARCHAR(19),o.ebmobile__orderdate__c,120) order_date, ' +
        '     o.ebMobile__TotalQuantity__c qty,' +
        '     o.ebmobile__totalquantitycs__c qty_cs, ' +
        '     o.ebmobile__totalquantityea__c qty_ea, ' +
        '     o.ebmobile__totalamount__c total_price, ' +
        '     o.ebmobile__taxamount__c tax, ' +
        '     o.ebmobile__netamount__c net_price, ' +
        '     o.ebmobile__discamount__c discount, ' +
        '     CONVERT(VARCHAR(10),o.ebmobile__deliverydate__c,120) delivery_date, ' +
        '     o.ebmobile__deliverynotes__c delivery_note, ' +
        '     o.Status status, ' +

        '     \'John Hanson\' salesrep, ' +
        '     \'13510738521\' salesrepphone, ' +
        '     \'Bruce White\' deliveryman, ' +
        '     \'13910363500\' deliverymanphone, ' +
        '     \'400-3838438\' callcenter, ' +
        '     \'INV000004562\' invoicenumber, ' +
        '     \'Cash\' paymentmethod, ' +
        '     \'2016-08-31\' lastpaymentdate, ' +
        '     \'100.00\' amountpaid, ' +
        '     \'40.02\' amountdue, ' +
         
        '     pt.name product_code, ' + 
        '     ebmobile__uomcode__c uom_code, ' + 
        '     ebmobile__orderquantity__c item_qty, ' + 
        '     unitprice unit_price, ' + 
        '     oi.ebmobile__LineDiscAmount__c itemdiscount, ' +
        '     isnull(oi.ebMobile__LineAmount__c,0) lineamount, ' +
        '     isnull(oi.ebMobile__LineNetAmount__c,0) linenetamount, ' +
        '     isnull(oi.ebMobile__LineTaxAmount__c,0) linetaxamount, ' + 
        '     am.id as pic '+
        ' from [order] o ' +
        '   inner join account a on o.accountid = a.id ' +
        '   inner join orderitem oi on oi.ebmobile__ordernumber__c = o.ebmobile__ordernumber__c ' +
        '   inner join product2 pt on pt.id = oi.ebmobile__product2__c ' +
        '   left join attachment am ON am.parentid = pt.id  AND am.isdeleted=0 '+
        //' ('+
        //'    select am.parentid, am.id ' +
        //'    from attachment am  ' +
        //'    INNER JOIN( ' +
        //'       select productcode, am.parentid, max(am.lastmodifieddate) lastmodifieddate  ' +
        //'	    from product2 p  ' +
        //'	       inner join attachment  am on am.parentid = p.id and am.isdeleted = false  ' +
        //'	    where p.isactive = TRUE  ' +
        //'	    group by productcode, am.parentid ' +
        //'    ) a on am.parentid = a.parentid and am.lastmodifieddate = a.lastmodifieddate  ' +
        //' ) am on am.parentid = pt.id '+
        ' where a.accountnumber = \'' + req.query.accountnumber + '\' and o.ebMobile__IsActive__c=1 ' +
        ' and o.ebmobile__orderdate__c> dateadd(month,-6,GETDATE()) order by o.ebmobile__orderdate__c desc';

    dbHelper.query(sql, function (err,resOrder) {
        if (err) {
            console.error(err);
            return;
        }
        if (resOrder.length > 0) {
            var res_jsons = [];
            var lastOrderNumber = '';
            var res_json = {};
            resOrder.forEach(function (row) {
                if (lastOrderNumber == row.order_no) {
                    var itemJson = {
                        "product_code": row.product_code,
                        "uom_code": row.uom_code,
                        "qty": row.item_qty,
                        "unit_price": row.unit_price,
                        "discount": row.itemdiscount,
                        "lineamount": row.lineamount,
                        "linenetamount": row.linenetamount,
                        "linetaxamount": row.linetaxamount,
                        "pic": row.pic
                    };
                    res_json.items.push(itemJson);
                }
                else {
                    if (lastOrderNumber != '') {
                        res_jsons.push(res_json);
                        res_json = {};
                    }
                    
                    res_json = {
                        "order_no": row.order_no,
                        "outlet_id": row.outlet_id,
                        "order_type": row.order_type,
                        "user_code": row.user_code,
                        //"order_date": new Date(row.order_date).toLocaleString(),
                        "order_date": row.order_date,
                        "qty": row.qty,
                        "qty_cs": row.qty_cs,
                        "qty_ea": row.qty_ea,
                        "total_price": row.total_price,
                        "tax": row.tax,
                        "net_price": row.net_price,
                        "discount": row.discount,
                        //"delivery_date": new Date(row.delivery_date).toLocaleString(),
                        "delivery_date": row.delivery_date,
                        "delivery_note": row.delivery_note,
                        "status": row.status,

                        "salesRep": row.salesrep,
                        "salesRepPhone": row.salesrepphone,
                        "deliveryman": row.deliveryman,
                        "deliverymanPhone": row.deliverymanphone,
                        "callCenter": row.callcenter,
                        "invoiceNumber": row.invoicenumber,
                        "paymentMethod": row.paymentmethod,
                        "lastPaymentDate": row.lastpaymentdate,
                        "amountPaid": row.amountpaid,
                        "amountDue": row.amountdue,
                        "items": [
                            {
                                "product_code": row.product_code,
                                "uom_code": row.uom_code,
                                "qty": row.item_qty,
                                "unit_price": row.unit_price,
                                "discount": row.itemdiscount,
                                "lineamount": row.lineamount,
                                "linenetamount": row.linenetamount,
                                "linetaxamount": row.linetaxamount,
                                "pic": row.pic
                            }
                        ]
                    };
                }
                lastOrderNumber = row.order_no;
            });
            res_jsons.push(res_json);
            res.json(res_jsons);
        }
        else {
            res.json([]);
        }
    });

});

router.get('/orderdetails', function (req, res) {
    if (!req.query.order_no)
        res.json({ err_code: 1, err_msg: 'miss param order_no' });

    var sql = 'select \'' + req.query.order_no + '\' order_no, '+
        '     \'John Hanson\' salesrep, ' +
        '     \'13510738521\' salesrepphone, ' +
        '     \'Bruce White\' deliveryman, ' +
        '     \'13910363500\' deliverymanphone, ' +
        '     \'400-3838438\' callcenter, ' +

        '     \'INV000004562\' invoicenumber, ' +
        '     \'Cash\' paymentmethod, ' +
        '     \'2016-08-31\' lastpaymentdate, ' +
        '     \'100.00\' amountpaid, ' +
        '     \'40.02\' amountdue';

    dbHelper.query(sql,function (err, result) {
        if (err) {
            console.error(err);
            return;
        }
        if (result.length > 0) {
            res.json(result[0]);
        }
        else {
            res.json({});
        }
    });

});

module.exports = router;