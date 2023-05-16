/** イベントユーティリティクラス */
{
    /** タッチイベントユーティリティクラス */
    const TouchUtility = function (events) {
        // イベント情報
        let eventData = {
            mousedown      : false,
            positionX      : 0,
            positionY      : 0,
            // speedX         : NaN,
            // speedY         : NaN,
            // accelerationX  : NaN,
            // accelerationY  : NaN,
        };

        // 前回イベント情報
        // let _beforeEventInfo = {
        //     sumDeltaX : 0,
        //     sumDeltaY : 0,
        //     positionX : NaN,
        //     positionY : NaN,
        //     speedX    : NaN,
        //     speedY    : NaN,
        // };

        const target = this;

        // マウス移動時
        window.addEventListener("mousemove", e => {
            // 位置情報更新
            eventData.positionX = e.pageX;
            eventData.positionY = e.pageY;

            // 保持している処理を順次実行する
            for (let ii=0,ll=target.mousemoveProcess.length;ii<ll;ii++) {
                if (target.mousemoveProcess[ii].call(e.target, e, target.eventData)===false) {
                    return false;
                }
            }
        });
        // マウス押下時
        window.addEventListener("mousedown", e => {
            eventData.mousedown = true;

            // 位置情報更新
            eventData.positionX = e.pageX;
            eventData.positionY = e.pageY;
            // _beforeEventInfo.positionX = e.pageX;
            // _beforeEventInfo.positionY = e.pageY;

            // 保持している処理を順次実行する
            for (let ii=0,ll=target.mousemoveProcess.length;ii<ll;ii++) {
                if (target.mousemoveProcess[ii].call(e.target, e, target.eventData)===false) {
                    return false;
                }
            }
        });
        // マウスアップ時
        window.addEventListener("mouseup", e => {
            eventData.mousedown = false;

            // 位置情報更新
            eventData.positionX = e.pageX;
            eventData.positionY = e.pageY;

            // 保持している処理を順次実行する
            for (let ii=0,ll=target.mousemoveProcess.length;ii<ll;ii++) {
                if (target.mousemoveProcess[ii].call(e.target, e, target.eventData)===false) {
                    return false;
                }
            }

            // 保持している処理を順次実行する
            for (let ii=0,ll=target.mouseupProcess.length;ii<ll;ii++) {
                if (target.mouseupProcess[ii].call(e.target, e, target.eventData)===false) {
                    return false;
                }
            }
        });
        // タッチ移動時
        window.addEventListener("touchmove", e => {
            // タッチの情報を含むオブジェクト
            const touchObject = e.changedTouches[0];

            // 位置情報更新
            eventData.positionX = touchObject.pageX;
            eventData.positionY = touchObject.pageY;

            // 保持している処理を順次実行する
            for (let ii=0,ll=target.mousemoveProcess.length;ii<ll;ii++) {
                if (target.mousemoveProcess[ii].call(e.target, e, target.eventData)===false) {
                    return false;
                }
            }
        });
        // タッチ開始時
        window.addEventListener("touchstart", e => {
            eventData.mousedown = true;

            // タッチの情報を含むオブジェクト
            const touchObject = e.changedTouches[0];


            // 位置情報更新
            eventData.positionX = touchObject.pageX;
            eventData.positionY = touchObject.pageY;
            // _beforeEventInfo.positionX = touchObject.pageX;
            // _beforeEventInfo.positionY = touchObject.pageY;

            // 保持している処理を順次実行する
            for (let ii=0,ll=target.mousemoveProcess.length;ii<ll;ii++) {
                if (target.mousemoveProcess[ii].call(e.target, e, target.eventData)===false) {
                    return false;
                }
            }
        });
        // タッチ終了時
        window.addEventListener("touchend", e => {
            eventData.mousedown = false;

            // タッチの情報を含むオブジェクト
            const touchObject = e.changedTouches[0];

            // 位置情報更新
            eventData.positionX = touchObject.pageX;
            eventData.positionY = touchObject.pageY;

            // 保持している処理を順次実行する
            for (let ii=0,ll=target.mousemoveProcess.length;ii<ll;ii++) {
                if (target.mousemoveProcess[ii].call(e.target, e, target.eventData)===false) {
                    return false;
                }
            }

            // 保持している処理を順次実行する
            for (let ii=0,ll=target.mouseupProcess.length;ii<ll;ii++) {
                if (target.mouseupProcess[ii].call(e.target, e, target.eventData)===false) {
                    return false;
                }
            }
        });


        this.eventData = eventData;
        this.mousemoveProcess = [];
        this.mouseupProcess   = [];
    }

    TouchUtility.prototype = {
        /** イベントを追加する */
        addMouseDownEvent : function (selector, fn) {
            const target = this;

            document.querySelectorAll(selector)
            .forEach((element)=>{
                element.addEventListener("mousedown", (e)=>{
                    target.eventData.mousedown = true;

                    // 位置情報更新
                    target.eventData.positionX = e.pageX;
                    target.eventData.positionY = e.pageY;

                    target.eventData = fn.call(e.target, e, target.eventData);
                    // 保持している処理を順次実行する
                    for (let ii=0,ll=target.mousemoveProcess.length;ii<ll;ii++) {
                        if (target.mousemoveProcess[ii].call(e.target, e, target.eventData)===false) {
                            return false;
                        }
                    }
                });
            });
            return this;
        },
        /** 処理を追加する */
        addMouseMoveEvent : function (fn) {
            this.mousemoveProcess.push(fn);
            return this;
        },
        /** 処理を追加する */
        addMouseUpEvent : function (fn) {
            this.mouseupProcess.push(fn);
            return this;
        }
    };

    self.TouchUtility = TouchUtility;
}
