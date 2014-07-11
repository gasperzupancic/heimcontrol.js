
require([ "jquery", "/socket.io/socket.io.js" ], function() {

  

  var socket = io.connect();
  var chart;
  /**
   * DHT22 sensor data received
   */
  socket.on('dht22-sensor', function(data) {
  	console.log("dht22-sensor " + data);
    $('.value[data-id="' + data.id + 't"]').text(data.value[0]);
    $('.value[data-id="' + data.id + 'h"]').text(data.value[1]);

    /*
    d = new Date();
    temp.push( [ d, data.value[0] ] );
    hum.push( [ d, data.value[1] ] );
    var series = chart.series[0],
        shift = series.data.length > 20; // shift if the series is 
                                                 // longer than 20
    // add the point
    chart.series[0].addPoint([ d, data.value[0] ], true, shift);
    //chart.series[1].addPoint([ d, data.value[1] ], true, shift);
    */
  });
 

  $(function () {
    $(document).ready(function() {
      var sensor_id = $('.plugin-container.dht22').attr('id');
      var options = {
          chart: {
              renderTo: sensor_id + '-graph',
              type: 'spline'
          },
          title: {
              text: 'DHT22'
          },
          xAxis: {
              type: 'datetime',
              tickPixelInterval: 1500
          },
          yAxis: {
            title: {
                text: 'Value'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            formatter: function() {
                    return '<b>'+ this.series.name +'</b><br/>'+
                    Highcharts.dateFormat('%Y-%m-%d %H:%M:%S',  this.x) + '<br/>'+
                    Highcharts.numberFormat(this.y, 2);
            }
        },
        legend: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
          series: [{}, {}]
      };

      $.post( "/api/dht22", { "method": "logs", "sensor_id" : sensor_id }, function( records ) {
          options.series[0].data = [], options.series[1].data = [];
          records.forEach(function(record){
            options.series[0].data.push([  new Date(record.timestamp * 1000).getTime(), record.temp ]);
            options.series[1].data.push([  new Date(record.timestamp * 1000).getTime(), record.hum ]);
          });         
          var chart = new Highcharts.Chart(options);
      });
    });
  });
/*
  function requestData() {
                // generate an array of random data
                $.post( "/api/dht22", { "method": "logs", "sensor_id" : '53bc36f9e295089240c6c8b2' }, function( records ) {
                    var t = [];
                    records.forEach(function(record){
                      t.push([ record.timestamp, record.temp ]);
                    });
                    chart.series[0].addPoint([ d, data.value[0] ], true, shift);
                }, "json");                            
  }

    $('#53bc36f9e295089240c6c8b2-graph').highcharts({
        chart: {
            type: 'spline',
            animation: Highcharts.svg, // don't animate in old IE
            marginRight: 10,
            events: {
                load: requestData
            }
        },
        title: {
            text: 'DHT22'
        },
        xAxis: {
            type: 'datetime',
            tickPixelInterval: 150
        },
        yAxis: {
            title: {
                text: 'Value'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        tooltip: {
            formatter: function() {
                    return '<b>'+ this.series.name +'</b><br/>'+
                    Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) +'<br/>'+
                    Highcharts.numberFormat(this.y, 2);
            }
        },
        legend: {
            enabled: false
        },
        exporting: {
            enabled: false
        },
        series: [{
            name: 'Temperature',
            data: []
        }]
    });
*/
});
