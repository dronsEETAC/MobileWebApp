<template>
    <ion-page>
      <ion-header>
        <ion-toolbar>
          <ion-title class="ion-text-center">Drone Engineering Ecosystem</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content v-if="!yourTurn">
        <ion-text>
          <h2>Following:</h2>
          <h2>{{ followingName }}</h2>
        </ion-text>
      </ion-content>
      <ion-content v-if="yourTurn">
        <ion-text style="text-align: center;">
          <h2 style="margin-top:20px">Say a name:</h2>
        </ion-text>
        <ion-list>
          <ion-item v-for="(name,index) in players" :key="index">
            <ion-label>{{ name }}</ion-label>
          </ion-item>
        </ion-list>
      </ion-content>      
    </ion-page>
</template>
  
<script>
  import { defineComponent, onMounted, ref, provide } from 'vue';
  import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonText, IonLabel, IonList, IonItem, alertController  } from '@ionic/vue';
  import { useMQTT } from 'mqtt-vue-hook'
  import { useRouter, useRoute } from 'vue-router'
  
  export default  defineComponent({
    name: 'FollowMePage',
    components: { IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonText, IonLabel, IonList, IonItem },
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
      let yourTurn = ref(false)
      let interval;

      const yourTurnAlert = async () => {
        const alert = await alertController.create({
          header: 'Alert',
          subHeader: "It's your turn!",
          buttons: ['OK'],
        });

        await alert.present();
      };
      

      onMounted(() => {       
        
        mqttHook.subscribe('+/mobileApp/#',1 )
        mqttHook.subscribe('autopilotService/dashboardFollowme/waypointReached')
        mqttHook.publish('mobileApp/dashboardFollowme/sendList','')

        sendCoordinates();

        mqttHook.registerEvent("+/mobileApp/#", (topic, message)=>{
          if(topic=='dashboardFollowme/mobileApp/updateList'){
            players.value = JSON.parse(message);
          }
          else if(topic=='dashboardFollowme/mobileApp/following'){
            followingName.value = message.toString();
            if(followingName.value == username.value){
              followingName.value = 'you!'
            }
          }
        })

        mqttHook.registerEvent("autopilotService/dashboardFollowme/waypointReached", (topic, message)=>{
          console.log('received')
          if(topic=='autopilotService/dashboardFollowme/waypointReached'){
            if(followingName.value == 'you!'){
              yourTurn.value = true;
              yourTurnAlert()
            }
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
          interval = setInterval(() => {
            /* navigator.geolocation.getCurrentPosition(
              pos => {
                position = [pos.coord.latitude,pos.coords.longitude]
              },err => {
                console.log("error")}
            ) */

            //fem aixo per fer veure que tinc la posicio
            if(username.value == 'p1'){
              position = p1wp[a]
            }
            else if(username.value == 'p2'){
              position = p2wp[a]
            }
            else if(username.value == 'p3'){
              position = p3wp[a]
            }
            a = a + 1;
            if(a == 10){
              a = 0;
            }

            message = {
              player: username.value,
              position: position
            }
            console.log(position)
            mqttHook.publish('mobileApp/dashboardFollowme/position', JSON.stringify(message));
            
          }, 2000)

        } else {
          console.log ('no hay geolocation')
        }
      }
      
      return {
        followingName,
        players,
        yourTurn,
        username,
        yourTurnAlert
      }
    }
  })
</script>

<style>

</style>
  