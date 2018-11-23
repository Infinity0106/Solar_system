import * as THREE from "three";
export function constructPlanet(
  orbitRate,
  rotationRate,
  distanceFromAxis,
  name,
  texture,
  size,
  segments
) {
  return {
    orbitRate,
    rotationRate,
    distanceFromAxis,
    name,
    texture,
    size,
    segments
  };
}

export function getRing(
  size,
  innerDiameter,
  facets,
  color,
  name,
  distance,
  torus = false,
  scene
) {
  let ringGeometry = torus
    ? new THREE.TorusGeometry(size, innerDiameter, facets)
    : new THREE.RingGeometry(size, innerDiameter, facets);
  let ringMaterial = new THREE.MeshBasicMaterial({
    color,
    side: THREE.DoubleSide
  });
  let myRing = new THREE.Mesh(ringGeometry, ringMaterial);

  myRing.name = name;
  myRing.position.set(distance, 0, 0);
  myRing.rotateX(Math.PI / 2);
  scene.add(myRing);
  return myRing;
}

export function getMaterial(type, color, map) {
  let matOpts = {
    color: color === undefined ? "rgb(255,255,255)" : color,
    map: map === undefined ? null : map
  };

  switch (type) {
    case "basic":
      return new THREE.MeshBasicMaterial(matOpts);
    case "lambert":
      return new THREE.MeshLambertMaterial(matOpts);
    case "phong":
      return new THREE.MeshPhongMaterial(matOpts);
    case "standard":
      return new THREE.MeshStandardMaterial(matOpts);
    default:
      return new THREE.MeshBasicMaterial(matOpts);
  }
}

export function createVisibleOrbit(earthData, scene) {
  let orbitWidth = 0.01;
  return getRing(
    earthData.distanceFromAxis + orbitWidth,
    earthData.distanceFromAxis - orbitWidth,
    320,
    0xffffff,
    "earthOrbit",
    0,
    false,
    scene
  );
}

export function getSphere(mat, size, segments) {
  let geometry = new THREE.SphereGeometry(size, segments, segments);
  let obj = new THREE.Mesh(geometry, mat);
  obj.castShadow = true;

  return obj;
}

export function loadTexturedPlanet(myData, x, y, z, myMatType, scene) {
  let myMat;
  let passThisText;

  if (myData.texture && myData.texture !== "") {
    passThisText = new THREE.ImageUtils.loadTexture(myData.texture);
  }
  if (myMatType) {
    myMat = getMaterial(myMatType, "rgb(255,255,255)", passThisText);
  } else {
    myMat = getMaterial("lambert", "rgb(255,255,255)", passThisText);
  }

  myMat.receiveShadow = true;
  myMat.castShadow = true;
  let myPlanet = getSphere(myMat, myData.size, myData.segments);
  myPlanet.receiveShadow = true;
  myPlanet.name = myData.name;
  scene.add(myPlanet);
  myPlanet.position.set(x, y, z);

  return myPlanet;
}

export function getPointLight(intensity, color) {
  let light = new THREE.PointLight(color, intensity);
  light.castShadow = true;

  light.shadow.bias = 0.001;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;

  return light;
}

export function movePlanet(myPlanet, myData, myTime, stopRotation, orbitData) {
  if (orbitData.runRotation && !stopRotation) {
    myPlanet.rotation.y += myData.rotationRate;
  }
  if (orbitData.runOrbit) {
    myPlanet.position.x = Math.cos(
      myTime *
        (1 / (myData.orbitRate * orbitData.value) + 10) *
        myData.distanceFromAxis
    );
    myPlanet.position.z = Math.sin(
      myTime *
        (1 / (myData.orbitRate * orbitData.value) + 10) *
        myData.distanceFromAxis
    );
  }
}

export function moveMoon(
  myMoon,
  myPlanet,
  myData,
  myTime,
  stopRotation,
  orbitData
) {
  movePlanet(myMoon, myData, myTime, stopRotation, orbitData);
  if (orbitData.runOrbit) {
    myMoon.position.x = myMoon.position.x + myPlanet.position.x;
    myMoon.position.y = myMoon.position.y + myPlanet.position.y;
  }
}
