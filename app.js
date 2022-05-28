'use strict';

import * as THREE from 'three';
import TrackballControls from 'three-trackballcontrols';
import { GUI } from 'dat.gui';
import { SoundGenerator} from "./js/soundgenerator.js";
import * as Tone from 'tone';

let lenz = ["8n", "16n", "16t", "32n", "64n"];
let lx = 0;

let notez = ["E2", "A2", "D2", "G2", "B2", "E2"];
let nx = 0;

export let scene, camera, renderer, sg, point, incr, is_play = false, audio_started = false, dclock;

window.addEventListener('resize', function()
  {
    var width = window.innerWidth;
    var height = window.innerHeight;
    renderer.setSize( width, height );
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  } );

//attach a click listener to a play button
document.getElementById('startButtonId')?.addEventListener('click', async () => {
  await Tone.start()
  console.log('audio is ready')
})

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

  var selectedObject;

  if (controls.circle) {
    scene.remove(controls.circle);
  }

  const geometry = new THREE.CircleGeometry( controls.radius, controls.segments );
  const material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true } );
  controls.circle = new THREE.Mesh( geometry, material );
  scene.add( controls.circle );


  if (controls.point) {
    scene.remove( controls.point );
  }

  const geometryp = new THREE.CircleGeometry(  0.5, controls.segments );
  const materialp = new THREE.MeshBasicMaterial( { color: 0xff00ff } );
  controls.point = new THREE.Mesh( geometryp, materialp );
  controls.point.position.set(Math.cos(controls.angle)*controls.radius, Math.sin(controls.angle)*controls.radius, 0);
  scene.add( controls.point );

  controls.incr = Math.PI * 2 / (60 / controls.bpm * 60);
}

function init() {

  //sg = new SoundGenerator();
  //sg.noteOn(261);

  const filter = new Tone.Filter(400, 'lowpass').toDestination();
  const feedbackDelay = new Tone.FeedbackDelay(0.125, 0.5).toDestination();

  const distortion = new Tone.Distortion(0.4).toDestination();
  const synth = new Tone.Synth();
  const fm =  new Tone.FMSynth();
  synth.connect(filter);
  synth.connect(feedbackDelay);

  fm.connect(distortion);
  fm.connect(feedbackDelay);

  const dsynth = new Tone.MembraneSynth().toDestination();

  is_play = false;

  var startButton = document.getElementById( 'startButtonId' );
  startButton.onclick = function StartAnimation() {
    if (is_play) {
      is_play = false;
      startButton.innerHTML = 'Play';
      Tone.Transport.stop();
      dclock.stop();
    } else {
      is_play = true;
      startButton.innerHTML = 'Stop';
      Tone.Transport.start();
      dclock.start();
    }
  }

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
    this.incr = Math.PI * 2 / (60 / this.bpm * 60);
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

  let step = 0;
  let step2 = 0;

  dclock = new Tone.Clock(time => {
    dsynth.triggerAttackRelease("C1", "2n");
  }, 60 / controls.bpm);

  function animate() {

    trackballControls.update(clock.getDelta());
    //sphere.rotation.x += controls.sphere_speed_x;
    ////console.log("ROTX:", sphere.rotation.x % 1);
    //sphere.rotation.y += controls.sphere_speed_y;
    //sphere.rotation.z += controls.sphere_speed_z;

    requestAnimationFrame( animate );
    renderer.render( scene, camera );

    controls.circle.rotation.y = step += 0.001;
    controls.circle.rotation.x = step;
    controls.circle.rotation.z = step;

    controls.point.rotation.y = step2 += 0.002;
    controls.point.rotation.x = step2;
    controls.circle.rotation.z = step2;

    controls.point.position.set(Math.cos(controls.angle)*controls.radius, Math.sin(controls.angle)*controls.radius, 0);

    if (is_play) {
      controls.angle += controls.incr

      if (controls.angle > Math.PI * 2) {
        controls.radius = Math.floor(Math.random() * 20) + 10;
        controls.segments = Math.floor(Math.random() * 40);
        controls.angle -= Math.PI * 2;

        let notee = notez[Math.floor(Math.random() * notez.length)];
        synth.triggerAttackRelease(notee, lenz[lx]);

        lx += 1;
        if (lx == lenz.length) {
          lx = 0;
        }
        const now = Tone.now()
        fm.triggerAttackRelease(notee, lenz[lx], now + (60 / controls.bpm));
        controls.redraw();
        dsynth.triggerAttackRelease("C1", "2n");
      }
    }

  }
  animate();
}
init();

