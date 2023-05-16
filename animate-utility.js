{
    /** デフォルトFPS */
    const defaultFps = 1000 / 60;

    /** 指定期間限りのアニメーション処理 */
    const LimitedAnimate = function (fn, options) {
        // オプションが指定されていない場合は空のオブジェクトを指定する
        if (!options) options = {};

        let duration    = options.duration || 1000;
        let easing      = options.easing || LimitedAnimate.easing.liner;
        let fps         = options.fps || LimitedAnimate.fps;

        let timerFn  = requestAnimationFrame || setTimeout;
        let cancelFn = cancelAnimationFrame || clearTimeout;

        // メイン処理
        function main (resolve, reject) {
            if(!fn)return resolve&&resolve();

            // 現在位置を保持する
            let ratio,beforeRatio;

            // 時間関係を保持する
            let timer,before,t,start;

            // 初期処理
            function init () {
                // 値を初期化する
                ratio = 0;
                beforeRatio = ratio;
                start = new Date().getTime();
                before = start;
                // ループ処理を起動する
                loop();
                // 初期処理を実行する
                fn(ratio);
            }

            // ループ処理
            function loop () {
                // 現在時間を保持する
                let now = new Date().getTime();
                // 現在の経過秒数割合
                t = (now - start) / duration;
                // 現在の経過割合
                ratio  = easing(t);
                // [終了条件]
                // 経過割合が1を超えるか、経過秒数経った場合処理を終了する
                if (ratio > 1 || t > 1) {
                    // タイマーをキャンセルする
                    cancelFn(timer);
                    // 最終描画が行われていない場合、最終処理を行う
                    if (beforeRatio < 1) {
                        fn(1);
                    }
                    // 完了関数が指定されている場合は完了処理を行う
                    if(options.complete)options.complete();
                    return resolve&&resolve();
                }
                // FPS以下の場合、または経過に変更がない場合処理を行わない
                if (
                    (now - before) < fps
                 || ratio === beforeRatio
                ) {
                    // 次のタイマーをセット
                    timer = timerFn(loop);
                    return;
                }

                // 処理を行う
                fn(ratio);
                beforeRatio = ratio;
                before = now;
                // 次のタイマーをセット
                timer = timerFn(loop);
            }
            // 初期処理を行う
            init();
        }

        // Promiseが使える環境の場合プロミスでメイン処理を実行する
        if (self.Promise) return new Promise(main);
        return main();
    }
    /** アニメーションデフォルトFPS*/
    LimitedAnimate.fps = defaultFps;

    /** アニメーションイージング指定*/
    LimitedAnimate.easing = {
        /** 線形 */
        liner : function (t) {
            return t;
        },
        /** 放物線 */
        quadratic : function (t) {
            return t * t;
        },
        /** 放物線(逆) */
        square : function (t) {
            return Math.sqrt(t);
        },
        /** 3次ベジェ曲線 */
        cubicBezier : function (x0, y0, x1, y1) {
            x0=x0<0?0:x0>1?1:x0;
            x1=x1<0?0:x1>1?1:x1;

            /* 3次方程式を解く(algebra-utility.jsから引用) */
            function _solveCubicEquationToReal (a, b, c, d) {
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

                    return [
                        y0 - B_d3
                        , NaN
                        , NaN
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

                    return result;
                }

                // 判別できない場合は、不定解
                return [NaN, NaN, NaN];
            }

            // ３次ベジェ曲線の方程式
            // x = (1-t)^3*x0 + 3*(1-t)^2*t*x1 + 3*(1-t)*t^2*x2 + t^3*x3
            // y = (1-t)^3*y0 + 3*(1-t)^2*t*y1 + 3*(1-t)*t^2*y2 + t^3*y3
            return function (x) {
                // xより、tについて３次方程式の実数解を求める
                const t = x===0?0:x===1?1:_solveCubicEquationToReal(
                      3*x0 - 3*x1 + 1
                    ,-6*x0 + 3*x1
                    , 3*x0
                    ,-x
                ).filter((v)=>{
                    // 実数解のうち、0以上1以下の値をフィルタリングする
                    if (isNaN(v))return false;
                    if (v<0 || v>1)return false;
                    return true;
                })[0];

                // 求めたtより、yの値を取得する
                const y = 3*(t -2*t*t + t*t*t)*y0
                        + 3*(1-t)*t*t*y1
                        + t*t*t;

                // yを返却する
                return y;
            };
        }
    }

    /** 永続アニメーション処理 */
    const PermanenceAnimate = function (fn, options) {
        // オプションが指定されていない場合は空のオブジェクトを指定する
        if (!options) options = {};
        let fps = options.fps || PermanenceAnimate.fps;

        let timerFn  = requestAnimationFrame || setTimeout;
        let cancelFn = cancelAnimationFrame || clearTimeout;

        // メイン処理
        function main (resolve, reject) {
            if(!fn)return resolve&&resolve();

            // 時間関係を保持する
            let timer,before,t,start,cnt;

            // 初期処理
            function init () {
                start = new Date().getTime();
                // カウンタが指定されていた場合それを保持する
                cnt = 0;
                // 経過秒数が指定されている場合
                if (options.elapsed) {
                    before = start - fps;
                    start -= options.elapsed;
                    cnt    = ~~(options.elapsed / fps);
                } else {
                    before = start;
                }

                // カンストした場合0に戻る
                if (cnt >= Number.MAX_SAFE_INTEGER) {
                    cnt = 0;
                    start = new Date().getTime();
                }

                // 初期処理を実行する
                if (fn(cnt++, 0, 0)===false) {
                    // 完了関数が指定されている場合は完了処理を行う
                    if(options.complete)options.complete();
                    return resolve&&resolve();
                }
                // ループ処理を起動する
                loop();
            }

            // ループ処理
            function loop () {
                // 現在時間を保持する
                let now = new Date().getTime();
                // FPS以下の場合、または経過に変更がない場合処理を行わない
                if ((now - before) < fps) {
                    // 次のタイマーをセット
                    timer = timerFn(loop);
                    return;
                }

                // カンストした場合0に戻る
                if (cnt >= Number.MAX_SAFE_INTEGER) {
                    cnt = 0;
                    start = new Date().getTime();
                }

                // アニメーションを実行
                const result = fn(cnt++,(now - start), (now - before));

                // [終了条件]
                // 描画処理がfalseを返却した場合
                // またはtrueだがリピートしない場合
                if (result === false || (result === true && !options.repeat)) {
                    // タイマーをキャンセルする
                    cancelFn(timer);
                    // 完了関数が指定されている場合は完了処理を行う
                    if(options.complete)options.complete();
                    return resolve&&resolve();
                } else
                // 繰り返し設定になっている場合でtrueが変更された場合、カウンタを0に戻す
                if(result === true && options.repeat) {
                    cnt = 0;
                    start = new Date().getTime();
                }

                before = now;
                // 次のタイマーをセット
                timer = timerFn(loop);
            }
            // 初期処理を行う
            init();
        }

        // Promiseが使える環境の場合プロミスでメイン処理を実行する
        if (self.Promise) return new Promise(main);
        main();
    }
    /** アニメーションデフォルトFPS*/
    PermanenceAnimate.fps = defaultFps;


    /** 統合アニメーションクラス*/
    const IntegrationAnimate = function (options) {

    }
    IntegrationAnimate.prototype = {
        start : function () {

        }
    }

    /** アニメーションデフォルトFPS*/
    IntegrationAnimate.fps = defaultFps;

    /** イージングをコピーする*/
    IntegrationAnimate.easing = LimitedAnimate.easing;

    /** パララックス*/
    function ParallaxAnimate () {
        this.relativeAnimate = [];
        this.absoluteAnimate = [];
        const target = this;
        function _scroll () {
            target.relativeAnimate.forEach((v)=>{
                let ratioX    = v.toX?((window.pageXOffset/window.innerWidth )/v.toX):0;
                let ratioY    = v.toY?((window.pageYOffset/window.innerHeight)/v.toY):0;
                let relativeX = v.toX*window.innerWidth;
                let relativeY = v.toY*window.innerHeight;
                v.fn.call(target, ratioX, ratioY, relativeX, relativeY);
            });
            target.absoluteAnimate.forEach((v)=>{
                let ratioX = v.toX?(window.pageXOffset/v.toX):0;
                let ratioY = v.toY?(window.pageYOffset/v.toY):0;
                let relativeX = v.toX;
                let relativeY = v.toY;
                v.fn.call(target, ratioX, ratioY, relativeX, relativeY);
            });
        }
        window.addEventListener("scroll", _scroll);
        _scroll();
    }
    ParallaxAnimate.prototype = {
        addRelativeAnimate : function (fromX, fromY, toX, toY, fn) {
            this.relativeAnimate.push({
                fromX : fromX,
                fromY : fromY,
                toX   : toX,
                toY   : toY,
                fn: fn
            });
            return this;
        },
        addAbsoluteAnimate : function (fromX, fromY, toX, toY, fn) {
            this.absoluteAnimate.push({
                fromX : fromX,
                fromY : fromY,
                toX   : toX,
                toY   : toY,
                fn: fn
            });
            return this;
        }
    };







    /* エクスポート */
    self.LimitedAnimate     = LimitedAnimate;
    self.PermanenceAnimate  = PermanenceAnimate;
    self.IntegrationAnimate = IntegrationAnimate;
    self.ParallaxAnimate    = ParallaxAnimate;

}
