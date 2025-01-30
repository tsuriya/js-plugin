/** SVGの操作を扱うユーティリティクラスです */
{
    const SVGUtility = {
        /** SVG(パス)のXML読み込みを行う */
        loadXML : function (path) {
            return new Promise(function(resolve, reject){
                let xhr = new XMLHttpRequest();
                xhr.open("GET", path);
                xhr.send();
                xhr.onload = function () {
                    if (xhr.status !== 200)return reject();
                    resolve(xhr.response);
                }
            });
        },
        loadDOM : function (path) {
            return SVGUtility.loadXML(path)
            .then(function(data){
                return SVGUtility.getDOM(data);
            });
        },
        /** SVG(パス)のオブジェクト読み込みを行う */
        loadImage : function (path) {
            return SVGUtility.loadXML(path)
            .then(function(data){
                return SVGUtility.toXMLImage(data);
            });
        },
        /** SVGパスをDOMに変換する */
        getDOM : function (data) {
            return new DOMParser().parseFromString(data, "image/svg+xml");
        },
        /** SVG(文字列)の画像オブジェクト読み込みを行う */
        toDOMImage : function (dom, style) {
            const box     = dom.getBBox ? dom.getBBox() : dom.getBoundingClientRect();
            const rect    = dom.getBoundingClientRect();
            const x       = (box.x      );
            const y       = (box.y      );
            const bWidth  = (box.width  );
            const bHeight = (box.height );
            const rWidth  = (rect.width );
            const rHeight = (rect.height);

            let buf = "";
            buf += '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"';
            buf += ' version="1.1" x="' + x + '" y="' + y + '"';
            buf += ' width="' + rWidth + 'px" height="' + rHeight + 'px" viewBox="' + x + ' ' + y + ' ' + bWidth + ' ' + bHeight + '" xml:space="preserve">';
            buf += style ? style.outerHTML : "";
            buf += dom.outerHTML;
            buf += '</svg>';
            return SVGUtility.toXMLImage(buf);
        },
        /** SVG(文字列)の画像オブジェクト読み込みを行う */
        toXMLImage : function (xml) {
            return new Promise(function(resolve0, reject0){
                let DOMURL = self.URL || self.webkitURL || self; //URLオブジェクトを取得
                let img    = new Image();                           //Imageオブジェクトの呼び出し
                let svg    = new Blob([xml], {type: "image/svg+xml;charset=utf-8"}); //読み込んだSVGデータを元に、画像のFileオブジェクトを作成
                let url    = DOMURL.createObjectURL(svg); //画像のFileオブジェクトのURLを作成

                img.src = url;
                img.onload = function () {
                    DOMURL.revokeObjectURL(url); //画像のFileオブジェクトのURLを削除
                    // 画像ロード完了
                    resolve0(img);
                }
            });
        },
        /** 文字パース */
        parseString : function (strPath) {
            // SVGパスコマンドの定義
            const C_COMMOND = {
                "MOVE"                   : "M",
                "CLOSE"                  : "Z",
                "LINE"                   : "L",
                "HORIZON"                : "H",
                "VERTICAL"               : "V",
                "CURVE"                  : "C",
                "SMOOTH_CURVE"           : "S",
                "QUADRATIC_CURVE"        : "Q",
                "SMOOTH_QUADRATIC_CURVE" : "T",
                "ARC"                    : "A",
            };
        
            // コマンドリストを取得し、正規表現を作成
            const lstCommand   = Object.keys(C_COMMOND).map((v)=>C_COMMOND[v]).join("");
            const lowerCommand = lstCommand.toLowerCase();
            const regCommand   = new RegExp(`[${lstCommand}]`, "ig");
            const dimension    = 2; // 2D座標空間
        
            // 入力文字列をコマンドと数値に分割
            let arrCommands  = strPath.match(regCommand);
            let arrPath      = strPath.split(regCommand);
        
            if (!arrPath[0]) {
                arrPath.shift(); // 空の要素があれば削除
            }
            let buf        = [];
            let currentPos = [];
            let beforePath = [];
            let beginPos   = [];
        
            let result = [];
            arrPath.forEach((v, ii)=>{
                const blnRelative = lowerCommand.indexOf(arrCommands[ii]) > -1; // 相対座標判定
                const command = arrCommands[ii].toUpperCase();
                let r = {
                    "command" : command,
                    "path"    : (v.match(/[-+]?\d+(?:\.\d+)?[eE]?/g)||[])
                                .map((w, jj)=>{
                                    let s = parseFloat(w);
                                    if (blnRelative && buf.length === dimension) {
                                        // 相対座標を絶対座標に変換
                                        switch (command) {
                                            case C_COMMOND.HORIZON:
                                                s+=currentPos[0];
                                            break;
                                            case C_COMMOND.VERTICAL:
                                                s+=currentPos[1];
                                            break;
                                            case C_COMMOND.ARC:
                                                if (jj >= dimension + 3) {
                                                    s+=currentPos[(jj-dimension+3) % dimension];
                                                }
                                            break;
                                            default:
                                                s+=currentPos[jj % dimension];
                                            break;
                                        }
                                    }
                                    // 座標バッファに格納
                                    switch (command) {
                                        case C_COMMOND.HORIZON:
                                            buf[0] = s;
                                        break;
                                        case C_COMMOND.VERTICAL:
                                            buf[1] = s;
                                        break;
                                        case C_COMMOND.ARC:
                                            if (jj >= dimension + 3) {
                                                buf[(jj-dimension+3) % dimension] = s;
                                            }
                                        break;
                                        default:
                                            buf[jj % dimension] = s;
                                        break;
                                    }
                                    if (command === C_COMMOND.MOVE) {
                                        beginPos = buf.map((v)=>v); // 移動開始位置を記録
                                    }
                                    return parseFloat(s.toFixed(3));
                                })
                };
        
                let p = [];
                let before = [];
                switch (command) {
                    case C_COMMOND.HORIZON:
                        r.path.forEach((v) => {
                            p.push(v, currentPos[1]);
                        });
                        r.command = C_COMMOND.LINE;
                        r.path = p;
                    break;
                    case C_COMMOND.VERTICAL:
                        r.path.forEach((v) => {
                            p.push(currentPos[0], v);
                        });
                        r.command = C_COMMOND.LINE;
                        r.path = p;
                    break;
                    case C_COMMOND.SMOOTH_CURVE:
                        before = beforePath.slice(-2 * dimension);
                        for (let i = 0; i < r.path.length; i += (2 * dimension)) {
                            let b = [];
                            for (let j = 0; j < dimension; j++) {
                                b[j] = parseFloat((-before[j] + 2 * before[j + dimension]).toFixed(3));
                            }
                            b.push(...r.path.slice(i, i + 2 * dimension));
                            p.push(...b);
                            before = r.path.slice(i, i + 2 * dimension);
                        }
                        r.command = C_COMMOND.CURVE;
                        r.path = p;
                    break;
                    case C_COMMOND.SMOOTH_QUADRATIC_CURVE:
                        before = beforePath.slice(-2 * dimension);
                        for (let i = 0; i < r.path.length; i += dimension) {
                            let b = [];
                            for (let j = 0; j < dimension; j++) {
                                b[j] = parseFloat((-before[j] + 2 * before[j + dimension]).toFixed(3));
                            }
                            b.push(...r.path.slice(i, i + dimension));
                            p.push(...b);
                            before = b;
                        }
                        r.command = C_COMMOND.QUADRATIC_CURVE;
                        r.path = p;
                    break;
                    case C_COMMOND.CLOSE:
                        r.command = C_COMMOND.LINE;
                        r.path = beginPos;
                    break;
                }
        
                currentPos = buf.map((v)=>v);
                beforePath = r.path;
        
                // 連続する同じコマンドを統合
                if (!result[result.length-1] || result[result.length-1].command !== r.command) {
                    result.push(r);
                } else {
                    result[result.length-1].path = result[result.length-1].path.concat(r.path);
                }
            });
        
            return result;
        },
        toPathString : function (parse) {
            return parse.map(v=>v.command+v.path.join(",")).join("");
        },
        /** パースした文字をCanvas上に描画する */
        drawPath : function (ctx, parsePath, oX, oY, sX, sY) {
            oX = oX||0;
            oY = oY||0;

            sX = sX||1;
            sY = sY||1;
            const dimension = 2;
            ctx.beginPath();

            if(!parsePath)return;

            parsePath.forEach((v)=>{
                switch (v.command) {
                    case "M":
                        for (let ii=0; ii < v.path.length; ii+=dimension) {
                            ctx.moveTo(v.path[ii]*sX+oX, v.path[ii+1]*sY+oY);
                        }
                    break;
                    case "L":
                        for (let ii=0; ii < v.path.length; ii+=dimension) {
                            ctx.lineTo(v.path[ii]*sX+oX, v.path[ii+1]*sY+oY);
                        }
                    break;
                    case "C":
                        for (let ii=0; ii < v.path.length; ii+=dimension*3) {
                            ctx.bezierCurveTo(
                                v.path[ii  ]*sX+oX, v.path[ii+1]*sY+oY
                               ,v.path[ii+2]*sX+oX, v.path[ii+3]*sY+oY
                               ,v.path[ii+4]*sX+oX, v.path[ii+5]*sY+oY
                            );
                        }
                    break;
                    case "Q":
                        for (let ii=0; ii < v.path.length; ii+=dimension*2) {
                            ctx.quadraticCurveTo(
                                 v.path[ii  ]*sX+oX, v.path[ii+1]*sY+oY
                                ,v.path[ii+2]*sX+oX, v.path[ii+3]*sY+oY
                            );
                        }
                    break;
                    case "Z":
                        ctx.closePath();
                    break;
                }
            });
        }
    }

    /* エクスポート */
    self.SVGUtility = SVGUtility;
}
