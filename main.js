var statistics = new Array();
/* Setup parameters */
let proprieties = {
	addressSize: 16, // If this number is too big, the number 2**addressSize may overflow the number size
	nodesNumber: 20
}

var url = new URL(window.location.href);
var nn = url.searchParams.get("nn");
if(nn != null){
	proprieties.nodesNumber = nn;
}

/* BEGIN SUPPORT FUNCTIONS */
var time = 0;
Array.prototype.toLong = function(){
	/* Transform byte array into long */
	var value = 0;
    for ( var i = this.length - 1; i >= 0; i--) {
        value = (value * 256) + this[i];
    }

    return value;
}
Array.prototype.lastElement = function(){
	return this[this.length-1];
}
BigNumber.config({ POW_PRECISION: 200, EXPONENTIAL_AT: 100 })
let random = function(start, end){ //Big Number random
	return (BigNumber.random().times((end.minus(start)))).integerValue().plus(start); 
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
		if (window.navigator.msSaveOrOpenBlob) // IE10+
			window.navigator.msSaveOrOpenBlob(file, filename);
		else { // Others
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
		}
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
			let maxId = (2**proprieties.addressSize)-1;
			return this.inRange(id, start, maxId) || this.inRange(id, 0, end);
		}
	}

	static modulus(x, m){
      let hash = sha1.create();
      hash.update(x);
      return hash.digest(x).slice(20-Math.floor(m/8));
    }

    static random(start, end){
		return (BigNumber.random().times((end.minus(start)))).integerValue().plus(start); 
    }

}
/* END SUPPORT FUNCTIONS*/

const maxId = 2**proprieties.addressSize;
class Chord { //Main object, coordinator of the system
	constructor(addressSize, nodesNumber){
		this.nodes = new Array(nodesNumber); // Nodes array
		this.addressSize = addressSize; 
		this.nodesNumber = nodesNumber;
		var maxId = (new BigNumber(2)).pow(addressSize);
		var nodeIds = [];
		for(let i = 0; i<nodesNumber; i++){
			var id;
			do{
				id = sha1.withmodulus(B.random(0, maxId).toString(), addressSize).toLong();
			}while(nodeIds.includes(id));
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
					statistics.lastElement().steps.push(this.id);
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
			this.samples[i] = {randomKey: B.modulus(""+Math.random(), this.addressSize).toLong()};
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

