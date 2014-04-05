//TODO  JULIO!!! este es tu punto de arranque, genera tu codigo en otro .js	
//  esto estaba definido para mapa de direcciones, hay que poner globitos, 
//  OJO el archivo googlemaps.js esta cambiado has de ponerlo acorde con los globers!!!!!
//#######################################################
function router_to_widget()
{  
	if (app.plataformaObjetivo=="sofia")
	{
		alert("No implementado aun.. vamos otra vez 123");
	}
	else //fiware
	{	
		alert("No implementado aun...como lo visualizo");
	}	
//  OJO JULIO!!!!!!! 	
	initialize();		
	var route = { start : "calle Gran Via , 100, 28013, Madrid" , end : "calle Gran Via , 55, 28013, Madrid" };
	calcRoute(route);
	
	//Lungo.Router.section("display");
}
//#######################################################




function lanzaSimulacion()
{
	if (app.plataformaObjetivo == "sofia")	{
		alert("No implementado");
	}
	else //fiware
	{	
		//Detecta el numero maximo de entidades creadas
		var No_context_element_found = false ;
		var n = 1000 ;
		var last_element_found = 0;
		var postJSON = {
					    "entities": [
								        {
								            "type": "luminaria",
								            "isPattern": "false",
								            "id": n
								        }
								    ]
						};	
		 while (No_context_element_found == false){ 
	   		var contentTypeRequest = $.ajax({
							                //url: 'http://130.206.83.60:1026/NGSI10/queryContext',
							                url: 'http://217.127.199.47:1026/NGSI10/queryContext', 
							                type: 'POST',
							                beforeSend: function(xhr) {
							                    xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
							                    xhr.setRequestHeader("Accept","application/json;");
							                },
							                data:   JSON.stringify(postJSON),
							                async: false, // La petici�n es s�ncrona
											cache: false // No  usar la cach� 
			});
		
	    	contentTypeRequest.done(function(data,textStatus,jqXHR){
								    		if ( data.hasOwnProperty('contextResponses'))	{								    			
								    			last_element_found = n;
								    			n = n + 1000;
								    			postJSON.entities[0].id = n;
								    		}
								    		else	{
								    			No_context_element_found = true;
								    			console.log( "DEBUG :  ultimo indice encontrado es  "  + last_element_found);			

								    		}							    				
			});	
		    contentTypeRequest.fail(function(jqXHR, textStatus, errorString){     
					console.log( "DEBUG :  upps fallas...pirotecnia....explosion"  );
			});	   		
		}
		
		
		var min_luminosidad = 0;
		var max_luminosidad = 100;
		var res_luminosidad = 0;
		var j;	
		//var postJSON = {"contextElements" : [  ] ,  "updateAction": "UPDATE"};
			
		//lanza la simulacion cada X segundos 
		var periodoCiclo = document.getElementById('periodo_en_segundos').value * 1000;	
		$("#li_boton_lanza_simulacion").hide("slow");
		$("#li_boton_para_simulacion").show("slow");
		 
		app.manejadorCiclo = setInterval(function(){	
			for ( j = last_element_found ; j > 0; j = j - 1000) {
				var postJSON = {"contextElements" : [  ] ,  "updateAction": "UPDATE"};
				for (var i = j ; i > j - 1000 ; i--) {
					postJSON["contextElements"].push({
								                          "type" : "luminaria",
								                          "isPattern" : "false",
								                          "id" : i,
								                          "attributes" : [
								                            {
								                              "name" : "nivelIntensidad",
								                              "type" : "porcentaje",
								                              "value" : Math.floor(Math.random() * (max_luminosidad - min_luminosidad + 1)) + min_luminosidad
								                            }
								                          ]
								                        }       
							                        );										
				}
				var contentTypeRequest = $.ajax({
		                //url: 'http://130.206.83.60:1026/NGSI10/updateContext',
		                url: 'http://217.127.199.47:1026/NGSI10/updateContext',
		                type: 'POST',
		                beforeSend: function(xhr) {
		                    xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
		                    xhr.setRequestHeader("Accept","application/json;");
		                },
		                data:   JSON.stringify(postJSON),
		                //async: false, // La petici�n es s�ncrona
						//cache: false // No  usar la cach� 
				});
			
		    	contentTypeRequest.done(function(result){     		
					console.log( "DEBUG :  termina una iteracion actualizando 1000 objetos ");			
				});	
			    contentTypeRequest.fail(function(jqXHR, textStatus, errorString){     
						console.log( "DEBUG :   Ajax request failed... (" + textStatus + ' - ' + jqXHR.responseText +  errorString + ")." );
				});
				contentTypeRequest.always(function(jqXHR, textStatus){     
					postJSON["contextElements"].splice(0, postJSON["contextElements"].length);
					postJSON["contextElements"].length = 0;	
				});
			}
			
		},periodoCiclo);
	}//else
}

function genera_objetos(numero_de_luminarias) {
	
if (app.plataformaObjetivo=="sofia")
{
	alert("No implementado");
}
else //fiware
{
	console.log( "DEBUG :   se lanza la creacion de objetos con Fiware." );	
	
	var min_lat = 320000;
	var max_lat = 470000;
	var min_lon = 530000;
	var max_lon = 860000;
	var res_lat = 0;
	var res_lon = 0;
	var min_luminosidad = 0;
	var max_luminosidad = 100;
	var res_luminosidad = 0;
	
	
	var postJSON = {"contextElements" : [                        
					                        {
					                          "type" : "luminaria",
					                          "isPattern" : "false",
					                          "id" : "liums",
					                          "attributes" : [
					                            {
					                              "name" : "nivelIntensidad",
					                              "type" : "porcentaje",
					                              "value" : "0"
					                            },
					                            {
					                              "name" : "latitud",
					                              "type" : "DDD",
					                              "value" : "40.33333"
					                            },
					                            {
					                              "name" : "longitud",
					                              "type" : "DDD",
					                              "value" : "01.22222"
					                            },
					                            {
					                              "name" : "FK_idCuadro",
					                              "type" : "int",
					                              "value" : "1"
					                            }
					                          ]
					                        }                        
					                       ] , 
					  "updateAction": "APPEND"};					
	
	
var j;	
for ( j = numero_de_luminarias ; j > 0; j = j - 1000) {
	
	for (var i = j ; i > j - 1000 ; i--) {
				
		postJSON["contextElements"].push({
					                          "type" : "luminaria",
					                          "isPattern" : "false",
					                          "id" : i,
					                          "attributes" : [
					                            {
					                              "name" : "nivelIntensidad",
					                              "type" : "porcentaje",
					                              "value" : Math.floor(Math.random() * (max_luminosidad - min_luminosidad + 1)) + min_luminosidad
					                            },
					                            {
					                              "name" : "latitud",
					                              "type" : "DDD",
					                              "value" : "40." + Math.floor(Math.random() * (max_lat - min_lat + 1)) + min_lat
					                            },
					                            {
					                              "name" : "longitud",
					                              "type" : "DDD",
					                              "value" : "-3." + Math.floor(Math.random() * (max_lon - min_lon + 1)) + min_lon
					                            },
					                            {
					                              "name" : "FK_idCuadro",
					                              "type" : "int",
					                              "value" : "1"
					                            }
					                          ]
					                        }       
				                        );										
	}
		
	
	var contentTypeRequest = $.ajax({
                //url: 'http://130.206.83.60:1026/NGSI10/updateContext',
                url: 'http://217.127.199.47:1026/NGSI10/updateContext',
                //url: 'http://84.79.177.13:1026/NGSI10/updateContext',
                type: 'POST',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
                    xhr.setRequestHeader("Accept","application/json;");
                },
                data:   JSON.stringify(postJSON),
                async: false, // La petici�n es s�ncrona
				cache: false // No  usar la cach� 
		});
	
    	contentTypeRequest.done(function(result){     		
			console.log( "DEBUG :   termina una iteracion de 1000 objetos creando objetos en el rango: " + j );			
		});	
	    contentTypeRequest.fail(function(jqXHR, textStatus, errorString){     
				console.log( "DEBUG :   Ajax request failed... (" + textStatus + ' - ' + jqXHR.responseText +  errorString + ")." );
		});
		contentTypeRequest.always(function(jqXHR, textStatus){     
			postJSON["contextElements"].splice(0, postJSON["contextElements"].length);
			postJSON["contextElements"].length = 0;	
		});
		
	}
	
       
	console.log( "DEBUG :   termina la creacion de objetos. " );
	navigator.notification.alert("termina la creacion de objetos, se han creado " + numero_de_luminarias , null, 'Mensajito');
	Lungo.Router.section("simulador"); 
}	
}

// exit    
function exitFromApp(buttonIndex) {	if (buttonIndex==2){  navigator.app.exitApp();	}}
// exit  
function tap_on_exit(){
	navigator.notification.confirm(
								    "sales de la app?",  // message
								    exitFromApp,              // callback to invoke with index of button pressed
								    "salir",            // title
								    "NO , SI"         // buttonLabels
								    );
}


var app = {
	
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    
    // app atributtes    
    plataformaObjetivo: function() {},
    
    manejadorCiclo: function() {},
    
    // app methods
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('menubutton', function(){	Lungo.Aside.toggle("features");	} , false);
        document.addEventListener('searchbutton', tap_on_exit, false);
        document.addEventListener('startcallbutton', tap_on_exit, false);
        document.addEventListener('endcallbutton', tap_on_exit, false);
        document.addEventListener('backbutton', tap_on_exit, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicity call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
    	
        setTimeout(function() { 					
        						Lungo.Router.section("simulador");			
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



