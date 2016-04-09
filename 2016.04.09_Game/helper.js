// This module contains convenience functions that bootstrap pixi.js to make it
// easier to get started with, plus some extra helpers and utilities.

var renderer, stage, graphics;
var gameTime, dt;
var mousePosition;

function fwSetup() {
    renderer = PIXI.autoDetectRenderer(1024, 700);
    renderer.backgroundColor = 0xFFFFFF;
    renderer.view.id = 'fwcanvas';

    // add the renderer to the HTML doc.
    var containerdiv = document.getElementById('gamecontainer');
    containerdiv.innerHTML = '';
    containerdiv.appendChild(renderer.view);

    // create the root container.
    stage = new PIXI.Container();

    // You can add children to the stage as normal, or you can just draw
    // everything into this global graphics buffer.
    graphics = new PIXI.Graphics();
    stage.addChild(graphics);

    mousePosition = renderer.plugins.interaction.mouse.getLocalPosition(stage);

    // Create keyboard and mouse listeners that forward events on to user-defined functions.
    document.onkeypress = function(e) {
        e = e || window.event;
        if (typeof(onKeyPress) === 'function')
            onKeyPress(e);
    };
    document.onkeydown = function(e) {
        e = e || window.event;
        if (typeof(onKeyDown) === 'function')
            onKeyDown(e);
    };
    document.onkeyup = function(e) {
        e = e || window.event;
        if (typeof(onKeyUp) === 'function')
            onKeyUp(e);
    };

    document.onmousedown = function(e) {
        e = e || window.event;
        if (e.target.id == renderer.view.id
                && typeof(onMouseDown) === 'function') {
            e.stagePosition = renderer.plugins.interaction.mouse.getLocalPosition(stage);
            onMouseDown(e);
        }
    };
    document.onmouseup = function(e) {
        e = e || window.event;
        if (e.target.id == renderer.view.id
                && typeof(onMouseDown) === 'function') {
            e.stagePosition = renderer.plugins.interaction.mouse.getLocalPosition(stage);
            onMouseUp(e);
        }
    };

    gameTime = Date.now();
    dt = 1.0/60.0;

    // call the user-defined setup function.
    if (typeof(setup) == 'function')
        setup();

    // start the countdown for the first frame update.
    requestAnimationFrame(fwUpdate);
}

function fwUpdate() {
    // start the countdown for the NEXT update.
    requestAnimationFrame(fwUpdate);

    // update our global time and figure out how long it's been since
    // the last frame (should be 1/60 of a second).
    var newTime = Date.now();
    dt = newTime - gameTime;
    gameTime = newTime;

    // update the global mouse position tracking.
    // don't let it go outside the bounds of the renderer.
    mousePosition = renderer.plugins.interaction.mouse.getLocalPosition(stage);
    mousePosition.x = Math.clamp(mousePosition.x, 0, renderer.width);
    mousePosition.y = Math.clamp(mousePosition.y, 0, renderer.height);

    // call the user-defined update function.
    if (typeof(update) == 'function')
        update();

    // finally, paint.
    renderer.render(stage);
}

// ========================================================
// convenient drawing functions

// Draw a rectangle into the global graphics buffer.
// `fillColor`, `lineWidth`, and `lineColor` are optional.
function drawRect(x, y, w, h, fillColor, lineWidth, lineColor) {
    if (typeof(fillColor) === 'undefined')
        fillColor = 0;
    if (typeof(lineWidth) === 'undefined')
        lineWidth = 0;
    if (typeof(lineColor) === 'undefined')
        lineColor = 0;
    graphics.beginFill(fillColor);
    graphics.lineStyle(lineWidth, lineColor);
    graphics.drawRect(x, y, w, h);
}

// Draw a circle into the global graphics buffer.
// `fillColor`, `lineWidth`, and `lineColor` are optional.
function drawCircle(x, y, radius, fillColor, lineWidth, lineColor) {
    if (typeof(fillColor) === 'undefined')
        fillColor = 0;
    if (typeof(lineWidth) === 'undefined')
        lineWidth = 0;
    if (typeof(lineColor) === 'undefined')
        lineColor = 0;
    graphics.beginFill(fillColor);
    graphics.lineStyle(lineWidth, lineColor);
    graphics.drawCircle(x, y, radius);
}

// Draw a polygon into the global graphics buffer.
// `x` and `y` specify the center of the polygon.
// `rotation` is in degrees.
// `fillColor`, `lineWidth`, and `lineColor` are optional.
function drawPolygon(x, y, size, sides, rotation, fillColor, lineWidth, lineColor) {
    if (typeof(fillColor) === 'undefined')
        fillColor = 0;
    if (typeof(lineWidth) === 'undefined')
        lineWidth = 0;
    if (typeof(lineColor) === 'undefined')
        lineColor = 0;

    var points = [];
    var aincr = Math.TAU / sides;
    for (var i=0,a=Math.degToRad(rotation); i<sides; i++,a+=aincr) {
        var sx = x + size * Math.cos(a);
        var sy = y + size * Math.sin(a);
        points.push(new PIXI.Point(sx, sy));
    }

    graphics.beginFill(fillColor);
    graphics.lineStyle(lineWidth, lineColor);
    graphics.drawPolygon(points);
}


// ========================================================
// useful math extensions

Math.clamp = function(t, a, b) {
    return Math.max(a, Math.min(b, t));
}

Math.map = function(t, imin, imax, omin, omax) {
    return omin + (((t-imin)/(imax-imin)) * (omax-omin));
}

Math.TAU = (Math.PI*2);

Math.radToDeg = function(r) {
    return (360.0 / Math.TAU) * r;
}

Math.degToRad = function(d) {
    return (Math.TAU / 360.0) * d;
}

