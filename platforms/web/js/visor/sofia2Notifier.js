var sofia2Notifier= (function () {
 
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
    
    function onUpdate (callback){
            //TO-DO
    }

    return {
        onUpdate : onUpdate
    };
 
})();