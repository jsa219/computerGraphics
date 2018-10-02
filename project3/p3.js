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
    var canvas;

    // initialize mouse variables
    var mouseDown = false;
    var lastMouseX = null;
    var lastMouseY = null;
    var mouseRotMatrix = mat4.create();
    mat4.identity(mouseRotMatrix);

    // KB variables
    var currentlyPressedKeys = {}; // dictionary of keys

    // Framerate time variables
    var eT = 0;
    var fC = 0;
    var lT = new Date().getTime();

}

//<!-- initGL() -->
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

    /////////// Cube lines ///////////
    {
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

    /////////// Spheres /////////
    {
        
    }
}

//<!-- setMatrixUniforms() -->
function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

//<!-- drawScene() -->
function drawScene() {
    //displayFPS();


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

// Animation
function animate() {

    var currentTime = new Date().getTime();
    if (previousTime != 0) {
        // get time elapsed since last draw
        var elapsed = currentTime - previousTime;

        // Example below of speed * time elapsed
        // triangleCenters[t][i] += (triangleSpeeds[t][i] * elapsed) / 100000.0;

    }
    displayFPS();
    previousTime = currentTime;
}

// functions to handling keyDown and keyUp events
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
    if (currentlyPressedKeys[87]) {
        zPos += .2;
    }
    // j (for z out)
    if (currentlyPressedKeys[83]) {
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

// framerate display
function displayFPS() {
    var now = new Date().getTime();
    fC++;
    eT += (now - lT);
    lT = now;
    if (eT >= 1000) {
        fps = fC;
        fC = 0;
        eT -= 1000;

        document.getElementById('framerate').innerHTML = fps;
    }
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
