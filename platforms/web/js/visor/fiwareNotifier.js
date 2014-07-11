"use strict";
var fiwareNotifier= (function () {
     
    var listeners = [];
    var host      = undefined;
    var socket    = undefined;
   
    function init(host){
        
        if(socket != undefined) 
            socket.disconnect(true) 

        socket = io.connect(host, { 'force new connection': true });

        socket.on('connect',function(){
           
            socket.emit('subscribe','electricBoxUpdate-all');
            socket.emit('subscribe','sensorUpdate-all');
           
            socket.on('lampUpdate', function (data) {            
               var updates = [];

               if(data.statusCode.code === "200"){                
                   updates.push(processLampUpdate(data.contextElement));                  
                   notifyToListeners(updates);
               }
            });
    
            socket.on('sensorUpdate', function (data) {            
               var updates = [];

               if(data.statusCode.code === "200"){                
                   updates.push(processSensorUpdate(data.contextElement));                  
                   notifyToListeners(updates);
               }
            });
        });
    }

    function processLampUpdate(data){
        return {
            type: "lamp",
            data:{
                id                  : parseInt(data.id),
                luminosityLevel     : parseInt(data.attributes[0].value),
                electricalCabinetID : parseInt(data.attributes[1].value)
            }
        };
    }

    function processSensorUpdate(data){
        return {
            type: "sensor",
            data:{
                id    : parseInt(data.id),
                type  : data.attributes[0].name,
                unit  : data.attributes[0].type,
                value : data.attributes[0].value
            }
        };
    }
    
    function notifyToListeners(message){
       for(var i=0,n=listeners.length;i<n;i++){
            listeners[i](message);
       } 
    }   
    
    function subscribe(callback){
       listeners.push(callback);
    }
    
    return {
        init              : init,
        notifyToListeners : notifyToListeners,
        subscribe         : subscribe
    };
 
})();