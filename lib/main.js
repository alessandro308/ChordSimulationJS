"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var statistics = new Array();
/* Setup parameters */
var nn = new URLSearchParams(location.search).get("nn");
var proprieties = {
	addressSize: 16, // If this number is too big, the number 2**addressSize may overflow the number size
	nodesNumber: nn ? Number(nn) : 20
};
var MAXID = Math.pow(2, proprieties.addressSize) - 1;
var uint8 = new Uint8Array(20);

/** @param {Uint8Array} buffer */
function buf2hex(buffer) {
	return [].concat(_toConsumableArray(buffer)).map(function (b) {
		return b.toString(16).padStart(2, "0");
	}).join("");
}

/** @param {string} hex */
function hex2int(hex) {
	return BigInt('0x' + hex);
}

function random() {
	var bigInt = hex2int(buf2hex(crypto.getRandomValues(uint8)));
	return Number(BigInt.asUintN(proprieties.addressSize, bigInt));
}

/* BEGIN SUPPORT FUNCTIONS */
var time = 0;
function lastElement(array) {
	return array[array.length - 1];
}

/* Initialization and support functions */

var B = function () {
	function B() {
		_classCallCheck(this, B);
	}

	_createClass(B, null, [{
		key: "println",
		//Boilerplate
		value: function println(msg) {
			// Just a log function
			document.getElementById("log-ul").innerHTML += "<br/><li>" + msg + "</li>";
		}
	}, {
		key: "download",
		value: function download(filename, type) {
			chord.nodes.forEach(function (e) {
				return e.manager = null;
			});
			var data = JSON.stringify(chord);
			var file = new Blob([data], { type: type });
			var a = document.createElement("a"),
			    url = URL.createObjectURL(file);
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			setTimeout(function () {
				document.body.removeChild(a);
				URL.revokeObjectURL(url);
			}, 0);
			chord.nodes.forEach(function (e) {
				return e.manager = chord;
			});
		}
	}, {
		key: "inRange",
		value: function inRange(id, start, end) {
			time++;
			if (start == end) {
				return id == end;
			}
			if (start < end) {
				// Normal case
				return id <= end && id > start;
			} else {
				// Where in the range there is 0
				// LINEA DELLA MORTE!!!!
				return this.inRange(id, start, maxId) || this.inRange(id, 0, end);
			}
		}
	}]);

	return B;
}();
/* END SUPPORT FUNCTIONS*/

var maxId = Math.pow(2, proprieties.addressSize);

var Chord = function () {
	//Main object, coordinator of the system
	function Chord(addressSize, nodesNumber) {
		var _this = this;

		_classCallCheck(this, Chord);

		this.nodes = new Array(nodesNumber); // Nodes array
		this.addressSize = addressSize;
		this.nodesNumber = nodesNumber;
		var nodeIds = [];

		var _loop = function _loop(i) {
			var id = void 0;
			do {
				id = random();
			} while (nodeIds.includes(id));
			nodeIds.push(id);
			_this.nodes[i] = { //Initialization of the node
				manager: _this, // Pointer to the coordinator
				id: id,
				successor: 0,
				predecessor: 0,
				finger: [],
				findPredecessor: function findPredecessor(id) {
					var i = 0;
					while (i < this.finger.length && !B.inRange(id, this.finger[i], this.finger[(i + 1) % this.finger.length])) {
						i++;
					}
					return this.finger[i];
				},
				_lookup: function _lookup(_id) {
					// Real lookup function
					lastElement(statistics).steps.push(this.id);
					if (B.inRange(_id, this.id, this.successor)) {
						return this.successor;
					}
					var predecessor = this.findPredecessor(_id);
					var nod = this.manager.getNodeById(predecessor);
					var res = nod._lookup(_id);
					return res;
				},
				lookup: function lookup(_id) {
					// Lookup function that produce statistics
					statistics.push({ nodeId: this.id, key: id, steps: [] });
					return this._lookup(_id);
				}
			};
		};

		for (var i = 0; i < nodesNumber; i++) {
			_loop(i);
		}

		// Sort the nodes in order to manage them easily
		B.println("Created " + nodesNumber + " random nodes");
		this.nodes.sort(function (a, b) {
			return a.id - b.id;
		});

		this.nodeIds = this.nodes.map(function (e) {
			return e.id;
		});
		for (var i = 0; i < nodesNumber; i++) {
			var node = this.nodes[i];
			node.successor = this.nodes[(i + 1) % nodesNumber].id;
			node.predecessor = this.nodes[(i + nodesNumber - 1) % nodesNumber].id;
			node.finger[0] = this.nodes[i].id;

			for (var _i = 1; _i <= addressSize; _i++) {
				//Compute the fingerprints for each node
				var nx2_powi = Math.floor((node.id + Math.pow(2, _i - 1)) % maxId);
				var succ = this.findSuccessor(nx2_powi);
				if (succ != node.id) node.finger.push(succ);
			}
		}

		this.generateSamples = this.generateSamples.bind(this);
		this.findSuccessor = this.findSuccessor.bind(this);
		this.generateSamples();
	}

	_createClass(Chord, [{
		key: "generateSamples",
		value: function generateSamples() {
			this.samples = Array(this.nodesNumber);
			for (var i = 0; i < this.nodesNumber; i++) {
				this.samples[i] = { randomKey: random() };
				//B.println(`Node #${i}:${this.nodes[i].id} have to search for ${this.samples[i].randomKey}`);
			}
		}
	}, {
		key: "findSuccessor",
		value: function findSuccessor(id) {
			var i = 0;
			var array = this.nodeIds;
			while (i < array.length) {
				if (B.inRange(id, array[i], array[(i + 1) % array.length])) {
					break;
				}
				i++;
			}
			return array[(i + 1) % array.length];
		}
	}, {
		key: "getNodeById",
		value: function getNodeById(id) {
			return this.nodes.filter(function (e) {
				return e.id == id;
			})[0];
		}
	}]);

	return Chord;
}();

var chord = new Chord(proprieties.addressSize, proprieties.nodesNumber);
B.println("EXECUTING SAMPLES");

chord.samples.forEach(function (e, i) {
	var res = chord.nodes[i].lookup(e.randomKey);
	B.println("Node [" + i + "] " + chord.nodes[i].id + " found " + res + " as owner of " + e.randomKey);
});