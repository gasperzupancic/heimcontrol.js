if (typeof define !== 'function') {
  var define = require('amdefine')(module);
}

define([ 'node-dht-sensor' ], function(dhtsensor) {

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
    this.logs_collection = 'DHT22_logs';

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
	    console.log('socket connected');
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
	    
  	    var sensor = { _id: item._id, timer: null,
		    initialize: function() {
		    		return dhtsensor.initialize(22, parseInt(item.pin));
	    	    },
		    read: function() {
    			var readout = dhtsensor.read();
			item = that.sensors[this._id + ''];
              		if (isNaN(item.value)) {
                		item.value = 0;
              		}
              		item.value = [ parseFloat((readout.temperature).toFixed(2)), parseFloat((readout.humidity).toFixed(2)) ];
                        console.log('temperature: '+item.value[0]+'C, humidity: '+item.value[1]+'%');
			if ( item.value[0] !== 0 && item.value[1] >= 1 && item.value[1] <= 100) { 
              			that.values[item._id] = item.value;
              			that.app.get('sockets').emit('dht22-sensor', {
                			id: item._id,
                			value: item.value
              			});
				that.app.get('db').collection(that.logs_collection, function(err, collection) {
					collection.save({ sensor_id: item._id, timestamp: Math.round(new Date().getTime()/1000.0), temp: item.value[0], hum: item.value[1]}, function(err, object) {
						if (err){
          						console.warn(err.message);  // returns error if no matching object found
      						}else{
          						//console.dir(object);
      						}	
				  	});
				});
			}
    			timer = setTimeout(function() {
      				sensor.read();
    			}, 60000);
  		    },
		    removeAllListeners: function() {
			    clearTimeout(timer);
		    }
	    };
	    sensor.initialize();
  	    sensor.read();
	    
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

  DHT22.prototype.chartData = function(items, callback) {
    var that = this;
    var humArr = [], tempArr = []; 
    items.forEach(function(item)  {
	t = [item.]    
	tempArr.append();    
    }  

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
      if(method === "sensor") {
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
      } else if(method === "logs") {
	var sensor_id = req.body.sensor_id ? req.body.sensor_id;      
    	var timespan = req.body.timespan ? req.body.timespan : 24 * 3600;
	this.app.get('db').collection("DHT22_logs", function(err, collection) {
            collection.find({ sensor_id : sensor_id , timestamp : { $gt : (Math.round(new Date().getTime()/1000.0) - timespan)  } }, { _id : 0, sensor_id : 0 }).toArray(function(err, items) {
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
