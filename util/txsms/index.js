const axios = require('axios')
const CryptoJS = require("crypto-js")
//生成m-n的随机数
function rand(min, max) {
    return Math.round(Math.random() * (max - min)) + min
}

/**
 * 腾讯云短信v1签名方法的封装
 * 用到了CryptoJS的HmacSHA1和Base64加密
 * 简单思路就是Object.keys()遍历对象得到数组，数组进行assic排序，map遍历用等号拼接键值对，获得新的数组继续拼接用& 继而concat合并数组 继续拼接接用‘’ 
 * 拼接完成之后用CryptoJS加密即可
 * initial.concat(Object.keys(obj).sort((a,b)=>a.localeCompare(b)).map(key=>key+'='+obj[key]).join('&')).join('')
 */
function sign(obj) {
    let initial = ['GET', 'sms.tencentcloudapi.com', '/?'];
    return CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1(initial.concat(Object.keys(obj).sort((a, b) => a.localeCompare(b)).map(key => key + '=' + obj[key]).join('&')).join(''), "Ur5TyLlHvfdifDqtmutieagccjhl8zGx"))
}

//console.log(Object.assign(params,{Signature:sign(params)}));

function sendSms(phone, code, callback1, callback2) {
    let params = {
        Action: 'SendSms',
        Version: '2019-07-11',
        'PhoneNumberSet.0': '+86' + phone,
        TemplateID: '697844',
        SmsSdkAppid: '1400251312',
        Sign: '宋先生在线',
        'TemplateParamSet.0': code,
        Timestamp: Math.round(new Date().getTime() / 1000),
        Nonce: rand(1, 9),
        SecretId: 'AKIDjq93p2F9yo2eGlq6piu8ERBKZvMvRTjA'
    }
    params.Signature = sign(params);
    axios.get('https://sms.tencentcloudapi.com', { params: params }).then(res => {
        callback1(res.data.Response);
    }).catch(err => {
        callback2(err)
    })
}

module.exports = {sendSms,rand};