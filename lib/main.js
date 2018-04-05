"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var statistics = new Array();
/* Setup parameters */
var proprieties = {
	addressSize: 16, // If this number is too big, the number 2**addressSize may overflow the number size
	nodesNumber: 20
};
var MAXID = Math.pow(2, proprieties.addressSize) - 1;

var url = new URL(window.location.href);
var nn = url.searchParams.get("nn");
if (nn != null) {
	proprieties.nodesNumber = nn;
}

/* BEGIN SUPPORT FUNCTIONS */
var time = 0;
Array.prototype.toLong = function () {
	/* Transform byte array into long */
	var value = 0;
	for (var i = this.length - 1; i >= 0; i--) {
		value = value * 256 + this[i];
	}

	return value;
};
Array.prototype.lastElement = function () {
	return this[this.length - 1];
};
BigNumber.config({ POW_PRECISION: 200, EXPONENTIAL_AT: 100 });
var random = function random(start, end) {
	//Big Number random
	return BigNumber.random().times(end.minus(start)).integerValue().plus(start);
};

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
			if (window.navigator.msSaveOrOpenBlob) // IE10+
				window.navigator.msSaveOrOpenBlob(file, filename);else {
				// Others
				var a = document.createElement("a"),
				    url = URL.createObjectURL(file);
				a.href = url;
				a.download = filename;
				document.body.appendChild(a);
				a.click();
				setTimeout(function () {
					document.body.removeChild(a);
					window.URL.revokeObjectURL(url);
				}, 0);
			}
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
	}, {
		key: "modulus",
		value: function modulus(x, m) {
			var hash = sha1.create();
			hash.update(x);
			return hash.digest(x).slice(20 - Math.floor(m / 8));
		}
	}, {
		key: "random",
		value: function random(start, end) {
			return BigNumber.random().times(end.minus(start)).integerValue().plus(start);
		}
	}]);

	return B;
}();
/* END SUPPORT FUNCTIONS*/

var maxId = Math.pow(2, proprieties.addressSize);

var Chord = function () {
	//Main object, coordinator of the system
	function Chord(addressSize, nodesNumber) {
		_classCallCheck(this, Chord);

		this.nodes = new Array(nodesNumber); // Nodes array
		this.addressSize = addressSize;
		this.nodesNumber = nodesNumber;
		var maxId = new BigNumber(2).pow(addressSize);
		var nodeIds = [];
		for (var i = 0; i < nodesNumber; i++) {
			var id;
			do {
				id = sha1.withmodulus(B.random(0, maxId).toString(), addressSize).toLong();
			} while (nodeIds.includes(id));
			nodeIds.push(id);
			this.nodes[i] = { //Initialization of the node
				manager: this, // Pointer to the coordinator
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
					statistics.lastElement().steps.push(this.id);
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
		}

		// Sort the nodes in order to manage them easily
		B.println("Created " + nodesNumber + " random nodes");
		this.nodes.sort(function (a, b) {
			return a.id - b.id;
		});

		this.nodeIds = this.nodes.map(function (e) {
			return e.id;
		});
		for (var _i = 0; _i < nodesNumber; _i++) {
			var node = this.nodes[_i];
			node.successor = this.nodes[(_i + 1) % nodesNumber].id;
			node.predecessor = this.nodes[(_i + nodesNumber - 1) % nodesNumber].id;
			node.finger[0] = this.nodes[_i].id;

			for (var _i2 = 1; _i2 <= addressSize; _i2++) {
				//Compute the fingerprints for each node
				var nx2_powi = Math.floor((node.id + Math.pow(2, _i2 - 1)) % maxId);
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
				this.samples[i] = { randomKey: B.modulus("" + Math.random(), this.addressSize).toLong() };
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