# Ionic-Vue Mobile App
<img width="147" alt="Captura de pantalla 2023-07-26 133013" src="https://github.com/JoanaOP/IonicVueMobileAppDEE/assets/73441184/32831254-95ac-4c22-a088-e43465042e08">
<img width="148" alt="Captura de pantalla 2023-08-23 111445" src="https://github.com/JoanaOP/IonicVueMobileAppDEE/assets/73441184/eb033c4a-e578-41c4-a8b9-8881b6ae864e">
<img width="150" alt="Captura de pantalla 2023-08-23 111511" src="https://github.com/JoanaOP/IonicVueMobileAppDEE/assets/73441184/8e579d0d-0010-4866-8994-dab152a8d4df">


The IonicVueMobileAppDEE is a front-end module developed in Ionic Vue. It allows the user to control the drone individually and to access the different games of the ecosystem.

For the individual control there is a bunch of things a user can do:
- Showing the picture/video stream sent by the camera service
- Free guiding the drone via buttons
- Showing telemetry data
- Starting/Stopping a LED sequence in the drone
- Free guiding the drone via the orientation of the device
- Play the Drone Circus Game

Then the user can also choose to play the Controllers Game or the Follow Me Game.

Each of the games is paired with its own dashboard implemented in the Dashboard Games. So to play the games the dashboard web app must be also opened in a computer.

## Demo
This video es a short demo of some of the individual functionalities of the Mobile APP.   
[Ionic App in action](https://www.youtube.com/watch?v=iDihSNpX-gs)   

In the video:
1. A mosquitto broker is started in port 1884. This will serve as internal broker.   
2. The ionic vue app is started. 
3. Both the camera service and the autopilot service are started in global and simulation modes, and will user the public broker broker.hivemq.com as external broker. Note that the camera service may take some time to start (be patient).    
4. Since the demo is in simulation mode, the Mission Planner simulator is started.   
5. The app can be accessed in localhost:81000 but also in 192.168.1.45:8100 for any device connected to the same network.     
6. We connect with the app from a mobile phone connected to the same wifi network than localhost.    
7. We connect with the external broker. This operation also makes the autopilot service connect to the autopilot.    
8. Note that in the current version the mobile app runs in global mode and uses the broker.hivemq.com as external broker. A simple future task would be to implement a mechanism to allow the user to select other configurations.    
9. The app arms, takes offa and moves the drone in different directions before returning home. Some telemetry data are shown.    
10. The app takes a pictures and gets the video stream, introducing different alterations in the image (gray, canny, etc.).   

Another functionality not shown in the video is the possibility to free guide the drone with the mobile orientation which can be found on the 'Orientation' tab.

## Games

There are three games to play in the Mobile App.

### Drone Circus Game

This game allows to control the drone in different ways like using the poses of your body or your fingers to determine the direction.

It can be found inside the individual mode, on the 'Circus' tab. Once accessed, you can connect to the dashboard of the game by clicking the 'Connect' button. When the practice is started from the dashboard, the camera of your phone will start recording and you can start doing poses to choose the direction of the drone. The poses you must do will be defined previously in the dashboard.

When you are confident enough and the practice finishes, you will be connected to the Autopilot Service and will be able to arm and take off the drone. Once the drone is flying you can repeat your poses to control it. You will also have a button to "Return to Launch".

<img width="146" alt="Captura de pantalla 2023-07-26 130454" src="https://github.com/JoanaOP/IonicVueMobileAppDEE/assets/73441184/54293c00-5fad-43ea-9efc-4ea6e1d5a917">
<img width="141" alt="circus" src="https://github.com/JoanaOP/IonicVueMobileAppDEE/assets/73441184/8eef1e7a-77b4-4095-990b-e54de1242220">


### Controllers Game

It is a multiplayer game that allows each player to guide the drone from their mobile. To do this the dronelab is divided in sectors and each sector is assigned to a player. When the drone is in that sector, is the turn of the corresponding player to control it

The game can be played by up to 4 players. Each one must open the application on their mobiles and choose the "Controllers Game" option. After that, a waiting page will show until the sectors are created in the dashboard. 

When the sectors are created the practice starts. In here the players can practice to free guide the drone via buttons when it is on their sector and try to reach the pink final base shown in the dashboard.

When they are comfortable enough the practice finishes and the first player will be able to arm and take off the drone. After that they can guide the drone and when a player is done playing they can click the "Return Home" button.

<img width="176" alt="controllers" src="https://github.com/JoanaOP/IonicVueMobileAppDEE/assets/73441184/ebdb05e9-944d-49e6-b404-b63c99ee8aaa">


### Follow Me Game

In this game the players are distributed around the dronelab with their respectives mobiles. When it is the player's turn, they say a name of another player to the mobile and the drone moves to the position of that player and takes a photo of them. Then sends it to the rest of the players and it is the turn of the player of whom the picture has been taken.

First the players must choose the "Follow Me Game" option and enter their names. After that a position will be assigned to each of them and they will go to that position physically. Once that is done the dron starts to fly and the it is the first player's turn. In the screen of the first player the names of the other players are shown and he can click the microphone icon to say one name out loud.

Then the drone moves to the position of the player whose name has been said and takes a photo of them. All of the players receive the photo on a new window which they can close or it will be closed automatically. Then it is the next player's turn to say a name out loud.

<img width="155" alt="followme" src="https://github.com/JoanaOP/IonicVueMobileAppDEE/assets/73441184/3767d9de-0efd-4cc4-8f9d-8c91b085f069">


## Installation and contribution
In order to run and contribute to the modules implemented in Vue, you need to install Node.js (version v16.14.2) and @vue/cli version 4.5.15 and @ionic/cli (in case of the Mobile app). We recomend Visual Code as IDE for development in Vue.    
To contribute to must follow the contribution protocol describen in the main repo of the Drone Engineering Ecosystem.
[![DroneEngineeringEcosystem Badge](https://img.shields.io/badge/DEE-MainRepo-brightgreen.svg)](https://github.com/dronsEETAC/DroneEngineeringEcosystemDEE)
To run the application, after cloning the repo in your laptop you must execute these commands:
```
cd IonicVueMobileAppDEE
npm install
npm run serve
```
When running the code you may get errors such as this:

Module not found: Error: Can't resolve 'fs' in 'C:\Users\USER\Documents\Miguel\DEE_all_repos\IonicVueMobileAppDEE\node_modules\opencv.js'

In this case, you must include the following code in the package.json in node-modules/opencv.js:     
```
  "browser": {
    "fs": false,
    "path": false,
    "os": false,
    "crypto": false
  }
  ```
Finally, if you are running this application on a machine with its own domain, you must add on the vue.config.js file the following lines:
```
devServer: {
          host: "dronseetac.upc.edu",
          port: 8104
  }
```




