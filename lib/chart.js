'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/*
    This files parse the date in order to produce significant graphs.

*/
var min_val = Math.min.apply(Math, _toConsumableArray(statistics.map(function (e) {
    return e.steps.length;
})));
var max_val = Math.max.apply(Math, _toConsumableArray(statistics.map(function (e) {
    return e.steps.length;
})));

var categories = new Array(max_val - min_val + 1);
var counting = statistics.map(function (e) {
    return e.steps.length;
}).reduce(function (acc, curr) {
    if (typeof acc[curr] == 'undefined') {
        acc[curr] = 1;
    } else {
        acc[curr] += 1;
    }

    return acc;
}, {});
var series = [];
for (var _i = 0; _i <= max_val - min_val; _i++) {
    categories[_i] = _i + min_val;
    series[_i] = counting[_i + min_val];
}

var subtext = 'Computed on this simulation, every time this page is loaded' + (' - Remamber: log(node_number=' + proprieties.nodesNumber + ')=') + Math.log(proprieties.nodesNumber);

/*Number of step to find the owner of a key*/
Highcharts.chart('container', {
    chart: {
        type: 'column',
        width: 600,
        style: {
            fontFamily: 'serif',
            color: "#ff5b5b"
        }
    },
    title: {
        text: 'Number of step to find the owner of a key'
    },
    subtitle: {
        text: subtext
    },
    xAxis: {
        title: {
            label: "Number of steps"
        },
        categories: categories
    },
    yAxis: {
        title: {
            text: "Frequency"
        }
    },
    plotOptions: {
        line: {
            dataLabels: {
                enabled: true
            },
            enableMouseTracking: false
        }
    },
    series: [{
        name: 'Number of key that requires this number of steps',
        data: series,
        color: "#ff0000"
    }]
});

/*Number of queries per node & Distance between the node and the previous one*/
var data = [];
for (var _i2 = 0; _i2 < proprieties.nodesNumber; _i2++) {
    data[chord.nodes[_i2].id] = { id: chord.nodes[_i2].id, count: 0 };
}

for (var _i3 = 0; _i3 < statistics.length; _i3++) {
    var steps = statistics[_i3].steps;
    for (var j = 0; j < steps.length; j++) {
        data[steps[j]].count++;
    }
}

var categories1 = [];
var series1 = [];
for (var _i4 = 0; _i4 < chord.nodes.length; _i4++) {
    var elem = data[chord.nodes[_i4].id];
    categories1.push(elem.id);
    series1.push(elem.count);
}

var distance = [];
for (var i = 1; i < chord.nodes.length; i++) {
    distance[i] = chord.nodes[i].id - chord.nodes[i - 1].id;
}
distance[0] = Math.pow(2, proprieties.addressSize) - chord.nodes.lastElement().id + chord.nodes[0].id;

Highcharts.chart('container1', {
    chart: {
        type: 'column',
        width: 600
    },
    title: {
        text: 'Number of queries per node'
    },
    subtitle: {
        text: 'Computed on ' + chord.samples.length + ' lookups'
    },
    xAxis: {
        title: {
            label: "Node"
        },
        categories: data.map(function (e) {
            return e.id;
        })
    },
    yAxis: {
        title: {
            text: "Number of queries"
        }
    },
    plotOptions: {
        line: {
            dataLabels: {
                enabled: true
            },
            enableMouseTracking: false
        }
    },
    series: [{
        name: 'Number of lookup that a node has performed to resolve the samples',
        data: series1
    }]
});

var mean = distance.reduce(function (prev, curr, i, arra) {
    prev += curr;
    return prev;
}, 0) / chord.nodesNumber;
var maxID = Math.pow(2, proprieties.addressSize) - 1;

Highcharts.chart('container2', {
    chart: {
        type: 'column',
        width: 600
    },
    title: {
        text: 'Distance between the node and the previous one'
    },
    subtitle: {
        text: 'i.e. The number of keys that a node owns | Mean Value: ' + mean + ' - Expected one: ' + maxID / proprieties.nodesNumber
    },
    xAxis: {
        title: {
            label: "Node"
        },
        categories: data.map(function (e) {
            return e.id;
        })
    },
    yAxis: {
        title: {
            text: "Number of key owned"
        }
    },
    plotOptions: {
        line: {
            dataLabels: {
                enabled: true
            },
            enableMouseTracking: false
        }
    },
    series: [{ name: "Distance from the previous node", data: distance }]
});

/* InEdge counter */
var nodeInEdge = [];
for (var _i5 = 0; _i5 < proprieties.nodesNumber; _i5++) {
    nodeInEdge[chord.nodes[_i5].id] = { id: chord.nodes[_i5].id, count: 0 };
}

var data3 = [];
chord.nodes.forEach(function (e, i) {
    var finger = e.finger;
    var fingerNoDupli = finger.reduce(function (out, val, i, arr) {
        if (!out.includes(val)) {
            out.push(val);
        }
        return out;
    }, []);
    for (var _i6 = 0; _i6 < fingerNoDupli.length; _i6++) {
        nodeInEdge[fingerNoDupli[_i6]].count++;
    }
    data3[i] = { out: fingerNoDupli.length };
});

for (var _i7 = 0; _i7 < proprieties.nodesNumber; _i7++) {
    data3[_i7].in = nodeInEdge[chord.nodes[_i7].id].count;
}
console.log(data3);

Highcharts.chart('container3', {
    chart: {
        type: 'column',
        width: 600
    },
    title: {
        text: 'Connections between nodes'
    },
    subtitle: {
        text: "i.e. The connection in the graph"
    },
    xAxis: {
        title: {
            label: "Node"
        },
        categories: data.map(function (e) {
            return e.id;
        })
    },
    yAxis: {
        title: {
            text: "Number of connection"
        }
    },
    plotOptions: {
        line: {
            dataLabels: {
                enabled: true
            },
            enableMouseTracking: false
        }
    },
    series: [{ name: "Number of in-edge", data: data3.map(function (e) {
            return e.in;
        }) }, { name: "Number of out-edge (without repetition)", data: data3.map(function (e) {
            return e.out;
        }) }]
});