if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define([ 'node-dht-sensor' ], function(dhtSensor) {

  /**
   * DHT22 Plugin. This plugin is able to control an DHT22 that is attached to the GPIO of the Raspberry PI
   *
   * @class DHT22
   * @param {Object} app The express application
   * @constructor 
   */
  var DHT22 = function(app) {

    this.name = 'DHT22';
    this.collection = 'DHT22';
    this.icon = 'icon-external-link';

    this.app = app;
    this.id = this.name.toLowerCase();

    this.pins = {};
    this.pluginHelper = app.get('plugin helper');

    this.values = {};

    this.sensorList = [];
    this.sensors = {};

    this.init();

    var that = this;

    app.get('events').on('settings-saved', function() {
      that.init();
    });
    
    app.get('sockets').on('connection', function(socket) {
    });
    
  };

  /**
   * Initialize the sensors attached to the DHT22
   * 
   * @method init
   */
  DHT22.prototype.init = function() {

    var that = this;
    this.sensorList.forEach(function(sensor) {
      sensor.removeAllListeners();
    });
    this.sensorList = [];

    this.sensors = {};
    return this.app.get('db').collection(that.collection, function(err, collection) {
      collection.find({
        method: 'sensor'
      }).toArray(function(err, result) {
        if ((!err) && (result.length > 0)) {
          result.forEach(function(item) {
            that.sensors[item._id] = item;
	    console.log("before sensor");
            var sensor = {
  		initialize: function() {
			console.log("dht22 init");
			//console.log(dhtSensor);
			console.log("pin " + item.pin);
    			return new dhtSensor.initialize(22, item.pin);
  		},
  		read: function() {
			console.log("dht22 read");
    			var readout = dhtSensor.read();
			item = that.sensors[this._id + ''];
              		if (isNaN(item.value)) {
                		item.value = 0;
              		}
              		item.value = parseFloat((readout.temperature).toFixed(2));
              		that.values[item._id] = item.value;
              		that.app.get('sockets').emit('dht22-sensor', {
                		id: item._id,
                		value: item.value
              		});
			console.log("item: " + item);
    			console.log('Temperatura: '+readout.temperature+'C, humidity: '+readout.humidity+'%');
    			setTimeout(function() {
      				sensor.read();
    			}, 5000);
  		}
	    };
	    console.log("after sensor");
	    if (sensor.initialize()) {
  	    	sensor.read.bind(that);
	    } else {
  	     console.warn('Failed to initialize sensor');
	    } 
	    sensor._id = item._id;
            that.sensorList.push(sensor);
          });
        }
      });
    });
  };
  /**
   * Manipulate the items array before render
   *
   * @method beforeRender
   * @param {Array} items An array containing the items to be rendered
   * @param {Function} callback The callback method to execute after manipulation
   * @param {String} callback.err null if no error occured, otherwise the error
   * @param {Object} callback.result The manipulated items
   */
  DHT22.prototype.beforeRender = function(items, callback) {
    var that = this;
    items.forEach(function(item) {
      item.value = that.values[item._id] ? that.values[item._id] : 0;
    });
    return callback(null, items);
  }

  /**
   * API functions of the DHT22 Plugin
   * 
   * @method api
   * @param {Object} req The request
   * @param {Object} res The response
   */

  DHT22.prototype.api = function(req, res, next) {
    /*
     * GET
     */
    if (req.method == 'POST') {
      var that = this;
      var method = req.body.method;
      if(method === "rcswitch") {
        this.app.get('db').collection("DHT22", function(err, collection) {
            collection.find({}).toArray(function(err, items) {
              if (!err) {
              that.beforeRender(items, function() {
                res.send(200, items);
                });
              } else {
              res.send(500, '[]');
              }
              });
            });
      } else {
        next();
      }
    }
  };


  var exports = DHT22;

  return exports;

});
