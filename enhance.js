"use strict";

var c = document.getElementById("canvas");
var ctx = c.getContext("2d");
c.width = 512;
c.height = 512;

var logoCropHeight = 64;

ctx.strokeStyle = "#0F0";
ctx.strokeWidth = 3;

var locationInput = document.getElementById("locationInput");
var goBtn = document.getElementById("goBtn");

var mapLocation = "";
var zoomLevel;
var zoomLoop;
var segments = 8;
var renderQueue = [];
var image = new Image();

image.onload = function() {
	for (var y=0; y<segments; y++) for (var x=0; x<segments; x++) {
		renderQueue.push([x,y]);
	}
	zoomLoop = 1;
	renderLoop();
}

var loadImage = function() {
	if (zoomLevel <= 20) {
		drawGrid();
		image.src = "https://maps.googleapis.com/maps/api/staticmap?center=" + mapLocation + "&zoom=" + zoomLevel + "&size=" + c.width + "x" + (c.height + logoCropHeight) + "&maptype=satellite"// TODO do this properly
		zoomLevel += 2;
	} else {
		//done
	}
}

goBtn.onclick = function() {
	mapLocation = locationInput.value;
	
	if (mapLocation == "") {
		alert("Please enter a location");
		return;
	}
	
	zoomLevel = 10;
	
	ctx.fillRect(0, 0, c.width, c.height); //clear canvas
	
	loadImage();
};

var drawGrid = function() {
	ctx.beginPath();
	for (var x=1; x<segments; x++) {
		ctx.moveTo(x*(c.width/segments), 0);
		ctx.lineTo(x*(c.width/segments), c.height);
	}
	for (var y=1; y<segments; y++) {
		ctx.moveTo(0, y*(c.height/segments));
		ctx.lineTo(c.width, y*(c.height/segments));
	}
	ctx.stroke();
}

var renderLoop = function() {
	if (renderQueue.length > 0) {
		var pos = renderQueue.shift();
		var x = pos[0];
		var y = pos[1];
		var xPos = (c.width*x)/segments;
		var yPos = (c.height*y)/segments;
		var width = c.width/segments;
		var height = c.height/segments;
		ctx.drawImage(image, xPos, yPos+(logoCropHeight/2), width, height, xPos, yPos, width, height);
		window.setTimeout(function(){window.requestAnimationFrame(renderLoop)}, 40);
	} else if (zoomLoop < 4) {
		zoomLoop += 0.05;
		var width = image.width * zoomLoop;
		var height = image.height * zoomLoop;
		var rectSize = ((c.width*zoomLoop)/4)
		ctx.drawImage(image, (image.width-width)/2, (c.height-height)/2, width, height);
		ctx.strokeRect((c.width-rectSize)/2, (c.width-rectSize)/2, rectSize, rectSize);
		window.requestAnimationFrame(renderLoop);
	} else {
		loadImage();
	}
}
