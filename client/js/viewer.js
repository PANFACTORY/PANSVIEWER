const input_file = document.getElementById('input_file');

const canvas = document.getElementById('canvas');

const input_radius = document.getElementById("input_radius");
const input_theta = document.getElementById("input_theta");
const input_phi = document.getElementById("input_phi");

const input_ax = document.getElementById("input_ax");
const input_ay = document.getElementById("input_ay");
const input_az = document.getElementById("input_az");

const input_h = document.getElementById("input_h");
const input_r = document.getElementById("input_r");
const input_c = document.getElementById('input_c');

function convertPOV(_r, _theta, _phi) {
    return { x : _r*Math.sin(_theta)*Math.sin(_phi), y : _r*Math.cos(_theta), z :  _r*Math.sin(_theta)*Math.cos(_phi) };
}

function getParams() {
    return { 
        vertexf : convertPOV(input_radius.value, input_theta.value*(Math.PI/180.0), input_phi.value*(Math.PI/180.0)),
        vertexa : { x : input_ax.value, y : input_ay.value, z : input_az.value }, 
        h : input_h.value, 
        r : input_r.value,
    };
}

function drawObject(_canvas, _color, _obj) {
    const ctx = _canvas.getContext('2d');
    ctx.clearRect(0, 0, _canvas.width, _canvas.height);

    const TX = 0.5*_canvas.width;
    const TY = 0.5*_canvas.height;

    // draw x-y
    const plnorm = 50.0;

    ctx.beginPath();
    ctx.moveTo(parseInt(TX + plnorm*_obj.plane[0].X), parseInt(TY - plnorm*_obj.plane[0].Y));
    ctx.lineTo(parseInt(TX + plnorm*_obj.plane[1].X), parseInt(TY - plnorm*_obj.plane[1].Y));
    ctx.lineTo(parseInt(TX + plnorm*_obj.plane[2].X), parseInt(TY - plnorm*_obj.plane[2].Y));
    ctx.lineTo(parseInt(TX + plnorm*_obj.plane[3].X), parseInt(TY - plnorm*_obj.plane[3].Y));
    ctx.closePath();
    ctx.strokeStyle = `rgb(${80}, ${80}, ${80})`;
    ctx.stroke();
    ctx.fillStyle = `rgba(${80}, ${80}, ${80}, ${0.1})`;
    ctx.fill();

    // draw coordinate
    const colorlist = [{ R : 255, G : 0, B : 0 }, { R : 0, G : 255, B : 0 }, { R : 0, G : 0, B : 255 }];
    const conorm = 50.0;

    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.moveTo(parseInt(TX + conorm*_obj.coordinate[i].X0), parseInt(TY - conorm*_obj.coordinate[i].Y0));
        ctx.lineTo(parseInt(TX + conorm*_obj.coordinate[i].X1), parseInt(TY - conorm*_obj.coordinate[i].Y1));
        ctx.closePath();
        ctx.strokeStyle = `rgb(${colorlist[i].R}, ${colorlist[i].G}, ${colorlist[i].B})`;
        ctx.stroke();
    }
    
    // draw object
    const R = parseInt(_color.substring(1, 3), 16);
    const G = parseInt(_color.substring(3, 5), 16);
    const B = parseInt(_color.substring(5, 7), 16);

    for (let face of _obj.object) {
        ctx.beginPath();
        ctx.moveTo(parseInt(TX + face.X0), parseInt(TY - face.Y0));
        ctx.lineTo(parseInt(TX + face.X1), parseInt(TY - face.Y1));
        ctx.lineTo(parseInt(TX + face.X2), parseInt(TY - face.Y2));
        ctx.closePath();
        ctx.strokeStyle = `rgb(${parseInt(R*face.shading)}, ${parseInt(G*face.shading)}, ${parseInt(B*face.shading)})`;
        ctx.stroke();
        ctx.fillStyle = `rgba(${parseInt(R*face.shading)}, ${parseInt(G*face.shading)}, ${parseInt(B*face.shading)}, 1.0)`;
        ctx.fill();
    }           
}

async function onChangeFile() {
    if (input_file.files.length) {
        let data = new FormData();
        data.append('params', JSON.stringify(getParams()));
        data.append('model', input_file.files[0], 'modelfile');

        let response = await fetch('./loadmodel', {
            method: 'POST',
            body: data,
        });
        let result = await response.json();

        drawObject(canvas, input_c.value, result);  
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

    drawObject(canvas, input_c.value, result);
}

/*
let mouseX = "";
let mouseY = "";

canvas.addEventListener('mousemove', onMove, false);
//canvas.addEventListener('mousedown', onClick, false);
//canvas.addEventListener('mouseup', drawEnd, false);
//canvas.addEventListener('mouseout', drawEnd, false);

function onMove(e) {
    if (e.buttons === 1 || e.witch === 1) {
        let rect = e.target.getBoundingClientRect();
        let X = parseInt(e.clientX - rect.left);
        let Y = parseInt(e.clientY - rect.top);

        input_theta.value = X;
    }
}
*/