{
    const tableFilter = (data, headers = []) => {
        if (!headers || headers.length === 0)return data;
        const result = [];
        let start = false;

        for (let ii = 0; ii < data.length; ii++) {
            row = data[ii];
            
            // 対象外の行はスキップ
            if (!row || row.length !== headers.length) {
                if(start)break;
                continue;
            }
            
            // ヘッダーが一致する場合はデータの記録を開始する
            if (row.filter((cell,jj)=>cell===headers[jj]).length === headers.length) {
                start = true;
                continue;
            }
            // 記録が開始されていない場合は処理を終了する
            if (!start) {
                continue;
            }
            result.push(row.concat());
        }

        return result;
    };
    class Table {
        constructor () {
            this.data = [];
        }

        /** 文字列をテーブル形式へパースする */
        parse (str, delimiter = ",") {
            if (!str)return;
            // CHAR := [^,"\n]
            // CELL := CHAR*|"([CHAR,\n]|"")*"
            
            // BNFを元にセルの正規表現を指定
            const regCell = new RegExp(`^(?:"([^"]*)"|([^${delimiter}"\n]*))`);
    
            // 文字列中から不要な改行文字を削除
            str = str.replace(/\r\n/g, "\n");
            str = str.replace(/\n\n+/g, "\n\n");
            str = str.replace(/^\n+/, "");
            str = str.replace(/\n+$/, "");
            
            // 表データから順次データを取得する
            let rem = str;
            let cellValue = "";
            let row = [];
            while (rem.length > 0) {
                // セル評価文字が存在するかチェック
                const matcher = rem.match(regCell);

                // 存在しない場合はループを抜ける
                if (!matcher) {
                    break;
                }

                // ダブルクオーテーションで囲まれた値、もしくは囲まれていない値をセル文字に追加
                cellValue += matcher[1]||matcher[2]||"";

                // 取得したセル文字を残りの文字列から除く
                rem = rem.slice(matcher[0].length);

                // マッチケースのどの文字で終わっているか確認する
                switch (rem[0]) {
                    // 区切り文字の場合、セル文字を行に追加し、次のセルの評価を行う
                    case delimiter:
                        row.push(cellValue);
                        rem = rem.slice(1);
                        cellValue = "";
                    break;
                    // 改行文字の場合、行をテーブルに追加し、次の行の評価を行う
                    case "\n":
                        row.push(cellValue);
                        // 空行でない場合は行をテーブルへ追加
                        if (row.length > 1 || row[0]){
                            this.data.push(row);
                        } else
                        // 空行の行はnullと記録する
                        if (row.length === 1 && !row[0]) {
                            this.data.push(null);
                        }
                        rem = rem.slice(1);
                        cellValue = "";
                        row = [];
                    break;
                    // ダブルクオーテーションが先頭の場合は、
                    // エスケープされている為、ダブルクオーテーションをセル文字に追加する
                    case "\"":
                        if (matcher[1] || matcher[1] === "") {
                            cellValue+="\"";
                        } else {
                            throw new Error("テーブルデータにエスケープされていないダブルクオーテーションが存在します");
                        }
                    break;
                    default:
                        // 空白文字でない場合エラー
                        if (rem !== "") {
                            throw new Error("不正なテーブルデータです");
                        }
                    break;
                }
            }
            row.push(cellValue);
            // 空行でない場合は行をテーブルへ追加
            if (row.length > 1 || row[0]){
                this.data.push(row);
            } else
            // 空行の行はnullと記録する
            if (row.length === 1 && !row[0]) {
                this.data.push(null);
            }
        }

        /** 同一ヘッダーのデータをフィルタリングする */
        filter (headers = []) {
            this.data = tableFilter(this.data, headers);
        }

        /** テーブルデータをオブジェクト形式へ変換する */
        toObject (headers = []) {
            // フィルターした結果を取得する
            return tableFilter(this.data, headers).map(row=>{
                const obj = {};
                headers.forEach((key,ii)=>{
                    const keys = key.split(".");
                    const nest = (iObj, keys) => {
                        if (keys.length === 1) {
                            iObj[keys[0]] = row[ii];
                            return;
                        }
                        if (keys[0] in iObj === false) {
                            iObj[keys[0]] = {};
                        }
                        nest(iObj[keys[0]], keys.slice(1));
                    }
                    nest(obj, keys);
                });
                return obj;
            });
        }
    }

    /** Tableを扱うユーティリティクラス */
    const TableUtility = {
        // パスからテーブルデータを読み込む
        loadPath: async (path) => {
            const result = await (await fetch(path)).text();
            const parser = new Table();
            parser.parse(result);
            return parser;
        },
        // 文字列からテーブルデータを読み込む
        loadData: (data) => {
            const parser = new Table();
            parser.parse(data);
            return parser;
        }
    };

    window.TableUtility = TableUtility;
}
