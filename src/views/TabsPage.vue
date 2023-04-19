<template>
  <ion-page>    
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="AutopilotTab" :href='newRouteAutopilot'>
          <ion-icon :icon="airplaneOutline" />
          <ion-label>Autopilot</ion-label>
        </ion-tab-button>
          
        <ion-tab-button tab="CameraTab" href='/tabs/camera'>
          <ion-icon :icon="cameraOutline" />
          <ion-label>Camera</ion-label>
        </ion-tab-button>
        
        <ion-tab-button tab="LEDsTab" href='/tabs/leds'>
          <ion-icon :icon="sunny" />
          <ion-label>LEDs</ion-label>
        </ion-tab-button>

        <ion-tab-button @click="disconnect" tab="DisconectTab">
          <ion-icon :icon="exitOutline" />
          <ion-label>Disconnect</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script>
import { defineComponent, ref, inject } from 'vue';
import { IonTabBar, IonTabButton, IonTabs, IonLabel, IonIcon, IonPage, IonRouterOutlet } from '@ionic/vue';
import { airplaneOutline, cameraOutline, exitOutline, sunny } from 'ionicons/icons';
import { useMQTT } from 'mqtt-vue-hook' 
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'TabsPage',
  components: { IonLabel, IonTabs, IonTabBar, IonTabButton, IonIcon, IonPage, IonRouterOutlet },
  setup() {
    let state = ref("disconnected");
    const route = useRoute();
    let mode = ref(route.params.mode);
    let newRouteAutopilot = ref("/tabs/autopilot/")
    const mqttHook = useMQTT();
    let emitter = inject("emitter");

    newRouteAutopilot.value = newRouteAutopilot.value + mode.value; 
    if(mode.value=="controllers"){
      newRouteAutopilot.value = newRouteAutopilot.value + '/' + route.params.player
    }

    function disconnect(){      
      emitter.emit('disconnect','');
    }
    
    
    return {
      cameraOutline, 
      sunny, 
      airplaneOutline,
      exitOutline,
      state,
      newRouteAutopilot,
      disconnect
    }
  }
});
</script>
