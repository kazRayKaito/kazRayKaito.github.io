class Canvas{
constructor(canvas){
    //Initialize Canvas and its size
    this.canvas = canvas;
    this.ct = canvas.getContext("2d");
    this.resizeCanvas();
    //Add Event listeners
    this.canvas.addEventListener('mousedown',  (event) => {this.touch(event);},     false);
    this.canvas.addEventListener('touchstart', (event) => {this.touch(event);},     false);
    this.canvas.addEventListener('mousemove',  (event) => {this.moveMouse(event);}, false);
    this.canvas.addEventListener('touchmove',  (event) => {this.moveMouse(event);}, false);
    this.canvas.addEventListener('mouseup'  ,  (event) => {this.release(event);},   false);
    this.canvas.addEventListener('touchend'  , (event) => {this.release(event);},   false);
    //Initialize ROI
    this.centerX = 0;
    this.centerY = 0;
    this.sideLength = 4;
    //Initialize MandelPlotter
    this.mandelPlotter = new MandelPlotter(this.canvas.width, this.canvas.height);
    //Reset...or start
    this.resetCanvas();
    this.updateMandelBrotSet(-2, -2, 2, 2);
}
resetCanvas(){
    this.ct.fillStyle = "white";
    this.ct.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.imageData = this.ct.getImageData(0, 0, this.canvas.width, this.canvas.height);
    //Touch control parameters
    this.touchStart = false;
    this.touchXY = [0, 0];
}
updateCanvas(){
    let min = -2;
    for(let i = 0; i < this.mandelPlotter.area; i++){
        if(this.deathMap[i] != -1){
            if(min == -2){
                min = this.deathMap[i];
            }else if(this.deathMap[i] < min){
                min = this.deathMap[i];
            }else{
                // min is still min
            }
        } 
    }
    this.minIteration = min;
    console.log(this.minIteration);
    for(let i = 0; i < this.mandelPlotter.area; i++){
        if(this.deathMap[i] == -1){
            this.setPix(i, 255);
        }else{
            this.setPix(i, this.interpolate(this.deathMap[i]));
        }
    }
    this.ct.putImageData(this.imageData, 0, 0);
}
resizeCanvas(){
    this.canvas.width = Math.floor(window.innerWidth) - 20;
    if(Math.floor(window.innerWidth) > 540) this.canvas.width = 520;
    if(Math.floor(window.innerWidth) < 320) this.canvas.width = 320;
    this.pixelRatio = window.devicePixelRatio;
    this.canvas.style.width  = this.canvas.width + "px";
    this.canvas.style.height = this.canvas.width + "px";
    this.canvas.width  = this.canvas.width;
    this.canvas.height = this.canvas.width;
    this.canvas.width *= this.pixelRatio;
    this.canvas.height*= this.pixelRatio;
}
touch(event){
    this.loop = false;
    this.move = false;
    this.touchStart = true;
    this.touchXY = this.getXY(event);
    this.lastMove = Date.now();
    this.ct.strokeStyle = "lime";
    this.ct.lineWidth = this.pixelRatio;
}
moveMouse(event){
    if(this.touchStart == false) return;
    if(Date.now() - this.lastMove < 15) return;
    this.lastMove = Date.now();
    this.ct.putImageData(this.imageData, 0, 0);
    const [x,y] = this.getXY(event);
    const halfSide = Math.abs(x - this.touchXY[0]);
    this.ct.strokeRect(this.touchXY[0] - halfSide, this.touchXY[1] - halfSide, halfSide * 2, halfSide * 2);
}
release(event){    
    this.loop = false;
    const [xPixEnd, yPixEnd] = this.getXY(event);
    const [xPixStart, yPixStart] = this.touchXY;
    [this.centerX, this.centerY] = this.getModXY(xPixStart, yPixStart);
    const sideLengthPix = Math.abs(xPixEnd - xPixStart);
    if(sideLengthPix == 0){
        this.sideLength *= 0.5;
    }else{
        this.sideLength *= (2 * sideLengthPix / this.canvas.width);
    }
    this.resetCanvas();
    this.updateMandelBrotSet(this.centerX - this.sideLength / 2,
                             this.centerY - this.sideLength / 2,
                             this.centerX + this.sideLength / 2,
                             this.centerY + this.sideLength / 2);
}
updateMandelBrotSet(xMin, yMin, xMax, yMax){
    //get mandelbrot set
    const startTime = new Date();
    this.deathMap = this.mandelPlotter.updateMandelBrotSet(xMin, yMin, xMax, yMax);
    console.log(new Date() - startTime + "ms");
    this.updateCanvas();
}
getXY(event){
    event.preventDefault();
    const rect = event.target.getBoundingClientRect();
    let x = event.pageX - rect.left - document.scrollingElement.scrollLeft;
    let y = event.pageY - rect.top  - document.scrollingElement.scrollTop;
    x *= this.pixelRatio;
    y *= this.pixelRatio;
    return [x,y];
}
getModXY(xPix, yPix){
    const xMod = this.centerX+(xPix/this.canvas.width  - 1/2) * this.sideLength;
    const yMod = this.centerY+(yPix/this.canvas.height - 1/2) * this.sideLength;
    return [xMod,yMod];
}
setPix(index, value){
    //Set the pixel based on type
    this.imageData.data[4 * index + 0] = value;
    this.imageData.data[4 * index + 1] = value;
    this.imageData.data[4 * index + 2] = value;
}
interpolate(value){
    return 255 * 0.75 * (1 - Math.pow(0.99, ((value - this.minIteration))));
}
i2xy(i){
    return [i % this.canvas.width, Math.floor(i / this.canvas.width)];
}
}
console.log("Loaded: canvas.js");