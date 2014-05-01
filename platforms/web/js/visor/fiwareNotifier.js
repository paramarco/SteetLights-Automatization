var fiwareNotifier= (function () {
 
    var ip = "217.127.199.47:8090";
    var socket = io.connect(ip);
    
    var listeners = [];
    
    socket.on('update', function (data) {	  	
            
        var updates = [];
        var updatedEntities = data.contextResponses || [];

        for(var i=0,n=updatedEntities.length;i<n;i++){
            if(updatedEntities[i].statusCode.code === "200"){
                
                var data = updatedEntities[i].contextElement;
                
                if(data.type==="luminaria"){
                    updates.push(processLampUpdate(data));
                }                    
           }
        }
        notifyToListeners(updates);
    });
    
    
    function setIP(newIP){
        ip     = newIP;
        socket = io.connect(ip);
    }

    function processLampUpdate(data){
        return {
            type: "lamp",
            data:{
                id : parseInt(data.id),
                luminosityLevel : parseInt(data.attributes[0].value),
                electricalCabinetID : parseInt(data.attributes[1].value)
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