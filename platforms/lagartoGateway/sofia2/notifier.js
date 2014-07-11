"use strict";

var kp                   = require('./kpMQTT'),
    ssapMessageGenerator = require("./SSAPMessageGenerator");

var myKP                 = new kp.KpMQTT();
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
    myKP.connect(config.host, config.port, 5, function(){
	   
        // JOIN Message generation
        var ssapMessageJOIN = ssapMessageGenerator.generateJoinByTokenMessage(config.token,config.KP);	

        //Send message to SIB
        myKP.send(ssapMessageJOIN).then(function(joinResponse){
		
            var joinBody   = JSON.parse(joinResponse.body);
            
            if(!joinBody.ok) throw new Error('Error creating SSAP session with SIB');
            
            var sessionKey = joinResponse.sessionKey;
            myKP.onNotificationMessage(indicationMessage);
            
            // SUBSCRIBE message generation
            var SIB                  = config.lampSubscriptionConfig.SIB.trim();
            var subscribeTo          = config.lampSubscriptionConfig.subscribeTo.trim();
            var queryCondition       = (subscribeTo === "all" ? "" : " where luminaria.FK_idCuadro = " + subscribeTo + "");
            
            var ssapMessageSUBSCRIBE = ssapMessageGenerator.generateSubscribeWithQueryTypeMessage(
                "select * from " + SIB + queryCondition,SIB, 'SQLLIKE',0, sessionKey
            );

            return myKP.send(ssapMessageSUBSCRIBE);		

        }).fail(function(error) {
            throw new Error('Error subscribing to SIB');
        }).done(function(subscribeResponse){
            
            var subscribeBody = JSON.parse(subscribeResponse.body);
			
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