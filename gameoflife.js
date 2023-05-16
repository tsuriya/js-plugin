function GameOfLife (width, height, liveCount, birthCount, isTorus) {
    this.width      = width      || 200;
    this.height     = height     || 200;
    this.liveCount  = liveCount  || [2,3];
    this.birthCount = birthCount || [3];
    this.isTorus    = isTorus    || true;
    
    this.currentGeneration = 0;
    this.currentLive = 0;
    
    this.cells = new Uint8ClampedArray(this.width * this.height);
}

function _getCells (cells, x, y, width, height, isTorus) {
    if (isTorus) {
        x = x % width;
        y = y % height;
        if(x<0)x+=width;
        if(y<0)y+=height;
    }
    if (x<0 || y<0 || x>=width || y>=height)return 0x00;
    return cells[y*width + x];
}
GameOfLife.prototype = {
    birth : function (x, y) {
        if (this.isTorus) {
            x = x % this.width;
            y = y % this.height;
            if(x<0)x+=this.width;
            if(y<0)y+=this.height;
        }
        if (x<0 || y<0 || x>=this.width || y>=this.height)return;
        this.cells[y*this.width + x] = 0x01;
        this.currentLive++;
    },
    die : function (x, y) {
        if (this.isTorus) {
            x = x % this.width;
            y = y % this.height;
            if(x<0)x+=this.width;
            if(y<0)y+=this.height;
        }
        if (x>=this.width || y>=this.height)return;
        this.cells[y*this.width + x] = 0x00;
        this.currentLive--;
    },
    get : function () {
        return {
            generation : this.currentGeneration,
            live       : this.currentLive,
            data       : this.cells,
            width      : this.width,
            height     : this.height
        };
    },
    next : function () {
        let nextCells = new Uint8ClampedArray(this.width * this.height);
        let live = 0;
        for (let ii = 0,ll=this.cells.length; ii < ll; ii++) {
            const x = ii % this.width;
            const y = ~~(ii / this.width);
            const currentCell = _getCells(this.cells, x, y, this.width, this.height, this.isTorus);
            
            const around = 
                  _getCells(this.cells, x-1, y-1, this.width, this.height, this.isTorus)
                + _getCells(this.cells, x  , y-1, this.width, this.height, this.isTorus)
                + _getCells(this.cells, x+1, y-1, this.width, this.height, this.isTorus)
                + _getCells(this.cells, x-1, y  , this.width, this.height, this.isTorus)
                + _getCells(this.cells, x+1, y  , this.width, this.height, this.isTorus)
                + _getCells(this.cells, x-1, y+1, this.width, this.height, this.isTorus)
                + _getCells(this.cells, x  , y+1, this.width, this.height, this.isTorus)
                + _getCells(this.cells, x+1, y+1, this.width, this.height, this.isTorus);
            if (currentCell === 0 && this.birthCount.indexOf(around) > -1
             || currentCell === 1 && this.liveCount.indexOf(around) > -1) {
                nextCells[y*this.width + x] = 0x01;
                live++;
            }
        }
        this.cells = nextCells;
        this.currentGeneration++;
        this.currentLive = live;
        return this.get();
    }
}

