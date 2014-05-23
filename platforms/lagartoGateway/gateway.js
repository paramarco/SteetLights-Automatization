var log4js     = require('log4js'),
    logger     = log4js.getLogger(),
    requestify = require('requestify');

//config
var config   = require("./config");
var platform = config.platform;



//notifier 
var notifierConfig  = platform.config.notifier,
    notifierAdapter = require("./fiware/notifier");

notifierAdapter.connect(notifierConfig.host,notifierConfig.subscription,function(){
    logger.info("Notifier connection ok");
});

notifierAdapter.onLampUpdate(function(data){
    logger.debug("lampUpdate\n"+JSON.stringify(data));
    
    var luminosityLevel = Math.round(data.luminosityLevel*255/100);
    var pwmMoteID       = config.outputs.luminaria["id_"+data.id];

    if (typeof pwmMoteID  !== "undefined"){
        requestify.get("http://localhost:8001/values/?id="+pwmMoteID+"&value="+luminosityLevel).then(function(response) {
            logger.debug("Response from lagarto swap server:\n" +JSON.stringify(response.getBody()));
        });
    }
});

//dataAdapter
var dataConfig  = platform.config.data,
    dataAdapter = require("./fiware/dataAdapter");

dataAdapter.setHost(dataConfig.host);

//lagarto swap server 0MQ subscriber
/*
mote message -> {"lagarto": {"status": [{"direction": "out", "name": "PWM_output_0", "timestamp": "1 May 2014 0:0:00", "value": "0", "location": "SWAP", "type": "num", "id": "1.11.0"}], "procname": "Lagarto-SWAP", "httpserver": "192.168.1.2:8001"}}

heartbeat -> {"lagarto": {"procname": "Lagarto-SWAP", "httpserver": "192.168.1.2:8001"}}
*/

var zmq  = require('zmq'),
    sock = zmq.socket('sub');

sock.connect('tcp://127.0.0.1:5001');
sock.subscribe('');
sock.on('message', function(msg){
    
    logger.debug("Message from lagarto swap server:\n", msg.toString());

    var info = JSON.parse(msg.toString());

    if(typeof info.lagarto.status !== "undefined"){
        var status = info.lagarto.status;
        for(var i=0,n=status.length; i<n; i++){
            var data  = status[i];
            var input = config.inputs[data.id];

            if(data.direction === "inp" && typeof input !== "undefined"){    
                dataAdapter.updateSensor(input.family,input.cloudID,data.value,function(response) {
                    logger.debug("Response from cloud:\n" + JSON.stringify(response.body));
                });
            }
        }
    }
});