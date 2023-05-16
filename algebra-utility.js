/** 複素数ユーティリティクラス */
{
    const Complex = function (real, imag) {
        this.real  = real;
        this.imag  = imag;
    };
    Complex.prototype = {
        /** 実数であるかどうか */
        isReal : function () {
            return this.imag===0;
        },
        /** 値を取得する */
        value : function () {
            return [this.real, this.imag];
        },
        clone : function () {
            return new Complex(this.real, this.imag);
        },
        /** 値の大きさを取得する */
        getNorm : function () {
            return Math.sqrt(this.real*this.real+this.imag*this.imag);
        },
        /** 偏角を取得する */
        getAngle : function () {
            return this.real===0 ? (this.imag<0?-1:1)*Math.PI*0.5 : Math.atan2(this.imag,this.real);
        },
        /** 加算する */
        add : function (comp) {
            const value = comp.value();
            this.real += value[0];
            this.imag += value[1];
            return this;
        },
        /** 減算する */
        subtract : function (comp) {
            const value = comp.value();
            this.real -= value[0];
            this.imag -= value[1];
            return this;
        },
        /** 乗算する */
        multiply : function (comp) {
            // (a+bi)(c+di)
            // (a+bi)*c + (a+bi)*di
            // a*c-b*d + (a*d+b*c)i
            const value = comp.value();
            const _real = this.real;
            const _imag = this.imag;
            this.real = _real*value[0]-_imag*value[1];
            this.imag = _real*value[1]+_imag*value[0];
            return this;
        },
        /** 除算する */
        divide : function (comp) {
            let value   = comp.value();
            const norm  = comp.getNorm();
            const angle = comp.getAngle();
            value[0] = 1/norm *  Math.cos(angle);
            value[1] = 1/norm * -Math.sin(angle);
            const _real = this.real;
            const _imag = this.imag;

            this.real = _real*value[0]-_imag*value[1];
            this.imag = _real*value[1]+_imag*value[0];
            return this;
        },
        /** 冪乗する */
        power : function (x) {
            const angle = this.getAngle();
            const norm = Math.pow(this.getNorm(),x);
            this.real = norm*Math.cos(x*angle);
            this.imag = norm*Math.sin(x*angle);
            return this;
        }
    };

    /* エクスポート */
    self.Complex = Complex;
}
/** 二重数ユーティリティクラス */
{
    const Dual = function (real, imag) {
        this.real  = real;
        this.imag  = imag;
    };

    Dual.prototype = {
        /** 実数であるかどうか */
        isReal : function () {
            return this.imag===0;
        },
        /** 値を取得する */
        value : function () {
            return [this.real, this.imag];
        },
        clone : function () {
            return new Complex(this.real, this.imag);
        },
        /** 値の大きさを取得する */
        getNorm : function () {
            return Math.sqrt(this.real*this.real+this.imag*this.imag);
        },
        /** 偏角を取得する */
        getAngle : function () {
            return this.real===0 ? (this.imag<0?-1:1)*Math.PI*0.5 : Math.atan2(this.imag,this.real);
        },
        /** 加算する */
        add : function (comp) {
            const value = comp.value();
            this.real += value[0];
            this.imag += value[1];
            return this;
        },
    }
}
/** 代数方程式ユーティリティクラス */
{
    const _Utility = {
        /** 3次方程式(※)を解く
            ※：a*x^3 + b*x^2 + c*x + d = 0
            参考：https://onihusube.hatenablog.com/entry/2018/10/08/140426
         */
        solveCubicEquation : function (a,b,c,d,isComplex) {
            // aが0の場合次数を下げる
            if (a===0) {
                return _Utility.solveQuadraticEquation(b,c,d,isComplex);
            }

            /*
                a * x^3 + b * x^2 + c * x + d = 0;
                    x^3 + B * x^2 + C * x + D = 0;

                x = y - B/3;

                p = (C - B^2/3)
                q = (2/27*B^3 - 1/3*(B * C) + D)
                
                D=(q/2)^2+(p/3)^3;

                u=sqrt{3}(-q/2+sqrt(D))
                v=sqrt{3}(-q/2-sqrt(D))
                y=u+v

                o^3=1
                y=o^k*u + o^(3-k)*v
            */

            // 各係数をaで割った値を求める
            const B = b/a;
            const C = c/a;
            const D = d/a;

            const B_d3 = B/3;

            let y0=NaN;
            let y1=NaN;
            let y2=NaN;


            const p = (C - B*B/3);
            const q = (2/27*B*B*B - 1/3*(B*C) + D);
            
            const p_d3 = p / 3;
            const q_d2 = q * 0.5;

            const distinction = (q_d2*q_d2)+(p_d3*p_d3*p_d3);

            // const u=Math.cbrt(-q/2+Math.sqrt(D));
            // const v=Math.cbrt(-q/2-Math.sqrt(D));

            // 重解を含む場合(D=0)
            if (Math.abs(distinction) < 1.0E-6) {
                y0 = -2*Math.cbrt(q_d2);
                y1 = Math.cbrt(q_d2);
                y2 = y1;

                let result = [
                    y0 - B_d3
                   ,y1 - B_d3
                   ,y2 - B_d3
                ];

                if (isComplex) {
                    result[0] = new Complex(result[0],0);
                    result[1] = new Complex(result[1],0);
                    result[2] = new Complex(result[2],0);
                }

                return result;
            } else
            // １つの実数解と二つの共役な複素数解の場合(D>0)
            if (distinction > 0) {
                //√D
                const D_root = Math.sqrt(distinction);
                //u = v = ∛(-q/2 ± √D)
                const u = Math.cbrt(-q_d2 + D_root);
                const v = Math.cbrt(-q_d2 - D_root);
                
                y0 = u + v;

                if (!isComplex) {
                    return [
                        y0 - B_d3
                        , NaN
                        , NaN
                    ];
                }

                //-(u + v)/2
                const real = (-0.5)*y0;
                //√3(u - v)/2
                const imag  = Math.sqrt(3) * 0.5 * (u - v);

                return [
                      new Complex(  y0 - B_d3, 0)
                    , new Complex(real - B_d3,  imag)
                    , new Complex(real - B_d3, -imag)
                ];
            } else
            // 異なる３つの実数解の場合(D<0)
            if (distinction < 0) {
                //2√(-p/3)
                const sqrt_p_d3 = 2 * Math.sqrt(-p_d3);

                const real = -q_d2;
                const imag = Math.sqrt(-distinction);
                //θ/3
                const arg = (real===0 ? (imag<0?-1:1)*Math.PI*0.5 : Math.atan2(imag,real)) / 3;


                //2π/3
                const pi2d3 = (2 * Math.PI / 3);
                
                y0 = sqrt_p_d3*Math.cos(arg);
                y1 = sqrt_p_d3*Math.cos(arg + pi2d3);
                y2 = sqrt_p_d3*Math.cos(arg + pi2d3 + pi2d3);

                let result = [
                    y0 - B_d3
                   ,y1 - B_d3
                   ,y2 - B_d3
                ];

                if (isComplex) {
                    result[0] = new Complex(result[0],0);
                    result[1] = new Complex(result[1],0);
                    result[2] = new Complex(result[2],0);
                }

                return result;
            }

            // 判別できない場合は、不定解
            return [NaN, NaN, NaN];
        },
        /** 2次方程式(※)を解く
            ※：a*x^2 + b*x + c = 0
         */
        solveQuadraticEquation : function (a,b,c,isComplex) {
            // aが0の場合次数を下げる
            if (a===0) {
                return _Utility.solveLinearEquation(b,c,isComplex);
            }

            // 判別式
            const D = b*b-4*a*c;

            // 実数解のみを持つ場合
            if (D>=0) {
                return [
                    !isComplex?(-b+Math.sqrt(D))/(2*a):new Complex((-b+Math.sqrt(D))/(2*a), 0)
                   ,!isComplex?(-b-Math.sqrt(D))/(2*a):new Complex((-b-Math.sqrt(D))/(2*a), 0)
                ];
            }

            // 複素数解を求めない場合は、終了する
            if (!isComplex) {
                return [NaN, NaN];
            }

            // 複素数解を求める
            return [
                new Complex(-b/(2*a), Math.sqrt(-D)/(2*a))
               ,new Complex(-b/(2*a),-Math.sqrt(-D)/(2*a))
            ];
        },
        /** 1次方程式(※)を解く
            ※：a*x + b = 0
         */
        solveLinearEquation : function (a,b,isComplex) {
            // aが0の場合次数を下げる
            if (a===0) {
                return !isComplex?-b:new Complex(-b,0);
            }
            return !isComplex?-b/a:new Complex(-b/a,0);
        },
    };



    const AlgebraUtility = {
        /** 3次方程式を解く(複素数解含む) */
        solveCubicEquationToComplex : function (a,b,c,d) {
            return _Utility.solveCubicEquation(a,b,c,d,true);
        },
        /** 2次方程式を解く(複素数解含む) */
        solveQuadraticEquationToComplex : function (a,b,c) {
            return _Utility.solveQuadraticEquation(a,b,c,true);
        },
        /** 1次方程式を解く(複素数解含む)*/
        solveLinearEquationToComplex : function (a,b) {
            return _Utility.solveLinearEquation(a,b,true);
        },
        /** 3次方程式を解く(実数解のみ) */
        solveCubicEquationToReal : function (a,b,c,d) {
            return _Utility.solveCubicEquation(a,b,c,d,false);
        },
        /** 2次方程式を解く(実数解のみ) */
        solveQuadraticEquationToReal : function (a,b,c) {
            return _Utility.solveQuadraticEquation(a,b,c,false);
        },
        /** 1次方程式を解く(実数解のみ)*/
        solveLinearEquationToReal : function (a,b) {
            return _Utility.solveLinearEquation(a,b,false);
        },
    };

    /* エクスポート */
    self.AlgebraUtility = AlgebraUtility;
}
