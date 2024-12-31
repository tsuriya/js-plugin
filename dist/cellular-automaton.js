function LinerCellularAutomaton (width, rule, isTorus) {
    this.width      = width   || 200;
    this.rule       = rule    || 110;
    this.isTorus    = isTorus || true;
    
    this.currentGeneration = 0;
    this.currentLive = 0;
    
    this.cells = new Uint8ClampedArray(this.width);
}

LinerCellularAutomaton.prototype = {
    birth : function (x) {
    },
    die : function (x) {
    },
    get : function () {
        return {
            generation : this.currentGeneration,
            live       : this.currentLive,
            data       : this.cells,
            width      : this.width,
        };
    },
    next : function () {
        let nextCells = new Uint8ClampedArray(this.width);
        let live = 0;

        this.cells = nextCells;
        this.currentGeneration++;
        this.currentLive = live;
        return this.get();
    } 
}
