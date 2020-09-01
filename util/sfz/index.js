
const request = require('superagent')

function sfz(obj,callback) {
    request
        .get(`http://bankcard4c.shumaidata.com/bankcard4c?idcard=${obj.idcard}&mobile=${obj.mobile}&name=${encodeURIComponent(obj.name)}&bankcard=${obj.bankcard}`)
        .set('Authorization', 'APPCODE 6d29b981492b43858a30d224c6776086')
        .end(function (err, res) {
            callback(err,res.body)
        });
}

module.exports= sfz;

let obj = {
    idcard:'410881199802235530',
    mobile:'15236775230',
    bankcard:'6230520400051030476',
    name:'宋金涛'
}
