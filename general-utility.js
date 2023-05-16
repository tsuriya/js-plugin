/** 画像読み込み */
function loadImage (source) {
    return new Promise((resolve, reject)=>{
        let buf = new Image();
        buf.onload = function () {
            resolve(this);
        };
        buf.onerror = function () {
            reject();
        };
        buf.src = source;
    });
}