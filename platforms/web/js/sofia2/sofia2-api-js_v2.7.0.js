// Use and IIFE according to the pattern described in:
// http://appendto.com/2010/10/how-good-c-habits-can-encourage-bad-javascript-habits-part-1/

(function(sofia2) {
	var sessionKey = null;
	var sibServer = pathToDwrServlet + '/';

	sofia2.cipherKey = null;
	sofia2.kpName = null;
	
	// JOIN Operation
	sofia2.join = function(user, pass, instance, joinResponse) {
		var queryJoin = '{"body":{"instance":"'
				+ instance
				+ '","password":"'
				+ pass
				+ '","user":"'
				+ user
				+ '"},"direction":"REQUEST","messageType":"JOIN","sessionKey":null}';
		sendMessage("JOIN", queryJoin, false, joinResponse);
	};
	
	
	// JOIN Operationto renovate session key
	sofia2.joinRenovateSessionKey = function(user, pass, instance, joinResponse) {
		var queryJoin = '{"body":{"instance":"'
				+ instance
				+ '","password":"'
				+ pass
				+ '","user":"'
				+ user
				+ '"},"direction":"REQUEST","messageType":"JOIN","sessionKey":"' + sessionKey + '"}';
		sendMessage("JOIN", queryJoin, false, joinResponse);
	};
	
	
	
	// JOIN Operation to renovate session key
	sofia2.joinCipher = function(user, pass, instance, joinResponse) {
		var queryJoin = '{"body":{"instance":"'
				+ instance
				+ '","password":"'
				+ pass
				+ '","user":"'
				+ user
				+ '"},"direction":"REQUEST","messageType":"JOIN","sessionKey":null}';
		sendMessage("JOIN", queryJoin, true, joinResponse);
	};
	
	// JOIN Operation to renovate session key
	sofia2.joinRenovateSessionCipher = function(user, pass, instance, joinResponse) {
		var queryJoin = '{"body":{"instance":"'
				+ instance
				+ '","password":"'
				+ pass
				+ '","user":"'
				+ user
				+ '"},"direction":"REQUEST","messageType":"JOIN","sessionKey":"' + sessionKey + '"}';
		sendMessage("JOIN", queryJoin, true, joinResponse);
	};
	
	
	//JOIN By Token
	sofia2.joinToken = function(token, instance, joinResponse) {
		var queryJoin = '{"body":{"instance":"'
			+ instance
			+ '","token":"'
			+ token
			+ '"},"direction":"REQUEST","messageType":"JOIN","sessionKey":null}';
		sendMessage("JOIN", queryJoin, false, joinResponse);
	};
	
	
	//JOIN By Token to renovate session key
	sofia2.joinTokenRenovateSession = function(token, instance, joinResponse) {
		var queryJoin = '{"body":{"instance":"'
			+ instance
			+ '","token":"'
			+ token
			+ '"},"direction":"REQUEST","messageType":"JOIN","sessionKey":"' + sessionKey + '"}';
		sendMessage("JOIN", queryJoin, false, joinResponse);
	};
	
	
	//JOIN By Token Operation
	sofia2.joinTokenCipher = function(token, instance, joinResponse) {
		var queryJoin = '{"body":{"instance":"'
			+ instance
			+ '","token":"'
			+ token
			+ '"},"direction":"REQUEST","messageType":"JOIN","sessionKey":null}';
		sendMessage("JOIN", queryJoin, true, joinResponse);
	
	};
	
	//JOIN By Token Operation to renovate session key
	sofia2.joinTokenRenovateSessionCipher = function(token, instance, joinResponse) {
		var queryJoin = '{"body":{"instance":"'
			+ instance
			+ '","token":"'
			+ token
			+ '"},"direction":"REQUEST","messageType":"JOIN","sessionKey":"' + sessionKey + '"}';
		sendMessage("JOIN", queryJoin, true, joinResponse);
	
	};
	
	// LEAVE Operation
	sofia2.leave = function(leaveResponse) {
		var queryLeave = '{"body":"","direction":"REQUEST","messageType":"LEAVE","sessionKey":"'
				+ sessionKey + '"}';
		sendMessage("LEAVE", queryLeave, false, leaveResponse);
	};
	
	
	// LEAVE Operation
	sofia2.leaveCipher = function(leaveResponse) {
		var queryLeave = '{"body":"","direction":"REQUEST","messageType":"LEAVE","sessionKey":"'
				+ sessionKey + '"}';
		sendMessage("LEAVE", queryLeave, true, leaveResponse);
	};
	
	sofia2.insert = function(data, ontology, insertResponse) {
		data=addQuotesToData(data);
		data = data.replace(/'/g, '"');
		var queryInsert = '{"body":{"data":'
				+ data
				+ ',"query":null},"direction":"REQUEST","messageType":"INSERT","ontology":"'
				+ ontology + '","sessionKey":"' + sessionKey + '"}';
				
		sendMessage("INSERT", queryInsert, false, insertResponse);
	};
	
	
	
	
	
	// INSERT Operation
	sofia2.insertWithQueryType = function(data, ontology, queryType, insertResponse) {
		var queryInsert = '';
		
		if(queryType=="NATIVE"){
			queryInsert = '{"body":{"data":'
					+ data
					+ ',"query":null,"queryType":"'+queryType+'"},"direction":"REQUEST","messageType":"INSERT","ontology":"'
					+ ontology + '","sessionKey":"' + sessionKey + '"}';
		}else{
			queryInsert = '{"body":{"query":"'
						+ data
						+ '","data":null,"queryType":"'+queryType+'"},"direction":"REQUEST","messageType":"INSERT","ontology":"'
						+ ontology + '","sessionKey":"' + sessionKey + '"}';
		}

		sendMessage("INSERT", queryInsert, false, insertResponse);
	};
	
	// INSERT Operation
	sofia2.insertCipher = function(data, ontology, insertResponse) {
		data=addQuotesToData(data);
		data = data.replace(/'/g, '"');
		var queryInsert = '{"body":{"data":'
				+ data
				+ ',"query":null},"direction":"REQUEST","messageType":"INSERT","ontology":"'
				+ ontology + '","sessionKey":"' + sessionKey + '"}';
		sendMessage("INSERT", queryInsert, true, insertResponse);
	};
	
	// INSERT Operation
	sofia2.insertWithQueryTypeCipher = function(data, ontology, queryType, insertResponse) {
		var queryInsert = '';
		
		if(queryType=="NATIVE"){
			queryInsert = '{"body":{"data":'
					+ data
					+ ',"query":null,"queryType":"'+queryType+'"},"direction":"REQUEST","messageType":"INSERT","ontology":"'
					+ ontology + '","sessionKey":"' + sessionKey + '"}';
		}else{
			queryInsert = '{"body":{"query":"'
						+ data
						+ '","data":null,"queryType":"'+queryType+'"},"direction":"REQUEST","messageType":"INSERT","ontology":"'
						+ ontology + '","sessionKey":"' + sessionKey + '"}';
		}
		sendMessage("INSERT", queryInsert, true, insertResponse);
	};
	
	
	//##################################
	// UPDATE Operation
	sofia2.update = function(data, query, ontology, updateResponse) {
		var queryUpdate = '{"body":{"data":"'
				+ data
				+ '","query":"'
				+ query
				+ '"},"direction":"REQUEST","messageType":"UPDATE","ontology":"'
				+ ontology + '","sessionKey":"' + sessionKey + '"}';
		
		sendMessage("UPDATE", queryUpdate, false, updateResponse);
	};
	
	// UPDATE Operation
	sofia2.updateWithQueryType = function(data, query, ontology, queryType, updateResponse) {
		var queryUpdate = '{"body":{"data":"'
				+ data
				+ '","query":"'
				+query
				+'","queryType":"'
				+queryType+
				'"},"direction":"REQUEST","messageType":"UPDATE","ontology":"'
				+ ontology + '","sessionKey":"' + sessionKey + '"}';
		sendMessage("UPDATE", queryUpdate, false, updateResponse);
	};
	
	// UPDATE Operation
	sofia2.updateCipher = function(data, query, ontology, updateResponse) {
		var queryUpdate = '{"body":{"data":"'
				+ data
				+ '","query":"'
				+ query
				+ '"},"direction":"REQUEST","messageType":"UPDATE","ontology":"'
				+ ontology + '","sessionKey":"' + sessionKey + '"}';
				
		sendMessage("UPDATE", queryUpdate, true, updateResponse);
	};
	
	// UPDATE Operation
	sofia2.updateWithQueryTypeCipher = function(data, query, ontology, queryType, updateResponse) {
		var queryUpdate = '{"body":{"data":"'
				+ data
				+ '","query":"'
				+query
				+'","queryType":"'
				+queryType+
				'"},"direction":"REQUEST","messageType":"UPDATE","ontology":"'
				+ ontology + '","sessionKey":"' + sessionKey + '"}';
				
		sendMessage("UPDATE", queryUpdate, true, updateResponse);
	};
	
	//REMOVE Operation
	sofia2.remove = function(query, ontology, removeResponse) {
		var queryRemove = '{"body":{"data":null,"query":"'
				+ query
				+ '"},"direction":"REQUEST","messageType":"DELETE","ontology":"'
				+ ontology + '","sessionKey":"' + sessionKey + '"}';
		sendMessage("DELETE", queryRemove, false, removeResponse);
	};
	
	//REMOVE Operation
	sofia2.removeWithQueryType = function(query, ontology, queryType, removeResponse) {
		var queryRemove = '{"body":{"data":null,"query":"'
				+query
				+'","queryType":"'
				+queryType+
				'"},"direction":"REQUEST","messageType":"DELETE","ontology":"'
				+ ontology + '","sessionKey":"' + sessionKey + '"}';
		sendMessage("DELETE", queryRemove, false, removeResponse);
	};
	
	//REMOVE Operation
	sofia2.removeCipher = function(query, ontology, removeResponse) {
		var queryRemove = '{"body":{"data":null,"query":"'
				+ query
				+ '"},"direction":"REQUEST","messageType":"DELETE","ontology":"'
				+ ontology + '","sessionKey":"' + sessionKey + '"}';
		sendMessage("DELETE", queryRemove, false, removeResponse);
	};
	
	//REMOVE Operation
	sofia2.removeWithQueryTypeCipher = function(query, ontology, queryType, removeResponse) {
		var queryRemove = '{"body":{"data":null,"query":"'
				+query
				+'","queryType":"'
				+queryType+
				'"},"direction":"REQUEST","messageType":"DELETE","ontology":"'
				+ ontology + '","sessionKey":"' + sessionKey + '"}';
		sendMessage("DELETE", queryRemove, false, removeResponse);
	};
	//##################################
	
	
	
	// QUERY Operation
	sofia2.query = function(query, ontology, queryResponse) {
		var querySib = '{"body":{"query":"' + query
				+ '"},"direction":"REQUEST","ontology":"' + ontology
				+ '","messageType":"QUERY","sessionKey":"'
				+ sessionKey + '"}';
		sendMessage("QUERY", querySib, false, queryResponse);
	};
	
	
	// QUERY with queryType Operation
	sofia2.queryWithQueryType = function(query, ontology, queryType, queryParams, queryResponse) {
		var querySib='';
		if(queryParams==null){
			var querySib = '{"body":{"query":"' 
				+ query
				+ '","queryType":"'
				+ queryType+'","queryParams": null},"direction":"REQUEST","ontology":"' 
				+ ontology
				+ '","messageType":"QUERY","sessionKey":"'
				+ sessionKey + '"}';
			
		
		}else{
			var querySib = '{"body":{"query":"' 
				+ query
				+ '","queryType":"'
				+ queryType+'","queryParams":'
				+ JSON.stringify(queryParams)+'},"direction":"REQUEST","ontology":"' 
				+ ontology
				+ '","messageType":"QUERY","sessionKey":"'
				+ sessionKey + '"}';
		}
	
		sendMessage("QUERY", querySib, false, queryResponse);
		
	};
	
	
	
	
	// QUERY Operation
	sofia2.queryCipher = function(query, ontology, queryResponse) {
		var querySib = '{"body":{"query":"' + query
				+ '"},"direction":"REQUEST","ontology":"' + ontology
				+ '","messageType":"QUERY","sessionKey":"'
				+ sessionKey + '"}';
				
		sendMessage("QUERY", querySib, true, queryResponse);
	};
	
	// QUERY Operation
	sofia2.queryWithQueryTypeCipher = function(query, ontology, queryType, queryParams, queryResponse) {
		var querySib='';
		if(queryParams==null){
			var querySib = '{"body":{"query":"' 
				+ query
				+ '","queryType":"'
				+ queryType+'","queryParams": null},"direction":"REQUEST","ontology":"' 
				+ ontology
				+ '","messageType":"QUERY","sessionKey":"'
				+ sessionKey + '"}';
			
		
		}else{
			var querySib = '{"body":{"query":"' 
				+ query
				+ '","queryType":"'
				+ queryType+'","queryParams":'
				+ JSON.stringify(queryParams)+'},"direction":"REQUEST","ontology":"' 
				+ ontology
				+ '","messageType":"QUERY","sessionKey":"'
				+ sessionKey + '"}';
		}
		sendMessage("QUERY", querySib, true, queryResponse);
	};
	
	// Private function
	function subscribeInternal(query, cipher, subscribeResponse) {
		sendMessage("SUBSCRIBE", query, cipher, function(ssapMessage) {
			if (ssapMessage.body.ok) {
				subscribeResponse(ssapMessage.body.data);
			} else {
				subscribeResponse(null);
			}
		});
	}
	
	// SUBSCRIBE Operation
	sofia2.subscribe = function(subscription, ontology, refresh, subscribeResponse) {
	
		var queryMongo = subscription;
		var querySubscribe = '{"body":{"query":"' + queryMongo
				+ '","msRefresh":"' + refresh
				+ '"},"direction":"REQUEST","ontology":"' + ontology
				+ '","messageType":"SUBSCRIBE","sessionKey":"'
				+ sessionKey + '"}';
	
		subscribeInternal(querySubscribe, false, subscribeResponse);
	};
	
	// SUBSCRIBE Operation
	sofia2.subscribeWithQueryType = function(subscription, ontology, queryType, refresh, subscribeResponse) {
	
		var queryMongo = subscription;
		var querySubscribe = '{"body":{"query":"' + queryMongo
				+ '","msRefresh":"' + refresh
				+ '","queryType":"'+queryType+'"},"direction":"REQUEST","ontology":"' + ontology
				+ '","messageType":"SUBSCRIBE","sessionKey":"'
				+ sessionKey + '"}';
	
		subscribeInternal(querySubscribe, false, subscribeResponse);
	};
	
	
	// SUBSCRIBE Operation
	sofia2.subscribeWithQueryTypeSibDefinedParams = function(subscription, ontology, queryType, queryParams, refresh, subscribeResponse) {
	
		var queryMongo = subscription;
		var querySubscribe="";
		if(queryParams==null){
			querySubscribe = '{"body":{"query":"' + queryMongo
					+ '","msRefresh":"' + refresh
					+ '","queryType":"'+queryType+'"},"direction":"REQUEST","ontology":"' + ontology
					+ '","messageType":"SUBSCRIBE","sessionKey":"'
					+ sessionKey + '"}';
		}else{
			querySubscribe = '{"body":{"query":"' + queryMongo
					+ '","msRefresh":"' + refresh
					+ '","queryType":"'+queryType+'","queryParams":'
					+ JSON.stringify(queryParams)+'},"direction":"REQUEST","ontology":"' + ontology
					+ '","messageType":"SUBSCRIBE","sessionKey":"'
					+ sessionKey + '"}';
		}
	
		subscribeInternal(querySubscribe, false, subscribeResponse);
	};
	
	
	// SUBSCRIBE Operation
	sofia2.subscribeCipher = function(subscription, ontology, refresh, subscribeResponse) {
	
		var queryMongo = subscription;
		var querySubscribe = '{"body":{"query":"' + queryMongo
				+ '","msRefresh":"' + refresh
				+ '"},"direction":"REQUEST","ontology":"' + ontology
				+ '","messageType":"SUBSCRIBE","sessionKey":"'
				+ sessionKey + '"}';
	
		subscribeInternal(querySubscribe, true, subscribeResponse);
	};
	
	
	// SUBSCRIBE Operation
	sofia2.subscribeWithQueryTypeSibDefinedParamsCipher = function(subscription, ontology, queryType, queryParams, refresh, subscribeResponse) {
	
		var queryMongo = subscription;
		var querySubscribe="";
		if(queryParams==null){
			querySubscribe = '{"body":{"query":"' + queryMongo
					+ '","msRefresh":"' + refresh
					+ '","queryType":"'+queryType+'"},"direction":"REQUEST","ontology":"' + ontology
					+ '","messageType":"SUBSCRIBE","sessionKey":"'
					+ sessionKey + '"}';
		}else{
			querySubscribe = '{"body":{"query":"' + queryMongo
					+ '","msRefresh":"' + refresh
					+ '","queryType":"'+queryType+'","queryParams":'
					+ JSON.stringify(queryParams)+'},"direction":"REQUEST","ontology":"' + ontology
					+ '","messageType":"SUBSCRIBE","sessionKey":"'
					+ sessionKey + '"}';
		}
	
		subscribeInternal(querySubscribe, true, subscribeResponse);
	};
	
	// SUBSCRIBE Operation
	sofia2.subscribeWithQueryTypeCipher = function(subscription, ontology, queryType, refresh, subscribeResponse) {
	
		var queryMongo = subscription;
		var querySubscribe = '{"body":{"query":"' + queryMongo
				+ '","msRefresh":"' + refresh
				+ '","queryType":"'+queryType+'"},"direction":"REQUEST","ontology":"' + ontology
				+ '","messageType":"SUBSCRIBE","sessionKey":"'
				+ sessionKey + '"}';
	
		subscribeInternal(querySubscribe, true, subscribeResponse);
	};
	
	// UNSUBSCRIBE Operation
	sofia2.unsubscribe = function(subscriptionId, unsubscribeResponse, unsubscribeMessages) {
		if (subscriptionId != null) {
			var queryUnsubscribe = '{"body":{"idSuscripcion":"'
					+ subscriptionId
					+ '"},"direction":"REQUEST","messageType":"UNSUBSCRIBE","sessionKey":"'
					+ sessionKey + '"}';
			sendMessage("UNSUBSCRIBE", queryUnsubscribe, false, function(mensajeSSAP) {
				if (mensajeSSAP != null && mensajeSSAP.body.data != null
						&& mensajeSSAP.body.ok == true) {
				}
				unsubscribeResponse(mensajeSSAP);
			});
		}else {
			unsubscribeMessages("ERROR_1");
		}
	};
	
	
	// UNSUBSCRIBE Operation
	sofia2.unsubscribeCipher = function(subscriptionId, unsubscribeResponse, unsubscribeMessages) {
		if (subscriptionId != null) {
			var queryUnsubscribe = '{"body":{"idSuscripcion":"'
					+ subscriptionId
					+ '"},"direction":"REQUEST","messageType":"UNSUBSCRIBE","sessionKey":"'
					+ sessionKey + '"}';
			sendMessage("UNSUBSCRIBE", queryUnsubscribe, true, function(mensajeSSAP) {
				if (mensajeSSAP != null && mensajeSSAP.body.data != null
						&& mensajeSSAP.body.ok == true) {
				}
				unsubscribeResponse(mensajeSSAP);
			});
		}else {
			unsubscribeMessages("ERROR_1");
		}
	};
	
	// #################################################################
	// Auxiliary functions
	// #################################################################
	
	
	
	
	
	// Sends a SSAP Message of any type
	function sendMessage(tipoQuery, query, cipherMessage, responseCallback) {
	
		var mensajeSSAP = null;
		GatewayDWR._path = sibServer; // Avoid having GatewayDWR.js in local
		
		
		if(cipherMessage){
			if(tipoQuery=="JOIN"){
				query=kpName.length+"#"+kpName+ Base64.encode(XXTEA.encrypt(query, cipherKey), false);
				
			}else{
				query=Base64.encode(XXTEA.encrypt(query, cipherKey));
			}
		
		}
		
		GatewayDWR.process(query, function(data) {
		
			if(cipherMessage){
				data=XXTEA.decrypt(Base64.decode(data), cipherKey);
			}
			
			if(tipoQuery=="INSERT" || tipoQuery=="UPDATE" || tipoQuery=="DELETE"){
				mensajeSSAP = sofia2.parsearMensajeSSAP(data);
			}else{
				mensajeSSAP = sofia2.parsearMensajeSSAP(sofia2.validarSSAPConDataString(data));
				}
				
			
			// Ok
			if (mensajeSSAP != null && mensajeSSAP.body.data != null
					&& mensajeSSAP.body.ok == true) {
				switch (tipoQuery) {
				case "JOIN":
					sessionKey = mensajeSSAP.sessionKey;
					responseCallback(mensajeSSAP);
					break;
				case "LEAVE":
					sessionKey = null;
					responseCallback(mensajeSSAP);
					break;
				case "INSERT":
					responseCallback(mensajeSSAP);
					break;
				case "QUERY":
					responseCallback(mensajeSSAP);
					break;
				case "SUBSCRIBE":
					responseCallback(mensajeSSAP);
					break;
				default:
					responseCallback(mensajeSSAP);
				}
			}
			// Error
			else {
				responseCallback(mensajeSSAP);
			}
		});
	
	}
	
	
	// Devuelve un mensaje SSAP JSON parseado a un objeto Javascript
	sofia2.parsearMensajeSSAP = function(mensaje) {
		try {
			return JSON.parse(mensaje.replace(/'/g, "\\\""));
		} catch (e) {
			return null;
		}
	};
	
	// Devuelve un string JSON SSAP válido
	sofia2.validarSSAPConDataString = function(datos) {
		return datos.replace(/(body|data)\"\s*:\s*\"({|\[)/g, "$1\":$2").replace(
				/(}|])\"\s*,\s*\"(direction|ontology|message|session|error|ok)/g,
				"$1,\"$2").replace(/\\+\"/g, "\"");
	};
	
	sofia2.validarSSAP = function(datos) {
		
		return datos.replace(/\\+\"/g, "\"").replace(
				/(body|data)\"\s*:\s*\"({|\[)/g, "$1\":$2").replace(
				/(}|])\"\s*,\s*\"(direction|ontology|message|session|error|ok)/g,
				"$1,\"$2");
	};
	
	sofia2.escapeJSONObject = function(datos){
		return datos.replace(/\"/g, "\\\"").replace(/\\\\\"/g, "\\\\\\\"");
	};
	
	function addQuotesToData(data){
		if (data.indexOf("{")!=0)
			data="{"+data+"}";
			
		return data;
	}

} (window.sofia2 = window.sofia2 || {}));
