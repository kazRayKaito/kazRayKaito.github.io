var globalVariable_topNavi
var globalVariable_mainContent

const initCSSController = () => {
	globalVariable_topNavi = document.getElementById("rayTopnavi");
	globalVariable_mainContent = document.getElementById("contentsContainer");

	window.addEventListener('resize', windowResized, false);
	windowResized();
}

const windowResized = () => {
	updateMargin();
}

const updateMargin = () => {
	//get windowInnerWidth and Topnav Width
	const innerWidth = window.innerWidth;
	const contentWidth = globalVariable_topNavi.clientWidth;

	//Calculate the proper margin
	let margin;
	margin = (innerWidth - contentWidth) / 2;
	margin = Math.floor(margin);
	margin = Math.max(0,margin);
	
	//Apply margin
	globalVariable_topNavi.style.paddingLeft = margin + "px";
	globalVariable_mainContent.style.marginLeft = margin + "px";
}

const clickOnTopnavi = (targetID) => {
	if (targetID == "rayTopnavi"){
		//Do nothing
	}else if(targetID != "navi_icon"){
		//switchTopnaviActive
		switchTopnaviActive(targetID);
		switchMainContentActive(targetID);
	}else{
		//switchTopnaviStyle
		const topnavi = document.getElementById("rayTopnavi");
		if (topnavi.className === "topnavi"){
			topnavi.className += " showNavi";
		} else {
			topnavi.className = "topnavi";
		}
	}
}

const switchTopnaviActive = async (targetID) => {
	//Deactivate all
	const topnavi = document.getElementById("rayTopnavi");
	topNaviChildren = topnavi.children;
	for(let i = 0; i < topNaviChildren.length - 1; i++){
		topNaviChildren[i].className = "";
	}

	//Activate the selected one
	document.getElementById(targetID).className = "active";
	await wait(1250);
	topnavi.className = "topnavi";
}

const switchMainContentActive = async (targetID) => {
	//Deactivate all
	targetID = targetID.slice(5);
	const mainContent = document.getElementById("mainContent");
	const sideContent = document.getElementById("sideContent");
	mainContentChildren = mainContent.children;
	sideContentChildren = sideContent.children;
	for(let i = 0; i < mainContentChildren.length; i++){
		mainContentChildren[i].className = "hideContent";
	}
	for(let i = 0; i < sideContentChildren.length; i++){
		sideContentChildren[i].className = "hideContent";
	}
	await wait(500);
	for(let i = 0; i < mainContentChildren.length; i++){
		mainContentChildren[i].style.display = "none";
	}
	for(let i = 0; i < sideContentChildren.length; i++){
		sideContentChildren[i].style.display = "none";
	}


	//Activate the selected one
	const targetElement = document.getElementById(targetID);
	targetElement.style.display = "block";
	targetElement.className = "showContent"
	for(let i = 0; i < sideContentChildren.length; i++){
		sideContentChildren[i].style.display = "block";
		sideContentChildren[i].className = "showContent"
	}
}

const wait = millisec => {
	return new Promise((resolve, reject) => {
		setTimeout(() => resolve(), millisec)
	});
}