"use strict";
var infoWindowLampTemplate = (function () {
     
        function fillTemplate(data){
                return "<div id='lamp-"+data.id+"' class='bubble'>\
                                <h1 class='title'>Id: "+data.id+"</h1>\
                                <div class='info'>\
                                    <p><span>Coordenadas: </span><span class='nTotal'>"+data.position+"</span></p>\
                                    <p><span>Cuadro asociado: </span><span>"+data.electricalCabinetID+"</span></p>\
                                    <p class='luminosityLevel'><span>Nivel de iluminación (%): </span></p>\
                                    <form oninput='amount.value=rangeInput.value'>\
                                            <input id ='range-"+data.id+"' class='luminosityRange' type='range' name='rangeInput' min='0' max='100' step='10' value='"+data.luminosityLevel+"'>\
                                            <output class='luminosityValue' name='amount' for='rangeInput'>"+data.luminosityLevel+"</output><span></span>\
                                    </form>\
                                </div>\
                            <div class='clear'></div>\
                        </div>";
        }

        function addListenerToLuminosityRange(id,callback){
            document.getElementById("range-"+id).onchange = callback;
        }

        return {
            fillTemplate                 : fillTemplate,
            addListenerToLuminosityRange : addListenerToLuminosityRange
        };
 
    })();

    var infoWindowSensorTemplate = (function () {
     
        function fillTemplate(data){
                return "<div id='lamp-"+data.id+"' class='bubble'>\
                                <h1 class='title'>Id: "+data.id+"</h1>\
                                <div class='info'>\
                                    <p><span>Sensor de tipo: </span><span>"+data.type+"</span></p>\
                                    <p><span>Coordenadas: </span><span class='nTotal'>"+data.position+"</span></p>\
                                    <p><span>Unidad de medida: </span><span>"+data.unit+"</span></p>\
                                    <p><span>Valor: </span><span>"+data.value+"</span></p>\
                            </div>\
                            <div class='clear'></div>\
                        </div>";
        }

        return {
            fillTemplate : fillTemplate
        };
 
    })();