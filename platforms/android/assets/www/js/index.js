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

function conectarSIBConToken(token, instance, funcionaAllamar){

funcionaAllamar(); 
//	  joinToken(token, instance, function(mensajeSSAP){
//          if(mensajeSSAP != null && mensajeSSAP.body.data != null && mensajeSSAP.body.ok == true){
//			console.log( "DEBUG : 	infoConexion	: Conectado al sib con sessionkey:  " + mensajeSSAP.sessionKey  );
//			funcionaAllamar(); 				
 //         }else{
 //         	console.log( "DEBUG : 	infoConexion	: Error conectando del sib  ");
 //         }
  //    });

}

function desconectarSIB() {
	  leave(function(mensajeSSAP){
          if(mensajeSSAP != null && mensajeSSAP.body.data != null && mensajeSSAP.body.ok == true){
          	console.log( "DEBUG : 	infoConexion	: Desconectado del sib  " );               
          }else{
          	console.log( "DEBUG : 	infoConexion	: Error desconectando del sib " );
          }
      });
}     
//
//suscribirSIB($("#suscripcion").val(),$("#valor").val(),"SensorTemperatura",$("#refresco").val());  
//
function suscribirSIB(suscripcion, valor, ontologia, refresco) {	  
	  suscripcion = suscripcion.replace(/:/,valor).replace(/gt/,"{$gt:"+valor+"}").replace(/lt/,"{$lt:"+valor+"}");      
      
      var queryMongo = "{"+ontologia+".medida:"+suscripcion+"}";      
	  var subcriptionNotExists = subscribe(queryMongo, ontologia, refresco);
      
      if(!subcriptionNotExists){
    	  console.log( "DEBUG : 	idInfo	: Ya existe una suscripcion para esa query " );
      }   
}
  
  //A implementar porque el API la necesita para notificar que la suscripcion se ha hecho adecuadamente
function subscriptionWellLaunchedResponse(subscriptionId, subscriptionQuery){
	  idInfo="";
	  if(subscriptionId!=null){
		  if(subscriptionQuery.indexOf("luminaria") !== -1){
			  idInfo="luminaria";
		  }
		  console.log( "DEBUG : 	Suscrito con id	" + subscriptionId + " a query: " + subscriptionQuery );
	  }else {
		  console.log( "DEBUG : 	Error sucribiendo a ontologia	" );
	  }
 }
  

function desuscribirSIB(suscripcion, valor, ontologia) {    
	suscripcion = suscripcion.replace(/:/,valor).replace(/gt/,"{$gt:"+valor+"}").replace(/lt/,"{$lt:"+valor+"}");      
  	var queryMongo = "{"+ontologia+".medida:"+suscripcion+"}";
	unsubscribe	(	
					queryMongo, 
			    	function(mensajeSSAP){
				          if(mensajeSSAP != null && mensajeSSAP.body.data != null && mensajeSSAP.body.ok == true){
				        	  console.log( "DEBUG : 	Desuscrito de " + queryMongo );              
				          }else{
				              console.log( "DEBUG : 	Error dessucribiendo a ontologia	" );
				          }
			      	},
				    function(error){
				    	  if(error =="ERROR_1"){
				    	  	console.log( "DEBUG : 	No existe suscripcion para la query	" );
				    	  	}				    	  
				    }
				);
}


  //A implentear porque el API la necesita para recibir suscripciones, invocadas por el API js de SOFIA
function indicationForSubscription(ssapMessageJson) {
    var mensajeSSAP = parsearMensajeSSAP(validarSSAP(ssapMessageJson));
   
    var energia = 0;
    
    if (mensajeSSAP != null){
      try{   
    	 idSuscripcion = mensajeSSAP.messageId; 
    	 
    	 if(subscriptionsOntology[idSuscripcion]=="Watorimetro"){
    		 energia=mensajeSSAP.body.data[0].Watorimetro.medida;
    	 }           
          //Pintar datos  
          //TODO valor recibido de la suscripcion   
         
      }catch(err){ 
			console.log( "DEBUG : 	Excepcion	Error Notificacion	" + err ); 
      }
      
    }
      
  }
		

var arrancaGeneraObjetos = function (){
	alert("alert en arrancaGeneraObjetos");
};

var arrancaSimulacion = function (){
	alert("alert en arrancaSimulacion");
};

function lanzaSimulacion()
{
	if (app.plataformaObjetivo == "sofia")	{
		//conectarSIBConToken(token, instance);	
		conectarSIBConToken("2342523t23t23323", "luminaria_instaltic", arrancaSimulacion);
	}
	else //fiware
	{	
		//Detecta el numero maximo de entidades creadas
		var No_context_element_found = false ;
		var n = 1 ;
		var paso = 1;
		var last_element_found = 1;
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
								    			n = n + paso;
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
			
		//lanza la simulacion cada X segundos 
		var periodoCiclo = document.getElementById('periodo_en_segundos').value * 1000;	
		var numero_de_objetos_paquete_simulacion = document.getElementById('numero_de_objetos_paquete_simulacion').value;	
		
		$("#li_boton_lanza_simulacion").hide("slow");
		$("#li_boton_para_simulacion").show("slow");
		 
		app.manejadorCiclo = setInterval(function(){	
			for ( j = last_element_found ; j > 0; j = j - numero_de_objetos_paquete_simulacion) {
				var postJSON = {"contextElements" : [  ] ,  "updateAction": "UPDATE"};
				for (var i = j ; i > j - numero_de_objetos_paquete_simulacion ; i--) {
					console.log( "DEBUG :  compone objeto con id " + i );			

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
				console.log( "DEBUG :  compone objeto con j " + j );
				var contentTypeRequest = $.ajax({
		                //url: 'http://130.206.83.60:1026/NGSI10/updateContext',
		                url: 'http://217.127.199.47:1026/NGSI10/updateContext',
		                type: 'POST',
		                beforeSend: function(xhr) {
		                    xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
		                    xhr.setRequestHeader("Accept","application/json;");
		                },
		                data:   JSON.stringify(postJSON),
				});
			
		    	contentTypeRequest.done(function(result){     		
					console.log( "DEBUG :  termina una iteracion actualizando " + numero_de_objetos_paquete_simulacion + " objetos " );			
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

function genera_objetos(numero_de_luminarias, numero_de_objetos_paquete) {
	
if (app.plataformaObjetivo=="sofia"){
	//conectarSIBConToken(token, instance);	
	console.log( "DEBUG :  entro en lanzaSimulacion con sofia"  );
	//conectarSIBConToken("2342523t23t23323", "luminaria_instaltic", arrancaGeneraObjetos);
	console.log( "DEBUG :   se lanza la creacion de objetos con sofia." + numero_de_objetos_paquete + numero_de_luminarias);
}
else //fiware
{
	console.log( "DEBUG :   se lanza la creacion de objetos con Fiware." + numero_de_objetos_paquete + numero_de_luminarias);	
	
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
					                          "id" : "1",
					                          "attributes" : [
					                            {
					                              "name" : "nivelIntensidad",
					                              "type" : "porcentaje",
					                              "value" : "0"
					                            },
					                            {
					                              "name" : "latitud",
					                              "type" : "DDD",
					                              "value" : "40.60453200"
					                            },
					                            {
					                              "name" : "longitud",
					                              "type" : "DDD",
					                              "value" : "-3.3822552"
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
for ( j = numero_de_luminarias ; j > 0; j = j - numero_de_objetos_paquete) {
	
	for (var i = j ; i > j - numero_de_objetos_paquete ; i--) {
				
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
			console.log( "DEBUG :   termina una iteracion de " + numero_de_objetos_paquete + " objetos por paquete en el rango: " + j );			
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



