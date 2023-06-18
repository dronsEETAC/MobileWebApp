<template>
    <ion-page>
      <ion-header v-if="!photo">
        <ion-toolbar>
          <ion-title class="ion-text-center">Drone Engineering Ecosystem</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-grid class="ion-text-center" v-if="!yourTurn && !photo">
        <ion-col>
          <ion-row class="ion-padding-top">
            <h2 style="font-size: 30px;">Following:</h2>
          </ion-row>
          <ion-row class="ion-padding-top">
            <h2>{{ followingName }}</h2>
          </ion-row> 
        </ion-col>                 
      </ion-grid>
      <ion-content v-if="yourTurn && !photo" style="display: flex; justify-content: center;" class="ion-text-center" :fullscreen="true">
        <ion-grid>
          <ion-col>
            <ion-row style="display: flex; justify-content: center; align-items: center; flex-direction: column;">
              <ion-text>
                <h2 style="font-size: xx-large">Say a name:</h2>
              </ion-text>
            </ion-row>
          </ion-col>          
        </ion-grid>        
        <ion-list style="display: flex; justify-content: center; align-items: center; flex-direction: column;">
          <ion-item v-for="(name,index) in players" :key="index">
            <ion-label style="font-size: 25px;">{{ name }}</ion-label>
          </ion-item>
        </ion-list>                      
      </ion-content> 
      <ion-content v-if="photo">
        <ion-header>
          <ion-toolbar>
            <ion-title>Image</ion-title>
            <ion-buttons slot="end">
              <ion-button @click="setOpen(false)">Close</ion-button>
            </ion-buttons>
          </ion-toolbar>
        </ion-header>
        <ion-content>
          <h2>Photo of player: {{ lastName }}</h2>
          <div style="display:flex; justify-content: center;">
            <div style ="display: flex; justify-content: center;">
                <canvas style="width: 300px; height: 200px; border-style: solid;" id="output"></canvas>
            </div>
          </div>
        </ion-content>
      </ion-content>   
      <ion-footer v-if="yourTurn && !photo" class="ion-text-center">
        <ion-button shape="round" color="tertiary" @click="speak" style="margin-top: 5%; margin-bottom:5%; width: 100px; height: 100px; border-radius: 100px;" >
          <ion-icon slot="icon-only" :icon="micOutline" style="font-size: 40px;"></ion-icon>
        </ion-button>
      </ion-footer>       
    </ion-page>
</template>
  
<script>
  import { defineComponent, onMounted, ref, provide } from 'vue';
  import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonLabel, IonList, IonItem, alertController, IonIcon, IonButton, IonText, IonRow, IonGrid, IonCol, IonFooter, IonModal, IonButtons } from '@ionic/vue';
  import { micOutline } from 'ionicons/icons';
  import { useMQTT } from 'mqtt-vue-hook'
  import { useRouter, useRoute } from 'vue-router'
  import * as cv from 'opencv.js'
  
  export default  defineComponent({
    name: 'FollowMePage',
    components: { IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonLabel, IonList, IonItem, IonIcon, IonButton, IonRow, IonGrid, IonCol, IonText, IonFooter, IonButtons },
    ionViewDidEnter(){
      this.username = this.$route.params.player;
    },
    setup() {
      const mqttHook = useMQTT();
      const router = useRouter();
      const route = useRoute();
      let followingName = ref('');
      let players = ref([])
      let username = ref(undefined);
      let yourTurn = ref(false);
      let interval;
      let listenning = false;
      let photo = ref(false);
      let canvasWidth = ref(window.innerWidth);
      let canvasHeight = ref(window.innerHeight);
      let myContext;
      let myCanvas = ref(null)
      let lastName = ref("")

      const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const sr = new Recognition();
      sr.lang = "es-US";

      const yourTurnAlert = async () => {
        const alert = await alertController.create({
          header: 'Alert',
          subHeader: "It's your turn!",
          buttons: ['OK'],
        });
        await alert.present();
      };

      const sameNameAlert = async () => {
        const alert = await alertController.create({
          header: 'Alert',
          subHeader: "You can't say your own name",
          buttons: ['OK'],
        });
        await alert.present();
      };
            

      onMounted(() => {       
        
        mqttHook.subscribe('+/mobileApp/#',1 )
        mqttHook.subscribe('autopilotService/dashboardFollowme/waypointReached')
        mqttHook.subscribe('mobileApp/dashboardFollowme/following')
        mqttHook.subscribe('cameraService/dashboardFollowme/picture')
        mqttHook.publish('mobileApp/dashboardFollowme/sendList','')

        //sendCoordinates();
        

        sr.continuous = true;
        sr.interimResults = true;

        sr.onstart = () => {
          console.log('SR Started');
          listenning = true;
        }

        sr.onend = () => {
          console.log('SR Stopped');
          listenning = false;
        }

        sr.onresult = (res)  => {
          for (let i = 0; i < res.results.length; i++) {
            const result = res.results[i]
            if (result.isFinal){
              checkForPlayer(result);
            } 
          }
          //let t = Array.from(res.results).map(result => result[0]).map(result => result.transcript);
        };

        mqttHook.registerEvent("+/mobileApp/#", (topic, message)=>{
          console.log(topic)
          if(topic=='dashboardFollowme/mobileApp/updateList'){
            let data = JSON.parse(message);
            players.value = data.players;
          }
          else if(topic=='dashboardFollowme/mobileApp/yourTurn/'+username.value){
            yourTurn.value = true;
          }                    
        })

        mqttHook.registerEvent("+/dashboardFollowme/#", (topic, message)=>{
          console.log(topic)
          if(topic=='mobileApp/dashboardFollowme/following'){
            followingName.value = message.toString();
            if(followingName.value == username.value){
              followingName.value = 'you!'
            }
            yourTurn.value = false
            photo.value = false;
          }
          else if(topic=='autopilotService/dashboardFollowme/waypointReached'){
            if(followingName.value == 'you!'){
              yourTurn.value = true;              
            }
          }
          else if(topic == "cameraService/dashboardFollowme/picture"){ 
            photo.value = true;           
            const img = new Image();
            img.src = "data:image/jpg;base64,"+message;
            img.onload = () => {        
              let dst = cv.imread(img);
              cv.imshow ('output',dst);              
            }
            lastName.value = followingName.value;                        
          }
        })
        
      })

      function sendCoordinates(){
        let position;
        let message;
        let a = 0   
        let p1wp = [[41.2765244, 1.9886394], [41.2765184, 1.9886152], [41.2765103, 1.9885817], [41.2765053, 1.9885495], [41.2765003, 1.9885160], [41.2764932, 1.9884785], [41.2764882, 1.9884449], [41.2764821, 1.9884154], [41.2764761, 1.9883806], [41.2764710, 1.9883537]]     
        let p2wp = [[41.2764005, 1.9891383],[41.2763844, 1.9891477],[41.2763763, 1.9891530],[41.2763672, 1.9891571],[41.2763551, 1.9891597],[41.2763430, 1.9891544],[41.2763329, 1.9891369],[41.2763259, 1.9891141],[41.2763209, 1.9890833],[41.2763148, 1.9890645]]
        let p3wp = [[41.2762231,1.9882169],[41.2762170,1.9882290],[41.2762110,1.9882384],[41.2762019,1.9882558],[41.2761908,1.9882666],[41.2761858,1.9882827],[41.2761808,1.9882974],[41.2761727,1.9883202],[41.2761677,1.9883417],[41.2761626,1.9883537]]
        if("geolocation" in navigator) {
          console.log('geolocation')
          const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          }
          interval = setInterval(() => {
            navigator.geolocation.getCurrentPosition(
              pos => {
                position = [pos.coords.latitude,pos.coords.longitude]
                console.log(position)
                     
                
              },err => {
                console.log("error")
              }, options
            )

            //fem aixo per fer veure que tinc la posicio
            /* if(username.value == 'joana'){
              position = p1wp[a]
            }
            else if(username.value == 'pepe'){
              position = p2wp[a]
            }
            else if(username.value == 'maria'){
              position = p3wp[a]
            }
            a = a + 1;
            if(a == 10){
              a = 0;
            }  */

            message = {
                  player: username.value,
                  position: position
                }
                mqttHook.publish('mobileApp/dashboardFollowme/position', JSON.stringify(message)); 
            
            
          }, 2000)

        } else {
          console.log ('no hay geolocation')
        }
      }

      function checkForPlayer(result){
        const t = result[0].transcript;
        console.log(t.toLowerCase())

        for(let i = 0; i < players.value.length; i++){
          if (t.toLowerCase().trim().includes(players.value[i].toLowerCase())) {
            if(players.value[i] != username.value){
              mqttHook.publish('mobileApp/dashboardFollowme/following',players.value[i])
              
              sr.stop()
            }
            else{
              sameNameAlert();
              sr.stop()
            }
          }
        }
        
      }

      let a = 1

      function speak(){
        if(listenning == false){
          sr.start()
        }        
        /* mqttHook.publish('mobileApp/dashboardFollowme/following',players.value[a])
        console.log(players.value[a])
        a = a - 1 */
      }

      function setOpen(open){
        photo.value = open;
        if(yourTurn.value == true){
          yourTurnAlert()
        }
      }
      
      return {
        followingName,
        players,
        yourTurn,
        username,
        yourTurnAlert,
        micOutline,
        speak,
        sameNameAlert,
        photo,
        setOpen,
        canvasHeight,
        canvasWidth,
        myCanvas,
        myContext,
        lastName
      }
    }
  })
</script>

<style>
</style>
  