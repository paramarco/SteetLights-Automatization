$( document ).ready(function() {

    var appContext = {
        fiwareServerConfig : fiwareInstalticConfig,
        sofia2ServerConfig : sofia2Config
    }
        
    
    function onDeleteAllClick(dataServerConfig, dataAdapter){
        
        Lungo.Notification.show("refresh","Realizando operación");
        
        dataAdapter.init(dataServerConfig)
        .then(function(){
            return platformTestRunner.deleteAllObjects(dataAdapter);
        })            
        .fail(function(error){ 
            Lungo.Notification.error("Error","Error al procesar la operación","remove-sign",3);
        })
        .done(function(){
            Lungo.Notification.hide();
        });
    }
    
    function onShowMapClick(dataServerConfig, notifierServerConfig, dataAdapter, notifierAdapter){
        Lungo.Router.section("display");         
        dataAdapter.init(dataServerConfig).then(function(){
            notifierAdapter.init(notifierServerConfig);
            visor.run(dataAdapter,notifierAdapter);
        });  
    }    
        
    function onGenerateStreetDataClick(dataServerConfig, dataAdapter){
        
        Lungo.Notification.success("Realizando operación","Generando escenario","refresh");
        
        dataAdapter.init(dataServerConfig)
        .then(function(){
            return platformTestRunner.generateStreetsData(dataAdapter, lampsSensorsElectricalCabinetData);
        })
        .fail(function(error){ 
            Lungo.Notification.error("Error","Error al procesar la operación","remove-sign",3);
        })
        .done(function(){
            Lungo.Notification.hide();
        });
    }     
    
    function onGenerateSimulationScenarioClick(dataServerConfig, dataAdapter){
        
        Lungo.Router.section("SimulationScenarioView");
        
        $("#runSimulationScenario").click(function(){	
            
            var cycleTime = document.getElementById('simulationCycleTime').value;
            var maxLamps  = document.getElementById('simulationNumObjects').value;

            if (!/^[1-9]+[0-9]*/.test(cycleTime)  || !/^[1-9]+[0-9]*/.test(maxLamps)){
                Lungo.Notification.error("Error","Los campos han de ser númericos y mayores que 0","remove-sign",5);
            }
            else{
        
                var opts    = { "cycleTime" : parseInt(cycleTime), "maxLamps" : parseInt(maxLamps) };
                var showLog = function(message){ $("#events").append("<p>"+JSON.stringify(message)+"</p>");}; 
                
                $("#events").text("");
                $("#runSimulationScenarioDiv").hide("slow");
                $("#stopSimulationScenarioDiv").show("slow");
            
                dataAdapter.init(dataServerConfig)
                .then(function(){
                    try{ platformTestRunner.runSimulation(opts,dataAdapter,showLog);}
                    catch(e){ Lungo.Notification.error("Error","Error al procesar la operación","remove-sign",3);}
                })
                .fail(function(){
                    Lungo.Notification.error("Error","Error al procesar la operación","remove-sign",3);
                });
            }           
        });  
        
        $("#stopSimulation").click(function(){	
            platformTestRunner.stopSimulation();
            $("#runSimulationScenarioDiv").toggle("slow");
            $("#stopSimulationScenarioDiv").toggle("slow");
        });	
    }
  
    function onGenerateObjectsClick(dataServerConfig, dataAdapter){
        
        Lungo.Router.section("generateObjectsView");
        
        $("#generateObjects").click(function(){	
       
//            var numLamps = document.getElementById('genObjectsCycleTime').value;
//            var batch    = document.getElementById('numero_de_objetos_paquete_simulacion').value;
//
//            if (!/^[1-9]+[0-9]*/.test(cycleTime)  || !/^[1-9]+[0-9]*/.test(maxLamps)){
//                Lungo.Notification.error("Error","Los campos han de ser númericos y mayores que 0","remove-sign",5);
//            }
//            else{
//        
//                var opts = { "cycleTime" : parseInt(cycleTime), "maxLamps" : parseInt(maxLamps) };
//                          
//                $("#runSimulationScenarioDiv").toggle("slow");
//                $("#stopSimulationScenarioDiv").toggle("slow");
//            
//                dataAdapter.init(dataServerConfig)
//                .then(function(){
//                    try{ platformTestRunner.generateObjects(opts,dataAdapter);}
//                    catch(e){ Lungo.Notification.error("Error","Error al procesar la operación","remove-sign",3);}
//                })
//                .fail(function(){
//                    Lungo.Notification.error("Error","Error al procesar la operación","remove-sign",3);
//                });
//            } 
        
        });  
    }
    
    //fiware action buttons
    $("#fiwareServerConfig").change(function(){	
        appContext.fiwareServerConfig = parseInt($("#fiwareServerConfig").val()) === 1 ? fiwareInstalticConfig : fiwareFilabConfig;
    });        

    $("#runSimulationScenarioFiware").click(function(){	
        onGenerateSimulationScenarioClick(appContext.fiwareServerConfig.dataServer, fiwareDataAdapter);        
    });	
    
    $("#generateObjectsFiware").click(function(){	
        onGenerateObjectsClick(appContext.fiwareServerConfig.dataServer, fiwareDataAdapter); 
    });
    
    $("#generateStreetsDataFiware").click(function(){
        onGenerateStreetDataClick(appContext.fiwareServerConfig.dataServer, fiwareDataAdapter);
    });      

    $("#deleteAllFiware").click(function(){        
        onDeleteAllClick(appContext.fiwareServerConfig.dataServer, fiwareDataAdapter);
    });			    						
  
    $("#showFiwareDataMap").click(function(){	
        var serverConfig = appContext.fiwareServerConfig;
        onShowMapClick(serverConfig.dataServer, serverConfig.notifierServer, fiwareDataAdapter, fiwareNotifier);       
    });
    
    
    //sofia2 action buttons	
    $("#runSimulationScenarioSofia2").click(function(){	
        onGenerateSimulationScenarioClick(appContext.sofia2ServerConfig, sofia2DataAdapter);        
    });	
    
    $("#generateObjectsSofia").click(function(){	
        onGenerateObjectsClick(appContext.sofia2ServerConfig, sofia2DataAdapter); 
    });
    
    $("#generateStreetsDataSofia2").click(function(){
        onGenerateStreetDataClick(appContext.sofia2ServerConfig, sofia2DataAdapter);
    });      

    $("#deleteAllSofia2").click(function(){        
        onDeleteAllClick(appContext.sofia2ServerConfig, sofia2DataAdapter);
    });			    						
  
    $("#showSofia2DataMap").click(function(){	
        var serverConfig = appContext.sofia2ServerConfig;
        dwr.engine.setActiveReverseAjax(true); 
        onShowMapClick(serverConfig, serverConfig, sofia2DataAdapter, sofia2Notifier);    
    });
   
});