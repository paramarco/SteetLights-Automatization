"use strict";
//sofia2 shoddy piece of work

function indicationForSubscription(ssapMessageJson) {
    
    var updates = [];
    var SSAPMessage = parsearMensajeSSAP(validarSSAP(ssapMessageJson));   
    
    if (SSAPMessage !== null){
         if(SSAPMessage.messageType === "INDICATION"){
             var data = SSAPMessage.body.data;
             
             for(var i=0, n=data.length; i<n; i++){  
               var updatedData = data[i];
              
               if(typeof updatedData !== "undefined" && typeof updatedData.luminaria !== "undefined"){                
                    updates.push({
                        type: "lamp",
                        data:{
                            id : parseInt(updatedData.luminaria.id),
                            luminosityLevel : updatedData.luminaria.nivelIntensidad,
                            electricalCabinetID : parseInt(updatedData.luminaria.FK_idCuadro)
                        }
                    });
               }
             }
             sofia2Notifier.notifyToListeners(updates);
         }      
    }      
}

function subscriptionWellLaunchedResponse(subscriptionId, subscriptionQuery){

}
 
var sofia2Notifier = (function () {
    
    var listeners = [];
    
    var lampAccessData = { 
           ontologia : "SIB_test_luminaria", 
           KP        : "KP_test_luminaria", 
           instancia : "KP_test_luminaria:KP_test_luminaria01", 
           token     : "3bb7264f5c1743b78dbaa5ba2e33ac35"
    };    

    var sensorAccessData = { 
          ontologia  : "SIB_test_sensor", 
          KP         : "KP_test_sensor", 
          instancia  : "KP_test_sensor:KP_test_Sensor02", 
          token      : "80fb6498a34e48caa6a1f68ca91dda7a"
    };
       
    joinToken(lampAccessData.token,lampAccessData.instancia, function(mensajeSSAP){
        subscribeWithQueryType("{select * from "+lampAccessData.ontologia+"}", lampAccessData.ontologia, "SQLLIKE",500);
    });

    joinToken(sensorAccessData.token,sensorAccessData.instancia, function(mensajeSSAP){
        subscribeWithQueryType("{select * from "+sensorAccessData.ontologia+"}", sensorAccessData.ontologia, "SQLLIKE",500);
    });   
        
    function setLampAccessData (data){

           leave();

           lampAccessData.ontologia = data.ontologia;
           lampAccessData.KP        = data.KP;
           lampAccessData.instancia = data.lampAccessData.instancia; 
           lampAccessData.token     = data.token;

            joinToken(lampAccessData.token,lampAccessData.instancia, function(mensajeSSAP){
                subscribeWithQueryType("{select * from "+lampAccessData.ontologia+"}", lampAccessData.ontologia, "SQLLIKE",500);
            });
    }
    
    function processLampUpdate(data){
        return {
            type: "lamp",
            data:{
                id                  : parseInt(data.id),
                luminosityLevel     : parseInt(data.nivelIntensidad),
                electricalCabinetID : parseInt(data.FK_idCuadro)
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
        notifyToListeners : notifyToListeners,
        subscribe         : subscribe
    };
 
})();