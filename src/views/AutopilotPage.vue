<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title class="ion-text-center" text-align: center>Autopilot Section</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content :fullscreen="true" v-if="waitingConnection">
      <ion-label v-if="mode=='individual'" style="display: flex; justify-content: center; font-size: 20px; margin-top: 5%;">Waiting for connection...</ion-label>
      <ion-label v-if="mode=='controllers'" style="display: flex; justify-content: center; font-size: 20px; margin-top: 5%;">Waiting for other players to connect...</ion-label>
      <ion-progress-bar type="indeterminate"></ion-progress-bar>
    </ion-content>    
    <ion-content style="height:700px" v-if="!waitingConnection">
      <div style = "width:80%; margin-left:10%">
        <div v-if="!yourTurn && mode=='controllers'" class="yourTurnAlarm">
          <ion-label style="display: flex; justify-content: center; font-size: 20px; margin-top: 5%;">Wait for your turn...</ion-label>
        </div>   
        <div v-if="yourTurn && mode=='controllers'" class="yourTurnAlarm" :style="{backgroundColor: playerColor}">
          <ion-label style="display: flex; justify-content: center; font-size: 20px; margin-top: 5%; color: white">It's your turn!</ion-label>
        </div>     
      <ion-button v-if = "state != 'arming' && state != 'takingOff'  && !flying && !armed" class="autopilotButton" color="tertiary" @click="armDrone" :disabled="!yourTurn">Arm drone</ion-button>
      <ion-button v-if = "state == 'arming'" class="autopilotButton" :disabled = "true" color="secondary">Arming...</ion-button>
      <ion-button v-if = "armed" class="autopilotButton" :disabled = "true" color="primary">Armed</ion-button>

      <ion-button  v-if = "state != 'takingOff' && !flying" class="autopilotButton" :disabled = "!armed || !yourTurn" color="tertiary" @click="takeOff">Take off</ion-button>
      <ion-button  v-if = "state == 'takingOff'" class="autopilotButton" :disabled = "true" color="secondary" >Taking off ...</ion-button>
      <ion-button  v-if = "flying" class="autopilotButton" :disabled = "true" color="primary" >Flying</ion-button>

      <div class="direction">
        <div v-if = "direction != 'NorthWest'" id="NorthWest" v-on:click="go($event)" class="box">NW</div>
        <div v-if = "direction == 'NorthWest' && yourTurn==false" id="NorthWest" v-on:click="go($event)" class="box">NW</div>
        <div v-if = "direction == 'NorthWest' && yourTurn==true" id="NorthWest" v-on:click="go($event)" class="box2">NW</div>

        <div v-if = "direction != 'North'" id="North" v-on:click="go($event)" class="box">N</div>
        <div v-if = "direction == 'North' && yourTurn==false" id="North" v-on:click="go($event)" class="box">N</div>
        <div v-if = "direction == 'North' && yourTurn==true" id="North" v-on:click="go($event)" class="box2">N</div>

        <div v-if = "direction != 'NorthEast'" id="NorthEst" v-on:click="go($event)" class="box">NE</div>
        <div v-if = "direction == 'NorthEast' && yourTurn==false" id="NorthEst" v-on:click="go($event)" class="box">NE</div>
        <div v-if = "direction == 'NorthEast' && yourTurn==true" id="NorthEst" v-on:click="go($event)" class="box2">NE</div>

        <div v-if = "direction != 'West'" id="West" v-on:click="go($event)" class="box">W</div>
        <div v-if = "direction == 'West' && yourTurn==false" id="West" v-on:click="go($event)" class="box">W</div>
        <div v-if = "direction == 'West' && yourTurn==true" id="West" v-on:click="go($event)" class="box2">W</div>

        <div v-if = "direction != 'Stop'" id="Stop" v-on:click="go($event)" class="box">STOP</div>
        <div v-if = "direction == 'Stop' && yourTurn==false" id="Stop" v-on:click="go($event)" class="box">STOP</div>
        <div v-if = "direction == 'Stop' && yourTurn==true" id="Stop" v-on:click="go($event)" class="box2">STOP</div>

        <div v-if = "direction != 'East'"  id="East" v-on:click="go($event)" class="box">E</div>
        <div v-if = "direction == 'East' && yourTurn==false"  id="East" v-on:click="go($event)" class="box">E</div>
        <div v-if = "direction == 'East' && yourTurn==true"  id="East" v-on:click="go($event)" class="box2">E</div>

        <div v-if = "direction != 'SouthWest'" id="SouthWest" v-on:click="go($event)" class="box">SW</div>
        <div v-if = "direction == 'SouthWest' && yourTurn==false" id="SouthWest" v-on:click="go($event)" class="box">SW</div>
        <div v-if = "direction == 'SouthWest' && yourTurn==true" id="SouthWest" v-on:click="go($event)" class="box2">SW</div>

        <div  v-if = "direction != 'South'" id="South" v-on:click="go($event)" class="box">S</div>
        <div  v-if = "direction == 'South' && yourTurn==false" id="South" v-on:click="go($event)" class="box">S</div>
        <div  v-if = "direction == 'South' && yourTurn==true" id="South" v-on:click="go($event)" class="box2">S</div>

        <div v-if = "direction != 'SouthEast'" id="SouthEast" v-on:click="go($event)" class="box">SE</div>
        <div v-if = "direction == 'SouthEast' && yourTurn==false" id="SouthEast" v-on:click="go($event)" class="box">SE</div>
        <div v-if = "direction == 'SouthEast' && yourTurn==true" id="SouthEast" v-on:click="go($event)" class="box2">SE</div>

      </div>

      <ion-button class="autopilotButton" :disabled = "!flying || state == 'returningHome' || !yourTurn" color="tertiary">Drop</ion-button>
      <ion-button  v-if = "state != 'returningHome' && state != 'onHearth'"  class="autopilotButton" :disabled = "!flying || !yourTurn" color="tertiary" @click="returnToLaunch">Return to launch</ion-button>
      <ion-button v-if = "state == 'returningHome'"  class="autopilotButton" :disabled = "true" color="secondary">Returning ...</ion-button>
      <ion-button v-if = "state == 'onHearth'"  class="autopilotButton" :disabled = "true" color="primary">On hearth</ion-button>

      <ion-grid style="border-style: solid; width:80%; bottom: 10px;">
      <ion-row>
        <ion-col> 
          <ion-item style = "font-size: 9px; ">
            <ion-label >Altitude</ion-label>
            {{altitude}} 
          </ion-item>
        </ion-col>
        <ion-col> 
          <ion-item style = "font-size: 9px;">
            <ion-label >Battery</ion-label>
            {{battery}}
          </ion-item>
        </ion-col>
      </ion-row>
      <ion-row>
        <ion-col>
          <ion-item style = "font-size: 9px; ">
            <ion-label >Speed</ion-label>
            {{groundSpeed}}
          </ion-item>
         
        </ion-col>
        <ion-col>
          <ion-item style = "font-size: 9px; ">
            <ion-label >Heading</ion-label>
            {{heading}}
          </ion-item>
        </ion-col>
      </ion-row>
      </ion-grid>
      </div>
    </ion-content>
  </ion-page>
</template>

<script>
import { defineComponent, inject, onMounted, ref } from 'vue';
import { IonPage,alertController , IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonRow, IonCol, IonLabel, IonProgressBar, IonGrid } from '@ionic/vue';
import { useMQTT } from 'mqtt-vue-hook' 
import { useRoute, useRouter } from 'vue-router'
import * as turf from '@turf/turf';

export default  defineComponent({
  name: 'AutopilotPage',
  components: { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonItem, IonRow, IonCol, IonLabel, IonProgressBar, IonGrid },
  ionViewDidEnter(){
    this.player = this.$route.params.player;
    this.mode = this.$route.params.mode;
    if(this.mode == "individual"){
      this.waitingConnection = false;
    }
  },
  setup() {

    const emitter = inject('emitter');
    const mqttHook = useMQTT();
    const route = useRoute();
    const router = useRouter();
    let state = ref('connected');
    let armed = ref(false);
    let flying = ref(false);
    let connected = ref(false);
    let altitude = ref(undefined);
    let groundSpeed = ref(undefined);
    let heading = ref(undefined);
    let battery = ref(undefined);
    let direction = ref(undefined);

    const presentAlert = async () => {
        const alert = await alertController.create({
          header: 'Alert',
          subHeader: 'You are not flying',
          buttons: ['OK'],
        });

        await alert.present();
      };
    const flyingAlert = async () => {
      const alert = await alertController.create({
        header: 'Alert',
        subHeader: 'You cannot disconnect while flying',
        buttons: ['OK'],
      });

      await alert.present();
    };
    let mode = ref(undefined);
    let player = ref(undefined);
    let sector = ref([]);
    let waitingConnection = ref(true);
    let dronePosition = ref([]);
    let yourTurn = ref(false);
    let playerColor = ref('red');     
    

    onMounted(() => {  
      if(mode.value == "controllers"){
        mqttHook.subscribe("dashboardControllers/mobileApp/#", 1)
      }      
      else{
        mqttHook.subscribe("autopilotService/mobileApp/#", 1)
        mqttHook.publish("mobileApp/autopilotService/connect", "", 1);         
      }                  

      mqttHook.registerEvent('autopilotService/mobileApp/#', (topic, message) => {
        if(topic=="autopilotService/mobileApp/telemetryInfo"){
          const data = JSON.parse(message)
          console.log ('telem ', data)
          state.value = data['state']
          if (data['state'] == 'armed')
            armed.value = true
              
          if (data['state'] == 'disarmed')
            armed.value = false
          
          if (data['state'] == 'flying')
            flying.value = true
          
          if (data['state'] == 'onHearth')
          {
            flying.value = false;
            armed.value = false;
          }
          dronePosition.value = [data['lat'], data['lon']];
          battery.value = data['battery']
          heading.value = data['heading']
          altitude.value = data['altitude']
          groundSpeed.value = data['groundSpeed'].toFixed(2);
          yourTurn.value = droneInSector();
        } 
      })

      mqttHook.registerEvent("dashboardControllers/mobileApp/#", (topic, message) => {
        if(topic=="dashboardControllers/mobileApp/"+player.value+"/sector"){
          waitingConnection.value = false;
          let sectorJSON = JSON.parse(message); 
          console.log(sectorJSON);
          setSector(sectorJSON.sector);
          playerColor.value = sectorJSON.color.toString();
          mqttHook.publish("mobileApp/autopilotService/connect", "", 1);
          mqttHook.subscribe("autopilotService/mobileApp/#", 1)  
        }  
        else if(topic == "dashboardControllers/mobileApp/disconnect"){
          mqttHook.unSubscribe("autopilotService/mobileApp/#", error => {
            if (error) {
              console.log('Unsubscribe error', error)
            }
          })
          waitingConnection.value = true;
          sector.value = [];
          player.value = undefined;
          mode.value = undefined;
          dronePosition.value = [];
          yourTurn.value = false;
          playerColor.value = 'red';
          state.value = 'connected';
          armed.value = false;
          flying.value = false;
          connected.value = false;
          altitude.value = undefined;
          groundSpeed.value = undefined;
          heading.value = undefined;
          battery.value = undefined;
          direction.value = undefined;
          router.push('/')
        }     
      })
    
    })
  

    function go (event) {
      if (!flying.value){
        presentAlert()
      } else {
        if(yourTurn.value){
          let dir = event.currentTarget.id;
          direction.value = dir
          mqttHook.publish("mobileApp/autopilotService/go", dir, 1);
        }        
      }
    }
    function connect() {
      state.value = 'connecting'
      mqttHook.publish("mobileApp/autopilotService/connect", "", 1);
      connect.value = true;
      state.value = 'connected'
    }
    function armDrone() {
      state.value = 'arming';
      mqttHook.publish("mobileApp/autopilotService/armDrone", "", 1);
    }

    function disarmDrone() {
      connected.value = false
      mqttHook.publish("mobileApp/autopilotService/disarmDrone", "", 1)
    }

    function takeOff() {
      state.value = 'takingOff'
      mqttHook.publish("mobileApp/autopilotService/takeOff", "", 1)
    }
    function returnToLaunch(){
      mqttHook.publish("mobileApp/autopilotService/returnToLaunch", "", 1)
    }

    function setSector(sectorJSON){
      console.log(sectorJSON);
      for(let j = 0; j<sectorJSON.length; j++){
        let waypoints = [];
        for(let i = 0; i<sectorJSON[j].length; i++){
          waypoints.push([sectorJSON[j][i].lat, sectorJSON[j][i].long]);
        }
        waypoints.push([sectorJSON[j][0].lat, sectorJSON[j][0].long])
        sector.value.push(waypoints); 
      }  
      console.log(sector)    
    }

    function droneInSector(){
      if(mode.value=="controllers"){
        let droneInSectorBoolean = false;        
        if(playerColor.value == 'yellow'){
          if(turf.booleanPointInPolygon(turf.point(dronePosition.value), turf.polygon(sector.value))){
            droneInSectorBoolean = true;
          }
        }
        else{
          for(let i = 0; i<sector.value.length; i++){
            console.log(sector.value[i]);
            if(turf.booleanPointInPolygon(turf.point(dronePosition.value), turf.polygon([sector.value[i]]))){
              droneInSectorBoolean = true;
            }
          }
        }        
        return droneInSectorBoolean;
      }
      else{
        return true;
      }
      
    }    

    return {
      takeOff,
      altitude,
      groundSpeed,
      returnToLaunch,
      connected,
      armDrone,
      disarmDrone,
      emitter,
      armed,
      flying,
      go,
      state,
      heading,
      battery,
      connect,
      presentAlert,
      direction,
      player,
      mode,
      waitingConnection,
      yourTurn,
      playerColor,
      flyingAlert
    }
  }
});
</script>

<style>

  .autopilotButton {
    display: flex;
    margin: 1%;
  }

  .direction {
    display: grid;
    grid-template-rows: 100px 100px 100px;
    grid-template-columns: 100px 100px 100px;
    text-align: center;
    width:80%;
    margin-left: 5%;

  }


  body {
    display: flex;
    justify-content: center;
  }
  .box {
    background: #444;
    border: 1px solid #555;
    display: flex;
    align-items: center;
    justify-content: center;
    color: yellowgreen;
    font-size: 18px;
    margin: 5px
  }
  .box2 {
    background: rgb(233, 226, 226);
    border: 1px solid #555;
    display: flex;
    align-items: center;
    justify-content: center;
    color: rgb(224, 16, 16);
    font-size: 18px;
    margin: 5px
  }
  .yourTurnAlarm {
    border-radius: 10px;
    margin-bottom: 5px;
  }
</style>
