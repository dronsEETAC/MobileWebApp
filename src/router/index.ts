import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'
import ConnectTab from '../views/ConnectTab.vue'
import AutopilotPage from '../views/AutopilotPage.vue'
import CameraPage from '../views/CameraPage.vue'
import LEDsPage from '../views/LEDsPage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: ConnectTab
  },
  {
    path: '/tabs/',
    component: TabsPage,
    children: [
      {
        path: 'autopilot/:mode/:player?',
        component: AutopilotPage,
        name: "AutopilotTab",
      },
      {
        path: 'camera',
        component: CameraPage,
        name: "CameraTab",
      },
      {
        path: 'leds',
        component: LEDsPage,
        name: "LEDsTab"
      }
    ]
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
