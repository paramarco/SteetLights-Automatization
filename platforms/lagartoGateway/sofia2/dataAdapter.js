"use strict";

var kp                   = require('./kpMQTT'),
    ssapMessageGenerator = require("./SSAPMessageGenerator");

var myKP       = new kp.KpMQTT(),
    sessionKey = undefined, 
    SIB;


function connect(config, onConnectCallback){

    //Connect to SIB
    myKP.connect(config.host, config.port, 5,function(){
	
        // JOIN Message generation
		var ssapMessageJOIN = ssapMessageGenerator.generateJoinByTokenMessage(config.token,config.KP);	

		//Send message to SIB
		myKP.send(ssapMessageJOIN).done(function(joinResponse){
		
            var joinBody = JSON.parse(joinResponse.body);
            
            if(!joinBody.ok) throw new Error('Error creating SSAP session with SIB');
            
            sessionKey = joinResponse.sessionKey;
            SIB        = config.SIB;
	   });
                
        if(typeof onConnectCallback === 'function')
            onConnectCallback();
    });
};


function updateData(type,id,value,callback){    
    
    var query             = "update " + SIB + " set sensor.valor='" + value + "' where sensor.id = '" + id + "';&$queryType=SQLLIKE";
    var ssapMessageUPDATE = ssapMessageGenerator.generateUpdateWithQueryTypeMessage(null, query, SIB, 'SQLLIKE', sessionKey);
	
    myKP.send(ssapMessageUPDATE).done(function(updateResponse){
        callback(updateResponse);        
    });
}

function updateLuminosity(id,luminosityLevel,callback) {
    updateData(id,"nivelIntensidad",luminosityLevel,callback);
}

function updateSensor(type,id,value,callback) {
    updateData(type,id,value,callback);
}

exports.connect          = connect;
exports.updateSensor     = updateSensor;
exports.updateLuminosity = updateLuminosity;