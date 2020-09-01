const express = require('express')

const bodyParser = require('body-parser');

//支付宝付款
const { createOrder, checkOrder } = require('./util/alipay/index')

//腾讯云短信
const { sendSms } = require('./util/txsms/index')

//sfz获取
const sfz = require('./util/arr');

//验证身份证
const verifysfz = require('./util/sfz')

//数据库
const sql = require('./util/mysql/index')

// 工具
const { rand, sign ,invatation } = require('./util/tools')

//jwt token
const { jwtSign, verify } = require('./util/jwt/index')

const app = express();

// 解析 application/json
app.use(bodyParser.json());
// 解析 application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

//跨域
app.all("*", function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "content-type,Authorization");
    res.header("Access-Control-Allow-Methods", "DELETE,PUT,POST,GET,OPTIONS");
    if (req.method.toLowerCase() == 'options')
        res.status(200).send('ok');
    else
        next();
})

app.get('/', (req, res) => {
    console.log('....1')
    res.send('<h1 style="color:red">当面付接口</h1>')
})

app.get('/sfz', (req, res) => {
    res.status(200).send(sfz[req.query.n]);
})

//注册
app.post('/register', (req, res) => {
    let params = req.body;
    if (req.body.sign && sign(req.body.sign)) {
        sql(`select * from code where msgId = "${params.msgId}"`).then(r => {
            if (r[0].code == params.code && new Date().getTime() - r[0].stamp < 300000) {
                sql(`insert into user (uid,nickname,phone,password,tradepassword,invatation,invatationcode,vip,nametrue,coin,usdt) values (uid,"${params.nickname}","${params.phone}","${params.password}","${params.tradepassword}","${params.invatation}","${invatation()}","1","1","0","0")`).then(r => {
                    res.status(200).send({ code: 200, msg: '注册成功' })
                }).catch(e => {
                    res.status(500).send({ code: 500, msg: '服务器异常，请重试' })
                })
            } else {
                res.status(200).send({ code: 401, msg: '验证码错误' })
            }
        }).catch(e => {
            res.status(500).send({ code: 500, msg: '服务器异常，请重试' })
        })
    } else {
        res.status(401).send({ code: 401, msg: "非法请求" });
    }
})

//登陆 
app.post('/login', (req, res) => {
    if (req.body.sign && sign(req.body.sign)) {
        sql(`select uid,password from user where phone = "${req.body.phone}"`).then(r => {
            if (r[0] && r[0].password == req.body.password) {
                res.status(200).send({ code: 200, msg: '登陆成功', token: jwtSign({uid:r[0].uid}) })
            } else {
                res.status(200).send({ code:401, msg: '账号或密码错误，请重试' })
            }
        }).catch(e => {
            console.log(e);
            res.status(500).send({ code: 500, msg: "未知错误，请重试" });
        })
    } else {
        res.status(401).send({ code: 401, msg: "非法请求" });
    }
})

//发送短信接口
app.post('/sms-send', (req, res) => {
    let code = rand(100000, 999999)
    if (req.body.sign && sign(req.body.sign)) {
        sql(`select phone from user where phone = "${req.body.phone}"`).then(r=>{
            if(r[0]){
                res.status(200).send({code:201,msg:"该手机号已被注册"})
            }else{
                sendSms(req.body.phone, code, success => {
                    if (success.SendStatusSet[0].Code == 'Ok') {
                        sql(`insert into code (msgId,code,stamp) values ("${success.RequestId}","${code}","${new Date().getTime()}")`).then(r => {
                            res.status(200).send({code:200,msgId:success.RequestId});
                        }).catch(e => {
                            res.status(500).send({ code: 500, msg: '服务器异常' });
                        })
                    } else {
                        res.status(500).send({ code: 500, msg: '验证码发送失败' });
                    }
                }, error => {
                    res.status(500).send({ code: 500, msg: '服务器异常' });
                })
            }
        }).catch(e=>res.status(500).send({code: 500, msg:"服务器异常"}))
    } else {
        res.status(200).send({ code: 401, msg: '非法请求' })
    }
})



//创建订单
app.get('/pay', (req, res) => {
    let goods = {
        cost: 0.01,
        goodsName: '大保健'
    };
    createOrder(goods).then(resp => {
        console.log(resp);
        res.status(200).send(resp);
    });
})

//查询订单
app.get('/checkPay', (req, res) => {
    let out_trade_no = '1597908959706';
    checkOrder(out_trade_no).then(resp => {
        console.log(resp);
        res.status(200).send(resp);
    })
})

//sfz认证四要素
app.post('/verifysfz', (req, res) => {
    if (req.body.sign && sign(req.body.sign)) {
        sql(`select phone,nametrue from where phone = "${req.body.mobile}"`).then(r=>{
            if(r[0].phone && !vip=="0"){
                verifysfz(req.body, (error, success) => {
                    if (error) {
                        res.status(200).send({ result: 2, msg: '当前火爆，请稍后再试' })
                    } else {
                        if (success.data.result == 0) {
                            res.status(200).send({ result: 0, msg: '认证成功' })
                        } else {
                            res.status(200).send({ result: 1, msg: '请输入正确的信息' })
                        }
                    }
                });
            }else{
                res.status(200).send({ result: 1, msg: '手机号码不匹配,或已经被实名' })
            }
        }).catch(e=>{
            res.status(500).send({code:500,msg:"服务器异常，请重试"})
        })
    }else{
        res.status(401).send({code:401,msg:"非法请求"})
    }
})


app.listen(3000, () => {
    console.log('serve is running on 3000')
})