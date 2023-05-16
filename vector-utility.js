/** ベクトルユーティリティクラス */
{
    const VectorUtility = {
        /** スカラー-2D */
        scalar2d : function (x, y, a) {
            return [x * a, y * a];
        },
        /** スカラー-3D */
        scalar3d : function (x, y, z, a) {
            return [x * a, y * a, z * a];
        },
        /** ベクトル加算-2D */
        add2d : function (a0, b0, a1, b1) {
            return [a0+a1, b0+b1];
        },
        /** ベクトル加算-2D */
        add3d : function (a0, b0, c0, a1, b1, c1) {
            return [a0+a1, b0+b1, c0+c1];
        },
        /** ベクトル加算-2D */
        subtract2d : function (a0, b0, a1, b1) {
            return [a0-a1, b0-b1];
        },
        /** ベクトル加算-2D */
        subtract3d : function (a0, b0, c0, a1, b1, c1) {
            return [a0-a1, b0-b1, c0-c1];
        },
        /** アフィン変換-2D */
        affineTs2d : function (x, y, a, b, c, d, tx, ty) {
            return [
                a * x + b * y + tx
              , c * x + d * y + ty
            ];
        },
        /** アフィン変換-3D */
        affineTs3d : function (x, y, z, a, b, c, d, e, f, g, h, i, tx, ty, tz) {
            return [
                a * x + b * y + c * z + tx
              , d * x + e * y + f * z + ty
              , g * x + h * y + i * z + tz
            ];
        },
        /** 移動-2D */
        move2d : function (x, y, tx, ty) {
            return VectorUtility.affineTs2d(x, y, 1, 0, 0, 1, tx, ty);
        },
        /** 移動-3D */
        move3d : function (x, y, z, tx, ty, tz) {
            return VectorUtility.affineTs3d(x, y, z, 1, 0, 0, 0, 1, 0, 0, 0, 1, tx, ty, tz);
        },
        /** 拡大縮小-2D */
        scale2d : function (x, y, sx, sy, x0, y0) {
            x0 = x0||0;
            y0 = y0||0;
            return VectorUtility.affineTs2d(x-x0, y-y0,
                sx, 0,
                0, sy,
                x0, y0
            );
        },
        /** 拡大縮小-3D */
        scale3d : function (x, y, z, sx, sy, sz, x0, y0, z0) {
            x0 = x0||0;
            y0 = y0||0;
            z0 = z0||0;
            return VectorUtility.affineTs3d(x-x0, y-y0, z-z0,
                sx, 0, 0,
                0, sy, 0,
                0, 0, sz,
                x0, y0, z0
            );
        },
        /** 回転-2D */
        rotate2d : function (x, y, angle, x0, y0) {
            x0 = x0||0;
            y0 = y0||0;
            const vCos = Math.cos(angle);
            const vSin = Math.sin(angle);
            return VectorUtility.affineTs2d(x-x0, y-y0,
                vCos, -vSin,
                vSin,  vCos,
                x0, y0
            );
        },
        /** 回転-3D-X */
        rotate3dX : function (x, y, z, angle, x0, y0, z0) {
            x0 = x0||0;
            y0 = y0||0;
            z0 = z0||0;
            const vCos = Math.cos(angle);
            const vSin = Math.sin(angle);
            return VectorUtility.affineTs3d(x-x0, y-y0, z-z0,
                1, 0, 0,
                0, vCos, -vSin,
                0, vSin,  vCos,
                x0, y0, z0
            );
        },
        /** 回転-3D-Y */
        rotate3dY : function (x, y, z, angle, x0, y0, z0) {
            x0 = x0||0;
            y0 = y0||0;
            z0 = z0||0;
            const vCos = Math.cos(angle);
            const vSin = Math.sin(angle);
            return VectorUtility.affineTs3d(x-x0, y-y0, z-z0,
                vCos, 0,  vSin,
                   0, 1,     0,
               -vSin, 0,  vCos,
                x0, y0, z0
            );
        },
        /** 回転-3D-Z */
        rotate3dZ : function (x, y, z, angle, x0, y0, z0) {
            x0 = x0||0;
            y0 = y0||0;
            z0 = z0||0;
            const vCos = Math.cos(angle);
            const vSin = Math.sin(angle);
            return VectorUtility.affineTs3d(x-x0, y-y0, z-z0,
                vCos, -vSin, 0,
                vSin,  vCos, 0,
                0, 0, 1,
                x0, y0, z0
            );
        },
        /** 回転-3D-任意単位回転軸 */
        // ロドリゲスの回転公式
        rotate3dUnitAxis : function (x, y, z, nX, nY, nZ, angle, x0, y0, z0) {
            x0 = x0||0;
            y0 = y0||0;
            z0 = z0||0;

            const vCos   = Math.cos(angle);
            const v1_cos = 1 - Math.cos(angle);
            const vSin   = Math.sin(angle);

            return VectorUtility.affineTs3d(x-x0, y-y0, z-z0,
                     vCos + nX * nX * v1_cos, nX * nY * v1_cos - nZ * vSin, nX * nZ * v1_cos + nY * vSin,
                nX * nY * v1_cos + nZ * vSin,      vCos + nY * nY * v1_cos, nY * nZ * v1_cos - nX * vSin,
                nX * nZ * v1_cos - nY * vSin, nY * nZ * v1_cos + nX * vSin,      vCos + nZ * nZ * v1_cos,
                x0, y0, z0
            );
        },
        /** 回転-3D-任意回転軸 */
        rotate3dAxis : function (x, y, z, nX, nY, nZ, angle, x0, y0, z0) {
            const vN = VectorUtility.normalizeVector(nX, nY, nZ);
            return VectorUtility.rotate3dUnitAxis(x, y, z, vN[0], vN[1], vN[2], angle, x0, y0, z0);
        },
        /** 内積 */
        // A・B = |A||B|cosθ
        innerProduct2d : function (x1, y1, x2, y2) {
            return x1 * x2 + y1 * y2;
        },
        /** 内積 */
        // A・B = |A||B|cosθ
        innerProduct3d : function (x1, y1, z1, x2, y2, z2) {
            return x1 * x2 + y1 * y2 + z1 * z2;
        },
        /** 外積 */
        outerProduct : function (x1, y1, z1, x2, y2, z2) {
            return [
                y1 * z2 - z1 * y2,
                z1 * x2 - x1 * z2,
                x1 * y2 - y1 * x2,
            ];
        },
        /** ベクトル長さ */
        normVector : function (x, y, z) {
            return Math.sqrt(
                x * x + y * y + ((z)?z *z:0)
            );
        },
        /** ベクトル正規化 */
        normalizeVector : function (x, y, z) {
            // Zが存在する場合は3次ベクトルで返却
            if (z || z===0) {
                // ベクトル長さ取得
                const norm = VectorUtility.normVector(x, y, z);
                return [
                    x / norm,
                    y / norm,
                    z / norm,
                ];
            }
            // ベクトル長さ取得
            const norm = VectorUtility.normVector(x, y);
            // そうでない場合は2次ベクトルで返却
            return [
                x / norm,
                y / norm,
            ];
        },
        /** ベクトル距離-2D */
        distance1d : function (a0, a1) {
            return Math.abs(a0 - a1);
        },
        /** ベクトル距離-2D */
        distance2d : function (a0, b0, a1, b1) {
            const result = VectorUtility.subtract2d(a0, b0, a1, b1);
            return VectorUtility.normVector(result[0], result[1]);
        },
        /** ベクトル加算-2D */
        distance3d : function (a0, b0, c0, a1, b1, c1) {
            const result = VectorUtility.subtract3d(a0, b0, c0, a1, b1, c1);
            return VectorUtility.normVector(result[0], result[1], result[2]);
        },
        /** 近似ベクトルを取得する-1D */
        nealestVector1d : function (point0, vec1_0, vec2_0) {
            return VectorUtility.distance1d(vec1_0, point0)
            - VectorUtility.distance1d(vec2_0, point0);
        },
        /** 近似ベクトルを取得する-2D */
        nealestVector2d : function (point0, point1, vec1_0, vec1_1, vec2_0, vec2_1) {
            return VectorUtility.distance2d(vec1_0, vec1_1, point0, point1)
            - VectorUtility.distance2d(vec2_0, vec2_1, point0, point1);
        },
        /** 近似ベクトルを取得する-3D */
        nealestVector3d : function (point0, point1, point2, vec1_0, vec1_1, vec1_2, vec2_0, vec2_1, vec2_2) {
            return VectorUtility.distance3d(vec1_0, vec1_1, vec1_2, point0, point1, point2)
            - VectorUtility.distance3d(vec2_0, vec2_1, vec2_2, point0, point1, point2);
        },
        /** ベクトル近似ペア一覧を取得する */
        toPairVector : function (vectors1, vectors2) {

            if (vectors1.length === vectors2.length) {
                let result = [];
                vectors1.forEach(function(v, ii){
                    result.push([v,[vectors2[ii]]]);
                });
                return {
                    isFrom1st : true,
                    pair      : result,
                };
            }
            if (!vectors1.length || !vectors2.length) {
                return {
                    isFrom1st : true,
                    pair      : [],
                };
            }
            const dimension = vectors1[0].length;

            let ii = 0;
            let jj = 1;
            const isFrom1st = vectors1.length < vectors2.length;

            let from = isFrom1st ? vectors1 : vectors2;
            let to   = isFrom1st ? vectors2 : vectors1;

            let result = [
                [from[0], [to[0]]]
            ];
            for (; jj < to.length; jj++) {
                if (ii >= from.length-1) {
                    result[result.length - 1][1].push(to[jj]);
                    continue;
                }

                if (
                    (dimension === 1 && VectorUtility.nealestVector1d(to[jj][0], from[ii][0], from[ii+1][0]) < 0)
                 || (dimension === 2 && VectorUtility.nealestVector2d(to[jj][0], to[jj][1], from[ii][0], from[ii][1], from[ii+1][0], from[ii+1][1]) < 0)
                 || (dimension === 3 && VectorUtility.nealestVector3d(to[jj][0], to[jj][1], to[jj][2], from[ii][0], from[ii][1], from[ii][2], from[ii+1][0], from[ii+1][1], from[ii+1][2]) < 0)
                ) {
                    result[result.length - 1][1].push(to[jj]);
                } else {
                    ii++;
                    if (ii > from.length-1) {
                        continue;
                    }
                    result.push(
                        [from[ii], [to[jj]]]
                    );
                }
            }

            return {
                isFrom1st : isFrom1st,
                pair      : result,
            };
        },
        /**
         *  任意点を通る与えられたベクトルの傾きを持つ２直線の交点
         *  (x - a00) / v00 = (y - a01) / v01
         *  (x - a10) / v10 = (y - a11) / v11
         */
        getIntersectionPoint2dVector : function (
            v00, v01, a00, a01
          , v10, v11, a10, a11
        ) {
            if (v00 === 0
             || v01 === 0
             || v10 === 0
             || v11 === 0) {

                if ((v00 === 0 && v10 === 0)
                 || (v01 === 0 && v11 === 0)
                 || (v00 === 0 && v01 === 0)
                 || (v10 === 0 && v11 === 0)) {
                    return [NaN, NaN];
                }

                if (v00 === 0) {
                    return [a00, (a00 - a10) * v11 / v10 + a11];
                } else
                if (v01 === 0) {
                    return [(a01 - a11) * v10 / v11 + a10, a01];
                } else
                if (v10 === 0) {
                    return [a10, (a10 - a00) * v01 / v00 + a01];
                } else
                if (v11 === 0) {
                    return [(a11 - a01) * v00 / v01 + a00, a11];
                }
            }

            /*
            *  クラメルの公式（二元の場合）
            *  ad−bc≠0 のとき，連立方程式：ax+by=p，cx+dy=q の解は，
            *  x = (pd−bq) / (ad−bc), y = (aq−pc) / (ad−bc)
            */

            const a =  1 / v00;
            const b = -1 / v01;
            const p = a00 / v00 - a01 / v01;

            const c =  1 / v00;
            const d = -1 / v11;
            const q = a10 / v10 - a11 / v11;

            const ad_bc = a * d - b * c;
            // 不定解の場合
            if (ad_bc === 0) {
                return [NaN, NaN];
            }
            return [(p*d-b*q)/ad_bc, (a*q-p*c)/ad_bc];
        },
        /**
         *  2点ずつ与えられた直線の交点を求める
         */
        getIntersectionPoint2dPoint : function  (
            a00, a01, b00, b01
          , a10, a11, b10, b11
        ) {

            const v00 = Math.abs(b00 - a00);
            const v01 = Math.abs(b01 - a01);

            const v10 = Math.abs(b10 - a10);
            const v11 = Math.abs(b11 - a11);

            return VectorUtility.getIntersectionPoint2dVector(
                  v00, v01, a00, a01
                , v10, v11, a10, a11
            );
        },
        /**
         *  2点ずつ与えられた直線の交点を求める
         */
        getIntersectionPoint2dPoint : function  (
            a00, a01, b00, b01
          , a10, a11, b10, b11
        ) {

            const v00 = Math.abs(b00 - a00);
            const v01 = Math.abs(b01 - a01);

            const v10 = Math.abs(b10 - a10);
            const v11 = Math.abs(b11 - a11);

            return VectorUtility.getIntersectionPoint2dVector(
                  v00, v01, a00, a01
                , v10, v11, a10, a11
            );
        },
        /**
         *  直線と平面の交点を導出する
         *  ◇三次元空間において１点P0(x0 , y0 , z0 )を通り，法線ベクトルvecN=(a, b, c)に垂直な平面の方程式は
         *    a * (x - x0) + b * (y - y0) + c * (z - z0)=0
         *  ◇点 A(vecA) を通り，方向ベクトルが vecD であるような直線の方程式は，媒介変数 t を用いて
         *    vecP = vecA + t * vecD
         *  これらを元に交点を算出します。
         */
        getIntersectionPoint3dForSurface : function (
            // 平面方程式-点P(x, y, z)
            PX, PY, PZ,
            // 平面方程式-法線ベクトルvecN
            vecNX, vecNY, vecNZ,
            // 直線方程式-点 A
            AX, AY, AZ,
            // 直線方程式-方向ベクトルvecD
            vecDX, vecDY, vecDZ,
        ) {
            // 直線の方向ベクトルと、平面の法線ベクトルの内積を求める
            const innerProduct = (vecNX * vecDX + vecNY * vecDY + vecNZ * vecDZ);

            // 直線と平面が交わらない場合(直線と平面(法線)のベクトルの内積が0＝平行の場合)
            if (innerProduct === 0)return [NaN, NaN, NaN];

            // ◇三次元空間において１点P0(PX , PY , PZ )を通り，法線ベクトルvecN=(a, b, c)に垂直な平面の方程式は
            //   vecNX * (X - PX) + vecNY * (Y - PY) + vecNZ * (Z - PZ)=0
            // ◇点 A(vecA) を通り，方向ベクトルが vecD であるような直線の方程式は，媒介変数 t を用いて
            //   vecP = vecA + t * vecD
            // これらを元に交点を算出します。
            // 〇直線の方程式を平面の方程式に代入し、tについて求める
            // <平面の方程式>
            //   vecNX * (X - PX) + vecNY * (Y - PY) + vecNZ * (Z - PZ)=0
            //
            // <直線の方程式(定義式から求める)>
            // X = AX + t * vecDX;
            // Y = AY + t * vecDY;
            // Z = AZ + t * vecDZ;
            //
            // <導出の過程>
            // 1.平面の方程式を今使用式に変形
            //     vecNX * (X - PX)
            //   + vecNY * (Y - PY)
            //   + vecNZ * (Z - PZ)
            //   = 0
            // ↓
            // 2.平面の方程式に直線の方程式に代入
            //     vecNX * (AX + t * vecDX - PX)
            //   + vecNY * (AY + t * vecDY - PY)
            //   + vecNZ * (AZ + t * vecDZ - PZ)
            //   = 0
            // ↓
            // 3.式を展開し、tで括る
            //   (
            //      vecNX * (AX - PX)
            //    + vecNY * (AY - PY)
            //    + vecNZ * (AZ - PZ)
            //   ) + (
            //      vecNX * vecDX
            //    + vecNY * vecDY
            //    + vecNZ * vecDZ
            //   ) * t
            //   = 0
            // ↓
            // 4.tについて導出する
            const t = -(
                         vecNX * (AX - PX)
                       + vecNY * (AY - PY)
                       + vecNZ * (AZ - PZ)
                      ) / innerProduct;
            // 直線の方程式に代入し、値を求める
            return [
                  AX + t * vecDX
                , AY + t * vecDY
                , AZ + t * vecDZ
            ];
        }
    };

    /* エクスポート */
    self.VectorUtility = VectorUtility;
}

/** 超平面ユーティリティ */
{
    const ShapeUtility = function (dimension, lines) {
        this.lines     = [];
        this.dimension = dimension;

        if (!Array.isArray(lines))return;
        const self = this;
        lines.forEach((ll)=>self.addLine(ll));
    };
    ShapeUtility.prototype.clone        = function(){return new ShapeUtility(this.getDimension(), this.getLine());};
    ShapeUtility.prototype.clear        = function(){this.lines = [];};
    ShapeUtility.prototype.getDimension = function(){return this.dimension;};
    ShapeUtility.prototype.getLine      = function(){return this.lines;};
    ShapeUtility.prototype.addLine      = function(points){if(!Array.isArray(points))points=Array.from(arguments);this.lines.push(points);};
    ShapeUtility.prototype.scalar       = function(s){this.lines=this.lines.map(line=>line.map(v=>v*s));return this};
    ShapeUtility.prototype.norm         = function(){
        const d = this.getDimension();
        return this.lines.map(line=>{
            const result = [];
            for (let ii=0, ll=line.length; ii < ll; ii+=d) {
                result.push(Math.sqrt(line.slice(ii, ii+d).reduce((a,b)=>a+=b*b,0)));
            }
            return result;
        });
    };
    ShapeUtility.prototype.normalize   = function(){
        const norm = this.norm(),d = this.getDimension();
        this.lines = this.lines.map((line, ii)=>{
            return line.map((e, jj)=>e*=(1/norm[ii][Math.trunc(jj / d)]));
        });
        return this;
    };
    ShapeUtility.prototype.add          = function(shape){
        const lines = shape.getLine();
        this.lines=this.lines.map((line,ii)=>line.map((v,jj)=>v+(lines[ii]&&lines[ii][jj]||0)));
        return this;
    };
    ShapeUtility.prototype.transform    = function(matrix){
        if(!Array.isArray(matrix))matrix=Array.from(arguments);
        const dimension = this.dimension;
        const columns = parseInt(matrix.length/dimension,10);
        this.lines = this.lines.map((line)=>{
            return line.map((v,ii)=>{
                const col   = ii % dimension;
                const index = Math.trunc(ii / dimension)*dimension;
                return matrix.slice(col*columns,col*columns+columns)
                .reduce((a,b,jj)=>a+=b*(jj<dimension?line[index+jj]:1),0);
            });
        });
        return this;
    };

    /* エクスポート */
    self.ShapeUtility = ShapeUtility;
}


/** カメラクラス */
{
    /**
     * @param oX        カメラ画面-原点(X)
     * @param oY        カメラ画面-原点(Y)
     * @param oZ        カメラ画面-原点(Z)
     * @param fX        焦点(X)
     * @param fY        焦点(Y)
     * @param fZ        焦点(Z)
     * @param angle     カメラ角度(Y or Z軸を基準としたとき画面回転方向)
     */
    const Camera = function (oX, oY, oZ, fX, fY, fZ, angle) {
        const foculLength = VectorUtility.normVector(fX-oX, fY-oY, fZ-oZ);
        if (foculLength === 0) {
            throw new Error("焦点距離が0です");
            return;
        }

        // 表示面の原点(中心点)
        this.origin = [oX, oY, oZ];
        // 焦点の座標
        this.focus  = [fX, fY, fZ];
        // 焦点の距離
        this.foculLength = foculLength;

        _init(this, oX, oY, oZ, fX, fY, fZ, angle);
    }

    /** 初期処理 */
    const _init = function (camera, oX, oY, oZ, fX, fY, fZ, angle) {
        // 原点→焦点のベクトル(正規化)
        let vecNormal = VectorUtility.normalizeVector(fX-oX, fY-oY, fZ-oZ);

        // 上基準軸を取得する
        // 基準軸をY単位ベクトルとする
        let base = _getPointVector(
                oX, oY, oZ
              , fX, fY, fZ
              , vecNormal[0]
              , vecNormal[1]
              , vecNormal[2]
              , 0, 1, 0
        );
        // 基準軸と焦点ベクトルが同じ方向の場合
        if (isNaN(base[0]) || isNaN(base[1]) || isNaN(base[2])
         || VectorUtility.normVector(base[0], base[1], base[2]) === 0
         || Math.floor(
            Math.abs(
                VectorUtility.innerProduct3d(base[0], base[1], base[2], vecNormal[0], vecNormal[1], vecNormal[2])
               /VectorUtility.normVector(base[0], base[1], base[2])
           )
        ) === 1) {
            // 基準軸をZ単位ベクトルとする
            base = _getPointVector(
                    oX, oY, oZ
                  , fX, fY, fZ
                  , vecNormal[0]
                  , vecNormal[1]
                  , vecNormal[2]
                  , 0, 0, 1
            );
        }

        // 基準軸を正規化する
        base = VectorUtility.normalizeVector(base[0], base[1], base[2]);

        camera.vecNormal = vecNormal;
        camera.vecBaseY = base;
        camera.vecBaseX = null;
        camera.setAngle(angle);
    }

    // #### カメラ面と、指定ポイント→焦点の交点の算出 ####
    const _getPointVector = function (oX, oY, oZ, fX, fY, fZ, vNX, vNY, vNZ, x0, y0, z0) {
        let result = [x0, y0, z0];
        // 指定ポイントがカメラ面に存在しない場合
        if ((vNX * (x0 - oX)
           + vNY * (y0 - oY)
           + vNZ * (z0 - oZ))
          !== 0) {
            // ◇三次元空間において１点P0(x0 , y0 , z0 )を通り，法線ベクトルvecN=(a, b, c)に垂直な平面の方程式は
            //   a * (x - x0) + b * (y - y0) + c * (z - z0)=0
            // ◇点 A(vecA) を通り，方向ベクトルが vecD であるような直線の方程式は，媒介変数 t を用いて
            //   vecP = vecA + t * vecD
            // これらを元に交点を算出します。
            // 〇直線の方程式を平面の方程式に代入し、tについて求める
            // <平面の方程式>
            //   a * (x - x0) + b * (y - y0) + c * (z - z0)=0
            //
            // <直線の方程式(定義式から求める)>
            // X = x0 + t * (fX - x0);
            // Y = y0 + t * (fY - y0);
            // Z = z0 + t * (fZ - z0);
            //
            // <導出の過程>
            // 1.平面の方程式を今使用式に変形
            //     vNX * (X - oX)
            //   + vNY * (Y - oY)
            //   + vNZ * (Z - oZ)
            //   = 0
            // ↓
            // 2.平面の方程式に直線の方程式に代入
            //     vNX * (x0 + t * (fX - x0) - oX)
            //   + vNY * (y0 + t * (fY - y0) - oY)
            //   + vNZ * (z0 + t * (fZ - z0) - oZ)
            //   = 0
            // ↓
            // 3.式を展開し、tで括る
            //   (
            //      vNX * (x0 - oX)
            //    + vNY * (y0 - oY)
            //    + vNZ * (z0 - oZ)
            //   ) + (
            //      vNX * (fX - x0)
            //    + vNY * (fY - y0)
            //    + vNZ * (fZ - z0)
            //   ) * t
            //   = 0
            // ↓
            // 4.tについて導出する
            const t = -(
                         vNX * (x0 - oX)
                       + vNY * (y0 - oY)
                       + vNZ * (z0 - oZ)
                      ) / (
                         vNX * (fX - x0)
                       + vNY * (fY - y0)
                       + vNZ * (fZ - z0)
                      );
            // 直線の方程式に代入し、値を求める
            result = [
                  x0 + t * (fX - x0)
                , y0 + t * (fY - y0)
                , z0 + t * (fZ - z0)
            ];
        }
        // カメラ面の原点からの向きを保持する
        result[0] -= oX;
        result[1] -= oY;
        result[2] -= oZ;
        return result;
    }
    // #### カメラ面と、指定ポイント→垂線の交点の算出 ####
    const _getPointVerticalVector = function (oX, oY, oZ, fX, fY, fZ, vNX, vNY, vNZ, x0, y0, z0) {
        let result = [x0, y0, z0];
        // 指定ポイントがカメラ面に存在しない場合
        if ((vNX * (x0 - oX)
           + vNY * (y0 - oY)
           + vNZ * (z0 - oZ))
          !== 0) {
            // ◇三次元空間において１点P0(x0 , y0 , z0 )を通り，法線ベクトルvecN=(a, b, c)に垂直な平面の方程式は
            //   a * (x - x0) + b * (y - y0) + c * (z - z0)=0
            // ◇点 A(vecA) を通り，方向ベクトルが vecD であるような直線の方程式は，媒介変数 t を用いて
            //   vecP = vecA + t * vecD
            // これらを元に交点を算出します。
            // 〇直線の方程式を平面の方程式に代入し、tについて求める
            // <平面の方程式>
            //   a * (x - x0) + b * (y - y0) + c * (z - z0)=0
            //
            // <直線の方程式(定義式から求める)>
            // X = x0 + t * vNX;
            // Y = y0 + t * vNY;
            // Z = z0 + t * vNZ;
            //
            // <導出の過程>
            // 1.平面の方程式を今使用式に変形
            //     vNX * (X - oX)
            //   + vNY * (Y - oY)
            //   + vNZ * (Z - oZ)
            //   = 0
            // ↓
            // 2.平面の方程式に直線の方程式に代入
            //     vNX * (x0 + t * vNX - oX)
            //   + vNY * (y0 + t * vNY - oY)
            //   + vNZ * (z0 + t * vNZ - oZ)
            //   = 0
            // ↓
            // 3.式を展開し、tで括る
            //   (
            //      vNX * (x0 - oX)
            //    + vNY * (y0 - oY)
            //    + vNZ * (z0 - oZ)
            //   ) + (
            //      vNX * vNX
            //    + vNY * vNY
            //    + vNZ * vNZ
            //   ) * t
            //   = 0
            // ↓
            // 4.tについて導出する
            const t = -(
                         vNX * (x0 - oX)
                       + vNY * (y0 - oY)
                       + vNZ * (z0 - oZ)
                      );
                      // 単位ベクトルである為除算は不要
                      //  / (
                      //    vNX * vNX
                      //  + vNY * vNY
                      //  + vNZ * vNZ
                      // );
            // 直線の方程式に代入し、値を求める
            result = [
                  x0 + t * vNX
                , y0 + t * vNY
                , z0 + t * vNZ
            ];
        }
        // カメラ面の原点からの向きを保持する
        result[0] -= oX;
        result[1] -= oY;
        result[2] -= oZ;
        return result;
    }


    Camera.prototype = {
        /* 指定した座標でカメラ上に描画した際の点を取得する */
        getPutPoint : function (x0, y0, z0) {
            // #### カメラ面と指定ポイントの距離の算出 ####
            // ○三次元空間において，１点P0(x0 , y0 , z0 )と平面ax + by + cz + d=0との最短距離は
            // zDepth = Math.abs(a*x0 + b*y0 + c*z0 + d)
            //          / normVector(a, b, c)
            // 向きを保持し、カメラ面の前方(法線ベクトルの逆)を正方向としたい為、マイナスを乗じる
            const zDepth =  -(
                               this.vecNormal[0] * x0
                             + this.vecNormal[1] * y0
                             + this.vecNormal[2] * z0
                             - (
                                     this.vecNormal[0] * this.origin[0]
                                   + this.vecNormal[1] * this.origin[1]
                                   + this.vecNormal[2] * this.origin[2]
                             )
                           );
            // 単位ベクトルなため除算は不要
            //              / VectorUtility.normVector(this.vecNormal[0], this.vecNormal[1], this.vecNormal[2]);



            // #### 交差点を取得する ####
            // 焦点距離が0以外の場合は、焦点を加味した交差点を取得
            const vecPoint = (this.foculLength !== 0)
             ? _getPointVector(
                    this.origin   [0]
                  , this.origin   [1]
                  , this.origin   [2]
                  , this.focus    [0]
                  , this.focus    [1]
                  , this.focus    [2]
                  , this.vecNormal[0]
                  , this.vecNormal[1]
                  , this.vecNormal[2]
                  , x0, y0, z0
            )
            // 焦点距離が0の場合は、指定ポイントからカメラ面への垂線の座標を取得
             : _getPointVerticalVector(
                    this.origin   [0]
                  , this.origin   [1]
                  , this.origin   [2]
                  , this.focus    [0]
                  , this.focus    [1]
                  , this.focus    [2]
                  , this.vecNormal[0]
                  , this.vecNormal[1]
                  , this.vecNormal[2]
                  , x0, y0, z0
            );

            // #### 交差点を基底ベクトル(vecBaseX・vecBaseY)の一次結合に変換する ####
            // 下記連立方程式をX,Yについて解く
            // ・X * vecBaseX[0] + Y * vecBaseY[0] = vecPoint[0]
            // ・X * vecBaseX[1] + Y * vecBaseY[1] = vecPoint[1]
            // ・X * vecBaseX[2] + Y * vecBaseY[2] = vecPoint[2]

            let X = (vecPoint[0]*this.vecBaseY[1] - vecPoint[1]*this.vecBaseY[0]) / (this.vecBaseX[0]*this.vecBaseY[1] - this.vecBaseX[1]*this.vecBaseY[0]);
            let Y = (this.vecBaseX[0]*vecPoint[1] - this.vecBaseX[1]*vecPoint[0]) / (this.vecBaseX[0]*this.vecBaseY[1] - this.vecBaseX[1]*this.vecBaseY[0]);

            return [X, Y, zDepth];
        },
        /** カメラ面の法線ベクトルを取得する */
        getVectorNormal : function () {
            return this.vecNormal;
        },
        /** 原点の再設定を行う */
        setOrigin : function (oX, oY, oZ) {
            const foculLength = VectorUtility.normVector(this.focus[0]-oX, this.focus[1]-oY, this.focus[2]-oZ);
            if (foculLength === 0) {
                throw new Error("焦点距離が0です");
                return;
            }
            this.origin = [oX, oY, oZ];
            this.foculLength = foculLength;
            _init(this, this.origin[0], this.origin[1], this.origin[2], this.focus[0], this.focus[1], this.focus[2], this.angle);
        },
        /** 焦点の再設定を行う */
        setFocus : function (fX, fY, fZ) {
            const foculLength = VectorUtility.normVector(fX-this.origin[0], fY-this.origin[1], fZ-this.origin[2]);
            if (foculLength === 0) {
                throw new Error("焦点距離が0です");
                return;
            }
            this.focus = [fX, fY, fZ];
            // 焦点の距離
            this.foculLength = foculLength;
            _init(this, this.origin[0], this.origin[1], this.origin[2], this.focus[0], this.focus[1], this.focus[2], this.angle);
        },
        /** 焦点距離を設定する */
        setFoculLength (n) {
            this.foculLength = n;
            // 焦点距離が0の場合は処理を終了する
            if (this.foculLength === 0)return;
            this.focus = [
                this.vecNormal[0] * n + this.origin[0]
              , this.vecNormal[1] * n + this.origin[1]
              , this.vecNormal[2] * n + this.origin[2]
            ];
            _init(this, this.origin[0], this.origin[1], this.origin[2], this.focus[0], this.focus[1], this.focus[2], this.angle);
        },
        /** カメラの角度を設定する */
        setAngle : function (angle) {
            this.angle  = angle;
            // Y軸の角度を設定する
            this.vecBaseY = VectorUtility.rotate3dUnitAxis(
                this.vecBaseY[0], this.vecBaseY[1], this.vecBaseY[2]
              , this.vecNormal[0], this.vecNormal[1], this.vecNormal[2]
              , angle
              , this.origin[0], this.origin[1], this.origin[2]
            );
            // X軸の角度を設定する(Y軸向きを-90度回転する)
            this.vecBaseX = VectorUtility.rotate3dUnitAxis(
                this.vecBaseY[0], this.vecBaseY[1], this.vecBaseY[2]
              , this.vecNormal[0], this.vecNormal[1], this.vecNormal[2]
              , -Math.PI * 0.5
              , this.origin[0], this.origin[1], this.origin[2]
            );
        }
    };

    /* エクスポート */
    self.Camera = Camera;
}
