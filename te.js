const express = require('express')
const axios = require('axios')
const app = express();
//static
app.get('/', express.static('public'));

app.get('/cha', (req, res) => {
    axios.post('https://api.trongrid.io/wallet/createaccount', {
        owner_address: '41493ee7584113ab5062dd9461d58c0800df2bd1b4',
        account_address: '4146592b7e37b4932183f6e03c8d06c525070e29e6',
        visible: false
    }, {
        headers: {
            'content-type': 'application/json'
        }
    }).then(r => {
        axios.post('https://api.trongrid.io/wallet/gettransactionsign', {
            transaction: {
                raw_data: r.data.raw_data,
                txID: r.data.txID,
                raw_data_hex: r.data.raw_data_hex
            },
            privateKey: "cbe581cf4dc751da38908a6f164b45af1ab870c537bdd66a16c7db45da3d3b1e"
        }).then(rr => {
            // res.send(rr.data)
            axios.post("https://api.trongrid.io/wallet/broadcasttransaction", {
                raw_data: rr.data.raw_data,
                txID: rr.data.txID,
                raw_data_hex: rr.data.raw_data_hex,
                signature: rr.data.signature
            }).then(rrr => {
                res.send(rrr.data)
            })
        })
    })
})

app.get("/pay", (req, res) => {
    axios.post("https://api.trongrid.io/wallet/transferasset", {
        owner_address: "41d1e7a6bc354106cb410e65ff8b181c600ff14292",
        to_address: "41e552f6487585c2b58bc2c9bb4492bc1f17132cd0",
        asset_name: "0a02616c22085206423380cc41fd40b0afa4d4a42e5a6d081f12690a31747970652e676f6f676c65617069732e636f6d2f70726f746f636f6c2e54726967676572536d617274436f6e747261637412340a1541977c20977f412c2a1aa4ef3d49fee5ec4c31cdfb1215419e62be7f4f103c36507cb2a753418791b1cdc182220406fdde0370a4e4a0d4a42e",
        amount: 1
    }).then(r=>{
        res.send(JSON.stringify(r.data))
    }).catch(e=>{
        console.log(e)
    })
})
app.get("/a", (req, res) => {
    axios.post("https://api.trongrid.io/wallet/easytransferbyprivate", {
        privateKey: "cbe581cf4dc751da38908a6f164b45af1ab870c537bdd66a16c7db45da3d3b1e",
        toAddress: "4146592b7e37b4932183f6e03c8d06c525070e29e6",
        // token: "USDT",
        amount: 1
    }).then(r=>{
        res.send(JSON.stringify(r.data))
    }).catch(e=>{
        console.log(e)
    })
})

app.listen(8888, () => {
    console.log('服务器已启动，端口：8888')
})