var htmlAnterior = undefined;
var contentSelectors = $("#selections");
var socket = undefined;
var connected = false;
var showGrupos = false;
var showEquipos = false;
var codeMap = -1;

var btnConFn = () => {
    $("#btnConectar").prop("disabled", true);
    socket = new WebSocket('ws://192.168.0.150:4321');
    addLog("Conectando...")
    socket.onopen = () => {
        $("#btnConectar").removeClass("btn-success");
        $("#btnConectar").addClass("btn-danger");
        $("#btnConectar").html("Desconectar");
        $("#btnConectar").prop("disabled", false);
        addLog("Conectado.");
        connected = true;
        socket.send("MEDIACONTROLRTS-"+codeMap);
    };
    socket.onclose = () => {
        $("#btnConectar").addClass("btn-success");
        $("#btnConectar").removeClass("btn-danger");
        $("#btnConectar").html("Conectar");
        $("#btnConectar").prop("disabled", false);
        addLog("Desconectado.");
        connected = false;
    };
    socket.onerror = (error)=>{
        addLog("Error de conexion: "+error);
    }
    socket.onmessage = (event)=>{
        addLog("Mensaje: "+event.data);
    }
    $("#btnConectar").off();
    $("#btnConectar").on("click", () => {
        socket.close();
        $("#btnConectar").off();
        $("#btnConectar").on("click", btnConFn);
        $("#btnConectar").prop("disabled", true);
        addLog("Desconectando.")
    });
};

$("#btnConectar").on("click", btnConFn);
var fnClickEq = (event) => {
    //$(event.currentTarget).fadeOut();
    htmlAnterior = event.currentTarget;
    $(event.currentTarget.parentElement).html(contentSelectors);

    $("#selector-2-1").html('<i class="fa fa-check"></i>');
    $("#selector-2-2").html('<i class="fa fa-times"></i>');
    $("#selector-2-3").html('<i class="fa fa-exclamation-triangle"></i>');
    $("#selector-2-4").html('<i class="fa fa-eye"></i>');

    $("#selector-2-1").click(() => {
        if(connected) {
            socket.send("showeqcon");
            showEquipos = "Conectados";
            addLog("Mostrar solo conectados.");
        } else {
            addLog("No hay conexion.");
        }
    });
    $("#selector-2-2").click(() => {
        if(connected) {
            socket.send("showeqdcon");
            showEquipos = "Desconectados";
            addLog("Mostrar solo desconectados.");
        } else {
            addLog("No hay conexion.");
        }
    });
    $("#selector-2-3").click(() => {
        if(connected) {
            socket.send("showeqdes");
            showEquipos = "Destello";
            addLog("Mostrar solo en destello.");
        } else {
            addLog("No hay conexion.");
        }
    });
    $("#selector-2-4").click(() => {
        if(connected) {
            if(!showEquipos){
                socket.send("hideeq");
                showEquipos = false;
                addLog("Mostrar todos los equipos.");
            } else {
                showEquipos = true;
                socket.send("showeq");
                addLog("Ocultar todos los equipos.");
            }
        } else {
            addLog("No hay conexion.");
        }
    });

    $(".selector-2").click((event) => {
        $(event.currentTarget.parentElement.parentElement.parentElement).hide();
        $(event.currentTarget.parentElement.parentElement.parentElement.parentElement).html(htmlAnterior);
        $(htmlAnterior).click(fnClickEq);
        $(htmlAnterior).show();
    });

    $("#selections").show();
}

var intervalMov = undefined;
var posx = 0;
var posy = 0;

var posMapX = 0;
var posMapY = 0;

var widthContent = 0;

$("#btnEquipos").click(fnClickEq);

$(document).ready(() => {
    codeMap = prompt("Digite el numero del mapa:");
    if(codeMap == null || codeMap == "") {
        location.reload(true);
    }
    $("#joystick").draggable({
        start: ()=>{
            widthContent = $("#contJoy").width();
            if(!connected){return}
            intervalMov = setInterval(() => {
                if(!connected) {clearInterval(intervalMov); return;}
                var factor = 10 / (widthContent*0.77/2);
                posMapX+=posx*2/33;
                posMapY+=posy*2/33;
                var vertical = Math.round(posy*factor);
                var horizontal = Math.round(posx*factor);
                if(horizontal==0 && vertical==0){
                    return;
                }
                if(vertical>0){
                    if(horizontal>0){
                        //Cuadrante 1
                        addLog("Moviendo mapa " + vertical + "↑, " + horizontal +"→");
                    }else if(horizontal<0){
                        //Cuadrante 2
                        addLog("Moviendo mapa " + vertical + "↑, " + horizontal +"←");
                    }
                }else if(vertical<0){
                    if(horizontal<0){
                        //Cuadrante 3 
                        addLog("Moviendo mapa " + vertical + "↓, " + horizontal +"→");
                    }else if(horizontal>0){
                        //Cuadrante 4
                        addLog("Moviendo mapa " + vertical + "↓, " + horizontal +"←");
                    }
                }
                socket.send(horizontal + "h, " + vertical + "v");
            }, 200);
        },
        cursor: "move",
        containment: "#contJoy",
        revert: true,
        revertDuration: 200,
        drag: (e,ui)=>{
            posy = ui.position.top*-1+1;
            posx = ui.position.left-1;
        },
        stop: ()=>{
            clearInterval(intervalMov);
            posMapX = 0;
            posMapY = 0;
        }
    });

    $("#contentSelectors").height($(".col").width()+10);
});

$(window).resize(()=>{
    $("#contentSelectors").height($(".col").width()+10);    
});

function addLog(text) {
    var date = new Date();
    var dateString = date.toLocaleString();
    $("#logContent").append("<br> <span class='align-middle'><em style='font-size:0.8rem; color:#CCC;'>" + dateString +": </em></span><span class='align-middle'>"+text+"</span>");
    var element = document.getElementById("logContent");
    element.scrollTop = element.scrollHeight;
    var time = 40;
    setTimeout(() => {
        $("#logContent").css("background-color", "#555");
    }, time);
    setTimeout(() => {
        $("#logContent").css("background-color", "#000");
    }, time*2);
    setTimeout(() => {
        $("#logContent").css("background-color", "#555");
    }, time*3);
    setTimeout(() => {
        $("#logContent").css("background-color", "#000");
    }, time*4);
}

$("#btnZoomIn").click(()=>{
    if(connected){
        socket.send("zoomin");
        addLog("Zoom +");
    }else{
        addLog("No hay conexion.");
    }
});
$("#btnZoomOut").click(()=>{
    if(connected){
        socket.send("zoomout");
        addLog("Zoom -");
    }else{
        addLog("No hay conexion.");
    }
});
$("#btnGrupos").click(()=>{
    if(connected){
        if(showGrupos) {
            addLog("Ocultar grupos.");
            socket.send("hidegp");
            showGrupos = false;
        } else {
            addLog("Mostrar grupos.");
            showGrupos = true;
            socket.send("showgp");
        }
    }else{
        addLog("No hay conexion.");
    }
});
$("#btnOcultar").click(()=>{
    if(connected){
        socket.send("hideall");
        showEquipos = false;
        showGrupos = false;
        addLog("Ocultar todo.");
    }else{
        addLog("No hay conexion.");
    }
});