import * as THREE from 'three';
import Tank from './Tank';
import Airplane from './Airplane';
import * as CONSTANTS from './constants.js';

export default class Game {
  constructor(socket, wrapper) {
    this.socket = socket;
    this.wrapper = wrapper;
    this.tanks = {};
    this.display = document.getElementById('display');
    this.initGame();
  }

  start(name) {
    this.tank.name = name;
    this.initListeners();
    this.initSocket();
    this.socket.emit('enter', this.tank.toObject());
    this.animate();
  }

  initSocket() {
    // constant update of other tanks
    this.socket.on('update', (tanks) => {
      Object.keys(tanks).forEach((prop) => {
        if (prop !== this.socket.id) {
          const tank = this.tanks[prop];
          if (tank) {
            // update tank
            tank.body.position.copy(tanks[prop].position);
            tank.body.rotation.copy(tanks[prop].rotation);
          } else {
            // create new tank
            const newT = new Tank(this.scene, CONSTANTS.TANKS_COLORS, tanks[prop].name);
            newT.body.position.copy(tanks[prop].position);
            if (prop.length < 2) newT.moveForward = true;
            newT.body.rotation.copy(tanks[prop].rotation);
            this.tanks[prop] = newT;
            this.appendMsg(`${tanks[prop].name} has entered`);
          }
        }
      });

      // remove non existing tanks
      Object.keys(this.tanks).forEach((prop) => {
        const tank = tanks[prop];
        if (!tank) {
          this.appendMsg(`${this.tanks[prop].name} has left`);
          this.tanks[prop].destroy();
          delete this.tanks[prop];
        }
      });
    });

    this.socket.on('hit', () => {
      this.tank.restart();
    });

    this.socket.on('msg', (msg) => {
      this.appendMsg(msg);
    });

    this.socket.on('fire', (id) => {
      const tank = this.tanks[id];
      if (tank) tank.fire();
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

    this.camera.position.y = this.wrapper.clientHeight * 0.6;
    this.airplane = new Airplane();
    this.scene.add(this.airplane.mesh);
    this.tank = new Tank(this.scene, CONSTANTS.TANK_COLORS, this.name);

    const positionX = Math.floor(Math.random() * CONSTANTS.WORLD_SIZE * 2) - CONSTANTS.WORLD_SIZE;
    const positionZ = Math.floor(Math.random() * CONSTANTS.WORLD_SIZE * 2) - CONSTANTS.WORLD_SIZE;

    this.tank.body.position.y = 1.5;
    this.tank.body.position.x = positionX;
    this.tank.body.position.z = positionZ;

    // A hemisphere light is a gradient colored light;
    const hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9);

    // A directional light shines from a specific direction.
    const shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);

    // Set the direction of the light
    shadowLight.position.set(150, 350, 350);

    this.scene.add(hemisphereLight);
    this.scene.add(shadowLight);

    // add ground
    const geometry = new THREE.PlaneGeometry(CONSTANTS.WORLD_SIZE * 2, CONSTANTS.WORLD_SIZE * 2);
    const material = new THREE.MeshBasicMaterial({ color: 'white', side: THREE.DoubleSide });
    const ground = new THREE.Mesh(geometry, material);
    ground.rotation.x = 90 * (Math.PI / 180);
    this.scene.add(ground);

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.wrapper.clientWidth, this.wrapper.clientHeight);
    this.wrapper.appendChild(this.renderer.domElement);
  }

  initListeners() {
    window.addEventListener('keydown', (e) => {
      switch (e.code) {
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
      }
    });

    window.addEventListener('keyup', (e) => {
      switch (e.code) {
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

    window.addEventListener('click', () => {
      this.tank.fire();
      this.socket.emit('fire');
    });
  }

  checkCollision() {
    // check tank bullets collisions
    for (let i = this.tank.bullets.length - 1; i >= 0; i--) {
      const bullet = this.tank.bullets[i];

      // out of bounds
      if (bullet.position.x > CONSTANTS.WORLD_SIZE || bullet.position.x < -CONSTANTS.WORLD_SIZE ||
        bullet.position.z > CONSTANTS.WORLD_SIZE || bullet.position.z < -CONSTANTS.WORLD_SIZE) {
        this.scene.remove(bullet);
        this.tank.bullets.splice(i, 1);
      } else {
        // collision with other tanks
        Object.keys(this.tanks).forEach((prop) => {
          if (prop !== this.socket.id) {
            const tank = this.tanks[prop];

            if (this.collision(bullet, tank.body)) {
              this.scene.remove(bullet);
              this.tank.bullets.splice(i, 1);
              this.socket.emit('hit', prop);
            }
          }
        });
      }
    }

    // check other tanks bullets collisions
    Object.keys(this.tanks).forEach((prop) => {
      const tank = this.tanks[prop];
      // out of bounds
      for (let j = tank.bullets.length - 1; j >= 0; j--) {
        const bullet = tank.bullets[j];

        if (bullet.position.x > CONSTANTS.WORLD_SIZE || bullet.position.x < -CONSTANTS.WORLD_SIZE
            || bullet.position.z > CONSTANTS.WORLD_SIZE || bullet.position.z < -CONSTANTS.WORLD_SIZE) {
          this.scene.remove(bullet);
          tank.bullets.splice(j, 1);
        } else if (prop < 5 && this.collision(bullet, this.tank.body)) {
          // check bots bullets with player tank
          this.scene.remove(bullet);
          tank.bullets.splice(j, 1);
          this.socket.emit('bothit', prop);
          break;
        }
      }
    });

    // tank bounds
    if (this.tank.body.position.x > CONSTANTS.WORLD_SIZE) {
      this.tank.body.position.x = CONSTANTS.WORLD_SIZE;
    } else if (this.tank.body.position.x < -CONSTANTS.WORLD_SIZE) {
      this.tank.body.position.x = -CONSTANTS.WORLD_SIZE;
    }

    if (this.tank.body.position.z > CONSTANTS.WORLD_SIZE) {
      this.tank.body.position.z = CONSTANTS.WORLD_SIZE;
    } else if (this.tank.body.position.z < -CONSTANTS.WORLD_SIZE) {
      this.tank.body.position.z = -CONSTANTS.WORLD_SIZE;
    }
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

    this.tank.update();
    this.tank.updateBullets();

    // update tanks bullets
    Object.keys(this.tanks).forEach((prop) => {
      if (prop !== this.socket.id) {
        const tank = this.tanks[prop];
        tank.updateBullets();
      }
    });

    this.checkCollision();

    // camera lock on tank
    this.camera.position.z = this.tank.body.position.z;
    this.camera.position.x = this.tank.body.position.x;
    this.camera.lookAt(this.tank.body.position);

    // render scene
    this.renderer.render(this.scene, this.camera);

    this.socket.emit('update', this.tank.toObject());
  }
}
