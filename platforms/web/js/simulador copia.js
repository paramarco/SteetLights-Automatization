
  



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
	var last_element_found = 0;	
	
	var periodoCiclo = document.getElementById('periodo_en_segundos').value * 1000;	
	
	
	
	var queryUpdate = "{update " + app.luminaria.ontologia + " set luminaria.nivelIntensidad = 100 where luminaria.id = '1'}";
	var dataUpdate = "{}";

								 
	
	    
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
