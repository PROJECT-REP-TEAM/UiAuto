//引入组件
let crypto = window.nodeRequire('crypto');

//加密
export function aesEncrypt(data, secretKey) {
    let cipher = crypto.createCipher('aes-128-ecb', secretKey);
    return cipher.update(data, 'utf8', 'hex') + cipher.final('hex');
}

//解密
export function aesDecrypt(data, secretKey) {
    let cipher = crypto.createDecipher('aes-128-ecb', secretKey);
    return cipher.update(data, 'hex', 'utf8') + cipher.final('utf8');
}
