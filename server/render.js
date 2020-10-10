//*****************************************************************************
//  Title       :   server/render.js
//  Author      :   Tanabe Yuta
//  Date        :   2020/10/10
//  Copyright   :   (C)2020 TanabeYuta
//*****************************************************************************


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
exports.convertObject = (_vertexes, _faces, _vertexf, _vertexa, _hr, _ey) => {
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

    // 陰面処理と濃淡計算
    for (let face of _faces) {
        //  稜線ベクトルの算出
        const e1 = { 
            x : _vertexes[face.vertexes[1]].x - _vertexes[face.vertexes[0]].x, 
            y : _vertexes[face.vertexes[1]].y - _vertexes[face.vertexes[0]].y, 
            z : _vertexes[face.vertexes[1]].z - _vertexes[face.vertexes[0]].z 
        };
        const e2 = { 
            x : _vertexes[face.vertexes[2]].x - _vertexes[face.vertexes[1]].x, 
            y : _vertexes[face.vertexes[2]].y - _vertexes[face.vertexes[1]].y, 
            z : _vertexes[face.vertexes[2]].z - _vertexes[face.vertexes[1]].z 
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
    for (let face of _faces) {
        if (face.normal > 0) {
            const s0 = viewingConversion(_vertexes[face.vertexes[0]], _vertexf, cosalpha, sinalpha, cosbeta, sinbeta, cosgamma, singamma);
            const s1 = viewingConversion(_vertexes[face.vertexes[1]], _vertexf, cosalpha, sinalpha, cosbeta, sinbeta, cosgamma, singamma);
            const s2 = viewingConversion(_vertexes[face.vertexes[2]], _vertexf, cosalpha, sinalpha, cosbeta, sinbeta, cosgamma, singamma);
            picture.object.push({ X0 : _hr*s0.x, Y0 : _hr*s0.y, X1 : _hr*s1.x, Y1 : _hr*s1.y, X2 : _hr*s2.x, Y2 : _hr*s2.y, shading : face.shading });
        }
    }

    return picture;
}