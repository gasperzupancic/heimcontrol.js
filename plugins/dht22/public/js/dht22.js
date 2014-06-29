
require([ "jquery", "/socket.io/socket.io.js" ], function() {

  var socket = io.connect();

  /**
   * DHT22 sensor data received
   */
  socket.on('dht22-sensor', function(data) {
    $('.value[data-id="' + data.id + '"]').text(data.value);
  });

});
