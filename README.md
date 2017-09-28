# tank3d

Multiplayer 3d tank game.

<h1> Technology </h1>
FrontEnd - threejs, webpack

BackEnd - node, express, socketio, nodemon, synapticjs  

The bots in the game are controlled using neural networks built on top of synapticjs.  The bots are designed to move towards the closest player.

<h1> Development Instructions </h1>

1. clone repo
2. ```npm install```
3. start the server at the project root using ```npm run dev```
4. navigate to public directory and start front end development using ```npm run start```
5. change the script src in public/index.html from 
```<script src="public/lib/three.js"></script>``` and ```<script src="public/build/bundle.js"></script>``` to 
```<script src="./lib/three.js"></script>``` and ```<script src="./build/bundle.js"></script>```
6. change socket connection in public/src/app.js from 
```io.connect('https://tank3d.herokuapp.com/');``` to 
```io.connect('http://localhost:80/');```
7. project can be accessed on http://localhost:8080/
