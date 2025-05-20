/** SVGの操作を扱うユーティリティクラスです */
{
    // #### staticプライベードメソッドの定義 ####
    // 3次ベジェ曲線の点を求める関数
    const cubicBezierPoint = (t, p0, p1, p2, p3) => {
        const mt = 1 - t;
        return (
            mt * mt * mt * p0 +
            3 * mt * mt * t * p1 +
            3 * mt * t * t * p2 +
            t * t * t * p3
        );
    };
    // 2次ベジェ曲線の点を求める関数
    const quadraticBezierPoint = (t, p0, p1, p2) => {
        const mt = 1 - t;
        return (
            mt * mt * p0 +
            2 * mt * t * p1 +
            t * t * p2
        );
    };
    // 3次ベジェ曲線の速度ベクトルを計算
    const cubicBezierDerivative = (t, p0, p1, p2, p3) => {
        const mt = 1 - t;
        return (
            3 * mt * mt * (p1 - p0) +
            6 * mt * t * (p2 - p1) +
            3 * t * t * (p3 - p2)
        );
    };
    // 1次方程式を解く
    const solveLinear = (a, b) => {
        if (a === 0) return []; // 解なし（傾きが0の場合）
        let t = -b / a;
        return (t >= 0 && t <= 1) ? [t] : []; // tが[0,1]の範囲にある場合のみ返す
    };
    // 2次方程式を解く
    const solveQuadratic = (a, b, c) => {
        let discriminant = b * b - 4 * a * c;
        if (discriminant < 0) return [];
        let sqrtD = Math.sqrt(discriminant);
        let t1 = (-b + sqrtD) / (2 * a);
        let t2 = (-b - sqrtD) / (2 * a);
        return [t1, t2].filter(t => t >= 0 && t <= 1);
    };

    // 配列を指定のコールバック関数を用いて合計した値を返す関数
    const summary = (array, fn) => {
        let result = 0;
        array.forEach((v, ii)=>{
            if (!fn)return result+=v;
            result+=fn(v, ii);
        });
        return result;
    };


    /** 直線の長さを取得する関数 */
    const getLineLength = (p0X, p0Y, p1X, p1Y) => {
        const dx = p1X - p0X;
        const dy = p1Y - p0Y;
        return Math.sqrt(dx * dx + dy * dy);
    };
    /** 
    3次ベジェ曲線の長さを取得する関数(精度優先の場合)
    @param 始点，制御点１，制御点２，終点
    参考：https://github.com/ryosukeeeee/BezierLength/blob/master/BezierLength.ipynb
    */
    const divf = (coef, s) => {
        return Math.sqrt(coef[0]*s*s*s*s + coef[1]*s*s*s + coef[2]*s*s + coef[3]*s + coef[4]);
    };
    const getRungeKuttaCubicBezierLength = (p0X, p0Y, c0X, c0Y, c1X, c1Y, p1X, p1Y, div) => {
        const C_DIMENSION = 2;
        const p = [];
        for (let ii=0; ii < 4; ii++) {
            p[ii] = [];
            for (let jj=0; jj < C_DIMENSION; jj++) {
                p[ii].push(arguments[ii * C_DIMENSION + jj]);
            }
        }
        /*
        ###########################################################
        #
        # P(t)=(1-t)^3*P0 + 3t(1-t)^2*P1 + 3t^2(1-t)*P2 + t^3*P3
        #      =At^3 + Bt^2 + Ct + D
        # とすると
        # A=-P0 + 3P1 - 3P2 + P3
        # B=3P0 - 6P1 + 3P2
        # C=-3P0 + 3P1
        # D=P0
        # 微分すると，
        # P'(t)=3At^2 + 2Bt + C
        # これを二乗する
        # (P'(t))^2 = 9A^2t^4 + 12ABt^3 + (6AC+4B^2)t^2 + 4BCt + C^2
        #
        ###########################################################
        */
        const A = [];
        const B = [];
        const C = [];
        const D = [];
        for (let ii=0; ii < C_DIMENSION; ii++) {
            A.push(-p[0][ii] + 3*p[1][ii] - 3*p[2][ii] + p[3][ii]);
            B.push(3*p[0][ii] - 6*p[1][ii] + 3*p[2][ii]);
            C.push(-3*p[0][ii] + 3*p[1][ii]);
            D.push(p[0][ii]);
        }
        const coef = [];
        coef.push(9 * summary(A, (v)=>v*v));
        coef.push(12* summary(A, (v,ii)=>v*B[ii]));
        coef.push(6 * summary(A, (v,ii)=>v*C[ii]) + 4 * summary(B, (v,ii)=>v*v));
        coef.push(4 * summary(B, (v,ii)=>v*C[ii]));
        coef.push(summary(C, (v)=>v*v));

        if (typeof div === "undefined") {
            div = 40;
        }
        /* 3次ルンゲクッタ法で導出 */
        let length = 0;
        const h = 1.0/div;
        for (let t = 0; t <= 1; t+=h) {
            const k1 = divf(coef, t);
            const k2 = divf(coef, t + (h/2));
            const k3 = divf(coef, t + h);
            const y = h * (k1 + 4*k2 + k3) / 6.0;
            length += y;
        }

        return length;
    };
    // ガウス・ルジャンドル積分で長さを計算(速度優先の場合)
    const getGaussianCubicBezierLength = (p0X, p0Y, c0X, c0Y, c1X, c1Y, p1X, p1Y) => {
        const gaussWeights = [0.29552422471, 0.26926671931, 0.21908636251, 0.14945134915, 0.06667134431];
        const gaussNodes = [0.14887433898, 0.43339539413, 0.67940956829, 0.86506336668, 0.97390652852];

        let length = 0;
        for (let ii = 0; ii < 5; ii++) {
            const t = (gaussNodes[ii] + 1) / 2;
            const dx = cubicBezierDerivative(t, p0X, c0X, c1X, p1X);
            const dy = cubicBezierDerivative(t, p0Y, c0Y, c1Y, p1Y);
            length += gaussWeights[ii] * Math.sqrt(dx * dx + dy * dy);
        }
        return length;
    };

    /** 
        2次ベジェ曲線の長さを取得する関数
        @param 始点，制御点１，制御点２，終点
        参考：http://yamatyuu.net/other/bezier/quadratic_bezier3.html
     */
    const getQuadraticBezierLength = (p0X, p0Y, c0X, c0Y, p1X, p1Y) => {
        const ax = p0X - 2*c0X + p1X;
        const ay = p0Y - 2*c0Y + p1Y;
        const bx = 2*c0X - 2*p0X;
        const by = 2*c0Y - 2*p0Y;

        const A = 4*(ax*ax + ay*ay);
        const B = 4*(ax*bx + ay*by);
        const C = bx*bx + by*by;
        const Sabc = 2*Math.sqrt(A+B+C);
        const A_2 = Math.sqrt(A);
        const A_32 = 2*A*A_2;
        const C_2 = 2*Math.sqrt(C);
        const BA = B/A_2;
        return ( A_32*Sabc + 
                    A_2*B*(Sabc-C_2) + 
                    (4*C*A-B*B)*Math.log( (2*A_2+BA+Sabc)/(BA+C_2) ) 
                )/(4*A_32);
    };

    // 2次ベジェ曲線のAABBを求める（解析的計算）
    const getQuadraticBezierAABB = (p0X, p0Y, c0X, c0Y, p1X, p1Y) => {
        const tx = solveLinear(2 * (p0X - 2 * c0X + p1X), 2 * (2 * c0X - 2 * p0X), p0X - c0X);
        const ty = solveLinear(2 * (p0Y - 2 * c0Y + p1Y), 2 * (2 * c0Y - 2 * p0Y), p0Y - c0Y);
        
        const xVals = [p0X, p1X, ...tx.map(t => (1 - t) * (1 - t) * p0X + 2 * (1 - t) * t * c0X + t * t * p1X)];
        const yVals = [p0Y, p1Y, ...ty.map(t => (1 - t) * (1 - t) * p0Y + 2 * (1 - t) * t * c0Y + t * t * p1Y)];
        
        return { minX: Math.min(...xVals), minY: Math.min(...yVals), maxX: Math.max(...xVals), maxY: Math.max(...yVals) };
    };
    // 3次ベジェ曲線のAABBを求める（解析的計算）
    const getCubicBezierAABB = (p0X, p0Y, c0X, c0Y, c1X, c1Y, p1X, p1Y) => {
        const tx = solveQuadratic(
            3 * (-p0X + 3 * c0X - 3 * c1X + p1X),
            6 * (p0X - 2 * c0X + c1X),
            3 * (-p0X + c0X)
        );
        const ty = solveQuadratic(
            3 * (-p0Y + 3 * c0Y - 3 * c1Y + p1Y),
            6 * (p0Y - 2 * c0Y + c1Y),
            3 * (-p0Y + c0Y)
        );
        
        const xVals = [p0X, p1X, ...tx.map(t => cubicBezierPoint(t, p0X, c0X, c1X, p1X))];
        const yVals = [p0Y, p1Y, ...ty.map(t => cubicBezierPoint(t, p0Y, c0Y, c1Y, p1Y))];
        
        return { minX: Math.min(...xVals), minY: Math.min(...yVals), maxX: Math.max(...xVals), maxY: Math.max(...yVals) };
    };

    
    /** 直線を分割する */
    const splitLine = function (x0, y0, x1, y1, t) {
        return [(x1-x0)*t+x0,(y1-y0)*t+y0];
    };
    /** 3次ベジェ曲線を分割する */
    const splitCubicBezier = function (x0, y0, x1, y1, x2, y2, x3, y3, t) {
        const q = [
            splitLine(x0, y0, x1, y1, t)
           ,splitLine(x1, y1, x2, y2, t)
           ,splitLine(x2, y2, x3, y3, t)
        ];
        const r = [
            splitLine(q[0][0], q[0][1], q[1][0], q[1][1], t)
           ,splitLine(q[1][0], q[1][1], q[2][0], q[2][1], t)
        ];
        const s = splitLine(r[0][0], r[0][1], r[1][0], r[1][1], t);
        return q[0].concat(r[0]).concat(s);
    };
    /** 2次ベジェ曲線を分割する */
    const splitQuadraticBezier = (x0, y0, x1, y1, x2, y2, t) => {
        const q = [
            splitLine(x0, y0, x1, y1, t)
           ,splitLine(x1, y1, x2, y2, t)
        ];
        const r = splitLine(q[0][0], q[0][1], q[1][0], q[1][1], t);
        return q[0].concat(r);
    };

    // 度数をラジアンに変換する関数
    const degToRad = (degrees) => {
        return degrees * (Math.PI / 180);
    };
    // 2ベクトル間の角度を計算する関数
    const angleBetween = (u, v) => {
        const dot = u[0] * v[0] + u[1] * v[1]; // 内積を計算
        const lenU = Math.sqrt(u[0] * u[0] + u[1] * u[1]); // uの長さ
        const lenV = Math.sqrt(v[0] * v[0] + v[1] * v[1]); // vの長さ
        const x = dot / (lenU * lenV);
        const angle = Math.acos(x > 1 ? 1 : x < -1 ? -1 : x); // 角度を求める
        return (u[0] * v[1] - u[1] * v[0] < 0) ? -angle : angle; // 外積を使って回転方向を決定
    };

    // SVGの円弧をSVGからCanvas形式に変換する関数
    // 参考： https://triple-underscore.github.io/SVG11/implnote.html#ArcImplementationNotes
    const convertArcSvgToCanvas = (x1, y1, x2, y2, rx, ry, xAxisRotation, largeArcFlag, sweepFlag) => {
        // X軸回転角度をラジアンに変換
        const phi = degToRad(xAxisRotation);
        
        // 始点と終点の中間のオフセットを計算
        const dx = (x1 - x2) / 2;
        const dy = (y1 - y2) / 2;

        // ステップ1: 座標系を回転後の新しい基準座標 (x', y') に変換
        const x1p = Math.cos(phi) * dx + Math.sin(phi) * dy;
        const y1p = -Math.sin(phi) * dx + Math.cos(phi) * dy;

        // 半径の2乗を計算
        const rxSq = rx * rx;
        const rySq = ry * ry;
        const x1pSq = x1p * x1p;
        const y1pSq = y1p * y1p;

        // 楕円方程式の条件を満たすために中心座標を決定
        let radicant = (rxSq * rySq - rxSq * y1pSq - rySq * x1pSq) / (rxSq * y1pSq + rySq * x1pSq);
        if (radicant < 0) radicant = 0;
        const factor = (largeArcFlag === sweepFlag ? -1 : 1) * Math.sqrt(radicant);

        // ステップ2: 中心座標 (cx', cy') を計算
        const cxp = factor * (rx * y1p) / ry;
        const cyp = factor * (-ry * x1p) / rx;

        // ステップ3: 元の座標系での中心座標 (cx, cy) を計算
        const cx = Math.cos(phi) * cxp - Math.sin(phi) * cyp + (x1 + x2) / 2;
        const cy = Math.sin(phi) * cxp + Math.cos(phi) * cyp + (y1 + y2) / 2;

        // 開始角度を計算
        const startAngle = angleBetween([1, 0], [(x1p - cxp) / rx, (y1p - cyp) / ry]);
        // 終了角度との差分を計算
        const deltaAngle = angleBetween([(x1p - cxp) / rx, (y1p - cyp) / ry], [(-x1p - cxp) / rx, (-y1p - cyp) / ry]);

        // 方向フラグに応じて角度を調整
        if (!sweepFlag && deltaAngle > 0) {
            deltaAngle -= 2 * Math.PI;
        } else if (sweepFlag && deltaAngle < 0) {
            deltaAngle += 2 * Math.PI;
        }

        return [cx, cy, rx, ry, phi, startAngle, startAngle + deltaAngle, !sweepFlag];
    };

    /** Canvasの楕円弧をベジェ曲線に変換する */
    const convertEllipseArcToBezier = (cx, cy, rx, ry, rotation, startAngle, endAngle, counterclockwise = false) => {
        const K = 0.5522847498; // 楕円近似の制御点係数
        const cosRot = Math.cos(rotation);
        const sinRot = Math.sin(rotation);
    
        // 方向フラグを考慮して角度の順序を調整
        if (counterclockwise) {
            [startAngle, endAngle] = [endAngle, startAngle];
        }
    
        // 開始角度と終了角度をラジアンで正規化
        const theta = endAngle - startAngle;
        const segments = Math.ceil(Math.abs(theta) / (Math.PI / 2)); // 90度ごとに分割
        const deltaTheta = theta / segments;
    
        const startX = cx + rx * Math.cos(startAngle) * cosRot - ry * Math.sin(startAngle) * sinRot;
        const startY = cy + rx * Math.cos(startAngle) * sinRot + ry * Math.sin(startAngle) * cosRot;
    
        const result = [startX, startY];
    
        for (let ii = 0; ii < segments; ii++) {
            const angle1 = startAngle + ii * deltaTheta;
            const angle2 = startAngle + (ii + 1) * deltaTheta;
            const alpha = Math.tan((angle2 - angle1) / 2) * 4 / 3;
    
            const x1 = cx + rx * (Math.cos(angle1) - alpha * Math.sin(angle1)) * cosRot
                     - ry * (Math.sin(angle1) + alpha * Math.cos(angle1)) * sinRot;
            const y1 = cy + rx * (Math.cos(angle1) - alpha * Math.sin(angle1)) * sinRot
                     + ry * (Math.sin(angle1) + alpha * Math.cos(angle1)) * cosRot;
    
            const x2 = cx + rx * (Math.cos(angle2) + alpha * Math.sin(angle2)) * cosRot
                     - ry * (Math.sin(angle2) - alpha * Math.cos(angle2)) * sinRot;
            const y2 = cy + rx * (Math.cos(angle2) + alpha * Math.sin(angle2)) * sinRot
                     + ry * (Math.sin(angle2) - alpha * Math.cos(angle2)) * cosRot;
    
            const endX = cx + rx * Math.cos(angle2) * cosRot - ry * Math.sin(angle2) * sinRot;
            const endY = cy + rx * Math.cos(angle2) * sinRot + ry * Math.sin(angle2) * cosRot;
    
            result.push(x1, y1, x2, y2, endX, endY);
        }
    
        return result;
    };
    /** SVGの円弧をベジェ曲線に変換する */
    const convertArcSvgToBezier = (x1, y1, x2, y2, rx, ry, xAxisRotation, largeArcFlag, sweepFlag) => {
        return convertEllipseArcToBezier(...convertArcSvgToCanvas(x1, y1, x2, y2, rx, ry, xAxisRotation, largeArcFlag, sweepFlag));
    };


    /** パスをパースしたオブジェクトを格納するClass */
    class SVGPath {
        constructor () {
            this.paths = [];
            this.lengths = [];
            this.sumLength = 0;
        }
        /** コマンド取得 */
        get (index) {
            return this.paths[index];
        }
        /** コマンド追加 */
        add (command, path) {
            this.paths.push({
                command: command,
                path: path
            });
        }
        /** コマンド更新 */
        set (index, command, path) {
            this.paths[index].command = command;
            this.paths[index].path = path;
        }
        /** 長さなどをリセットする */
        refresh () {

        }


        /** パースした文字をCanvas上に描画する */
        draw (ctx, oX, oY, sX, sY) {
            oX = oX||0;
            oY = oY||0;

            sX = sX||1;
            sY = sY||1;
            const dimension = 2;
            ctx.beginPath();

            this.paths.forEach((v)=>{
                switch (v.command) {
                    case SVGPath.C_COMMOND.MOVE:
                        for (let ii=0; ii < v.path.length; ii+=dimension) {
                            ctx.moveTo(v.path[ii]*sX+oX, v.path[ii+1]*sY+oY);
                        }
                    break;
                    case SVGPath.C_COMMOND.LINE:
                        for (let ii=0; ii < v.path.length; ii+=dimension) {
                            ctx.lineTo(v.path[ii]*sX+oX, v.path[ii+1]*sY+oY);
                        }
                    break;
                    case SVGPath.C_COMMOND.CURVE:
                        for (let ii=0; ii < v.path.length; ii+=dimension*3) {
                            ctx.bezierCurveTo(
                                v.path[ii  ]*sX+oX, v.path[ii+1]*sY+oY
                               ,v.path[ii+2]*sX+oX, v.path[ii+3]*sY+oY
                               ,v.path[ii+4]*sX+oX, v.path[ii+5]*sY+oY
                            );
                        }
                    break;
                    case SVGPath.C_COMMOND.QUADRATIC_CURVE:
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
        /** パスを文字列に変換 */
        toPathString () {
            return this.paths.map(v=>v.command+v.path.join(",")).join("");
        }
        /** コマンドの数を返す */
        get count () {
            return this.paths.length;
        }
        /** パスの長さを返す */
        get length () {
            return this.sumLength;
        }
    }
    /** SVGパスコマンドの定義 */
    SVGPath.C_COMMOND = {
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
    /** SVGパスからインスタンスを生成 */
    SVGPath.parseString = (strPath) => {
        // SVGパスコマンドの定義
        const C_COMMOND = SVGPath.C_COMMOND;
    
        // コマンドリストを取得し、正規表現を作成
        const lstCommand   = Object.keys(C_COMMOND).map((v)=>C_COMMOND[v]).join("");
        const lowerCommand = lstCommand.toLowerCase();
        const regCommand   = new RegExp(`[${lstCommand}]`, "ig");
        const dimension    = 2; // 2D座標空間
    
        // 入力文字列をコマンドと数値に分割
        const arrCommands  = strPath.match(regCommand);
        const arrPath      = strPath.split(regCommand);

        if (!arrPath[0] || /^\s+$/.test(arrPath[0])) {
            arrPath.shift(); // 空の要素があれば削除
        }
        const buf = [];
        let currentPos = [];
        let beforePath = [];
        let beginPos   = [];
    
        const result = new SVGPath();
        arrPath.forEach((v, ii)=>{
            const blnRelative = lowerCommand.indexOf(arrCommands[ii]) > -1; // 相対座標判定
            const command = arrCommands[ii].toUpperCase();
            const r = {
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
    
            const p = [];
            let before = [];
            switch (command) {
                case C_COMMOND.ARC:
                    const begin = currentPos;
                    console.log(currentPos, buf);
                    // 楕円弧をより正確なベジェ曲線に変換
                    for (let ii = 0; ii < r.path.length; ii += dimension * 2 + 3) {
                        const x1 = ii === 0 ? begin[0] : r.path[ii - dimension];
                        const y1 = ii === 0 ? begin[0] : r.path[ii - dimension + 1];

                        const rx = r.path[ii];
                        const ry = r.path[ii + 1];
                        const xAxisRotation = r.path[ii + 2] * (Math.PI / 180); // 角度をラジアンに変換
                        const largeArcFlag = r.path[ii + 3];
                        const sweepFlag = r.path[ii + 4];
                        const x2 = r.path[ii + 5];
                        const y2 = r.path[ii + 6];

                        // 楕円弧をベジェ曲線に変換
                        console.log(convertArcSvgToBezier(x1, y1, x2, y2, rx, ry, xAxisRotation, largeArcFlag, sweepFlag));
                        p.push(...convertArcSvgToBezier(x1, y1, x2, y2, rx, ry, xAxisRotation, largeArcFlag, sweepFlag).slice(dimension));
                    }
                    r.command = C_COMMOND.CURVE;
                    r.path = p;
                break;
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
                        const b = [];
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
                        const b = [];
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
            if (!result.get(result.count - 1) || result.get(result.count - 1).command !== r.command) {
                result.add(r.command, r.path);
            } else {
                result.get(result.count-1).path.push(...r.path)
            }
        });
    
        return result;
    };


    const SVGUtility = {
        /** SVG(パス)のXML読み込みを行う */
        loadXML : function (path) {
            return new Promise(function(resolve, reject){
                const xhr = new XMLHttpRequest();
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
                return SVGUtility.parseStringToDOM(data);
            });
        },
        /** SVG(パス)のオブジェクト読み込みを行う */
        loadImage : function (path) {
            return SVGUtility.loadXML(path)
            .then(function(data){
                return SVGUtility.toXMLImage(data);
            });
        },
        /** SVG文字列をDOMに変換する */
        parseStringToDOM : function (data) {
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
        /** パス文字列パース */
        parsePathString : function (strPath) {
            return SVGPath.parseString(strPath);
        }
    }

    /* エクスポート */
    self.SVGUtility = SVGUtility;
}



// TODO:あとで整理する
{

}