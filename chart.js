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