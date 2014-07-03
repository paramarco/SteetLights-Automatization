"use strict";

var kp                   = require('../kpMQTT'),
	myKP                 = new kp.KpMQTT(),
    ssapMessageGenerator = require("../SSAPMessageGenerator"),
    wait                 = require("../node_modules/wait.for/waitfor");

var onLampUpdateCallback = undefined;
var sessionKey;


function indicationMessage(data){
    var updatedData = JSON.parse(JSON.parse(data.body).data)[0].luminaria;
    onLampUpdateCallback({
        id                  : parseInt(updatedData.id),
        luminosityLevel     : parseInt(updatedData.nivelIntensidad),
        electricalCabinetID : parseInt(updatedData.FK_idCuadro)
    });
}

/**
 * @param {String} config configuration params 
 * @param {function} onConnectCallback  
 */
function connect(config, onConnectCallback){
   
    //Connect to SIB
    myKP.connect(config.host, config.port, 5,function(){
		wait.launchFiber(function(){
            
			// JOIN Message generation
			var ssapMessageJOIN = ssapMessageGenerator.generateJoinByTokenMessage(config.token,config.KP);	

			//Send message to SIB
			var joinResponse = myKP.send(ssapMessageJOIN);	

			//Process JOIN message
			var joinBody = myKP.json2Object(joinResponse.body);

			if(!joinBody.ok)
				throw new Error('Error creating SSAP session with SIB');

            sessionKey = joinResponse.sessionKey;	

			// SUBSCRIBE message generation
            var SIB            = config.lampSubscriptionConfig.SIB.trim();     
            var subscribeTo    = config.lampSubscriptionConfig.subscribeTo.trim();
            var queryCondition = (subscribeTo === "all" ? "" : " where luminaria.FK_idCuadro= '"+subscribeTo+"'");


			var ssapMessageSUBSCRIBE = ssapMessageGenerator.generateSubscribeWithQueryTypeMessage("select * from "+SIB+queryCondition,SIB, 'SQLLIKE',0, sessionKey);
			var subscribeResponse    = myKP.send(ssapMessageSUBSCRIBE, indicationMessage);	
			var subscribeBody        = JSON.parse(subscribeResponse.body);
			
            if(!subscribeBody.ok)
				throw new Error('Error subscribing to SIB');			
		
		});
		
        if(typeof onConnectCallback === 'function')
            onConnectCallback();
    });
};
   
/**
 * @param {Function} callback
 */
function onLampUpdate(callback){
    onLampUpdateCallback = callback;
};

exports.connect      = connect;
exports.onLampUpdate = onLampUpdate;