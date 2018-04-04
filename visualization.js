var node = chord.nodes.slice(0).map(e => e.id);
var drawid = 0;
var showText = true;
var gui;
function removeDuplicates(arr){
    let unique_array = []
    for(let i = 0;i < arr.length; i++){
        if(unique_array.indexOf(arr[i]) == -1){
            unique_array.push(arr[i])
        }
    }
    return unique_array;
}

function drawFingerprint(_node, color){
	let a = map(_node.id, 0, (new BigNumber(2)).pow(chord.addressSize).toNumber(), 0, TWO_PI)-HALF_PI;  
	let x = 300*cos(a);
	let y = 300*sin(a);
  	let fingerIds = removeDuplicates(_node.finger);

  	for(let i = 0; i<fingerIds.length; i++){
  		let a1 = map(fingerIds[i], 0, (new BigNumber(2)).pow(chord.addressSize).toNumber(), 0, TWO_PI)-HALF_PI;  
  		let x1 = 300*cos(a1);
  		let y1 = 300*sin(a1);
  		stroke(color);
  		line(x, y, x1, y1);
  		noStroke();
  	}
}

let ids = chord.nodes;

function setup() {
  var canvas = createCanvas(720, 720);
  canvas.parent("canvas");
  background(0xf0f0f0);
  translate(width/2, height/2);
  for(let i = 0; i<chord.nodesNumber; i++){
  	let a = map(chord.nodes[i].id, 0, (new BigNumber(2)).pow(chord.addressSize).toNumber(), 0, TWO_PI)-HALF_PI;  	
  	let x = 300*cos(a);
  	let y = 300*sin(a);
  	textSize(12);
  	fill(0, 102, 153);
  	text(chord.nodes[i].id, x+10, y+10);
  	fill(0xfff);
  	ellipse(x, y, 5, 5);
  }
  noFill();
  stroke(color(0, 0, 0, 80))
  ellipse(0, 0, 600, 600);
  line(0, -310, 0, -290);
  text("0", -2, -315);

  sliderRange(0, 2**16, 1);
  gui = createGui('Controller');
  gui.addGlobals("node", "drawid", "showText");
  noLoop();
}

function draw() {
	background(0xf0f0f0);
	for(let i = 0; i<chord.nodesNumber; i++){
		let a = map(chord.nodes[i].id, 0, (new BigNumber(2)).pow(chord.addressSize).toNumber(), 0, TWO_PI)-HALF_PI;  	
		let x = 300*cos(a);
		let y = 300*sin(a);
		if(showText){
			textSize(12);
			fill(0, 102, 153);
			text(chord.nodes[i].id, x+10, y+10);
		}
		fill(0xfff);
		ellipse(x, y, 5, 5);
	}
	noFill();
	stroke(color(0, 0, 0, 80))
	ellipse(0, 0, 600, 600);
	line(0, -310, 0, -290);
	text("0", -2, -315);
	for(let i = 0; i<ids.length; i++){
		drawFingerprint(ids[i], color(0, 0, 0, 30));
	}
	drawFingerprint(chord.getNodeById(parseInt(node)), color(255, 00, 00));
  	let val = drawid;
  	let a = map(val, 0, (new BigNumber(2)).pow(chord.addressSize).toNumber(), 0, TWO_PI)-HALF_PI;  	
  	let x = 300*cos(a);
  	let y = 300*sin(a);
  	fill(color(255,0, 0));
  	ellipse(x, y, 5, 5);
	
}
