/* NET-FUSION 3D · Easter eggs
   Cada página activa su puzzle con 5 toques seguidos sobre un elemento (o escribiendo "fusion").
   Al resolverlo se abre un visor con un modelo secreto.
   Pon tus modelos en assets/equipos/modelos/ con estos nombres:
     secreto-portada.glb · secreto-laboratorio.glb · secreto-visor.glb                    */
(function(){
"use strict";
var BASE="assets/equipos/modelos/";
var P={
  portada:{sel:"#l2",model:"secreto-portada.glb",titulo:"Acceso secreto: capas OSI",tipo:"orden",
    texto:"Toca las capas del modelo OSI en orden: primero la que ve el usuario (capa 7) y al final la que mueve los bits (capa 1).",
    items:["Aplicación","Presentación","Sesión","Transporte","Red","Enlace de datos","Física"]},
  laboratorio:{sel:"#l2",model:"secreto-laboratorio.glb",titulo:"Acceso secreto: subredes",tipo:"campos",
    texto:"Un host tiene la IP 192.168.1.130/26. Escribe su dirección de red y su dirección de broadcast. Pista: Red: 192.168.1.12X  Broadcast: 192.168.1.1X1 ¡Encuentra el ultimo dato!",
    campos:[["Dirección de red","192.168.1.128"],["Broadcast","192.168.1.191"]]},
  visor:{sel:"h1",model:"secreto-visor.glb",titulo:"Acceso secreto: puertos",tipo:"campos",
    texto:"Escribe el número de puerto estándar de cada servicio. ***4435322***",
    campos:[["HTTPS","443"],["DNS","53"],["SSH","22"]]}
};
var me=document.currentScript,cfg=P[me&&me.dataset.page];
if(!cfg)return;

var ov=null,stop=null;
function el(h){var d=document.createElement("div");d.innerHTML=h;return d.firstChild}
function $(s){return ov&&ov.querySelector(s)}
function norm(s){return String(s).replace(/\s+/g,"").toLowerCase()}
function shake(){var b=ov.firstChild;b.classList.remove("egg-shake");void b.offsetWidth;b.classList.add("egg-shake")}

/* ---- activación ---- */
var n=0,t=0,buf="";
document.addEventListener("click",function(e){
  if(ov||!e.target.closest(cfg.sel))return;
  var now=Date.now();n=(now-t<1500)?n+1:1;t=now;
  if(n>=5){n=0;abrir()}
});
document.addEventListener("keydown",function(e){
  if(e.key==="Escape"&&ov){cerrar();return}
  if(ov||/INPUT|TEXTAREA/.test(e.target.tagName||"")||e.key.length!==1)return;
  buf=(buf+e.key.toLowerCase()).slice(-6);
  if(buf==="fusion"){buf="";abrir()}
});

function abrir(){
  ov=el('<div class="egg-ov" role="dialog" aria-modal="true"><div class="egg-box"></div></div>');
  document.body.appendChild(ov);
  ov.addEventListener("click",function(e){if(e.target===ov||e.target.closest("[data-x]"))cerrar()});
  puzzle();
}
function cerrar(){if(stop){stop();stop=null}if(ov){ov.remove();ov=null}}

/* ---- puzzles ---- */
function puzzle(){
  var box=ov.firstChild;
  box.innerHTML='<h2>'+cfg.titulo+'</h2><p>'+cfg.texto+'</p><div id="eggBody"></div><p class="egg-msg" id="eggMsg"></p><div class="egg-bar"><button class="ghost" data-x>Cerrar</button></div>';
  var body=$("#eggBody"),msg=$("#eggMsg");
  if(cfg.tipo==="orden"){
    var orden=cfg.items.slice();
    do{orden.sort(function(){return Math.random()-.5})}while(orden.join()===cfg.items.join());
    body.className="egg-opts";
    body.innerHTML=orden.map(function(x){return '<button data-o="'+x+'">'+x+'</button>'}).join("");
    var pos=0;
    body.addEventListener("click",function(e){
      var b=e.target.closest("[data-o]");if(!b)return;
      if(b.dataset.o===cfg.items[pos]){
        b.classList.add("done");pos++;msg.className="egg-msg";msg.textContent="Capa "+(8-pos)+" colocada ("+pos+" de "+cfg.items.length+").";
        if(pos===cfg.items.length)ganar();
      }else{
        pos=0;[].forEach.call(body.querySelectorAll("button"),function(x){x.classList.remove("done")});
        msg.className="egg-msg bad";msg.textContent="Ese no es el orden. Empieza otra vez desde la capa 7.";shake();
      }
    });
  }else{
    body.innerHTML=cfg.campos.map(function(c,i){return '<label class="egg-f">'+c[0]+'<input class="egg-in" data-i="'+i+'" autocomplete="off" autocapitalize="off" spellcheck="false"></label>'}).join("")+'<button id="eggOk">Comprobar</button>';
    var ins=body.querySelectorAll("input");
    function revisar(){
      var ok=cfg.campos.every(function(c,i){return norm(ins[i].value)===norm(c[1])});
      if(ok)ganar();else{msg.className="egg-msg bad";msg.textContent="Alguna respuesta no es correcta. Revisa e inténtalo de nuevo.";shake()}
    }
    $("#eggOk").addEventListener("click",revisar);
    body.addEventListener("keydown",function(e){if(e.key==="Enter")revisar()});
    ins[0].focus();
  }
}
function ganar(){
  var box=ov.firstChild;
  box.innerHTML='<h2>¡Desbloqueado!</h2><p>Cargando el modelo secreto…</p>';
  setTimeout(function(){if(ov)visor()},800);
}

/* ---- visor del modelo secreto ---- */
function cargar(src){return new Promise(function(ok,ko){var s=document.createElement("script");s.src=src;s.onload=ok;s.onerror=ko;document.head.appendChild(s)})}
function motor(){
  var p=window.THREE?Promise.resolve():cargar("https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js");
  return p.then(function(){return THREE.GLTFLoader?0:cargar("https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/loaders/GLTFLoader.js")})
          .then(function(){return THREE.OrbitControls?0:cargar("https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js")});
}
function visor(){
  var box=ov.firstChild;box.classList.add("wide");
  box.innerHTML='<h2>Modelo secreto</h2><div class="egg-view" id="eggView"></div><p class="egg-msg" id="eggMsg">Cargando…</p><div class="egg-bar"><button data-x>Cerrar</button></div>';
  var msg=$("#eggMsg");
  motor().then(function(){arrancar(msg)}).catch(function(){msg.className="egg-msg bad";msg.textContent="No se pudo cargar el motor 3D. Revisa tu conexión."});
}
function arrancar(msg){
  var v=$("#eggView");if(!v)return;
  var r=new THREE.WebGLRenderer({antialias:true,alpha:true});
  r.setPixelRatio(Math.min(window.devicePixelRatio||1,2));r.outputEncoding=THREE.sRGBEncoding;v.appendChild(r.domElement);
  var sc=new THREE.Scene(),cam=new THREE.PerspectiveCamera(40,1,.05,100);cam.position.set(3.2,2,4.2);
  sc.add(new THREE.HemisphereLight(0xffffff,0x4b2a8a,1.1));
  var d1=new THREE.DirectionalLight(0xffffff,1.6);d1.position.set(3,5,4);sc.add(d1);
  var d2=new THREE.DirectionalLight(0xb45cff,1.2);d2.position.set(-4,2,-3);sc.add(d2);
  var ctl=new THREE.OrbitControls(cam,r.domElement);ctl.enableDamping=true;ctl.autoRotate=true;ctl.autoRotateSpeed=2.4;
  function fit(){var w=v.clientWidth,h=v.clientHeight;if(!w||!h)return;r.setSize(w,h,false);cam.aspect=w/h;cam.updateProjectionMatrix()}
  fit();var ro=new ResizeObserver(fit);ro.observe(v);
  function poner(obj){
    var b=new THREE.Box3().setFromObject(obj),s=b.getSize(new THREE.Vector3()),c=b.getCenter(new THREE.Vector3());
    var g=new THREE.Group();g.add(obj);obj.position.sub(c);g.scale.setScalar(2.4/(Math.max(s.x,s.y,s.z)||1));sc.add(g);
  }
  new THREE.GLTFLoader().load(BASE+cfg.model,function(g){poner(g.scene);msg.textContent="Arrastra para girarlo y pellizca para acercar."},undefined,function(){
    sc.add(new THREE.Mesh(new THREE.TorusKnotGeometry(.8,.28,120,16),new THREE.MeshStandardMaterial({color:0xffd60a,metalness:.4,roughness:.35})));
    msg.textContent="Aquí va tu modelo: guarda el archivo como "+BASE+cfg.model+". Mientras tanto se muestra uno de reserva.";
  });
  var id=0;(function loop(){ctl.update();r.render(sc,cam);id=requestAnimationFrame(loop)})();
  stop=function(){cancelAnimationFrame(id);ro.disconnect();r.dispose()};
}
})();
