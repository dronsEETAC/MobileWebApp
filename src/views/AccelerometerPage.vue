<template>
    <ion-page>
      <ion-header>
        <ion-toolbar>
          <ion-title class="ion-text-center">Accelerometer section</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-grid v-if="!correctOrientation">
        <ion-col>
          <ion-row class="textRow">
            <ion-text>
              <h2 style="font-size: xx-large">Rotate your phone to start</h2>
            </ion-text>
          </ion-row>
        </ion-col>          
      </ion-grid>
      <div v-if="correctOrientation">
        <ion-button v-if = "state != 'arming' && state != 'takingOff'  && !flying && !armed" class="autopilotButton" color="tertiary" @click="armDrone">Arm drone</ion-button>
        <ion-button v-if = "state == 'arming'" class="autopilotButton" :disabled = "true" color="secondary">Arming...</ion-button>
        <ion-button v-if = "armed" class="autopilotButton" :disabled = "true" color="primary">Armed</ion-button>

        <ion-button  v-if = "state != 'takingOff' && !flying" class="autopilotButton" :disabled = "!armed" color="tertiary" @click="takeOff">Take off</ion-button>
        <ion-button  v-if = "state == 'takingOff'" class="autopilotButton" :disabled = "true" color="secondary" >Taking off ...</ion-button>
        <ion-button  v-if = "flying" class="autopilotButton" :disabled = "true" color="primary" >Flying</ion-button>
      
        <ion-button  v-if = "state != 'returningHome' && state != 'onHearth'"  class="autopilotButton" :disabled = "!flying" color="tertiary" @click="returnToLaunch">Return to launch</ion-button>
        <ion-button v-if = "state == 'returningHome'"  class="autopilotButton" :disabled = "true" color="secondary">Returning ...</ion-button>
        <ion-button v-if = "state == 'onHearth'"  class="autopilotButton" :disabled = "true" color="primary">On hearth</ion-button>
      </div> 
      <!-- <ion-grid v-if="correctOrientation">
        <ion-col>
          <ion-row class="textRow">
            <ion-text>
              <h2 style="font-size: xx-large;">Good to go</h2>
            </ion-text>
          </ion-row>
        </ion-col>          
      </ion-grid> -->
    </ion-page>
  </template>
  
  <script>
  import { defineComponent, ref, onMounted } from 'vue';
  import { IonPage, IonHeader, IonToolbar, IonTitle, IonGrid, IonCol, IonRow, IonText, IonButton } from '@ionic/vue';
  import { useMQTT } from 'mqtt-vue-hook'
  
  export default  defineComponent({
    name: 'AccelerometerPage',
    components: { 
      IonHeader, IonToolbar, IonPage, IonTitle, IonGrid, IonCol, IonRow, IonText, IonButton
    },

    ionViewWillLeave(){
      if(this.flying.value){
        this.mqttHook.publish("mobileApp/autopilotService/go", 'Stop', 1)
      }      
    },
  
    setup() {

      const ScreenOrientation = window.screen.orientation;
      const mqttHook = useMQTT();
      let correctOrientation = ref(false);
      let direction = "stop";

      let state = ref('disconneced');
      let connected = ref(false);
      let armed = ref(false);
      let flying = ref(false);
  

      onMounted(() => {
        mqttHook.subscribe("autopilotService/mobileApp/#", 1)

        mqttHook.registerEvent("+/mobileApp/#", (topic, message) => {
          console.log(topic)
          if(topic=="autopilotService/mobileApp/telemetryInfo"){
            if(connected.value == false){
              connected.value = true;
              state.value = 'connected'
            }          
            const data = JSON.parse(message)
            console.log('telem ', data)
            state.value = data['state']
            if (data['state'] == 'armed')
              armed.value = true
                
            if (data['state'] == 'disarmed')
              armed.value = false
            
            if (data['state'] == 'flying'){
              flying.value = true  
              armed.value = true
            }                      
            if (data['state'] == 'onHearth')
            {
              flying.value = false;
              armed.value = false;
            }
          }
        }, 'accelerometerClient')

        
        ScreenOrientation.addEventListener('change', () => {
          if(ScreenOrientation.type == "landscape-primary"){
            correctOrientation.value = true;
          }
          else{
            correctOrientation.value = false;
            direction = "Stop";
            mqttHook.publish("mobileApp/autopilotService/go", direction, 1);
          }
        })

        getAccelerometer()   

      })

      function getAccelerometer(){
        if (DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === "function"){ //per safari
          DeviceMotionEvent.requestPermission().then(response => {
            console.log(response)
            if (response == 'granted') {
              window.addEventListener('deviceorientation',(event) => {
                if(correctOrientation.value){
                  if(flying.value){
                    getDirection(event.beta, event.gamma, event.alpha);
                  }                  
                }              
              })
            }
          })
        }
        else{
          window.addEventListener('deviceorientation',(event) => {
            if(correctOrientation.value){
              if(flying.value){
                getDirection(event.beta, event.gamma, event.alpha);
              }  
            }              
          })
        }
      }

      function getDirection(xAxisOrientation, yAxisOrientation, zAxisOrientation){
        if(xAxisOrientation >= 7){
          if(direction != "East"){
            direction = "East"
            mqttHook.publish("mobileApp/autopilotService/go", direction, 1);
          }
        }
        else if(xAxisOrientation <= -7){
          if(direction != "West"){
            direction = "West"
            mqttHook.publish("mobileApp/autopilotService/go", direction, 1);
          }
        }
        else if(yAxisOrientation >= -15){
          if(direction != "North"){
            direction = "North"
            mqttHook.publish("mobileApp/autopilotService/go", direction, 1);
          }
        }
        else if(yAxisOrientation <= -45){
          if(direction != "South"){
            direction = "South"
            mqttHook.publish("mobileApp/autopilotService/go", direction, 1);
          }
        }
        else if(xAxisOrientation > -7 && xAxisOrientation < 7 && yAxisOrientation > -40 && yAxisOrientation < -15){
          if(direction != "Stop"){
            direction = "Stop"
            mqttHook.publish("mobileApp/autopilotService/go", direction, 1);
          }
        }
        console.log(direction)
      }

      function takeOff() {
        state.value = 'takingOff'
        mqttHook.publish("mobileApp/autopilotService/takeOff", "", 1)
      }

      function armDrone() {
        state.value = 'arming';
        mqttHook.publish("mobileApp/autopilotService/armDrone", "", 1);
      }
      
      function returnToLaunch(){
        mqttHook.publish("mobileApp/autopilotService/returnToLaunch", "", 1)
      }
      
      return {
        correctOrientation,
        takeOff,
        armDrone,
        state,
        flying,
        armed,
        returnToLaunch,
        mqttHook
      };
    },
  });
  </script>
  
  <style>

  .textRow{
    display: flex; 
    justify-content: center; 
    align-items: center; 
    flex-direction: column;  
    inline-size: 300px; 
    overflow-wrap: break-word; 
    text-align: center;
  }
  
  </style>