"use strict";
var fiwareDataAdapter = (function () {
 
       var ip = "217.127.199.47:8080";
       
       function setHost(newIP){
            ip = newIP;
       }

       function processLampsData(data){
             
              var deferred = $.Deferred();
              var results  = [];
              var lamps    = data.contextResponses || [];

              //process data
                for(var i=0,n=lamps.length; i<n; i++) {
                    
                    var lampData  = lamps[i].contextElement;
                    var cabinetID = parseInt(lampData.attributes[2].value);
                    var lampID    = parseInt(lampData.id);

                    if (!(cabinetID in results)) {
                        results[cabinetID] = {};
                    }

                    results[cabinetID][lampID] = {
                        id : lampID,
                        luminosityLevel : lampData.attributes[0].value,
                        position : lampData.attributes[1].value,
                        electricalCabinetID : cabinetID
                    };
                }

              deferred.resolve(results);
              return deferred.promise();
        }
       
        function processSensorsData(data){
              var deferred = $.Deferred();
              var results  = [];
              var sensors  = data.contextResponses || [];

              //process data
                for(var i=0,n=sensors.length; i<n; i++) {
                    
                    var sensorData = sensors[i].contextElement;
                    var sensorType = sensorData.attributes[0].name;
                    var sensorID   = parseInt(sensorData.id);
                   
                    if (!(sensorType in results)) {
                        results[sensorType] = {};
                    }

                    results[sensorType][sensorID] = {
                        id       : sensorID,
                        type     : sensorData.attributes[0].name,
                        unit     : sensorData.attributes[0].type,
                        value    : sensorData.attributes[0].value,
                        position : sensorData.attributes[2].value
                    };
                }

              deferred.resolve(results);
              return deferred.promise();
        }

        function loadLamps() {
                return $.ajax({
                   url: 'http://'+ip+'/NGSI10/contextEntityTypes/luminaria',
                   type: 'GET',
                   beforeSend: function(xhr) {
                       xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
                       xhr.setRequestHeader("Accept","application/json;");
                   }}).then(processLampsData); 
        }
 
        function loadSensors() {
          return $.ajax({
                     url: 'http://'+ip+'/NGSI10/contextEntityTypes/sensor',
                     type: 'GET',
                     beforeSend: function(xhr) {
                         xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
                         xhr.setRequestHeader("Accept","application/json;");
                     }}).then(processSensorsData); 
        }
 
        function updateLuminosityLamp(id,luminosityLevel) {
                var data  = {
                    "contextElements":[
                          {"type":"luminaria","id":id,"attributes":[{"name":"nivelIntensidad","type":"porcentaje","value": luminosityLevel}]}
                    ],
                    "updateAction":"UPDATE"
                };

                return  $.ajax({
                   url: 'http://'+ip+'/NGSI10/updateContext',
                   type: 'POST',
                   data: JSON.stringify(data),
                   beforeSend: function(xhr) {
                       xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
                       xhr.setRequestHeader("Accept","application/json;");
                   }});
                   // .then(processResult);  process result !! 
        }
  
        function deleteEntity(type,id) {
                var data  = {
                      "contextElements": [
                        {
                          "type"      : type,
                          "isPattern" : "false",
                          "id"        : id
                        }
                      ],
                      "updateAction" : "DELETE"
                };

                return  $.ajax({
                   url: 'http://'+ip+'/NGSI10/updateContext',
                   type: 'POST',
                   data: JSON.stringify(data),
                   beforeSend: function(xhr) {
                       xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
                       xhr.setRequestHeader("Accept","application/json;");
                   }});
                   // .then(processResult);  process result !! 
        }
        
        function deleteAllEntities(type) {
                // Not Implemented in FI-WARE
        }

        return {
            setHost              : setHost,
            loadLamps            : loadLamps,
            loadSensors          : loadSensors,
            deleteEntity         : deleteEntity,
            updateLuminosityLamp : updateLuminosityLamp
        };
 
    })();