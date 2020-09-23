const fs = require('fs');
const Canvas = require('canvas');

// 座標変換関数
function convertVertex(_vertex, _vertexf, _ctheta, _stheta, _cphi, _sphi) {
    var xe0 = (_vertex.x - _vertexf.x)*_ctheta + (_vertex.z - _vertexf.z)*_stheta;
    var ye0 = (_vertex.x - _vertexf.x)*_stheta*_sphi + (_vertex.y - _vertexf.y)*_cphi - (_vertex.z - _vertexf.z)*_ctheta*_sphi;
    var ze0 = (_vertex.x - _vertexf.x)*_stheta*_cphi - (_vertex.y - _vertexf.y)*_sphi - (_vertex.z - _vertexf.z)*_ctheta*_cphi;
    return { x : xe0, y : ye0, z : ze0 }
}

// オブジェクト描画関数
function drawObject(_ctx, _TX, _TY, _vertexes, _faces, _vertexf, _vertexa, _h, _r) {
    //  透視変換係数の算出
    var w1 = _vertexa.x - _vertexf.x;
    var w2 = _vertexf.y - _vertexa.y;
    var w3 = _vertexf.z - _vertexa.z;
    var a = w1*w1 + w3*w3;
    var b = Math.sqrt(a + w2*w2);
    var c = Math.sqrt(a);
    var ctheta = w3/c;
    var stheta = w1/c;
    var cphi = c/b; 
    var sphi = w2/b;

    // 陰面処理
    for (var face of _faces) {
        //  稜線ベクトルの算出
        var e1x = _vertexes[face.vertexes[1]].x - _vertexes[face.vertexes[0]].x;  
        var e1y = _vertexes[face.vertexes[1]].y - _vertexes[face.vertexes[0]].y;  
        var e1z = _vertexes[face.vertexes[1]].z - _vertexes[face.vertexes[0]].z;
        var e2x = _vertexes[face.vertexes[2]].x - _vertexes[face.vertexes[1]].x;  
        var e2y = _vertexes[face.vertexes[2]].y - _vertexes[face.vertexes[1]].y;  
        var e2z = _vertexes[face.vertexes[2]].z - _vertexes[face.vertexes[1]].z;
        //  法線ベクトルの算出
        var nx = e1y*e2z - e1z*e2y;
        var ny = e1z*e2x - e1x*e2z;
        var nz = e1x*e2y - e1y*e2x;
        //  視線ベクトルの算出
        var vx = _vertexf.x - _vertexa.x;
        var vy = _vertexf.y - _vertexa.y;
        var vz = _vertexf.z - _vertexa.z;
        //  視線ベクトルと法線ベクトルの内積
        var vn = vx*nx + vy*ny + vz*nz;
        face.normal = vn > 0 ? 1 : (vn == 0 ? 0 : -1); 
    }

    //  スクリーンへの投影と描画
    for (var face of _faces) {
        if (face.normal > 0) {
            for (var j = 0; j < 3; j++) {
                // 始点の計算
                var vertexe0 = convertVertex(_vertexes[face.vertexes[j]], _vertexf, ctheta, stheta, cphi, sphi);
                var X0 = parseInt(_h*vertexe0.x/vertexe0.z*_r);
                var Y0 = parseInt(_h*vertexe0.y/vertexe0.z*_r);

                // 終点の計算
                var vertexe1 = convertVertex(_vertexes[face.vertexes[(j + 1)%3]], _vertexf, ctheta, stheta, cphi, sphi);
                var X1 = parseInt(_h*vertexe1.x/vertexe1.z*_r);
                var Y1 = parseInt(_h*vertexe1.y/vertexe1.z*_r);

                // ライン描画svgを使用したほうが良い？
                _ctx.beginPath();
                _ctx.moveTo(X0 + TX, -Y0 + TY);
                _ctx.lineTo(X1 + TX, -Y1 + TY);
                _ctx.stroke();
            }
        }
    }
}

// Context生成
let image = Canvas.image;
let canvas = Canvas.createCanvas(200,200);
let ctx = canvas.getContext('2d');

// オブジェクトの座標
var vertexes = new Array();
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

var faces = new Array();
faces.push({ vertexes : [ 0, 1, 5 ], normal : 1});
faces.push({ vertexes : [ 1, 4, 5 ], normal : 1});
faces.push({ vertexes : [ 1, 2, 4 ], normal : 1});
faces.push({ vertexes : [ 2, 3, 4 ], normal : 1});
faces.push({ vertexes : [ 2, 6, 3 ], normal : 1}); 
faces.push({ vertexes : [ 3, 6, 11 ], normal : 1}); 
faces.push({ vertexes : [ 4, 3, 11 ], normal : 1});
faces.push({ vertexes : [ 4, 11, 10 ], normal : 1}); 
faces.push({ vertexes : [ 5, 4, 10 ], normal : 1}); 
faces.push({ vertexes : [ 5, 10, 9 ], normal : 1}); 
faces.push({ vertexes : [ 0, 5, 9 ], normal : 1}); 
faces.push({ vertexes : [ 0, 9, 8 ], normal : 1}); 
faces.push({ vertexes : [ 1, 7, 6 ], normal : 1}); 
faces.push({ vertexes : [ 1, 6, 2 ], normal : 1}); 
faces.push({ vertexes : [ 0, 8, 7 ], normal : 1}); 
faces.push({ vertexes : [ 0, 7, 1 ], normal : 1}); 
faces.push({ vertexes : [ 10, 11, 6 ], normal : 1}); 
faces.push({ vertexes : [ 10, 6, 7 ], normal : 1}); 
faces.push({ vertexes : [ 8, 9, 7 ], normal : 1}); 
faces.push({ vertexes : [ 9, 10, 7 ], normal : 1});

//  条件設定
var TX = 100;
var TY = 100;
var vertexf = { x : 3.0, y : 4.0, z : 7.0 };    //  視点の位置
var vertexa = { x : 0.0, y : 0.0, z : 0.0 };    //  注視点の位置は原点
var h = 1.0;                                    //  投影面までの距離
var r = 400;

// オブジェクトの描画
drawObject(ctx, TX, TY, vertexes, faces, vertexf, vertexa, h, r);

// 書き出し
canvas.toBuffer((err, buf)=>{
    fs.writeFile("image.png", buf, (err)=>{
        if(err) console.log(`error!::${err}`);
    });
});