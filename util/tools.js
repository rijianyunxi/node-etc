//生成m-n
function rand(min, max) {
    return Math.round(Math.random() * (max - min)) + min
}
//检验时间戳
function sign(d){
    let a = new Date().getTime()+'';
    let b = a.substring(6);
    let c = parseInt(b)
    if(c - parseInt(d) > 60000 || c - parseInt(d) < 0){
        return false
    }else{
        return true
    }
}

//生成invatatio
function invatation(){
    let r = '';
    let arr = [1,2,3,4,5,6,7,8,9,0,'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
    for(let i = 0;i<7;i++){
        r+=arr[rand(0,35)]
    };
    return r
}
module.exports={
    rand,
    sign,
    invatation
}