//CORS Server
var express    = require('express'),
    cors       = require('cors'),
    corsApp    = express(),
    corsServer = require('http').createServer(corsApp);

var log4js     = require('log4js'),
    logger     = log4js.getLogger();

var contextBroker = require('dev-rest-proxy');


corsApp.disable('x-powered-by');
corsApp.use(cors());
corsApp.use(corsApp.router);

corsApp.all('/NGSI10/*', function(req, res, next){
    contextBroker.proxy(req, res, '127.0.0.1', 1026);
});

corsServer.listen(8080, function(){
  logger.info('CORS proxy on port 8080');
});


//websocket Server notify
var webSocketApp    = express(),
    webSocketServer = require('http').createServer(webSocketApp),
    io              = require('socket.io').listen(webSocketServer, {log:false});

webSocketApp.use(express.json({strict:false}));
webSocketApp.disable('x-powered-by');

webSocketApp.post('/notifyLampUpdate', function (req, res) {
    
    res.send('');
    
    logger.trace(JSON.stringify(req.body));
    
    var updates  = req.body.contextResponses;
    
    for(var i=0, n=updates.length; i<n; i++){
        var electricBoxID = updates[i].contextElement.attributes[1].value;
        io.sockets.in('electricBoxUpdate-all').emit("lampUpdate",updates[i]);  
        io.sockets.in('electricBoxUpdate-'+electricBoxID).emit("lampUpdate",updates[i]);
    }

    //io.sockets.emit('update',req.body);
});

webSocketApp.post('/notifySensorUpdate', function (req, res) {
    
    res.send('');
    
    logger.trace(JSON.stringify(req.body));
    
    var updates  = req.body.contextResponses;
    
    for(var i=0, n=updates.length; i<n; i++){
        var sensorType = updates[i].contextElement.attributes[0].name;
        io.sockets.in('sensorUpdate-all').emit("sensorUpdate",updates[i]);  
        io.sockets.in('sensorUpdate-'+sensorType).emit("sensorUpdate",updates[i]);
    }
});

io.sockets.on('connection', function (socket) {
   
    socket.on('subscribe',  function(roomID) { 
        if(typeof roomID === "string")
           socket.join(roomID); 
    });
   
    socket.on('unsubscribe',function(roomID) { 
       if(typeof roomID === "string")
           socket.leave(roomID); 
    });
});

webSocketServer.listen(8090, function(){
  logger.info('Socket server on port 8090');
});