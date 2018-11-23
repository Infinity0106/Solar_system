import * as THREE from "three";
import {
  constructPlanet,
  getPointLight,
  getSphere,
  getMaterial,
  loadTexturedPlanet,
  getRing,
  createVisibleOrbit,
  movePlanet,
  moveMoon
} from "./planet";
import dat from "dat.gui";

let OrbitControls = require("three-orbit-controls")(THREE);

let pointLight,
  sun,
  moon,
  earth,
  earthOrbit,
  ring,
  controls,
  camera,
  renderer,
  scene;

let planetSegments = 48;
let earthData = constructPlanet(
  365.2564,
  0.015,
  25,
  "earth",
  "img/earth.jpg",
  1,
  planetSegments
);
let moonData = constructPlanet(
  29.5,
  0.01,
  2.8,
  "moon",
  "img/moon.jpg",
  0.5,
  planetSegments
);

let orbitData = { value: 200, runOrbit: true, runRotation: true };
let clock = new THREE.Clock();

camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
camera.position.x = 30;
camera.position.y = -30;
camera.position.z = 30;
camera.lookAt(new THREE.Vector3(0, 0, 0));

scene = new THREE.Scene();

renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

document.getElementById("webgl").appendChild(renderer.domElement);

controls = new OrbitControls(camera, renderer.domElement);

let path = "cubemap/";
let format = ".jpg";
let urls = [
  `${path}px${format}`,
  `${path}py${format}`,
  `${path}pz${format}`,
  `${path}nx${format}`,
  `${path}ny${format}`,
  `${path}nz${format}`
];

let reflectionCube = new THREE.CubeTextureLoader().load(urls);
reflectionCube.format = THREE.RGBFormat;

scene.background = reflectionCube;

pointLight = getPointLight(1.5, "rgb(255,200,180)");
scene.add(pointLight);

let ambientLight = new THREE.AmbientLight(0xaaaaaa);
scene.add(ambientLight);

let sunMaterial = getMaterial("basic", "rgb(255,255,255)");
sun = getSphere(sunMaterial, 16, 48);
scene.add(sun);

let spriteMaterial = new THREE.SpriteMaterial({
  map: new THREE.ImageUtils.loadTexture("img/glow.png"),
  useSceneCoordinates: false,
  color: 0xffffee,
  transparent: false,
  blending: THREE.AdditiveBlending
});
let sprite = new THREE.Sprite(spriteMaterial);
sprite.scale.set(70, 70, 1.0);
sun.add(sprite);

earth = loadTexturedPlanet(
  earthData,
  earthData.distanceFromAxis,
  0,
  0,
  null,
  scene
);
moon = loadTexturedPlanet(
  moonData,
  moonData.distanceFromAxis,
  0,
  0,
  null,
  scene
);
ring = getRing(
  1.8,
  0.05,
  480,
  0x757064,
  "ring",
  earthData.distanceFromAxis,
  true,
  scene
);

earthOrbit = createVisibleOrbit(earthData, scene);

let gui = new dat.GUI();
let folder1 = gui.addFolder("light");
folder1.add(pointLight, "intensity", 0, 10);
let folder2 = gui.addFolder("speed");
folder2.add(orbitData, "value", 0, 500);
folder2.add(orbitData, "runOrbit", 0, 1);
folder2.add(orbitData, "runRotation", 0, 1);

update(renderer, scene, camera, controls);

function update(renderer, scene, camera, controls) {
  pointLight.position.copy(sun.position);
  controls.update();

  let time = Date.now();

  movePlanet(earth, earthData, time, true, orbitData);
  movePlanet(ring, earthData, time, true, orbitData);
  moveMoon(moon, earth, moonData, time, true, orbitData);

  renderer.render(scene, camera);
  requestAnimationFrame(() => {
    update(renderer, scene, camera, controls);
  });
}
