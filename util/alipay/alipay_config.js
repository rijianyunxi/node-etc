const fs = require('fs');
const path = require('path');
const AlipayBaseConfig = {
    // appId: '2021001143662511', // 应用 ID
    appId: '2018080460925153', // 应用 ID
    privateKey: fs.readFileSync(path.join(__dirname, './siyao_1.txt'), 'ascii'), // 应用私钥
    alipayPublicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAqz755B4td1qGUuJfzidBqBerZ/jyoFrotpEokLTt92eKaJgEeEKfHSAxsSBsH3M4kRCQNF7T6WdESKmvUh0C5z2kANHd+y09zi4ndB6/LTunl5R+ePNyGUqNSu4CCqPFMdMzfTmCCM92q6fQrJjT/CeqtbrfT+L/SqJL00ZInrUIxX56LHFf2e0OLVQJNNKJiJkqXDTQpW50HPCLQNdOmP6G35OaFVEKG0jFtRICAz03D49sD+e6+NIoZdrB8m3frnj+Qz3p3kyJslai2Dr35jzJrsycnWNzCFsNEsMIm4XJkghrsaiKReq1vXfM8aG533kdQhpPe4IwE+8H5lrcAQIDAQAB',// 支付宝公钥
    gateway: 'https://openapi.alipay.com/gateway.do', // 支付宝的应用网关
    charset:'utf-8',
    version:'1.0',
    signType:'RSA2'
};
module.exports = AlipayBaseConfig;