function convertPOV(_r, _theta, _phi) {
    return { x : _r*Math.sin(_theta)*Math.cos(_phi), y : _r*Math.sin(_theta)*Math.sin(_phi), z : _r*Math.cos(_theta) };
}

function getParams() {
    return { 
        vertexf : convertPOV(
            document.getElementById("input_radius").value, 
            document.getElementById("input_theta").value*(Math.PI/180.0), 
            document.getElementById("input_phi").value*(Math.PI/180.0)
        ),
        vertexa : { 
            x : document.getElementById("input_ax").value, 
            y : document.getElementById("input_ay").value, 
            z : document.getElementById("input_az").value
        }, 
        h : document.getElementById("input_h").value, 
        r : document.getElementById("input_r").value,
    };
}

function drawObject(_canvas, _color, _obj) {
    const ctx = _canvas.getContext('2d');
    ctx.clearRect(0, 0, _canvas.width, _canvas.height);

    const TX = _canvas.width/2;
    const TY = _canvas.height/2;

    const R = parseInt(_color.substring(1, 3), 16);
    const G = parseInt(_color.substring(3, 5), 16);
    const B = parseInt(_color.substring(5, 7), 16);

    for (var face of _obj) {
        ctx.beginPath();
        ctx.moveTo(TX + face.X0, TY + face.Y0);
        ctx.lineTo(TX + face.X1, TY + face.Y1);
        ctx.lineTo(TX + face.X2, TY + face.Y2);
        ctx.closePath();
        ctx.strokeStyle = `rgb(${parseInt(R*face.shading)}, ${parseInt(G*face.shading)}, ${parseInt(B*face.shading)})`;
        ctx.stroke();
        ctx.fillStyle = `rgba(${parseInt(R*face.shading)}, ${parseInt(G*face.shading)}, ${parseInt(B*face.shading)}, 1.0)`;
        ctx.fill();
    }           
}

async function onChangeFile() {
    const files = document.getElementById('input_file').files;
    if (files.length) {
        let data = new FormData();
        data.append('params', JSON.stringify(getParams()));
        data.append('model', files[0], 'modelfile');

        let response = await fetch('./loadmodel', {
            method: 'POST',
            body: data,
        });
        let result = await response.json();

        drawObject(document.getElementById('canvas'), document.getElementById('input_c').value, result);  
    }
}

async function onChangeParams() {
    let data = new FormData();
    data.append('params', JSON.stringify(getParams()));

    let response = await fetch('./params', {
        method: 'POST',
        body: data,
    });
    let result = await response.json();

    drawObject(document.getElementById('canvas'), document.getElementById('input_c').value, result);
}