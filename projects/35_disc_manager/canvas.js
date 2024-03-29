class Canvas{
    constructor(canvas=document.createElement("canvas")){
        this.canvas = canvas;
        this.ct = canvas.getContext("2d");
        this.pixelRatio = window.devicePixelRatio;
        this.imgdata;
    }
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
    flexResize(windowWidthRatio=0.95, HeightRatio=1, WidthMax=520, WidthMin=320){
        let width = Math.floor(window.innerWidth);
        if(Math.floor(window.innerWidth)>WidthMax)   width = WidthMax;
        if(Math.floor(window.innerWidth)<WidthMin)   width = WidthMin;
        width = Math.floor(width*windowWidthRatio);
        let height = Math.floor(width*HeightRatio);
        this.resizeStyle(width,height);
        this.resize(width*this.pixelRatio,height*this.pixelRatio);
    }
    resize(width, height){
        this.canvas.width = Math.floor(width);
        this.canvas.height= Math.floor(height);
    }
    resizeStyle(width,height,divideByPR=false){
        if(divideByPR){
            this.canvas.style.width  = Math.floor(width/this.pixelRatio) +"px";
            this.canvas.style.height = Math.floor(height/this.pixelRatio)+"px";
        }else{
            this.canvas.style.width  = Math.floor(width) +"px";
            this.canvas.style.height = Math.floor(height)+"px";
        }
    }
    hideCanvas(){
        this.canvas.style.display = "none";
    }
    showCanvas(){
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
    line(xi,yi,xf,yf){
        this.ct.beginPath();
        this.ct.moveTo(xi,yi);
        this.ct.lineTo(xf,yf);
        this.ct.closePath();
        this.ct.stroke();
    }
    fillAll(color="black",dx=0,dy=0,width=this.canvas.width,height=this.canvas.height){
        this.ct.fillStyle = color;
        this.ct.fillRect(dx,dy,width,height);
    }
    drawRect(color="black",dx=0,dy=0,width=this.canvas.width,height=this.canvas.height){
        this.ct.strokeStyle = color;
        this.ct.beginPath();
        this.ct.rect(dx,dy,width,height);
        this.ct.closePath();
        this.ct.stroke();
    }
    fillRect(color="black",dx=0,dy=0,width=this.canvas.width,height=this.canvas.height){
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
class PlotCanvas extends Canvas{
    constructor(canvas=document.createElement("canvas")){
        super(canvas);
        this.reset(100,100);
    }
    reset(width,height){
        if(this.canvas.width!=width+2||this.canvas.height!=height+2){
            this.resize(width,height);
            this.resizeStyle(width,height,true);
            this.createImageData(width,height);
            for(let i=0;i<width*height;i++){
                this.imgdata.data[i*4+3] = 256;
            }
        }
        this.clear();
    }
    resize(width,height){
        super.resize(width+2,height+2);
    }
    resizeStyle(width,height,divideByPR){
        super.resizeStyle(width+2,height+2,divideByPR);
    }
    clear(){
        this.fillAll("white");
        this.fillRect("black",1,1,this.canvas.width-2,this.canvas.height-2);
    }
    update(data,width,height="fromWidth",autoScale=true){
        const scale = autoScale?256/Math.max(1,getMax(data)):1;
        if(height=="fromWidth"){
            height = data.length/width;
        }
        this.reset(width,height);
        for(let i=0;i<data.length;i++){
            const brightness = data[i]*scale;
            this.imgdata.data[i*4+0]=brightness;
            this.imgdata.data[i*4+1]=brightness;
            this.imgdata.data[i*4+2]=brightness;
        }
        this.ct.putImageData(this.imgdata,1,1);
    }
}

class GraphCanvas extends Canvas{
    constructor(canvas=document.createElement("canvas")){
        super(canvas);
        this.clear();
    }
    reset(width,height){
        if(this.canvas.width!=width+2||this.canvas.height!=height+2){
            this.resize(width,height);
            this.resizeStyle(width,height,true);
        }
        this.clear();
    }
    resize(width,height){
        super.resize(width+2,height+2);
    }
    resizeStyle(width,height,divideByPR){
        super.resizeStyle(width+2,height+2,divideByPR);
    }
    clear(){
        this.fillAll("black");    
    }
    update(data,scale="autoScale",width="dataLength",height=100){
        scale = (scale=="autoScale")?height/Math.max(1,getMax(data)):scale;
        if(width=="dataLength"){
            width = data.length;
        }
        if(Array.isArray(data)){
            this.reset(width,height);
            for(let i=0;i<data.length;i++){
                this.fillRect("white",i+1,1,1,this.canvas.height-data[i]*scale-2);
            }
        }else{
            alert("Data input for GraphCanvas needs to be 1-D Array");
        }
    }
}

class LogCanvas extends Canvas{
    constructor(canvas=document.createElement("canvas"),lineSize=16){
        super(canvas);
        this.lineSize = lineSize;
        this.font = ""+lineSize+"px 'Times'";
        this.flexResize(0.95,0.2);
        this.fillAll("white");
        this.newLine("Logger Started...");
    }
    newLine(string="Empty"){
        if(string.isArray){
            let newString = "";
            string.forEach((element)=>{
                newString = newString+","+element;
            });
            string = newString;
        }
        this.text(string,0,0,"black",this.font);
        this.ct.drawImage(this.canvas,0,this.lineSize);
        this.fillAll("white",0,0,this.canvas.width,this.lineSize);
    }
}

class CodeCanvas extends Canvas{
    constructor(canvas=document.createElement("canvas")){
        super(canvas);
    }
    displayCode(num = 0,xi,xt){
        let binary = "0"+num.toString(2)+"1";
        while(binary.length<12) binary = "0"+binary;
        const scale = this.pixelRatio;
        const gap = 4;
        const offset = 15*this.pixelRatio;
        const g = 2*this.pixelRatio;
        this.ct.strokeStyle = "black";
        for(let i=0;i<12;i++){
            this.ct.lineWidth = ((binary.charAt(i)=="1")?2:1)*scale;
            this.line(xi+g,i*scale*gap+offset,xt-g,i*scale*gap+offset);
        }        
    }
    displayCodes(){
        const width = this.canvas.width;
        const height = this.canvas.height;
        this.fillAll("white");
        this.ct.strokeStyle = "black";
        log(this.ct.lineWidth);
        const discNumber = 60;
        for(let i=0;i<discNumber;i++){
            this.ct.lineWidth = 1*this.pixelRatio;
            this.line(i*width/discNumber,0,i*width/discNumber,height);
            this.displayCode(i,i*width/discNumber,(i+1)*width/discNumber);
        }
    }
}

console.log("Loaded: canvas.js");