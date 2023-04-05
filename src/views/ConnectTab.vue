<template>
    <ion-page>
      <ion-header>
        <ion-toolbar>
          <ion-title class="ion-text-center">Drone Engineering Ecosystem</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content :fullscreen="true" v-if="!controllersApp">
        <ion-button @click="connect" class="connectButton" href = "/tabs/autopilot/individual">Individual</ion-button>
        <ion-button @click="controllersApp=true" class="connectButton">Controller Game</ion-button>
      </ion-content>
      <ion-content :fullscreen="true" v-if="controllersApp"  >
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
  import { defineComponent, onMounted, ref } from 'vue';
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
      let username = ref(undefined);
      let isOpen = ref(false);
      const alertButtons = ['OK'];

      const setOpen = (state) => {
        isOpen.value = state;
      };
      
      function connect() {
        mqttHook.publish("mobileApp/autopilotService/connect", "", 1)
      } 

      function sendUsername(){
        if(username.value!=undefined){
          mqttHook.subscribe("mobileApp/dashboardControllers/"+username.value+"/create")
          mqttHook.publish("mobileApp/dashboardControllers/username", username.value, 1)          
        }        
      }

      onMounted(() => {        
        mqttHook.registerEvent("+/dashboardControllers/#", (topic, message)=>{
          if(topic=='mobileApp/dashboardControllers/'+username.value+'/create'){
            if(message=="ok"){
              router.push("/tabs/autopilot/controllers/"+username.value)
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
        setOpen
      }
    }
  })
</script>

<style>

.connectButton {
  margin: 10%;
  height: 40%;
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
  