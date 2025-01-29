// マルコフモデルによる文章生成
class MarkovChain {
    constructor() {
        this.chain = {};
    }

    // 学習関数
    learn(text, order = 2) {
        const words = text.split(/\s+/);

        for (let i = 0; i < words.length - order; i++) {
            const key = words.slice(i, i + order).join(' ');
            const nextWord = words[i + order];

            if (!this.chain[key]) {
                this.chain[key] = [];
            }

            this.chain[key].push(nextWord);
        }
    }

    // 文章生成関数
    generate(start, length = 50) {
        const result = [...start.split(' ')];
        let current = start;

        for (let i = 0; i < length; i++) {
            const nextWords = this.chain[current];

            if (!nextWords || nextWords.length === 0) {
                break;
            }

            const nextWord = nextWords[Math.floor(Math.random() * nextWords.length)];
            result.push(nextWord);

            const splitCurrent = current.split(' ');
            splitCurrent.shift();
            splitCurrent.push(nextWord);
            current = splitCurrent.join(' ');
        }

        return result.join(' ');
    }
}

window.MarkovChain = MarkovChain;