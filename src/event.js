//*****************************************************************************
//  Title       :   src/event.js
//  Author      :   Tanabe Yuta
//  Date        :   2020/10/10
//  Copyright   :   (C)2020 TanabeYuta
//*****************************************************************************


const $input_file = document.getElementById('input_file');

const $svg = document.getElementById('svg');

const $input_ax = document.getElementById("input_ax");
const $input_ay = document.getElementById("input_ay");
const $input_az = document.getElementById("input_az");

const $input_c = document.getElementById('input_c');

let pv = { x : 0.0, y : 0.0, z : 1.0 };
let ey = { x : 0.0, y : 1.0, z : 0.0 };

let mouseX = "";
let mouseY = "";
let mouseT = 1200;

let objects = new Array();


//*****************************************************************************
// ビュー変換関数
//*****************************************************************************
const viewingConversion = (_vertex, _vertexf, _ca, _sa, _cb, _sb, _cg, _sg) => {
    const xe = (_vertex.x - _vertexf.x)*(_ca*_cg - _sa*_sb*_sg) - (_vertex.y - _vertexf.y)*_cb*_sg - (_vertex.z - _vertexf.z)*(_sa*_cg + _ca*_sb*_sg);
    const ye = (_vertex.x - _vertexf.x)*(_ca*_sg + _sa*_sb*_cg) + (_vertex.y - _vertexf.y)*_cb*_cg - (_vertex.z - _vertexf.z)*(_sa*_sg - _ca*_sb*_cg);
    const ze = -(_vertex.x - _vertexf.x)*_sa*_cb + (_vertex.y - _vertexf.y)*_sb - (_vertex.z - _vertexf.z)*_ca*_cb;
    return { x : xe, y : ye, z : ze }
}


//*****************************************************************************
// オブジェクト2D化関数
//*****************************************************************************
const convertObject = (_objects, _vertexf, _vertexa, _hr, _ey) => {
    //　描画用座標配列
    let picture = { coordinate : new Array(), plane : new Array(), object : new Array() };

    //  ビュー変換係数の算出
    const v = { x : _vertexa.x - _vertexf.x, y : _vertexa.y - _vertexf.y, z : _vertexa.z - _vertexf.z };
    const vx2vz2 = v.x*v.x + v.z*v.z;
    const vnorm = Math.sqrt(vx2vz2 + v.y*v.y);
    const sqrtvx2vz2 = Math.sqrt(vx2vz2);
    const cosalpha = -v.z/sqrtvx2vz2;
    const sinalpha = -v.x/sqrtvx2vz2;
    const cosbeta = sqrtvx2vz2/vnorm;
    const sinbeta = v.y/vnorm;
    const cup = viewingConversion({ x : _ey.x + _vertexf.x, y : _ey.y + _vertexf.y, z : _ey.z + _vertexf.z }, _vertexf, cosalpha, sinalpha, cosbeta, sinbeta, 1.0, 0.0);
    const cupnorm = Math.sqrt(cup.x*cup.x + cup.y*cup.y);
    const cosgamma = cup.y/cupnorm;
    const singamma = cup.x/cupnorm;

    //　座標軸
    const e0 = viewingConversion({ x : 0.0 + _vertexf.x, y : 0.0 + _vertexf.y, z : 0.0 + _vertexf.z }, _vertexf, cosalpha, sinalpha, cosbeta, sinbeta, cosgamma, singamma);
    const ex = viewingConversion({ x : 1.0 + _vertexf.x, y : 0.0 + _vertexf.y, z : 0.0 + _vertexf.z }, _vertexf, cosalpha, sinalpha, cosbeta, sinbeta, cosgamma, singamma);
    const ey = viewingConversion({ x : 0.0 + _vertexf.x, y : 1.0 + _vertexf.y, z : 0.0 + _vertexf.z }, _vertexf, cosalpha, sinalpha, cosbeta, sinbeta, cosgamma, singamma);
    const ez = viewingConversion({ x : 0.0 + _vertexf.x, y : 0.0 + _vertexf.y, z : 1.0 + _vertexf.z }, _vertexf, cosalpha, sinalpha, cosbeta, sinbeta, cosgamma, singamma);
    picture.coordinate.push({ X0 : e0.x, Y0 : e0.y, X1 : ex.x, Y1 : ex.y });  
    picture.coordinate.push({ X0 : e0.x, Y0 : e0.y, X1 : ey.x, Y1 : ey.y });
    picture.coordinate.push({ X0 : e0.x, Y0 : e0.y, X1 : ez.x, Y1 : ez.y });

    //　x-y平面
    const p0 = viewingConversion({ x : -1.0 + _vertexf.x, y : 0.0 + _vertexf.y, z : -1.0 + _vertexf.z }, _vertexf, cosalpha, sinalpha, cosbeta, sinbeta, cosgamma, singamma);
    const p1 = viewingConversion({ x : 1.0 + _vertexf.x, y : 0.0 + _vertexf.y, z : -1.0 + _vertexf.z }, _vertexf, cosalpha, sinalpha, cosbeta, sinbeta, cosgamma, singamma);
    const p2 = viewingConversion({ x : 1.0 + _vertexf.x, y : 0.0 + _vertexf.y, z : 1.0 + _vertexf.z }, _vertexf, cosalpha, sinalpha, cosbeta, sinbeta, cosgamma, singamma);
    const p3 = viewingConversion({ x : -1.0 + _vertexf.x, y : 0.0 + _vertexf.y, z : 1.0 + _vertexf.z }, _vertexf, cosalpha, sinalpha, cosbeta, sinbeta, cosgamma, singamma);
    picture.plane.push({ X : p0.x, Y : p0.y });  
    picture.plane.push({ X : p1.x, Y : p1.y });
    picture.plane.push({ X : p2.x, Y : p2.y });
    picture.plane.push({ X : p3.x, Y : p3.y });

    // オブジェクト
    for (let object of _objects) {
        // 陰面処理と濃淡計算
        for (let face of object.faces) {
            //  稜線ベクトルの算出
            const e1 = { 
                x : object.vertexes[face.vertexes[1]].x - object.vertexes[face.vertexes[0]].x, 
                y : object.vertexes[face.vertexes[1]].y - object.vertexes[face.vertexes[0]].y, 
                z : object.vertexes[face.vertexes[1]].z - object.vertexes[face.vertexes[0]].z 
            };
            const e2 = { 
                x : object.vertexes[face.vertexes[2]].x - object.vertexes[face.vertexes[1]].x, 
                y : object.vertexes[face.vertexes[2]].y - object.vertexes[face.vertexes[1]].y, 
                z : object.vertexes[face.vertexes[2]].z - object.vertexes[face.vertexes[1]].z 
            };
            //  法線ベクトルの算出
            const n = { x : e1.y*e2.z - e1.z*e2.y, y : e1.z*e2.x - e1.x*e2.z, z : e1.x*e2.y - e1.y*e2.x };
            //  視線ベクトルと法線ベクトルの内積
            const vn = v.x*n.x + v.y*n.y + v.z*n.z;
            face.normal = vn < 0 ? 1 : (vn == 0 ? 0 : -1); 
            //　面の濃淡を計算
            const ct = -vn/(Math.sqrt(n.x*n.x + n.y*n.y + n.z*n.z)*vnorm);
            face.shading = 0.5*(ct + 1.0);
        }

        // 面のビュー変換と投影変換
        for (let face of object.faces) {
            if (face.normal > 0) {
                const s0 = viewingConversion(object.vertexes[face.vertexes[0]], _vertexf, cosalpha, sinalpha, cosbeta, sinbeta, cosgamma, singamma);
                const s1 = viewingConversion(object.vertexes[face.vertexes[1]], _vertexf, cosalpha, sinalpha, cosbeta, sinbeta, cosgamma, singamma);
                const s2 = viewingConversion(object.vertexes[face.vertexes[2]], _vertexf, cosalpha, sinalpha, cosbeta, sinbeta, cosgamma, singamma);
                picture.object.push({ X0 : _hr*s0.x, Y0 : _hr*s0.y, X1 : _hr*s1.x, Y1 : _hr*s1.y, X2 : _hr*s2.x, Y2 : _hr*s2.y, shading : face.shading });
            }
        }
    }
    
    return picture;
}


//*****************************************************************************
// .plyファイルからオブジェクトを読み込む関数
//*****************************************************************************
const loadObjectFromPly = (_rowdata) => {
    //  頂点数，面の個数の読み込み
    let vertexnum = 0;              //  頂点の個数
    let facenum = 0;                //  面の個数
    let propertynum = 0;            //  プロパティの個数
    let headernum = 0;              //  ヘッダー部分の行数

    const splitdatas = _rowdata.split(/\r\n|\r|\n/);
    for (let splitdata of splitdatas) {
        headernum++;
        let linedatas = splitdata.split(/\s+/);
        if (linedatas[0] == 'element' && linedatas[1] == 'vertex') {
            vertexnum = parseInt(linedatas[2]);
        } else if (linedatas[0] == 'element' && linedatas[1] == 'face') {
            facenum = parseInt(linedatas[2]);
        } else if (linedatas[0] == 'property') {
            propertynum++;
        } else if (linedatas[0] == 'end_header') {
            break;
        }
    }

    //  頂点座標の読み込み
    let vertexes = new Array();     //  オブジェクトの節点配列
    for (let splitdata of splitdatas.slice(headernum, headernum + vertexnum)) {
        let linedatas = splitdata.split(/\s+/);
        vertexes.push({ x : parseFloat(linedatas[0]), y : parseFloat(linedatas[1]), z : parseFloat(linedatas[2]) });
    }

    //  面の読み込み
    let faces = new Array();        //  オブジェクトの面配列
    for (let splitdata of splitdatas.slice(headernum + vertexnum, headernum + vertexnum + facenum)) {
        let linedatas = splitdata.split(/\s+/);
        faces.push({ vertexes : [ parseInt(linedatas[1]), parseInt(linedatas[2]), parseInt(linedatas[3]) ], normal : 1, shading : 1 });
    }

    return { vertexes : vertexes, faces : faces };
}


//*****************************************************************************
//  描画関数
//*****************************************************************************
const drawObject = (_svg, _color, _picture) => {
    while (_svg.firstChild) {
        _svg.removeChild(_svg.firstChild);
    }
    
    const TX = 0.5*parseInt(_svg.getAttribute("width"));
    const TY = 0.5*parseInt(_svg.getAttribute("height"));

    // draw x-y
    const plnorm = 50.0;

    let plane = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    plane.setAttributeNS(null, "points",
        `${parseInt(TX + plnorm*_picture.plane[0].X)},${parseInt(TY - plnorm*_picture.plane[0].Y)}
         ${parseInt(TX + plnorm*_picture.plane[1].X)},${parseInt(TY - plnorm*_picture.plane[1].Y)}
         ${parseInt(TX + plnorm*_picture.plane[2].X)},${parseInt(TY - plnorm*_picture.plane[2].Y)}
         ${parseInt(TX + plnorm*_picture.plane[3].X)},${parseInt(TY - plnorm*_picture.plane[3].Y)}`
    );
    plane.setAttributeNS(null, "fill", "#808080");
    plane.setAttributeNS(null, "stroke-width", 1);
    plane.setAttributeNS(null, "stroke", "#808080");
    _svg.appendChild(plane);

    // draw coordinate
    const colorlist = [ "#FF0000", "#00FF00", "#0000FF" ];
    const conorm = 50.0;

    for (let i = 0; i < 3; i++) {
        let line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttributeNS(null, "x1", parseInt(TX + conorm*_picture.coordinate[i].X0));
        line.setAttributeNS(null, "y1", parseInt(TY - conorm*_picture.coordinate[i].Y0));
        line.setAttributeNS(null, "x2", parseInt(TX + conorm*_picture.coordinate[i].X1));
        line.setAttributeNS(null, "y2", parseInt(TY - conorm*_picture.coordinate[i].Y1));
        line.setAttributeNS(null, "stroke", colorlist[i]);
        _svg.appendChild(line);
    }

    // draw object
    const R0 = parseInt(_color.substring(1, 3), 16);
    const G0 = parseInt(_color.substring(3, 5), 16);
    const B0 = parseInt(_color.substring(5, 7), 16);
    
    for (let face of _picture.object) {
        const R = ("0" + parseInt(R0*face.shading).toString(16)).slice(-2);
        const G = ("0" + parseInt(G0*face.shading).toString(16)).slice(-2);
        const B = ("0" + parseInt(B0*face.shading).toString(16)).slice(-2);

        let triangle = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        triangle.setAttributeNS(null, "points",
            `${parseInt(TX + face.X0)},${parseInt(TY - face.Y0)}
             ${parseInt(TX + face.X1)},${parseInt(TY - face.Y1)}
             ${parseInt(TX + face.X2)},${parseInt(TY - face.Y2)}`
        );
        triangle.setAttributeNS(null, "fill", `#${R}${G}${B}`);
        triangle.setAttributeNS(null, "stroke-width", 1);
        triangle.setAttributeNS(null, "stroke", `#${R}${G}${B}`);
        _svg.appendChild(triangle);
    }
}


//*****************************************************************************
//  描画パラメータ変更イベント関数
//*****************************************************************************
const onChangeParams = async () => {
    const vertexa = { x : parseFloat($input_ax.value), y : parseFloat($input_ay.value), z : parseFloat($input_az.value) };
    drawObject($svg, $input_c.value, convertObject(objects, pv, vertexa, mouseT, ey));
}


//*****************************************************************************
//  ファイル読み込みイベント関数
//*****************************************************************************
$input_file.addEventListener('change', onChangeFile = async (e) => {
    if (e.target.files.length) {
        const reader = new FileReader();
        reader.readAsText(e.target.files[0]);

        reader.onload = function() {
            objects.push(loadObjectFromPly(reader.result));
            onChangeParams();
        };
    }
}, false);


//*****************************************************************************
//  マウスムーブイベント関数
//*****************************************************************************
$svg.addEventListener('mousemove', onMove = (e) => {
    if (e.buttons === 1 || e.witch === 1) {
        const X = e.clientX - mouseX;
        const Y = mouseY - e.clientY;

        if (X*X + Y*Y >= 10) {
            //　視点座標と注視点座標の取得
            const a = { x : parseFloat($input_ax.value), y : parseFloat($input_ay.value), z : parseFloat($input_az.value) };
            
            //　カメラ基底ベクトルの生成
            const ez = { x : pv.x - a.x, y : pv.y - a.y, z : pv.z - a.z };
            const ex = { x : ey.y*ez.z - ey.z*ez.y, y : ey.z*ez.x - ey.x*ez.z, z : ey.x*ez.y - ey.y*ez.x };

            //　マウスの移動方向ベクトル
            let n = { x : X*ex.x + Y*ey.x, y : X*ex.y + Y*ey.y, z : X*ex.z + Y*ey.z };
            const nnorm = Math.sqrt(n.x*n.x + n.y*n.y + n.z*n.z);
            n.x /= nnorm;
            n.y /= nnorm;
            n.z /= nnorm;
            
            //　回転軸ベクトル
            let r = { x : n.y*ez.z - n.z*ez.y, y : n.z*ez.x - n.x*ez.z, z : n.x*ez.y - n.y*ez.x };
            const rnorm = Math.sqrt(r.x*r.x + r.y*r.y + r.z*r.z);
            r.x /= rnorm;
            r.y /= rnorm;
            r.z /= rnorm;
            
            //　視線ベクトルを回転
            const theta = 2.0*Math.PI/180.0;
            const rdotv = r.x*ez.x + r.y*ez.y + r.z*ez.z;
            pv.x = ez.x*Math.cos(theta) + (r.y*ez.z - r.z*ez.y)*Math.sin(theta) + r.x*rdotv*(1.0 - Math.cos(theta)) + a.x;
            pv.y = ez.y*Math.cos(theta) + (r.z*ez.x - r.x*ez.z)*Math.sin(theta) + r.y*rdotv*(1.0 - Math.cos(theta)) + a.y;
            pv.z = ez.z*Math.cos(theta) + (r.x*ez.y - r.y*ez.x)*Math.sin(theta) + r.z*rdotv*(1.0 - Math.cos(theta)) + a.z;

            //　カメラの基底ベクトルを更新
            const rdotw = r.x*ey.x + r.y*ey.y + r.z*ey.z;
            const tmpx = ey.x*Math.cos(theta) + (r.y*ey.z - r.z*ey.y)*Math.sin(theta) + r.x*rdotw*(1.0 - Math.cos(theta));
            const tmpy = ey.y*Math.cos(theta) + (r.z*ey.x - r.x*ey.z)*Math.sin(theta) + r.y*rdotw*(1.0 - Math.cos(theta));
            const tmpz = ey.z*Math.cos(theta) + (r.x*ey.y - r.y*ey.x)*Math.sin(theta) + r.z*rdotw*(1.0 - Math.cos(theta));
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
}, false);


//*****************************************************************************
//  マウスクリックイベント関数
//*****************************************************************************
$svg.addEventListener('mousedown', onClick = (e) => {
    if (e.witch === 1) {
        mouseX = e.clientX;
        mouseY = e.clientY;
    }
}, false);


//*****************************************************************************
//  マウスホイールイベント関数
//*****************************************************************************
$svg.addEventListener('mousewheel', onWheel = (e) => {
    mouseT += 10*e.wheelDelta/120;
    onChangeParams();
}, false);