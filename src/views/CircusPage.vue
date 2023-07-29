<template>
    <ion-page>
      <ion-header>
        <ion-toolbar>
          <ion-title class="ion-text-center">Circus section</ion-title>
        </ion-toolbar>
      </ion-header>

      <div v-show="connectedDashboard" style="margin-bottom: 10px;">
        <div v-if="!practising">
          <ion-button v-if = "state != 'arming' && state != 'takingOff'  && !flying && !armed" class="autopilotButton" color="tertiary" @click="armDrone">Arm drone</ion-button>
          <ion-button v-if = "state == 'arming'" class="autopilotButton" :disabled = "true" color="secondary">Arming...</ion-button>
          <ion-button v-if = "armed" class="autopilotButton" :disabled = "true" color="primary">Armed</ion-button>

          <ion-button v-if = "state != 'takingOff' && !flying" class="autopilotButton" :disabled = "!armed" color="tertiary" @click="takeOff">Take off</ion-button>
          <ion-button v-if = "state == 'takingOff'" class="autopilotButton" :disabled = "true" color="secondary" >Taking off ...</ion-button>
          <ion-button v-if = "flying" class="autopilotButton" :disabled = "true" color="primary" >Flying</ion-button>
        </div>

        <div v-if="practising">        
          <ion-button color="tertiary" v-if="!waitingForPractise" class="autopilotButton">Practising...</ion-button>
          <ion-button color="tertiary" v-if="waitingForPractise" class="autopilotButton">Waiting for practise...</ion-button>
        </div>

        <div style="display:flex; justify-content: center;">
          <div style ="display: flex; justify-content: center;">
              <canvas ref="canvasOut" style="border-style: solid; width: 300px; height: 400px;" id="output"></canvas>
          </div>
        </div>
        <div v-if="!practising">
          <ion-button v-if = "state != 'returningHome' && state != 'onHearth'"  class="autopilotButton" :disabled = "!flying" color="tertiary" @click="returnToLaunch">Return to launch</ion-button>
          <ion-button v-if = "state == 'returningHome'"  class="autopilotButton" :disabled = "true" color="secondary">Returning ...</ion-button>
          <ion-button v-if = "state == 'onHearth'"  class="autopilotButton" :disabled = "true" color="primary">On hearth</ion-button>
        </div>

        <div v-if="practising">        
          <ion-button color="tertiary" v-if="!waitingForPractise" class="autopilotButton" @click="finishPractice">Finish</ion-button>
          <ion-button color="tertiary" v-if="waitingForPractise" class="autopilotButton">Waiting for practise...</ion-button>
        </div>

      </div>

      <div style="background-color: blue; display: none">
        <video ref="myVideo"></video>
        <canvas ref="myCanvas"></canvas>
      </div>

      <ion-grid v-if="!connectedDashboard">
        <ion-row>
          <ion-col>
            <ion-button style="width: 300px; height: 100px" color="tertiary" @click="connectToDashboard">Connect</ion-button>
          </ion-col>
        </ion-row>
      </ion-grid>
    </ion-page>
  </template>
  
  <script>
  import { defineComponent, ref, onMounted } from 'vue';
  import { IonPage, IonHeader, IonToolbar, IonTitle, IonButton, IonGrid, IonCol, IonRow } from '@ionic/vue';
  import { useMQTT } from 'mqtt-vue-hook'
  import * as cv from 'opencv.js'
  
  export default  defineComponent({
    name: 'CircusPage',
    components: { 
      IonHeader, IonToolbar, IonPage, IonTitle, IonButton, IonGrid, IonCol, IonRow
    },

    ionViewWillLeave(){
      if(this.flying){
        this.mqttHook.publish("mobileApp/autopilotService/go", 'Stop', 1)
      }      
    },

    mounted(){

        this.myVideo = this.$refs.myVideo
        this.myCanvas = this.$refs.myCanvas       
        this.direction = 'Stop'
        this.canvasOut = this.$refs.canvasOut.getContext('2d');

        this.mqttHook.subscribe("autopilotService/mobileApp/#", 1)
        this.mqttHook.subscribe("droneCircusWebApp/mobileApp/#",1)
        this.mqttHook.subscribe("imageService/mobileApp/#",1)
        
        this.mqttHook.registerEvent("+/mobileApp/#", (topic, message) => {
          console.log(topic)
          if(topic=="autopilotService/mobileApp/telemetryInfo"){
            if(this.connected == false){
              this.connected = true;
              this.state = 'connected'
            }          
            const data = JSON.parse(message)
            console.log('telem ', data)
            this.state = data['state']
            if (data['state'] == 'armed')
              this.armed = true
                
            if (data['state'] == 'disarmed')
              this.armed = false
            
            if (data['state'] == 'flying'){
              if(this.flying == false && this.connectedDashboard){
                this.flying = true  
                this.armed = true
                this.startCapture();
              }              
            }                      
            if (data['state'] == 'onHearth')
            {
              this.flying = false;
              this.armed = false;              
            }
          }
          else if(topic=="droneCircusWebApp/mobileApp/connected"){
            this.connectedDashboard = true;            
            this.mode = message.toString();
          }
          else if(topic=="droneCircusWebApp/mobileApp/practice"){
            this.waitingForPractise = false;
            this.startCapture();            
          }
          else if(topic == "imageService/mobileApp/videoFrame"){
            let data = JSON.parse(message);
            let landmarksJSON = data.landmarks;
            this.indexToShow = parseInt(data.index);  
            this.showImage(this.indexToShow, landmarksJSON);  
            console.log('frame received')            
          }
          else if(topic == "imageService/mobileApp/code"){
            this.setDirection(message);
          }
          else if(topic == "droneCircusWebApp/mobileApp/finishPractice"){
            this.stopCapture();
            this.practising = false;
          }
        }, 'circusClient')
    },

    methods:{

      connectToDashboard(){
        this.mqttHook.publish('mobileApp/droneCircusWebApp/connect');
        this.mqttHook.publish('mobileApp/imageService/Connect','',1);        
      },

      initCanvas(){
        this.myCanvas.setAttribute('width', 300)
        this.myCanvas.setAttribute('height', 400)
        let index = 0;
        this.interval = setInterval(() => {
          let context = this.myCanvas.getContext('2d');
          context.drawImage(this.myVideo, 0,0, 300, 400);
          let jpg_as_text = this.myCanvas.toDataURL("image/jpeg").split(';base64,')[1];                 
          let data = {
            "image": jpg_as_text,
            "index": index
          }
          index = index + 1;
          let dataJSON = JSON.stringify(data);
          this.mqttHook.publish("mobileApp/imageService/videoFrame",dataJSON,1);
          this.imageList.push(this.myCanvas.toDataURL("image/jpeg"));     
          console.log('frame sent')           
        }, 400);
      },

      startCapture() {            
        navigator.mediaDevices.getUserMedia({ video: true, audio: false, facingMode: 'environment'}).then(stream => {          
          if(this.myVideo){
            this.myStream = stream;
            this.myVideo.srcObject = this.myStream;
            let playPromise = this.myVideo.play();
            if(playPromise !== undefined){
              this.initCanvas()
            }
          }             
                
        }).catch(error => {
          console.log(error);
        })
      },

      stopCapture(){
        this.myStream.getTracks().forEach(function(track) {
          track.stop();
        });
        clearInterval(this.interval);            
        this.mqttHook.publish("mobileApp/imageService/stopVideoStream");
        this.imageList = [];          
      },

      showImage(index, landmarksJSON) {   
        const img = new Image();        
        img.src = this.imageList[index];
        img.onload = () => {                               
          let dst;
          dst = cv.imread (img);
          cv.imshow ('output',dst);
          this.canvasOut.font = "bold 50px Arial";
          this.canvasOut.fillStyle = "red";
          this.canvasOut.textBaseline = "bottom";
          this.canvasOut.fillText(this.direction, 50, 80);
          this.paintLandmarks(landmarksJSON);
        }
      },

      paintLandmarks(landmarksJSON){
        if(this.mode == "fingers"){
          landmarksJSON.forEach((hand) => {
            if(hand.length > 0){
              // thumb
              for(let i = 0; i < 4; i++){
                this.drawLine(300-hand[i].x*300, hand[i].y*400, 300-hand[i+1].x*300, hand[i+1].y*400);
              }
              // index
              this.drawLine(300-hand[0].x*300, hand[0].y*400, 300-hand[5].x*300, hand[5].y*400);
              for(let i = 5; i<8; i++){
                this.drawLine(300-hand[i].x*300, hand[i].y*400, 300-hand[i+1].x*300, hand[i+1].y*400);
              }
              // middle
              this.drawLine(300-hand[5].x*300, hand[5].y*400, 300-hand[9].x*300, hand[9].y*400)
              for(let i = 9; i<12; i++){
                this.drawLine(300-hand[i].x*300, hand[i].y*400, 300-hand[i+1].x*300, hand[i+1].y*400);
              }
              // ring
              this.drawLine(300-hand[9].x*300, hand[9].y*400, 300-hand[13].x*300, hand[13].y*400)
              for(let i = 13; i<16; i++){
                this.drawLine(300-hand[i].x*300, hand[i].y*400, 300-hand[i+1].x*300, hand[i+1].y*400);
              }
              // pinky
              this.drawLine(300-hand[13].x*300, hand[13].y*400, 300-hand[17].x*300, hand[17].y*400)
              this.drawLine(300-hand[0].x*300, hand[0].y*400, 300-hand[17].x*300, hand[17].y*400)
              for(let i = 17; i<20; i++){
                this.drawLine(300-hand[i].x*300, hand[i].y*400, 300-hand[i+1].x*300, hand[i+1].y*400);
              }
            }
            for(let i = 0; i<hand.length; i++){
              this.drawCircle(300-hand[i].x*300, hand[i].y*400);
            }       
          })
        }
        else if(this.mode == "pose"){
          if(landmarksJSON.length > 0){
            // trunk
            this.drawLine(300-landmarksJSON[11].x*300, landmarksJSON[11].y*400, 300-landmarksJSON[12].x*300, landmarksJSON[12].y*400);
            this.drawLine(300-landmarksJSON[11].x*300, landmarksJSON[11].y*400, 300-landmarksJSON[23].x*300, landmarksJSON[23].y*400);
            this.drawLine(300-landmarksJSON[12].x*300, landmarksJSON[12].y*400, 300-landmarksJSON[24].x*300, landmarksJSON[24].y*400);
            this.drawLine(300-landmarksJSON[23].x*300, landmarksJSON[23].y*400, 300-landmarksJSON[24].x*300, landmarksJSON[24].y*400);
            // right arm
            for(let i = 11; i < 19; i = i + 2){
              this.drawLine(300-landmarksJSON[i].x*300, landmarksJSON[i].y*400, 300-landmarksJSON[i+2].x*300, landmarksJSON[i+2].y*400);
            }
            this.drawLine(300-landmarksJSON[15].x*300, landmarksJSON[15].y*400, 300-landmarksJSON[21].x*300, landmarksJSON[21].y*400);
            // left arm
            for(let i = 12; i < 20; i = i + 2){
              this.drawLine(300-landmarksJSON[i].x*300, landmarksJSON[i].y*400, 300-landmarksJSON[i+2].x*300, landmarksJSON[i+2].y*400);
            }
            this.drawLine(300-landmarksJSON[16].x*300, landmarksJSON[16].y*400, 300-landmarksJSON[22].x*300, landmarksJSON[22].y*400);
            // left leg
            for(let i = 24; i < 32; i = i + 2){
              this.drawLine(300-landmarksJSON[i].x*300, landmarksJSON[i].y*400, 300-landmarksJSON[i+2].x*300, landmarksJSON[i+2].y*400);
            }
            this.drawLine(300-landmarksJSON[28].x*300, landmarksJSON[28].y*400, 300-landmarksJSON[32].x*300, landmarksJSON[32].y*400);
            // right leg
            for(let i = 23; i < 31; i = i + 2){
              this.drawLine(300-landmarksJSON[i].x*300, landmarksJSON[i].y*400, 300-landmarksJSON[i+2].x*300, landmarksJSON[i+2].y*400);
            }
            this.drawLine(300-landmarksJSON[27].x*300, landmarksJSON[27].y*400, 300-landmarksJSON[31].x*300, landmarksJSON[31].y*400);
          }            

          for(let i = 11; i<landmarksJSON.length; i++){
            this.drawCircle(300-landmarksJSON[i].x*300, landmarksJSON[i].y*400);
          }  
        }            
      },

      drawCircle(posx, posy){
        this.canvasOut.fillStyle = "#FF0000";
        this.canvasOut.beginPath();
        this.canvasOut.arc(posx, posy, 3, 0, 2 * Math.PI);
        this.canvasOut.fill();
      },

      drawLine(posx, posy, posx2, posy2){
        this.canvasOut.beginPath();
        this.canvasOut.moveTo(posx, posy);
        this.canvasOut.lineTo(posx2, posy2);
        this.canvasOut.lineWidth = 3;
        this.canvasOut.strokeStyle = "#FFFFFF";
        this.canvasOut.stroke();
      },
      setDirection(code){
        if (code == 0){
          this.direction = "Stop";
        }
        else if (code == 1){
          this.direction = "North";
        }
        else if (code == 2){
          this.direction = "South";
        }
        else if (code == 3){
          this.direction = "East";
        }
        else if (code == 4){
          this.direction = "West";
        }
        else if (code == 5){
          this.direction = "Drop";
        }
        else if (code == 6){
          this.direction = "Return";
          this.returnToLaunch()
        }
        if(this.flying){
          this.mqttHook.publish("mobileApp/autopilotService/go", this.direction, 1)
        }
      },
      
      armDrone() {
        this.state = 'arming';
        this.mqttHook.publish("mobileApp/autopilotService/armDrone", "", 1);
      },

      disarmDrone() {
        this.mqttHook.publish("mobileApp/autopilotService/disarmDrone", "", 1)
      },

      takeOff() {
        this.state = 'takingOff'
        this.mqttHook.publish("mobileApp/autopilotService/takeOff", "", 1)
      },

      returnToLaunch(){
        this.stopCapture()
        if(this.flying){
          this.mqttHook.publish("mobileApp/autopilotService/returnToLaunch",'',1)
        }
        this.state = 'returningHome'
      },

      finishPractice(){
        this.mqttHook.publish("mobileApp/droneCircusWebApp/finishPractice", "", 1)
        this.stopCapture()
        this.imageList = [];   
        this.practising = false;
      }

    },

    data(){

      return{
        direction: null,
        state: 'disconnected',
        connected: false,
        armed: false,
        flying: false,
        connectedDashboard: false,
        connectButtonDisabled: true,

        practising: true,
        waitingForPractise: true,

        myCanvas: null,
        myVideo: null,
        canvasOut: null,

        interval: null,
        myStream: null,
        imageList: [],

        indexToShow: 0,
        mode: ''
      }
    },
  
    setup() {

      const mqttHook = useMQTT(); 

      return {
        mqttHook
      };
    },
  });
  </script>
  
  <style>
  ion-grid{
    height: 100%;
  }
  ion-row{
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }
  .autopilotButton {
    display: flex;
    margin: 1%;
  }
  </style>