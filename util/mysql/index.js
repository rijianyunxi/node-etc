const mysql = require("mysql")

const connection = mysql.createConnection({
    host: "47.94.174.190", //远程地址，本地MySQL是localhost
    user: "SJT",
    password: "biubiul.1234",
    database: 'SJT'
})

connection.connect(function (err) {
    if (err) {
        console.log(err);
        console.log("连接错误");
    }else{
        console.log("成功连接MySQL")
    }
})

function sql(query) {    
    return new Promise((resolve,reject)=>{
        connection.query(query, (e, r) => {
            if (!e) {
                resolve(r);
            } else {
                reject(e);
            }
        })
    })
}


module.exports = sql;
// let params={
//     nickname:"songjintao",
//     phone:"15236775230",
//     password:"biubiul.1234",
//     tradepassword:"707198",
//     yaoqingren:"15236775230",
//     yaoqingma:'15236775230'
// }
// console.log('----------------------------------------');
// sql(`insert into user (uid,nickname,phone,password,tradepassword,yaoqingren) values (uid,"${params.nickname}","${params.phone}","${params.password}","${params.tradepassword}","${params.yaoqingren}")`).then(r=>{
//     console.log(r);
// }).catch(e=>{
//     console.log(e);
// })