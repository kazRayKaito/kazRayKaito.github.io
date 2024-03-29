const dx = [1, 1, 0,-1,-1,-1, 0, 1];
const dy = [0, 1, 1, 1, 0,-1,-1,-1];

const newWindow = (xct) => {
	return {
		centerWidthHeight : (centerX, centerY, widthIn, heightIn) => {
			let xpos = Math.floor(centerX-widthIn /2);
			let ypos = Math.floor(centerY-heightIn/2);
			return new ImageData([xct.getImageData(xpos, ypos, widthIn, heightIn), xpos, ypos]);
		},
		cornerWidthHeight : (xpos, ypos, widthIn, heightIn) => {
			return new ImageData([xct.getImageData(xpos, ypos, widthIn, heightIn), xpos, ypos]);
		},
		cornerToCorner : (xmin, ymin, xmax, ymax) => {
			return new ImageData([xct.getImageData(xmin, ymin, (xmax-xmin), (ymax-ymin)), xmin, ymin]);
		}
	};
}

class ImageData{
	constructor([imgIn,xpos,ypos]){
		//Set up variables
		this.imgIn= imgIn;
		this.xpos = xpos;
		this.ypos = ypos;
		
		this.width  = imgIn.width;
		this.height = imgIn.height;
		this.area   = this.width*this.height;
		
		this.imgOut = imgIn;
		//Initialize dimgOut
		for(let i=0;i<imgIn.data.length;i++){
			this.imgOut.data[i] = imgIn.data[i];
		}
		return this;
	}
	//getters and setters
	get passdata(){return [this.imgOut, this.xpos, this.ypos]; }
	display(actual = false){
		const dxpos = this.dxpos+Math.floor((this.dwidth-this.width)/2)*actual;
		const dypos = this.dypos+Math.floor((this.dheight-this.height)/2)*actual;
		
		const timg = this.updateDisplayImage(actual);

		ct.beginPath();
		ct.strokeStyle = "rgb(0,255,0)";
		ct.lineWidth = 0;
		ct.rect(dxpos-0.5,dypos-0.5,actual?this.width+1:this.dwidth+1,actual?this.height+1:this.dheight+1);

		//ct.clearRect(dxpos,dypos,actual?this.width:this.dwidth,actual?this.height:this.dheight);
		ct.drawImage(timg,dxpos, dypos,actual?this.width:this.dwidth,actual?this.height:this.dheight);
		ct.stroke();
	}
	updateDisplayImage(){
		const tcanvas = document.createElement("canvas");
		tcanvas.width = this.width;
		tcanvas.height= this.height;
		const tct = tcanvas.getContext("2d");
		tct.putImageData(this.imgOut,0,0);
		return tcanvas;
	}
	xy2i(xy,width=this.width){
		return Math.floor(xy[0])+width*Math.floor(xy[1]);
	}
	i2xy(i, width=this.width){
		return [i%width, Math.floor(i/width)];
	}
	setPix(indexIn, value, type="all"){
		//Check if indexIn is xy or index
		let index;
		if(indexIn.length==2) 	index = this.xy2i(indexIn);
		else					index = indexIn;

		//Set the pixel based on type
		if(type=="all"||type==0) this.imgOut.data[4*index+0] = value;
		if(type=="all"||type==1) this.imgOut.data[4*index+1] = value;
		if(type=="all"||type==2) this.imgOut.data[4*index+2] = value;
	}
	getPix(imgIn, indexIn, type="all"){
		//Check if indexIn is xy or index
		let index;
		if(indexIn.length==2) 	index = this.xy2i(indexIn, imgIn.width);
		else					index = indexIn;

		//Get the pixel based on type
		let rgbValue =0;
		if(type=="all"||type==0) rgbValue += imgIn.data[4*index+0];
		if(type=="all"||type==1) rgbValue += imgIn.data[4*index+1];
		if(type=="all"||type==2) rgbValue += imgIn.data[4*index+2];
		if(				type==3) rgbValue += imgIn.data[4*index+3];
		if(type=="all") rgbValue /= 3;

		return rgbValue;
	}
}

class IntersectionDetector extends ImageData{
	constructor([imgIn,xpos,ypos]=[hct.getImageData(0,0,hcanvas.width,hcanvas.height), 0, 0],vertical=false, display=0){
		super([imgIn, xpos, ypos]);
		this.vertical = vertical;
		this.dataArray;
		this.variance;
		this.dataSmoothArray;
		this.dataSlopeArray;
		this.lineIntensityArray;
		this.indexList;
		this.lineIntensityFiltered;
		this.updateLineIntensity();
		if(display!=0)this.display(0);
		if(display==1)this.displayIntersections();
		if(display==2)this.displayLineIntensity(0);
	}
	get data(){return this.dataArray;}
	get dataSmooth(){return this.dataSmoothArray;}
	get dataSlope(){return this.dataSlopeArray;}
	get lineIntensity(){return this.lineIntensityArray;}
	get intersections(){return this.indexList;}
	get std(){return this.variance;}
	updateLineIntensity(){
		this.dataArray = this.getdata();
		this.dataSmoothArray = smoothenArray(this.dataArray,2);//smoothenArrayVariableRange(this.dataArray);
		this.variance = calculateVariance(this.dataSmoothArray);
		this.dataSlopeArray = getSlopeIntensity(this.dataSmoothArray);
		this.lineIntensityArray = getLineIntensity(this.dataSlopeArray);
		this.indexList = this.getIntersections(this.lineIntensityArray);
	}
	getdata(){
		let data = new Array();
		if(this.vertical)	for(let i=0;i<this.height;i++)	data[i] = this.getPix(this.imgIn,[0,i],"all");
		else				for(let i=0;i<this.width;i++)	data[i] = this.getPix(this.imgIn,[i,0],"all");
		return data;
	}
	getIntersections(ain){
		const thresh = Math.max(15,this.variance);
		let indexList = new Array();
		let tempArray = new Array;
		for(let i=0;i<ain.length;i++){
			if(ain[i]>thresh){
				indexList[indexList.length] = i;
			}
			if(ain[i]!=0){
				tempArray[i] = ain[i];
			}else{
				tempArray[i] = thresh;
			}
		}
		this.lineIntensityFiltered = tempArray;
		return indexList;
	}
	displayLineIntensity(input = 0){
		if(input==0){
			displayArray(this.dataArray,0);
		}else if(input==1){
			displayArray(this.dataSmoothArray,1);
		}else if(input==2){
			displayArray(this.lineIntensityArray,2);
		}else if(input==3){
			displayArray(this.lineIntensityFiltered,3);
		}
	}
	displayIntersections(){
		for(let i=0;i<this.indexList.length;i++){
			circle([(this.xpos+(this.indexList[i]*(!this.vertical))),(this.ypos+(this.indexList[i]*this.vertical)),3]);
		}
	}
}

class Binarize extends ImageData{
	constructor([imgIn = hct.getImageData(0,0,hcanvas.width,hcanvas.height), xpos = 0, ypos = 0], preset = false){
		super([imgIn, xpos, ypos]);
		this.histogram = new Array(256);
		this.updateHistogram();
		this.threshold = (preset?preset:this.getThreshold());
		this.binarize();
	}
	get histo(){return this.histogram;}
	set thresh(threshIn){
		this.threshold = threshIn;
	}
	getThreshold(){
		const factor = 7;
		const countLimit = this.area/factor;
		let lowerCount = 0;
		let upperCount = 0;
		let lowerFound = -1;
		let upperFound = -1;
		for(let i=0;i<this.histogram.length;i++){
			lowerCount += this.histogram[i];
			if(lowerCount>countLimit){
				lowerFound = i;
				break;
			}
		}
		for(let i=this.histogram.length-1;i>=0;i--){
			upperCount += this.histogram[i];
			if(upperCount>countLimit){
				upperFound = i;
				break;
			}
		}
		let record = 0;
		let king = -1;
		for(let t=lowerFound;t<=upperFound;t++){
			const lowA = new Array();
			const highA= new Array();
			for(let i=0;i<this.area;i++){
				const newPix = this.getPix(this.imgIn,i);
				if(newPix>=t)	highA[highA.length] = newPix;
				else 			lowA[lowA.length]   = newPix;
			}
			if(lowA.length*highA.length==0) continue;
			let lowAve, lowStd;
			let highAve, highStd;
			[lowAve, lowStd] = getAveStd(lowA);
			[highAve, highStd] = getAveStd(highA);
			if((highAve-lowAve)/(lowStd+highStd)>record){
				record = (highAve-lowAve)/(lowStd+highStd);
				king = t;
			}
		}
		return king;
	}
	white2Transparent(){
		for(let i=0;i<this.width*this.height;i++){
			this.imgOut.data[4*i+3] = (this.getPix(this.imgOut,i,"all")==255)?0:255;
		}
	}
	updateHistogram(){
		let index;
		for(let i=0;i<this.histogram.length;i++) this.histogram[i]=0;
		for(let i=0;i<this.area;i++){
			index  = Math.floor(this.getPix(this.imgIn,i,"all"));
			this.histogram[index]++;
		}
		this.max = this.histogram.reduce((a,b)=>{return Math.max(a,b);},0);
	}
	binarize(){
		let brightness;
		for(let i=0;i<this.width*this.height;i++){
			brightness = this.imgIn.data[4*i+0];
			brightness+= this.imgIn.data[4*i+1];
			brightness+= this.imgIn.data[4*i+2];
			for(let c=0;c<3;c++){
				this.imgOut.data[4*i+c] = (brightness<=3*this.threshold)?0:255;
			}
		}
	}
}

class Filter extends ImageData{
	constructor([imgIn = hct.getImageData(0,0,hcanvas.width,hcanvas.height), xpos = 0, ypos = 0], preset = false){
		super([imgIn, xpos, ypos]);
		if(preset!=false) this.fuzzyR(preset);
	}
	fuzzyR(range = 1){
		if(range==0) return;
		let imgHolder = {data: new Array(this.area*4)};
		let counter, tempR, index;
		for(let y=0;y<this.height;y++){
			counter = tempR = 0;
			for(let x=-range;x<this.width+range;x++){
				index = this.xy2i([x,y], this.width);
				
				if(x+range<this.width){
					counter++;
					tempR += this.getPix(this.imgIn, index+range, 0);
				}
				
				if(x-range>=0){
					counter--;
					tempR -= this.getPix(this.imgIn, index-range, 0);
				}
				if(x>=0&&x<this.width){
					imgHolder.data[4*index] = tempR/counter;
				}
			}
		}
		for(let x=0;x<this.width;x++){
			counter = tempR = 0;
			for(let y=-range;y<this.height+range;y++){
				index = this.xy2i([x,y], this.width);
				
				if(y+range<this.height){
					counter++;
					tempR += this.getPix(imgHolder, index+range*this.width, 0);
				}
				
				if(y-range>=0){
					counter--;
					tempR -= this.getPix(imgHolder, index-range*this.width, 0);
				}
				if(y>=0&&y<this.height){
					this.setPix(index, Math.floor(tempR/counter), "all");
				}
			}
		}
	}
	fuzzy(range = 1){
		if(range==0) return;
		let imgHolder = {data: new Array(this.area*4)};
		//let imgHolder.data = new Array(this.area*4);
		let counter, tempR, tempG, tempB, index;
		for(let y=0;y<this.height;y++){
			counter = tempR = tempG = tempB = 0;
			for(let x=-range;x<this.width+range;x++){
				index = this.xy2i([x,y], this.width);
				
				if(x+range<this.width){
					counter++;
					tempR += this.getPix(this.imgIn, index+range, 0);
					tempG += this.getPix(this.imgIn, index+range, 1);
					tempB += this.getPix(this.imgIn, index+range, 2);
				}
				
				if(x-range>=0){
					counter--;
					tempR -= this.getPix(this.imgIn, index-range, 0);
					tempG -= this.getPix(this.imgIn, index-range, 1);
					tempB -= this.getPix(this.imgIn, index-range, 2);
				}
				if(x>=0&&x<this.width){
					imgHolder.data[4*index  ] = tempR/counter;
					imgHolder.data[4*index+1] = tempG/counter;
					imgHolder.data[4*index+2] = tempB/counter;
				}
			}
		}
		for(let x=0;x<this.width;x++){
			counter = tempR = tempG = tempB = 0;
			for(let y=-range;y<this.height+range;y++){
				index = this.xy2i([x,y], this.width);
				
				if(y+range<this.height){
					counter++;
					tempR += this.getPix(imgHolder, index+range*this.width, 0);
					tempG += this.getPix(imgHolder, index+range*this.width, 1);
					tempB += this.getPix(imgHolder, index+range*this.width, 2);
				}
				
				if(y-range>=0){
					counter--;
					tempR -= this.getPix(imgHolder, index-range*this.width, 0);
					tempG -= this.getPix(imgHolder, index-range*this.width, 1);
					tempB -= this.getPix(imgHolder, index-range*this.width, 2);
				}
				if(y>=0&&y<this.height){
					this.imgOut.data[4*index  ] = tempR/counter;
					this.imgOut.data[4*index+1] = tempG/counter;
					this.imgOut.data[4*index+2] = tempB/counter;
				}
			}
		}
	}
}

class FindBlob extends ImageData{
	constructor([imgIn = hct.getImageData(0,0,hcanvas.width,hcanvas.height), xpos = 0, ypos = 0], preset = false){
		super([imgIn, xpos, ypos]);
		this.blobMap  = new Array(this.area);
		this.dblobMap = new Array(this.darea);
		this.blobInfo= new Array();//[Area, xMin, yMin, xMax, yMax]
		this.blobNumber = 0;
		this.maxArea = 0;
		this.maxAreaIndex = 0;

		if(preset!=false) this.scanBlobs();
	}
	get blob(){
		const mi = this.maxAreaIndex;
		const tcanvas = document.createElement("canvas");
		let xMin, yMin, xMax, yMax;
		const offset = this.width*0;
		if(this.blobNumber!=0){
			xMin = Math.max(this.blobInfo[mi][1]-offset,0);
			yMin = Math.max(this.blobInfo[mi][2]-offset,0);
			xMax = Math.min(this.blobInfo[mi][3]+offset,this.width);
			yMax = Math.min(this.blobInfo[mi][4]+offset,this.height);
		}else{
			xMin = 0;
			yMin = 0;
			xMax = this.width;
			yMax = this.height;
		}
		tcanvas.width = Math.max(1,xMax-xMin);
		tcanvas.height= Math.max(1,yMax-yMin);
		const tct = tcanvas.getContext("2d");
		tct.drawImage(super.updateDisplayImage(),xMin-(tcanvas.height-tcanvas.width)/2,yMin,tcanvas.height,tcanvas.height,0,0,tcanvas.width,tcanvas.height);
		return tcanvas;
	}
	updateDisplayImage(actual = false){
		if(actual){
			for(let i=0;i<this.area;i++){
				if(this.getPix(this.imgOut,i,1)==0&&this.blobMap[i]!=(10*(this.maxAreaIndex+1))){
					this.imgOut.data[4*i+0]=0;
					this.imgOut.data[4*i+2]=0;
				}
			}			
			return;
		}
		super.updateDisplayImage();
		let xy;
		for(let i=0;i<this.darea;i++){
			xy = this.i2xy(i, this.dwidth);
			xy[0]*=canvasScale;
			xy[1]*=canvasScale;
			this.dblobMap[i] = this.blobMap[this.xy2i(xy,this.imgOut.width)];
		}
		for(let i=0;i<this.darea;i++){
			if(this.getPix(this.dimgOut,i,1)==0&&this.dblobMap[i]!=(10*(this.maxAreaIndex+1))){
				this.dimgOut.data[4*i+0]=0;
				this.dimgOut.data[4*i+2]=0;
			}
		}
		return super.updateDisplayImage();
	}
	eraseSmallerBlobs(){
		for(let i=0;i<this.area;i++){
			if(this.getPix(this.imgOut,i,1)==0&&this.blobMap[i]!=(10*(this.maxAreaIndex+1))){
				this.setPix(i, 255, "all");
			}
		}
	}
	scanBlobs(){
		//Init the information
		this.blobNumber = 0;
		for(let i=0;i<this.area;i++){
			this.blobMap[i]=0;
		}
		for(let i=0;i<this.area;i++){
			if(this.getPix(this.imgOut,i,0)==255) continue;
			if(this.blobMap[i]!=0) continue;
			this.blobNumber++;

			//Set up variables
			let tx = new Array();//Temps[]
			let ty = new Array();//Temps[]
			let left, right;
			let tim = 0;			//Temp Index Maximum
			let tic = 0;			//Temp Index Current
			tx[0] = i%this.width;
			ty[0] = Math.floor(i/this.width);

			let area, xMin, yMin, xMax, yMax;
			area = 0;
			xMin = xMax = tx[0]; 
			yMin = yMax = ty[0];

			while(tim!=-1){
				//go up until the end
				while(ty[tic]>=0&&this.getPix(this.imgOut, [tx[tic],ty[tic]-1], 0)==0){
					ty[tic]--;
				}

				//Trun off Left Right and check for yMin
				left  = false;
				right = false;
				yMin = Math.min(yMin,ty[tic]);
				while(ty[tic]<this.height&&this.getPix(this.imgOut, [tx[tic],ty[tic]], 0)==0){
					//Travel down one by one
					let index = this.xy2i([tx[tic],ty[tic]], this.imgOut.width);
					this.blobMap[index] = this.blobNumber*10;
					this.imgOut.data[4*index+0] = 255;
					this.imgOut.data[4*index+1] = 0;
					this.imgOut.data[4*index+2] = 255;
					area++;

					//Check for Cell on Left
					if(tx[tic]>0){
						if(left!=(this.getPix(this.imgOut, [tx[tic]-1,ty[tic]], 0)==0)){
							left = !left;
							if(left){
								xMin = Math.min(xMin,tx[tic]-1);
								ty.splice(0,0,ty[tic]);
								tx.splice(0,0,tx[tic]-1);
								tim++;
								tic++;
							}
						}
					}

					//Check for Cell on Right
					if(tx[tic]<this.width-1){
						if(right!=(this.getPix(this.imgOut, [tx[tic]+1,ty[tic]], 0)==0)){
							right = !right;
							if(right){
								xMax = Math.max(xMax,tx[tic]+1);
								ty.splice(0,0,ty[tic]);
								tx.splice(0,0,tx[tic]+1);
								tim++;
								tic++;
							}
						}
					}
					ty[tic]++;
				}
				yMax = Math.max(yMax,ty[tic]-1);
				tim--;
				tic=tim;
			}
			this.blobInfo[this.blobNumber-1] = [area, xMin, yMin, xMax, yMax];
			if(area>this.maxArea){
				this.maxArea = area;
				this.maxAreaIndex = this.blobNumber-1;
			}
		}
	}
}

class DistanceTransform extends ImageData{
	constructor([imgIn = hct.getImageData(0,0,hcanvas.width,hcanvas.height), xpos = 0, ypos = 0]){
		super([imgIn, xpos, ypos]);
		this.distanceTransfrom();
	}
	get canvas(){
		const tcanvas = document.createElement("canvas");
		tcanvas.width = this.width;
		tcanvas.height= this.height;
		const tct = tcanvas.getContext("2d");
		tct.drawImage(super.updateDisplayImage(),0,0,tcanvas.width,tcanvas.height,0,0,tcanvas.width,tcanvas.height);
		return tcanvas;
	}
	distanceTransfrom(){
		let brightness;
		for(let i=0;i<this.area;i++){
			const [x,y] = this.i2xy(i);
			const pixelAt = this.getPix(this.imgIn,i,1);
			//If it is at the edge
			if(x==0||y==0){
				this.setPix(i,127+128*(pixelAt>127));
				continue;
			}
			const pixelUp = this.getPix(this.imgOut,[x,y-1],1);
			const pixelLe = this.getPix(this.imgOut,[x-1,y],1);
			if(pixelAt>127){
				this.setPix(i,255);
			}else{
				this.setPix(i,Math.max(pixelUp,pixelLe)-128);
			}
		}
		for(let i=this.area-1;i>=0;i--){
			const [x,y] = this.i2xy(i);
			const pixelAt = this.getPix(this.imgOut,i);
			//If it is at the edge
			if(x==this.width-1||y==this.height-1){
				this.setPix(i,127+128*(pixelAt>127));
				continue;
			}
			const pixelDo = this.getPix(this.imgOut,[x,y+1]);
			const pixelRi = this.getPix(this.imgOut,[x+1,y]);
			if(pixelAt>127){
				this.setPix(i,255);
			}else{
				this.setPix(i,Math.max(Math.max(pixelDo,pixelRi)-128,pixelAt));
			}
		}
	}
}
console.log("Loaded: EyesScript.js");