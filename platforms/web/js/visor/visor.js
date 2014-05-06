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
                                showMaker(_marker,_data);
                            }
                        })(marker,data));
                  }
                  var bounds = GMapsController.fitBoundsToMarkers(markers);
                  circleArea = GMapsController.addCircleArea(bounds.center,bounds.radius);
          }
    }

    function showMaker(marker,data){
        GMapsController.showMarkerInfoWindow(
                marker,
                infoWindowLampTemplate.fillTemplate(data),
                function(){
                        infoWindowLampTemplate.addListenerToLuminosityRange(data.id,function(){
                               var luminosityLevel = this.value;
                               _dataAdapter.updateLuminosityLamp(data.id,this.value).done(function() {
                                        data.luminosityLevel = luminosityLevel;
                               });
                        });
                }
        );
    }

    function putSensorsMarkers(type,makersData){       

            var keys   = Object.keys(makersData);
            var icon;

            if(type === "temperatura")    icon = "img/markerIcons/water.png";
            if(type === "humedad")        icon = "img/markerIcons/waterdrop.png";
            else if(type === "consumo")  icon = "img/markerIcons/powerlinepole.png";                 
            else if(type === "luz")           icon = "img/markerIcons/sunny.png";       

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
          lampsData[data.electricalCabinetID][data.id].luminosityLevel = data.luminosityLevel;

          if(currentMarker.type === "lamp" && currentMarker.id === data.id){               
                showMaker(currentMarker.marker,lampsData[data.electricalCabinetID][data.id]);
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

                notifier.subscribe(function(updates){
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