/** 画像効果クラス */
{
    const EfectImage = function () {
        this.can = document.createElement("canvas");
        this.ctx = this.can.getContext("2d");
        this.setSize(innerWidth, innerHeight);

        // this.can.style.display  = "none";
        this.can.style.visibility  = "hidden";
        this.can.style.position    = "fixed";
        this.can.style.top         = 0;
        this.can.style.left        = 0;
        document.body.appendChild(this.can);
    }
    EfectImage.prototype = {
        /** キャンバスのサイズをセットする */
        setSize : function (width, height) {
            this.can.width = width;
            this.can.height = height;
        },
        /** キャンバスをクリアする */
        clear : function () {
            let rect = this.can.getBoundingClientRect();
            this.ctx.clearRect(0,0,rect.width, rect.height);
        },
        /** イメージデータを貼付する */
        putImageData : function (imageData, sx, sy) {
            this.ctx.putImageData(imageData, sx||0, sy||0);
        },
        /** イメージデータを貼付する */
        putImage : function (image, sx, sy) {
            this.ctx.drawImage(image,sx||0, sy||0,image.width,image.height);
        },
        /** イメージデータを取得する */
        getImageData : function (sx, sy, sw, sh) {
            let rect = this.can.getBoundingClientRect();
            return this.ctx.getImageData(sx||0, sy||0, sw||rect.width, sh||rect.height);
        },
        /** イメージデータURLを取得する */
        getDataURL : function (type, encoderOptions) {
            return this.can.toDataURL(type, encoderOptions);
        },
        /** 画像データを取得する */
        loadImage : function (sx, sy, sw, sh) {
            let target = this;
            // キャンバスから指定区域を切り出し、原点へ移動する
            let rect = target.can.getBoundingClientRect();
            let data = target.getImageData(sx, sy, sw, sh)
            // サイズを指定サイズに変更する
            target.setSize(sw||rect.width, sh||rect.height);
            target.putImageData(data,0,0);

            return new Promise(function(resolve, reject){
                target.can.toBlob(function(blob) {
                    let DOMURL = self.URL || self.webkitURL || self; //URLオブジェクトを取得
                    let img = new Image();
                    let url = DOMURL.createObjectURL(blob);
                    img.onload = function() {
                        DOMURL.revokeObjectURL(url);
                        // キャンバスサイズを元に戻す
                        target.setSize(rect.width, rect.height);
                        resolve(img);
                    };
                    img.src = url;
                });
            });
        },
        /** 2値化を行う */
        binarization : function (thresholdFrom, thresholdTo) {
            if (typeof thresholdFrom === "undefined") {
                thresholdFrom = 0.5;
            } else
            if (typeof thresholdTo === "undefined") {
                thresholdTo = 0.5;
            }
            const imgData = this.getImageData();
            const rect = this.can.getBoundingClientRect();
            let result = this.ctx.createImageData(rect.width,rect.height);
            let box = {
                x : [NaN, NaN],
                y : [NaN, NaN],
            };
            for (let ii = 0; ii < imgData.data.length; ii+=4) {
                let buf = [
                    imgData.data[ii + 0]
                   ,imgData.data[ii + 1]
                   ,imgData.data[ii + 2]
                   ,imgData.data[ii + 3]
                ];
                if (buf[3] !== 0) {
                    const litning = _getLightning(buf[0], buf[1], buf[2]);

                    if (litning >= thresholdFrom
                     && litning <  thresholdTo) {
                        buf[0] = 0;
                        buf[1] = 0;
                        buf[2] = 0;

                        box = _updateBox (box, ii, rect.width, rect.height);
                    } else {
                        buf[0] = 0;
                        buf[1] = 0;
                        buf[2] = 0;
                        buf[3] = 0;
                    }
                }

                result.data[ii + 0] = buf[0];
                result.data[ii + 1] = buf[1];
                result.data[ii + 2] = buf[2];
                result.data[ii + 3] = buf[3];
            }
            this.ctx.putImageData(result,0,0);
            return box;
        },
        /** ガウスフィルタを掛ける */
        gaussianFilter : function (kernelSize, s) {
            // フィルタ関数
            function fn (x,y) {
                return 1/(Math.sqrt(2 * Math.PI)*s) * Math.exp(-(x*x + y*y)/(2*s*s));
            }
            return _filter(
                this.ctx
              , this.can.getBoundingClientRect()
              , _getKernel(kernelSize, fn)
            );
        },
        /** 平均値フィルタを掛ける */
        averageFilter : function (kernelSize) {
            // フィルタ関数
            function fn (x,y) {
                return 1 / kernelSize;
            }
            return _filter(
                this.ctx
              , this.can.getBoundingClientRect()
              , _getKernel(kernelSize, fn)
            );
        }
    };
    EfectImage.kernelSize = 3;
    /** 輝度を取得する */
    function _getLightning (r, g, b) {
        const color = Color.fromRGBtoHLS(r, g, b);
        return ~~(color[1] * 0xff);
    }
    /** 輝度分布を取得する */
    function _getLightningsDistribution (imgData) {
        let result = [];
        const all = imgData.data.length / 4;
        for (let ii = 0; ii < all * 4; ii+=4) {
            let buf = [
                imgData.data[ii + 0]
               ,imgData.data[ii + 1]
               ,imgData.data[ii + 2]
               ,imgData.data[ii + 3]
            ];
            let litning = 0xff;
            if (buf[3] !== 0) {
                litning = _getLightning(buf[0], buf[1], buf[2]);
            }
            result[litning] = (result[litning] || 1/all) + 1 / all;
        }
        return result;
    }
    /** ボックス情報を更新する */
    function _updateBox (box, index, width, height) {
        index /= 4;
        const yy = ~~(index / width);
        const xx = index - yy * width;
        if (isNaN(box.x[0])
         || xx < box.x[0]) {
            box.x[0] = xx;
        }
        if (isNaN(box.x[1])
         || xx > box.x[1]) {
            box.x[1] = xx;
        }
        if (isNaN(box.y[0])
         || yy < box.y[0]) {
            box.y[0] = yy;
        }
        if (isNaN(box.y[1])
         || yy > box.y[1]) {
            box.y[1] = yy;
        }
        return box;
    }
    /** カーネルを取得する */
    function _getKernel (kernelSize, fn) {
        let kernel = [];
        let kernelLength = kernelSize * kernelSize;
        let kernelHalf = ~~(kernelSize / 2);
        for (let ii = 0; ii < kernelLength; ii++) {
            let nn = (ii % kernelSize) - kernelHalf;
            let mm = ~~(ii / kernelSize) - kernelHalf;
            kernel.push(fn(nn,mm));
        }
        return kernel;
    }
    /** フィルターを掛ける */
    function _filter (ctx, rect, kernel) {
        let imgData = ctx.getImageData(0,0,rect.width,rect.height);
        let result = ctx.createImageData(rect.width,rect.height);

        let width  = rect.width;
        let height = rect.height;

        let kernelLength = kernel.length;
        let kernelSize  = ~~Math.sqrt(kernelLength);
        let kernelHalf  = ~~(kernelSize / 2);
        let box = {
            x : [NaN, NaN],
            y : [NaN, NaN],
        };

        for (let ii = 0,ll=imgData.data.length; ii < ll; ii += 4) {
            // 現在のピクセル位置取得
            let xx = ii % (4 * width) / 4;
            let yy = ~~(ii / (4 * width));

            // 色情報保持
            let buf0 = 0;
            let buf1 = 0;
            let buf2 = 0;
            let buf3 = 0;
            for (let jj = 0; jj < kernelLength; jj++) {
                // 相対位置取得
                let nn =   (jj % kernelSize) - kernelHalf;
                let mm = ~~(jj / kernelSize) - kernelHalf;

                // 取得座標
                let _xx = xx + nn;
                let _yy = yy + mm;

                // 範囲外の場合処理をスキップ
                if (_xx < 0 || _xx >= width || _yy < 0 || _yy >= height) {
                    continue;
                }
                let _ii = _yy * (4 * width) + _xx * 4;
                let alpha = imgData.data[_ii + 3];

                buf0 += (alpha == 0 ? imgData.data[ii + 0] : imgData.data[_ii + 0]) * kernel[jj];
                buf1 += (alpha == 0 ? imgData.data[ii + 1] : imgData.data[_ii + 1]) * kernel[jj];
                buf2 += (alpha == 0 ? imgData.data[ii + 2] : imgData.data[_ii + 2]) * kernel[jj];
                buf3 += alpha * kernel[jj];
            }

            const max = 0xff;
            result.data[ii + 0] = buf0 > max ? max : ~~buf0;
            result.data[ii + 1] = buf1 > max ? max : ~~buf1;
            result.data[ii + 2] = buf2 > max ? max : ~~buf2;

            // result.data[ii + 0] = imgData.data[ii + 0];
            // result.data[ii + 1] = imgData.data[ii + 1];
            // result.data[ii + 2] = imgData.data[ii + 2];
            result.data[ii + 3] = buf3 > max ? max : ~~buf3;

            if(result.data[ii + 3]>0)box = _updateBox (box, ii, width, height);
        }

        ctx.putImageData(result,0,0);
        return ;
    }

    /* エクスポート */
    self.EfectImage = EfectImage;
}
