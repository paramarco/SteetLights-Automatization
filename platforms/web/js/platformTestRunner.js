"use strict";

var platformTestRunner = (function () {

    var timer = undefined;
    
    function runSimulation(opts, dataAdapter, onEvent){
        
        var miniLuminosity = 0,
            maxLuminosity  = 100;
        
        clearInterval(timer);
        
        onEvent = (typeof onEvent === 'function') ? onEvent : function(){};
           
        dataAdapter.countLamps().done(function(count){            
            
            var maxLamps = Math.min(count,opts.maxLamps);
            
            timer = setInterval(function(){                  
                
                for(var i=0;i<maxLamps; i++){
                    
                    var luminosityLevel = Math.floor(Math.random() * (maxLuminosity - miniLuminosity + 1)) + miniLuminosity;
              
                    dataAdapter.updateLuminosityLamp(i,luminosityLevel).then(function(){
                        onEvent({"i":i,"luminosityLevel":luminosityLevel});
                    })
                    .fail(function(){
                        clearInterval(timer);
                        throw new Error("");
                    });	
                }                
            },opts.cycleTime*1000);
        })        
        .fail(function(error){ 
            throw new Error("");
        });
    }
    
    function deleteAllObjects(dataAdapter){
        return dataAdapter.deleteAllLamps().then(dataAdapter.deleteAllSensors);
    }
             
    function generateObjects(opts, dataAdapter){
        var deferred = $.Deferred();  
        
        deferred.resolve();
        return deferred.promise();
    }
    
    function generateStreetsData(dataAdapter, dataScaffolding){
        
        var deferred = $.Deferred();   

        var addData = function (data, insertFunction){
            
            var deferred = $.Deferred();   
            
            (function loop(data, sum, stop, insertFunction) {
                if (sum < stop) {
                    return insertFunction(data[sum]).then(function(){
                        sum++;
                        return loop(data, sum, stop, insertFunction);
                    });
                }
            })(data, 0, data.length, insertFunction).then(function(){
                deferred.resolve();
            });  
            
            return deferred.promise();
        };  
        
        addData(dataScaffolding.lamps, dataAdapter.addLamp)
        .then(function(){ return addData(dataScaffolding.sensors, dataAdapter.addSensor);})
        .done(function(){deferred.resolve()});
        
        return deferred.promise();
    }
    
    function stopSimulation(){
        clearInterval(timer);
    }
    
    return {
        runSimulation       : runSimulation,
        stopSimulation      : stopSimulation,
        generateStreetsData : generateStreetsData,
        generateObjects     : generateObjects,
        deleteAllObjects    : deleteAllObjects 
    };
})();