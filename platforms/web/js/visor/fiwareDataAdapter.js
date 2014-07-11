"use strict";
var fiwareDataAdapter = (function () {

    var ip;

    function init(host){
        ip = host;
        var deferred = $.Deferred();
        deferred.resolve();
        return deferred.promise();
    }

    function formatLampsData(data){

        var deferred = $.Deferred();
        var results  = [];

        //process data
        for(var i=0,n=data.length; i<n; i++) {
            
            var lampData  = data[i].contextElement;
            var cabinetID = parseInt(lampData.attributes[2].value);
            var lampID    = parseInt(lampData.id);
            
            if (!(cabinetID in results)) {
                results[cabinetID] = {};
            }

            results[cabinetID][lampID] = {
                id                  : lampID,
                luminosityLevel     : lampData.attributes[0].value,
                position            : lampData.attributes[1].value,
                electricalCabinetID : cabinetID
            };
        }
        
        deferred.resolve(results);
        return deferred.promise();
    }

    function formatSensorData(data){
        
        var deferred = $.Deferred();
        var results  = [];

        //process data
        for(var i=0,n=data.length; i<n; i++) {

            var sensorData = data[i].contextElement;
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
                
    function loadData(url) {
    
        var deferred       = $.Deferred(); 
        var limit          = 200;
        var acumData       = [];   
        var url            = url+"&details=on&limit="+limit;
        
        (function loop(url, offset) {
            return $.ajax({
                url: url.concat("&offset="+offset),
                type: 'GET',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
                    xhr.setRequestHeader("Accept","application/json;");
                }}).then(function(data){
                    if (data.errorCode.code !== "404" ){
                        acumData = acumData.concat(data.contextResponses);
                        return loop(url, offset+limit);
                    }            
                }); 
        })(url,0).then(function(){
            deferred.resolve(acumData);
        });
        
        return deferred.promise(); 
    }
    
    function loadLamps() {  
        var url = 'http://'+ip+'/NGSI10/contextEntityTypes/luminaria?';
        return loadData(url).then(formatLampsData);
    }
    
    function loadSensors() {  
        var url = 'http://'+ip+'/NGSI10/contextEntityTypes/sensor?';
        return loadData(url).then(formatSensorData);
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
    }

    function deleteEntity(type,id) {
       
        var data  = {
            "contextElements" : [{"type":type,"isPattern":"false","id":id}],
            "updateAction"    : "DELETE"
        };

        return  $.ajax({
           url: 'http://'+ip+'/NGSI10/updateContext',
           type: 'POST',
           data: JSON.stringify(data),
           beforeSend: function(xhr) {
               xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
               xhr.setRequestHeader("Accept","application/json;");
           }});
    }
    
    function deleteAllLamps() {
        // Not Implemented in FI-WARE
        var deferred = $.Deferred();   
        deferred.reject();
        return deferred.promise();
    }
    
    function deleteAllSensors() {
        // Not Implemented in FI-WARE
        var deferred = $.Deferred();   
        deferred.reject();
        return deferred.promise();
    }
        
    function addItem(data){
        
        var deferred = $.Deferred(); 
        
        $.ajax({
           url: 'http://'+ip+'/NGSI10/updateContext',
           type: 'POST',
           data: JSON.stringify({"contextElements":[data],"updateAction":"APPEND"}),
           beforeSend: function(xhr) {
               xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
               xhr.setRequestHeader("Accept","application/json;");
        }}).then(function(response){
            if(response.errorCode) deferred.reject();
            else deferred.resolve(response);
        });
        
        return deferred.promise();
    }
        
    function addLamp(data){                
        return addItem({
            "attributes": [
                    {"name":"nivelIntensidad","type":"porcentaje","value":data.luminosityLevel},                
                    {"metadatas":
                        [{"name":"location","type":"string","value":"WSG84"}],
                        "name":"position","type":"coords","value":data.position
                    }, 
                    {"name":"FK_idCuadro","type":"int","value":data.electricalCabinetID}
            ], 
            "id":data.id,"isPattern":"false","type":"luminaria"
        });
    }
    
    function addSensor(data){                    
        return addItem({
            "attributes": [
                    {"name":data.type,"type": data.unit,"value":data.value}, 
                    {"name":"versionProtocolo","type":"string","value":data.protocolVersion}, 
                    {"metadatas":
                        [{"name":"location","type":"string","value":"WSG84"}], 
                        "name":"position","type":"coords","value":data.position
                    }
            ], 
            "id": data.id, 
            "isPattern": "false", 
            "type": "sensor"
        });
    }
    
    function countItems(url) {
    
        var deferred       = $.Deferred(); 
        
        $.ajax({
           url  : url+"&details=on&offset=0&limit=1",
           type : 'GET',
           beforeSend: function(xhr) {
               xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
               xhr.setRequestHeader("Accept","application/json;");
        }}).then(function(response){
            if(response.errorCode.code !== "200") deferred.resolve(0);
            else deferred.resolve(parseInt(response.errorCode.details.replace("Count: ","")));
        });
        
        return deferred.promise(); 
    }
    
    function countLamps() {  
        return countItems('http://'+ip+'/NGSI10/contextEntityTypes/luminaria?');
    }
       
    function countSensors() {  
        return countItems('http://'+ip+'/NGSI10/contextEntityTypes/sensor?');
    }
    
    return {
        init                 : init,
        loadLamps            : loadLamps,        
        addLamp              : addLamp,    
        countLamps           : countLamps,       
        updateLuminosityLamp : updateLuminosityLamp,
        deleteAllLamps       : deleteAllLamps,
        loadSensors          : loadSensors,    
        addSensor            : addSensor,
        countSensors         : countSensors,    
        deleteAllSensors     : deleteAllSensors
    };

})();