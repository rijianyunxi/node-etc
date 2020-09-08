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
const { rand, sign, invatation, toNumber } = require('./util/tools')

//jwt token
const { jwtSign, verify } = require('./util/jwt/index');

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
    if (req.method.toLowerCase() == 'options') {
        res.status(200).send({ msg: "success" });
    }
    else {
        //req.body.sign && parseInt(sign(req.body.sign),16)
        if (true) {
            next();
        }
        else {
            res.status(401).send({ code: 401, msg: '非法请求' })
        }
    }
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
    sql(`select * from code where msgId = "${params.msgId}" order by stamp desc limit 1`).then(r => {
        if (r[0].code == params.code && new Date().getTime() - r[0].stamp < 300000) {
            sql(`insert into user (uid,nickname,phone,password,tradepassword,invatation,invatationcode,zftrue,nametrue,coin,usdt,suanli,invatate,teamsuanli,registertime) values (uid,"${params.nickname}","${params.phone}","${params.password}","${params.tradepassword}","${params.invatation}","${invatation()}","1","1","0.000","0.000","0.000","0","0.000","${new Date().getTime()}")`).then(r => {
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
})

//登陆 
app.post('/login', (req, res) => {
    sql(`select uid,password from user where phone = "${req.body.phone}"`).then(r => {
        if (r[0] && r[0].password == req.body.password) {
            res.status(200).send({ code: 200, msg: '登陆成功', token: jwtSign({ uid: r[0].uid }) })
        } else {
            res.status(200).send({ code: 401, msg: '账号或密码错误，请重试' })
        }
    }).catch(e => {
        console.log(e);
        res.status(500).send({ code: 500, msg: "未知错误，请重试" });
    })
})

//发送短信接口
app.post('/sms-send', (req, res) => {
    let code = rand(100000, 999999)
    sql(`select phone from user where phone = "${req.body.phone}"`).then(r => {
        if (r[0]) {
            res.status(200).send({ code: 201, msg: "该手机号已被注册" })
        } else {
            sendSms(req.body.phone, code, success => {
                if (success.SendStatusSet[0].Code == 'Ok') {
                    sql(`insert into code (msgId,code,stamp) values ("${success.RequestId}","${code}","${new Date().getTime()}")`).then(r => {
                        res.status(200).send({ code: 200, msgId: success.RequestId });
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
    }).catch(e => res.status(500).send({ code: 500, msg: "服务器异常" }))
})

//sfz认证四要素
app.post('/nametrue', (req, res) => {
    verify(req.headers.authorization, (ee, rr) => {
        if (ee) {
            res.status(401).send({ code: 401, msg: "非法请求" })
        } else {
            sql(`select phone,nametrue from user where uid = ${rr.uid}`).then(r => {
                if (r[0].phone == req.body.mobile && r[0].nametrue == "1") {
                    verifysfz(req.body, (error, success) => {
                        if (error) {
                            res.status(200).send({ result: 3, msg: '当前火爆，请稍后再试' })
                        } else {
                            if (success.data.result == 0) {
                                sql(`update user set name="${req.body.name}",mobile="${req.body.mobile}",bankcard="${req.body.bankcard}",idcard="${req.body.idcard}",nametrue="0" where uid = ${rr.uid}`).then(rrr => {
                                    res.status(200).send({ result: 0, msg: '认证成功' })
                                }).catch(eee => {
                                    console.log(eee);
                                    res.status(500).send({ code: 500, msg: "服务器异常，请重试" })
                                })
                            } else {
                                res.status(200).send({ result: 1, msg: '请输入正确的信息' })
                            }
                        }
                    });
                } else {
                    res.status(200).send({ result: 2, msg: '手机号码不匹配,或已经被实名' })
                }
            }).catch(e => {
                res.status(500).send({ code: 500, msg: "服务器异常，请重试" })
            })
        }
    })
})
//检查是否认证
app.post('/checknametrue', (req, res) => {
    verify(req.headers.authorization, (ee, rr) => {
        if (ee) {
            res.status(401).send({ code: 401, msg: "非法请求" })
        } else {
            sql(`select nametrue,zftrue from user where uid = ${rr.uid}`).then(r => {
                if (r[0]) {
                    res.status(200).send({ code: 200, nametrue: r[0].nametrue, zftrue: r[0].zftrue })
                }
            }).catch(e => {
                res.status(500).send({ code: 500, msg: "服务器错误" })
            })
        }
    });
})
//绑定支付宝
app.post("/bindzfpay", (req, res) => {
    verify(req.headers.authorization, (ee, rr) => {
        if (ee) {
            res.status(401).send({ code: 401, msg: "非法请求" })
        } else {
            sql(`select nametrue,zftrue,invatation from user where uid = ${rr.uid}`).then(r => {
                if (r[0].nametrue == "1") {
                    res.status(200).send({ result: 1, msg: "请先进行实名认证" })
                } else {
                    if (r[0].zftrue == "0") {
                        res.status(200).send({ result: 0, msg: "你已经认证过" })
                    } else {
                        sql(`update  user set zfpay = "${req.body.zfpay}" where uid = "${rr.uid}"`).then(rrr => {
                            sql(`update  user set zftrue = "0" where uid = "${rr.uid}"`).then(rrrr => {
                                sql(`insert into buycomputer (uid,id,name,price,suanli,day,output,date) values ("${rr.uid}","A3820","体验矿机","0.000","0.000","40","10.000","${new Date().getTime()}")`).then(rrrrr => {
                                    sql(`insert into recover (uid,coin,date) values("${rr.uid}","0.000","${new Date().getTime() - 86400000}")`).then(r_ => {
                                        sql(`update user set invatate = invatate*1+1+"" where invatationcode = "${r[0].invatation}"`).then(result => {
                                            res.status(200).send({ result: 0, msg: "支付宝认证成功" });
                                        }).catch(error => {
                                            console.log(error);
                                            res.status(500).send({ code: 500, msg: "服务器错误" })
                                        })
                                    }).catch(e_ => {
                                        res.status(500).send({ code: 500, msg: "服务器错误" })
                                    })
                                }).catch(eeeee => {
                                    res.status(500).send({ code: 500, msg: "服务器错误" })
                                })
                            }).catch(e => {
                                res.status(500).send({ code: 500, msg: "服务器错误" })
                            })
                        }).catch(e => {
                            res.status(500).send({ code: 500, msg: "服务器错误" })
                        })
                    }
                }
            }).catch(e => {
                res.status(500).send({ code: 500, msg: "服务器错误" })
            })
        }
    })
})
//  获取矿机
app.post('/computer', (req, res) => {
    verify(req.headers.authorization, (ee, rr) => {
        if (ee) {
            res.status(401).send({ code: 401, msg: "非法请求" })
        } else {
            sql(`select * from computer`).then(r => {
                res.status(200).send({ code: 200, r })
            }).catch(e => {
                res.status(500).send({ code: 500, msg: "服务器错误" })
            })
        }
    });
})
// 购买矿机
app.post('/buycomputer', (req, res) => {
    verify(req.headers.authorization, (ee, rr) => {
        if (ee) {
            res.status(401).send({ code: 401, msg: "非法请求" })
        } else {
            if (req.body.id == "A3820") {
                res.status(200).send({ code: 200, msg: "此矿机为实名认证赠送，不可购买" })
            } else {
                sql(`select * from computer where id = "${req.body.id}"`).then(r => {
                    if (r[0].id) {
                        sql(`select coin,suanli,invatation from user where uid = "${rr.uid}"`).then(rrr => {
                            if (toNumber(rrr[0].coin) - toNumber(r[0].price) >= 0) {
                                sql(`update user set coin = "${((toNumber(rrr[0].coin) - toNumber(r[0].price)) / 10000).toFixed(3)}",suanli= "${((toNumber(rrr[0].suanli) + toNumber(r[0].suanli)) / 10000).toFixed(3)}" where uid = "${rr.uid}"`).then(rrrr => {
                                    //(teamsuanli*1000+${r[0].suanli}*1000)/1000+"" 
                                    sql(`insert into buycomputer (uid,id,name,price,suanli,day,output,date) values ("${rr.uid}","${r[0].id}","${r[0].name}","${r[0].price}","${r[0].suanli}","${r[0].day}","${r[0].output}","${new Date().getTime()}")`).then(rrrrr => {
                                        sql(`update user set teamsuanli = teamsuanli + ${r[0].suanli} where invatationcode = "${rrr[0].invatation}"`).then(teamsuanli => {
                                            res.status(200).send({ code: 200, msg: "兑换成功" });
                                        }).catch(teamsuanlierr => {
                                            res.status(500).send({ code: 500, msg: "服务器错误" });
                                        })
                                    }).catch(eeeee => {
                                        res.status(500).send({ code: 500, msg: "服务器错误" })
                                    })
                                }).catch(eeee => {
                                    res.status(500).send({ code: 500, msg: "服务器错误" })
                                })
                            } else {
                                res.status(200).send({ code: 200, msg: "你的余额不足以兑换" })
                            }
                        }).catch(eee => {
                            res.status(500).send({ code: 500, msg: "服务器错误" })
                        })
                    }
                }).catch(e => {
                    res.status(500).send({ code: 500, msg: "服务器错误" })
                })
            }
        }
    });
})

//获取已经购买的矿机
app.post("/mycomputer", (req, res) => {
    verify(req.headers.authorization, (ee, rr) => {
        if (ee) {
            res.status(401).send({ code: 401, msg: "非法请求" })
        } else {
            sql(`select id,name,price,suanli,day,output,date from buycomputer where uid = "${rr.uid}"`).then(r => {
                if (r) {
                    let rrr = r.map(result => {
                        if (new Date().getTime() - result.date <= 86400000 * result.day) {
                            Object.assign(result, { status: 0 })
                        } else {
                            Object.assign(result, { status: 1 })
                        }
                        return result
                    })
                    res.status(200).send({ code: 200, msg: "成功", data: rrr })
                } else {
                    res.status(200).send({ code: 200, msg: "成功", data: r })
                }
            }).catch(e => {
                res.status(500).send({ code: 500, msg: "服务器错误" })
            })
        }
    })
})
//挖矿
app.post("/recover", (req, res) => {
    verify(req.headers.authorization, (ee, rr) => {
        if (ee) {
            res.status(401).send({ code: 401, msg: "非法请求" })
        } else {
            sql(`select * from recover where uid = "${rr.uid}" order by date desc limit 1`).then(r => {
                if (r[0].date - new Date(new Date().toLocaleDateString()).getTime() < 0) {
                    sql(`select suanli,day,date from buycomputer where uid = "${rr.uid}"`).then(rrr => {
                        let suanli = rrr.map(item => {
                            if (new Date().getTime() - item.date < (item.day + 1) * 86400000) {
                                return item.suanli * 1
                            }
                        }).reduce((a, b) => a + b);
                        sql(`select invatationcode,invatate,teamsuanli from user where uid = "${rr.uid}"`).then(invatationcode => {
                            sql(`select invatate,teamsuanli from user where invatation = "${invatationcode[0].invatationcode}" and zftrue = "0"`).then(rrrr => {
                                if (rrrr[0]) {
                                    let teaminvatate = rrrr.map(item => item.invatate * 1).reduce((a, b) => a + b);
                                    let teamsuanli = rrrr.map(item => item.teamsuanli * 1).reduce((a, b) => a + b);
                                    // res.send({teaminvatate,teamsuanli});
                                    let coin1 = (0.2 * rrr.length + 0.3 * suanli + (invatationcode[0].invatate * 0.2 + invatationcode[0].teamsuanli * 0.3) * 0.15 + (0.2 * teaminvatate + 0.3 * teamsuanli * 0.1) * 0.05).toFixed(3);
                                    res.status(200).send({ code: 0, recover: coin1 })
                                } else {
                                    let coin2 = (0.2 * rrr.length + 0.3 * suanli).toFixed(3);
                                    res.status(200).send({ code: 0, recover: coin2 })
                                }
                            }).catch(eeee => {
                                res.status(500).send({ code: 500, msg: "服务器错误" })
                            })
                        }).catch(invatationcodeerr => {
                            res.status(500).send({ code: 500, msg: "服务器错误" })
                        })
                        // sql(`update user set suanli = "${suanli.toFixed(2)}" where uid = "${rr.uid}"`).then(rrrr => {
                        //     let coin = (0.2 * rrr.length + 0.3 * suanli).toFixed(3);
                        //     res.status(200).send({ code: 0, r: coin })
                        // }).catch(eeee => {
                        //     res.status(500).send({ code: 500, msg: "服务器错误" })
                        // })
                    }).catch(eee => {
                        res.status(200).send({ code: 2, msg: "请先完成实名，并且绑定支付宝" })
                    })
                } else {
                    res.status(200).send({ code: 1, msg: "挖矿中..." })
                }
            }).catch(e => {
                res.status(200).send({ code: 2, msg: "请先完成实名，并且绑定支付宝" })
            })
        }
    })
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
    let out_trade_no = '1599301388585';
    checkOrder(out_trade_no).then(resp => {
        console.log(resp);
        res.status(200).send(resp);
    })
})


app.listen(3000, () => {
    console.log('serve is running on 3000')
})