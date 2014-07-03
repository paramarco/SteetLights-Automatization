/*******************************************************************************
 * © Indra Sistemas, S.A.
 * 2013 - 2014  SPAIN
 * 
 * All rights reserved
 ******************************************************************************/
var XXTEA = require('./XXTEA');
var Base64 = require('./base64');
var mqttclient = require("./mqtt/mqtt.js");
var cliente;
var wait = require("wait.for");
var cipherKey; // Clave de cifrado

var CLIENT_TOPIC = "CLIENT_TOPIC";  							  // Topic to publish messages
var TOPIC_PUBLISH_PREFIX = '/TOPIC_MQTT_PUBLISH'; 				  // Topic to receive the response
var TOPIC_SUBSCRIBE_INDICATION_PREFIX = '/TOPIC_MQTT_INDICATION'; // Topic to receive notifications

var callback; 		// Callback function


var subscriptionsCallbackMap = {};

/**
 * Constructor
 */ 
function KpMQTT() {
		
};

KpMQTT.prototype.constructor = KpMQTT;


/**
 * Espera la llegada de un mensaje por el topic de notificaciones
 */
KpMQTT.prototype.messageDispatcher = function(data) {
	if(data.messageId in subscriptionsCallbackMap){
		subscriptionsCallbackMap[data.messageId](data);
	}
};


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
 * Crea la conexion con el SIB y se subscribe a la cola de notificaciones
 */
KpMQTT.prototype.connect = function(host, port, keepalive, onConnectCallback) {
	var opts={};
	opts.clientId=this.createUUID();
	if(keepalive!=null){
		opts.keepalive = keepalive;
	}else{
		opts.keepalive = 5;
	}
	
	cliente = new mqttclient.createClient(port, host, opts);
	
	//Propaga el mensaje Indication al dispatcher adecuado
	var eventEmitter = cliente.getEventEmitter();
	eventEmitter.on('onMessage', this.messageDispatcher);
	
	//Suscribe al topic de respuesta sincrona a mensajes ssap
	cliente.subscribe(TOPIC_PUBLISH_PREFIX+cliente.options.clientId);
	
	//Suscribe al topic de de notificacion de suscripcion
	cliente.subscribe(TOPIC_SUBSCRIBE_INDICATION_PREFIX+cliente.options.clientId);
	
	//Registra el listener para recibir notificaciones MQTT
	cliente.on('message', function (topic, message) {
		if(topic == TOPIC_PUBLISH_PREFIX+cliente.options.clientId){
			callback(null, message);
		}else if(topic == TOPIC_SUBSCRIBE_INDICATION_PREFIX+cliente.options.clientId){
			var json = JSON.parse(message);			
			eventEmitter.emit("onMessage", json);
		}
	});

    if(typeof onConnectCallback === 'function')
        cliente.on('connect',onConnectCallback);
	
};

/**
 * Desconecta del SIB
 */
KpMQTT.prototype.disconnect = function() {
	cliente.end();
};

/**
 * Indica si hay conexion establecida con el SIB
 */
KpMQTT.prototype.isConnected = function() {
	return cliente.connected;
};



/**
 * Envio de mensajes SSAP
 */
KpMQTT.prototype.send = function(ssapMessage, subscriptionCallback) {
	
	cliente.publish(CLIENT_TOPIC, ssapMessage);
	
	var strResponse = wait.for( function (_callback) {
									callback=_callback;
								}); // Envio sincrono
								
	var response = this.json2Object(strResponse);
	
	if(response==null){
		return null;
	}else{
		var responseBody = this.json2Object(response.body);
		requestObject=this.json2Object(ssapMessage);
		if(requestObject.messageType=='SUBSCRIBE' && responseBody.ok==true && subscriptionCallback!=null){
			var subscriptionId = responseBody.data;
			subscriptionsCallbackMap[subscriptionId] = subscriptionCallback;
			
		}else if(requestObject.messageType=='UNSUBSCRIBE' && responseBody.ok==true){
			var requestBody = this.json2Object(requestObject.body);
			if (requestBody.idSuscripcion in subscriptionsCallbackMap) {
				delete subscriptionsCallbackMap[requestBody.idSuscripcion];
			}
		}
		
		return response;
	}
};

/**
 * Envio de mensajes SSAP cifrados y subscripcion a topic de respuesta
 */
KpMQTT.prototype.sendCipher = function(ssapMessage, subscriptionCallback) {
	var init = ssapMessage.indexOf('instance') + 'instance'.length;
	var end = ssapMessage.length;		
	var kpName = ssapMessage.substring(init, end).split(':')[1];
	kpName = kpName.replace('\\"', '').trim();
	
	ssapMessage = kpName.length + "#" + kpName + Base64.encode(XXTEA.encrypt(ssapMessage, this.cipherKey), false);
	
	var encodedResponse = wait.for(cliente.publish, ssapMessage); // Envio sincrono
	
	
	if(encodedResponse){
		return null;
	}else{
		var response=XXTEA.decrypt(Base64.decode(encodedResponse), cipherKey);
		
		if(response==null) return null;
		
		var responseBody = this.json2Object(response.body);
		requestObject=this.json2Object(ssapMessage);
		if(requestObject.messageType=='SUBSCRIBE' && responseBody.ok==true && subscriptionCallback!=null){
			var subscriptionId = responseBody.data;
			subscriptionsCallbackMap[subscriptionId] = subscriptionCallback;
			
		}else if(requestObject.messageType=='UNSUBSCRIBE' && responseBody.ok==true){
			var requestBody = this.json2Object(requestObject.body);
			if (requestBody.idSuscripcion in subscriptionsCallbackMap) {
				delete subscriptionsCallbackMap[requestBody.idSuscripcion];
			}
		}
		
		return response;
	}
};

/**
 * Setter para la clave de cifrado
 */
KpMQTT.prototype.setCipherKey = function(_cipherKey) {
	this.cipherKey = _cipherKey;
};

/**
 * Devuelve un String parseado a un objeto Javascript
 */
KpMQTT.prototype.json2Object = function (msg) {
	try {
		return JSON.parse(msg);
	} catch (e) {
		return null;
	}
};

/**
* Devuelve un objeto javascript parseado como un String
*/
KpMQTT.prototype.object2Json = function (msg) {
	try {
		return JSON.stringify(msg);
	} catch (e) {
		return null;
	}
};

exports.KpMQTT = KpMQTT;
