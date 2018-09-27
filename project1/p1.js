var gl;

//<!-- initGL() -->
function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialize webGL");
    }
}

function getShader(gl, id) {
    //Load the shader code by it's ID, as assigned in
    //the script element (e.g. "shader-fs" or "shader-vs")
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var k = shaderScript.firstChild;
    var str = "";
    //While firstChild exists
    while (k) {
        ///If the firstChild is a TEXT type document
        if (k.nodeType == 3) {
            //Append the text to str.
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    }
    else if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else {
        return null;
    }

    //Now we have the type and the code, and we
    //provide it to openGL as such, then compile the shader code.
    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    //If the compilation of the shader code fails, report the error
    //and return nothing, since the shader failed to compile.
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    //If there were no errors in compilation, return the compiled shader.
    return shader;
}

//<!-- initShaders() -->
var shaderProgram;

function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    //Create the program, then attach and link
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    //Check for linker errors.
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    //Attach shaderprogram to openGL context.
    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute =
        gl.getAttribLocation(shaderProgram, "aVertexPosition");

    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.pMatrixUniform =
        gl.getUniformLocation(shaderProgram, "uPMatrix");

    shaderProgram.mvMatrixUniform =
        gl.getUniformLocation(shaderProgram, "uMVMatrix");

    shaderProgram.vertexColorAttribute =
        gl.getAttribLocation(shaderProgram, "aVertexColor");

    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
}

var triangleVertexPositionBuffer;
var triangleVertexColorBuffer;
var linesPositionBuffer;
var linesColorBuffer;
var pointPositionBuffer;
var pointColorBuffer;

//<!-- initBuffers() -->
function initBuffers() {

    //////////////////// 2 TRIANGLES //////////////////////
    // Generate triangle geometry with this function
    triangleVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);

    let vertices = [0.0, 1.0, 2.0, -1.0, -1.0, 2.0, 1.0, -1.0, 2.0,
        -1, 1, -1, 1, 1, -1, 0, 4, -1];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    triangleVertexPositionBuffer.itemSize = 3;
    triangleVertexPositionBuffer.numItems = 6;

    triangleVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);
    let colors = [1.0, 0.0, 0.0, 1, 0.0, 1.0, 0.0, 1, 0.0, 0.0, 1.0, 1,
        1.0, 0.0, 0.0, 1, 0.0, 1.0, 0.0, 1, 1.0, 1.0, 1.0, 1];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    triangleVertexColorBuffer.itemSize = 4;
    triangleVertexColorBuffer.numItems = 6;
    //////////////////////////////////////////////

    /////////////////// 3 LINES /////////////////////////
    linesPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, linesPositionBuffer);

    vertices = [-4.0, -1.0, 0.0, 0.0, 0.4, 0.0, 0.0, 0.0, 0.0, 4.0, -1.0, 0.0, 0.0, 0.0, 0.0, 4.0, 1.0, 0.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

    linesPositionBuffer.itemSize = 3;
    linesPositionBuffer.numItems = 6;

    linesColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, linesColorBuffer);
    colors = [1.0, 1.0, 1.0, 1, 1.0, 1.0, 1.0, 1, 1.0, 1.0, 1.0, 1, 1.0, 0.0, 1.0, 1, 1.0, 1.0, 1.0, 1, 1.0, 0.0, 0.0, 1];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    linesColorBuffer.itemSize = 4;
    linesColorBuffer.numItems = 6;
    //////////////////////////////////////////////

    //// Points ///
    pointPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pointPositionBuffer);
    vertices = [0, 2, 0,
                1, 1, 0];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    pointPositionBuffer.itemSize = 3;
    pointPositionBuffer.numItems = 2;


    pointColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pointColorBuffer);
    colors = [1, 0, 1, 1,
            1, 1, 0, 1];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    pointColorBuffer.itemSize = 4;
    pointColorBuffer.numItems = 2;

    ////////////////////

    ///// Triangle Strip //////
    triStripPos = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triStripPos);
    vertices = [-1.0, 1.0, -4.0, 0.0, -1.0, -4.0, 1.0, 1.0, -4.0, 2.0, -1.0, -4.0, 3.0, 1.0, -4.0, 4.0, -1.0, -4.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    triStripPos.itemSize = 3;
    triStripPos.numItems = 6;

    triStripCol = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triStripCol);
    colors = [0, 1.0, 1.0, 1, 1.0, 0.0, 1.0, 1, 1.0, 1.0, 1.0, 1, 1.0, 1.0, 1.0, 1, 1.0, 0.0, 0.0, 1, 0.0, 0.0, 1.0, 1];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    triStripCol.itemSize = 4;
    triStripCol.numItems = 6;


    ///// Triangle Fan ////

    triFanPosBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triFanPosBuffer);
    vertices = [2.0, 2.0, 0.0, 1.5, 2.5, 0.0, 2.0, 3.5, 0.0,
        2.5, 2.5, 0.0, 3.5, 2.0, 0.0, 2.5, 1.5, 0.0,
        2.0, 0.5, 0.0, 1.5, 1.5, 0.0, 0.5, 2.0, 0.0, 1.5, 2.5, 0.0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    triFanPosBuffer.itemSize = 3;
    triFanPosBuffer.numItems = 10;

    triFanColBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, triFanColBuffer);
    colors = [1.0, 0.0, 1.0, 1, 0.0, 1.0, 2.0, 1, 0.0, 4.0, 1.0, 1,
        0.0, 1.0, 0.0, 1, 0.0, 0.0, 1.0, 1, 0.0, 1.0, 0.0, 1, 5.0, 0.0, 1.0, 1,
        0.0, 1.0, 0.0, 1, 0.0, 0.0, 1.0, 1, 0.0, 1.0, 0.0, 1];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    triFanColBuffer.itemSize = 4;
    triFanColBuffer.numItems = 10;


}

//<!-- setMatrixUniforms() -->
function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

//<!-- drawScene() -->
var mvMatrix = mat4.create();
var pMatrix = mat4.create();

function drawScene() {

    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    //allocate an identity matrix in mvMatrix
    mat4.identity(mvMatrix);
    //Add a translation into mvMatrix
    mat4.translate(mvMatrix, mvMatrix, [0, 0, -7.0]);


    //allocate a perspective matrix in pMatrix
    mat4.perspective(pMatrix, 45, gl.viewportWidth /
        gl.viewportHeight, 0.1, 100.0);

    //////////////Load in Triangle Vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);

    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
        triangleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    // Working on color data
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexColorBuffer);

    // set color in vertex shader
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
        triangleVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    setMatrixUniforms();

    gl.drawArrays(gl.TRIANGLES, 0, triangleVertexPositionBuffer.numItems);

////////


    gl.bindBuffer(gl.ARRAY_BUFFER, linesPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
        linesPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, linesColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
        linesColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    setMatrixUniforms();
    gl.drawArrays(gl.LINES, 0, linesPositionBuffer.numItems);

///////


    gl.bindBuffer(gl.ARRAY_BUFFER, pointPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
        pointPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, pointColorBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
        pointColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
    setMatrixUniforms();
    gl.drawArrays(gl.POINTS, 0, pointPositionBuffer.numItems);


    gl.bindBuffer(gl.ARRAY_BUFFER, triStripPos);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, triStripPos.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, triStripCol);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, triStripCol.itemSize, gl.FLOAT, false, 0, 0);

    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, triStripPos.numItems);
////////			


    gl.bindBuffer(gl.ARRAY_BUFFER, triFanPosBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
        triFanPosBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, triFanColBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
        triFanColBuffer.itemSize, gl.FLOAT, false, 0, 0);

    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLE_FAN, 0, triFanPosBuffer.numItems);


}


//<!-- webGLStart() -->
function webGLStart() {
    var canvas = document.getElementById("lesson02-canvas");

    canvas.width = window.innerWidth - 20;
    canvas.height = window.innerHeight - 20;

    initGL(canvas);

    initShaders();
    initBuffers();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    gl.enable(gl.DEPTH_TEST);
    drawScene();
}

