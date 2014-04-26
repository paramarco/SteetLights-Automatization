function conectarSIBConToken(token, instance,funcionaAllamar){

	  joinToken(token, instance, function(mensajeSSAP){
          if(mensajeSSAP != null && mensajeSSAP.body.data != null && mensajeSSAP.body.ok == true){
			console.log( "DEBUG : 	infoConexion	: Conectado al sib con sessionkey:  " + mensajeSSAP.sessionKey  );
			funcionaAllamar(); 				
         }else{
         	console.log( "DEBUG : 	infoConexion	: Error conectando del sib  ");
        }
    });

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
  
function repuestaSIBaINSERT (){  
}
		

var arrancaGeneraObjetos = function (){
	var min_lat = 0.320000;
	var max_lat = 0.470000;
	var min_lon = 0.530000;
	var max_lon = 0.860000;
	var res_lat = 0;
	var res_lon = 0;
	var min_luminosidad = 0;
	var max_luminosidad = 100;
	var res_luminosidad = 0;
	
	console.log( "DEBUG : 	arrancaGeneraObjetos entra	" );
	for (var j = app.numero_de_luminarias ; j > 0; j = j - app.numero_de_objetos_paquete) {
	
		//for (var i = j ; i > j - app.numero_de_objetos_paquete ; i--) {
				
			var queryMongo = {
						      "luminaria" :{											
												"id" : j.toString(),
												"nivelIntensidad"	: Math.floor(Math.random() * (max_luminosidad - min_luminosidad + 1)) + min_luminosidad,
												"posicion": {	
															"type":"Point",
															"coordinates":	[	40.0 +  Math.random() * (max_lat - min_lat ) + min_lat  , 
																				-3.0 - (Math.random() * (max_lon - min_lon ) + min_lon)
																			],
															},
												"FK_idCuadro": "1"
											}
							    };										
		

		//var queryMongo2insert = JSON.stringify(queryMongo).replace(/\[/g, / /).replace(/\]/g, / /);
		
		var queryMongo2insert = JSON.stringify(queryMongo);		
		
		console.log( "DEBUG : 	estos es lo que se envia a SOFIA : " + queryMongo2insert  ); 
		
		insert(	queryMongo2insert , 
			"SIB_test_luminaria", 
			function(mensajeSSAP){						
		          if(mensajeSSAP != null && mensajeSSAP.body.data != null && mensajeSSAP.body.ok == true){
					console.log( "DEBUG : 	insert	: correctamente enviado al SIB un paquete con " + app.numero_de_objetos_paquete);
		         }else{
		         	console.log( "DEBUG : 	insert	: Error conectando al SIB, algo fallo ");
		        }
		    });
					
	}	    
		    
	console.log( "DEBUG : 	arrancaGeneraObjetos termina	" );
	
};

//arranca simulacion SOFIA-2
//TODO descrubir el numero de objetos metidos en el SIB
var arrancaSimulacion = function (){
	
	// var queryMongo = "{db.SIB_test_luminaria.count()}";
	// query( queryMongo, 
				// "SIB_test_luminaria", 										
				// function(mensajeSSAP){
			          // if(mensajeSSAP != null && mensajeSSAP.body.data != null && mensajeSSAP.body.ok == true){			          	
						// console.log( "DEBUG : 	query	: correctamente devuelto del SIB un paquete con datos: " + JSON.stringify(mensajeSSAP));
			         // }else{
			         	// console.log( "DEBUG : 	query	: Error conectando al SIB, algo fallo ");
			         	// console.log( "DEBUG : 	query	:  devuelto del SIB un paquete con datos: " + JSON.stringify(mensajeSSAP));
			        // }
			    // });	
	var last_element_found = 0;		    
	var queryMongo = '{select count(*) from SIB_test_luminaria}'; 
	queryWithQueryType( queryMongo, 
						"SIB_test_luminaria", 
						"SQLLIKE",
						null,						
						function(mensajeSSAP){
					          if(mensajeSSAP != null && mensajeSSAP.body.data != null && mensajeSSAP.body.ok == true){	
					          	last_element_found = mensajeSSAP.body.data;		          	
								console.log( "DEBUG : 	query	: el numero de objetos metidos es: " + last_element_found );
					         }else{
					         	console.log( "DEBUG : 	query	: Error conectando al SIB, algo fallo ");
					         	console.log( "DEBUG : 	query	: devuelto del SIB un paquete con datos: " + JSON.stringify(mensajeSSAP));
					        }
					    });	

	 var min_luminosidad = 0;
	 var max_luminosidad = 100;
	 var res_luminosidad = Math.floor(Math.random() * (max_luminosidad - min_luminosidad + 1)) + min_luminosidad;

	 var queryUpdate = '{update SIB_test_luminaria set luminaria.nivelIntensidad = 100 where luminaria.id = "1"}';
	 var dataUpdate = "";
 	
	queryWithQueryType( queryUpdate, "SIB_test_luminaria", "SQLLIKE",	null,							
				 function(mensajeSSAP){
			           if(mensajeSSAP != null && mensajeSSAP.body.data != null && mensajeSSAP.body.ok == true){			          	
						 console.log( "DEBUG : 	update	: correctamente devuelto del SIB un paquete con datos: " + JSON.stringify(mensajeSSAP));
			          }else{
			         	 console.log( "DEBUG : 	update	: Error devuelto del SIB un paquete con datos: " + JSON.stringify(mensajeSSAP));
			         }
			     });	
		
		
		
		
		
// lanza la simulacion cada X segundos 
//	var periodoCiclo = document.getElementById('periodo_en_segundos').value * 1000;	
//	var numero_de_objetos_paquete_simulacion = document.getElementById('numero_de_objetos_paquete_simulacion').value;	
	
//	$("#li_boton_lanza_simulacion").hide("slow");
//	$("#li_boton_para_simulacion").show("slow");
	 
//	app.manejadorCiclo = setInterval(function(){	
			
		
//	},periodoCiclo);
		    
		
	
	console.log( "DEBUG : 	arrancaSimulacion termina	" ); 
};

function lanzaSimulacion()
{
	
	
	if (app.plataformaObjetivo == "sofia")	{
		console.log( "DEBUG : 	Entra en 	: lanzaSimulacion: con SOFIA "   );
		
		setKpName("KP_test_luminaria");	
		conectarSIBConToken("3bb7264f5c1743b78dbaa5ba2e33ac35", "KP_test_luminaria:KP_test_luminaria01", arrancaSimulacion );

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
							                url: 'http://217.127.199.47:8080/NGSI10/queryContext', 
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
		                url: 'http://217.127.199.47:8080/NGSI10/updateContext',
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
	
	app.numero_de_luminarias = numero_de_luminarias;
	app.numero_de_objetos_paquete = numero_de_objetos_paquete ;
	setKpName("KP_test_luminaria");
	
	conectarSIBConToken("3bb7264f5c1743b78dbaa5ba2e33ac35", "KP_test_luminaria:KP_test_luminaria01", arrancaGeneraObjetos );
	
	console.log( "DEBUG :   se lanza la creacion de objetos con sofia." + ", objetos por paquete: "  + numero_de_objetos_paquete + ", luminarias: " + numero_de_luminarias);
	
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
	
	
	var postJSON =  {"contextElements" : [ 
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
														            "metadatas": [
														                {
														                    "name": "location", 
														                    "type": "string", 
														                    "value": "WSG84"
														                }
														            ], 
														            "name": "position", 
														            "type": "coords", 
														            "value": "40.46889,-3.815238"
														        },															
																{
																"name" : "FK_idCuadro",
																"type" : "int",
																"value" : "11"
																}
															]
											} 
										] , 
					"updateAction": "APPEND"
					};
					  					
	
	
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
														            "metadatas": [
														                {
														                    "name": "location", 
														                    "type": "string", 
														                    "value": "WSG84"
														                }
														            ], 
														            "name": "position", 
														            "type": "coords", 
														            "value": "40." + Math.floor(Math.random() * (max_lat - min_lat + 1)) + min_lat + ","+ "-3." +  Math.floor(Math.random() * (max_lon - min_lon + 1)) + min_lon
														        },
																{
																"name" : "FK_idCuadro",
																"type" : "int",
																"value" : "11"
																}
					                          				]
					                        }       
				                        );										
	}
		
	
	var contentTypeRequest = $.ajax({
                //url: 'http://130.206.83.60:1026/NGSI10/updateContext',
                url: 'http://217.127.199.47:8080/NGSI10/updateContext',
                //url: 'http://84.79.177.13:1026/NGSI10/updateContext',
                type: 'POST',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
                    xhr.setRequestHeader("Accept","application/json;");
                },
                data:   JSON.stringify(postJSON),
                async: false, // sincrona
				cache: false // No  usar cache 
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
	alert("termina la creacion de objetos, se han creado ");
	Lungo.Router.section("main_loading"); 
}	
}


function genera_Calles_FI_WARE() {
	
	console.log( "DEBUG : empieza a generar las calles y sus sensores"   );
	
	var postJSON = 
	var contentTypeRequest = $.ajax({
                //url: 'http://130.206.83.60:1026/NGSI10/updateContext',
                url: 'http://217.127.199.47:8080/NGSI10/updateContext',
                //url: 'http://84.79.177.13:1026/NGSI10/updateContext',
                type: 'POST',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
                    xhr.setRequestHeader("Accept","application/json;");
                },
                data:   JSON.stringify(postJSON),
                async: false, // sincrona
				cache: false // No  usar cache 
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
	
	console.log( "DEBUG : termina de generar las calles y sus sensores"   );	
}

