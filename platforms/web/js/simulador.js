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
		
		
		 setTimeout(function() {	Lungo.Router.section("mainSimulador");
		 							console.log( "DEBUG :   genera_Calles con sofia." );
		 						}, 7000);
				
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
//TODO
var postJSONgenera_Calles_FI_WARE =
{
"contextElements" : [
{
    "attributes": [
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
            "value": "40.437009,-3.721892"
        }
    ], 
    "id": "1", 
    "isPattern": "false", 
    "type": "cuadro"
},{
    "attributes": [
        {
            "name": "consumo", 
            "type": "vatios", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.437009,-3.721892"
        }
    ], 
    "id": "0", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.437009,-3.721892"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "1"
        }
    ], 
    "id": "0", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.437009,-3.721892"
        }
    ], 
    "id": "1", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.437009,-3.721892"
        }
    ], 
    "id": "2", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.437212,-3.722289"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "1"
        }
    ], 
    "id": "1", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.437405,-3.722683"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "1"
        }
    ], 
    "id": "2", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.437618,-3.723072"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "1"
        }
    ], 
    "id": "3", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.437838,-3.72345"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "1"
        }
    ], 
    "id": "4", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.438085,-3.72381"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "1"
        }
    ], 
    "id": "5", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.438085,-3.72381"
        }
    ], 
    "id": "3", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.438085,-3.72381"
        }
    ], 
    "id": "4", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.438326,-3.72418"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "1"
        }
    ], 
    "id": "6", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.438575,-3.724507"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "1"
        }
    ], 
    "id": "7", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.438808,-3.72493"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "1"
        }
    ], 
    "id": "8", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.439065,-3.725265"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "1"
        }
    ], 
    "id": "9", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.439318,-3.725602"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "1"
        }
    ], 
    "id": "10", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.439318,-3.725602"
        }
    ], 
    "id": "5", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.439318,-3.725602"
        }
    ], 
    "id": "6", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.439571,-3.725937"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "1"
        }
    ], 
    "id": "11", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.440156,-3.726874"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "1"
        }
    ], 
    "id": "12", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.440365,-3.727261"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "1"
        }
    ], 
    "id": "13", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.440568,-3.727659"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "1"
        }
    ], 
    "id": "14", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.440739,-3.727877"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "1"
        }
    ], 
    "id": "15", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.440739,-3.727877"
        }
    ], 
    "id": "7", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.440739,-3.727877"
        }
    ], 
    "id": "8", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.440946,-3.728217"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "1"
        }
    ], 
    "id": "16", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.441176,-3.728707"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "1"
        }
    ], 
    "id": "17", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.441412,-3.729161"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "1"
        }
    ], 
    "id": "18", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.441654,-3.729575"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "1"
        }
    ], 
    "id": "19", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
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
            "value": "40.441966,-3.729977"
        }
    ], 
    "id": "2", 
    "isPattern": "false", 
    "type": "cuadro"
},{
    "attributes": [
        {
            "name": "consumo", 
            "type": "vatios", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.441966,-3.729977"
        }
    ], 
    "id": "9", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.441966,-3.729977"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "2"
        }
    ], 
    "id": "20", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.441966,-3.729977"
        }
    ], 
    "id": "10", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.441966,-3.729977"
        }
    ], 
    "id": "11", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.442267,-3.730299"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "2"
        }
    ], 
    "id": "21", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.442601,-3.73061"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "2"
        }
    ], 
    "id": "22", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.442937,-3.730893"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "2"
        }
    ], 
    "id": "23", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.443275,-3.731187"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "2"
        }
    ], 
    "id": "24", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.443618,-3.731489"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "2"
        }
    ], 
    "id": "25", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.443618,-3.731489"
        }
    ], 
    "id": "12", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.443618,-3.731489"
        }
    ], 
    "id": "13", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.444006,-3.731807"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "2"
        }
    ], 
    "id": "26", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.444592,-3.732331"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "2"
        }
    ], 
    "id": "27", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.444891,-3.732567"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "2"
        }
    ], 
    "id": "28", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.445161,-3.732818"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "2"
        }
    ], 
    "id": "29", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.445501,-3.733098"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "2"
        }
    ], 
    "id": "30", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.445501,-3.733098"
        }
    ], 
    "id": "14", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.445501,-3.733098"
        }
    ], 
    "id": "15", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.445836,-3.733399"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "2"
        }
    ], 
    "id": "31", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.446128,-3.733663"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "2"
        }
    ], 
    "id": "32", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.446432,-3.733923"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "2"
        }
    ], 
    "id": "33", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.446747,-3.734195"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "2"
        }
    ], 
    "id": "34", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.447062,-3.734459"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "2"
        }
    ], 
    "id": "35", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.447062,-3.734459"
        }
    ], 
    "id": "16", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.447062,-3.734459"
        }
    ], 
    "id": "17", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.44741,-3.734748"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "2"
        }
    ], 
    "id": "36", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.447748,-3.735067"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "2"
        }
    ], 
    "id": "37", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.448053,-3.735337"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "2"
        }
    ], 
    "id": "38", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.448378,-3.735632"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "2"
        }
    ], 
    "id": "39", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
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
            "value": "40.448663,-3.735944"
        }
    ], 
    "id": "3", 
    "isPattern": "false", 
    "type": "cuadro"
},{
    "attributes": [
        {
            "name": "consumo", 
            "type": "vatios", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.448663,-3.735944"
        }
    ], 
    "id": "18", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.448663,-3.735944"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "3"
        }
    ], 
    "id": "40", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.448663,-3.735944"
        }
    ], 
    "id": "19", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.448663,-3.735944"
        }
    ], 
    "id": "20", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.448972,-3.736322"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "3"
        }
    ], 
    "id": "41", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.449232,-3.736729"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "3"
        }
    ], 
    "id": "42", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.449446,-3.737091"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "3"
        }
    ], 
    "id": "43", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.449684,-3.737511"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "3"
        }
    ], 
    "id": "44", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.449888,-3.737867"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "3"
        }
    ], 
    "id": "45", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.449888,-3.737867"
        }
    ], 
    "id": "21", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.449888,-3.737867"
        }
    ], 
    "id": "22", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.450061,-3.738164"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "3"
        }
    ], 
    "id": "46", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.450352,-3.738655"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "3"
        }
    ], 
    "id": "47", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.450619,-3.739032"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "3"
        }
    ], 
    "id": "48", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.450784,-3.739424"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "3"
        }
    ], 
    "id": "49", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.451223,-3.740173"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "3"
        }
    ], 
    "id": "50", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.451223,-3.740173"
        }
    ], 
    "id": "23", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.451223,-3.740173"
        }
    ], 
    "id": "24", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.451662,-3.740887"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "3"
        }
    ], 
    "id": "51", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.451945,-3.741339"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "3"
        }
    ], 
    "id": "52", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.452281,-3.741808"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "3"
        }
    ], 
    "id": "53", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.452724,-3.742362"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "3"
        }
    ], 
    "id": "54", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.453093,-3.742763"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "3"
        }
    ], 
    "id": "55", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.453093,-3.742763"
        }
    ], 
    "id": "25", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.453093,-3.742763"
        }
    ], 
    "id": "26", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.453391,-3.743089"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "3"
        }
    ], 
    "id": "56", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.45425,-3.743926"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "3"
        }
    ], 
    "id": "57", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.454546,-3.744205"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "3"
        }
    ], 
    "id": "58", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.454808,-3.744419"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "3"
        }
    ], 
    "id": "59", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
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
            "value": "40.455359,-3.744524"
        }
    ], 
    "id": "4", 
    "isPattern": "false", 
    "type": "cuadro"
},{
    "attributes": [
        {
            "name": "consumo", 
            "type": "vatios", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.455359,-3.744524"
        }
    ], 
    "id": "27", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.455359,-3.744524"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "4"
        }
    ], 
    "id": "60", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.455359,-3.744524"
        }
    ], 
    "id": "28", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.455359,-3.744524"
        }
    ], 
    "id": "29", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.455794,-3.745113"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "4"
        }
    ], 
    "id": "61", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.456405,-3.745564"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "4"
        }
    ], 
    "id": "62", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.456978,-3.745998"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "4"
        }
    ], 
    "id": "63", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.457282,-3.746236"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "4"
        }
    ], 
    "id": "64", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.45756,-3.746472"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "4"
        }
    ], 
    "id": "65", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.45756,-3.746472"
        }
    ], 
    "id": "30", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.45756,-3.746472"
        }
    ], 
    "id": "31", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.457859,-3.746759"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "4"
        }
    ], 
    "id": "66", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.458109,-3.747036"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "4"
        }
    ], 
    "id": "67", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.458363,-3.74735"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "4"
        }
    ], 
    "id": "68", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.458673,-3.747732"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "4"
        }
    ], 
    "id": "69", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.459073,-3.748495"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "4"
        }
    ], 
    "id": "70", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.459073,-3.748495"
        }
    ], 
    "id": "32", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.459073,-3.748495"
        }
    ], 
    "id": "33", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.459313,-3.749102"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "4"
        }
    ], 
    "id": "71", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.459495,-3.749578"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "4"
        }
    ], 
    "id": "72", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.459755,-3.749888"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "4"
        }
    ], 
    "id": "73", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.459854,-3.750478"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "4"
        }
    ], 
    "id": "74", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.459951,-3.751023"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "4"
        }
    ], 
    "id": "75", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.459951,-3.751023"
        }
    ], 
    "id": "34", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.459951,-3.751023"
        }
    ], 
    "id": "35", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.460042,-3.751652"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "4"
        }
    ], 
    "id": "76", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.460123,-3.752324"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "4"
        }
    ], 
    "id": "77", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.460203,-3.752977"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "4"
        }
    ], 
    "id": "78", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.460272,-3.753582"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "4"
        }
    ], 
    "id": "79", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
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
            "value": "40.46037,-3.754218"
        }
    ], 
    "id": "5", 
    "isPattern": "false", 
    "type": "cuadro"
},{
    "attributes": [
        {
            "name": "consumo", 
            "type": "vatios", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.46037,-3.754218"
        }
    ], 
    "id": "36", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.46037,-3.754218"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "5"
        }
    ], 
    "id": "80", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.46037,-3.754218"
        }
    ], 
    "id": "37", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.46037,-3.754218"
        }
    ], 
    "id": "38", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.460448,-3.754864"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "5"
        }
    ], 
    "id": "81", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.460521,-3.755519"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "5"
        }
    ], 
    "id": "82", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.46055,-3.756184"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "5"
        }
    ], 
    "id": "83", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.460609,-3.756817"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "5"
        }
    ], 
    "id": "84", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.460664,-3.757469"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "5"
        }
    ], 
    "id": "85", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.460664,-3.757469"
        }
    ], 
    "id": "39", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.460664,-3.757469"
        }
    ], 
    "id": "40", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.46075,-3.758051"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "5"
        }
    ], 
    "id": "86", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.46084,-3.758681"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "5"
        }
    ], 
    "id": "87", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.460932,-3.759242"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "5"
        }
    ], 
    "id": "88", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.461044,-3.759971"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "5"
        }
    ], 
    "id": "89", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.461128,-3.760626"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "5"
        }
    ], 
    "id": "90", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.461128,-3.760626"
        }
    ], 
    "id": "41", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.461128,-3.760626"
        }
    ], 
    "id": "42", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.461219,-3.76127"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "5"
        }
    ], 
    "id": "91", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.461289,-3.761913"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "5"
        }
    ], 
    "id": "92", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.461381,-3.762565"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "5"
        }
    ], 
    "id": "93", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.46145,-3.763179"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "5"
        }
    ], 
    "id": "94", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.461523,-3.763823"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "5"
        }
    ], 
    "id": "95", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.461523,-3.763823"
        }
    ], 
    "id": "43", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.461523,-3.763823"
        }
    ], 
    "id": "44", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.461591,-3.764467"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "5"
        }
    ], 
    "id": "96", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.46165,-3.765062"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "5"
        }
    ], 
    "id": "97", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.461715,-3.765706"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "5"
        }
    ], 
    "id": "98", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.461864,-3.767017"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "5"
        }
    ], 
    "id": "99", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
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
            "value": "40.461962,-3.767669"
        }
    ], 
    "id": "6", 
    "isPattern": "false", 
    "type": "cuadro"
},{
    "attributes": [
        {
            "name": "consumo", 
            "type": "vatios", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.461962,-3.767669"
        }
    ], 
    "id": "45", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.461962,-3.767669"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "6"
        }
    ], 
    "id": "100", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.461962,-3.767669"
        }
    ], 
    "id": "46", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.461962,-3.767669"
        }
    ], 
    "id": "47", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.462038,-3.768308"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "6"
        }
    ], 
    "id": "101", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.462132,-3.768919"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "6"
        }
    ], 
    "id": "102", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.462205,-3.769533"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "6"
        }
    ], 
    "id": "103", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.462203,-3.77029"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "6"
        }
    ], 
    "id": "104", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.462321,-3.770899"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "6"
        }
    ], 
    "id": "105", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.462321,-3.770899"
        }
    ], 
    "id": "48", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.462321,-3.770899"
        }
    ], 
    "id": "49", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.462389,-3.77154"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "6"
        }
    ], 
    "id": "106", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.462456,-3.772191"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "6"
        }
    ], 
    "id": "107", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.46254,-3.77283"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "6"
        }
    ], 
    "id": "108", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.462597,-3.773449"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "6"
        }
    ], 
    "id": "109", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.462678,-3.774082"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "6"
        }
    ], 
    "id": "110", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.462678,-3.774082"
        }
    ], 
    "id": "50", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.462678,-3.774082"
        }
    ], 
    "id": "51", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.462754,-3.774732"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "6"
        }
    ], 
    "id": "111", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.462827,-3.775378"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "6"
        }
    ], 
    "id": "112", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.462901,-3.77592"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "6"
        }
    ], 
    "id": "113", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.462976,-3.776641"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "6"
        }
    ], 
    "id": "114", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.463061,-3.777372"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "6"
        }
    ], 
    "id": "115", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.463061,-3.777372"
        }
    ], 
    "id": "52", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.463061,-3.777372"
        }
    ], 
    "id": "53", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.463168,-3.777942"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "6"
        }
    ], 
    "id": "116", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.463201,-3.778538"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "6"
        }
    ], 
    "id": "117", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.463257,-3.779082"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "6"
        }
    ], 
    "id": "118", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.463318,-3.779623"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "6"
        }
    ], 
    "id": "119", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
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
            "value": "40.463413,-3.780331"
        }
    ], 
    "id": "7", 
    "isPattern": "false", 
    "type": "cuadro"
},{
    "attributes": [
        {
            "name": "consumo", 
            "type": "vatios", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.463413,-3.780331"
        }
    ], 
    "id": "54", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.463413,-3.780331"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "7"
        }
    ], 
    "id": "120", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.463413,-3.780331"
        }
    ], 
    "id": "55", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.463413,-3.780331"
        }
    ], 
    "id": "56", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.46352,-3.781143"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "7"
        }
    ], 
    "id": "121", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.463596,-3.781783"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "7"
        }
    ], 
    "id": "122", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.463627,-3.782447"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "7"
        }
    ], 
    "id": "123", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.463678,-3.783085"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "7"
        }
    ], 
    "id": "124", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.463796,-3.783723"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "7"
        }
    ], 
    "id": "125", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.463796,-3.783723"
        }
    ], 
    "id": "57", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.463796,-3.783723"
        }
    ], 
    "id": "58", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.463862,-3.784369"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "7"
        }
    ], 
    "id": "126", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.463931,-3.785017"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "7"
        }
    ], 
    "id": "127", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.464075,-3.78628"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "7"
        }
    ], 
    "id": "128", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.46415,-3.786923"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "7"
        }
    ], 
    "id": "129", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.464221,-3.787567"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "7"
        }
    ], 
    "id": "130", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.464221,-3.787567"
        }
    ], 
    "id": "59", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.464221,-3.787567"
        }
    ], 
    "id": "60", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.464296,-3.788216"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "7"
        }
    ], 
    "id": "131", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.464375,-3.788855"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "7"
        }
    ], 
    "id": "132", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.464463,-3.78964"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "7"
        }
    ], 
    "id": "133", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.464523,-3.790143"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "7"
        }
    ], 
    "id": "134", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.464601,-3.790766"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "7"
        }
    ], 
    "id": "135", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.464601,-3.790766"
        }
    ], 
    "id": "61", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.464601,-3.790766"
        }
    ], 
    "id": "62", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.464683,-3.791417"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "7"
        }
    ], 
    "id": "136", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.464725,-3.791723"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "7"
        }
    ], 
    "id": "137", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.464812,-3.792274"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "7"
        }
    ], 
    "id": "138", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.464883,-3.792797"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "7"
        }
    ], 
    "id": "139", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
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
            "value": "40.464947,-3.793454"
        }
    ], 
    "id": "8", 
    "isPattern": "false", 
    "type": "cuadro"
},{
    "attributes": [
        {
            "name": "consumo", 
            "type": "vatios", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.464947,-3.793454"
        }
    ], 
    "id": "63", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.464947,-3.793454"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "8"
        }
    ], 
    "id": "140", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.464947,-3.793454"
        }
    ], 
    "id": "64", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.464947,-3.793454"
        }
    ], 
    "id": "65", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.465027,-3.794198"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "8"
        }
    ], 
    "id": "141", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.465095,-3.794652"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "8"
        }
    ], 
    "id": "142", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.465165,-3.795219"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "8"
        }
    ], 
    "id": "143", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.465285,-3.796113"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "8"
        }
    ], 
    "id": "144", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.465281,-3.796969"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "8"
        }
    ], 
    "id": "145", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.465281,-3.796969"
        }
    ], 
    "id": "66", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.465281,-3.796969"
        }
    ], 
    "id": "67", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.465386,-3.797917"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "8"
        }
    ], 
    "id": "146", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.465459,-3.798505"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "8"
        }
    ], 
    "id": "147", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.465699,-3.799785"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "8"
        }
    ], 
    "id": "148", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.46587,-3.801434"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "8"
        }
    ], 
    "id": "149", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.465917,-3.802006"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "8"
        }
    ], 
    "id": "150", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.465917,-3.802006"
        }
    ], 
    "id": "68", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.465917,-3.802006"
        }
    ], 
    "id": "69", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.465978,-3.802521"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "8"
        }
    ], 
    "id": "151", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.466036,-3.803116"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "8"
        }
    ], 
    "id": "152", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.466091,-3.803642"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "8"
        }
    ], 
    "id": "153", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.46616,-3.804292"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "8"
        }
    ], 
    "id": "154", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.466237,-3.804939"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "8"
        }
    ], 
    "id": "155", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.466237,-3.804939"
        }
    ], 
    "id": "70", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.466237,-3.804939"
        }
    ], 
    "id": "71", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.466288,-3.805585"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "8"
        }
    ], 
    "id": "156", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.466433,-3.806832"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "8"
        }
    ], 
    "id": "157", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.466517,-3.807484"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "8"
        }
    ], 
    "id": "158", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.466598,-3.808125"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "8"
        }
    ], 
    "id": "159", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
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
            "value": "40.46668,-3.808779"
        }
    ], 
    "id": "9", 
    "isPattern": "false", 
    "type": "cuadro"
},{
    "attributes": [
        {
            "name": "consumo", 
            "type": "vatios", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.46668,-3.808779"
        }
    ], 
    "id": "72", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.46668,-3.808779"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "9"
        }
    ], 
    "id": "160", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.46668,-3.808779"
        }
    ], 
    "id": "73", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.46668,-3.808779"
        }
    ], 
    "id": "74", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.466769,-3.809412"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "9"
        }
    ], 
    "id": "161", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.466885,-3.81005"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "9"
        }
    ], 
    "id": "162", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.467343,-3.811826"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "9"
        }
    ], 
    "id": "163", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.467575,-3.812335"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "9"
        }
    ], 
    "id": "164", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.467806,-3.812911"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "9"
        }
    ], 
    "id": "165", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.467806,-3.812911"
        }
    ], 
    "id": "75", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.467806,-3.812911"
        }
    ], 
    "id": "76", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.468072,-3.813463"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "9"
        }
    ], 
    "id": "166", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.468322,-3.814029"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "9"
        }
    ], 
    "id": "167", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.468637,-3.814691"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "9"
        }
    ], 
    "id": "168", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "9"
        }
    ], 
    "id": "169", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.469193,-3.815893"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "9"
        }
    ], 
    "id": "170", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.469193,-3.815893"
        }
    ], 
    "id": "77", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.469193,-3.815893"
        }
    ], 
    "id": "78", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.469441,-3.816457"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "9"
        }
    ], 
    "id": "171", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.469689,-3.817018"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "9"
        }
    ], 
    "id": "172", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.470037,-3.81775"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "9"
        }
    ], 
    "id": "173", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.470333,-3.818391"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "9"
        }
    ], 
    "id": "174", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.470558,-3.818853"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "9"
        }
    ], 
    "id": "175", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.470558,-3.818853"
        }
    ], 
    "id": "79", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.470558,-3.818853"
        }
    ], 
    "id": "80", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.4708,-3.81939"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "9"
        }
    ], 
    "id": "176", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.471042,-3.820006"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "9"
        }
    ], 
    "id": "177", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.471266,-3.820596"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "9"
        }
    ], 
    "id": "178", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.471489,-3.821177"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "9"
        }
    ], 
    "id": "179", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
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
            "value": "40.471716,-3.821792"
        }
    ], 
    "id": "10", 
    "isPattern": "false", 
    "type": "cuadro"
},{
    "attributes": [
        {
            "name": "consumo", 
            "type": "vatios", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.471716,-3.821792"
        }
    ], 
    "id": "81", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.471716,-3.821792"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "10"
        }
    ], 
    "id": "180", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.471716,-3.821792"
        }
    ], 
    "id": "82", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.471716,-3.821792"
        }
    ], 
    "id": "83", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.471921,-3.822353"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "10"
        }
    ], 
    "id": "181", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.47214,-3.822932"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "10"
        }
    ], 
    "id": "182", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.472338,-3.823532"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "10"
        }
    ], 
    "id": "183", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.472554,-3.824128"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "10"
        }
    ], 
    "id": "184", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.472708,-3.824607"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "10"
        }
    ], 
    "id": "185", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.472708,-3.824607"
        }
    ], 
    "id": "84", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.472708,-3.824607"
        }
    ], 
    "id": "85", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.473043,-3.825506"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "10"
        }
    ], 
    "id": "186", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.47317,-3.825883"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "10"
        }
    ], 
    "id": "187", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.473372,-3.826482"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "10"
        }
    ], 
    "id": "188", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.473783,-3.827666"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "10"
        }
    ], 
    "id": "189", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.473972,-3.828274"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "10"
        }
    ], 
    "id": "190", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.473972,-3.828274"
        }
    ], 
    "id": "86", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.473972,-3.828274"
        }
    ], 
    "id": "87", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.474141,-3.828892"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "10"
        }
    ], 
    "id": "191", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.474306,-3.829537"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "10"
        }
    ], 
    "id": "192", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.474432,-3.830127"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "10"
        }
    ], 
    "id": "193", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.474549,-3.830764"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "10"
        }
    ], 
    "id": "194", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.474659,-3.83145"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "10"
        }
    ], 
    "id": "195", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "temperatura", 
            "type": "celcius", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.474659,-3.83145"
        }
    ], 
    "id": "88", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "humedad", 
            "type": "porcentaje", 
            "value": "0"
        }, 
        {
            "name": "protocol", 
            "type": "version", 
            "value": "1.0"
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
            "value": "40.474659,-3.83145"
        }
    ], 
    "id": "89", 
    "isPattern": "false", 
    "type": "sensor"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.47476,-3.832077"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "10"
        }
    ], 
    "id": "196", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.474866,-3.832729"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "10"
        }
    ], 
    "id": "197", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.474962,-3.833361"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "10"
        }
    ], 
    "id": "198", 
    "isPattern": "false", 
    "type": "luminaria"
},{
    "attributes": [
        {
            "name": "nivelIntensidad", 
            "type": "porcentaje", 
            "value": "0"
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
            "value": "40.475067,-3.834"
        }, 
        {
            "name": "FK_idCuadro", 
            "type": "int", 
            "value": "10"
        }
    ], 
    "id": "199", 
    "isPattern": "false", 
    "type": "luminaria"
}
], 
"updateAction": "APPEND"
};
