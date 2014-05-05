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
//
function suscribirSIB(suscription, ontology, queryType, refreshPeriod) {	  
    
	  var subcriptionNotExists = subscribeWithQueryType(suscription, ontology, queryType, refreshPeriod) ;    
      if(!subcriptionNotExists){
    	  console.log( "DEBUG : 	idInfo	: Ya existe una suscripcion para esa query " );
      }   
}
  
  //A implementar porque el API la necesita para notificar que la suscripcion se ha hecho adecuadamente
function subscriptionWellLaunchedResponse(subscriptionId, subscriptionQuery){

	  if(subscriptionId!=null){
		  console.log( "DEBUG : 	Suscrito con id	" + subscriptionId + " a query: " + subscriptionQuery );
	  }else {
		  console.log( "DEBUG : 	Error suscribiendo a ontologia.... XXX	" );
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
	
	app.numero_de_objetos_paquete = 1;
	
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
																			]
															},
												"FK_idCuadro": "11"
											}
							    };										
		

		//var queryMongo2insert = JSON.stringify(queryMongo).replace(/\[/g, / /).replace(/\]/g, / /);
		
		var queryMongo2insert = JSON.stringify(queryMongo);		
		
		console.log( "DEBUG : 	estos es lo que se envia a SOFIA : " + queryMongo2insert  ); 
		
		insert(	queryMongo2insert , 
			app.luminaria.ontologia, 
			function(mensajeSSAP){						
		          if(mensajeSSAP != null && mensajeSSAP.body.data != null && mensajeSSAP.body.ok == true){
					console.log( "DEBUG : 	insert	: correctamente enviado al SIB un paquete con " + app.numero_de_objetos_paquete);
		         }else{
		         	console.log( "DEBUG : 	insert	: Error conectando al SIB, algo fallo ");
		        }
		    });
					
	}	    
		    
	console.log( "DEBUG : 	arrancaGeneraObjetos termina	" );
	Lungo.Router.section("main_loading"); 
};

//arranca simulacion SOFIA-2
var arrancaSimulacion = function (){
	
	var min_luminosidad = 0;
	var max_luminosidad = 100;
	var queryUpdate = "{update " + app.luminaria.ontologia + " set luminaria.nivelIntensidad = 100 where luminaria.id = '1'}";
	var dataUpdate = "{}";
	var periodoCiclo = document.getElementById('periodo_en_segundos').value * 1000;	
								 
	
	var last_element_found = 0;		    
	var queryMongo = '{select count(*) from ' + app.luminaria.ontologia + ' }'; 
	queryWithQueryType( queryMongo, 
						app.luminaria.ontologia, 
						"SQLLIKE",
						null,						
						function(mensajeSSAP){
					          if(mensajeSSAP != null && mensajeSSAP.body.data != null && mensajeSSAP.body.ok == true){	
					          	last_element_found = mensajeSSAP.body.data;		          	
								console.log( "DEBUG : 	query	: el numero de objetos metidos es: " + last_element_found );
								
								// lanza la simulacion cada X segundos 
								app.manejadorCiclo = setInterval(function(){
								
									for (var i = last_element_found ; i >= 0; i--) {
									 
									 	var res_luminosidad = Math.floor(Math.random() * (max_luminosidad - min_luminosidad + 1)) + min_luminosidad; 
										var queryUpdate2insert  = queryUpdate.replace("'1'","'"+ i +"'");
										queryUpdate2insert = queryUpdate2insert.replace("= 100","="+ res_luminosidad );
										 
										updateWithQueryType(dataUpdate, queryUpdate2insert, app.luminaria.ontologia, "SQLLIKE",							
												 function(mensajeSSAP){
											           if(mensajeSSAP != null && mensajeSSAP.body.data != null && mensajeSSAP.body.ok == true){			          	
														 console.log( "DEBUG : 	update	: correctamente devuelto del SIB un paquete con datos: " + JSON.stringify(mensajeSSAP));
											          }else{
											         	 console.log( "DEBUG : 	update	: Error devuelto del SIB un paquete con datos: " + JSON.stringify(mensajeSSAP));
											         }
											     });		
									}
								},periodoCiclo);
								
					         }else{
					         	console.log( "DEBUG : 	query	: Error conectando al SIB, algo fallo ");
					         	console.log( "DEBUG : 	query	: devuelto del SIB un paquete con datos: " + JSON.stringify(mensajeSSAP));
					        }
					    });						    
	
	console.log( "DEBUG : 	arrancaSimulacion termina	" ); 
};

// 
var eliminarObjetos = function (){
	
	var queryMongo = "{DELETE FROM " + app.luminaria.ontologia + " WHERE luminaria.id != 'NaN' }"; // SSAP devuelve OK
	
	removeWithQueryType( queryMongo, 
						app.luminaria.ontologia, 
						"SQLLIKE",
						function(mensajeSSAP){
					          if(mensajeSSAP != null && mensajeSSAP.body.data != null && mensajeSSAP.body.ok == true){	
					          	last_element_found = mensajeSSAP.body.data;		          	
								console.log( "DEBUG : 	eliminarObjetos	: borrado correcto " );
					         }else{
					         	console.log( "DEBUG : 	eliminarObjetos	: Error conectando al SIB, algo fallo ");
					         	console.log( "DEBUG : 	eliminarObjetos	: devuelto del SIB un paquete con datos: " + JSON.stringify(mensajeSSAP));
					        }
					    });						    
					    	
	
	console.log( "DEBUG : 	SOFIA-2 eliminarObjetos termina 	" ); 
};

var eliminarObjetosCuadro = function (){
	
	var queryMongo = "{DELETE FROM " + app.cuadro.ontologia + " WHERE cuadro.id != 'NaN' }"; // SSAP devuelve 
	
	removeWithQueryType( queryMongo, 
						app.cuadro.ontologia, 
						"SQLLIKE",
						function(mensajeSSAP){
					          if(mensajeSSAP != null && mensajeSSAP.body.data != null && mensajeSSAP.body.ok == true){	
					          	last_element_found = mensajeSSAP.body.data;		          	
								console.log( "DEBUG : 	eliminarObjetosCuadro	: borrado correcto " );
					         }else{
					         	console.log( "DEBUG : 	eliminarObjetosCuadro	: Error conectando al SIB, algo fallo ");
					         	console.log( "DEBUG : 	eliminarObjetosCuadro	: devuelto del SIB un paquete con datos: " + JSON.stringify(mensajeSSAP));
					        }
					    });						    
					    	
	
	console.log( "DEBUG : 	SOFIA-2 eliminarObjetosCuadro termina 	" ); 
};

var eliminarObjetosSensor = function (){
	
	var queryMongo = "{DELETE FROM " + app.sensor.ontologia + " WHERE sensor.id != 'NaN' }"; // SSAP devuelve OK
	
	removeWithQueryType( queryMongo, 
						app.sensor.ontologia, 
						"SQLLIKE",
						function(mensajeSSAP){
					          if(mensajeSSAP != null && mensajeSSAP.body.data != null && mensajeSSAP.body.ok == true){	
					          	last_element_found = mensajeSSAP.body.data;		          	
								console.log( "DEBUG : 	eliminarObjetosSensor	: borrado correcto " );
								Lungo.Router.section("mainSimulador"); 
					         }else{
					         	console.log( "DEBUG : 	eliminarObjetosSensor	: Error conectando al SIB, algo fallo ");
					         	console.log( "DEBUG : 	eliminarObjetosSensor	: devuelto del SIB un paquete con datos: " + JSON.stringify(mensajeSSAP));
					        }
					    });						    
					    	
	
	console.log( "DEBUG : 	SOFIA-2 eliminarObjetosSensor termina 	" ); 
};



function lanzaSimulacion()
{
	
	
	if (app.plataformaObjetivo == "sofia")	{
		console.log( "DEBUG : 	Entra en 	: lanzaSimulacion: con SOFIA "   );
		
		setKpName(app.luminaria.KP);	
		conectarSIBConToken(app.luminaria.token, app.luminaria.instancia, arrancaSimulacion );
		

	}
	else //fiware
	{
		console.log( "DEBUG :   descubriendo el numero de objetos......espere sentado ;-) " );			
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
							                url: 'http://' + app.ipFIware + '/NGSI10/queryContext', 
							                type: 'POST',
							                beforeSend: function(xhr) {
							                    xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
							                    xhr.setRequestHeader("Accept","application/json;");
							                },
							                data:   JSON.stringify(postJSON),
							                async: false,  
											cache: false 
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
		                url: 'http://' + app.ipFIware + '/NGSI10/updateContext',
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

		setKpName(app.luminaria.KP);	
		conectarSIBConToken(app.luminaria.token, app.luminaria.instancia, arrancaGeneraObjetos );
		
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
		
			res_lat = parseInt(Math.floor(Math.random() * (max_lat - min_lat + 1)) + min_lat);
			res_lon = parseInt(Math.floor(Math.random() * (max_lon - min_lon + 1)) + min_lon);

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
															            "value": "40." + res_lat + ","+ "-3." + res_lon 
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
	                url: 'http://' + app.ipFIware + '/NGSI10/updateContext',
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
		Lungo.Router.section("main_loading"); 
		
	}//END genera objetos FIWARE	
}//END genera objetos 

var generaCallesLuminarias = function (){
	
	var numeroObjetosEnJSON = postJSONgenera_Calles_FI_WARE["contextElements"].length;
	
	for (var j = numeroObjetosEnJSON - 1 ; j >= 0;  j = j - 1) {
	
		var objetoFIWARE = postJSONgenera_Calles_FI_WARE["contextElements"][j];		
					
		if ( objetoFIWARE.type == "luminaria" ){ 
	      	         
	      	var queryMongo = {
						      "luminaria" :{											
												"id" : objetoFIWARE.id,
												"nivelIntensidad"	: objetoFIWARE.attributes[0].value ,
												"posicion": {	
															"type":"Point",
															"coordinates":	[	objetoFIWARE.attributes[1].value.split(",")[0]  , 
																				objetoFIWARE.attributes[1].value.split(",")[1]
																			],
															},
												"FK_idCuadro": objetoFIWARE.attributes[2].value
											}
							    };
							    
		    var queryMongo2insert = JSON.stringify(queryMongo);		
			insert(	queryMongo2insert , 
					app.luminaria.ontologia, 
					function(mensajeSSAP){						
					        if(mensajeSSAP != null && mensajeSSAP.body.data != null && mensajeSSAP.body.ok == true){
								console.log( "DEBUG : 	generaCallesLuminarias	: correctamente enviado al SIB  " );
					         }else{
					         	console.log( "DEBUG : 	generaCallesLuminarias	: Error conectando al SIB, algo fallo ");
					        }
			        	}	
		        	);  
	      
	    }//END if				
	}//END for 	    
		    
	console.log( "DEBUG : 	generaCallesLuminarias  termina	" );

};

var generaCallesCuadro = function (){
	
	var numeroObjetosEnJSON = postJSONgenera_Calles_FI_WARE["contextElements"].length;
	
	for (var j = numeroObjetosEnJSON - 1 ; j >= 0;  j = j - 1) {
	
		var objetoFIWARE = postJSONgenera_Calles_FI_WARE["contextElements"][j];		
					
		if ( objetoFIWARE.type == "cuadro" ){ 
     
	      	var queryMongo = {
						      "cuadro" :{											
												"id" : objetoFIWARE.id,
												"posicion": {	
															"type":"Point",
															"coordinates":	[	parseFloat(objetoFIWARE.attributes[0].value.split(",")[0])  , 
																				parseFloat(objetoFIWARE.attributes[0].value.split(",")[1])
																			]
															}
											}
							    };
							    
		    var queryMongo2insert = JSON.stringify(queryMongo);	 		    
		    	
			insert(	queryMongo2insert , 
					app.cuadro.ontologia, 
					function(mensajeSSAP){						
					        if(mensajeSSAP != null && mensajeSSAP.body.data != null && mensajeSSAP.body.ok == true){
								console.log( "DEBUG : 	generaCallesCuadro	: correctamente enviado al SIB  " );
					         }else{
					         	console.log( "DEBUG : 	generaCallesCuadro	: Error conectando al SIB, algo fallo " + JSON.stringify(mensajeSSAP.body) );
					         	
					        }
			        	}	
		        	);  
	      
	    }//END if				
	}//END for 	    
		    
	console.log( "DEBUG : 	generaCallesCuadro  termina	" );
};


var generaCallesSensor = function (){
	
	var numeroObjetosEnJSON = postJSONgenera_Calles_FI_WARE["contextElements"].length;
	
	for (var j = numeroObjetosEnJSON - 1 ; j >= 0;  j = j - 1) {
	
		var objetoFIWARE = postJSONgenera_Calles_FI_WARE["contextElements"][j];		
					
		if ( objetoFIWARE.type == "sensor" ){ 
     
	      	var queryMongo = {
						      "sensor" :{											
												"id" : objetoFIWARE.id,
												"tipo"	: objetoFIWARE.attributes[0].name ,
												"unidad": objetoFIWARE.attributes[0].type ,
												"valor": parseInt(objetoFIWARE.attributes[0].value) ,
												"versionProtocolo" : objetoFIWARE.attributes[1].value,
												"posicion": {	
															"type":"Point",
															"coordinates":	[	parseFloat(objetoFIWARE.attributes[2].value.split(",")[0])  , 
																				parseFloat(objetoFIWARE.attributes[2].value.split(",")[1])
																			]
															}
											}
							    };
							    
		    var queryMongo2insert = JSON.stringify(queryMongo);	 		    
		    	
			insert(	queryMongo2insert , 
					app.sensor.ontologia, 
					function(mensajeSSAP){						
					        if(mensajeSSAP != null && mensajeSSAP.body.data != null && mensajeSSAP.body.ok == true){
								console.log( "DEBUG : 	generaCallesSensor	: correctamente enviado al SIB  " );
					         }else{
					         	console.log( "DEBUG : 	generaCallesSensor	: Error conectando al SIB, algo fallo " + JSON.stringify(mensajeSSAP.body) );
					         	
					        }
			        	}	
		        	);  
	      
	    }//END if				
	}//END for 	    
		    
	console.log( "DEBUG : 	generaCallesSensor  termina	" );
	
};



function genera_Calles() {
	
	if (app.plataformaObjetivo=="sofia"){	
	
		setKpName(app.luminaria.KP);	
		conectarSIBConToken(app.luminaria.token, app.luminaria.instancia, generaCallesLuminarias );
		
		setKpName(app.cuadro.KP);	
		conectarSIBConToken(app.cuadro.token, app.cuadro.instancia, generaCallesCuadro );
		
		setKpName(app.sensor.KP);	
		conectarSIBConToken(app.sensor.token, app.sensor.instancia, generaCallesSensor );		
		
		
		 setTimeout(function() {	
             Lungo.Router.section("mainSimulador");
		 	 console.log( "DEBUG :   genera_Calles con sofia." );
         }, 7000);
        
        // WTF!! más ineficiente no puede ser!!, cambiar por -> iterar el array una sola vez y 
        // generar una promesa o callback para lanzar la vuelta a la pantalla principal				
	}
	else //fiware
	{
		console.log( "DEBUG : empieza a generar las calles y sus sensores"   );
		
		var contentTypeRequest = $.ajax({
	                url: 'http://' + app.ipFIware + '/NGSI10/updateContext',
	                type: 'POST',
	                beforeSend: function(xhr) {
	                    xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
	                    xhr.setRequestHeader("Accept","application/json;");
	                },
	                data:   JSON.stringify(postJSONgenera_Calles_FI_WARE),
	                async: false, // sincrona
					cache: false // No  usar cache 
			});
		
		contentTypeRequest.done(function(result){     		
			console.log( "DEBUG :   termina de generar las calles y sus sensores " );	
			Lungo.Router.section("mainSimulador");		
		});	
	    contentTypeRequest.fail(function(jqXHR, textStatus, errorString){     
				console.log( "DEBUG :   Ajax request failed... (" + textStatus + ' - ' + jqXHR.responseText +  errorString + ")." );
		});		
			
	}
}


function Eliminar_Todo(){
	if (app.plataformaObjetivo=="sofia"){		
		setKpName(app.luminaria.KP);	
		conectarSIBConToken(app.luminaria.token, app.luminaria.instancia, eliminarObjetos );
		
		setKpName(app.cuadro.KP);	
		conectarSIBConToken(app.cuadro.token, app.cuadro.instancia, eliminarObjetosCuadro );
		
		setKpName(app.sensor.KP);	
		conectarSIBConToken(app.sensor.token, app.sensor.instancia, eliminarObjetosSensor );	
		
		console.log( "DEBUG :   Eliminar_Todo con sofia." );		
	}
	else //fiware
	{
		console.log( "DEBUG :   Eliminar_Todo con fiware." );
		
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
		console.log( "DEBUG :   descubriendo el numero de objetos......espere sentado ;-) " );					
		 while (No_context_element_found == false){ 
	   		var contentTypeRequest = $.ajax({
							                url: 'http://' + app.ipFIware + '/NGSI10/queryContext', 
							                type: 'POST',
							                beforeSend: function(xhr) {
							                    xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
							                    xhr.setRequestHeader("Accept","application/json;");
							                },
							                data:   JSON.stringify(postJSON),
							                async: false, 
											cache: false 
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
		
		for (var i = last_element_found ; i >= 0 ; i--) {
			fiwareDataAdapter.deleteEntity("luminaria",i);		
		}
		console.log( "DEBUG :  termino de borrar objetos"  );
		Lungo.Router.section("mainSimulador");
			
	}	
}