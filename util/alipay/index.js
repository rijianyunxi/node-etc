//引入阿里支付sdk
const AlipaySdk = require('alipay-sdk').default;
//引入基本配置信息
const alipayConfig = require('./alipay_config');
//实例化
const alipay = new AlipaySdk(alipayConfig);
//文字转图像 生成二维码
var qr = require('qr-image');


/**
 * 创建支付订单，返回值为二维码链接和订单号
 * 公共参数里有bizContent时必须传入bizContent对象
 */
async function createOrder(goods) {
    let method = 'alipay.trade.precreate'; // 统一收单下单并支付页面接口
    let bizContent = {
        out_trade_no: Date.now(), // 根据时间戳来生成一个订单号,
        total_amount: goods.cost, // 商品价格
        subject: goods.goodsName+'-宋先生的店', // 商品名称
        qr_code_timeout_express:'15m'//最晚支付时间
    }
    // 异步向支付宝发送生成订单请求,alipay.exec()
    const result = await alipay.exec(method, { bizContent: bizContent }, {});
    // // 返回订单的结果信息
    // return result;
    let svg = qr.imageSync(result.qrCode, { type: 'svg' });//生成svg
    let res = Object.assign(goods,{svg:svg});
    //qr_svg.pipe(require('fs').createWriteStream('66.svg'));生成svg并保存文件
    return Object.assign(result, res)
}

/**
 * alipay.trade.query(统一收单线下交易查询)
 * 商户可以通过该接口主动查询订单状态
 */
async function checkOrder(out_trade_no) {
    let method = 'alipay.trade.query'; // 统一收单下单并支付页面接口
    let bizContent = {
        out_trade_no: out_trade_no, // 订单号,
    }
    // 异步向支付宝发送生成订单请求,alipay.exec()
    const result = await alipay.exec(method, { bizContent: bizContent }, {});
    // 返回订单的结果信息
    return result;
}

module.exports={
    createOrder,
    checkOrder
}