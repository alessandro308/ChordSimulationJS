var min_val = Math.min(...statistics.map(e => e.steps.length));
var max_val = Math.max(...statistics.map(e => e.steps.length));

var categories = new Array(max_val-min_val+1);
var counting = statistics.map(e => e.steps.length).reduce(function (acc, curr) {
    if (typeof acc[curr] == 'undefined') {
      acc[curr] = 1;
    } else {
      acc[curr] += 1;
    }
  
    return acc;
  }, {});
var series = [];
for(let i = 0; i<=max_val-min_val; i++){
    categories[i]=i+min_val;
    series[i] = counting[i+min_val];
}

var subtext = 'Computed on this simulation, every time this page is loaded' + 
    ` - Remamber: log(node_number=${proprieties.nodesNumber})=`+Math.log(proprieties.nodesNumber);

Highcharts.chart('container', {
    chart: {
        type: 'column'
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
        data: series
    }]
});

var data = [];
for(let i = 0; i<proprieties.nodesNumber; i++){
    data[chord.nodes[i].id] = {id: chord.nodes[i].id,  count:0};
}

for(let i = 0; i<statistics.length; i++){
    var steps = statistics[i].steps;
    for(var j = 0; j<steps.length; j++){
        data[steps[j]].count++;
    }
}

var categories1 = [];
var series1 = [];
for(let i = 0; i<chord.nodes.length; i++){
    var elem = data[chord.nodes[i].id];
    categories1.push(elem.id);
    series1.push(elem.count);
}

var distance = [];
for(i=1; i<chord.nodes.length; i++){
    distance[i-1] = (chord.nodes[i].id - chord.nodes[i-1].id);
}
console.log(distance);

Highcharts.chart('container1', {
    chart: {
        type: 'column'
    },
    title: {
        text: 'Number of queries per node'
    },
    subtitle: {
        text: `Computed on ${chord.samples.length} lookups`
    },
    xAxis: {
        title: {
            label: "Node"
        },
        categories: data.map(e => e.id)
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
        name: 'Number of key that requires this number of steps',
        data: series1
    }]
});

Highcharts.chart('container2', {
    chart: {
        type: 'column'
    },
    title: {
        text: 'Distance between the node and the previous one'
    },
    subtitle: {
        text: "i.e. The number of keys that a node owns"
    },
    xAxis: {
        title: {
            label: "Node"
        },
        categories: data.map(e => e.id)
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
    series: [{name: "Distance from the previous node", data: distance}]
});