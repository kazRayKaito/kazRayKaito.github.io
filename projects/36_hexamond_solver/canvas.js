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
    lines(x,y,breakUp=[],shrinkRate=1,xOffset=0,yOffset=0){
        let startIndex = 0;
        let nextBreakUpIndex = 0;
        while(startIndex!=x.length){
            let nextBreakUp;
            if(breakUp[nextBreakUpIndex]==undefined){
                nextBreakUp = x.length;
            }else{
                nextBreakUp = breakUp[nextBreakUpIndex];
            }
            this.ct.beginPath();
            this.ct.moveTo((x[startIndex]-xOffset)*shrinkRate+xOffset,(y[startIndex]-yOffset)*shrinkRate+yOffset);
            for(let i=startIndex+1;i<nextBreakUp;i++)
                this.ct.lineTo((x[i]-xOffset)*shrinkRate+xOffset,(y[i]-yOffset)*shrinkRate+yOffset);
            //this.ct.closePath();
            this.ct.stroke();
            startIndex = nextBreakUp;
            nextBreakUpIndex++;
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
class HexaCanvas extends Canvas{
    constructor(canvas=document.createElement("canvas")){
        super(canvas);
        super.flexResize(0.95, 0.7, 840, 320);
        this.cellLength = Math.floor(this.canvas.width/8);
    }
    i2p(xi,yi){
        const xp = 0 + this.canvas.width/2 + (xi-4) * this.cellLength * Math.sqrt(3)/2;
        const yp = this.canvas.height/2 + this.cellLength/4 + (xi-4)*this.cellLength/2 - (yi-3) * this.cellLength;
        return [xp, yp];
    }
    drawTriInner(xi,yi,zi, color = "black", lineWidth=1){
        this.strokeColor(color);
        this.lineWidth(lineWidth);

        let x1 = xi;
        let y1 = yi;
        let x2 = xi + 1;
        let y2 = yi + 1;
        let x3 = xi + 1 - zi;
        let y3 = yi + 0 + zi;

        [x1,y1]=this.i2p(x1,y1);
        [x2,y2]=this.i2p(x2,y2);
        [x3,y3]=this.i2p(x3,y3);

        const offset = this.cellLength*lineWidth*0.01;
        x1 += (zi==0)? offset  : offset/2;
        x2 += (zi==0)?-offset/2:-offset;
        x3 += (zi==0)?-offset/2: offset/2;
        y1 += (zi==0)? 0:-offset*Math.sqrt(3)/2;
        y2 += (zi==0)?  offset*Math.sqrt(3)/2:0;
        y3 += (zi==0)?-offset*Math.sqrt(3)/2:offset*Math.sqrt(3)/2;

        let lines = []
        lines[0] = [x1, y1];
        lines[1] = [x2, y2];
        lines[2] = [x3, y3];
        lines[3] = [x1, y1];
        lines[4] = [x2, y2];
        this.lines(lines);
    }
    drawTri(xi, yi, zi, text = ""){
        let x1 = xi;
        let y1 = yi;
        let x2 = xi + 1;
        let y2 = yi + 1;
        let x3 = xi + 1 - zi;
        let y3 = yi + 0 + zi;

        let lines = []
        lines[0] = this.i2p(x1, y1);
        lines[1] = this.i2p(x2, y2);
        lines[2] = this.i2p(x3, y3);
        lines[3] = this.i2p(x1, y1);
        this.lines(lines);

        if(text != ""){
            const x = (lines[0][0]+lines[1][0]+lines[2][0])/3;
            const y = (lines[0][1]+lines[1][1]+lines[2][1])/3;
            this.textCenter(text, x, y);
        }
    }
    drawFrame(){
        let lines = [];
        lines[0]  = this.i2p(0,3);
        lines[1]  = this.i2p(0,0);
        lines[2]  = this.i2p(3,0);
        lines[3]  = this.i2p(4,1);
        lines[4]  = this.i2p(5,1);
        lines[5]  = this.i2p(8,4);
        lines[6]  = this.i2p(8,7);
        lines[7]  = this.i2p(6,7);
        lines[8]  = this.i2p(5,6);
        lines[9]  = this.i2p(4,6);
        lines[10] = this.i2p(3,5);
        lines[11] = this.i2p(2,5);
        lines[12] = this.i2p(0,3);
        this.lines(lines);
    }
    lines(xyList){
        let xList = [];
        let yList = [];
        for(let i = 0; i < xyList.length; i++){
            xList[i] = xyList[i][0];
            yList[i] = xyList[i][1];
        }
        super.lines(xList, yList);
    }
    touch(event){
        super.touch(event);
        event.preventDefault();
        if(!readyForRecord) return;
        resetAllForRecording();
        this.moveStart = false;
        this.touchStart = true;
        [xRecorded[xRecorded.length],yRecorded[yRecorded.length]] = this.getXY(event);
        this.lastMove = Date.now();
    }
    moveMouse(event){
        super.moveMouse(event);
        event.preventDefault();
        if(this.touchStart==false) return;
        if(Date.now()-this.lastMove<15) return;
        this.moveStart = true;
        this.lastMove = Date.now();
        [xRecorded[xRecorded.length],yRecorded[yRecorded.length]] = this.getXY(event);
        drawRecording();
    }
    release(event){
        super.release(event);
        event.preventDefault();
        if(this.touchStart==false) return;
        [xRecorded[xRecorded.length],yRecorded[yRecorded.length]] = this.getXY(event);
        this.moveStart = false;
        this.touchStart = false;
        drawRecording();
        getReadyToAnimateShrink();
    }
}

console.log("Loaded: canvas.js");