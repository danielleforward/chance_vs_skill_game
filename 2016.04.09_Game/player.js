
// Create a new Player and initialize it.
var Player = function(r, c, playerColor) {
    this.alive = true;
    this.score = 0;
    this.color = playerColor;
    this.location = {
        'row':r,
        'column':c
    };
}

// Draw me to the canvas.
Player.prototype.draw = function() {
    var x = wallStartX + this.location.column * wallSize + wallSize/2;
    var y = wallStartY + this.location.row * wallSize + wallSize/2;
    drawCircle(x, y, wallSize/3, this.color);
}

// Move me by the given number of rows/columns (if possible)
Player.prototype.move = function(deltaRow, deltaColumn) {
    if (!this.alive)
        return;

    if (deltaRow == 0 && deltaColumn == 0)
        return;

    // Look at the location I want to move to. if it's out of bounds or
    // there's a wall, cancel the move.
    var nr = this.location.row + deltaRow;
    var nc = this.location.column + deltaColumn;
    if (nr<0 || nr>=rows || nc<0 || nc>=columns || isWall(nr, nc)) {
        return;
    }

    this.location = {
        'row': this.location.row + deltaRow,
        'column': this.location.column + deltaColumn
    };
}

//     ;_;
Player.prototype.die = function() {
    this.color = deadColor;
    this.alive = false;
}

//     ^_^
Player.prototype.win = function() {
    console.log('You win!');
    this.color = dotColor;
}

//     o_O
Player.prototype.resurrect = function() {
    this.alive = true;
    this.color = playerColor;
}

