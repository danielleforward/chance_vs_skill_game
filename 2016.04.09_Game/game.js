//
// This program draws a maze that the player can navigate with the arrow keys.
// The maze is full of dots that the player can eat points.
// The player is also being chased by monsters!
// 

//
// The maze is represented by a string that is formatted into a grid.
// Each cell in the grid represents either:
// - the start point/first player ('A');
// - the second player ('B');
// - a wall ('#').
// - a monster ('Z');
// - a walkable empty space (' ').
//
//         --------------------------------------
var maze = '                                   '
         + ' # ## ##Z## #  #   # ## ##Z## ## # '
         + '   #   ###   #       #   ###   #   '
         + ' # Z #     #   #   #   #     #   # '
         + ' ## ## # # ## ##   ## ## # # ## ## '
         + '  #     B     #Z   Z#     A     #Z '
         + ' ## ## # # ## ##   ## ## # # ## ## '
         + ' #   #     #   #   #   #     #   # '
         + '   #   # #   #       #   ##C   #   '
         + ' ###############   ############### '
         + '                                   ';
//         --------------------------------------

var columns = 35;
var rows = 11;

var pathColor = 0x95CFB7;
var wallColor = 0xFF823A;
var dotColor = 0xF2F26F;
var monsterColor = 0xFFFFFF;
var playerColor = 0xbf7f19;
var player2Color = 0xAB672F;
var deadColor = 0x000000;
var bookColor = 0x444444;

// shorter delays mean faster monsters.
var monsterMoveDelayMin = 500;
var monsterMoveDelayMax = 1000;

// ============================================================================

var startLocation;
var wallStartX, wallStartY, wallSize;
var dotSize;
var dots = [];
var player;
var player2;
var monsters = [];
var maxScore;

function setup() {
    renderer.backgroundColor = wallColor;
    buildMaze();
    player = new Player(startLocation.row, startLocation.column, playerColor);
    player2 = new Player(startLocation2.row, startLocation2.column, player2Color);
    
    book = new Player(bookLocation.row, bookLocation.column, bookColor);
}

function update() {
    graphics.clear();
    drawPath();
    drawDots();
    drawPlayer();
    drawMonsters();
    checkCollisions();
    checkCollisions2();
    updateMonster();
}

function onKeyDown(event) {
	//Player 1
    deltaRow = 0;
    deltaColumn = 0;
    //Player 2
    deltaRow2 = 0;
    deltaColumn2 = 0;
    switch (event.keyCode) {
        case 37: // Left Arrow
            deltaColumn = -1;
            break;
        case 38: // Up Arrow
            deltaRow = -1;
            break;
        case 39: // Right Arrow
            deltaColumn = +1;
            break;
        case 40: // Down Arrow
            deltaRow = +1;
            break;
        case 65: // Left Arrow
            deltaColumn2 = -1;
            break;
        case 87: // Up Arrow
            deltaRow2 = -1;
            break;
        case 68: // Right Arrow
            deltaColumn2 = +1;
            break;
        case 83: // Down Arrow
            deltaRow2 = +1;
            break;
        /*case 76: // L for 'Live Again'
            if (!player.alive)
                player.resurrect();
            break;*/
    }
    console.log('player 1: ' + deltaRow + ' ' + deltaColumn);
    console.log('player 2: ' + deltaRow2 + ' ' + deltaColumn2);

    if (deltaRow != 0 || deltaColumn != 0)
        player.move(deltaRow, deltaColumn);
        
    if (deltaRow2 != 0 || deltaColumn2 != 0)
        player2.move(deltaRow2, deltaColumn2);
}

function buildMaze() {
    // Calculate the best-fit size of a wall block based on the canvas size
    // and number of columns or rows in the grid.
    wallSize = Math.min(renderer.width/(columns+2), renderer.height/(rows+2));

    // Calculate the starting position when drawing the maze.
    wallStartX = (renderer.width - (wallSize*columns)) / 2;
    wallStartY = (renderer.height - (wallSize*rows)) / 2;

    // The size of a dot is some fraction of the size of a maze spot.
    dotSize = wallSize / 8;

    maxScore = 0;
    var monsterSides = 3;

    // Find the player and monster locations, and initialize the dot map.
    for (var r=0; r<rows; r++) {
        for (var c=0; c<columns; c++) {
            var i = (r * columns) + c;
            var ch = maze[i];
            if (ch == 'A') {
                startLocation = {'row':r, 'column':c};
            } else if (ch == 'Z') {
                monsters.push(new Monster(monsterSides, r, c));
                monsterSides += 1;
            } else if (ch == 'B') {
                startLocation2 = {'row':r, 'column':c}; // Player 2 start location
			} else if (ch == 'C') {
                bookLocation = {'row':r, 'column':c}; // book start location
			}
            if (!isWall(r, c) && ch != 'Z' && ch != 'A' && ch != 'B') {
                // each clear space in the maze should have a dot in it.
                dots[i] = '.';
                maxScore += 1;
            } else {
                dots[i] = ' ';
            }
        }
    }
}

function isWall(r, c) {
    var i = (r * columns) + c;
    var ch = maze[i];
    return ((ch != ' ') && (ch != 'A') && (ch != 'Z') && (ch != 'B') && (ch != 'C'));
}

function canMoveTo(r, c) {
    // is this spot outside the maze?
    if (r < 0 || c < 0 || r >= rows || c >= columns)
        return false;
    // is there a wall in this spot?
    if (isWall(r, c))
        return false;
    return true;
}

// ============================================================================

function drawPath() {
    for (var r=0; r<rows; r++) {
        for (var c=0; c<columns; c++) {
            var i = (r * columns) + c;
            var ch = maze[i];
            // The start and monster locations are also on the path,
            // so check for them too.
            if (ch==' ' || ch=='A' || ch=='Z' || ch=='C' || ch=='B') {
                var x = wallStartX + c * wallSize;
                var y = wallStartY + r * wallSize;
                drawRect(x, y, wallSize, wallSize, pathColor);
            }
        }
    }
}

function drawDots() {
    for (var r=0; r<rows; r++) {
        for (var c=0; c<columns; c++) {
            var i = (r * columns) + c;
            var ch = dots[i];
            if (ch == '.') {
                var x = wallStartX + c * wallSize + wallSize/2;
                var y = wallStartY + r * wallSize + wallSize/2;
                drawCircle(x, y, dotSize, dotColor);
            }
        }
    }
}

function drawPlayer() {
    player.draw();
    player2.draw();
    book.draw();
}

function drawMonsters() {
    for (var i in monsters) {
        var monster = monsters[i];
        monster.draw();
    }
}

// ============================================================================

function checkCollisions() {
    // check to see if the player 1 is on top of an edible dot.
    i = player.location.row * columns + player.location.column;
    if (dots[i] == '.') {
        player.score += 1;
        dots[i] = ' ';

        // update the score display, which is in HTML outside of our canvas.
        var scorediv = document.getElementById('score');
        scorediv.innerHTML = player.score;

        // Did we win yet?
        if (player.score == maxScore) {
            player.win();
            scorediv.innerHTML = player.score + " - YOU WIN!";
        }
    }

    // check to see if the player is on top of any monsters.
    for (var i in monsters) {
        var monster = monsters[i];
        if (player.location.row == monster.location.row && player.location.column == monster.location.column) {
            player.die();
        }
    }
}

// ============================================================================

function checkCollisions2() {
    // check to see if the player 2 is on top of an edible dot.
    i = player2.location.row * columns + player2.location.column;
    if (dots[i] == '.') {
        player2.score2 += 1;
        console.log(score2);
        dots[i] = ' ';

        // update the score display, which is in HTML outside of our canvas.
        var scorediv2 = document.getElementById('score2');
        scorediv2.innerHTML = player2.score2;

        // Did we win yet?
        if (player.score == maxScore) {
            player.win();
            scorediv.innerHTML = player.score + " - YOU WIN!";
        }
    }

    // check to see if the player is on top of any monsters.
    for (var i in monsters) {
        var monster = monsters[i];
        if (player2.location.row == monster.location.row && player2.location.column == monster.location.column) {
            player2.die();
        }
    }
}

// ============================================================================

function updateMonster() {
    for (var i in monsters) {
        var monster = monsters[i];
        monster.update(player);
    }
}

