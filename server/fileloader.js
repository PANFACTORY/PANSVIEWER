// .plyファイルからオブジェクトを読み込む関数
exports.loadObjectFromPly = function (_rowdata) {
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

    return [ vertexes, faces ];
}