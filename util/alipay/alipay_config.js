const fs = require('fs');
const path = require('path');
const AlipayBaseConfig = {
    appId: '2021001143662511', // 应用 ID
    privateKey: fs.readFileSync(path.join(__dirname, './siyao.txt'), 'ascii'), // 应用私钥
    alipayPublicKey: 'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA5bER5dRIOBRvMce1xk/R19pf6K42AcsedsQ5sW//FvcVJVKO8OVRQ40tHTeGi4r6lvBzZ+qPemS+WfOOAwn00Ufz7Ft8nqKKTNT+wXzoEPD9uh/en2NeQh2Di6HWCuYVLnkxMklUTx47+tRyRJUTd7oJZrXcA7LhT/gK7Fkgon3pRMd8NRHxQBrmkhBM27wJKzMVzOojZ91bc7u7rraUW9mRyilwokdJBvxFOh04+zO6pfnEAzAeKaPcOFJA1jnoXghdV4yNLBqsiWnFiXWbbgxqWVum+T77irbMs1boz00DkD/4QmPjXwBvQYW3jZoPow7EFTePRY1df+6SxSNs5wIDAQAB',// 支付宝公钥
    gateway: 'https://openapi.alipay.com/gateway.do', // 支付宝的应用网关
    charset:'utf-8',
    version:'1.0',
    signType:'RSA2'
};
module.exports = AlipayBaseConfig;