
<template>
  <div>
    <Accordion :activeIndex="0">
      <AccordionTab header="Filtros">
        <div class="p-fluid grid formgrid">
          <div class="field col-12 md:col-3 sm:col-12">
            <label for="basic">POBLACIÓN: </label>
            <MultiSelect v-model="selectedCities2" :options="cities" optionLabel="name" placeholder="Seleccionar población" display="chip" @change="pintarIncidencias()"/>
          </div>
          <div class="field col-12 md:col-3 sm:col-12">
            <label for="basic">Tipo de Incidencia: </label>
            <MultiSelect v-model="selectIncidencia" :options="options" optionLabel="nombre" placeholder="Seleccionar incidencia" display="chip" @change="pintarIncidencias()"/>
          </div>
          <div class="field col-12 md:col-3 sm:col-12">
            <label for="basic">FECHA CREACIÓN: </label>
            <Calendar v-model="value" selectionMode="range" :showButtonBar="true" @date-select="handleDate" @clear-click="clearDate"/>
          </div>
          <div class="field col-12 md:col-3 sm:col-12">
            <fieldset class="scheduler-border">
              <legend class="scheduler-border">Contenedores</legend> 
              <input class="form-check-input" type="checkbox" id="checkboxMarron" value="marron" v-model="checkedContenedores"  @change="pintarIncidencias()"/>
              <label class="form-check-label" for="checkboxMarron">Marron</label>
              <input class="form-check-input" type="checkbox" id="checkboxAzul"  value="azul" v-model="checkedContenedores" @change="pintarIncidencias()"/>
              <label class="form-check-label" for="checkboxAzul">Azul</label>
              <input class="form-check-input" type="checkbox" id="checkboxAmarillo"  value="amarillo" v-model="checkedContenedores" @change="pintarIncidencias()"/>
              <label class="form-check-label" for="checkboxAmarillo">Amarillo</label>
              <input class="form-check-input" type="checkbox" id="checkboxVerde"   value="verde" v-model="checkedContenedores" @change="pintarIncidencias()"/>
              <label class="form-check-label" for="checkboxVerde">Verde-Gris</label>
              <input class="form-check-input" type="checkbox" id="checkboxTodo"   value="todo" v-model="checkedContenedores" @change="pintarIncidencias()"/>
              <label class="form-check-label" for="checkboxTodo">Todo</label>
            </fieldset>
          </div>
        </div>
      </AccordionTab>
  </Accordion>
  </div>
  
  <div id="mapContainer"></div>  
</template>

<script>

import 'leaflet/dist/leaflet.css'
import Leaflet from 'leaflet'
/* eslint-disable */
import { db } from './firebase'
import $ from "jquery";
import { getDatabase, ref, onValue} from "firebase/database";

export default {
  name: 'maps-app',
  mounted() {
    
    this.loadlocationIncidents()

    $('#mapContainer').on('click', '.leaflet-popup-content .cycle a', function() {
    var $slideshow = $('.slideshow'),
        $newSlide;

    if ($(this).hasClass('prev')) {
        $newSlide = $slideshow.find('.active').prev();
        if ($newSlide.index() < 0) {
            $newSlide = $('.image').last();
        }
    } else {
        $newSlide = $slideshow.find('.active').next();
        if ($newSlide.index() < 0) {
            $newSlide = $('.image').first();
        }
    }

    $slideshow.find('.active').removeClass('active').hide();
    $newSlide.addClass('active').show();
    return false;
});
  },
  components: {
   
  },
  data() {
    return {
      selectedState: 'ENREVISION',
      selected: [],
      value: null,
      checkedContenedores:['verde'],
      dateRanger: null,
      markers: [],      
      selectedCities2: [], //campo select del combo ciudades
      selectIncidencia: [{ id: 120, nombre: 'Otro' }], //campo select de tipo de incidencias
      cities: [],
      incidencias: [],
      //FIXME: cambiar el numero despues de incidencias, para cambiar el estado.
      webIncidencia: 'http://appsdes.dip-badajoz.es/app.php/api/v2/incidencias/2/estadoweb?appToken=ASDFFDG-435657-RSUTY-456650&userToken=d24904f4ccc972aa6167c27089d95a3f942b9f514480de6d301f65b55a875ff6&idIncidencia=',
      optionsState: [
        {id: 1, key: 'ENREVISION', nombre: 'En revisión' },
        {id: 2, key: 'APROBADA', nombre: 'Aprobada'},
        {id: 3, key: 'CANCELADA', nombre: 'Cancelada' }
      ],
      options: [
          { id: 120, nombre: 'Otro' },
          { id: 119, nombre: 'Contenedor sucio' },
          { id: 122, nombre: 'Desaparecido' },
          { id: 116, nombre: 'Isla' },
          { id: 117, nombre: 'Contenedor desbordado' },
          { id: 117, nombre: 'Contenedor roto' },
          { id: 121, nombre: 'Contenedor sustituido' },
        ]
    }
  },
  computed: {
    
  },
  methods: {
    clearDate (){
      this.dateRanger = null//guardamos el rango de fechas
      this.pintarIncidencias() //llamamos de nuevo a pintar
    },
    handleDate () { 
      if(this.value[0]!=null && this.value[1]!=null){
        this.dateRanger = this.value  //guardamos el rango de fechas
        this.pintarIncidencias() //llamamos de nuevo a pintar
      }
      
    },
    padTo2Digits(num) {
      return num.toString().padStart(2, '0');
    },

    formatDate(date) {
      return [
        this.padTo2Digits(date.getDate()),
        this.padTo2Digits(date.getMonth() + 1),
        date.getFullYear(),
      ].join('/');
    },

    pintarIncidencias (){
      let me = this;
      if(me.map != undefined){
        me.map.remove();
      }        
      
      //this.map = L.map('mapContainer').setView([38.549306046136536, -6.240925714373589], 9) //Localiazcion mas zoom
      //L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}').addTo(this.map)
      var Spain_PNOA_Ortoimagen2 = Leaflet.tileLayer.wms('http://www.ign.es/wms-inspire/pnoa-ma?SERVICE=WMS&', {
        layers: 'OI.OrthoimageCoverage',
        format: 'image/png',
        maxZoom: 19,
        opacity: 0.8,
        continuousWorld : false
      });

      var Spain_PNOA_Ortoimagen = Leaflet.tileLayer.wms('http://www.ideextremadura.com/CICTEX/EXTREMADURA_BASE_VERSION2', {
        layers: 'EXTREMADURA_BASE',
        attribution: " <a href='https://locationiq.com'>Buscar por LocationIQ.com </a>",
        format: 'image/png',
        continuousWorld: true,
        maxZoom: 21
      });

      var Stamen_TonerLabels = Leaflet.tileLayer.wms('http://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx', {
        layers: 'TEXTOS',
        format: 'image/png',
        opacity: 1,
        maxZoom: 21,
        continuousWorld: true,
        transparent: true,
      })
      
      me.map = Leaflet.map('mapContainer',{layers:[Spain_PNOA_Ortoimagen2]}).setView([38.549306046136536, -6.240925714373589], 9) //Localiazcion mas zoom

      let baseMaps = {
        "OrtofotoIGN": Spain_PNOA_Ortoimagen2,
        "OrtofotoIDEEXBase": Spain_PNOA_Ortoimagen
        
      };
      let overlayMaps = {
        "calles": Stamen_TonerLabels
      };
      Leaflet.control.layers(baseMaps,overlayMaps).addTo(me.map);
      
     //.addTo(me.map);

      /*var Stamen_TonerLabels = Leaflet.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 20,
	ext: 'png'
}).addTo(me.map);*/
      var customPane = me.map.createPane('customPane')
      customPane.style.zIndex = 399
      
     /* if(me.markers.length>0){
        for(var i = 0; i < me.markers.length; i++){
          me.map.removeLayer(me.markers[i]);
        }
      }*/
      const myIconBlue = Leaflet.icon({
        iconUrl: '../images/camion_azul.png',iconSize: [38, 38], // size of the icon
      })
      const contenedores = Leaflet.icon({
        iconUrl: '../images/contenedores.png',iconSize: [38, 38], // size of the icon
      })
      
      const myIconYellow = Leaflet.icon({
        iconUrl: '../images/camion_amarillo.png',iconSize: [38, 38], // size of the icon
        //marker-yellow camion_amarillo
      })
      const myIconGreen = Leaflet.icon({
        iconUrl: '../images/camion_verde.png',iconSize: [38, 38], // size of the icon
      })
      const myIconRed = Leaflet.icon({
        iconUrl: '../images/marker-red.png',iconSize: [38, 38], // size of the icon
      })
      const myIconBrown = Leaflet.icon({
        iconUrl: '../images/camion_rojo.png',iconSize: [38, 38], // size of the icon
      })
      
      me.incidencias.forEach(function (childSnapshot) {

        var value = childSnapshot.val(); //obtenemos la informacion de cada incidencia.
        let srcImagen="http://appsdes.dip-badajoz.es/uploads/";
        
        var slideshowContent = '';

        if(me.selectedState === value.estado_incidencia.key && me.selectedCities2.length == 0 || me.selectedCities2.filter(e => e.name === value.poblacion).length > 0 ){
          if(me.selectIncidencia.length == 0 || me.selectIncidencia.filter(e => e.id === value.perfil.id).length > 0){
            //en el ultimo or comprobamos que el seleccionado o seleccionados sea alguno igual a la poblacion de la incidencia
          let dateInc = me.formatDate(new Date(value.fecha_envio));
          var popupContent =  `
          <h4>INCIDENCIA NUM: ${value.id}</h4>
          <div><b>CREADA: </b>${value.paciente.nombre} ${value.paciente.apellidos} (${value.correo_usuario})</div>
          <div><b>FECHA: </b>${dateInc}</div>
          <div><b>TIPO DE INCIDENCIA: </b>${value.perfil.nombre}</div>`
          //<div><b>ESTADO INCIDENCIA: </b>${value.estado_incidencia.nombre}</div>
          //<div><b>DESCRIPCION:</b>${value.descripcion}</div>;

          if(value.amarillo!=null && value.amarillo >0)
          popupContent +=`<div><b>CONT AMARILLO: </b>${value.amarillo}</div>`;
          if(value.verde!=null && value.verde >0)
          popupContent +=`<div><b>CONT VERDE: </b>${value.verde}</div>`;
          if(value.azul!=null && value.azul >0)
          popupContent +=`<div><b>CONT AZUL: </b>${value.azul}</div>`;
          if(value.marron!=null && value.marron >0)
          popupContent +=`<div><b>CONT MARRON: </b>${value.marron}</div>`;


          //en caso de no tener fecha se pintan todos, en caso de tener dos fechas se comprueba que la fecha de la incidencia esta entre las dos fechas seleccionadas.
          if(me.dateRanger ==null || me.dateRanger.length==2 && me.dateRanger[0] < new Date(value.fecha_envio) && me.dateRanger[1] > new Date(value.fecha_envio)){
            //if anidado para comprobar el estado y pintar los botones
            if(value.estado_incidencia.key =='ENREVISION'){
              popupContent+= `
                <div>
                  <a href="http://www.google.es" target="_blank"><img src="images/accept.png" /></a>
                  <a href="http://www.google.es" target="_blank" class="right"><img src="images/delete.png" /></a>
              </div>`
            } else if(value.estado_incidencia.key =='APROBADA'){
              popupContent+= `
                <div>
                  <a href="http://www.google.es" target="_blank"><img src="images/revision.png" /></a>
                  <a href="http://www.google.es" target="_blank" class="right"><img src="images/delete.png" /></a>
              </div>`
            }else {
              popupContent+= '<div>'+
                  //'<a href="'+me.webIncidencia+value.id+ '" target="_blank"><img src="images/accept.png"/></a>'+
                  '<a href="http://www.google.es" target="_blank" ><img src="images/revision.png" /></a>'+
                  '<a href="http://www.google.es" target="_blank" class="right"> <img src="images/accept.png" /> </a>'+
              '</div>'
            }

            //if para comprobar si tiene fotos y añadirlas al popup
            if(value.images != null){
              for(var i = 0; i < value.images.length; i++) {
                var img = value.images[i];
                
                slideshowContent += '<div class="image' + (i === 0 ? ' active' : '') + '">' +
                  '<img src="' + srcImagen+img + '" />' +
                '</div>';
              }
              popupContent +=`<div class="slideshow">
                ${slideshowContent}
            </div>
            <div class="cycle">
                <a href="#" class="prev">&laquo; Previous</a>
                <a href="#" class="next">Next &raquo;</a>
            </div>`
            }

            me.checkedContenedores.forEach(element => {
              if(value[element]>0){
               // console.log("tenemos "+value[element] +"Contenedores "+ element);
                let marker = Leaflet.marker([value.latitud, value.longitud], { icon: element == 'verde'? myIconGreen : element == 'amarillo' ? myIconYellow :  element == 'azul' ? myIconBlue :  myIconBrown }).addTo(me.map).bindPopup(popupContent);
                me.markers.push(marker)
              } else if(element==="todo"){
                let marker = Leaflet.marker([value.latitud, value.longitud], { icon: contenedores }).addTo(me.map).bindPopup(popupContent);
                me.markers.push(marker)
                
              }
              
            });
           /* let marker = L.marker([value.latitud, value.longitud], { icon: value.estado_incidencia.key == 'APROBADA'? myIconGreen : value.estado_incidencia.key == 'CANCELADA' ? myIconRed :  myIconYellow }).addTo(me.map).bindPopup(popupContent);
            me.markers.push(marker)*/
          }
          }
          
          
        }
      
      },me)
    },
    loadlocationIncidents(){
      
      const db = getDatabase();
      const starCountRef = ref(db, '/');
      
      onValue(starCountRef, (snapshot) => {
        
        if (snapshot.exists()) {
          this.incidencias = snapshot
          let poblaciones = []
          snapshot.forEach((child) => {
            if(child.val().poblacion != undefined)
              poblaciones.push(child.val().poblacion);
            
          });
          poblaciones = [...new Set(poblaciones)];
          poblaciones.forEach((child) => {
            this.cities.push({name: child, code: child});
          });

          console.log(poblaciones);
          //{ name: 'New York', code: 'NY' },
          //console.log(snapshot.val());
          /* Se insertan los iconos con la localizacion */
          this.pintarIncidencias()
          
        } else {
          console.log("No data available");
        }
      });
  }
},
  created() {
    
  }
}
</script>
<style>
#mapContainer {
  height: 90vh;
  width: 99%;
}
.my-class {
  transition: height 300ms cubic-bezier(0.3, 0, 0.6, 1);
}
.startDate {
    width: 270px;
}
.form-check-label{
  padding-left: 5px;
  padding-right: 5px;
}

fieldset.scheduler-border {
  border: 1px groove #ddd !important;
  padding: 0 1.4em 1.4em 1.4em !important;
  margin: 0 0 1.5em 0 !important;
  -webkit-box-shadow:  0px 0px 0px 0px #000;
  box-shadow:  0px 0px 0px 0px #000;
}

legend.scheduler-border {
  font-size: 1.2em !important;
  font-weight: bold !important;
  text-align: left !important;
  width:auto;
  border-bottom:none;
  padding: 0;
  margin-bottom: 0.5rem;
  font-size: calc(1.275rem + .3vw);
  line-height: inherit;
  float: inherit;
}

</style>
