import * as THREE from 'three';
import Airplane from './Airplane';
import * as CONSTANTS from './Constants';

function getRandomRange(min, max) {
  return Math.random() * (max - min) + min;
}

export default class Game {
  constructor(socket, wrapper) {
    this.socket = socket;
    this.wrapper = wrapper;
    this.airplanes = {};
    this.display = document.getElementById('display');
    this.initGame();
  }

  start(name) {
    this.initListeners();
    this.initSocket();
    // this.socket.emit('enter', this.airplane.toObject());
    this.animate();
  }

  initSocket() {
    // constant update of other airplanes
    this.socket.on('update', (airplanes) => {
      Object.keys(airplanes).forEach((prop) => {
        if (prop !== this.socket.id) {
          const airplane = this.airplanes[prop];
          if (airplane) {
            // update airplane
            airplane.mesh.position.copy(mesh[prop].position);
            airplane.mesh.rotation.copy(mesh[prop].rotation);
          } else {
            // create new airplane
            const newPlane = new Airplane();
            newPlane.mesh.position.copy(airplanes[prop].position);
            newPlane.mesh.rotation.copy(tanks[prop].rotation);
            this.airplanes[prop] = newPlane;
          }
        }
      });

      // remove non existing airplanes
      Object.keys(this.airplanes).forEach((prop) => {
        const plane = airplanes[prop];
        if (!plane) {
          this.airplanes[prop].destroy();
          delete this.airplanes[prop];
        }
      });
    });

    this.socket.on('hit', () => {
      // this.tank.restart();
    });

    this.socket.on('msg', (msg) => {
      this.appendMsg(msg);
    });

    this.socket.on('fire', (id) => {
      // const tank = this.tanks[id];
      // if (tank) tank.fire();
    });
  }

  appendMsg(msg) {
    const newMsg = document.createElement('div');
    newMsg.className = 'msg';
    newMsg.textContent = msg;
    this.display.appendChild(newMsg);
    this.display.scrollTop = this.display.scrollHeight;
  }

  initGame() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, this.wrapper.clientWidth / this.wrapper.clientHeight, 1, 1000);
    this.renderer = new THREE.WebGLRenderer();

    const positionX = getRandomRange(-CONSTANTS.WORLD_SIZE / 2, CONSTANTS.WORLD_SIZE / 2);
    const positionZ = getRandomRange(-CONSTANTS.WORLD_SIZE / 2, CONSTANTS.WORLD_SIZE / 2);
    this.airplane = new Airplane();
    this.scene.add(this.airplane.mesh);
    this.airplane.mesh.position.y = 1.5;
    this.airplane.mesh.position.x = positionX;
    this.airplane.mesh.position.z = positionZ;

    // A hemisphere light is a gradient colored light;
    const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9);

    // A directional light shines from a specific direction.
    const shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);

    // Set the direction of the light
    shadowLight.position.set(150, 350, 350);

    this.scene.add(hemisphereLight);
    this.scene.add(shadowLight);

    // add ground
    // const loader = new THREE.TextureLoader();
		// const groundTexture = loader.load('src/grasslight-big.jpg');
		// groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
		// groundTexture.repeat.set(25, 25);
		// groundTexture.anisotropy = 16;
		// const groundMaterial = new THREE.MeshLambertMaterial({ map: groundTexture });
		// const groundMesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(CONSTANTS.WORLD_SIZE, CONSTANTS.WORLD_SIZE), groundMaterial);
		// groundMesh.rotation.x = - Math.PI / 2;
		// groundMesh.receiveShadow = true;
    // console.log(groundMesh.position, positionX, positionZ);
		// this.scene.add(groundMesh);

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.wrapper.clientWidth, this.wrapper.clientHeight);
    this.wrapper.appendChild(this.renderer.domElement);
  }

  initListeners() {
    window.addEventListener('keydown', (e) => {
      switch (e.code) {
        case 'KeyW':
          this.airplane.rotateUp = true;
          break;
        case 'KeyS':
          this.airplane.rotateDown = true;
          break;
        case 'KeyA':
          this.airplane.rotateLeft = true;
          break;
        case 'KeyD':
          this.airplane.rotateRight = true;
          break;
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
        case 'KeyW':
          this.airplane.rotateUp = false;
          break;
        case 'KeyS':
          this.airplane.rotateDown = false;
          break;
        case 'KeyA':
          this.airplane.rotateLeft = false;
          break;
        case 'KeyD':
          this.airplane.rotateRight = false;
          break;
      }
    });

    window.addEventListener('click', () => {
      this.socket.emit('fire');
    });
  }

  checkCollision() {
    // check tank bullets collisions
    // for (let i = this.tank.bullets.length - 1; i >= 0; i--) {
    //   const bullet = this.tank.bullets[i];
    //
    //   // out of bounds
    //   if (bullet.position.x > CONSTANTS.WORLD_SIZE || bullet.position.x < -CONSTANTS.WORLD_SIZE ||
    //     bullet.position.z > CONSTANTS.WORLD_SIZE || bullet.position.z < -CONSTANTS.WORLD_SIZE) {
    //     this.scene.remove(bullet);
    //     this.tank.bullets.splice(i, 1);
    //   } else {
    //     // collision with other tanks
    //     Object.keys(this.tanks).forEach((prop) => {
    //       if (prop !== this.socket.id) {
    //         const tank = this.tanks[prop];
    //
    //         if (this.collision(bullet, tank.body)) {
    //           this.scene.remove(bullet);
    //           this.tank.bullets.splice(i, 1);
    //           this.socket.emit('hit', prop);
    //         }
    //       }
    //     });
    //   }
    // }

    // check other tanks bullets collisions
    // Object.keys(this.tanks).forEach((prop) => {
    //   const tank = this.tanks[prop];
    //   // out of bounds
    //   for (let j = tank.bullets.length - 1; j >= 0; j--) {
    //     const bullet = tank.bullets[j];
    //
    //     if (bullet.position.x > CONSTANTS.WORLD_SIZE || bullet.position.x < -CONSTANTS.WORLD_SIZE
    //         || bullet.position.z > CONSTANTS.WORLD_SIZE || bullet.position.z < -CONSTANTS.WORLD_SIZE) {
    //       this.scene.remove(bullet);
    //       tank.bullets.splice(j, 1);
    //     } else if (prop < 5 && this.collision(bullet, this.tank.body)) {
    //       // check bots bullets with player tank
    //       this.scene.remove(bullet);
    //       tank.bullets.splice(j, 1);
    //       this.socket.emit('bothit', prop);
    //       break;
    //     }
    //   }
    // });

    // tank bounds
    // if (this.tank.body.position.x > CONSTANTS.WORLD_SIZE) {
    //   this.tank.body.position.x = CONSTANTS.WORLD_SIZE;
    // } else if (this.tank.body.position.x < -CONSTANTS.WORLD_SIZE) {
    //   this.tank.body.position.x = -CONSTANTS.WORLD_SIZE;
    // }
    //
    // if (this.tank.body.position.z > CONSTANTS.WORLD_SIZE) {
    //   this.tank.body.position.z = CONSTANTS.WORLD_SIZE;
    // } else if (this.tank.body.position.z < -CONSTANTS.WORLD_SIZE) {
    //   this.tank.body.position.z = -CONSTANTS.WORLD_SIZE;
    // }
  }

  collision(a, b) {
    const circleDistX = Math.abs(a.position.x - b.position.x);
    const circleDistZ = Math.abs(a.position.z - b.position.z);

    // false
    if (circleDistX > (CONSTANTS.TANK_SIZE_X / 2 + CONSTANTS.BULLET_RADIUS) ||
        circleDistZ > (CONSTANTS.TANK_SIZE_Z / 2 + CONSTANTS.BULLET_RADIUS)) {
      return false;
    }

    const cornerDistanceSQ = Math.pow(circleDistX - CONSTANTS.TANK_SIZE_X / 2, 2) +
        Math.pow(circleDistZ - CONSTANTS.TANK_SIZE_Z / 2, 2);

    // true
    if (cornerDistanceSQ <= (CONSTANTS.BULLET_RADIUS) || circleDistX <= (CONSTANTS.TANK_SIZE_X / 2) ||
        circleDistZ <= (CONSTANTS.TANK_SIZE_Z / 2)) {
      return true;
    }
    return false;
  }

  animate() {
    requestAnimationFrame(() => {
      this.animate();
    });

    this.airplane.update();

    this.checkCollision();

    // camera lock on airplane
    this.camera.up.x = 1;
    this.camera.position.y = this.airplane.mesh.position.y + 100;
    this.camera.position.z = this.airplane.mesh.position.z;
    this.camera.position.x = this.airplane.mesh.position.x - 350;
    this.camera.lookAt(this.airplane.mesh.position);
    //this.airplane.mesh.translateX(1);
    // render scene
    this.renderer.render(this.scene, this.camera);

    // this.socket.emit('update', this.airplane.toObject());
  }
}
