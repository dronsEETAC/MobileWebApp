<template>
    <ion-page>
      <ion-header>
        <ion-toolbar>
          <ion-title class="ion-text-center">Speech Section</ion-title>
        </ion-toolbar>
      </ion-header>
      <ion-content>
        
      </ion-content>
    </ion-page>
  </template>
  
  <script>
  import { defineComponent, ref, onMounted } from 'vue';
  import { IonPage, IonHeader, IonToolbar, IonContent, IonTitle } from '@ionic/vue';
  import { useMQTT } from 'mqtt-vue-hook'
  
  export default  defineComponent({
    name: 'SpeechPage',
    components: { 
      IonHeader, IonToolbar, IonContent, IonPage, IonTitle
    },
  
    setup() {

      const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const sr = new Recognition();
      sr.lang = "es-US";

      function checkForCommand(result){

        const t = result[0].transcript;
        if (t.toLowerCase().trim().includes('hola')) {
          console.log('recognized')
          sr.stop()
        }

      }

      onMounted(() => {
        sr.continuous = true;
        sr.interimResults = true;

        sr.onstart = () => {
          console.log('SR Started');
        }

        sr.onend = () => {
          console.log('SR Stopped');
        }

        sr.onresult = (res)  => {
          
          for (let i = 0; i < res.results.length; i++) {
            const result = res.results[i]

            if (result.isFinal){
              checkForCommand(result);
            } 
          }
          console.log(res.results);
          let t = Array.from(res.results).map(result => result[0]).map(result => result.transcript);
        };
        
        sr.start()

      })
      
      return {
        
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