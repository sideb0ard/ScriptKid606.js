'use strict';

import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

let context; // = new AudioContext;

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

//const geometry = new THREE.SphereGeometry(15, 32, 16);
//const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
//const sphere = new THREE.Mesh( geometry, material );
//scene.add( sphere );

const geometry = new THREE.SphereGeometry( 15, 32, 16 );
//const material = new THREE.MeshBasicMaterial( { color: 0xffff00 } );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 , wireframe: true } );
const sphere = new THREE.Mesh( geometry, material );
scene.add( sphere );

// const geometry = new THREE.BoxGeometry();
// const cube = new THREE.Mesh( geometry, material );
// scene.add( cube );


camera.position.z = 35;

function animate() {
  requestAnimationFrame( animate );
  sphere.rotation.x += 0.001;
  sphere.rotation.y += 0.001;
  renderer.render( scene, camera );
  //console.log("YUP YUP");
}
animate();


class SoundGenerator {

  constructor() {
    if (!context) {
      context = new AudioContext;
    }
    this.notes = [];
  }

  start(freq) {
    var osc = context.createOscillator();
    osc.frequency.value = freq;
    osc.connect(context.destination);
    osc.start(0);
    this.notes.push(osc);
  }

  stop() {
    this.notes.forEach( osc => { osc.stop(); })
    this.notes = [];
  }


}
