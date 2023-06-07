<template>
    <ion-page>
      <ion-header>
        <ion-toolbar>
          <ion-title class="ion-text-center">Drone Engineering Ecosystem</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content :fullscreen="true" v-if="!controllersApp && !followmeApp">
        <ion-button @click="connect" class="connectButton" href = "/tabs/autopilot/individual">Individual</ion-button>
        <ion-button @click="connectControllers" class="connectButton">Controller Game</ion-button>
        <ion-button @click="connectFollowMe" class="connectButton">Follow Me Game</ion-button>
      </ion-content>
      <ion-content :fullscreen="true" v-if="controllersApp || followmeApp"  >
        <ion-label style="display: flex; justify-content: center; margin-top: 15%; font-size: 30px;">Who are you?</ion-label>
        <ion-list class="ion-text-center">
          <div style="display: flex; justify-content: center; margin-top: 10%;">
            <ion-item style="width: 80%;" class="ion-text-center"> 
              <ion-input v-model="username" label="Default input" style="font-size: 25px;"></ion-input>
            </ion-item>
          </div>          
        </ion-list>
        <div style="display: flex; justify-content: center; margin-top: 5%;">
          <ion-button @click="sendUsername" style="width: 30%; height: 50px; margin-bottom: 10%;">Ok</ion-button>
        </div>        
      </ion-content>
      <ion-alert
        :is-open="isOpen"
        header="Alert"
        sub-header="Name already taken"
        message="Choose another username please"
        :buttons="alertButtons"
        @didDismiss="setOpen(false)"
      ></ion-alert>
    </ion-page>
</template>
  
<script>
  import { defineComponent, onMounted, ref, provide } from 'vue';
  import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonLabel, IonInput, IonList, IonItem, IonAlert } from '@ionic/vue';
  import { useMQTT } from 'mqtt-vue-hook'
  import { useRouter } from 'vue-router'
  
  export default  defineComponent({
    name: 'ComponentTab',
    components: { IonHeader, IonToolbar, IonTitle, IonContent, IonPage, IonButton, IonLabel, IonInput, IonList, IonItem, IonAlert },
    
    setup() {
      const mqttHook = useMQTT();
      const router = useRouter();
      let controllersApp = ref(false);
      let followmeApp = ref(false);
      let username = ref(undefined);
      let isOpen = ref(false);
      const alertButtons = ['OK'];

      const setOpen = (state) => {
        isOpen.value = state;
      };
      
      function connect() {
        mqttHook.publish("mobileApp/autopilotService/connect", "", 1)
        mqttHook.subscribe("autopilotService/mobileApp/#", 1)   
      } 

      function sendUsername(){
        if(username.value!=undefined){
          if(controllersApp.value){
            mqttHook.publish("mobileApp/dashboardControllers/username", username.value, 1)
          }
          else{
            mqttHook.publish("mobileApp/dashboardFollowme/username", username.value, 1)
          }
        }        
      }

      function connectControllers(){        
        mqttHook.subscribe("dashboardControllers/mobileApp/#", 1);
        controllersApp.value=true;
      }

      function connectFollowMe(){        
        mqttHook.subscribe("dashboardFollowme/mobileApp/#", 1);
        followmeApp.value = true
      }

      onMounted(() => {       
        controllersApp.value = false;
        isOpen.value = false;
        mqttHook.registerEvent("+/mobileApp/#", (topic, message)=>{
          if(topic=='dashboardControllers/mobileApp/'+username.value+'/create'){
            if(message=="ok"){
              controllersApp.value = false;            
              router.push("/tabs/autopilot/controllers/"+username.value)
            }
            else{
              isOpen.value = true;
            }
          }
          if(topic=='dashboardFollowme/mobileApp/'+username.value+'/create'){
            if(message=="ok"){
              followmeApp.value = false;       
              router.push('/followme/'+username.value)     
            }
            else{
              isOpen.value = true;
            }
          }
          
        })
      })
      
      return {
        connect,
        controllersApp,
        username,
        sendUsername,
        isOpen,
        alertButtons,
        setOpen,
        connectControllers,
        connectFollowMe,
        followmeApp
      }
    }
  })
</script>

<style>

.connectButton {
  margin: 10%;
  height: 20%;
  width: 80%;
  white-space: normal;
  word-wrap: break-word;
  font-weight: bold;
  
}

.playerButton{
  height: 300px;
  width: 90%;
  white-space: normal;
  word-wrap: break-word;
  font-weight: bold;
}


</style>
  