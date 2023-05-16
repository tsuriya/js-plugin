{
    const Matrix = {};
    {
        /**
         * 平面クラス
         */
        function Suface (options) {
            this.fill   = null;
            this.stroke = "rgb(0,0,0)";
            this.points = [];
            if (typeof options == "object"){
                this.fill   = options.fill || this.fill;
                this.stroke = options.stroke || this.stroke;
                this.setPoints(options.points);
            }
        }
        Suface.prototype = {
            /** ポイント設定 */
            setPoints : function (points) {
                if(!points)return;
                this.points = points;
            },
            /** 指定ポイントを設定 */
            setPoint : function (ii, p0, p1, p2) {
                this.points[ii * 3    ] = p0;
                this.points[ii * 3 + 1] = p1;
                this.points[ii * 3 + 2] = p2;
            },
            /** 指定ポイントを取得 */
            getPoint : function (ii) {
                let index = ii*3;
                return this.points.slice(index, index+3);
            },
            getStroke : function () {
                return this.stroke;
            },
            getFill : function () {
                return this.fill;
            },
            getPointsSize : function () {
                return ~~(this.points.length / 3);
            },
            /** 指定ポイントに対して処理を実行する */
            operator : function (ii, fn) {
                let index = ii * 3;
                return fn.call(this, ii, this.points[index], this.points[index+1], this.points[index+2]);
            },
            /** 各ポイントに対して処理を実行する */
            each : function (fn) {
                for (let ii = 0, ll = this.getPointsSize();ii<ll;ii++) {
                    let index = ii * 3;
                    if (this.operator(ii, fn)===false) {
                        return false;
                    }
                }
                return true;
            }
        }

        /**
         * 面集合クラス
         */
        let _uuidCnt = 0;
        function Mesh (options) {
            this.sufaces = [];
            this.id = `id_${_uuidCnt++}`;
            if (typeof options == "object"){
                this.setName(options.name);
                this.setSurfaces(options.sufaces);
            }
        }
        Mesh.prototype = {
            /** 名前設定 */
            setName : function (name) {
                this.name = name;
            },
            /** 名前取得 */
            getName : function () {
                return this.name||this.id;
            },
            /** ID取得 */
            getId : function () {
                return this.id;
            },
            /** 平面設定 */
            setSurfaces : function (sufaces) {
                if(!sufaces)return;
                for (let ii = 0, ll = sufaces.length; ii < ll; ii++) {
                    this.addSurface(sufaces[ii]);
                }
            },
            /** 平面追加 */
            addSurface : function (suface) {
                this.sufaces.push(suface);
            },
            /** 指定ポイントに対して処理を実行する */
            operator : function (ii, jj, fn) {
                let suface = this.sufaces[ii];
                return suface.operator(jj, fn.bind(this, ii, suface));
            },
            /** 各平面に対して処理を実行する */
            each : function (fn) {
                for (let ii = 0, ll = this.sufaces.length;ii<ll;ii++) {
                    let suface = this.sufaces[ii];
                    if (suface.each(fn.bind(this, ii, suface)) === false) {
                        return false;
                    }
                }
                return true;
            }
        }


        /**
         * 描画クラス
         */
        function Stage (options) {
            this.meshes = [];
            this.canvasUtility = null;
            this.camera = null;
            this.points = [];
            if (typeof options == "object"){
                this.canvasUtility    = options.canvasUtility;
                this.camera = options.camera;
                this.setMesh(options.meshes);
            }
        }
        Stage.prototype = {
            /** 面集合設定 */
            setMesh : function (meshes) {
                if(!meshes)return;
                for (let ii = 0, ll = meshes.length; ii < ll; ii++) {
                    this.addMesh(meshes[ii]);
                }
            },
            /** 面集合追加 */
            addMesh : function (mesh) {
                this.meshes.push(mesh);
                this.points.push([]);
            },
            /** 各面集合に対して処理を実行する */
            each : function (fn) {
                for (let ii = 0, ll = this.meshes.length;ii<ll;ii++) {
                    let mesh = this.meshes[ii];
                    if (fn.call(this, mesh, ii) === false) {
                        return false;
                    }
                }
                return true;
            },
            /** 指定ポイントを描画する */
            drawLine : function (ii, jj, kk) {
                if(!this.canvasUtility)return;
                let context = this.canvasUtility.getContext();
                let target = this;
                return this.meshes[ii].operator(jj,kk,function(jj, surface, kk, _p0, _p1, _p2){
                    let pos0 = _p0;
                    let pos1 = _p1;
                    let pos2 = _p2;

                    // 指定平面で最初の描画の場合
                    if (kk === 0) {
                        context.fillStyle   = surface.getFill();
                        context.strokeStyle = surface.getStroke();
                        context.beginPath();
                        context.moveTo(pos0, pos1);
                    // それ以外の描画の場合
                    } else {
                        context.lineTo(pos0, pos1);
                        // 指定平面で最後の描画の場合
                        if (kk === surface.getPointsSize() - 1) {
                            context.closePath();
                            if(surface.getFill()  )context.fill();
                            if(surface.getStroke())context.stroke();
                        }
                    }
                });
            },
            /** 指定メッシュを描画する */
            drawMesh : function (ii) {
                if(!this.canvasUtility)return;
                let target = this;
                this.meshes[ii].each(function(jj, surface, kk, p0, p1, p2){
                    target.drawLine(ii, jj, kk);
                });
            },
            /** 描画する */
            draw : function () {
                if(!this.canvasUtility)return;
                this.canvasUtility.clear();
                this.each(function(mesh, ii){
                    this.drawMesh(ii);
                });
            },
            /** キャンバスユーティリテインスタンスを取得する */
            getCanvasUtility : function () {
                return this.canvasUtility;
            }
        }

        Matrix.Suface = Suface;
        Matrix.Mesh   = Mesh;
        Matrix.Stage  = Stage;
    }

    /* エクスポート */
    self.Matrix = Matrix;
}
