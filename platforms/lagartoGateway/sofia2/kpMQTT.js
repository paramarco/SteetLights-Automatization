"use strict";

var mqttclient = require("mqtt");
var Q          = require('q');
var XXTEA      = require('./XXTEA');
var Base64     = require('./base64');

var CLIENT_TOPIC                      = "CLIENT_TOPIC";  		  // Topic to publish messages
var TOPIC_PUBLISH_PREFIX              = '/TOPIC_MQTT_PUBLISH'; 	  // Topic to receive the response
var TOPIC_SUBSCRIBE_INDICATION_PREFIX = '/TOPIC_MQTT_INDICATION'; // Topic to receive notifications

var client;

var subscriptionsPromises = [];
var notificationCallback  = function(){};

/**
 * Constructor
 */ 
function KpMQTT() {
		
};

KpMQTT.prototype.constructor = KpMQTT;


KpMQTT.prototype.createUUID = function () {
    // http://www.ietf.org/rfc/rfc4122.txt
    var s = [];
    var hexDigits = "0123456789abcdef";
    for (var i = 0; i < 23; i++) {
        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = "-";

    var uuid = s.join("");
    return uuid;
}


/**
 * Connect to SIB and subscribe to topics
 */
KpMQTT.prototype.connect = function(host, port, keepalive, onConnectCallback) {
	
    var opts = {};
	opts.clientId  = this.createUUID();
	opts.keepalive = keepalive || 5;
	
	client = new mqttclient.createClient(port, host, opts);
	
    if(typeof onConnectCallback === 'function')
        client.on('connect',onConnectCallback);
        
	//Suscribe al topic de respuesta sincrona a mensajes ssap
	client.subscribe(TOPIC_PUBLISH_PREFIX+client.options.clientId);
	
	//Suscribe al topic de de notificacion de suscripcion
	client.subscribe(TOPIC_SUBSCRIBE_INDICATION_PREFIX+client.options.clientId);
	
	client.on('message', function (topic, message) {        
		if(topic == TOPIC_PUBLISH_PREFIX+client.options.clientId){
           // requestObject.messageType === 'SUBSCRIBE' && responseBody.ok === true ???
            message      = JSON.parse(message);
            var deferred = subscriptionsPromises.shift();
            if(message === undefined)
                deferred.reject(new Error("Wrong message from SIB"));
            else deferred.resolve(message);
            
		}else if(topic === TOPIC_SUBSCRIBE_INDICATION_PREFIX+client.options.clientId){
            notificationCallback(JSON.parse(message));
		}
	});	
};

KpMQTT.prototype.disconnect = function() {
	client.end();
};


KpMQTT.prototype.isConnected = function() {
	return client.connected;
};

KpMQTT.prototype.send = function(ssapMessage) {	    
    var deferred = Q.defer();
    subscriptionsPromises.push(deferred);
    
    client.publish(CLIENT_TOPIC, ssapMessage);	    
    return deferred.promise;
};


KpMQTT.prototype.onNotificationMessage = function(callback) {	
    if(typeof callback !== 'function')
        throw new Error("callback must be a function");
    notificationCallback = callback;
};


KpMQTT.prototype.sendCipher = function(ssapMessage, cipherKey) {
	
    var init   = ssapMessage.indexOf('instance') + 'instance'.length;
	var end    = ssapMessage.length;		
	var kpName = ssapMessage.substring(init, end).split(':')[1];
    
	kpName      = kpName.replace('\\"', '').trim();
	ssapMessage = kpName.length + "#" + kpName + Base64.encode(XXTEA.encrypt(ssapMessage, cipherKey), false);
	
    client.publish(CLIENT_TOPIC, ssapMessage);
};

exports.KpMQTT = KpMQTT;