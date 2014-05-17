var fiwareNotifier= (function () {
 
    var ip = "217.127.199.47:8090";
    var socket = io.connect(ip);
    
    var listeners = [];
    socket.on('connect',function(){
        socket.emit('subscribe','electricBoxUpdate-all');
    });

    socket.on('lampUpdate', function (data) {            
        var updates = [];
        
        if(data.statusCode.code === "200"){                
            updates.push(processLampUpdate(data.contextElement));                  
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
        setIP : setIP,
        notifyToListeners : notifyToListeners,
        subscribe : subscribe
    };
 
})();