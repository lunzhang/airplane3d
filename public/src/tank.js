export default class Tank{

  constructor(scene){
    this.scene = scene;
    this.bullets = [];
    this.body = new THREE.Group();

    let geometry, material, mesh;

    //top body
    geometry = new THREE.BoxGeometry(3.5,1.5,3);
    material = new THREE.MeshPhongMaterial({color:'blue'});
    mesh = new THREE.Mesh(geometry, material);
    mesh.position.y = 1.5;
    this.body.add(mesh);

    //cannon
    geometry = new THREE.CylinderGeometry( .25, .25, 5, 20);
    material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    mesh = new THREE.Mesh( geometry, material );
    mesh.rotation.z = 100*( Math.PI/180);
    mesh.position.y = 1.5;
    mesh.position.x = 2;
    this.body.add(mesh);

    //bottom body
    geometry = new THREE.BoxGeometry(7,2,5);
    material = new THREE.MeshPhongMaterial({color:0xf25346});
    mesh = new THREE.Mesh(geometry, material);
    this.body.add(mesh);

    //left tire
    geometry = new THREE.CylinderGeometry( 1, 1, 6, 20);
    material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    mesh = new THREE.Mesh( geometry, material );
    mesh.rotation.z = 90*( Math.PI/180);
    mesh.position.z = -2.5;
    mesh.position.y = -.5;
    this.body.add(mesh);

    //right tire
    geometry = new THREE.CylinderGeometry( 1, 1, 6, 20);
    material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    mesh = new THREE.Mesh( geometry, material );
    mesh.rotation.z = 90*( Math.PI/180);
    mesh.position.z = 2.5;
    mesh.position.y = -.5;
    this.body.add(mesh);

    this.scene.add(this.body);
  }

  update(){

    if(this.moveForward){
      this.body.translateX(1);
    }else if(this.moveBackward){
      this.body.translateX(-1);
    }

    if(this.turnLeft){
      this.body.rotateY(.1);
    }else if(this.turnRight){
      this.body.rotateY(-.1);
    }

    for(let i = 0;i<this.bullets.length;i++){
        let bullet = this.bullets[i];
        bullet.translateX(5);
    }

  }

  fire(){
    let geometry = new THREE.SphereGeometry( 1, 32, 32 );
    let material = new THREE.MeshBasicMaterial( {color: 0x23190f} );
    let bullet = new THREE.Mesh( geometry, material );

    bullet.position.copy(this.body.position);
    bullet.position.y = 3;
    bullet.rotation.copy(this.body.rotation);

    this.bullets.push(bullet);
    this.scene.add(bullet);
  }
  
}
