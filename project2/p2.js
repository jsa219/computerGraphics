// Variables
{
    var gl; // initialize gl, a variable which contains info on what thiings are displayed
    var halfBoundrySize = 5;
    var triangleVertexPositionBuffer = [];
    var triangleVertexColorBuffer;
    var linePositionBuffer;
    var lineColorBuffer;
    var triFanPosBuffer;
    var triFanColBuffer;
    var posXElement;
    var posYElement;
    var posZElement;
    var posXNode;
    var posYNode;
    var posZNode;
    var rotXElement;
    var rotYElement;
    var rotZElement;
    var rotXNode;
    var rotYNode;
    var rotZNode;
    var xPos = 0;
    var yPos = 0;
    var zPos = -15;
    var xRot = 0;
    var yRot = 0;
    var zRot = 0;
    var mvMatrix = mat4.create();
    var pMatrix = mat4.create();
    var previousTime = 0;

    // initialize mouse variables
    var mouseDown = false;
    var lastMouseX = null;
    var lastMouseY = null;
    var mouseRotMatrix = mat4.create();
    mat4.identity(mouseRotMatrix);
}

//<!-- initGL() -->
var canvas;

function initGL(canvas) {
    // try to initialize gl with viewport dimentions
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialize GL");
    }
}

//<!-- getShader() -->
function getShader(gl, id) {

    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    // get script of shader
    var k = shaderScript.firstChild;
    var str = "";

    // while firstChild exists
    while (k) {
        // if firstChild is a TEXT type document
        if (k.nodeType == 3) {
            // Append the text to str
            str += k.textContent;
        }

        // iterate to next k
        k = k.nextSibling;
    }

    // initialize shader
    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);

    }
    else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    }
    else {
        return null;
    }

    // provide shader code to openGL and compile it
    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    // handle failure to compile by reporting error and returning nothing
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }
    return shader;
}

//<!-- initShaders() -->
function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    // create the program and attach the link
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // check for link errors
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialize shaders.");
    }

    // attach shaderProgram to openGL context
    gl.useProgram(shaderProgram);

    // attach vertex position
    shaderProgram.vertexPositionAttribute =
        gl.getAttribLocation(shaderProgram, "aVertexPosition");

    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    // COLORING
    // associated vertexColorAttribute with internal shader variable aVertexColor
    shaderProgram.vertexColorAttribute =
        gl.getAttribLocation(shaderProgram, "aVertexColor");

    // identifies this as a second vertex attribute arry for use when drawing
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

    // send uniform data to the shaders
    shaderProgram.pMatrixUniform =
        gl.getUniformLocation(shaderProgram, "uPMatrix");

    shaderProgram.mvMatrixUniform =
        gl.getUniformLocation(shaderProgram, "uMVMatrix");
}

//<!-- initBuffers() -->
function initBuffers() {

    /////////// TRIANGLE COLOR ///////////
    // Same color for all triangles
    triangleVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
    var colors_triangle = [
        1.0, 1.0, 1.0, 1,
        0.0, 1.0, 0.0, 1,
        1.0, 0.0, 1.0, .3
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors_triangle), gl.STATIC_DRAW);
    triangleVertexColorBuffer.itemSize = 4;
    triangleVertexColorBuffer.numItems = 3;

    // get triangle vertex positions for 5 triangles
    var i;
    for (i = 0; i < 5; i++) {
        triangleVertexPositionBuffer[i] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer[i]);
        var triangleVertices = [
            1.0, 1.5, 0.0,
            2.0, 1.5, 4.0,
            2.5, 0.5, 1.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(triangleVertices), gl.STATIC_DRAW);
        triangleVertexPositionBuffer[i].itemSize = 3;
        triangleVertexPositionBuffer[i].numItems = 3;

    }

    /////////// LINE POSITION CODE ///////////
    linePositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, linePositionBuffer);
    var vertices_line = [
        // square in x = 2 plane
        halfBoundrySize, -halfBoundrySize, -halfBoundrySize, halfBoundrySize, halfBoundrySize, -halfBoundrySize,
        halfBoundrySize, -halfBoundrySize, -halfBoundrySize, halfBoundrySize, -halfBoundrySize, halfBoundrySize,
        halfBoundrySize, halfBoundrySize, -halfBoundrySize, halfBoundrySize, halfBoundrySize, halfBoundrySize,
        halfBoundrySize, -halfBoundrySize, halfBoundrySize, halfBoundrySize, halfBoundrySize, halfBoundrySize,
        // square in x = 0 plane
        -halfBoundrySize, -halfBoundrySize, -halfBoundrySize, -halfBoundrySize, halfBoundrySize, -halfBoundrySize,
        -halfBoundrySize, -halfBoundrySize, -halfBoundrySize, -halfBoundrySize, -halfBoundrySize, halfBoundrySize,
        -halfBoundrySize, halfBoundrySize, -halfBoundrySize, -halfBoundrySize, halfBoundrySize, halfBoundrySize,
        -halfBoundrySize, -halfBoundrySize, halfBoundrySize, -halfBoundrySize, halfBoundrySize, halfBoundrySize,
        // connect the squares to make a cube
        -halfBoundrySize, -halfBoundrySize, -halfBoundrySize, halfBoundrySize, -halfBoundrySize, -halfBoundrySize,
        -halfBoundrySize, halfBoundrySize, -halfBoundrySize, halfBoundrySize, halfBoundrySize, -halfBoundrySize,
        -halfBoundrySize, -halfBoundrySize, halfBoundrySize, halfBoundrySize, -halfBoundrySize, halfBoundrySize,
        -halfBoundrySize, halfBoundrySize, halfBoundrySize, halfBoundrySize, halfBoundrySize, halfBoundrySize,
    ];  // Positions
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices_line), gl.STATIC_DRAW);
    linePositionBuffer.itemSize = 3;
    linePositionBuffer.numItems = 24;

    /////////// LINE COLOR CODE ///////////
    lineColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lineColorBuffer);
    var boxColors = [
        1.0, 0.0, 1.0, 1, 0.0, 1.0, 1.0, 1,
        0.0, 1.0, 1.0, 1, 1.0, 1.0, 1.0, 1,
        0.0, 0.0, 1.0, 1, 1.0, 1.0, 1.0, 1,
        1.0, 0.0, 1.0, 1, 1.0, 1.0, 1.0, 1,

        1.0, 0.0, 0.0, 1, 1.0, 1.0, 1.0, 1,
        1.0, 1.0, 1.0, 1, 1.0, 0.0, 0.0, 1,
        0.0, 1.0, 1.0, 1, 1.0, 0.0, 1.0, 1,
        1.0, 1.0, 0.0, 1, 1.0, 1.0, 0.0, 1,

        1.0, 0.0, 1.0, 1, 1.0, 1.0, 1.0, 1,
        1.0, 1.0, 1.0, 1, 1.0, 0.0, 0.0, 1,
        1.0, 0.0, 1.0, 1, 1.0, 0.0, 1.0, 1,
        0.0, 1.0, 1.0, 1, 1.0, 1.0, 1.0, 1
    ];      // Colors
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxColors), gl.STATIC_DRAW);
    lineColorBuffer.itemSize = 4;
    lineColorBuffer.numItems = 24;
}

//<!-- setMatrixUniforms() -->
function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

//<!-- drawScene() -->
function drawScene() {
    //////////// Viewport ////////////
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // allocate a perspective matrix in pMatrix
    mat4.perspective(pMatrix, 45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);

    mat4.identity(mvMatrix); // allocate an identity matrix in mvMatrix

    // ANIMATION ROTATION
    mat4.translate(mvMatrix, mvMatrix, [xPos, yPos, zPos]); // add a translation into matrix

    mat4.rotate(mvMatrix, mvMatrix, degToRad(xRot), [1, 0, 0]);
    mat4.rotate(mvMatrix, mvMatrix, degToRad(yRot), [0, 1, 0]);
    mat4.rotate(mvMatrix, mvMatrix, degToRad(zRot), [0, 0, 1]);

    // DRAW MOVING TRIANGLES
    var i;
    for (i = 0; i < 5; i++) {
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer[i]);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triangleVertexPositionBuffer[i].itemSize, gl.FLOAT, false, 0, 0);

        //////////// TRIANGLE COLOR ////////////
        gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, triangleVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

        // draw triangles
        setMatrixUniforms();
        gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer[i].numItems);
    }

    //////////// LINE POSITION ////////////
    gl.bindBuffer(gl.ARRAY_BUFFER, linePositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, linePositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    //////////// LINE COLOR ////////////
    gl.bindBuffer(gl.ARRAY_BUFFER, lineColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, lineColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // draw lines
    setMatrixUniforms();
    gl.drawArrays(gl.LINES, 0, linePositionBuffer.numItems);
}

//<!-- webGLStart() -->
function webGLStart() {
    // get canvas to draw on from html document
    canvas = document.getElementById("canvas");

    // get divs from html

    posXElement = document.getElementById("posX");
    posYElement = document.getElementById("posY");
    posZElement = document.getElementById("posZ");
    rotXElement = document.getElementById("rotX");
    rotYElement = document.getElementById("rotY");
    rotZElement = document.getElementById("rotZ");

    posXNode = document.createTextNode("");
    posYNode = document.createTextNode("");
    posZNode = document.createTextNode("");
    rotXNode = document.createTextNode("");
    rotYNode = document.createTextNode("");
    rotZNode = document.createTextNode("");

    posXElement.appendChild(posXNode);
    posYElement.appendChild(posYNode);
    posZElement.appendChild(posZNode);
    rotXElement.appendChild(rotXNode);
    rotYElement.appendChild(rotYNode);
    rotZElement.appendChild(rotZNode);


    canvas.width = window.innerWidth - 20;
    canvas.height = window.innerHeight - 100;

    // create GL viewport
    initGL(canvas);

    // load shaders and buffers into GPU
    initShaders();
    initBuffers();

    // set the background color to opaque black
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // turn on depth comparisons & render only pixels in front
    gl.enable(gl.DEPTH_TEST);

    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;

    // handle mouse inputs with our callbacks
    canvas.onmousedown = handleMouseDown;
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;

    // begin rendering with tick
    tick();
}

// loop and animation
function tick() {
    requestAnimFrame(tick);
    drawScene();
    handleKeys();
    animate();
    // assign value to each node so that it is visible
    posXNode.nodeValue = xPos;
    posYNode.nodeValue = yPos;
    posZNode.nodeValue = zPos;
    rotXNode.nodeValue = xRot;
    rotYNode.nodeValue = yRot;
    rotZNode.nodeValue = zRot;
}

var triangleSpeeds = [
    [1010, 410, 40],
    [-101, 30, 40],
    [400, -20, 1000],
    [10, 50, -40],
    [-60, -60, -160],
    [1, 0, 1000]
];

var triangleCenters = [
    [1.0, 6.0, 1.0],
    [-4.0, -1.0, -1.0],
    [-1.0, 1.0, 1.0],
    [1.0, -1.0, 1.0],
    [2.0, 2.0, -1.0]
];

// Animation
function animate() {
    var currentTime = new Date().getTime();
    if (previousTime != 0) {
        // get time elapsed since last draw
        var elapsed = currentTime - previousTime;

        // animate all triangles
        var t;
        for (t = 0; t < 5; t++) {
            // bounce off boundaries
            var i;
            for (i = 0; i < 3; i++) {
                if (triangleCenters[t][i] > (halfBoundrySize - 1)) {
                    triangleSpeeds[t][i] = -Math.abs(triangleSpeeds[t][i]);
                }
                else if (triangleCenters[t][i] < -(halfBoundrySize - 1)) {
                    triangleSpeeds[t][i] = Math.abs(triangleSpeeds[t][i]);
                }
                triangleCenters[t][i] += (triangleSpeeds[t][i] * elapsed) / 100000.0;
            }

            gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer[t]);
            var vertices_triangle = [
                triangleCenters[t][0] + 1.0, triangleCenters[t][1] + 1.0, triangleCenters[t][0] + 0.0,
                triangleCenters[t][0] + 0.0, triangleCenters[t][1] + 1.0, triangleCenters[t][2] + 1.0,
                triangleCenters[t][0] + 0.0, triangleCenters[t][1] - 1.0, triangleCenters[t][2] + 0.0
            ];
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices_triangle), gl.STATIC_DRAW);
            triangleVertexPositionBuffer[t].itemSize = 3;
            triangleVertexPositionBuffer[t].numItems = 3;
        }
    }
    previousTime = currentTime;
}

// functions to handling keyDown and keyUp events
var currentlyPressedKeys = {}; // dictionary of keys
function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
    console.log("xPos: " + xPos + "      yPos: " + yPos);
}

function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}

// keyboard handling
function handleKeys() {
    // w (for z in)
    if( currentlyPressedKeys[87]) {
        zPos += .2;
    }
    // j (for z out)
    if(currentlyPressedKeys[83]) {
        zPos -= .2;
    }

    // left arrow
    if (currentlyPressedKeys[37]) {
        xPos += .2;
    }
    // right arrow
    if (currentlyPressedKeys[39]) {
        xPos -= .2;
    }
    // down arrow
    if (currentlyPressedKeys[40]) {
        yPos += .2;
    }
    // up arrow
    if (currentlyPressedKeys[38]) {
        yPos -= .2;
    }
}

// functions handling mouseDown and mouseUp events
function handleMouseDown(event) {
    mouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
}

function handleMouseUp(event) {
    mouseDown = false;
}

// function handling mouseMove event
function handleMouseMove(event) {
    // do nothing if mouse is not holding down
    if (!mouseDown) {
        return;
    }

    // get x and y cordinates of mouse
    var newX = event.clientX;
    var newY = event.clientY;

    // declare new rotation matrix
    var newRotationMatrix = mat4.create();
    mat4.identity(newRotationMatrix);


    // get differences between cordinates
    var deltaX = newX - lastMouseX;
    var deltaY = newY - lastMouseY;

    // rotate around x
    var mouseXRot = deltaX;

    // rotate around y
    var mouseYRot = deltaY;

    xRot += mouseYRot;
    yRot += mouseXRot;

    lastMouseX = newX;
    lastMouseY = newY;
}

// converts degrees to radians
function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

