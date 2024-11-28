class Hexamond{
    constructor(canvas){
        //Define Canvas
		this.canvas = new HexaCanvas(canvas);
        this.redrawBoard();

        //StartSolving
        while(true){
            this.resetTiles();
            this.defineParameters();
            if(this.solve()=="success") break;
        }
    }
    //-----------------------------------[RedrawBoard/Functions]----------------------------------------
    redrawBoard(){
        //Draw to test
        this.canvas.fillAll("white");
        this.canvas.strokeColor("black");
        this.canvas.lineWidth(2);
        this.canvas.drawRect();

        this.canvas.strokeColor("black");
        this.canvas.lineWidth(3);
        this.canvas.drawFrame();
    }
    xyz2i(x,y,z){
        return x + y * 8 + z * 56;
    }
    i2xyz(i){
        const x = i%8;
        i = (i-i%8)/8;
        const y = i % 7;
        i = (i - i % 7)/7;
        const z = i%2;
        return [x, y, z]; 
    }
    hopper(xyz, dir){
        //Given a point(xyz) and direction, it shows where to hop
        let dxyz = this.dirMatrix[Math.abs(dir)];
        const newXyz = xyz.map((p,i)=>p+dxyz[i]);
        return newXyz;
    }
    //-----------------------------------[ResetTiles]----------------------------------------
    resetTiles(){
        //-2:Out of board
        //-1:Open space
        // 0~11:Tiles placed
        this.tiles = Array(112).fill(-1);

        //Define "out of board"
        for(let i = 0; i < 112; i++){
            const [x, y, z] = this.i2xyz(i);
            if(x - y - z > 3) this.tiles[i] = -2;
            if(y - x + z > 3) this.tiles[i] = -2;
        }
        this.tiles[this.xyz2i(3,0,0)] = -2;
        this.tiles[this.xyz2i(4,0,1)] = -2;
        this.tiles[this.xyz2i(2,5,0)] = -2;
        this.tiles[this.xyz2i(3,5,1)] = -2;
        this.tiles[this.xyz2i(3,6,0)] = -2;
        this.tiles[this.xyz2i(4,6,1)] = -2;
        this.tiles[this.xyz2i(4,6,0)] = -2;
        this.tiles[this.xyz2i(5,6,1)] = -2;
    }
    //-----------------------------------[DefineParameters]----------------------------------------
    defineParameters(){
        //DirectionMatrix
        this.dirMatrix = [
            [ 0,  0,  1],//dir=0, then dx=0, dy=0, dz=1
            [ 0,  1, -1],//each dir is off by 60deg (6*60=360)
            [ 1,  0,  1],//Add 3 to dir and direction flips
            [ 0,  0, -1],
            [ 0, -1,  1],
            [-1,  0, -1],
        ]
        //Shapes are defined as collection of directions
        //shape[0]=Directions
        //shape[1]={1:unused, 0:used}
        //shape[2]={0:simpleShape, 1:normalShape, 2:complicatedShpae}
        //To mirror, 1=1, 4=4, 0↔︎2, 3↔︎5???
        this.shapes = [
            [[0,1,0,3,2,3],1,2],
            [[0,1,0,1,0],1,0],
            [[2,3,0,1,2,5,0],1,2],
            [[0,1,0,1,2],1,0],
            [[2,1,0,1,2],1,1],
            [[2,3,2,1,2],1,0],
            [[0,1,2,3,4],1,0],
            [[2,1,0,5,0],1,2],
            [[2,1,0,5,2,1],1,2],
            [[2,1,2,1,4,3],1,1],
            [[2,1,2,5,0,1],1,1],
            [[0,1,2,5,0,1],1,1]
        ];
        this.colors = [
            "red",
            "blue",
            "cyan",
            "saddleBrown",
            "yellow",
            "green",
            "purple",
            "fuchsia",
            "gray",
            "magenta",
            "pink",
            "lime"
        ]
        this.random = Math.random();
        this.randCount = 0;
    }
    //-----------------------------------[SolvePuzzle]----------------------------------------
    solve(){
        //for(let shapeCount = 0; shapeCount < this.shapes.length; shapeCount++){
        for(let shapeCount = 0; shapeCount <this.shapes.length; shapeCount++){
            const edgeIndexToPlaceNextShape = this.findEdgeToPlace();//[Index]
            const shapePlaceArg = this.findShapeToPlace(edgeIndexToPlaceNextShape)[0];//[shapeIndex, mapXYZ, shapeStartPoint, rotation, mirror]¥
            if(shapePlaceArg=="fail"){
                return "fail";
            }else{
                this.placeShape(shapePlaceArg, shapeCount);
            }
        }
        return "success";
    }
    findEdgeToPlace(){
        //Count dead neighbors. Higher the count higher the priority
        let neighborCount = Array(112).fill(0);
        this.tiles.forEach((status,index)=>{
            if(status == -1){
                const [x,y,z] = this.i2xyz(index);
                [0,1,2].forEach((i)=>{
                    let [xn, yn, zn] = this.hopper([x,y,z],i*2 + z);
                    const neighborIndex = this.xyz2i(xn, yn, zn);
                    if(neighborIndex>=0 && neighborIndex<112){
                        if(this.tiles[neighborIndex]!=-1){
                            neighborCount[index]++;
                        }
                    }else{
                        neighborCount[index]++;
                    }
                });
            }
        });

        //Choose randomly from the candidate
        let highestValue = 0;
        neighborCount.forEach(val => highestValue = Math.max(val, highestValue));
        let indexList = [];
        let indexCount = 0;
        neighborCount.forEach((val,index)=>{
            if(val == highestValue){
                indexList[indexCount] = index;
                indexCount++;
            }
        });
        return indexList[Math.floor(Math.random()*indexCount)];
        //return indexList[Math.floor(0.6*indexCount)];
    }
    findShapeToPlace(edgeIndex){
        let candidates = [];//[arg, score]
        for(let shapeIndex = 0; shapeIndex < this.shapes.length; shapeIndex++){
            if(this.shapes[shapeIndex][1]==0)continue;
            const shape = this.shapes[shapeIndex][0];
            for(let startPoint = 0; startPoint < shape.length; startPoint++){
                for(let dir = 0; dir < 3; dir++){
                    for(let mirror = 0; mirror < 2; mirror++){
                        //Get List of index which the shape will fill
                        const xyz = this.i2xyz(edgeIndex);
                        const rotation = dir*2 + (xyz[2]+startPoint)%2;
                        const argument = [shapeIndex, xyz, startPoint,rotation,mirror];
                        const shapeFillIndexList = this.getShapeFillIndexList(...argument);

                        //Clone this.tiles
                        let tilesToScore = [...this.tiles];

                        //Check if the orientation is valid
                        let valid = 1;
                        for(let i = 0; i<shapeFillIndexList.length; i++){
                            const index = shapeFillIndexList[i]
                            if(index < 0 || index >= 112){
                                valid = 0;
                                break;
                            }else{
                                if(this.tiles[index] != -1){
                                    valid = 0;
                                    break;
                                }else{
                                    tilesToScore[index] = shapeIndex;
                                }
                            }
                        }
                        if(valid==0){
                            continue;
                        }else{
                            //If valid, then scoreBoard
                            let score = 0;
                            for(let tileIndex = 0; tileIndex<tilesToScore.length; tileIndex++){
                                if(tilesToScore[tileIndex] == -1){
                                    score += 3;
                                    for(let neighborDir = this.i2xyz(tileIndex)[2]; neighborDir < 6; neighborDir+=2){
                                        const neighborXYZ = this.hopper(this.i2xyz(tileIndex), neighborDir);
                                        const neighborIndex = this.xyz2i(...neighborXYZ);
                                        if(neighborIndex>=0 && neighborIndex <112){
                                            if(tilesToScore[neighborIndex]==-1){
                                                score -= 1;
                                            }
                                        }
                                    }
                                }
                            }
                            candidates[candidates.length] = [argument,score,shapeIndex];
                        }
                    }
                }
            }
        }
        if(candidates.length==0){
            return ["fail"];
        }else{
            let champIndex = 0;
            let bestScore = candidates[0][1];
            for(let i = 1; i < candidates.length; i++){
                const candidate = candidates[i];
                const score = candidate[1];
                if(score < bestScore){
                    champIndex = i;
                    bestScore = score;
                }else if(score == bestScore){
                    if(Math.random()>0.5){
                        champIndex = i;
                        bestScore = score;
                    }
                }
            }
            return candidates[champIndex];
        }
    }
    placeShape(shapePlaceArg, shapeCount){
        const shapeIndex = shapePlaceArg[0];
        const shapeFillIndexList = this.getShapeFillIndexList(...shapePlaceArg);
        let valid = 1;
        let shapeFillXYZList = [];
        shapeFillIndexList.forEach((index)=>{
            if(index < 0 || index >= 112){
                valid = 0;
            }else{
                if(this.tiles[index] != -1){
                    valid = 0;
                }
            }
            shapeFillXYZList[shapeFillXYZList.length] = this.i2xyz(index);
        });
        shapeFillXYZList.forEach(xyz=>{
            this.canvas.drawTriInner(...xyz, this.colors[shapeCount], 6);
            this.tiles[this.xyz2i(...xyz)] = shapeIndex;
            this.shapes[shapeIndex][1] = 0;
        });
        //Place it!!!
    }
    getShapeFillIndexList(shapeIndex, startXYZ, startPoint, rotation, mirror){
        //Given a shape, startXYZ on map, startPoint on shape, shape rotation and mirror, returns the list of index on map.
        let shape = [...(this.shapes[shapeIndex][0])];
        let shapeFillIndexList = [];
        let xyz = [...startXYZ];
        let rxyz = [...startXYZ];
        if(mirror == 1){
            shape = shape.map((p) => {
                if(p == 0) return 2;
                if(p == 2) return 0;
                if(p == 3) return 5;
                if(p == 5) return 3;
                return p;
            });
        }
        shapeFillIndexList[shapeFillIndexList.length] = this.xyz2i(...xyz);
        for(let i = startPoint; i < shape.length; i++){
            xyz = this.hopper(xyz, (shape[i]+rotation)%6);
            shapeFillIndexList[shapeFillIndexList.length] = this.xyz2i(...xyz);
        }
        for(let i = startPoint-1; i >= 0; i--){
            rxyz = this.hopper(rxyz, (shape[i]+rotation+3)%6);
            shapeFillIndexList[shapeFillIndexList.length] = this.xyz2i(...rxyz);
        }
        return shapeFillIndexList
    }
}

console.log("Loaded: hexamond.js");