const axios = require('axios')



function code(baseUrl) {
    return axios.post('https://v2-api.jsdama.com/upload', {
        "softwareId": 20952,
        "softwareSecret": "VpzAmPboXEebypXfhxi7blMA5WHWRocwuDxKnvvn",
        "username": "s15236775230",
        "password": "biubiul.1234",
        "captchaData": baseUrl,
        "captchaType": 1013
    }, {
        headers: {
            Connection: 'keep-alive',
            Accept: ' application/json, text/javascript, */*; q=0.01'
        }
    }).then(res => {
        if (res.data.code === 0) {
            return res.data.data.recognition
        } else {
            return res.data.message
        }
    }).catch(err => {
        return 'err'
    })
}

//下载图片并转为base64
function imgBase64(imgurl) {
    return axios.get(imgurl, { responseType: 'arraybuffer' }).then(res => new Buffer.from(res.data, 'binary').toString('base64'))
}



async function verify(imgUrl) {
    let baseUrl = await imgBase64(imgUrl);
    return await code(baseUrl);
}

module.exports = verify;
// verify('http://www.siteglobalvip.com/service/captcha.html').then(code => {
//     console.log(code);
    
// })
axios.post('http://www.siteglobalvip.com/service/captcha',{number:951},{
    headers: {
        'Transfer-Encoding': 'chunked',
        Cookies: 'PHPSESSID=4hldpgcjo91qq4pdhqv7236ic2',
        Referer: 'http://www.siteglobalvip.com/signup.html?i=S621021'
    }
}).then(r=>{console.log(r.data)})
// axios.post('http://www.siteglobalvip.com/service/sms', { captcha: 978, mobile: 15236775230, action: 'signup' }, {
//         headers: {
//             Cookies: 'PHPSESSID=4hldpgcjo91qq4pdhqv7236ic2',
//             Referer: 'http://www.siteglobalvip.com/signup.html?i=S621021'
//         }
//     }).then(res => {
//         console.log(res.data)
//     })

