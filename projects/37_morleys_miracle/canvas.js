class Canvas{
    constructor(canvas=document.createElement("canvas")){
        this.canvas = canvas;
        this.ct = canvas.getContext("2d");
        this.pixelRatio = window.devicePixelRatio;
        this.imgdata;
        //For Touch Control
        this.touchStart = false;
        this.moveStart = false;
        this.canvas.addEventListener('mousedown', (event)=>{this.touch(event);}, false);
        this.canvas.addEventListener('touchstart', (event)=>{this.touch(event);}, false);
        this.canvas.addEventListener('mousemove', (event)=>{this.moveMouse(event);}, false);
        this.canvas.addEventListener('touchmove', (event)=>{this.moveMouse(event);}, false);
        this.canvas.addEventListener('mouseup'  , (event)=>{this.release(event);}, false);
        this.canvas.addEventListener('touchend'  , (event)=>{this.release(event);}, false);
    }
    //Touch Control
    getXY(event){
        const rect = event.target.getBoundingClientRect();
        let x = event.pageX-rect.left-document.scrollingElement.scrollLeft;
        let y = event.pageY-rect.top-document.scrollingElement.scrollTop;
        x *= this.pixelRatio;
        y *= this.pixelRatio;
        return [x,y];
    }
    touch(event){}
    moveMouse(event){}
    release(event){}
    //Transformation
    translate(x,y){
        this.ct.translate(x,y);
    }
    rotateDeg(deg){
        if(deg==0) return;
        this.rotate(deg*Math.PI/180);
    }
    rotateRad(rad){
        if(rad==0) return; 
        this.ct.rotate(rad);
    }
    //Style of canvas element on HTML
    strokeColor(color){
        this.ct.strokeStyle = color;
    }
    fillColor(color){
        this.ct.fillStyle = color;
    }
    lineWidth(lineWidth){
        this.ct.lineWidth = lineWidth;
    }
    flexResize(windowWidthRatio=0.95, HeightRatio=1, WidthMax=520, WidthMin=320){
        //Define width
        let widthStyle = Math.floor(window.innerWidth);//innerWidth * pixelRatio = actual pixels width
        if(Math.floor(window.innerWidth)>WidthMax)   widthStyle = WidthMax;
        if(Math.floor(window.innerWidth)<WidthMin)   widthStyle = WidthMin;

        //Define width and height (style)
        this.widthStyle  = Math.floor(widthStyle * windowWidthRatio);
        this.heightStyle = Math.floor(widthStyle * HeightRatio);
        this.resizeStyle(this.widthStyle, this.heightStyle);

        //Define width and height (pixels)
        this.width  = Math.floor(this.widthStyle  * this.pixelRatio);
        this.height = Math.floor(this.heightStyle * this.pixelRatio);
        this.resize(this.width, this.height);
    }
    resize(width, height){
        this.canvas.width = Math.floor(width);
        this.canvas.height= Math.floor(height);
    }
    resizeStyle(width,height){
        this.canvas.style.width  = Math.floor(width) +"px";
        this.canvas.style.height = Math.floor(height)+"px";
    }
    hideCanvas(){
        log("off2");
        this.canvas.style.display = "none";
    }
    showCanvas(){
        log("on2");
        this.canvas.style.display = "inline";
    }
    //DrawStrokeFill things on Canvas
    text(string="empty string", x=0, y=0, color="black", font="10px 'Times'", ta="left", tbl="top"){
        this.ct.fillStyle = color;
        this.ct.font = font;
        this.ct.textAlign = ta;
        this.ct.textBaseline = tbl;
        this.ct.fillText(string,x,y);
    }
    textCenter(string="empty string", x=0, y=0, color="black", font="10px 'Times'", ta="center", tbl="middle"){
        this.text(string,x,y,color,font,"center","middle");
    }
    line(xi,yi,xf,yf){
        this.ct.beginPath();
        this.ct.moveTo(xi+0.5,yi);
        this.ct.lineTo(xf+0.5,yf+1);
        this.ct.closePath();
        this.ct.stroke();
    }
    lines(points){
        const pointLength = points.length;
        for(let i = 0; i < points.length; i++){
            const iNext = (i+1)%pointLength;
            this.line(points[i].x,points[i].y,points[iNext].x,points[iNext].y);
        }
    }
    circle(x,y,rad,color="black"){
        this.ct.fillStyle = color;
        this.ct.beginPath();
        this.ct.arc(x,y,rad,0,2*Math.PI);
        this.ct.fill();
    }
    fillAll(color="black"){
        this.fillRect(0,0,this.canvas.width,this.canvas.height,color);
    }
    drawRect(dx=0,dy=0,width=this.canvas.width,height=this.canvas.height,color="black"){
        this.ct.strokeStyle = color;
        this.ct.beginPath();
        this.ct.rect(dx+0.5,dy+0.5,width-1,height-1);
        this.ct.closePath();
        this.ct.stroke();
    }
    fillRect(dx=0,dy=0,width=this.canvas.width,height=this.canvas.height,color="black"){
        this.ct.fillStyle = color;
        this.ct.fillRect(dx,dy,width,height);
    }
    drawImage(img,sx,sy,sw,sh,dx=0,dy=0,dw=this.canvas.width,dh=this.canvas.height){
        this.ct.drawImage(img,sx,sy,sw,sh,dx,dy,dw,dh);
    }
    appendSelf(parent=body){
        parent.appendChild(this.canvas);
    }
    //imageData
    createImageData(w=this.canvas.width,h=this.canvas.height){
        this.imgdata = this.ct.createImageData(w,h);
    }
}
class MorleysMiracle extends Canvas{
    constructor(canvas=document.createElement("canvas")){
        //Canvas info
        super(canvas);
        window.addEventListener('resize', (event)=>{this.reresize(event);}, false);
        super.flexResize(0.95, 0.95, 840, 840);
        

        //Points info
        this.points = [];
        this.middlePoints = [];
        this.points[0] = new Point("P0", 0, 0);
        this.points[1] = new Point("P1", 0, 0);
        this.points[2] = new Point("P2", 0, 0);
        this.points[0].reset(this.canvas);
        this.points[1].reset(this.canvas);
        this.points[2].reset(this.canvas);

        //Drag info
        this.lastMove = Date.now();
        this.originalPointIndex = 0;
        this.originalPointXY = [0,0];
        this.originalTouchXY = [0,0];

        this.draw();
    }
    reresize(){
        super.flexResize(0.95, 0.95, 840, 840);
        this.draw();
    }
    draw(){
        this.fillAll("white");
        this.strokeColor("black");
        super.lines(this.points);
        super.text(...this.points[0].returnLabelInfo());
        super.text(...this.points[1].returnLabelInfo());
        super.text(...this.points[2].returnLabelInfo());

        const midPoint_0 = this.points[0].getMidPoint(this.points[1],this.points[2]);
        const midPoint_1 = this.points[1].getMidPoint(this.points[2],this.points[0]);
        const midPoint_2 = this.points[2].getMidPoint(this.points[0],this.points[1]);

        this.strokeColor("red");
        this.line(this.points[0].x,this.points[0].y,midPoint_1.x, midPoint_1.y);
        this.line(this.points[0].x,this.points[0].y,midPoint_2.x, midPoint_2.y);
        this.line(this.points[1].x,this.points[1].y,midPoint_0.x, midPoint_0.y);
        this.line(this.points[1].x,this.points[1].y,midPoint_2.x, midPoint_2.y);
        this.line(this.points[2].x,this.points[2].y,midPoint_0.x, midPoint_0.y);
        this.line(this.points[2].x,this.points[2].y,midPoint_1.x, midPoint_1.y);

        this.line(midPoint_0.x, midPoint_0.y,midPoint_1.x, midPoint_1.y);
        this.line(midPoint_1.x, midPoint_1.y,midPoint_2.x, midPoint_2.y);
        this.line(midPoint_2.x, midPoint_2.y,midPoint_0.x, midPoint_0.y);
    }
    touch(event){
        if(this.touchStart) return;
        this.touchStart = true;
        this.originalPointIndex = this.getClosestPointIndex(event);
        this.originalPointXY[0] = this.points[this.originalPointIndex].x;
        this.originalPointXY[1] = this.points[this.originalPointIndex].y;
        this.originalTouchXY = this.getXY(event);
    }
    moveMouse(event){
        event.preventDefault();
        if(this.touchStart == false) return;
        if(Date.now() - this.lastMove < 20) return;
        
        this.moveStart = true;
        this.lastMove = Date.now();
        const currentPoint = this.getXY(event);
        const dx = currentPoint[0] - this.originalTouchXY[0];
        const dy = currentPoint[1] - this.originalTouchXY[1];
        this.points[this.originalPointIndex].x = this.originalPointXY[0] + dx;
        this.points[this.originalPointIndex].y = this.originalPointXY[1] + dy;
        this.draw();
    }
    release(event){
        this.moveStart = false;
        this.touchStart = false;
    }
    getClosestPointIndex(event){
        let touchPoint = this.getXY(event);
        let closestIndex = 0;
        let closestDist = 0;
        for(let i=0;i<3;i++){
            const dx = touchPoint[0]-this.points[i].x;
            const dy = touchPoint[1]-this.points[i].y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if(i == 0 || dist < closestDist){
                closestIndex = i;
                closestDist = dist;
            }
        }
        return closestIndex;
    }
}
class Point{
    constructor(name = "newName", x=0, y=0){
        this.name = name;
        this.x = x;
        this.y = y;
    }
    reset(canvas){
        this.x = Math.random()*canvas.width;
        this.y = Math.random()*canvas.height;
    }
    getAngleToPoint(p2){
        return Math.atan((this.y - p2.y)/(this.x - p2.x)) + (((this.x-p2.x)>0)?Math.PI:0) + Math.PI/2;
    }
    getAngle(p1, p2){
        return Math.atan((p1.y - p2.y)/(p1.x - p2.x)) + (((p1.x-p2.x)>0)?Math.PI:0) + Math.PI/2;
    }
    getMidPoint(point1, point2){
        //Get self Point and distance between point1 and point2
        const selfPoint = {x:this.x, y:this.y};
        const dx12 = point1.x - point2.x;
        const dy12 = point1.y - point2.y;
        const distP12 = Math.sqrt(dx12 * dx12 + dy12 * dy12);

        //Get angle 1
        const angle1_0_temp = this.getAngle(point1, selfPoint);
        const angle1_2_temp = this.getAngle(point1, point2);
        const angle1_small = Math.min(angle1_0_temp, angle1_2_temp);
        const angle1_large = Math.max(angle1_0_temp, angle1_2_temp);
        let dAngle1 = angle1_large - angle1_small;
        const angle1_inverted = dAngle1 > Math.PI;
        if(angle1_inverted){
            dAngle1 = Math.PI * 2 - dAngle1;
        }

        //Get angle 2
        const angle2_0_temp = this.getAngle(point2, selfPoint);
        const angle2_1_temp = this.getAngle(point2, point1);
        const angle2_small = Math.min(angle2_0_temp, angle2_1_temp);
        const angle2_large = Math.max(angle2_0_temp, angle2_1_temp);
        let dAngle2 = angle2_large - angle2_small;
        let lineFromP2Angle = (angle2_small + dAngle2 / 3)%(Math.PI*2);
        const angle2_inverted = dAngle2 > Math.PI;
        if(angle2_inverted){
            dAngle2 = Math.PI * 2 - dAngle2;
            lineFromP2Angle = (angle2_small + Math.PI*2 - dAngle2 / 3)%(Math.PI*2);
        }
        
        const L1 = distP12 * (Math.tan(Math.PI/2 - dAngle1/3)/(Math.tan(Math.PI/2 - dAngle2/3)+(Math.tan(Math.PI/2 - dAngle1/3))));

        let mp = {x:0, y:0};
        const theAngle = angle1_2_temp + (((2*Math.PI + angle1_0_temp - angle1_2_temp)%(2*Math.PI)>Math.PI?-1:1)*dAngle1/3);
        let theLength = Math.abs(L1 / Math.cos(dAngle1/3));

        const dx = Math.sin(theAngle + 0*Math.PI/2) * theLength;
        const dy = -Math.cos(theAngle + 0*Math.PI/2) * theLength;
        
        mp.x = point1.x + dx;
        mp.y = point1.y + dy;
        return mp;
    }
    returnLabelInfo(){
        return [this.name, this.x, this.y, "black", "30px 'Times'", "left", "bottom"];
    }
}

console.log("Loaded: canvas.js");