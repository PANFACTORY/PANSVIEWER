// ビュー変換
function viewingConversion(_vertex, _vertexf, _ctheta, _stheta, _cphi, _sphi) {
    const xe0 = (_vertex.x - _vertexf.x)*_ctheta + (_vertex.z - _vertexf.z)*_stheta;
    const ye0 = (_vertex.x - _vertexf.x)*_stheta*_sphi + (_vertex.y - _vertexf.y)*_cphi - (_vertex.z - _vertexf.z)*_ctheta*_sphi;
    const ze0 = (_vertex.x - _vertexf.x)*_stheta*_cphi - (_vertex.y - _vertexf.y)*_sphi - (_vertex.z - _vertexf.z)*_ctheta*_cphi;
    return { x : xe0, y : ye0, z : ze0 }
}

// オブジェクト2D化関数
exports.convertObject = function (_vertexes, _faces, _vertexf, _vertexa, _hr) {
    //　描画用座標配列
    let picture = { coordinate : new Array(), object : new Array() };

    //  ビュー変換係数の算出
    const vx = _vertexa.x - _vertexf.x;
    const vy = _vertexa.y - _vertexf.y;
    const vz = _vertexa.z - _vertexf.z;
    const vx2vz2 = vx*vx + vz*vz;
    const vnorm = Math.sqrt(vx2vz2 + vy*vy);
    const sqrtvx2vz2 = Math.sqrt(vx2vz2);
    const cosalpha = -vz/sqrtvx2vz2;
    const sinalpha = vx/sqrtvx2vz2;
    const cosbeta = sqrtvx2vz2/vnorm;
    const sinbeta = -vy/vnorm;

    // 座標軸
    const e0 = viewingConversion({ x : 0.0, y : 0.0, z : 0.0 }, _vertexf, cosalpha, sinalpha, cosbeta, sinbeta);
    picture.coordinate.push({ X : e0.x/e0.z, Y : e0.y/e0.z });
    const ex = viewingConversion({ x : 1.0, y : 0.0, z : 0.0 }, _vertexf, cosalpha, sinalpha, cosbeta, sinbeta);
    picture.coordinate.push({ X : ex.x/ex.z, Y : ex.y/ex.z });
    const ey = viewingConversion({ x : 0.0, y : 1.0, z : 0.0 }, _vertexf, cosalpha, sinalpha, cosbeta, sinbeta);
    picture.coordinate.push({ X : ey.x/ey.z, Y : ey.y/ey.z });
    const ez = viewingConversion({ x : 0.0, y : 0.0, z : 1.0 }, _vertexf, cosalpha, sinalpha, cosbeta, sinbeta);
    picture.coordinate.push({ X : ez.x/ez.z, Y : ez.y/ez.z });

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
        //  視線ベクトルと法線ベクトルの内積
        const vn = vx*nx + vy*ny + vz*nz;
        face.normal = vn < 0 ? 1 : (vn == 0 ? 0 : -1); 
        //　面の濃淡を計算
        const ct = -vn/(Math.sqrt(nx*nx + ny*ny + nz*nz)*vnorm);
        face.shading = (ct + 1.0)/2.0;
    }

    // 面のビュー変換と投影変換
    for (let face of _faces) {
        if (face.normal > 0) {
            // 0番目の頂点座標を計算
            const vertexe0 = viewingConversion(_vertexes[face.vertexes[0]], _vertexf, cosalpha, sinalpha, cosbeta, sinbeta);
            const X0 = parseInt(_hr*vertexe0.x/vertexe0.z);
            const Y0 = parseInt(_hr*vertexe0.y/vertexe0.z);

            // 1番目の頂点座標を計算
            const vertexe1 = viewingConversion(_vertexes[face.vertexes[1]], _vertexf, cosalpha, sinalpha, cosbeta, sinbeta);
            const X1 = parseInt(_hr*vertexe1.x/vertexe1.z);
            const Y1 = parseInt(_hr*vertexe1.y/vertexe1.z);

            // 2番目の頂点座標を計算
            const vertexe2 = viewingConversion(_vertexes[face.vertexes[2]], _vertexf, cosalpha, sinalpha, cosbeta, sinbeta);
            const X2 = parseInt(_hr*vertexe2.x/vertexe2.z);
            const Y2 = parseInt(_hr*vertexe2.y/vertexe2.z);
            
            // 計算した座標と濃淡を書き出す
            picture.object.push({ X0 : X0, Y0 : Y0, X1 : X1, Y1 : Y1, X2 : X2, Y2 : Y2, shading : face.shading });
        }
    }

    return picture;
}