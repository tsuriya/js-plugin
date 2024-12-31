/** パスユーティリティクラス */
{
    let C_DIMENSION = 2;


    /** パスクラスの抽象クラス */
    const AbstructPath = function (paths) {
        if (!paths) {
            return;
        }
        this.paths = paths;
        this.lengths = [];
        this.ratios  = [];
        this.allLength = 0;
    }
    AbstructPath.prototype = {
        /** 指定パスを取得する */
        getPath : function (index) {},
        /** パスの総パス長を取得する */
        getAllLength : function () {},
        /** パスの割合一覧を取得する */
        getRatios : function () {},
        /** 指定した割合のパスを取得する */
        getRatioPaths : function (ratio) {},
        /** 指定地点までの描画を行う */
        draw : function (ctx, options) {}
    };
    const _extend  = function (a,b) {
        let r = {};
        for (let key in a) {
            r[key] = a[key];
        }
        for (let key in b) {
            r[key] = b[key];
        }
        return r;
    }
    const _binarySearch = function (ratios, ratio) {
        // バイナリサーチ
        let range = [0, ratios.length - 1];
        let pp = ~~((range[1] - range[0]) / 2) + range[0];
        // 検索範囲が1以下となるまでループ
        while (range[1] - range[0] > 1) {
            // 検索条件に合致する場合は処理を終了する
            if (ratios[pp] >= ratio
             && (pp == 0 || ratios[pp - 1] < ratio)) {
                break;
            }
            // ピポットが検索値を超える場合、最大値にピポットを設定
            if (ratios[pp] > ratio) {
                range[1] = pp;
            } else
            // ピポットが検索値を未満の場合、最小値にピポットを設定
            if (ratios[pp] < ratio) {
                range[0] = pp;
            } else {
                break;
            }
            pp = ~~((range[1] - range[0]) / 2) + range[0];
        }
        if (ratios[pp] < ratio
         || (pp != 0 && ratios[pp - 1] >= ratio)) {
            pp = range[1];
        }
        // let pp = this.ratios.findIndex((v)=>v>=ratio);

        // パス配列から指定割合までのパスを取得する
        return pp;
    }



    /** 直線パスを扱うクラス */
    const LinePath = function (paths) {
        if (!paths) {
            return;
        }
        this.paths = paths;
        this.lengths = [];
        this.ratios  = [];
        let allLength = 0;

        // 各パス長とその合計値を取得
        for (let ii = C_DIMENSION; ii < paths.length; ii+=C_DIMENSION) {
            let x = paths[ii    ] - paths[ii - C_DIMENSION    ];
            let y = paths[ii + 1] - paths[ii - C_DIMENSION + 1];
            let length = Math.sqrt(x*x + y*y);
            this.lengths.push(length);
            allLength += length;
        }
        // 各パス長の割合を取得
        let sum = 0;
        this.lengths.forEach((v)=>{
            sum+=v;
            this.ratios.push(sum / allLength);
        });
        // パス長の合計値を取得
        this.allLength = allLength;
    }

    LinePath.prototype = _extend(AbstructPath.prototype, {
        /** 指定ポイントを取得する */
        getPoints : function (index) {
            return [this.paths[index * C_DIMENSION], this.paths[index * C_DIMENSION + 1]];
        },
        /** パスの割合一覧を取得する */
        getRatios : function () {
            return this.ratios;
        },
        /** パスの総パス長を取得する */
        getAllLength : function () {
            return this.allLength;
        },
        /** 指定した割合のパスを取得する */
        getRatioPaths : function (ratio) {
            if (ratio >= 1)return this.paths;
            if (ratio <= 0)return [];

            // 表示範囲取得

            // パス配列から指定割合までのパスを取得する
            const pp = _binarySearch(this.ratios, ratio);
            const index = (pp + 1) * C_DIMENSION;
            const remLength = this.allLength * (ratio - (this.ratios[pp - 1]||0));
            const remRatio = remLength / this.lengths[pp];
            let result = this.paths.slice(0, index);
            Array.prototype.push.apply(result, 
                _splitLine(
                    this.paths[index - C_DIMENSION]||0
                  , this.paths[index - C_DIMENSION + 1]||0
                  , this.paths[index]
                  , this.paths[index + 1], remRatio
                )
            );
            return result;
        },
        /** 指定地点までの描画を行う */
        draw          : function (ctx, options) {
            const ratio = (options && options.ratio === 0 ? 0 : options.ratio) || 1;
            // 初期値を保持する
            const buf = {
                fillStyle   : ctx.fillStyle,
                strokeStyle : ctx.strokeStyle,
                lineWidth   : ctx.lineWidth,
                lineJoin    : ctx.lineJoin,
                miterLimit  : ctx.miterLimit,
            };
            const position = {
                x : (options && options.position === 0 ? 0 : options.position) || 0,
                y : (options && options.position === 0 ? 0 : options.position) || 0,
            };

            // オプション値を設定する
            for (let key in buf) {
                ctx[key] = options && (options[key] === 0 ? 0 : options[key]) || buf[key];
            }
            
            const paths = this.getRatioPaths(ratio);
            ctx.beginPath();
            ctx.transform(position.x, position.y);

            ctx.moveTo(paths[0], paths[1]);
            for (let ii = 2; ii < paths.length; ii+=2) {
                ctx.lineTo(paths[ii], paths[ii+2]);
            }

            // 描画する
            if (!ctx.fillStyle) {
                ctx.fill();
            }
            if (ctx.lineWidth > 0) {
                ctx.stroke();
            }

            // 初期値にリセットする
            for (let key in buf) {
                ctx[key] = buf[key];
            }
            ctx.transform(0, 0);
        }
    });


    /** ３次ベジェ曲線を扱うクラス */
    const CubicBezierPath = function (paths) {
        if (!paths) {
            return;
        }
        this.paths = paths;
        this.lengths = [];
        this.ratios  = [];
        let allLength = 0;

        // 各パス長とその合計値を取得
        for (let ii = C_DIMENSION; ii < paths.length; ii += C_DIMENSION * 3) {
            let length = getCubicBezierLength.apply(self, paths.slice(ii - C_DIMENSION, ii + C_DIMENSION * 3));
            this.lengths.push(length);
            allLength += length;
        }
        // 各パス長の割合を取得
        let sum = 0;
        this.lengths.forEach((v)=>{
            sum+=v;
            this.ratios.push(sum / allLength);
        });
        // パス長の合計値を取得
        this.allLength = allLength;
    }
    CubicBezierPath.prototype = _extend(AbstructPath.prototype, {
        /** 指定ポイントを取得する */
        getPoints : function (index) {
            return [this.paths[index * C_DIMENSION], this.paths[index * C_DIMENSION + 1]];
        },
        /** パスの割合一覧を取得する */
        getRatios : function () {
            return this.ratios;
        },
        /** パスの総パス長を取得する */
        getAllLength : function () {
            return this.allLength;
        },
        /** 指定した割合のパスを取得する */
        getRatioPaths : function (ratio) {
            if (ratio >= 1)return this.paths;
            if (ratio <= 0)return [];

            // 表示範囲取得

            // パス配列から指定割合までのパスを取得する
            const pp = _binarySearch(this.ratios, ratio);
            const index = pp * C_DIMENSION * 3 + C_DIMENSION;
            const remLength = this.allLength * (ratio - (this.ratios[pp - 1]||0));
            const remRatio = remLength / this.lengths[pp];
            let result = this.paths.slice(0, index);
            Array.prototype.push.apply(result, 
                _splitCubicBezier(
                    this.paths[index - 1 * C_DIMENSION    ]||0
                  , this.paths[index - 1 * C_DIMENSION + 1]||0
                  , this.paths[index + 0 * C_DIMENSION    ]||0
                  , this.paths[index + 0 * C_DIMENSION + 1]||0
                  , this.paths[index + 1 * C_DIMENSION    ]||0
                  , this.paths[index + 1 * C_DIMENSION + 1]||0
                  , this.paths[index + 2 * C_DIMENSION    ]||0
                  , this.paths[index + 2 * C_DIMENSION + 1]||0
                  , remRatio
                )
            );
            return result;
        },
    });

    /** ２次ベジェ曲線を扱うクラス */
    const QuadraticBezierPath = function (paths) {
        if (!paths) {
            return;
        }
        this.paths = paths;
        this.lengths = [];
        this.ratios  = [];
        let allLength = 0;

        // 各パス長とその合計値を取得
        for (let ii = C_DIMENSION; ii < paths.length; ii += C_DIMENSION * 2) {
            let length = getQuadraticBezierLength.apply(self, paths.slice(ii - C_DIMENSION, ii + C_DIMENSION * 2));
            this.lengths.push(length);
            allLength += length;
        }
        // 各パス長の割合を取得
        let sum = 0;
        this.lengths.forEach((v)=>{
            sum+=v;
            this.ratios.push(sum / allLength);
        });
        // パス長の合計値を取得
        this.allLength = allLength;
    }
    QuadraticBezierPath.prototype = _extend(AbstructPath.prototype, {
        /** 指定ポイントを取得する */
        getPoints : function (index) {
            return [this.paths[index * C_DIMENSION], this.paths[index * C_DIMENSION + 1]];
        },
        /** パスの割合一覧を取得する */
        getRatios : function () {
            return this.ratios;
        },
        /** パスの総パス長を取得する */
        getAllLength : function () {
            return this.allLength;
        },
        /** 指定した割合のパスを取得する */
        getRatioPaths : function (ratio) {
            if (ratio >= 1)return this.paths;
            if (ratio <= 0)return [];

            // 表示範囲取得

            // パス配列から指定割合までのパスを取得する
            const pp = _binarySearch(this.ratios, ratio);
            const index = pp * C_DIMENSION * 2 + C_DIMENSION;
            const remLength = this.allLength * (ratio - (this.ratios[pp - 1]||0));
            const remRatio = remLength / this.lengths[pp];
            let result = this.paths.slice(0, index);
            Array.prototype.push.apply(result, 
                _splitQuadraticBezier(
                    this.paths[index - 1 * C_DIMENSION    ]||0
                  , this.paths[index - 1 * C_DIMENSION + 1]||0
                  , this.paths[index + 0 * C_DIMENSION    ]||0
                  , this.paths[index + 0 * C_DIMENSION + 1]||0
                  , this.paths[index + 1 * C_DIMENSION    ]||0
                  , this.paths[index + 1 * C_DIMENSION + 1]||0
                  , remRatio
                )
            );
            return result;
        },
    });

    /** 円弧を扱うクラス */
    const ArcPath = function (paths) {}
    ArcPath.prototype = _extend(AbstructPath.prototype, {});

    /** パスの複合クラス */
    const Paths = function (paths) {
        if (!paths) {
            return;
        }
        this.paths = paths;
        this.lengths = [];
        this.ratios  = [];
        this.allLength = 0;
        let allLength = 0;

        // 各パス長とその合計値を取得
        for (let ii = 0; ii < paths.length; ii++) {
            let length = paths[ii].getAllLength();
            this.lengths.push(length);
            allLength += length;
        }
        // 各パス長の割合を取得
        let sum = 0;
        this.lengths.forEach((v)=>{
            sum+=v;
            this.ratios.push(sum / allLength);
        });
        // パス長の合計値を取得
        this.allLength = allLength;
    }
    Paths.prototype = _extend(AbstructPath.prototype, {
        /** 指定パスを取得する */
        getPath : function (index) {
            return this.paths[index];
        },
        /** パスの割合一覧を取得する */
        getRatios : function () {
            return this.ratios;
        },
        /** パスの総パス長を取得する */
        getAllLength : function () {
            return this.allLength;
        },
        /** 指定した割合のパスを取得する */
        getRatioPaths : function (ratio) {
            if (ratio <= 0)return [];

            // 表示範囲取得

            // パス配列から指定割合までのパスを取得する
            const pp = _binarySearch(this.ratios, ratio);
            const remLength = this.allLength * (ratio - (this.ratios[pp - 1]||0));
            const remRatio = remLength / this.lengths[pp];
            let result = this.paths.slice(0, pp);
            // 直線パスの場合
            if (this.paths[pp] instanceof LinePath) {
                result.push(new LinePath(this.paths[pp].getRatioPaths(remRatio)));
            } else
            // 3次ベジェパスの場合
            if (this.paths[pp] instanceof CubicBezierPath) {
                result.push(new CubicBezierPath(this.paths[pp].getRatioPaths(remRatio)));
            } else
            // 2次ベジェパスの場合
            if (this.paths[pp] instanceof QuadraticBezierPath) {
                result.push(new QuadraticBezierPath(this.paths[pp].getRatioPaths(remRatio)));
            }
            return result;
        }
    });



    /** 
        3次ベジェ曲線の長さを取得する関数
        @param 始点，制御点１，制御点２，終点
        参考：https://github.com/ryosukeeeee/BezierLength/blob/master/BezierLength.ipynb
     */
    const getCubicBezierLength = function (p0X, p0Y, c0X, c0Y, c1X, c1Y, p1X, p1Y, div) {
        /*
        p = [] #始点，制御点１，制御点２，終点を入れるリスト
        for i in range(4):
            p.append(np.array([node[0][i],node[1][i]]))
        self.p = p
        */
        // let p = [
        //     [p0X, p0Y]
        //    ,[c0X, c0Y]
        //    ,[c1X, c1Y]
        //    ,[p1X, p1Y]
        // ];
        let p = [];
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
        A = -p[0] + 3*p[1] - 3*p[2] + p[3] 
        B = 3*p[0] - 6*p[1] + 3*p[2]
        C = -3*p[0] + 3*p[1]
        D = p[0]
        self.A = A
        self.B = B
        self.C = C
        self.D = D
        */
        let A = [];
        let B = [];
        let C = [];
        let D = [];
        for (let ii=0; ii < C_DIMENSION; ii++) {
            A.push(-p[0][ii] + 3*p[1][ii] - 3*p[2][ii] + p[3][ii]);
            B.push(3*p[0][ii] - 6*p[1][ii] + 3*p[2][ii]);
            C.push(-3*p[0][ii] + 3*p[1][ii]);
            D.push(p[0][ii]);
        }
        /*
        coef = []
        coef.append(9*np.sum(A**2))
        coef.append(12*np.sum(A*B))
        coef.append(6*np.sum(A*C) + 4*np.sum(B**2))
        coef.append(4*np.sum(B*C))
        coef.append(np.sum(C**2))
        self.coef = coef
        */
        let coef = [];
        coef.push(9 * _summary(A, (v)=>v*v));
        coef.push(12* _summary(A, (v,ii)=>v*B[ii]));
        coef.push(6 * _summary(A, (v,ii)=>v*C[ii]) + 4 * _summary(B, (v,ii)=>v*v));
        coef.push(4 * _summary(B, (v,ii)=>v*C[ii]));
        coef.push(_summary(C, (v)=>v*v));

        /*
        def get_length_by_3rdRungeKutta(self, div=100):
            length = 0
            interval = np.linspace(0,1,div)
            h = 1.0/div
            for t in interval[1:]:
                k1 = self.divf(t)
                k2 = self.divf(t + (h/2))
                k3 = self.divf(t + h)
                y = h * (k1 + 4*k2 + k3) / 6.0
                length = length + y

            return length
        */
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
    }
    const divf = function (coef, s) {
        // return np.sqrt(self.coef[0]*s**4 + self.coef[1]*s**3 + self.coef[2]*s**2 + self.coef[3]*s + self.coef[4]);
        return Math.sqrt(coef[0]*s*s*s*s + coef[1]*s*s*s + coef[2]*s*s + coef[3]*s + coef[4]);
    }
    CubicBezierPath.getCubicBezierLength = getCubicBezierLength;

    /** 
        2次ベジェ曲線の長さを取得する関数
        @param 始点，制御点１，制御点２，終点
        参考：http://yamatyuu.net/other/bezier/quadratic_bezier3.html
     */
    const getQuadraticBezierLength = function (p0X, p0Y, c0X, c0Y, p1X, p1Y) {
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
    }
    QuadraticBezierPath.getQuadraticBezierLength = getQuadraticBezierLength;

    /** 
        楕円弧の長さを取得する関数
        @param 始点，半径，X軸の傾きの角度，大きいほうを採用するか，どちらの向きか，終点
     */
    const getArcBezierLength = function (p0X, p0Y, rX, rY, xAxisRotation, largeArcFlag, sweepFlag, p1X, p1Y) {
       if (rX===rY) {
            
       } 
    }
    ArcPath.getArcBezierLength = getArcBezierLength;

    /** 直線を分割する */
    const _splitLine = function (x0, y0, x1, y1, t) {
        return [(x1-x0)*t+x0,(y1-y0)*t+y0];
    }
    /** 3次ベジェ曲線を分割する */
    const _splitCubicBezier = function (x0, y0, x1, y1, x2, y2, x3, y3, t) {
        const q = [
            _splitLine(x0, y0, x1, y1, t)
           ,_splitLine(x1, y1, x2, y2, t)
           ,_splitLine(x2, y2, x3, y3, t)
        ];
        const r = [
            _splitLine(q[0][0], q[0][1], q[1][0], q[1][1], t)
           ,_splitLine(q[1][0], q[1][1], q[2][0], q[2][1], t)
        ];
        const s = _splitLine(r[0][0], r[0][1], r[1][0], r[1][1], t);
        return q[0].concat(r[0]).concat(s);
    }
    /** 2次ベジェ曲線を分割する */
    const _splitQuadraticBezier = function (x0, y0, x1, y1, x2, y2, t) {
        const q = [
            _splitLine(x0, y0, x1, y1, t)
           ,_splitLine(x1, y1, x2, y2, t)
        ];
        const r = _splitLine(q[0][0], q[0][1], q[1][0], q[1][1], t);
        return q[0].concat(r);
    }
    /** 2点から円の中心を取得する*/
    function _getOringinFromCircle(r, x0, y0, x1, y1, sweepFlag) {
        const norm = Math.sqrt((x1-x0)*(x1-x0) + (y1-y0)*(y1-y0));
        const normalizeVec = [
             (x1-x0)/norm
            ,(y1-y0)/norm
        ];
        const middlePoint = [
             (x1-x0)*0.5 + x0
            ,(y1-y0)*0.5 + y0
        ];
        const L = Math.sqrt(r*r - ((x1-x0)*(x1-x0) + (y1-y0)*(y1-y0))*0.25);
        if (sweepFlag) {
            return [
                middlePoint[0] + L * -normalizeVec[1]
               ,middlePoint[1] + L *  normalizeVec[0]
            ];
        } else {
            return [
                middlePoint[0] + L *  normalizeVec[1]
               ,middlePoint[1] + L * -normalizeVec[0]
            ];
        }
    }
window._getOringinFromCircle=_getOringinFromCircle;

    function _getOringinFromEllipse(rX, rY, x0, y0, x1, y1, sweepFlag) {
        const rX_2 = rX*rX;
        const rY_2 = rY*rY;
        const x0_2 = x0*x0;
        const x1_2 = x1*x1;
        const y0_2 = y0*y0;
        const y1_2 = y1*y1;
    
        const a = (x0-x1);
        const b = (y0-y1);
        const c = (x0+x1)*(x0-x1); // (x0_2-x1_2)
        const d = (y0+y1)*(y0-y1); // (y0_2-y1_2)
        const e = (rY/rX)*(rY/rX);
        
        const a_b = a/b;
        
        const A = -e*a_b;
        const B = (e*c+d)/(2*b);
        
        const y0_B = y0-B;
        

        const C = (a_b*a_b*e+1);
        const D = (y0_B*a_b-x0);
        
        const E = rX_2*y0_B*y0_B+rY_2*(x0+rX)*(x0-rX);

        const oX = -D/C+(sweepFlag?1:-1)*Math.sqrt(D*D*rY_2-C*E)/(C*rY);
        const oY = A*oX + B;
        return [oX, oY];
    }
window._getOringinFromEllipse=_getOringinFromEllipse;
    _getOringinFromEllipse

    const _summary = function (array, fn) {
        let result = 0;
        array.forEach((v, ii)=>{
            if (!fn)return result+=v;
            result+=fn(v, ii);
        });
        return result;
    }
    /** 2つの正規化単調増加数列の近しいペアのインデックスを取得する関数 */
    const _toPairIndexFromNormlize = function (vectors1, vectors2) {
        if (vectors1.length === vectors2.length) {
            let result = [];
            vectors1.forEach(function(v, ii){
                [result.push(ii)];
            });
            return {
                is1stSmallest : true,
                pair          : result,
            };
        }
        if (!vectors1.length || !vectors2.length) {
            return {
                is1stSmallest : true,
                pair          : [],
            };
        }

        let ii = 0;
        let jj = 1;
        const is1stSmallest = vectors1.length < vectors2.length;

        let from = is1stSmallest ? vectors1 : vectors2;
        let to   = is1stSmallest ? vectors2 : vectors1;

        let result = [[0]];
        for (; jj < to.length; jj++) {
            if (ii >= from.length-1) {
                result[result.length - 1].push(jj);
                continue;
            }

            if (Math.abs(from[ii][0]-to[jj][0]) < Math.abs(from[ii+1][0]-to[jj][0])) {
                result[result.length - 1].push(jj);
            } else {
                ii++;
                if (ii > from.length-1) {
                    continue;
                }
                result.push(
                    [jj]
                );
            }
        }

        return {
            is1stSmallest : is1stSmallest,
            pair          : result,
        };
    }

    /* エクスポート */
    self.LinePath            = LinePath;
    self.CubicBezierPath     = CubicBezierPath;
    self.QuadraticBezierPath = QuadraticBezierPath;
    self.ArcPath             = ArcPath;
    self.Paths               = Paths;
}
