import Tank from './tank.js';
import * as CONSTANTS from './constants.js';

export default class Game {

  constructor(socket,wrapper){
    this.socket = socket;
    this.wrapper = wrapper;
    this.tanks = {};

    this.initGame();
    this.initListeners();
    this.initSocket();

    this.animate();
  }

  initSocket(){

    this.socket.emit('enter',this.tank.toObject());

    //constant update of other tanks
    this.socket.on('update',(tanks)=>{
      for(let prop in tanks){
        if(prop === this.socket.id) continue;
        let tank = this.tanks[prop];
        //update existing tank
        if(tank){
          tank.body.position.copy(tanks[prop].position);
          tank.body.rotation.copy(tanks[prop].rotation);
        }else{
          //create new tank
          let newT = new Tank(this.scene);
          newT.body.position.copy(tanks[prop].position);
          newT.body.rotation.copy(tanks[prop].rotation);
          this.tanks[prop] = newT;
        }
      }

      //remove non existing tanks
      for(let prop in this.tanks){
        let tank = tanks[prop];
        if(!tank){
          this.tanks[prop].destroy();
          delete this.tanks[prop];
        }
      }
    });

    this.socket.on('hit',()=>{
      this.tank.restart();
    });

    this.socket.on('fire',(id)=>{
      let tank = this.tanks[id];
      tank.fire();
    });

  }

  initGame(){
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
    this.renderer = new THREE.WebGLRenderer();

    this.camera.position.y = 100;

    this.tank = new Tank(this.scene);

    let positionX = Math.floor(Math.random() * 50) - 25;
    let positionZ = Math.floor(Math.random() * 50) - 25;

    this.tank.body.position.y = 1.5;
    this.tank.body.position.x = positionX;
    this.tank.body.position.z = positionZ;

    // A hemisphere light is a gradient colored light;
    let hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)

    // A directional light shines from a specific direction.
    let shadowLight = new THREE.DirectionalLight(0xffffff, .9);

    // Set the direction of the light
    shadowLight.position.set(150, 350, 350);

    this.scene.add(hemisphereLight);
    this.scene.add(shadowLight);

    //add ground
    var geometry = new THREE.PlaneGeometry(CONSTANTS.WORLD_SIZE*2,CONSTANTS.WORLD_SIZE*2);
    var material = new THREE.MeshBasicMaterial( {color: 'white', side: THREE.DoubleSide} );
    var ground = new THREE.Mesh( geometry, material );
    ground.rotation.x = 90*( Math.PI/180);
    this.scene.add(ground);

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.wrapper.clientWidth, this.wrapper.clientHeight);
    this.wrapper.appendChild(this.renderer.domElement);
  }

  initListeners(){

    window.addEventListener('keydown',(e)=>{
      switch(e.code){
        case 'KeyW':
        this.tank.moveForward = true;
        break;
        case 'KeyS':
        this.tank.moveBackward = true;
        break;
        case 'KeyA':
        this.tank.turnLeft = true;
        break;
        case 'KeyD':
        this.tank.turnRight = true;
        break;
        case 'Space':
        this.tank.fire();
        this.socket.emit('fire');
        break;
      }
    });

    window.addEventListener('keyup',(e)=>{
      switch(e.code){
        case 'KeyW':
        this.tank.moveForward = false;
        break;
        case 'KeyS':
        this.tank.moveBackward = false;
        break;
        case 'KeyA':
        this.tank.turnLeft = false;
        break;
        case 'KeyD':
        this.tank.turnRight = false;
        break;
      }
    });

    window.addEventListener('click',(e)=>{
      this.tank.fire();
      this.socket.emit('fire');
    });

  }

  checkCollision(){

    //check tank bullets collisions
    for(let i = this.tank.bullets.length-1; i>=0; i--){
      let bullet = this.tank.bullets[i];

      //out of bounds
      if(bullet.position.x > CONSTANTS.WORLD_SIZE || bullet.position.x < -CONSTANTS.WORLD_SIZE || bullet.position.z > CONSTANTS.WORLD_SIZE || bullet.position.z < -CONSTANTS.WORLD_SIZE){
        this.scene.remove(bullet);
        this.tank.bullets.splice(i,1);
        continue;
      }

      //collision with other tanks
      for(let prop in this.tanks){
        if(prop == this.socket.id) continue;
        let tank = this.tanks[prop];

        let circleDistX = Math.abs(bullet.position.x - tank.body.position.x);
        let circleDistZ =Math.abs(bullet.position.z - tank.body.position.z);

        //false
        if(circleDistX > (CONSTANTS.TANK_SIZE_X/2 + CONSTANTS.BULLET_RADIUS) ||
        circleDistZ > (CONSTANTS.TANK_SIZE_Z/2 + CONSTANTS.BULLET_RADIUS)) {
          continue;
        }

        let cornerDistance_sq = Math.pow(circleDistX - CONSTANTS.TANK_SIZE_X/2,2) +
        Math.pow(circleDistZ - CONSTANTS.TANK_SIZE_Z/2,2);

        //true
        if(cornerDistance_sq <= (CONSTANTS.BULLET_RADIUS) || circleDistX <= (CONSTANTS.TANK_SIZE_X/2) ||
        circleDistZ <= (CONSTANTS.TANK_SIZE_Z/2)){
          this.scene.remove(bullet);
          this.tank.bullets.splice(i,1);
          this.socket.emit('hit',prop);
          break;
        }
      }
    }

    //check other tanks bullets collisions
    for(let j=0;j<this.tanks.length;j++){
      let tank = this.tanks[j];
      //out of bounds
      for(let i = tank.bullets.length-1; i>=0; i--){
        let bullet = tank.bullets[i];
        if(bullet.position.x > CONSTANTS.WORLD_SIZE || bullet.position.x < -CONSTANTS.WORLD_SIZE || bbullet.position.z > CONSTANTS.WORLD_SIZE || bullet.position.z < -CONSTANTS.WORLD_SIZE){
          this.scene.remove(bullet);
          tank.bullets.splice(i,1);
        }
      }
    }

    //tank bounds
    if(this.tank.body.position.x > CONSTANTS.WORLD_SIZE){
      this.tank.body.position.x = CONSTANTS.WORLD_SIZE;
    }else if(this.tank.body.position.x < -CONSTANTS.WORLD_SIZE){
      this.tank.body.position.x = -CONSTANTS.WORLD_SIZE;
    }

    if(this.tank.body.position.z > CONSTANTS.WORLD_SIZE){
      this.tank.body.position.z = CONSTANTS.WORLD_SIZE;
    }else if(this.tank.body.position.z < -CONSTANTS.WORLD_SIZE){
      this.tank.body.position.z = -CONSTANTS.WORLD_SIZE;
    }

  }

  animate(){
    requestAnimationFrame(()=>{
      this.animate();
    });

    this.tank.update();
    this.tank.updateBullets();

    //update tanks bullets
    for(var prop in this.tanks){
      if(prop === this.socket.id) continue;
      let tank = this.tanks[prop];
      tank.updateBullets();
    }

    this.checkCollision();

    //camera lock on tank
    this.camera.position.z = this.tank.body.position.z + 30;
    this.camera.position.x = this.tank.body.position.x;
    this.camera.lookAt(this.tank.body.position);

    //render scene
    this.renderer.render(this.scene,this.camera);

    this.socket.emit('update',this.tank.toObject());
  }

}
