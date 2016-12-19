var express = require('express');
var router = express.Router();
//var db = require('../db/db');
var dbHelper = require('../db/dbHelper');

/* GET home page. */
router.get('/list', function (req, res) {
    if (!req.query.accountnumber)
        res.json({ err_code: 1, err_msg: 'miss param accountnumber' });
    //var sql =
    //    'SELECT ROW_NUMBER() OVER(order by a.ismusttohave desc,a.ishistorysku desc,a.code) seq,* ' +
    //    'FROM (SELECT' +
    //    '   productcode AS code,' +
    //    '   p.description AS NAME,' +
    //    '   ebmobile__flavor__c AS flavor,' +
    //    '   ebmobile__pack__c AS package,' +
    //    '   ebmobile__brand__c AS brand,' +
    //    '   uom.ebmobile__denominator__c as denominator,' +
    //    '   am.id as pic,' +
    //    //'   \'00P2800000208xQEAQ\' as pic,' +
    //    '   0 as price,' +
    //    '   case when mh.ebmobile__product__c is not null then 1 else 0 end as isMusttohave, ' +
    //    '   case when oi.ebmobile__product2__c is not null then 1 else 0 end as isHistorySku ' +
    //    'FROM' +
    //    '   product2 p ' +
    //    '   inner join ebmobile__productuom__c uom on p.id = uom.ebmobile__productid__c and uom.ebmobile__isactive__c=1 and ebmobile__uomcode__c= \'EA\' ' +
    //    '   left join ( ' +
    //    '       select distinct mh.ebmobile__product__c ' +
    //    '       from ebmobile__accountgroupitem__c agi ' +
    //    '       inner join ebmobile__accountgroup__c ag on agi.ebmobile__accountgroup__c = ag.id and ag.ebmobile__type__c = \'RED Survey\' ' +
    //    '       inner join ebmobile__musttohave__c mh on mh.ebmobile__accountgroup__c = ag.id and mh.ebmobile__isActive__c = 1 ' +
    //    '       inner join account ac on ac.id=agi.ebmobile__account__c ' +
    //    '       where ac.accountnumber = \'' + req.query.accountnumber + '\' ' +
    //    '   ) mh on mh.ebmobile__Product__c = p.id  ' +
    //    '   left join ( ' +
    //    '       select distinct oi.ebmobile__product2__c ' +
    //    '       from orderitem oi ' +
    //    '       inner join ( ' +
    //    '           select top 5 o.ebmobile__ordernumber__c from [order] o ' +
    //    '           inner join account ac on ac.id = o.accountid ' +
    //    '           where ac.accountnumber= \'' + req.query.accountnumber + '\' ' +
    //    '           order by o.ebmobile__orderdate__c desc ' +
    //    '       ) o on oi.ebmobile__ordernumber__c = o.ebmobile__ordernumber__c ' +
    //    '   ) oi on oi.ebmobile__product2__c=p.id ' +
    //    '   left join attachment am ON am.parentid = p.id  AND am.isDeleted=0 '+
    //    //'   (' +
    //    //'       select am.parentid, am.id ' +
    //    //'       from attachment am ' +
    //    //'       INNER JOIN( ' +
    //    //'           select productcode, am.parentid, max(am.lastmodifieddate) lastmodifieddate ' +
    //    //'           from product2 p ' +
    //    //'		        inner join attachment  am on am.parentid = p.id and am.isdeleted = 0 ' +
    //    //'           where p.isactive = 1 ' +
    //    //'           group by productcode, am.parentid ' +
    //    //'       ) a on am.parentid = a.parentid and am.lastmodifieddate = a.lastmodifieddate ' +
    //    //'   ) am on am.parentid = p.id  ' +
    //    'Where p.isactive = 1) a ' +
    //    'order by a.ismusttohave desc,a.ishistorysku desc,a.code ';

    //dbHelper.query(sql, function (err, result) {
    //    if (err) {
    //        console.error(err);
    //        return;
    //    }
    //    res.json(result);
    //});
    var res_json = {
        product_code: '101636',
        name: 'test',
    };
    res.json(res_json);
});

/* GET home page. */
router.get('/attr', function (req, res) {
    //var sql_brand = 'SELECT DISTINCT ebmobile__brand__c as name,null as pic from product2 where ebmobile__brand__c is not NULL';
    //var sql_flavor = 'SELECT DISTINCT ebmobile__flavor__c as name,null as pic from product2 where ebmobile__flavor__c is not NULL';
    //var sql_pack = 'SELECT DISTINCT ebmobile__pack__c as name,null as pic from product2 where ebmobile__pack__c is not NULL';
    var sql_brand =
        'SELECT ebMobile__PicklistValue__c "name", am.id pic ' +
        'FROM ebMobile__PickListMaster__c pm ' +
        'left join attachment  am on am.parentid = pm.id ' +
        'where pm.ebmobile__fieldname__c = \'ebMobile__Brand__c\' and pm.ebmobile__objectname__c = \'Product2\' and pm.ebmobile__isactive__c=1';
    var sql_flavor =
        'SELECT ebMobile__PicklistValue__c "name",am.id pic ' +
        'FROM ebMobile__PickListMaster__c pm ' +
        'left join attachment  am on am.parentid = pm.id ' +
        'where pm.ebmobile__fieldname__c = \'ebMobile__Flavor__c\' and pm.ebmobile__objectname__c = \'Product2\' and pm.ebmobile__isactive__c=1';
    var sql_pack =
        'SELECT ebMobile__PicklistValue__c "name", am.id pic ' +
        'FROM ebMobile__PickListMaster__c pm ' +
        'left join attachment  am on am.parentid = pm.id ' +
        'where pm.ebmobile__fieldname__c = \'ebMobile__Pack__c\' and pm.ebmobile__objectname__c = \'Product2\' and pm.ebmobile__isactive__c=1';

    var res_json = {
        brand: '',
        flavor: '',
        pack: ''
    }

    dbHelper.query(sql_brand, function (err, result) {
        if (err) {
            console.error(err);
            return;
        }
        res_json.brand = result;
        dbHelper.query(sql_flavor, function (err, result) {
            if (err) {
                console.error(err);
                return;
            }
            res_json.flavor = result;
            dbHelper.query(sql_pack, function (err, result) {
                if (err) {
                    console.error(err);
                    return;
                }
                res_json.pack = result;
                res.json(res_json);
            });
        });
    });
});

module.exports = router;