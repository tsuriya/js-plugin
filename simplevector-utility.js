/** ベクトルユーティリティクラス */
{
    const SimpleVectorUtility = {
        clone : function (points) {
            return Array.from(points).slice();
        },
        add : function (vec1, vec2) {
            vec1.forEach((v,ii)=>{
                vec1[ii] += vec2[ii];
            });
            return vec1;
        },
        subtract : function (vec1, vec2) {
            vec1.forEach((v,ii)=>{
                vec1[ii] -= vec2[ii];
            });
            return vec1;
        },
        scaler : function (vec, scale) {
            vec.forEach((v,ii)=>{
                vec[ii] *= scale;
            });
            return vec;
        },
        innerProduct : function (vec1, vec2) {
            let sum = 0;
            vec1.forEach((v,ii)=>{
                sum += v * vec2[ii];
            });
            return sum;
        },
        square : function (vec) {
            return SimpleVectorUtility.innerProduct(vec, vec);
        },
        norm : function (vec) {
            return Math.sqrt(SimpleVectorUtility.square(vec));
        },
        cos : function (vec1, vec2) {
            return SimpleVectorUtility.innerProduct(vec1, vec2)
             / (
                SimpleVectorUtility.norm(vec1)
               *SimpleVectorUtility.norm(vec2)
             );
        },
        forEach : function (dimension, points, fn) {
            for (let ii = 0, ll = points.length; ii < ll; ii+=dimension) {
                const index = Math.trunc(ii / dimension);
                fn(points.slice(ii, ii+dimension), index);
            }
        },
        map : function (dimension, points, fn) {
            const result = [];
            for (let ii = 0, ll = points.length; ii < ll; ii+=dimension) {
                const index = Math.trunc(ii / dimension);
                const ret = fn(points.slice(ii, ii+dimension), index);
                if (Array.isArray(ret)) {
                    Array.prototype.push.apply(result, ret);
                } else {
                    result.push(ret);
                }
            }
            return result;
        },
        translate : function (dimension, points, movement) {
            points.forEach((v,ii)=>{
                points[ii] += movement[ii % dimension];
            });
            return points;
        },
        transform : function (dimension, points, matrix) {
            let toTransformPoints = SimpleVectorUtility.clone(points);
            points.forEach((pp, ii)=>{
                const index = Math.trunc(ii / dimension) * dimension;
                const row   = ii % dimension * dimension;
                points[ii] = 0;
                for (let jj=0;jj<dimension;jj++) {
                    points[ii] += toTransformPoints[index+jj] * matrix[row+jj];
                }
            });
            toTransformPoints = null;
            return points;
        },
        genScaleMatrix : function (dimension, scale) {
            const result = [];
            for (let xx = 0; xx < dimension; xx++) {
                for (let yy = 0; yy < dimension; yy++) {
                    if (xx===yy) {
                        result.push(scale);
                    } else {
                        result.push(0);
                    }
                }
            }
            return result;
        },
        genRotateMatrix : function (dimension, axis1, axis2, angle) {
            const result = [];
            const cos    = Math.cos(angle);
            const sin    = Math.sin(angle);
            for (let xx = 0; xx < dimension; xx++) {
                for (let yy = 0; yy < dimension; yy++) {
                    if (axis1 === axis2) {
                        if (xx===yy) {
                            result.push(1);
                        } else {
                            result.push(0);
                        }
                        continue;
                    }

                    if (xx === axis1 && yy === axis1) {
                        result.push(cos);
                    } else
                    if (xx === axis1 && yy === axis2) {
                        result.push(sin);
                    } else
                    if (xx === axis2 && yy === axis1) {
                        result.push(-sin);
                    } else
                    if (xx === axis2 && yy === axis2) {
                        result.push(cos);
                    } else
                    if (xx===yy) {
                        result.push(1);
                    } else {
                        result.push(0);
                    }
                }
            }
            return result;
        },
        toLowerDimension : function (from, to, points) {
            for (let ii = 0, ll = Math.trunc(points.length / from); ii < ll; ii++) {
                points.splice((ii + 1) * to, from - to);
            }
            return points;
        },
        toLower2D : function (dimension, points) {
            return SimpleVectorUtility.toLowerDimension(dimension, 2, points);
        },
        drawLine : function (ctx, points) {
            if(points.length < 4)return;
            ctx.beginPath();
            ctx.moveTo(points[0], points[1]);
            for (let ii = 2, ll = points.length; ii < ll; ii+=2) {
                ctx.lineTo(points[ii], points[ii+1]);
            }
            ctx.stroke();
        }
    };

    /* エクスポート */
    self.SimpleVectorUtility = SimpleVectorUtility;
}


