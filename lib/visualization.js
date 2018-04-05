"use strict";

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var node = chord.nodes.slice(0).map(function (e) {
	return e.id;
});
var drawid = 0;
var showText = true;
var gui;
function removeDuplicates(arr) {
	var unique_array = [];
	for (var i = 0; i < arr.length; i++) {
		if (unique_array.indexOf(arr[i]) == -1) {
			unique_array.push(arr[i]);
		}
	}
	return unique_array;
}

function drawFingerprint(_node, color) {
	var a = map(_node.id, 0, new BigNumber(2).pow(chord.addressSize).toNumber(), 0, TWO_PI) - HALF_PI;
	var x = 300 * cos(a);
	var y = 300 * sin(a);
	var fingerIds = removeDuplicates(_node.finger);

	for (var i = 0; i < fingerIds.length; i++) {
		var a1 = map(fingerIds[i], 0, new BigNumber(2).pow(chord.addressSize).toNumber(), 0, TWO_PI) - HALF_PI;
		var x1 = 300 * cos(a1);
		var y1 = 300 * sin(a1);
		stroke(color);
		line(x, y, x1, y1);
		noStroke();
	}
}

var ids = chord.nodes;

function setup() {
	var canvas = createCanvas(720, 720);
	canvas.parent("canvas");
	background(0xf0f0f0);
	translate(width / 2, height / 2);
	for (var i = 0; i < chord.nodesNumber; i++) {
		var a = map(chord.nodes[i].id, 0, new BigNumber(2).pow(chord.addressSize).toNumber(), 0, TWO_PI) - HALF_PI;
		var x = 300 * cos(a);
		var y = 300 * sin(a);
		textSize(12);
		fill(0, 102, 153);
		text(chord.nodes[i].id, x + 10, y + 10);
		fill(0xfff);
		ellipse(x, y, 5, 5);
	}
	noFill();
	stroke(color(0, 0, 0, 80));
	ellipse(0, 0, 600, 600);
	line(0, -310, 0, -290);
	text("0", -2, -315);

	sliderRange(0, Math.pow(2, 16), 1);
	gui = createGui('Controller', 650, 50);
	gui.addGlobals("node", "drawid", "showText");
	noLoop();
	var canvas = document.getElementById("defaultCanvas0");

	driver.defineSteps([{
		element: '#defaultCanvas0',
		popover: {
			title: 'Chord Network',
			description: 'A visualizazion of the network, randomly generated',
			position: 'right'
		}
	}, {
		element: ".qs_main",
		popover: {
			title: "Controllers",
			description: "The controllers of the networks. Try to change the node to overlight another node's fingerprints",
			position: "right"
		}
	}, {
		element: "#container",
		popover: {
			title: "Analysis: 1/4",
			description: "Here there is shown how many steps (nodes) a query has to travers to find the owner. We expects this value near the log(number_of_nodes)." + "This is the most importart result, that influence the performance, so I underlight it in red.",
			position: "right"
		}
	}, {
		element: "#container1",
		popover: {
			title: "Analysis: 2/4",
			description: "Here there are shown how many times a node has performed a research on its fingerprint. ",
			position: "left"
		}
	}, {
		element: "#container2",
		popover: {
			title: "Analysis: 3/4",
			description: "Which is the distance from a predecessor to a node? Here it is rappresented by the height to the column" + "Of course, larger is the distance, more keys a node owns, more time it is invoke to lookup a key." + "In our model, we expect to have those values equal due the randomess of the nodes. It is not? Try to increase the node number",
			position: "right"
		}
	}, {
		element: "#nn",
		popover: {
			title: "Increase the number of the nodes",
			description: "Try to increase the number of the node to perform a more general analysis. Try with: 100",
			position: "left"
		}
	}, {
		element: "#container3",
		popover: {
			title: "Analysis: 4/4",
			description: "The last one! It shown how many edge a node has: in and out edge. Of course the edge are the id_size" + ", i.e. the length of the fingerprint, but here I shown only different out-edge, so if there are 3 fingerprints that are" + "equal, they count 1",
			position: "left"
		}
	}, {
		element: "#btn",
		popover: {
			title: "Don't forget to try it!",
			description: "Oh, don't forget to push this button to apply a new number of nodes! That's all!",
			position: "left"
		}
	}]);
	if (document.cookie == "") {
		document.cookie = "username=chord";
		driver.start();
	}
	document.getElementById("nn").value = proprieties.nodesNumber;
}

function draw() {
	background(0xf0f0f0);
	for (var i = 0; i < chord.nodesNumber; i++) {
		var _a = map(chord.nodes[i].id, 0, new BigNumber(2).pow(chord.addressSize).toNumber(), 0, TWO_PI) - HALF_PI;
		var _x = 300 * cos(_a);
		var _y = 300 * sin(_a);
		if (showText) {
			textSize(12);
			fill(0, 102, 153);
			text(chord.nodes[i].id, _x + 10, _y + 10);
		}
		fill(0xfff);
		ellipse(_x, _y, 5, 5);
	}
	noFill();
	stroke(color(0, 0, 0, 80));
	ellipse(0, 0, 600, 600);
	line(0, -310, 0, -290);
	text("0", -2, -315);
	for (var _i = 0; _i < ids.length; _i++) {
		drawFingerprint(ids[_i], color(0, 0, 0, 30));
	}
	drawFingerprint(chord.getNodeById(parseInt(node)), color(255, 0, 0));
	var val = drawid;
	var a = map(val, 0, new BigNumber(2).pow(chord.addressSize).toNumber(), 0, TWO_PI) - HALF_PI;
	var x = 300 * cos(a);
	var y = 300 * sin(a);
	fill(color(255, 0, 0));
	ellipse(x, y, 5, 5);
}

var driver = new Driver(_defineProperty({ animate: true, showButtons: false, allowClose: true }, "showButtons", true));

document.getElementById("btn").onclick = function () {
	var val = document.getElementById("nn").value;
	var n = parseInt(val);
	if (!isNaN(n)) {
		window.location.replace(location.protocol + '//' + location.host + location.pathname + "?nn=" + n);
	}
};