const input_file = document.getElementById('input_file');

const canvas = document.getElementById('canvas');
canvas.addEventListener('mousemove', onMove, false);
canvas.addEventListener('mousedown', onClick, false);
canvas.addEventListener('mousewheel', onWheel, false);

const input_ax = document.getElementById("input_ax");
const input_ay = document.getElementById("input_ay");
const input_az = document.getElementById("input_az");

const input_c = document.getElementById('input_c');

let pv = { x : 0.0, y : 0.0, z : 1.0 };
let ey = { x : 0.0, y : 1.0, z : 0.0 };

let mouseX = "";
let mouseY = "";
let mouseT = 1200;

function getParams() {
    return { 
        vertexf : pv,
        vertexa : { x : parseFloat(input_ax.value), y : parseFloat(input_ay.value), z : parseFloat(input_az.value) }, 
        h : mouseT,
        ey : ey,
    };
}

function drawObject(_canvas, _color, _obj) {
    const ctx = _canvas.getContext('2d');
    ctx.clearRect(0, 0, _canvas.width, _canvas.height);

    const TX = 0.5*_canvas.width;
    const TY = 0.75*_canvas.height;

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

function onMove(e) {
    if (e.buttons === 1 || e.witch === 1) {
        const X = e.clientX - mouseX;
        const Y = mouseY - e.clientY;

        if (X*X + Y*Y >= 10) {
            //　視点座標と注視点座標の取得
            const ax = parseFloat(input_ax.value);
            const ay = parseFloat(input_ay.value);
            const az = parseFloat(input_az.value);

            //　カメラ基底ベクトルの生成
            const ez = { x : pv.x - ax, y : pv.y - ay, z : pv.z - az };
            const ex = { x : ey.y*ez.z - ey.z*ez.y, y : ey.z*ez.x - ey.x*ez.z, z : ey.x*ez.y - ey.y*ez.x };

            //　マウスの移動方向ベクトル
            let nx = X*ex.x + Y*ey.x;
            let ny = X*ex.y + Y*ey.y;
            let nz = X*ex.z + Y*ey.z;
            const nnorm = Math.sqrt(nx*nx + ny*ny + nz*nz);
            nx /= nnorm;
            ny /= nnorm;
            nz /= nnorm;
            
            //　回転軸ベクトル
            let rx = ny*ez.z - nz*ez.y;
            let ry = nz*ez.x - nx*ez.z;
            let rz = nx*ez.y - ny*ez.x;
            const rnorm = Math.sqrt(rx*rx + ry*ry + rz*rz);
            rx /= rnorm;
            ry /= rnorm;
            rz /= rnorm;
            
            //　視線ベクトルを回転
            const theta = 2.0*Math.PI/180.0;
            const rdotv = rx*ez.x + ry*ez.y + rz*ez.z;
            pv.x = ez.x*Math.cos(theta) + (ry*ez.z - rz*ez.y)*Math.sin(theta) + rx*rdotv*(1.0 - Math.cos(theta)) + ax;
            pv.y = ez.y*Math.cos(theta) + (rz*ez.x - rx*ez.z)*Math.sin(theta) + ry*rdotv*(1.0 - Math.cos(theta)) + ay;
            pv.z = ez.z*Math.cos(theta) + (rx*ez.y - ry*ez.x)*Math.sin(theta) + rz*rdotv*(1.0 - Math.cos(theta)) + az;

            //　カメラの基底ベクトルを更新
            const rdotw = rx*ey.x + ry*ey.y + rz*ey.z;
            const tmpx = ey.x*Math.cos(theta) + (ry*ey.z - rz*ey.y)*Math.sin(theta) + rx*rdotw*(1.0 - Math.cos(theta));
            const tmpy = ey.y*Math.cos(theta) + (rz*ey.x - rx*ey.z)*Math.sin(theta) + ry*rdotw*(1.0 - Math.cos(theta));
            const tmpz = ey.z*Math.cos(theta) + (rx*ey.y - ry*ey.x)*Math.sin(theta) + rz*rdotw*(1.0 - Math.cos(theta));
            ey.x = tmpx;
            ey.y = tmpy;
            ey.z = tmpz;

            //　再描画
            onChangeParams();

            //　マウス位置の更新
            mouseX = e.clientX;
            mouseY = e.clientY;
        }
    }
}

function onClick(e) {
    if (e.witch === 1) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }
}

function onWheel(e) {
    mouseT += 10*e.wheelDelta/120;
    onChangeParams();
}