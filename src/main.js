var statistics = new Array();
/* Setup parameters */
const nn = new URLSearchParams(window.location.search).get("nn");
const proprieties = {
	addressSize: 16, // If this number is too big, the number 2**addressSize may overflow the number size
	nodesNumber: nn ? Number(nn) : 20
}
const MAXID = (2**proprieties.addressSize)-1;
const uint8 = new Uint8Array(20)

/** @param {Uint8Array} buffer */
function buf2hex (buffer) {
	return [...buffer].map(b => b.toString(16).padStart(2, "0")).join("");
}

/** @param {string} hex */
function hex2int (hex) {
	return BigInt('0x' + hex);
}

function random() {
	const bigInt = hex2int(buf2hex(crypto.getRandomValues(uint8)))
	return Number(BigInt.asUintN(proprieties.addressSize, bigInt))
}

/* BEGIN SUPPORT FUNCTIONS */
var time = 0;
function toLong(array){
	/* Transform byte array into long */
	var value = 0;
    for ( var i = array.length - 1; i >= 0; i--) {
        value = (value * 256) + array[i];
    }

    return value;
}
function lastElement(array){
	return array[array.length-1];
}

/* Initialization and support functions */
class B { //Boilerplate
	static println(msg){ // Just a log function
		document.getElementById("log-ul").innerHTML += `<br/><li>${msg}</li>`;
	}

	static download(filename, type) {
		chord.nodes.forEach(e => e.manager = null);
		var data = JSON.stringify(chord);
		var file = new Blob([data], {type: type});
		var a = document.createElement("a"),
				url = URL.createObjectURL(file);
		a.href = url;
		a.download = filename;
		document.body.appendChild(a);
		a.click();
		setTimeout(function() {
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		}, 0);
		chord.nodes.forEach(e => e.manager = chord);
	}

	static inRange(id, start, end){
		time++
		if(start == end){
			return id == end;
		}
		if(start < end){ // Normal case
			return id<=end && id > start;
		} else { // Where in the range there is 0
			// LINEA DELLA MORTE!!!!
			return this.inRange(id, start, maxId) || this.inRange(id, 0, end);
		}
	}
}
/* END SUPPORT FUNCTIONS*/

const maxId = 2**proprieties.addressSize;
class Chord { //Main object, coordinator of the system
	constructor(addressSize, nodesNumber){
		this.nodes = new Array(nodesNumber); // Nodes array
		this.addressSize = addressSize;
		this.nodesNumber = nodesNumber;
		var nodeIds = [];
		for (let i = 0; i<nodesNumber; i++) {
			let id;
			do {
				id = random()
			} while (nodeIds.includes(id));
			nodeIds.push(id);
			this.nodes[i] = { //Initialization of the node
				manager: this, // Pointer to the coordinator
				id: id,
				successor: 0,
				predecessor: 0,
				finger: [],
				findPredecessor: function(id){
					let i = 0
					while(i < this.finger.length && !B.inRange(id, this.finger[i], this.finger[(i+1)%this.finger.length])){
						i++;
					}
					return this.finger[i];
				},
				_lookup: function(_id){ // Real lookup function
					lastElement(statistics).steps.push(this.id);
					if(B.inRange(_id, this.id, this.successor)){
						return this.successor;
					}
					let predecessor = this.findPredecessor(_id);
					var nod = this.manager.getNodeById(predecessor);
					var res = nod._lookup(_id);
					return res;
				},
				lookup: function(_id){ // Lookup function that produce statistics
					statistics.push({nodeId: this.id, key: id, steps: []});
					return this._lookup(_id);
				}
			}
		}

		// Sort the nodes in order to manage them easily
		B.println("Created "+nodesNumber+" random nodes");
		this.nodes.sort(function(a, b){
			return a.id- b.id;
		});

		this.nodeIds = this.nodes.map(e => e.id);
		for(let i = 0; i<nodesNumber; i++){
			let node = this.nodes[i];
			node.successor = this.nodes[(i+1)%nodesNumber].id;
			node.predecessor = this.nodes[(i+nodesNumber-1)%nodesNumber].id;
			node.finger[0]=this.nodes[i].id;

			for(let i = 1; i<=addressSize; i++){ //Compute the fingerprints for each node
				let nx2_powi = Math.floor((node.id+2**(i-1))%maxId);
				let succ = this.findSuccessor(nx2_powi);
				if(succ != node.id)
					node.finger.push(succ);
			}
		}

		this.generateSamples = this.generateSamples.bind(this);
		this.findSuccessor = this.findSuccessor.bind(this);
		this.generateSamples();
	}

	generateSamples(){
		this.samples = Array(this.nodesNumber);
		for(let i = 0; i<this.nodesNumber; i++){
			this.samples[i] = { randomKey: random() };
			//B.println(`Node #${i}:${this.nodes[i].id} have to search for ${this.samples[i].randomKey}`);
		}
	}
	findSuccessor(id){
		let i = 0
		let array = this.nodeIds;
		while(i < array.length){
			if(B.inRange(id, array[i], array[(i+1)%array.length])){
				break;
			}
			i++;
		}
		return array[(i+1)%array.length];
	}

	getNodeById(id){
		return this.nodes.filter(e => e.id==id)[0];
	}

}

var chord = new Chord(proprieties.addressSize, proprieties.nodesNumber);
B.println("EXECUTING SAMPLES")

chord.samples.forEach( (e, i) => {
	var res = chord.nodes[i].lookup(e.randomKey);
	B.println(`Node [${i}] ${chord.nodes[i].id} found ${res} as owner of ${e.randomKey}`);
});
