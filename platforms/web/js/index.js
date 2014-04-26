$( document ).ready(function() {
            
        $("#boton_genera_objetos").click(function(){	
            Lungo.Router.section("main_loading");
            app.plataformaObjetivo = "fiware";	
        });
        
        $("#boton_genera_escenario").click(function(){
            Lungo.Router.section("ciclodeCarga");
            app.plataformaObjetivo = "fiware";
        });
        
        $("#boton_genera_calles").click(function(){
            Lungo.Router.section("loading_now");
            app.plataformaObjetivo = "fiware";
            setTimeout(function() {	genera_Calles(); }, 3000);
        });
        
        $("#Eliminar_Todo").click(function(){
            Lungo.Router.section("loading_now");
            app.plataformaObjetivo = "fiware";
            setTimeout(function() {	Eliminar_Todo(); }, 3000);
        });
        
        
        
        $("#boton_lanza_simulacion").click(function(){	
            if (isNaN(document.getElementById('periodo_en_segundos').value ) || 
                document.getElementById('periodo_en_segundos').value == ""	|| 
                isNaN(document.getElementById('numero_de_objetos_paquete_simulacion').value ) || 
                document.getElementById('numero_de_objetos_paquete_simulacion').value == ""	){
                alert("Inserte número por favor!");
            }
            else{
                $("#li_boton_lanza_simulacion").hide("slow");
                $("#li_boton_para_simulacion").show("slow");
                setTimeout(function() {	lanzaSimulacion(); }, 3000);
            }	
        });				    						
    
        $("#boton_para_simulacion").click(function(){	clearInterval(app.manejadorCiclo);
            $("#li_boton_lanza_simulacion").show("slow");
            $("#li_boton_para_simulacion").hide("slow");
        });					    						

        $("#boton_genera_objetos_ahora").click(function(){
            var valorInsertado = document.getElementById('numero_de_luminarias').value;
            var numero_de_objetos_paquete = document.getElementById('numero_de_objetos_paquete').value;		    
            
            if (valorInsertado != "" && valorInsertado != null && valorInsertado > 0 &&
                numero_de_objetos_paquete != "" && numero_de_objetos_paquete != null && numero_de_objetos_paquete > 0 &&
                !isNaN(valorInsertado) && !isNaN(numero_de_objetos_paquete)	){

                    Lungo.Router.section("loading_now");
                    setTimeout(function() {	genera_objetos(valorInsertado,numero_de_objetos_paquete);}, 3000);
            } else {
                    alert("Inserte un número por favor!");
            }
        });													

        $("#boton_genera_objetos_sofia").click(function(){	
            Lungo.Router.section("main_loading");
            app.plataformaObjetivo = "sofia";		     
        });
    
        $("#boton_genera_escenario_sofia").click(function(){	
            Lungo.Router.section("ciclodeCarga");
            app.plataformaObjetivo = "sofia";					    									
        });																																

        $("#botonIrMonitorFiware").click(function(){	
            app.plataformaObjetivo = "fiware";
            router_to_widget();
            visor.run(fiwareDataAdapter,fiwareNotifier);
         
        });

        $("#botonIrMonitorSofia").click(function(){	
            app.plataformaObjetivo = "sofia";
            router_to_widget();
        });

        $("#back_sign_in_widget").click(function()	{	Lungo.Router.section("simulador"); 	});
        $("#back_sign_in_loading").click(function()	{	Lungo.Router.section("simulador");	});	
});


function router_to_widget(){  
    if (app.plataformaObjetivo=="sofia"){
        alert("No implementado aun...");
    }
    else{//fiware	
        Lungo.Router.section("display");
    }	
}

// exit    
function exitFromApp(buttonIndex) {	
    if (buttonIndex==2){ 
        //navigator.app.exitApp();
    }
}

// exit  
function tap_on_exit(){
    //navigator.notification.confirm("sales de la app?",  exitFromApp, "salir", "NO , SI" );
}

var app = {
    // app atributtes    
    plataformaObjetivo: function() {},
    manejadorCiclo: function() {},

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        setTimeout(function() { 					
            Lungo.Router.section("mainSimulador");			
        },3000);          
    }
};
