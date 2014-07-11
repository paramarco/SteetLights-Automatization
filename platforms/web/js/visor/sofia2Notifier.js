"use strict";
//sofia2 shoddy piece of work

function indicationForSubscription(ssapMessageJson) {

    var updates = [];
    var SSAPMessage = sofia2.parsearMensajeSSAP(sofia2.validarSSAP(ssapMessageJson));   

    if (SSAPMessage !== null && SSAPMessage.messageType === "INDICATION"){
            
        var data = SSAPMessage.body.data;

        for(var i=0, n=data.length; i<n; i++){  
                
            var notifications = data[i];
        
            //not allways as an array 
            if(!(notifications instanceof Array))
                notifications = [notifications];
            //notifications = (notifications instanceof Array) ? notifications : [notifications];
            
            for(var j=0, k=notifications.length; j<k; j++){
                
                var notificationData = notifications[j];
                
                //format data
                if(typeof notificationData.luminaria !== "undefined"){      
                    var luminaria = notificationData.luminaria;
                    updates.push({
                        type: "lamp",
                        data:{
                            id                  : parseInt(luminaria.id),
                            luminosityLevel     : luminaria.nivelIntensidad,
                            electricalCabinetID : parseInt(luminaria.FK_idCuadro)
                        }
                    });
                }
                else if(typeof notificationData.sensor !== "undefined"){     
                    var sensor = notificationData.sensor;
                    updates.push({
                        type: "sensor",
                        data:{
                            id    : parseInt(sensor.id),
                            type  : sensor.tipo,
                            unit  : sensor.unidad,
                            value : sensor.valor
                        }
                    });
                }   
            }
        }

        sofia2Notifier.notifyToListeners(updates);
    }           
}


function subscriptionWellLaunchedResponse(subscriptionId, subscriptionQuery){

}

var sofia2Notifier = (function () {

    var listeners = [];

    function init(config){   
        sofia2.joinToken(config.token, config.instancia, function(mensajeSSAP){
            sofia2.subscribeWithQueryType("{select * from " + config.lampOntology + "}", config.lampOntology, "SQLLIKE",500);
            sofia2.subscribeWithQueryType("{select * from " + config.sensorOntology + "}", config.sensorOntology, "SQLLIKE",500);
        });       
    }
    
    function notifyToListeners(message){
        for(var i=0,n=listeners.length;i<n;i++)
            listeners[i](message);
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