"use strict";
var io                   = require('socket.io-client');
var onLampUpdateCallback = undefined;

/**
 * @param {String} ip  ip:port 
 * @param {String} subscribeTo 
 */
function connect(host,subscribeTo,onConnectCallback){
    
    var socket = io.connect(host);
    
    socket.on('connect', function(){
        if(typeof onConnectCallback === 'function')
            onConnectCallback();
        
        socket.emit('subscribe',subscribeTo);
    });

    socket.on('lampUpdate', function (data) {   
        if(typeof onLampUpdateCallback === 'function'){
            var updatedData = data.contextElement;
            onLampUpdateCallback({
                id                  : parseInt(updatedData.id),
                luminosityLevel     : parseInt(updatedData.attributes[0].value),
                electricalCabinetID : parseInt(updatedData.attributes[1].value)
            });
        }
    });
};
   
/**
 * @param {Function} callback
 */
function onLampUpdate(callback){
    onLampUpdateCallback = callback;
};

exports.connect      = connect;
exports.onLampUpdate = onLampUpdate;