/*******************************************************************************
 * � Indra Sistemas, S.A.
 * 2013 - 2014  SPAIN
 * 
 * All rights reserved
 ******************************************************************************/
var kp                   = require('../kpMQTT'),
	miKp                 = new kp.KpMQTT(),
    ssapMessageGenerator = require("../SSAPMessageGenerator"),
    wait                 = require("../node_modules/wait.for/waitfor");


//Connect to SIB
miKp.connect('sofia2.com', 1880, 5);

// 5s timeout - enough to stablish physical connection
setTimeout(function() {
	// main Thread
	wait.launchFiber(main);
		
}, 5000);

function main() {
	// JOIN Message generation
	var ssapMessageJOIN = ssapMessageGenerator.generateJoinByTokenMessage('17ded638ca0e4088aa9eb453e747d4a3', 'kpElectricalCabinet:kpElectricalCabinet');	
	
	//Send message to SIB
	var joinResponse = miKp.send(ssapMessageJOIN);	
	
	//Process JOIN message
	var joinBody=miKp.json2Object(joinResponse.body);
	
	if(joinBody.ok){
		var sessionKey = joinResponse.sessionKey;	
		console.log('Session created with SIB with sessionKey: ' + sessionKey);
	
	
	
		// UPDATE message generation
		var ssapMessageUPDATE = ssapMessageGenerator.generateUpdateWithQueryTypeMessage(null, "update SIB_test_sensor set sensor.valor='893' where sensor.id = '3'", 'SIB_test_sensor', 'SQLLIKE', sessionKey);
		var updateResponse = miKp.send(ssapMessageUPDATE);	
		
		var updateBody= JSON.parse(updateResponse.body)
		
		console.log(updateResponse)
		if(updateBody.ok){
			console.log('Executed update query. Updates Ids: '+updateBody.data);
		}else{
			console.log('Error executing update query');
		}
	
	
		// LEAVE Message generation
		var ssapMessageLEAVE=ssapMessageGenerator.generateLeaveMessage(sessionKey);
		
		//Send message to SIB
		var leaveResposne = miKp.send(ssapMessageLEAVE);
		var leaveBody=miKp.json2Object(leaveResposne.body)
		if(leaveBody.ok){
			console.log('Session closed with SIB');
		}else{
			console.log('Error closing session with SIB');
		}
	
	}else{
		console.log("Error creating SSAP session with SIB");
	}
	
	//Disconnect from SIB
	miKp.disconnect();
	
}