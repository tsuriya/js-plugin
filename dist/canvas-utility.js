/** Canvasユーティリティクラス */
{
    const CanvasUtility = function (can) {
        this.can  = typeof can === "string" ? document.querySelector(can) : can;
        this.ctx  = this.can.getContext("2d");
        this.rect = null;

        // レイヤー情報
        this.layerID  = [];
        this.mapLayer = {};

        // ステップ情報
        this.stepID  = {};
        this.mapStep = {};

        // 現在描画情報を保持する
        this.currentLayer = null;
        this.currentStep  = null;
        this.mapData = {};
        this.mapZBuf = {};

        // イベント情報を保持する
        this.mapEvent = {};

        // 表示範囲
        this.viewBox = {
            x : 0,
            y : 0,
        };

        // 非表示レイヤー
        this.mapHideLayer = {};

        // 画面サイズ変更処理
        let target = this;
        function resize () {
            let buf = {};
            let rect = can.getBoundingClientRect();
            // target.rect = can.getBoundingClientRect();
            target.can.width  = rect.width;
            target.can.height = rect.height;
            for (let key in rect) {
                buf[key] = rect[key];
            }
            buf.width  = target.can.width;
            buf.height = target.can.height;
            target.rect = buf;

            // resizeイベントを行う
            let eventName = "resize";
            if (target.mapEvent[eventName]) {
                let arg = Array.from(arguments);
                for (let ii = 0; ii < target.mapEvent[eventName].length; ii++) {
                    if (target.mapEvent[eventName][ii].apply(this, arg) === false) {
                        return false;
                    }
                }
            }

            // 描画処理を行う
            target.draw();
        }
        window.addEventListener("resize", resize, false );
        resize();
    }

    CanvasUtility.prototype = {
        /** 画像インデックスを取得する */
        getImgIndex : function (x, y) {
            return CanvasUtility.getImgIndex(this.rect, x, y);
        },
        /** レイヤー追加 */
        addEvent : function (eventName, fn) {
            // 初回イベント登録の場合
            if(!this.mapEvent[eventName]) {
                // イベント保持配列を初期化する
                this.mapEvent[eventName] = [];
                // リサイズイベント以外の場合のみイベント登録を行う
                if (eventName !== "resize") {
                    let target = this;
                    // Canvasにイベント登録する
                    this.can.addEventListener(eventName, function(){
                        let arg = Array.from(arguments);
                        for (let ii = 0; ii < target.mapEvent[eventName].length; ii++) {
                            if (target.mapEvent[eventName][ii].apply(this, arg) === false) {
                                return false;
                            }
                        }
                    });
                }
            }

            // イベント登録を行う
            this.mapEvent[eventName].push(fn);
        },
        /** レイヤー追加 */
        registLayer : function (id) {
            if (!id) {
                id = this.layerID.length;
            }
            // 既にレイヤが存在する場合は何もしない
            if (id in this.mapLayer) {
                return id;
            }
            // レイヤー情報追加
            this.mapLayer[id] = this.layerID.length;
            this.layerID.push(id);

            // ステップ情報初期化
            this.stepID [id] = [];
            this.mapStep[id] = {};
            return id;
        },
        /** レイヤー削除 */
        removeLayer : function (id) {
            // レイヤが存在しない場合は何もしない
            if (!id in this.mapLayer) {
                return;
            }
            let index = this.mapLayer[id];
            this.layerID.splice(index, 1);

            // レイヤーインデックス更新
            for (let ii = index; ii < this.layerID.length; ii++) {
                this.mapLayer[this.layerID[ii]]--;
            }

            // レイヤー情報削除
            delete this.stepID  [id];
            delete this.mapStep [id];
            delete this.mapLayer[id];
        },
        /** ステップ登録 */
        registStep  : function (layerId, id, fn) {
            // idに関数が指定されている場合
            if (typeof id === "function") {
                // 第二引数をステップ関数として登録
                fn = id;
                id = this.stepID[layerId].length;
            }

            // 既にキーが存在する場合、更新する
            if (id in this.mapStep[layerId]) {
                this.updateStep(layerId, id, fn);
                return id;
            }

            // 処理を追加する
            this.mapStep[layerId][id] = [this.stepID [layerId].length, fn, null];
            this.stepID [layerId].push(id);
            // idを返却
            return id;
        },
        /** ステップ更新 */
        updateStep : function (layerId, id, fn) {
            this.mapStep[layerId][id][1] = fn;
        },
        /** ステップパラメータ設定 */
        setStepParameter : function (layerId, id, parameter) {
            this.mapStep[layerId][id][2] = parameter;
        },
        /** ステップデータ設定 */
        setStepData : function (layerId, id, key, value) {
            let stepKey = String(layerId) + "-" + String(id);
            if (!mapData[stepKey])mapData[stepKey]={};
            // 指定したステップにキーを登録する
            mapData[stepKey][key] = value;
        },
        /** ステップデータ設定 */
        setStepData : function (layerId, id, key, value) {
            let stepKey = String(layerId) + "-" + String(id);
            if (!this.mapData[stepKey])this.mapData[stepKey]={};
            // 指定したステップにキーを登録する
            this.mapData[stepKey][key] = value;
        },
        /** ステップデータ取得 */
        getStepData : function (key) {
            let stepKey = String(this.currentLayer) + "-" + String(this.currentStep);
            if (!this.mapData[stepKey])return null;
            return this.mapData[stepKey][key];
        },
        /** ステップ削除 */
        removeStep : function (layerId, id) {
            // ステップが存在しない場合は何もしない
            if (!id in this.mapStep[layerId]) {
                return;
            }
            let index = this.mapStep[layerId][id][0];
            this.stepID[layerId].splice(index, 1);
            // ステップインデックス更新
            for (let ii = index; ii < this.stepID[layerId].length; ii++) {
                this.mapStep[layerId][this.stepID[layerId][ii]][0]--;
            }
            // ステップ情報削除
            delete this.mapStep [layerId][id];
        },
        /** キャンバス要素取得 */
        getElement : function () {
            return this.can;
        },
        /** キャンバス矩形情報取得 */
        getRect : function () {
            return this.rect;
        },
        /** 表示範囲設定 */
        setViewBox : function (x, y) {
            this.viewBox.x = x;
            this.viewBox.y = y;
        },
        /** 表示範囲移動 */
        moveViewBox : function (x, y) {
            this.viewBox.x += x;
            this.viewBox.y += y;
        },
        /** 現在の表示位置取得 */
        getViewBox : function () {
            return this.viewBox;
        },
        /** キャンバス描画位置取得 */
        getPosition : function (x, y) {
            return {
                x : x - this.viewBox.x,
                y : y - this.viewBox.y
            };
        },
        /** キャンバス相対位置取得 */
        getRelativePosition : function (xRatio, yRatio) {
            return {
                x : this.rect.width  * xRatio,
                y : this.rect.height * yRatio
            };
        },
        /** キャンバスの画像を取得する */
        loadListImages : function (fn, options) {
            options = options || {};
            var result = [];

            var easing = options.easing || function (t) {
                return t;
            };
            var step     = options.step;
            var complete = options.complete;
            var duration = options.duration || 1000;
            var fps      = options.fps      || 1000 / 60;

            var ratio = 0;
            var sum = 0;
            var target = this;
            function nest () {
                var t = sum/duration;
                ratio = easing(t);

                if(ratio >= 1){
                    fn.call(target, ratio);
                    target.can.toBlob(function(blob){
                        var DOMURL = self.URL || self.webkitURL || self; //URLオブジェクトを取得
                        var img = new Image();
                        var url = DOMURL.createObjectURL(blob);
                        img.onload = function() {
                            DOMURL.revokeObjectURL(url);

                            result.push(img);
                            if(step)step.call(target, ratio, url);
                            complete.call(target, result);
                        };
                        img.src = url;
                    });
                    return;
                }

                fn.call(target, ratio);
                target.can.toBlob(function(blob){
                    var DOMURL = self.URL || self.webkitURL || self; //URLオブジェクトを取得
                    var img = new Image();
                    var url = DOMURL.createObjectURL(blob);
                    img.onload = function() {
                        DOMURL.revokeObjectURL(url);

                        result.push(img);
                        if(step)step.call(target, ratio, url);
                        if(ratio === 1){
                            complete.call(target, result);
                            return;
                        }
                        sum+=fps;
                        nest();
                    };
                    img.src = url;
                });
            }
            nest();
        },
        /** レイヤーを非表示にする */
        hideLayer : function (layerId) {
            this.mapHideLayer[layerId] = true;
        },
        /** レイヤーを表示する */
        showLayer : function (layerId) {
            delete this.mapHideLayer[layerId];
        },
        /** 画面クリア */
        clear : function () {
            this.ctx.clearRect(0,0,this.rect.width,this.rect.height);
            this.mapZBuf = {};
        },
        /** 画面描画 */
        draw  : function () {
            let target = this;
            target.clear();
            target.layerID.forEach((lid)=>{
                if(target.mapHideLayer[lid])return;
                target.currentLayer = lid;
                target.stepID[lid].forEach((sid)=>{
                    target.currentStep = sid;
                    // パラメータが指定されていない場合
                    if (!target.mapStep[lid][sid][2] && target.mapStep[lid][sid][2] !== 0) {
                        target.mapStep[lid][sid][1].call(target, target.ctx);
                    // パラメータが指定されている場合
                    } else {
                        target.mapStep[lid][sid][1].call(target, target.ctx, target.mapStep[lid][sid][2]);
                    }
                });
            });
        },
        /** 画像データを変換関数で描写を行う */
        projectionImageData (imgData, conv, x, y, fnColor) {
            x = x || 0;
            y = y || 0;
            const ctx = this.ctx;
            const rect = this.getRect();

            let outData = ctx.getImageData(0, 0, rect.width, rect.height);
            for (let xx = 0; xx < imgData.width-1; xx++) {
                for (let yy = 0; yy < imgData.height-1; yy++) {
                    // 元画像をピクセル単位で変換をかける
                    const p00 = conv.call(this, imgData, xx+0, yy+0);
                    const p01 = conv.call(this, imgData, xx+0, yy+1);
                    const p10 = conv.call(this, imgData, xx+1, yy+0);
                    const p11 = conv.call(this, imgData, xx+1, yy+1);
                    // 座標が取得できない場合処理を終了
                    if (!p00 || !p01 || !p10 || !p11) continue;

                    // 変換を掛けた矩形のバウンディングボックスを取得する
                    const max = [
                        Math.max(p00[0], p01[0], p10[0], p11[0])
                      , Math.max(p00[1], p01[1], p10[1], p11[1])
                    ];
                    const min = [
                        Math.min(p00[0], p01[0], p10[0], p11[0])
                      , Math.min(p00[1], p01[1], p10[1], p11[1])
                    ];

                    // 描画が行えない場合処理をスキップ
                    if (max[0]===min[0] || max[1]===min[1]) continue;

                    // 射影元の基点インデックスを取得する
                    const fromIndex00 = CanvasUtility.getImgIndex(imgData, xx+0, yy+0);
                    const fromIndex01 = CanvasUtility.getImgIndex(imgData, xx+0, yy+1);
                    const fromIndex10 = CanvasUtility.getImgIndex(imgData, xx+1, yy+0);
                    const fromIndex11 = CanvasUtility.getImgIndex(imgData, xx+1, yy+1);

                    // バウンディングボックスのXの長さ分ループを行う
                    for (let xxxx = min[0]; xxxx < max[0]; xxxx++) {
                        // 描画範囲外の場合スキップ
                        if (xxxx + x < 0
                         || xxxx + x > rect.width) {
                            continue;
                        }
                        // Xの近傍点を取得する
                        const blnNearX0 = Math.abs(p00[0] - xxxx) < Math.abs(p11[0] - xxxx);

                        // 描画X軸のY軸描画範囲を取得する(変換した矩形で囲まれた範囲)
                        let points = [];
                        // 辺p00-p10で囲まれた範囲の取得
                        if (inRange(p00[0], p10[0], xxxx)) {
                            const buf = fnLinerX(p00[0], p00[1], p10[0], p10[1], xxxx);
                            // Xの値が同値の場合は、Y軸の範囲をそのまま設定する
                            if (isNaN(buf)) {
                                points.push(p00[1]);
                                points.push(p10[1]);
                            // そうでない場合は、取得した値をセットする
                            } else {
                                points.push(buf);
                            }
                        }
                        // 辺p10-p11で囲まれた範囲の取得
                        if (inRange(p10[0], p11[0], xxxx)) {
                            const buf = fnLinerX(p10[0], p10[1], p11[0], p11[1], xxxx);
                            // Xの値が同値の場合は、Y軸の範囲をそのまま設定する
                            if (isNaN(buf)) {
                                points.push(p10[1]);
                                points.push(p11[1]);
                            // そうでない場合は、取得した値をセットする
                            } else {
                                points.push(buf);
                            }
                        }
                        // 辺p11-p01で囲まれた範囲の取得
                        if (inRange(p11[0], p01[0], xxxx)) {
                            const buf = fnLinerX(p11[0], p11[1], p01[0], p01[1], xxxx);
                            // Xの値が同値の場合は、Y軸の範囲をそのまま設定する
                            if (isNaN(buf)) {
                                points.push(p11[1]);
                                points.push(p01[1]);
                            // そうでない場合は、取得した値をセットする
                            } else {
                                points.push(buf);
                            }
                        }
                        // 辺p01-p00で囲まれた範囲の取得
                        if (inRange(p01[0], p00[0], xxxx)) {
                            const buf = fnLinerX(p01[0], p01[1], p00[0], p00[1], xxxx);
                            // Xの値が同値の場合は、Y軸の範囲をそのまま設定する
                            if (isNaN(buf)) {
                                points.push(p01[1]);
                                points.push(p00[1]);
                            // そうでない場合は、取得した値をセットする
                            } else {
                                points.push(buf);
                            }
                        }
                        
                        // 取得した描画範囲2点のソートを行う
                        if (points.length == 2) {
                            if (points[0] > points[1]) {
                                const a = points[1];
                                points[1] = points[0];
                                points[0] = a;
                            }
                        } else
                        // 1点のみの場合、同一の値を設定する
                        if (points.length == 1) {
                            points[1] = points[0];
                        } else {
                            continue;
                        }
                        points[0] = Math.floor(points[0]);
                        points[1] = Math.ceil (points[1]);

                        for (let yyyy = points[0]; yyyy <= points[1]; yyyy++) {
                            // 描画範囲外の場合スキップ
                            if (yyyy + y < 0
                             || yyyy + y > rect.height) {
                                break;
                            }
                            const blnNearY0 = Math.abs(p00[1] - yyyy) < Math.abs(p11[1] - yyyy);
                            let fromIndex = -1;
                            let zIndex    = null;
                            if (blnNearX0 && blnNearY0) {
                                fromIndex = fromIndex00;
                                zIndex    = ~~p00[2];
                            } else
                            if (blnNearX0 && !blnNearY0) {
                                fromIndex = fromIndex01;
                                zIndex    = ~~p01[2];
                            } else
                            if (!blnNearX0 && blnNearY0) {
                                fromIndex = fromIndex10;
                                zIndex    = ~~p10[2];
                            } else {
                                fromIndex = fromIndex11;
                                zIndex    = ~~p11[2];
                            }
                            const toIndex   = CanvasUtility.getImgIndex(rect, xxxx + x, yyyy + y);

                            if (fromIndex<0||toIndex<0)continue;
                            let color = [];

                            if (!fnColor) {
                                color[0] = imgData.data[fromIndex + 0];
                                color[1] = imgData.data[fromIndex + 1];
                                color[2] = imgData.data[fromIndex + 2];
                                color[3] = imgData.data[fromIndex + 3];
                            } else {
                                color = fnColor.call(this, imgData, xx, yy, zIndex
                                    , imgData.data[fromIndex + 0]
                                    , imgData.data[fromIndex + 1]
                                    , imgData.data[fromIndex + 2]
                                    , imgData.data[fromIndex + 3]
                                );
                            }
                            if (!color[3])continue;
                            if (!chkZIndex(this.mapZBuf, xxxx + x, yyyy + y, zIndex, color[0], color[1], color[2], color[3]))continue;

                            outData.data[toIndex + 0] = color[0];
                            outData.data[toIndex + 1] = color[1];
                            outData.data[toIndex + 2] = color[2];
                            outData.data[toIndex + 3] = color[3];
                        }
                    }
                }
            }
            ctx.putImageData(outData, 0, 0);
        }
    }

    /** 画像インデックスを取得する */
    CanvasUtility.getImgIndex = function (data, x, y) {
        const width  = data.width;
        const height = data.height;
        if (x<0||y<0||x>width||y>height) {
            return -1;
        }
        x = ~~x;
        y = ~~y;
        return width * 4 * y + 4 * x;
    }
    /** canvasからdHashを取得する */
    CanvasUtility.dHash = function (data, kernel) {
        let imgData    = data;
        let resImgData = {
            width  : 9,
            height : 8,
            data : []
        };
        resImgData.data = new Float64Array(resImgData.width * resImgData.height);
        
        const filter = (kernel===3)?[
                1/16, 1/8, 1/16,
                1/8, 1/4, 1/8,
                1/16, 1/8, 1/16
        ]:(
            (kernel===5)?[
                1/256,  4/256,  6/256,  4/256, 1/256, 
                4/256, 16/256, 24/256, 16/256, 4/256, 
                6/256, 24/256, 36/256, 24/256, 6/256, 
                4/256, 16/256, 24/256, 16/256, 4/256, 
                1/256,  4/256,  6/256,  4/256, 1/256, 
            ]:[1]
        );

        const kernelSquare = filter.length;
        const kernelSize   = ~~Math.sqrt(kernelSquare);
        const kernelSize_2 = ~~(kernelSize/2);
        
        const scale = 1 / (~~(imgData.width / resImgData.width) * ~~(imgData.height / resImgData.height));
        const scaleX = (resImgData.width  / imgData.width);
        const scaleY = (resImgData.height / imgData.height);
        
        for (let ii=0,ll=imgData.data.length;ii<ll;ii+=4) {
            const xx = ~~(ii/4)%imgData.width;
            const yy = ~~((ii/4)/imgData.width);
            
            let r = 0;
            let g = 0;
            let b = 0;
            if (kernelSquare===1) {
                r = imgData.data[ii+0];
                g = imgData.data[ii+1];
                b = imgData.data[ii+2];
            } else {
                for (let jj=0;jj<kernelSquare;jj++) {
                    const yyy=~~(jj/kernelSize)-kernelSize_2;
                    const xxx=  (jj%kernelSize)-kernelSize_2;
                    if ((yy+yyy)<0||(yy+yyy)>=imgData.height
                     || (xx+xxx)<0||(xx+xxx)>=imgData.width) {
                        continue;
                    }
                    const index = ((yy+yyy)*imgData.width + (xx+xxx))*4;
                    const s = Math.sqrt(4/Math.PI);
                    const w = filter[jj];
                    
                    r+=imgData.data[index+0]*w;
                    g+=imgData.data[index+1]*w;
                    b+=imgData.data[index+2]*w;
                }
            }
        
            const v = (0.299*r + 0.587*g + 0.114*b)*scale;
            
            const resIndex = ~~(xx * scaleX) + ~~(yy * scaleY) * resImgData.width;
            if (resIndex>=resImgData.data.length)continue;
            
            resImgData.data[resIndex]+=v;
        }
        let buf="";
        for (let ii = 0;ii<resImgData.data.length-1;ii++) {
            if ((ii % resImgData.width) >= resImgData.width-1)continue;
            buf+=~~(!(resImgData.data[ii+1]>resImgData.data[ii]));
        }
        return BigInt("0b" + buf);
    } 


    /** 一次関数を取得する */
    function fnLinerX (x0, y0, x1, y1, xx) {
        if (x1 > x0) {
            return ((y1 - y0) / (x1 - x0)) * (xx - x0) + y0;
        } else
        if (x1 < x0) {
            return ((y0 - y1) / (x0 - x1)) * (xx - x1) + y1;
        }
        return NaN;
    }
    /** 指定範囲に値が存在するか確認する */
    function inRange (r0, r1, a) {
        if (r1 > r0) {
            return a > r0 && a <= r1;
        } else
        if (r1 < r0) {
            return a > r1 && a <= r0;
        }
        return a === r0 && a === r1;
    }

    // 深度情報のチェックを行う
    function chkZIndex (mapZBuf, xx, yy, zz, r, g, b, a) {
        if (!zz  && zz!==0)return true;
        xx=~~xx;
        yy=~~yy;
        zz=~~zz;
        // const key = toIndex;
        const key = (xx) + "-" + (yy);
        // 既に深度情報が保持されている場合
        // 描画データより前面に既に描画されている場合スキップ
        if (mapZBuf[key]&&mapZBuf[key] < zz) {
            return false;
        } else {
            // 保持されていない場合データを保持する
            mapZBuf[key] = zz;
        }
        return true;
    }

    /* エクスポート */
    self.CanvasUtility = CanvasUtility;
}


/** キャンバス履歴情報取得 */
function CanvasHistory (context) {
    this.ctx          = context;
    this.can          = context.canvas;
    this.history      = [];
    this.currentIndex = -1;
}
CanvasHistory.MAX_HISTORY = 20;

CanvasHistory.prototype = {
    /** 履歴追加 */
    add : function () {
        this.currentIndex++;
        // this.history.splice();
    },
    undo : function () {
        this.currentIndex--;
    },
    redo : function () {
        this.currentIndex++;
    },
}