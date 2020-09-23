const fs = require('fs');
const Canvas = require('canvas');

// Context生成
let image = Canvas.image;
let canvas = Canvas.createCanvas(200,200);
let ctx = canvas.getContext('2d');

// 文字描画
ctx.font = '30px "Lato"';
ctx.rotate(.1);
ctx.fillText('Canvas', 50, 100);

// ライン描画
let te = ctx.measureText('Canvas');
ctx.stroke.style = 'rgba(0,0,0,0.7)'
ctx.beginPath();
ctx.lineTo(50,102);
ctx.lineTo(50 + te.width, 102);
ctx.stroke();

// 書き出し
canvas.toBuffer((err, buf)=>{
    fs.writeFile("image.png", buf, (err)=>{
        if(err) console.log(`error!::${err}`);
    });
});