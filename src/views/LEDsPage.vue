<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title class="ion-text-center">LEDs Section</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-button class="startStopSequenceButton" v-if="connected" style="height: 10%" @click="startLedSequence">Start LEDs sequence</ion-button>
      <ion-button class="startStopSequenceButton" v-if="!connected" style="height: 5%" @click="stopLedSequence">Stop LEDs sequence</ion-button>
      <ion-row style="margin-top: 1%">
        <ion-col col-3>
          <ion-button style="width:100%; height: 100%;" @click="startNsecondsLedSequence">Start N LEDs sequence</ion-button>
        </ion-col>
        <ion-col col-9>
          <ion-item>
            <ion-input v-model="seconds"> </ion-input>
          </ion-item>
        </ion-col>
      </ion-row>
    </ion-content>
  </ion-page>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { IonPage, IonHeader, IonToolbar, IonContent, IonButton, IonInput, IonRow, IonCol, IonItem, IonTitle } from '@ionic/vue';
import { useMQTT } from 'mqtt-vue-hook'

export default  defineComponent({
  name: 'LEDsPage',
  components: { 
    IonHeader, IonToolbar, IonContent, IonPage, IonButton, IonInput, IonRow, IonCol, IonItem, IonTitle 
  },

  setup() {
    let seconds = ref("");
    let connected = ref(true);
    const mqttHook = useMQTT();

    function startLedSequence(){
      connected.value = false
      mqttHook.publish("mobileApp/LEDsService/startLEDsSequence", "", 1)
    }

    function startNsecondsLedSequence(){
      mqttHook.publish("mobileApp/LEDsService/LEDsSequenceForNSeconds", seconds.value.toString(), 1)
    }

    function stopLedSequence(){
      connected.value = true
      mqttHook.publish("mobileApp/LEDsService/stopLEDsSequence", "", 1)
    }

    return {
        startLedSequence,
        startNsecondsLedSequence,
        stopLedSequence,
        connected,
        seconds
    };
  },
});
</script>

<style>

.startStopSequenceButton {
    display: flex;
    margin-top: 30%;
    width:99.5%
  }

</style>
