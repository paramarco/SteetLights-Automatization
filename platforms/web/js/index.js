$( document ).ready(function() {

        $("#selectServidorFIware").change(function(){	
                app.plataformaObjetivo = "fiware";
                switch(parseInt($("#selectServidorFIware").val())){
                        case 1:
                            app.ipFIware = app.ipFIwareInstalTIC;
                            app.ipFIwareNotifier = app.ipFIwareNotifierInstalTIC;
                            break;
                        case 2:
                             app.ipFIware = app.ipFIwareFIlab;
                             app.ipFIwareNotifier = app.ipFIwareNotifierFIlab;
                             break;
                      default: ;
                }
                
                fiwareDataAdapter.setIP(app.ipFIware);
                fiwareNotifier.setIP(app.ipFIwareNotifier);
                    
                console.log( "DEBUG : RECONFIGURACION DE IPS FIWARE :" +  app.ipFIware + " notificador " + app.ipFIwareNotifier );
        });
        

        $("#selectServidorSOFIA").change(function(){   
                app.plataformaObjetivo = "sofia";
                switch(parseInt($("#selectServidorSOFIA").val())){
                        case 1:
                                 pathToDwrServlet = app.ipSOFIAinCloud;
                                 sibServer = pathToDwrServlet + '/';
                                 
                                 app.luminaria.ontologia = "SIB_test_luminaria";
                                 app.luminaria.KP = "KP_test_luminaria";
                                 app.luminaria.instancia = "KP_test_luminaria:KP_test_luminaria01";
                                 app.luminaria.token = "3bb7264f5c1743b78dbaa5ba2e33ac35";
                                 
                                 app.cuadro.ontologia = "SIB_test_cuadro";
                                 app.cuadro.KP = "KP_test_cuadro";
                                 app.cuadro.instancia = "KP_test_cuadro:KP_test_cuadro01";
                                 app.cuadro.token = "6cb9fa1dcd404093ac38997eb1f3d620";
                                 
                                 app.sensor.ontologia = "SIB_test_sensor";
                                 app.sensor.KP = "KP_test_sensor";
                                 app.sensor.instancia = "KP_test_sensor:KP_test_Sensor02";
                                 app.sensor.token = "80fb6498a34e48caa6a1f68ca91dda7a";
                                 break;
                        case 2:
                                 pathToDwrServlet = app.ipSOFIAInstalTIC; 
                                 sibServer = pathToDwrServlet + '/';
                                 
                                 app.luminaria.ontologia = "SIB_test_luminaria";
                                 app.luminaria.KP = "KP_test_luminaria";
                                 app.luminaria.instancia = "KP_test_luminaria:KP_test_luminaria01";
                                 app.luminaria.token = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
                                 
                                 app.cuadro.ontologia = "SIB_test_cuadro";
                                 app.cuadro.KP = "KP_test_cuadro";
                                 app.cuadro.instancia = "KP_test_cuadro:KP_test_cuadro01";
                                 app.cuadro.token = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
                                 
                                 app.sensor.ontologia = "SIB_test_sensor";
                                 app.sensor.KP = "KP_test_sensor";
                                 app.sensor.instancia = "KP_test_sensor:KP_test_Sensor02";
                                 app.sensor.token = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx";
                                 break;
                        default: ;
                }

                //fiwareNotifier.setLuminariaSettings(app.luminaria);
                fiwareDataAdapter.setLampAccessData(app.luminaria);
                
                //fiwareNotifier.setCuadroSettings(app.cuadro);
                //fiwareDataAdapter.setCuadroSettings(app.cuadro);
                
                //fiwareNotifier.setLuminariaSettings(app.sensor);
                //fiwareDataAdapter.setLuminariaSettings(app.sensor);

                console.log( "DEBUG : RECONFIGURACION DE IPS SOFIA: servidor: " + sibServer +" " +  JSON.stringify(app.luminaria) + JSON.stringify(app.cuadro) + JSON.stringify(app.sensor) );
        });


        $("#boton_genera_objetos").click(function(){	
            Lungo.Router.section("main_loading");
            app.plataformaObjetivo = "fiware";	
        });
        
        $("#boton_genera_escenario").click(function(){
            Lungo.Router.section("ciclodeCarga");
            app.plataformaObjetivo = "fiware";
        });
        
        $("#boton_genera_calles").click(function(){
            Lungo.Router.section("loading_now");
            app.plataformaObjetivo = "fiware";
            setTimeout(function() {  genera_Calles(); }, 3000);
        });
        
        $("#Eliminar_Todo").click(function(){
            Lungo.Router.section("loading_now");
            app.plataformaObjetivo = "fiware";
            setTimeout(function() {	Eliminar_Todo(); }, 3000);
        });
        
        
        
        $("#boton_lanza_simulacion").click(function(){	
            if (isNaN(document.getElementById('periodo_en_segundos').value ) || 
                document.getElementById('periodo_en_segundos').value == ""	|| 
                isNaN(document.getElementById('numero_de_objetos_paquete_simulacion').value ) || 
                document.getElementById('numero_de_objetos_paquete_simulacion').value == ""	){
                alert("Inserte número por favor!");
            }
            else{
                $("#li_boton_lanza_simulacion").hide("slow");
                $("#li_boton_para_simulacion").show("slow");
                setTimeout(function() {	lanzaSimulacion(); }, 3000);
            }	
        });				    						
    
        $("#boton_para_simulacion").click(function(){	clearInterval(app.manejadorCiclo);
            $("#li_boton_lanza_simulacion").show("slow");
            $("#li_boton_para_simulacion").hide("slow");
        });					    						

        $("#boton_genera_objetos_ahora").click(function(){
            var valorInsertado = document.getElementById('numero_de_luminarias').value;
            var numero_de_objetos_paquete = document.getElementById('numero_de_objetos_paquete').value;		    
            
            if (valorInsertado != "" && valorInsertado != null && valorInsertado > 0 &&
                numero_de_objetos_paquete != "" && numero_de_objetos_paquete != null && numero_de_objetos_paquete > 0 &&
                !isNaN(valorInsertado) && !isNaN(numero_de_objetos_paquete)	){

                    Lungo.Router.section("loading_now");
                    setTimeout(function() {	genera_objetos(valorInsertado,numero_de_objetos_paquete);}, 3000);
            } else {
                    alert("Inserte un numero por favor!");
            }
        });											

        $("#boton_genera_objetos_sofia").click(function(){	
            Lungo.Router.section("main_loading");
            app.plataformaObjetivo = "sofia";		     
        });
    
        $("#boton_genera_escenario_sofia").click(function(){	
            Lungo.Router.section("ciclodeCarga");
            app.plataformaObjetivo = "sofia";					    									
        });
        
        $("#boton_genera_calles_sofia").click(function(){
            Lungo.Router.section("loading_now");
            app.plataformaObjetivo = "sofia";
            setTimeout(function() {	genera_Calles(); }, 3000);
        });
        
        $("#Eliminar_Todo_sofia").click(function(){
            Lungo.Router.section("loading_now");
            app.plataformaObjetivo = "sofia";
            setTimeout(function() {	Eliminar_Todo(); }, 3000);
        });
        																																

        $("#botonIrMonitorFiware").click(function(){	
            Lungo.Router.section("display");    
            visor.run(fiwareDataAdapter,fiwareNotifier);         
        });

        $("#botonIrMonitorSofia").click(function(){	
            Lungo.Router.section("display");      
            visor.run(sofia2DataAdapter,sofia2Notifier);
        });
});

var app = {
    // app atributtes    
    plataformaObjetivo: undefined,
    manejadorCiclo: undefined,

    //IPs de arranque
    ipFIware : "217.127.199.47:8080",
    ipFIwareNotifier :  "217.127.199.47:8090",
    
    ipSOFIA : 'http://scfront.cloudapp.net/sib/dwr',   
    
    //IP segun modo cloud o en InstalTIC
    
    ipFIwareInstalTIC : "217.127.199.47:8080",
    ipFIwareNotifierInstalTIC :  "217.127.199.47:8090",
    
    ipFIwareFIlab : "130.206.83.60:8080",
    ipFIwareNotifierFIlab:  "130.206.83.60:8090",
    
    ipSOFIAinCloud : 'http://scfront.cloudapp.net/sib/dwr',
    ipSOFIAInstalTIC : 'http://217.127.199.47:9090/sib/dwr',
    
    //Ontologias,KP,Tokens e instancias
    luminaria : { ontologia : "SIB_test_luminaria", KP : "KP_test_luminaria", instancia : "KP_test_luminaria:KP_test_luminaria01", token :"3bb7264f5c1743b78dbaa5ba2e33ac35" },
    sensor : { ontologia : "SIB_test_sensor", KP : "KP_test_sensor", instancia : "KP_test_sensor:KP_test_Sensor02", token :"80fb6498a34e48caa6a1f68ca91dda7a" },
    cuadro : { ontologia : "SIB_test_cuadro", KP : "KP_test_cuadro", instancia : "KP_test_cuadro:KP_test_cuadro01", token :"6cb9fa1dcd404093ac38997eb1f3d620" }    
    
};
