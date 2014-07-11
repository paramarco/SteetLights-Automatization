"use strict";
var sofia2DataAdapter = (function () {

    var _opts;
    
    function init(opts){
        var deferred = $.Deferred();
        _opts        = opts;   
        
        sofia2.joinToken(_opts.token, _opts.instancia, function(mensajeSSAP){ 
            if(mensajeSSAP.direction !== "RESPONSE") deferred.reject(mensajeSSAP);
            else deferred.resolve();
        });

        return deferred.promise();
    }
        
    function formatLampsData(data){             
        
        var deferred = $.Deferred();
        var results  = [];
        var lamps    = data || [];

        //process data
        for(var i=0,n=lamps.length; i<n; i++) {
            
            var lampData  = lamps[i].luminaria;
            var cabinetID = lampData.FK_idCuadro;
            var lampID    = lampData.id;
            var position  = lampData.posicion.coordinates;
                    
            if (!(cabinetID in results)) {
                results[cabinetID] = {};
            }

            results[cabinetID][lampID] = {
                id                  : lampID,
                luminosityLevel     : lampData.nivelIntensidad,
                position            : position.join(','),
                electricalCabinetID : cabinetID
            };
        }

        deferred.resolve(results);
        return deferred.promise();
    }
       
    function formatSensorsData(data){
        
        var deferred  = $.Deferred();
        var results   = [];
        var sensors   = data || [];

        //process data
        for(var i=0,n=sensors.length; i<n; i++) {
                    
            var sensorData  = sensors[i].sensor;
            var sensorType  = sensorData.tipo;
            var sensorID    = sensorData.id;
            var position    = sensorData.posicion.coordinates;
                       
            if (!(sensorType in results)) {
                results[sensorType] = {};
            }

            results[sensorType][sensorID] = {
                id       : sensorID,
                type     : sensorType,
                unit     : sensorData.unidad,
                value    : sensorData.valor,
                position : position.join(',')
            };
        }

        deferred.resolve(results);
        return deferred.promise();
    }
    
    function loadData(query, keySelector){        

        var deferred       = $.Deferred(); 
        var acumData       = [];
        
        var loadDataFromID = function (query, fromID, acumData){
            
            var deferred  = $.Deferred(); 
            
            sofia2.queryWithQueryType( query.replace("@id",fromID), _opts.sensorOntology, "SQLLIKE", null, function(mensajeSSAP){
                if(mensajeSSAP.direction === "ERROR") deferred.reject(mensajeSSAP);
                else deferred.resolve(mensajeSSAP.body.data);
            });
            
            return deferred.promise();
        };        

        (function loop(query, fromID, keySelector) {
            return loadDataFromID(query, fromID).then(function(data){              
                if (data.length > 0 ){
                    acumData = acumData.concat(data);
                    return loop(query, keySelector(data[data.length-1]), keySelector);
                }
            });
        })(query, -1, keySelector).then(function(){
               deferred.resolve(acumData);
        });
        
        return deferred.promise();
    }
        
    function loadLamps() {  
        var query       = '{select * from ' + _opts.lampOntology + ' where luminaria.id > @id order by luminaria.id asc}'; 
        var keySelector = function (data){return data.luminaria.id;};
        return loadData(query, keySelector).then(formatLampsData);
    }
        
    function loadSensors() {        
        var query       = '{select * from ' + _opts.sensorOntology + ' where sensor.id > @id order by sensor.id asc}'; 
        var keySelector = function (data){return data.sensor.id;};
        return loadData(query, keySelector).then(formatSensorsData);
    }
    
    function updateLuminosityLamp(id,luminosityLevel) {     
        
        var deferred  = $.Deferred(); 
        var query     = "update " + _opts.lampOntology + " set luminaria.nivelIntensidad=" + luminosityLevel + " where luminaria.id = " + id; 
            
        sofia2.updateWithQueryType(null, query, _opts.lampOntology, "SQLLIKE", function(mensajeSSAP){
            if(mensajeSSAP.direction === "ERROR") deferred.reject(mensajeSSAP);
            else deferred.resolve();
        });     

        return deferred.promise();
    }
    
    function deleteLamp(id) {
        var ontology = _opts.lampOntology;
        var query    = "delete from " + ontology + " where luminaria.id = "+id; 
        return deleteEntity(ontology, query);    
    }
        
    function deleteAllLamps() {
        var ontology = _opts.lampOntology;
        var query    = "delete from " + ontology;
        return deleteEntity(ontology, query);
    }
       
    function deleteAllSensors() {
        var ontology = _opts.sensorOntology;
        var query    = "delete from " + ontology;
        return deleteEntity(ontology, query);
    }
       
    function deleteEntity(ontology, query){
        
        var deferred  = $.Deferred(); 

        sofia2.removeWithQueryType("{"+query+"}", ontology, "SQLLIKE", function(mensajeSSAP){
            if(mensajeSSAP.direction === "ERROR") deferred.reject(mensajeSSAP);
            else deferred.resolve();
        });     
            
       return deferred.promise(); 
    }

    function addItem(data, ontology){
    
        var deferred = $.Deferred(); 

        sofia2.insert(JSON.stringify(data), ontology, function(mensajeSSAP){
            if(mensajeSSAP.direction === "ERROR") deferred.reject(mensajeSSAP);
            else deferred.resolve();
        });

        return deferred.promise(); 
    }
    
    function addLamp(data){

        var coords        = data.position.split(',');
        var formattedData = {
            "luminaria" : {											
                "id"                : data.id,
                "nivelIntensidad"   : data.luminosityLevel,
				"posicion" : {	
				    "type"        : "Point",
					"coordinates" :	[parseFloat(coords[0]), parseFloat(coords[1])]
                },
                "FK_idCuadro" : data.electricalCabinetID  
            }
        };	 
        
        return addItem(formattedData, _opts.lampOntology);
    }
    

    function addSensor(data){
        
        var coords        = data.position.split(',');
        var formattedData = {
            "sensor" : {											
                "id"                : data.id,
                "tipo"	            : data.type,
				"unidad"            : data.unit,
				"valor"             : data.value,
				"versionProtocolo"  : data.protocolVersion,
				"posicion" : {	
				    "type"        : "Point",
					"coordinates" :	[parseFloat(coords[0]), parseFloat(coords[1])]
                }
            }
        };	 
        
        return addItem(formattedData, _opts.sensorOntology);
    }
    
    function countItems(query, ontology) {
    
        var deferred  = $.Deferred(); 
        
        sofia2.queryWithQueryType(query ,ontology , "SQLLIKE", null, function(mensajeSSAP){
            if(mensajeSSAP.direction === "ERROR") deferred.reject(0);
            else deferred.resolve(parseInt(mensajeSSAP.body.data));
        });
        
        return deferred.promise(); 
    }
    
    function countLamps() {  
        return countItems('{select count(*) from ' + _opts.lampOntology + '}', _opts.lampOntology);
    }
       
    function countSensors() {  
        return countItems('{select count(*) from ' + _opts.sensorOntology + '}', _opts.sensorOntology);
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