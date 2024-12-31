/** プロセス 管理クラス*/
{
    const ProsessManagemate = function () {
        this.mapProsess = {};

        // プロセス開始時処理
        this.mapProsess[ProsessManagemate.C_START] = {
            trigger : {}
        };

        // プロセス終了後処理
        this.mapProsess[ProsessManagemate.C_END] = {
            trigger : {}
        };

        // プロセス開始/終了処理を格納する配列を設定する
        this.mapProsess[ProsessManagemate.C_START].trigger[ProsessManagemate.TimingType.END] = [];
        this.mapProsess[ProsessManagemate.C_END  ].trigger[ProsessManagemate.TimingType.END] = [];
    };
    ProsessManagemate.C_START = "_start";
    ProsessManagemate.C_END   = "_end"  ;
    ProsessManagemate.TimingType = {
        // START : 1,
        END   : 2,
    };

    ProsessManagemate.prototype = {
        /** プロセス追加*/
        register : function (id, timing, prosess) {
            // // IDが指定されていない場合はインデックスを自動採番する
            // if (typeof id === "function") {
            //     timing = prosess;
            //     prosess = id;
            //     id = Object.keys(mapProsess).length;
            // }
            // 処理を格納するマップを定義する
            this.mapProsess[id] = {
                trigger : {},
                prosess : prosess
            };
            this.mapProsess[id].trigger[ProsessManagemate.TimingType.START] = [];
            this.mapProsess[id].trigger[ProsessManagemate.TimingType.END  ] = [];

            // 処理開始終了時のタイミングが指定されている場合は、タイプを開始時固定とする
            if (timing.id === ProsessManagemate.C_START) {
                timing.type = ProsessManagemate.TimingType.END;
            }
            // タイミングが指定されていない場合、終了時を指定する
            if (!timing.type) {
                timing.type = ProsessManagemate.TimingType.END;
            }
            // 開始タイミングを追加する
            this.mapProsess[timing.id].trigger[timing.type].push([id, timing.timer]);
            return id;
        },
        /** プロセス実行*/
        run : function () {
            const mapProsess = this.mapProsess;
            // 指定スレッド処理を行う
            function pmThreed (id, type) {
                return Promise.all(
                    mapProsess[id]
                    .trigger[type]
                    .map(function(v){
                        // タイマー指定されていない場合は即時実行する
                        if(!v[1])return pmProsess(v[0]);
                        // タイマー指定されている場合はタイマー実行する
                        return new Promise(function(resolve, reject){
                            setTimeout(function(){
                                pmProsess(v[0])
                                .then(function(){
                                    resolve();
                                });
                            },v[1]);
                        });
                    })
                );
            }
            // 指定処理を行う
            function pmProsess (id) {
                return new Promise(mapProsess[id].prosess)
                .then(function(){
                    return pmThreed(id, ProsessManagemate.TimingType.END);
                });
            }
            return pmThreed(ProsessManagemate.C_START, ProsessManagemate.TimingType.END);
        }
    };

    self.ProsessManagemate = ProsessManagemate;
}
