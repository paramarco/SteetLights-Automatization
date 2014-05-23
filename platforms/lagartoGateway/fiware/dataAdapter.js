"use strict";
var requestify = require('requestify');
var dataAdapterHost;

function setHost(host){
    dataAdapterHost = host;
}

function updateData(type,id,value,callback){
    
    var url = 'http://'+dataAdapterHost+'/NGSI10/updateContext';
    var data = {
        "contextElements":[
            {"type":"sensor", "id" : id, "attributes":[{"name" : type, "value" : value}]}
        ],
        "updateAction":"UPDATE"
    };
    console.log(JSON.stringify(data));

    return requestify.request(url,{
        method : 'POST',
        body   : data,  
        headers: {
           'Content-type' : 'application/json; charset=utf-8',
           'Accept'       : 'application/json;'
        }
    }).then(function(response) {
        if(typeof callback === "function")
            callback(response);
    });
}

function updateLuminosity(id,luminosityLevel,callback) {
    updateData(id,"nivelIntensidad",luminosityLevel,callback);
}

function updateSensor(type,id,value,callback) {
    updateData(type,id,value,callback);
}

exports.setHost          = setHost;
exports.updateSensor     = updateSensor;
exports.updateLuminosity = updateLuminosity;