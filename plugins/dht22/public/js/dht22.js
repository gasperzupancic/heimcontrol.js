
require([ "jquery", "/socket.io/socket.io.js" ], function() {

  

  var socket = io.connect();
  /**
   * DHT22 sensor data received
   */
  socket.on('dht22-sensor', function(data) {
  	//console.log("dht22-sensor " + JSON.stringify(data));
    $('.value[data-id="' + data.id + 't"]').text(data.value[0]);
    $('.value[data-id="' + data.id + 'h"]').text(data.value[1]);

    var chart = $('#' + data.id + '-graph').highcharts();
    
    d = new Date();
    //temp.push( [ d, data.value[0] ] );
    //hum.push( [ d, data.value[1] ] );
    var series = chart.series[0],
        shift = series.data.length > 20; // shift if the series is 
                                                 // longer than 20
    // add the point
    chart.series[0].addPoint([ d, data.value[0] ], true, shift);
    chart.series[1].addPoint([ d, data.value[1] ], true, shift);
    
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
                text: 'Temperature & Humidity'
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
          series: [{name: "Temperature"}, {name: "Humidity"}]
      };

      $.post( "/api/dht22", { "method": "logs", "sensor_id" : sensor_id }, function( records ) {
          options.series[0].data = [], options.series[1].data = [];
          records.forEach(function(record){
            options.series[0].data.push([  new Date(record.timestamp * 1000).getTime(), record.temp ]);
            options.series[1].data.push([  new Date(record.timestamp * 1000).getTime(), record.hum ]);
          });         
          options.series[0].data.reverse();
          options.series[1].data.reverse();
          $('#' + sensor_id + '-graph').highcharts(options);
          //var chart = new Highcharts.Chart(options);
      });
    });
  });

});
