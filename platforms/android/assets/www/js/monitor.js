$( document ).ready(function() {
   var markers    = new Object(),
        map           = new google.maps.Map(document.getElementById('map-canvas'),{zoom:10, center: new google.maps.LatLng(40.416816,-3.703174)}),
        infowindow = new google.maps.InfoWindow({content:""});

    //var trafficLayer = new google.maps.TrafficLayer();
    //trafficLayer.setMap(map);

    var tabla = {};
    var marks = [];

    function getData(){
        var contentTypeRequest = $.ajax({
           url: 'http://217.127.199.47:8080/NGSI10/contextEntityTypes/luminaria',
           type: 'GET',
           beforeSend: function(xhr) {
               xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
               xhr.setRequestHeader("Accept","application/json;");
           },
           success: processData
        });			
        contentTypeRequest.error(loadError);	
    }

    function processData(data,textStatus,jqXHR){

        var lamps = data.contextResponses;

        for(var i=0,n=lamps.length; i<n; i++) {
            //generateBubble(lamps[i].contextElement);
            
            var data    = lamps[i].contextElement;
            var cuadro = data.attributes[3].value;
           
            if (!(cuadro in tabla)) {
                tabla[cuadro] = {};
                addControl(cuadro);
            }

            tabla[parseInt(cuadro)][parseInt(data.id)]=data;
        }
    }

    function addControl(i){
            var div = document.createElement("div");
            div.className = "controls";
            var text = document.createTextNode(i);
            div.appendChild(text);
            div.onclick = (function(iTmp) {
                return function() {
                    cargarMarcadores(iTmp);
                };
            })(i);
            map.controls[google.maps.ControlPosition.TOP_LEFT].push(div);
    }

    function loadError(jqxhr, textStatus, error ){

    }

    function cargarMarcadores(cuadro) {
        // limpiar los marcadores que haya
     
        for (var i = 0; i < marks.length; i++){
            marks[i].setMap(null);
        }

        marks = [];

        // cargar marcadores nuevos
        var markerBounds = new google.maps.LatLngBounds();
        linea = [];
        var keys = Object.keys(tabla[cuadro]);

        for (var i = 0,n=keys.length; i < n; i++) {
            generateBubble(tabla[cuadro][keys[i]]);
            linea.push(new google.maps.LatLng(tabla[cuadro][keys[i]].attributes[1].value, tabla[cuadro][keys[i]].attributes[2].value));
            markerBounds.extend(new google.maps.LatLng(tabla[cuadro][keys[i]].attributes[1].value, tabla[cuadro][keys[i]].attributes[2].value));
        }
        var polyline = new google.maps.Polyline({
            path: linea,
            //geodesic: true,
            strokeColor: '#2d98bb',
            strokeOpacity: 0.8,
            strokeWeight: 6,
            map: map
        });
        marks.push(polyline);
        map.fitBounds(markerBounds);

        // reflejar la selección
        var controls = document.querySelectorAll(".controls");
        for (var i = 0; i < controls.length; i++) {
            if (controls[i].textContent == cuadro)
                controls[i].className = "controls active";
            else
                controls[i].className = "controls";
        }
    }

    function generateBubble(data){           
          //markers[data.id] = data;
          var marker = new google.maps.Marker({
              position: new google.maps.LatLng(data.attributes[1].value,data.attributes[2].value),
              map: map,
            //  icon:'parking.png',
              zIndex: 0,
              title: 'Show information about '+data.id
          });

          marks.push(marker);

          google.maps.event.addListener(marker, 'click', function() {
        //        marker.setVisible(false); // maps API hide call
                infowindow.setContent(renderContent(data));//markers[data.id]));
                infowindow.open(map,marker);
          });    	
    }

    function renderContent(data){
        //0 nivel luminosidad value
        //1 latitud value
        //2 longitud vale
        //3 cuadro asociado
        return "<div id='lamp-"+data.id+"' class='bubble'>\
                        <h3>Lamp ID: "+data.id+"</h3>\
                        <p><span>Nivel de iluminaci&oacute;n: </span><span class='nTotal'>"+data.attributes[0].value+"</span></p>\
                        <p><span>Coordenadas: </span><span class='nTotal'>"+data.attributes[1].value+","+data.attributes[2].value+"</span></p>\
                        <p><span>Cuadro asociado: </span><span>"+data.attributes[3].value+"</span></p>\
                        <div></div>\
                    </div>";
    }

    google.maps.event.addDomListener(window,'load',function(){
        getData();
    });
    
    (function(){
               var socket = io.connect('http://217.127.199.47:8080');
              
               socket.on('update', function (data) {	  	

                  console.log(data);
                   var updates = data.contextResponses || [];

                   for(var i=0,n=updates.length;i<n;i++){
                       if(updates[i].statusCode.code === "200"){
                           var update             = updates[i];
                           var lampID             = parseInt(update.contextElement.id);
                           var luminosityLevel = parseInt(update.contextElement.attributes[0].value);
                           var electricBoxId     = parseInt(update.contextElement.attributes[1].value);

                           tabla[electricBoxId][lampID].attributes[0].value = luminosityLevel;
                           
                           if(document.getElementById("lamp-"+lampID)){
                                infowindow.setContent(renderContent(tabla[electricBoxId][lampID]));	
                           }
                       }
                   }
               });
            })();
    
    
});
   