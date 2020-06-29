import * as THREE from "./three.module.js";
import { GLTFLoader } from './GLTFLoader.js';
import { OrbitControls } from './OrbitControls.js';
import { GUI } from './dat.gui.module.js';

const BASE_LENGTH = 0.834
const BASE_WIDTH = 0.167
const BASE_HEIGHT = 0.05
const CUBE_SIZE = 0.0143
const MAX_HEIGHT = 0.14

let username = "jasonlong"
let year = "2018"
let json = {}

let camera, scene, renderer

var urlParams = new URLSearchParams(window.location.search);

if (urlParams.has('username')) {
  username = urlParams.get('username')
}

if (urlParams.has('year')) {
  year = urlParams.get('year')
}

// Import JSON data
async function loadJSON(username, year) {
  let url = `https://json-contributions.vercel.app/api/user?username=${username}&year=${year}`
  let response = await fetch(url)
  if (response.ok) {
    json = await response.json()
    init()
    render()
  } else {
    alert("HTTP-Error: " + response.status)
  }
}

loadJSON(username, year)

const init = () => {
  // SCENE
  scene = new THREE.Scene()

  // CAMERA
  camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 )

  // RENDERER
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio( window.devicePixelRatio )
  renderer.setSize( window.innerWidth, window.innerHeight )
  renderer.outputEncoding = THREE.sRGBEncoding
  renderer.setClearColor(0xffffff, 1)
  document.body.appendChild(renderer.domElement)

  // MATERIALS
  let phongMaterial = new THREE.MeshPhongMaterial( { color: 0x40c463, transparent: true, opacity: 0.2, side: THREE.DoubleSide } )
  let bronzeMaterial = new THREE.MeshPhysicalMaterial( { color: 0x645f61, metalness: 1, clearcoat: 0.5, clearcoatRoughness: 0.5, side: THREE.DoubleSide } )

  // LIGHTS
  const dLight1 = new THREE.DirectionalLight(0xebeb8c, 0.8)
  dLight1.position.set(-2, -5, 5);
  dLight1.target.position.set(0, 0, 0);
  const dLight2 = new THREE.DirectionalLight(0xebeb8c, 0.8)
  dLight2.position.set(2, -5, 5);
  dLight2.target.position.set(0, 0, 0);

  scene.add(dLight1)
  scene.add(dLight2)

  // LOAD REFERENCE MODEL
  let loader = new GLTFLoader().setPath('../models/')
  loader.load('ashtom-orig.glb', function (gltf) {
    gltf.scene.traverse(function (child) {
      if (child.isMesh) {
        child.material = phongMaterial
        child.material.depthWrite = !child.material.transparent
      }
    })

    gltf.scene.rotation.x = Math.PI/2
    gltf.scene.rotation.y = -Math.PI
    
    // let worldAxis = new THREE.AxesHelper(2);
    // scene.add(worldAxis)
    render()
  })

  // BASE GEOMETRY
  let baseLoader = new GLTFLoader().setPath('../models/')
  baseLoader.load('base.glb', function (base) {
    base.scene.traverse(function (child) {
      if (child.isMesh) {
        child.material = bronzeMaterial
        child.material.depthWrite = !child.material.transparent
      }
    })

    base.scene.rotation.x = -Math.PI/2
    base.scene.rotation.z = -Math.PI
    scene.add(base.scene)
  })

  // CONTRIBUTION BARS
  let barGroup = new THREE.Group()
  let maxCount = json.max
  let x = 0
  let y = 0
  json.contributions.forEach(week => {
    y = (CUBE_SIZE * 7) 
    week.days.forEach(day => {
      console.log(day.date)
      console.log(day.count)
      y -= CUBE_SIZE
      let height = (MAX_HEIGHT / maxCount * day.count).toFixed(4)
      // console.log(height)
      let geometry = new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, height)
      let cube = new THREE.Mesh(geometry, bronzeMaterial)
      cube.position.x = x
      cube.position.y = y
      cube.position.z = BASE_HEIGHT / 2 + height / 2
      barGroup.add(cube)
    })
    x += CUBE_SIZE
  })
  const groupBox = new THREE.Box3().setFromObject(barGroup)
  const groupCenter = groupBox.getCenter(new THREE.Vector3())
  barGroup.position.x -= groupCenter.x
  barGroup.position.y -= groupCenter.y 
  scene.add(barGroup)

  const box = new THREE.Box3().setFromObject(scene)
  const center = box.getCenter(new THREE.Vector3())
  camera.lookAt(center)
  camera.position.y = -0.4
  camera.position.z = 0.3

  let controls = new OrbitControls(camera, renderer.domElement)
  controls.autoRotate = false
  controls.screenSpacePanning = true
  controls.addEventListener('change', render);
}

const render = () => {
  renderer.render(scene, camera)
}

//
// Event listeners
//
const onWindowResize = () => {
  let canvasWidth = window.innerWidth;
  let canvasHeight = window.innerHeight;
  renderer.setSize( canvasWidth, canvasHeight );
  camera.aspect = canvasWidth / canvasHeight;
  camera.updateProjectionMatrix();
  render()
}

window.addEventListener('resize', onWindowResize, false)
