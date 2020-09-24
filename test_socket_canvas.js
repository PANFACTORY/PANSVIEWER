const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 7000;

// 座標変換関数
function convertVertex(_vertex, _vertexf, _ctheta, _stheta, _cphi, _sphi) {
    const xe0 = (_vertex.x - _vertexf.x)*_ctheta + (_vertex.z - _vertexf.z)*_stheta;
    const ye0 = (_vertex.x - _vertexf.x)*_stheta*_sphi + (_vertex.y - _vertexf.y)*_cphi - (_vertex.z - _vertexf.z)*_ctheta*_sphi;
    const ze0 = (_vertex.x - _vertexf.x)*_stheta*_cphi - (_vertex.y - _vertexf.y)*_sphi - (_vertex.z - _vertexf.z)*_ctheta*_cphi;
    return { x : xe0, y : ye0, z : ze0 }
}

// オブジェクト描画関数
function drawObject(_vertexes, _faces, _vertexf, _vertexa, _h, _r) {
    //　描画用座標配列
    let points = new Array();

    //  透視変換係数の算出
    const w1 = _vertexa.x - _vertexf.x;
    const w2 = _vertexf.y - _vertexa.y;
    const w3 = _vertexf.z - _vertexa.z;
    const a = w1*w1 + w3*w3;
    const b = Math.sqrt(a + w2*w2);
    const c = Math.sqrt(a);
    const ctheta = w3/c;
    const stheta = w1/c;
    const cphi = c/b; 
    const sphi = w2/b;

    // 陰面処理と濃淡計算
    for (let face of _faces) {
        //  稜線ベクトルの算出
        const e1x = _vertexes[face.vertexes[1]].x - _vertexes[face.vertexes[0]].x;  
        const e1y = _vertexes[face.vertexes[1]].y - _vertexes[face.vertexes[0]].y;  
        const e1z = _vertexes[face.vertexes[1]].z - _vertexes[face.vertexes[0]].z;
        const e2x = _vertexes[face.vertexes[2]].x - _vertexes[face.vertexes[1]].x;  
        const e2y = _vertexes[face.vertexes[2]].y - _vertexes[face.vertexes[1]].y;  
        const e2z = _vertexes[face.vertexes[2]].z - _vertexes[face.vertexes[1]].z;
        //  法線ベクトルの算出
        const nx = e1y*e2z - e1z*e2y;
        const ny = e1z*e2x - e1x*e2z;
        const nz = e1x*e2y - e1y*e2x;
        //  視線ベクトルの算出
        const vx = _vertexf.x - _vertexa.x;
        const vy = _vertexf.y - _vertexa.y;
        const vz = _vertexf.z - _vertexa.z;
        //  視線ベクトルと法線ベクトルの内積
        const vn = vx*nx + vy*ny + vz*nz;
        face.normal = vn > 0 ? 1 : (vn == 0 ? 0 : -1); 
        //　面の濃淡を計算
        const ct = vn/(Math.sqrt(nx*nx + ny*ny + nz*nz)*Math.sqrt(vx*vx + vy*vy + vz*vz));
        face.shading = (ct + 1.0)/2.0;
    }

    //  スクリーンへの投影と描画
    for (let face of _faces) {
        if (face.normal > 0) {
            // 0番目の頂点座標を計算
            const vertexe0 = convertVertex(_vertexes[face.vertexes[0]], _vertexf, ctheta, stheta, cphi, sphi);
            const X0 = parseInt(_h*vertexe0.x/vertexe0.z*_r);
            const Y0 = parseInt(_h*vertexe0.y/vertexe0.z*_r);

            // 1番目の頂点座標を計算
            const vertexe1 = convertVertex(_vertexes[face.vertexes[1]], _vertexf, ctheta, stheta, cphi, sphi);
            const X1 = parseInt(_h*vertexe1.x/vertexe1.z*_r);
            const Y1 = parseInt(_h*vertexe1.y/vertexe1.z*_r);

            // 2番目の頂点座標を計算
            const vertexe2 = convertVertex(_vertexes[face.vertexes[2]], _vertexf, ctheta, stheta, cphi, sphi);
            const X2 = parseInt(_h*vertexe2.x/vertexe2.z*_r);
            const Y2 = parseInt(_h*vertexe2.y/vertexe2.z*_r);
            
            // 計算した座標と濃淡をJSONに書き出す
            points.push({ X0 : X0, Y0 : -Y0, X1 : X1, Y1 : -Y1, X2 : X2, Y2 : -Y2, shading : face.shading });
        }
    }

    return JSON.stringify(points);
}

// オブジェクトの座標
let vertexes = new Array();
vertexes.push({ x : 1, y : 0, z : 2 });
vertexes.push({ x : 1, y : 0, z : 0 });
vertexes.push({ x : 1, y : 2, z : 0 });
vertexes.push({ x : 1, y : 2, z : 1 });
vertexes.push({ x : 1, y : 1, z : 1 });
vertexes.push({ x : 1, y : 1, z : 2 });
vertexes.push({ x : 0, y : 2, z : 0 });
vertexes.push({ x : 0, y : 0, z : 0 });
vertexes.push({ x : 0, y : 0, z : 2 });
vertexes.push({ x : 0, y : 1, z : 2 });
vertexes.push({ x : 0, y : 1, z : 1 });
vertexes.push({ x : 0, y : 2, z : 1 });

let faces = new Array();
faces.push({ vertexes : [ 0, 1, 5 ], normal : 1, shading : 1 });
faces.push({ vertexes : [ 1, 4, 5 ], normal : 1, shading : 1 });
faces.push({ vertexes : [ 1, 2, 4 ], normal : 1, shading : 1 });
faces.push({ vertexes : [ 2, 3, 4 ], normal : 1, shading : 1 });
faces.push({ vertexes : [ 2, 6, 3 ], normal : 1, shading : 1 }); 
faces.push({ vertexes : [ 3, 6, 11 ], normal : 1, shading : 1 }); 
faces.push({ vertexes : [ 4, 3, 11 ], normal : 1, shading : 1 });
faces.push({ vertexes : [ 4, 11, 10 ], normal : 1, shading : 1 }); 
faces.push({ vertexes : [ 5, 4, 10 ], normal : 1, shading : 1 }); 
faces.push({ vertexes : [ 5, 10, 9 ], normal : 1, shading : 1 }); 
faces.push({ vertexes : [ 0, 5, 9 ], normal : 1, shading : 1 }); 
faces.push({ vertexes : [ 0, 9, 8 ], normal : 1, shading : 1 }); 
faces.push({ vertexes : [ 1, 7, 6 ], normal : 1, shading : 1 }); 
faces.push({ vertexes : [ 1, 6, 2 ], normal : 1, shading : 1 }); 
faces.push({ vertexes : [ 0, 8, 7 ], normal : 1, shading : 1 }); 
faces.push({ vertexes : [ 0, 7, 1 ], normal : 1, shading : 1 }); 
faces.push({ vertexes : [ 10, 11, 6 ], normal : 1, shading : 1 }); 
faces.push({ vertexes : [ 10, 6, 7 ], normal : 1, shading : 1 }); 
faces.push({ vertexes : [ 8, 9, 7 ], normal : 1, shading : 1 }); 
faces.push({ vertexes : [ 9, 10, 7 ], normal : 1, shading : 1 });

//  条件設定
let vertexf = { x : 8.0, y : 4.0, z : 7.0 };    //  視点の位置
let vertexa = { x : 0.0, y : 0.0, z : 0.0 };    //  注視点の位置は原点
let h = 1.0;                                    //  投影面までの距離
let r = 400;

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/docs/index2.html');
});

io.on('connection', function(socket) {
    socket.on('message', function(msg) {
        io.emit('message', drawObject(vertexes, faces, vertexf, vertexa, h, r));
    });
});

http.listen(PORT, function() {
    console.log('server listening. Port:' + PORT);
});