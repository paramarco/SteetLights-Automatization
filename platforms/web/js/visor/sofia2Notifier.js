//sofia2 shoddy piece of work

//meter un pooling
function indicationForSubscription(ssapMessageJson) {
    
    var updates = [];
    var SSAPMessage = parsearMensajeSSAP(validarSSAP(ssapMessageJson));   
    
    if (SSAPMessage !== null){
         if(SSAPMessage.messageType==="INDICATION"){
             var data = SSAPMessage.body.data;
             
             for(var i=0, n=data.length; i<n; i++){  
               var updatedData = data[i];
              
               if(typeof updatedData.luminaria !== "undefined"){                
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
    
    var token = "3bb7264f5c1743b78dbaa5ba2e33ac35";
    
    joinToken(token, "KP_test_luminaria:KP_test_luminaria01", function(mensajeSSAP){
        subscribeWithQueryType("{select * from SIB_test_luminaria}", "SIB_test_luminaria", "SQLLIKE",500) 
    });
    
    function processLampUpdate(data){
        return {
            type: "lamp",
            data:{
                id : parseInt(data.id),
                luminosityLevel : parseInt(data.nivelIntensidad),
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
        subscribe : subscribe
    };
 
})();