var visor = (function () {
 
    var markers = [];
    var circleArea = undefined;
    var actualControlID = "";
    var currentMarker = { type:undefined, id:undefined, marker:undefined };
    var _dataAdapter;
    var _notifier;

    function putLampMarkers(makersData){       
            return function(){

                for (var i=0, n=markers.length; i < n; i++) {
                    GMapsController.removeMarker(markers[i]);
                }

                markers=[];
                if(circleArea!=undefined)
                    GMapsController.removeCircleArea(circleArea);


                var keys = Object.keys(makersData);

                for (var i = 0, n=keys.length; i < n; i++) {

                    var data   = makersData[keys[i]];
                    var marker = GMapsController.putMarker(data,"img/markerIcons/poweroutage.png");

                    markers.push(marker);

                    GMapsController.addListenerToMarker(marker,'click',(function(_marker,_data){
                          return function(){

                                currentMarker.type   = "lamp";
                                currentMarker.id     = _data.id;
                                currentMarker.marker = _marker;

                                GMapsController.showMarkerInfoWindow(
                                    _marker,
                                    infoWindowLampTemplate.fillTemplate(_data),
                                    function(){
                                        infoWindowLampTemplate.addListenerToLuminosityRange(_data.id,function(){
                                            var luminosityLevel = this.value;
                                            _dataAdapter.updateLuminosityLamp(_data.id,this.value).done(function() {
                                                _data.luminosityLevel = luminosityLevel;
                                            });
                                        });
                                    }
                                );
                            }
                        })(marker,data));
                  }
                  var bounds = GMapsController.fitBoundsToMarkers(markers);
                  circleArea = GMapsController.addCircleArea(bounds.center,bounds.radius);
          }
    }

    function putSensorsMarkers(type,makersData){       

            var keys   = Object.keys(makersData);
            var icon;

            if(type === "temperatura" || type === "humedad")   icon = "img/markerIcons/water.png";
            else if(type === "consumo")  icon = "img/markerIcons/powerlinepole.png";                 

            for (var i = 0, n=keys.length; i < n; i++) {

                  var data = makersData[keys[i]];
                  var marker = GMapsController.putMarker(data,icon);

                  GMapsController.addListenerToMarker(marker,'click',(function(_marker,_data){

                        currentMarker.type   = type;
                        currentMarker.id     = _data.id;
                        currentMarker.marker = _marker;

                        return function(){
                            GMapsController.showMarkerInfoWindow(
                                _marker,
                                infoWindowSensorTemplate.fillTemplate(_data));
                            }
                  })(marker,data));
            }
      }

      function updateLampData(lampsData, data){

          var lamp = lampsData[data.electricalCabinetID][data.id];
          lamp.luminosityLevel = data.luminosityLevel;

          if(currentMarker.type === "lamp" && currentMarker.id === data.id){
                GMapsController.showMarkerInfoWindow(
                        currentMarker.marker,
                        infoWindowLampTemplate.fillTemplate(lamp)
                );
          }

      }
 
    function run (dataAdapter, notifier){
         //load data
         _dataAdapter = dataAdapter;
         _notifier = notifier;
           
        GMapsController.setCanvas("map-canvas");   
        
        $.when(_dataAdapter.loadLamps(),_dataAdapter.loadSensors()).done(function(lampsData, sensorsData) {

                var cabinetsIDs  = Object.keys(lampsData);
                for (var i=0, n=cabinetsIDs.length; i < n; i++) {
                    var lamps = lampsData[cabinetsIDs[i]];
                    var controlID  = cabinetsIDs[i];
                    GMapsController.addControl(controlID,putLampMarkers(lamps));
                }

                var sensorsTypes = Object.keys(sensorsData);            
                for (var i=0, n=sensorsTypes.length; i < n; i++) {                                                
                    var type = sensorsTypes[i];
                    var sensors = sensorsData[type];    
                    putSensorsMarkers(type,sensors);
                }

                notifier.onUpdate(function(updates){
                    for(var i=0,n=updates.length;i<n;i++){
                        var updatedData = updates[i];
                        if(updatedData.type==="lamp"){
                            updateLampData(lampsData,updatedData.data);
                        }
                    }
                });
          });
       }

        return {
            run : run
        };
 
    })();