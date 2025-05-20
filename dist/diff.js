function wuDiff(seq1, seq2) {
    const m = seq1.length;
    const n = seq2.length;
    const offset = m + 1;
    const maxD = m + n;
    const v = new Array(2 * maxD + 1).fill(0);
    const changes = [];
    
    // 距離dを順に増やしながら探索
    for (let d = 0; d <= maxD; d++) {
        for (let k = -d; k <= d; k += 2) {
            let x;
            let prevK;
            
            // 移動方向の決定
            if (k === -d || (k !== d && v[offset + k - 1] < v[offset + k + 1])) {
                x = v[offset + k + 1]; // 右から来た場合
                prevK = k + 1;
            } else {
                x = v[offset + k - 1] + 1; // 下から来た場合
                prevK = k - 1;
            }
            
            let y = x - k;
            
            // 可能な限り対角線方向に進む（マッチする部分を延長）
            while (x < m && y < n && seq1[x] === seq2[y]) {
                x++;
                y++;
            }
            
            // 現在の位置を記録
            v[offset + k] = x;
            changes.push({ x, y, k, prevK, d });
            
            // 文字列の終端に到達した場合、結果を返す
            if (x >= m && y >= n) {
                return { distance: d, changes };
            }
        }
    }
    
    return { distance: -1, changes };
}

// 使用例
const str1 = "kitten";
const str2 = "sitting";
console.log("結果:", wuDiff(str1, str2)); // 計算結果を表示
