const fs = require('fs');
const Canvas = require('canvas');

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
faces.push([ 0, 1, 5 ]);
faces.push([ 1, 4, 5 ]);
faces.push([ 1, 2, 4 ]);
faces.push([ 2, 3, 4 ]);
faces.push([ 2, 6, 3 ]); 
faces.push([ 3, 6, 11 ]); 
faces.push([ 4, 3, 11 ]);
faces.push([ 4, 11, 10 ]); 
faces.push([ 5, 4, 10 ]); 
faces.push([ 5, 10, 9 ]); 
faces.push([ 0, 5, 9 ]); 
faces.push([ 0, 9, 8 ]); 
faces.push([ 1, 7, 6 ]); 
faces.push([ 1, 6, 2 ]); 
faces.push([ 0, 8, 7 ]); 
faces.push([ 0, 7, 1 ]); 
faces.push([ 10, 11, 6 ]); 
faces.push([ 10, 6, 7 ]); 
faces.push([ 8, 9, 7 ]); 
faces.push([ 9, 10, 7 ]);

var normal = new Array(faces.length); 

//  条件設定
var TX = 100;
var TY = 100;
var vertexf = { x : 3.0, y : 4.0, z : 7.0 };    //  視点の位置
var vertexa = { x : 0.0, y : 0.0, z : 0.0 };    //  注視点の位置は原点
var h = 1.0;                                    //  投影面までの距離
var r = 400;
//  透視変換係数の算出
var w1 = vertexa.x - vertexf.x;
var w2 = vertexf.y - vertexa.y;
var w3 = vertexf.z - vertexa.z;
var a = w1*w1 + w3*w3;
var b = Math.sqrt(a + w2*w2);
var c = Math.sqrt(a);
var ctheta = w3/c;
var stheta = w1/c;
var cphi = c/b; 
var sphi = w2/b;

// 陰面処理
for (var i = 0; i < faces.length; i++) {
    var p0 = faces[i][0];    
    var p1 = faces[i][1];
    var p2 = faces[i][2];
    //  稜線ベクトルの算出
    var e1x = vertexes[p1].x - vertexes[p0].x;  
    var e1y = vertexes[p1].y - vertexes[p0].y;  
    var e1z = vertexes[p1].z - vertexes[p0].z;
    var e2x = vertexes[p2].x - vertexes[p1].x;  
    var e2y = vertexes[p2].y - vertexes[p1].y;  
    var e2z = vertexes[p2].z - vertexes[p1].z;
    //  法線ベクトルの算出
    var nx = e1y*e2z - e1z*e2y;
    var ny = e1z*e2x - e1x*e2z;
    var nz = e1x*e2y - e1y*e2x;
    //  視線ベクトルの算出
    var vx = vertexf.x - vertexa.x;
    var vy = vertexf.y - vertexa.y;
    var vz = vertexf.z - vertexa.z;
    //  視線ベクトルと法線ベクトルの内積
    var vn = vx*nx + vy*ny + vz*nz;
    normal[i] = vn > 0 ? 1 : (vn == 0 ? 0 : -1); 
}

//  グラフィックス描画
for (var i = 0; i < faces.length; i++) {
    if (normal[i] > 0) {
        for (var j = 0; j < 3; j++) {
            // 始点の計算
            var p0 = faces[i][j];
            var xe0 = (vertexes[p0].x - vertexf.x)*ctheta + (vertexes[p0].z - vertexf.z)*stheta;
            var ye0 = (vertexes[p0].x - vertexf.x)*stheta*sphi + (vertexes[p0].y - vertexf.y)*cphi - (vertexes[p0].z - vertexf.z)*ctheta*sphi;
            var ze0 = (vertexes[p0].x - vertexf.x)*stheta*cphi - (vertexes[p0].y - vertexf.y)*sphi - (vertexes[p0].z - vertexf.z)*ctheta*cphi;
            var X0 = parseInt(h*xe0/ze0*r);
            var Y0 = parseInt(h*ye0/ze0*r);

            // 終点の計算
            var p1 = faces[i][(j + 1)%3];
            var xe1 = (vertexes[p1].x - vertexf.x)*ctheta + (vertexes[p1].z - vertexf.z)*stheta;
            var ye1 = (vertexes[p1].x - vertexf.x)*stheta*sphi + (vertexes[p1].y - vertexf.y)*cphi - (vertexes[p1].z - vertexf.z)*ctheta*sphi;
            var ze1 = (vertexes[p1].x - vertexf.x)*stheta*cphi - (vertexes[p1].y - vertexf.y)*sphi - (vertexes[p1].z - vertexf.z)*ctheta*cphi;
            var X1 = parseInt(h*xe1/ze1*r);
            var Y1 = parseInt(h*ye1/ze1*r);

            // ライン描画
            ctx.beginPath();
            ctx.moveTo(X0 + TX, -Y0 + TY);
            ctx.lineTo(X1 + TX, -Y1 + TY);
            ctx.stroke();
        }
    }
}

// 書き出し
canvas.toBuffer((err, buf)=>{
    fs.writeFile("image.png", buf, (err)=>{
        if(err) console.log(`error!::${err}`);
    });
});