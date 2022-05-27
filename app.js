'use strict';

import * as THREE from 'three';
import TrackballControls from 'three-trackballcontrols';
import { GUI } from 'dat.gui';
import { SoundGenerator} from "./js/soundgenerator.js";


export let scene, camera, renderer, sg, point, incr;

function initTrackballControls(camera, renderer) {
  var trackballControls = new TrackballControls(camera, renderer.domElement);
  trackballControls.rotateSpeed = 1.0;
  trackballControls.zoomSpeed = 1.2;
  trackballControls.panSpeed = 0.8;
  trackballControls.noZoom = false;
  trackballControls.noPan = false;
  trackballControls.staticMoving = true;
  trackballControls.dynamicDampingFactor = 0.3;
  trackballControls.keys = [65, 83, 68];

  return trackballControls;
}

function redrawScene(gui, scene, controls) {
  var selectedObject = scene.getObjectByName("circc");
  scene.remove( selectedObject );

  const geometry = new THREE.CircleGeometry( controls.radius, controls.segments );
  const material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );
  const circle = new THREE.Mesh( geometry, material );
  circle.name = "circc";
  scene.add( circle );

  const geometryp = new THREE.CircleGeometry(  0.5, controls.segments );
  const materialp = new THREE.MeshBasicMaterial( { color: 0xff00ff } );
  const point = new THREE.Mesh( geometryp, materialp );
  point.position.set(Math.cos(controls.angle)*controls.radius, Math.sin(controls.angle)*controls.radius, 0);
  point.name = "pointtt";
  scene.add( point );

}

function init() {

  sg = new SoundGenerator();
  //sg.noteOn(261);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 75,
    window.innerWidth / window.innerHeight, 0.1, 1000 );

  renderer = new THREE.WebGLRenderer();
  renderer.setClearColor(new THREE.Color(0x000000));
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.shadowMap.enabled = true;

  //camera.position.x = 10;
  camera.position.y = -1;
  camera.position.z = 40;

  var ambientLight = new THREE.AmbientLight(0x3c3c3c);
  scene.add(ambientLight);

  //const geometry = new THREE.CircleGeometry( 15, 12 );
  //const material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );
  //const circle = new THREE.Mesh( geometry, material );
  //scene.add( circle );

  //const geometry = new THREE.SphereGeometry( 15, 32, 16 );
  //const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 , wireframe: true } );
  //const sphere = new THREE.Mesh( geometry, material );
  //scene.add( sphere );

  var controls = new function () {
    this.radius = 16;
    this.segments = 12;
    this.color = 16;
    this.bpm = 96;
    this.angle = 0;
    this.freq = 60 / this.bpm * 4;
    this.incr = Math.PI * 2 / this.freq;
    //this.sphere_speed_x = 0.001;
    //this.sphere_speed_y = 0.001;
    //this.sphere_speed_z = 0.001;
    //this.lfo_speed = 4;
    this.redraw = function () {
      redrawScene(gui, scene, controls);
    }
  }

  const gui = new GUI();
  gui.add(controls, 'bpm', 20, 140).onChange(controls.redraw);
  gui.add(controls, 'radius', 0, 40).onChange(controls.redraw);
  gui.add(controls, 'segments', 0, 40).onChange(controls.redraw);
  //gui.add(controls, 'sphere_speed_x', -0.05, 0.05).name('Sphere.X');
  //gui.add(controls, 'sphere_speed_y', -0.05, 0.05).name('Sphere.Y');
  //gui.add(controls, 'sphere_speed_z', -0.05, 0.05).name('Sphere.Z');
  //gui.add(sg, 'toggle');
  //let lfo_gui = gui.add(controls, 'lfo_speed', 0.02, 20).name('LFO');

  //lfo_gui.onChange(function(value) {
  //  sg.publish("lfo_freq", value);
  //  controls.sphere_speed_y *= value;
  //});

  controls.redraw();
  document.body.appendChild( renderer.domElement );

  var trackballControls = initTrackballControls(camera, renderer);
  var clock = new THREE.Clock();

  //const sg1 = new SoundGenerator();
  //sg1.start(261);

  function animate() {

    trackballControls.update(clock.getDelta());
    //sphere.rotation.x += controls.sphere_speed_x;
    ////console.log("ROTX:", sphere.rotation.x % 1);
    //sphere.rotation.y += controls.sphere_speed_y;
    //sphere.rotation.z += controls.sphere_speed_z;

    controls.angle += controls.incr
    if (controls.angle > Math.PI * 2) {
      controls.angle -= Math.PI * 2;
    }
    console.log("ANGL:", controls.angle);
    controls.redraw();

    requestAnimationFrame( animate );
    renderer.render( scene, camera );
  }
  animate();
}

init();

window.addEventListener('resize', function()
  {
    var width = window.innerWidth;
    var height = window.innerHeight;
    renderer.setSize( width, height );
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  } );
