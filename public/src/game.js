import Tank from './tank.js';

export default class Game {

  constructor(wrapper){
    this.wrapper = wrapper;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
    this.renderer = new THREE.WebGLRenderer();

    this.camera.position.y = 100;

    this.tank = new Tank(this.scene);
    this.tank.body.position.y = 1.5;

    // A hemisphere light is a gradient colored light;
    // the first parameter is the sky color, the second parameter is the ground color,
    // the third parameter is the intensity of the light
    var hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)

    // A directional light shines from a specific direction.
    // It acts like the sun, that means that all the rays produced are parallel.
    var shadowLight = new THREE.DirectionalLight(0xffffff, .9);

    // Set the direction of the light
    shadowLight.position.set(150, 350, 350);

    // to activate the lights, just add them to the scene
    this.scene.add(hemisphereLight);
    this.scene.add(shadowLight);

    this.initListeners();

    //add ground
    var geometry = new THREE.PlaneGeometry(500,500);
    var material = new THREE.MeshBasicMaterial( {color: 'white', side: THREE.DoubleSide} );
    var ground = new THREE.Mesh( geometry, material );
    ground.rotation.x = 90*( Math.PI/180);
    this.scene.add(ground);

    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.wrapper.clientWidth, this.wrapper.clientHeight);
    this.wrapper.appendChild(this.renderer.domElement);

    this.animate();
  }

  animate(){
    requestAnimationFrame(()=>{
      this.animate();
    });

    this.tank.update();

    this.checkBounds();

    //camera lock on tank
    this.camera.position.z = this.tank.body.position.z+30;
    this.camera.position.x = this.tank.body.position.x;
    this.camera.lookAt(this.tank.body.position);

    //render scene
    this.renderer.render(this.scene,this.camera);

  }

  checkBounds(){

    //bullet out of bounds
    for(let i = this.tank.bullets.length-1; i>=0; i--){
      let bullet = this.tank.bullets[i];
      if(bullet.position.x > 250 || bullet.position.x < -250
        || bullet.position.z > 250 || bullet.position.z < -250){
          this.scene.remove(bullet);
          this.tank.bullets.splice(i,1);
        }
      }

    //tank bounds
    if(this.tank.body.position.x > 250){
      this.tank.body.position.x = 250;
    }else if(this.tank.body.position.x < -250){
      this.tank.body.position.x = -250;
    }

    if(this.tank.body.position.z > 250){
      this.tank.body.position.z = 250;
    }else if(this.tank.body.position.z < -250){
      this.tank.body.position.z = -250;
    }

  }

  initListeners(){

    window.addEventListener('keydown',(e)=>{
        switch(e.key){
          case 'w':
          this.tank.moveForward = true;
          break;
          case 's':
          this.tank.moveBackward = true;
          break;
          case 'a':
          this.tank.turnLeft = true;
          break;
          case 'd':
          this.tank.turnRight = true;
          break;
        }
        //console.log(this.tank.body.position);
      });

    window.addEventListener('keyup',(e)=>{
        switch(e.key){
          case 'w':
          this.tank.moveForward = false;
          break;
          case 's':
          this.tank.moveBackward = false;
          break;
          case 'a':
          this.tank.turnLeft = false;
          break;
          case 'd':
          this.tank.turnRight = false;
          break;
        }
      });

      window.addEventListener('click',(e)=>{
        this.tank.fire();
      });

  }

}
