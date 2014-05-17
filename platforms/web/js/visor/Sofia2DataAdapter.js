var sofia2DataAdapter = (function () {
 
       var token = "3bb7264f5c1743b78dbaa5ba2e33ac35";
       
       var lampAccessData = { 
             ontologia : "SIB_test_luminaria", 
             KP : "KP_test_luminaria", 
             instancia : "KP_test_luminaria:KP_test_luminaria01", 
             token :"3bb7264f5c1743b78dbaa5ba2e33ac35"
       };    
            
       var sensorAccessData = { 
             ontologia : "SIB_test_sensor", 
             KP : "KP_test_sensor", 
             instancia : "KP_test_sensor:KP_test_Sensor02", 
             token :"80fb6498a34e48caa6a1f68ca91dda7a"
       };
        
       var cabinetAccessData = { 
             ontologia : "SIB_test_cuadro", 
             KP : "KP_test_cuadro", 
             instancia : "KP_test_cuadro:KP_test_cuadro01", 
             token :"6cb9fa1dcd404093ac38997eb1f3d620"
       };

        function setLampAccessData (data){
              //validate arguments?
              lampAccessData.ontologia = data.ontologia;
              lampAccessData.KP        = data.KP;
              lampAccessData.instancia = data.lampAccessData.instancia; 
              lampAccessData.token     = data.token;
        }

       function processLampsData(data){             
              var deferred = $.Deferred();
              var results  = [];
              var lamps    = data || [];

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
                        id                  : lampID,
                        luminosityLevel     : lampData.nivelIntensidad,
                        position            : position[0]+","+position[1],
                        electricalCabinetID : cabinetID
                    };
                }

              deferred.resolve(results);
              return deferred.promise();
        }
       
        function processSensorsData(data){
              var deferred  = $.Deferred();
              var results   = [];
              var sensors   = data || [];

              //process data
                for(var i=0,n=sensors.length; i<n; i++) {
                    
                    var sensorData  = sensors[i].sensor;
                    var sensorType  = sensorData.tipo;
                    var sensorID    = parseInt(sensorData.id);
                    var position    = sensorData.posicion.coordinates;
                       
                    if (!(sensorType in results)) {
                        results[sensorType] = {};
                    }

                    results[sensorType][sensorID] = {
                        id       : sensorID,
                        type     : sensorType,
                        unit     : sensorData.unidad,
                        value    : sensorData.valor,
                        position : position[0]+","+position[1]
                    };
                }

              deferred.resolve(results);
              return deferred.promise();
        }

        function loadLamps() {  
           var deferred  = $.Deferred(); 
            
           joinToken(lampAccessData.token,lampAccessData.instancia, function(mensajeSSAP){   
                  
                var query = '{select * from '+lampAccessData.ontologia+' where luminaria.id > -1 order by luminaria.id asc}'; 
            
                queryWithQueryType(query, 
                    lampAccessData.ontologia, 
                    "SQLLIKE",
                    null,						
                    function(mensajeSSAP){
                        //check mensajeSSAP.ok === true?
                        processLampsData(mensajeSSAP.body.data).done(function(data){
                            deferred.resolve(data);
                        });
                });
                leave();
            });
            
           return deferred.promise();
        }
    
        function updateLuminosityLamp(id,luminosityLevel) {     
            var deferred  = $.Deferred(); 

            joinToken(lampAccessData.token, lampAccessData.instancia, function(mensajeSSAP){             
               var query = "update "+lampAccessData.ontologia+" set luminaria.nivelIntensidad="+luminosityLevel+" where luminaria.id = "+id; 

               updateWithQueryType(null, query, lampAccessData.ontologia, "SQLLIKE", function(mensajeSSAP){
                    deferred.resolve();
               });     
               leave(); 
            });
            
           return deferred.promise();
        }
    
        function loadSensors() {
           var deferred  = $.Deferred(); 
            
           joinToken(sensorAccessData.token,sensorAccessData.instancia, function(mensajeSSAP){   
                var query = '{select * from '+sensorAccessData.ontologia+' order by sensor.id asc }'; 
            
                queryWithQueryType(query, 
                    lampAccessData.ontologia, 
                    "SQLLIKE",
                    null,           
                    function(mensajeSSAP){
                        //check mensajeSSAP.ok === true?
                        processSensorsData(mensajeSSAP.body.data).done(function(data){
                            deferred.resolve(data);
                        });
                });
                leave();
            });
            
           return deferred.promise();
        }
       
        function deleteLamp(id) {
            var query = "delete from "+lampAccessData.ontologia+" where luminaria.id = "+id; 
            return deleteEntity(lampAccessData, query);    
        }
        
        function deleteAllLamps() {
            var query = "delete * from "+lampAccessData.ontologia;
            return deleteEntity(lampAccessData, query);
        }
    
        function deleteEntity(accesData,query){
            var deferred  = $.Deferred(); 
            
            joinToken(accesData.token, accesData.instancia, function(mensajeSSAP){
               removeWithQueryType(null, query, accesData.ontologia, "SQLLIKE", function(mensajeSSAP){
                    deferred.resolve(mensajeSSAP);
               });     
               leave(); 
            });
                    
           return deferred.promise(); 
        }

        return {
            setLampAccessData    : setLampAccessData,
            loadLamps            : loadLamps,
            updateLuminosityLamp : updateLuminosityLamp,
            deleteAllLamps       : deleteAllLamps,
            deleteAllLamps       : deleteAllLamps,
            loadSensors          : loadSensors
        };
 
    })();