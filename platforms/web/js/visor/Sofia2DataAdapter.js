var sofia2DataAdapter = (function () {
 
       var token = "3bb7264f5c1743b78dbaa5ba2e33ac35";
       
       function setToken(newToken){
            token = newToken;
       }

       function processLampsData(data){
             
              var deferred  = $.Deferred();
              var results   = [];
              var lamps     = data || [];

              //process data
                for(var i=0,n=lamps.length; i<n; i++) {
                    
                    var lampData  = lamps[i].luminaria;
                    var cabinetID = parseInt(lampData.FK_idCuadro);
                    var lampID    = parseInt(lampData.id);
                    var position  = lampData.posicion.coordinates;
                    
                    if (!(cabinetID in results)) {
                        results[cabinetID] = {};
                    }

                    results[cabinetID][lampID] = {
                        id : lampID,
                        luminosityLevel : lampData.nivelIntensidad,
                        position : position[0]+","+position[1],
                        electricalCabinetID : cabinetID
                    };
                }

              deferred.resolve(results);
              return deferred.promise();
        }
       
        function processSensorsData(data){
              //TO-DO
        }

        function loadLamps() {
          
           var deferred  = $.Deferred(); 
            
           joinToken(token, "KP_test_luminaria:KP_test_luminaria01", function(mensajeSSAP){
                
                var query = '{select * from SIB_test_luminaria}'; 
            
                queryWithQueryType(query, 
                    "SIB_test_luminaria", 
                    "SQLLIKE",
                    null,						
                    function(mensajeSSAP){
                        //check mensajeSSAP.ok === true?
                        processLampsData(mensajeSSAP.body.data).done(function(data){
                            deferred.resolve(data);
                        });
                });
            });
            
           return deferred.promise();
        }
 
        function loadSensors() {
            //TO-DO
           var deferred  = $.Deferred(); 
            
         
           deferred.resolve([]);
           return deferred.promise();
        }
 
        function _updateLuminosityLamp(id,luminosityLevel) {
            
            var deferred  = $.Deferred(); 
            joinToken(token, "KP_test_luminaria:KP_test_luminaria01", function(mensajeSSAP){
             
               var query = "update SIB_test_luminaria set luminaria.nivelIntensidad="+luminosityLevel+" where luminaria.id = '"+id+"'"; 
                
               updateWithQueryType(null, query, "SIB_test_luminaria", "SQLLIKE", function(mensajeSSAP){
                    deferred.resolve();
               }); 
            });
            
           return deferred.promise();
        }
  
        function deleteEntity(type,id) {
            
            var deferred  = $.Deferred(); 
            var SIB       = "SIB_test_"+type;
            
            joinToken(token, "KP_test_luminaria:KP_test_luminaria01", function(mensajeSSAP){
             
               var query = "delete from "+SIB+" where "+type+".id = '"+id+"'"; 
                
               removeWithQueryType(null, query, SIB, "SQLLIKE", function(mensajeSSAP){
                    deferred.resolve();
               }); 
            });
            
           return deferred.promise();
        }
        
        function deleteAllEntities(type) {
            var deferred  = $.Deferred(); 
            var SIB       = "SIB_test_"+type;
            
            joinToken(token, "KP_test_luminaria:KP_test_luminaria01", function(mensajeSSAP){
             
               var query = "delete * from "+SIB; 
                
               removeWithQueryType(null, query, SIB, "SQLLIKE", function(mensajeSSAP){
                    deferred.resolve();
               }); 
            });
            
           return deferred.promise();
        }

        return {
            setToken : setToken,
            loadLamps: loadLamps,
            loadSensors: loadSensors,
            deleteEntity: deleteEntity,
            updateLuminosityLamp: _updateLuminosityLamp
        };
 
    })();