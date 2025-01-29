/** 独自の式を定義可能なクラス */
{
    const OPERAND  = "OPERAND";
    const OPERATOR = "OPERATOR";
    const FUNCTION = "FUNCTION";
    const RESULT   = "RESULT";
    const LEFT_ARENTHESIS = "LEFT_ARENTHESIS";

    // 出力結果を統合する
    const mergeOutput = (target, output, que) => {
        if (que.type === OPERAND) {
            output.push(que);
            return;
        }
        if (que.type === OPERATOR || que.type === FUNCTION) {
            const args = [];
            const argCnt = que.type === OPERATOR
                         ? target.operators[que.value].args
                         : target.functions[que.value].args;
            if (output.length < argCnt)throw new Error("引数が不足しています");

            for (let ii = 0; ii < argCnt; ii++) {
                const value = output.pop();
                if (value.type !== OPERAND)throw new Error("引数が異なります");
                args.unshift(value);
            }
            // 計算を行い集約する
            output.push({
                value: target.execute(que, args),
                type: OPERAND,
                operand_type: RESULT
            });
            return;
        }
        throw new Error("集約できないタイプです");
    };

    class AnalyzeFormula {
        constructor (
            execute=(op, args)=>{return args.map(v=>v.value).join("")},
            operands={
                NUMBER :"-?[1-9][0-9]*(?:\\.[0-9]+)?",
                STRING :"'[^']*'",
                VARIANT:"[^!\"$%&'()=\\-|{}\\[\\]/<>,.?*+;:0-9][^!\"$%&'()=\\-|{}\\[\\]/<>,.?*+;:]*(?:\\.[^!\"$%&'()=\\-|{}\\[\\]/<>,.?*+;:0-9][^!\"$%&'()=\\-|{}\\[\\]/<>,.?*+;:]*)*"
            },
            operators={
                "!" :{left:false, order:5, args:1},
                "^" :{left:false, order:4, args:2},
                "/" :{left:true , order:3, args:2},
                "*" :{left:true , order:3, args:2},
                "%" :{left:true , order:3, args:2},
                "+" :{left:true , order:2, args:2},
                "-" :{left:true , order:2, args:2},
                "&&":{left:true , order:1, args:2},
                "||":{left:true , order:1, args:2},
                "!=":{left:true , order:0, args:2},
                "<=":{left:true , order:0, args:2},
                ">=":{left:true , order:0, args:2},
                "<" :{left:true , order:0, args:2},
                ">" :{left:true , order:0, args:2},
                "==":{left:true , order:0, args:2},
            },
            functions={
                "sin" :{args:1},
                "cos" :{args:1},
                "tan" :{args:1}
            }
        ) {
            this.execute = execute;
            // オペランドを正規表現に変換
            for (const key in operands) {
                if (operands[key][0] !== "^")operands[key] = `^${operands[key]}`;
                operands[key] = new RegExp(operands[key]);
            }
            this.operands = operands;
            this.operators = operators;
            this.functions = functions;
        }
    
        // 式の評価を行う
        evaluation (formula) {
            // 式から空白を除去する
            // formula = formula.replace(/^\s+/g, "");
            // formula = formula.replace(/\s+$/g, "");
            // formula = formula.replace(/\s+/g , " ");
            formula = formula.replace(/\s+/g , "");
    
            const stack = [];
            const output = [];
    
            let rem = formula;
            while (rem.length > 0) {
                // 被演算子チェック
                let isContinue = false;
                for (const key in this.operands) {
                    const matcher = rem.match(this.operands[key]);
                    // 被演算子でない場合は次へ
                    if (!matcher)continue;
                    // 関数の場合は次へ
                    if (rem.length > matcher[0].length && rem[matcher[0].length] === "(")continue;

                    // 被演算子の場合は出力キューへ追加
                    rem = rem.slice(matcher[0].length);
                    mergeOutput(this, output, {
                        value: matcher[0],
                        type: OPERAND,
                        operand_type: key
                    });
                    isContinue = true;
                    break;
                }
                if (isContinue)continue;

                // 関数チェック
                for (const key in this.functions) {
                    // 関数でない場合次へ
                    if (!rem.startsWith(`${key}(`))continue;

                    // 関数の場合はスタックへ追加
                    rem = rem.slice(key.length);
                    stack.push({
                        value: key,
                        type: FUNCTION
                    });
                    isContinue = true;
                    break;
                }
                if (isContinue)continue;

                // 関数の区切り文字の場合
                if (rem[0] === ",") {
                    while (stack.length > 0 && stack[stack.length - 1].type !== LEFT_ARENTHESIS) {
                        mergeOutput(this, output, stack.pop());
                    }
                    if (stack.length === 0 || stack[stack.length - 1].type !== LEFT_ARENTHESIS) {
                        throw new Error("セパレータまたは括弧が不足しています");
                    }
                    rem = rem.slice(1);
                    continue;
                }
                
                // 演算子の場合
                for (const key in this.operators) {
                    if (!rem.startsWith(key))continue;
                    
                    while (
                        stack.length > 0
                        && stack[stack.length - 1].type === OPERATOR
                        && (
                                (this.operators[key].left && this.operators[key].order <= this.operators[stack[stack.length - 1].value].order)
                            || (!this.operators[key].left && this.operators[key].order <  this.operators[stack[stack.length - 1].value].order)
                        )
                    ) {
                        mergeOutput(this, output, stack.pop());
                    }
                    stack.push({
                        value: key,
                        type: OPERATOR
                    });

                    rem = rem.slice(key.length);
                    isContinue = true;
                    break;
                }
                if (isContinue)continue;

                // 左括弧の場合
                if (rem[0] === "(") {
                    stack.push({
                        value: rem[0],
                        type: LEFT_ARENTHESIS
                    });
                    rem = rem.slice(1);
                    continue;
                }
                
                // 右括弧の場合
                if (rem[0] === ")") {
                    while (stack.length > 0 && stack[stack.length - 1].type !== LEFT_ARENTHESIS) {
                        mergeOutput(this, output, stack.pop());
                    }
                    if (stack.length === 0) {
                        throw new Error("括弧の不一致");
                    }
                    stack.pop();
                    if (stack.length > 0 && stack[stack.length - 1].type === FUNCTION) {
                        mergeOutput(this, output, stack.pop());
                    }
                    rem = rem.slice(1);
                    continue;
                }

                throw new Error(`不明なトークン。${rem}`);
            }

            // stackに残っているものを出力キューに追加する
            while (stack.length > 0) {
                const sc = stack.pop();
                // 括弧がstackに残っている場合、エラー
                if (sc.type === LEFT_ARENTHESIS) {
                    throw new Error("括弧の不一致");
                }
                mergeOutput(this, output, sc);
            }
            
            if (output.length > 1)throw new Error("余分な値が存在します");

            return output[0].value;
        }
    }


   self.AnalyzeFormula = AnalyzeFormula;
}
