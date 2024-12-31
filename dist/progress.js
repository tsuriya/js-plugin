/** 経過を管理するクラス */
{
    const Progress = function (progress, complete) {
        this.ratio = 0;
        this.total = 0;
        this.cnt   = 0;
        this.map   = {};
        this.progress = progress?[progress]:[];
        this.complete = complete?[complete]:[];
    }

    Progress.prototype = {
        /** 進捗追加 */
        add : function (size) {
            this.total += size;
        },
        /** 進捗更新時 */
        step : function (size, data) {
            this.cnt += size;
            const target = this;
            if(this.progress[0]) {
                this.progress.forEach(function(v){v(target.cnt/target.total, size, data)});
            }
            if (this.cnt >= this.total) {
                if(this.complete[0])this.complete.forEach(function(v){v()});
            }
        },
        /** 経過を追加する */
        addProcess : function (id, size) {
            this.map[id] = size;
            this.add(this.map[id]);
        },
        /** 処理を完了する */
        stepProcess : function (id, data) {
            this.cnt += this.map[id];
            const target = this;
            if(this.progress[0]){
                this.progress.forEach(function(v){v(target.cnt/target.total, target.map[id], data, id)});
            }
            if (this.cnt >= this.total) {
                if(this.complete[0])this.complete.forEach(function(v){v()});
            }
        },
        /** 経過処理をセットする */
        setProgress : function (fn) {
            this.progress = [fn];
        },
        /** 完了処理をセットする */
        setComplete : function (fn) {
            this.complete = [fn];
        },
        /** 経過処理を追加する */
        addProgress : function (fn) {
            this.progress.push(fn);
        },
        /** 完了処理を追加する */
        addComplete : function (fn) {
            this.complete.push(fn);
        }
    }

    /* エクスポート */
    self.Progress = Progress;
}
