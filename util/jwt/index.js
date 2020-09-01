const jwt = require('jsonwebtoken');

const secret = 'biubiul.1234';

function jwtSign(obj){
    return jwt.sign( obj, secret, { expiresIn: '30d' });
}

function verify(token,callback){
    jwt.verify(token, secret, (e, r)=>{
        callback(e,r)
    });
}

// verify('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIxMjM0NTYiLCJpYXQiOjE1OTgyODE3NjYsImV4cCI6MTU5ODg4NjU2Nn0.6TUvZum3z--thGSF5_PZJ2iQS0ojCZ_fzQ0ziA-lb3E',(err,res)=>{
//     if(err){
//         console.log('无效token');
//     }else{
//         console.log(res);
//     }
// })

module.exports = {
    jwtSign,
    verify
}