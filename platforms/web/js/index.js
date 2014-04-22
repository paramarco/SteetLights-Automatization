$( document ).ready(function() {
	$("#boton_genera_objetos").click(function(){	
													Lungo.Router.section("main_loading");
													app.plataformaObjetivo = "fiware";	
												});
	$("#boton_genera_escenario").click(function(){
													Lungo.Router.section("ciclodeCarga");
													app.plataformaObjetivo = "fiware";
					    						});
	$("#boton_lanza_simulacion").click(function(){	
													if (isNaN(document.getElementById('periodo_en_segundos').value ) || 
														document.getElementById('periodo_en_segundos').value == ""	|| 
														isNaN(document.getElementById('numero_de_objetos_paquete_simulacion').value ) || 
														document.getElementById('numero_de_objetos_paquete_simulacion').value == ""	){
														alert("Inserte numero por favor!");
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
													if ( 	valorInsertado != "" && valorInsertado != null && valorInsertado > 0 &&
															numero_de_objetos_paquete != "" && numero_de_objetos_paquete != null && numero_de_objetos_paquete > 0 &&
															!isNaN(valorInsertado) && !isNaN(numero_de_objetos_paquete)	){
															
														Lungo.Router.section("loading_now");

					    								setTimeout(function() {	genera_objetos(valorInsertado,numero_de_objetos_paquete);}, 3000);
													} else {
														alert("Inserte un numero favor!");
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
	
	$("#botonIrMonitorFiware").click(function(){	
												    app.plataformaObjetivo = "fiware";
												    router_to_widget();
											    });
	
	$("#botonIrMonitorSofia").click(function(){	
	    											app.plataformaObjetivo = "sofia";
												    router_to_widget();
											    });
												
	$("#back_sign_in_widget").click(function()	{	Lungo.Router.section("simulador"); 	});
	$("#back_sign_in_loading").click(function()	{	Lungo.Router.section("simulador");	});	
});


function router_to_widget()
{  
	if (app.plataformaObjetivo=="sofia")
	{
		alert("No implementado aun...");
	}
	else //fiware
	{	
		Lungo.Router.section("display");
	}	

}

// exit    
function exitFromApp(buttonIndex) {	
	if (buttonIndex==2){ 
	//navigator.app.exitApp();
	}
}
// exit  
function tap_on_exit(){
	//navigator.notification.confirm("sales de la app?",  exitFromApp, "salir", "NO , SI" );
}


var app = {
	
    
    // app atributtes    
    plataformaObjetivo: function() {},
    
    manejadorCiclo: function() {},
  
    // Update DOM on a Received Event
    receivedEvent: function(id) {
    	
        setTimeout(function() { 					
        						Lungo.Router.section("mainSimulador");			
								}, 3000);          
    }
};





/*

                                                ##################
                                           ############################
                                         ################################
                                       ####################################
                                     ########################################
                                   ############################################
                                  ##############################################
                                 #############                      #############
                                #########                                #########
                                #######                                    #######
                               ######                                        ######
                               #####                                          #####
                              #####                                            #####
                              ####                                              ####
                              ####                                              ####
                              ####                                              ####
                              ####                                              ####
                              #####                                            #####
                              #####                                            #####
                               #####                                          #####
                               ######                                        ######
                                #######                                    #######
                                #########                                #########
                                 #############                      #############
                                  ##############################################
                                   ############################################
                                     ########################################
                                       ####################################
                                         ################################
                                           ############################
                                                ##################

*/
// COMUNICACIONES EN XML
/*		res_luminosidad =  Math.floor(Math.random() * (max_luminosidad - min_luminosidad + 1)) + min_luminosidad;
		res_lat = "40." + Math.floor(Math.random() * (max_lat - min_lat + 1)) + min_lat;
		res_lon = "-3." + Math.floor(Math.random() * (max_lon - min_lon + 1)) + min_lon;		
			
		var postXML = '<updateContextRequest> <contextElementList> <contextElement> <entityId type="luminaria" isPattern="false"> <id>'
		+i+'</id> </entityId> <contextAttributeList> <contextAttribute> <name>nivelIntensidad</name> <type>porcentaje</type> <contextValue>'
		+res_luminosidad+'</contextValue> </contextAttribute> <contextAttribute> <name>latitud</name> <type>DDD</type> <contextValue>'
		+res_lat+'</contextValue> </contextAttribute> <contextAttribute> <name>longitud</name> <type>DDD</type> <contextValue>'
		+res_lon+'</contextValue> </contextAttribute> <contextAttribute> <name>FK_idCuadro</name> <type>int</type> <contextValue>'
		+1+'</contextValue> </contextAttribute> </contextAttributeList> </contextElement> </contextElementList> <updateAction>APPEND</updateAction> </updateContextRequest>';
		
		var contentTypeRequest = $.ajax({
		headers: { 
			        "Accept" : "application/xml",
			        "Content-Type": "application/xml"
    				},
    	url: 'http://130.206.83.60:1026/NGSI10/updateContext',
    	data: postXML,
		type: 'POST',
		async: false, // La petici�n es s�ncrona
		cache: false // No queremos usar la cach� del navegador
		});				
		contentTypeRequest.done(function(result){ 
			//console.log( "DEBUG :   DONE!!!!" ); 
			//alert(JSON.stringify(result));//alert(result);//alert(JSON.stringify(result));	
		});		
		contentTypeRequest.fail(function(jqXHR, textStatus){     
			console.log( "DEBUG :   Ajax request failed... (" + textStatus + ' - ' + jqXHR.responseText + ")." );
			//alert(jqXHR.responseText);		
		});
		contentTypeRequest.always(function(jqXHR, textStatus){     
			//console.log( "DEBUG :   ALWAYS AJAX" );
		});	
		*/



