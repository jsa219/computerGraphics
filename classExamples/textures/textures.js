        var gl;
        //var shaderprogram;

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
        var shaderprogram;

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

            shaderprogram.texture

			shaderProgram.vertexColorAttribute =
				gl.getAttribLocation(shaderProgram, "aVertexColor");

			gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
			
        }

        //<!-- initBuffers() -->
        function initBuffers() {

            // Sphere
            var sRadius = 4;
            var slices = 25;
            var stacks = 12;    // number of latitudinal squares around equator
            var sVertices = [];
            var count = 0;

            var phi1 = ((t)/stacks) * Math.PI;
            var phi2 = ((t+1)/stacks) * Math.PI;

            for(p = 0; p < slices + 1; p++ ) {  // +1 moves down a row
                var theta = ((p)/slices) * 2 * Math.PI;
                var xVal = sRadius * Math.cos(theta) * Math.sin(phi1);
                var yVal = sRadius * Math.cos(theta) * Math.sin(phi2);
                var zVal = sRadius * Math.cos(phi1);
                sVertices = sVertices.concat([xVal, yVal, zVal]);
            }

            sphereVertexPositionBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sVertices), gl.STATIC_DRAW);
            sphereVertexPositionBuffer.itemSize = 3;
            sphereVertexPositionBuffer.numItems = stacks * (slices + 1) * 2;



            var textureCoords = [];
            for(t = 0; t < stacks; t++) {
                var phi1 = t / stacks;
                var phi2 = (t+1) / stacks;
                for(p = 0; p < slices + 1; p++) {
                    var theta = 1 - (p / slices);
                    textureCoords = textureCoords.concat([theta, phi1]);
                    textureCoords = textureCoords.concat([theta, phi2]);
                }
            }
            sphereVertexTextureCoordBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexTextureCoordBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
            sphereVertexTextureCoordBuffer.itemSize = 2;
            sphereVertexTextureCoordBuffer.numItems = stacks * (slices + 1) * 2;
            gl.bindBuffer(gl.ARRAY_BUFFER, null);

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


            //allocate a perspective matrix in pMatrix
            mat4.perspective(pMatrix, 45, gl.viewportWidth /
                gl.viewportHeight, 0.1, 100.0);

            //////////////Load in Triangle Vertices
            gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);

            gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute,
				sphereVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

			// Working on texture data
			gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexTextureCoordBuffer);
			
			// set color in vertex shader
			gl.vertexAttribPointer(shaderProgram.vertexColorAttribute,
				sphereVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0,0);
			
			

            setMatrixUniforms();
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE2D, worldTexture);
            gl.uniform1i();


        }

        //allocate an identity matrix in mvMatrix
        mat4.identity(mvMatrix);
        //Add a translation into mvMatrix
        mat4.translate(mvMatrix, mvMatrix, [0, 0, -7.0]);


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
        
        //<!-- initTexture() -->
        function initTexture() {
			worldTexture = gl.createTexture();
			worldTexture.image = new Image();
			
			
		}
		
		
		function handleLoadedTexture() {
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.pixel.Storei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
            gl.texParameteri(gl.TEXTURE_2D, )
            gl.tex
            gl.bindTexture()
		}



