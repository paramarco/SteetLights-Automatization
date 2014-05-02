$( document ).ready(function() {

		$("#selectServidorFIware").change(function(){	
            app.plataformaObjetivo = "fiware";
            asignarServidorObjetivo();
            alert("servidor cambiado");	
        });
            
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
                    alert("Inserte un numero por favor!");
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
        
		$("#boton_genera_calles_sofia").click(function(){
            Lungo.Router.section("loading_now");
            app.plataformaObjetivo = "sofia";
            setTimeout(function() {	genera_Calles(); }, 3000);
        });
        
		$("#Eliminar_Todo_sofia").click(function(){
            Lungo.Router.section("loading_now");
            app.plataformaObjetivo = "sofia";
            setTimeout(function() {	Eliminar_Todo(); }, 3000);
        });
        																																

        $("#botonIrMonitorFiware").click(function(){	
            app.plataformaObjetivo = "fiware";
            router_to_widget();
            visor.run(fiwareDataAdapter,fiwareNotifier);
         
        });

        $("#botonIrMonitorSofia").click(function(){	
            app.plataformaObjetivo = "sofia";
            router_to_widget();
            visor.run(sofia2DataAdapter,sofia2Notifier);
        });

        $("#back_sign_in_widget").click(function()	{	Lungo.Router.section("simulador"); 	});
        $("#back_sign_in_loading").click(function()	{	Lungo.Router.section("simulador");	});	
});


function router_to_widget(){  
        Lungo.Router.section("display");
}

function asignarServidorObjetivo(){
	if (app.plataformaObjetivo == "sofia")	{
		console.log( "DEBUG : 	Entra en 	: lanzaSimulacion: con SOFIA "   );
		var numeroServidor = parseInt($("#selectServidorFIware").val());
		///switch
		
		//setKpName("KP_test_luminaria");	
		//conectarSIBConToken("3bb7264f5c1743b78dbaa5ba2e33ac35", "KP_test_luminaria:KP_test_luminaria01", arrancaSimulacion );

	}
	else //fiware
	{
	}
}


var app = {
    // app atributtes    
    plataformaObjetivo: undefined,
    manejadorCiclo: undefined,
    
    ipFIware : "217.127.199.47:8080",
    ipFIwareNotifier :  "217.127.199.47:8090",
    
    ipFIwareInstalTIC : "217.127.199.47:8080",
    ipFIwareNotifierInstalTIC :  "217.127.199.47:8090",
    
    ipFIwareFIlab : "217.127.199.47:8080",
    ipFIwareNotifierFIlab:  "217.127.199.47:8090",
    
    ipSOFIA : "",
    
    ipSOFIAinCloud : "",
    ipSOFIAInstalTIC : ""
    
    
};
