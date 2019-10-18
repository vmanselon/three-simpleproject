import * as THREE from './three/build/three.module.js'
import Stats from './three/examples/jsm/libs/stats.module.js'
import dat from './three/examples/jsm/libs/dat.gui.module.js'
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js'
import {EffectComposer} from './three/examples/jsm/postprocessing/EffectComposer.js'
import {RenderPass} from './three/examples/jsm/postprocessing/RenderPass.js'
import TWEEN from './tween/src/Tween.js'

// classes
import {Camera3D, Spline3D, Geometry3D, Ligth3D, ParticlesPlane3D} from './src/standardObjects.js';


// scene
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
renderer.setSize( window.innerWidth, window.innerHeight )
renderer.setClearColor(0x000000, 0.0)
scene.fog = new THREE.FogExp2(0x193c6d, 0.0115)
document.getElementById('webgl').appendChild(renderer.domElement)

// helpers
let stats = new Stats()
document.body.appendChild(stats.domElement)
let showHelps = false
if(showHelps){
	let gridHelper = new THREE.GridHelper( 50, 50 )
	scene.add( gridHelper )
	let axesHelper = new THREE.AxesHelper( 5 )
	scene.add( axesHelper )
}

// camera
let mainCamera_01 = new Camera3D( "mainCamera_01", 75, window.innerWidth/window.innerHeight, 0.1, 1000, 1, 18 )
mainCamera_01.camera.setLens( 15, mainCamera_01.camera.frameHeight, 5.6, mainCamera_01.camera.coc )
mainCamera_01.camera.position.y = 3
mainCamera_01.camera.position.z = 25
mainCamera_01.camera.rotation.x = -Math.PI/24

// let curvePoints = new THREE.CatmullRomCurve3( [
// 	new THREE.Vector3( -10, 0, 10 ),
// 	new THREE.Vector3( -5, 5, 5 ),
// 	new THREE.Vector3( 0, 0, 5 ),
// 	new THREE.Vector3( 5, -5, 5 ),
// 	new THREE.Vector3( 10, 0, 10 )
// ] )
// let spliceCam_01 = new Spline3D('spliceCam_01', curvePoints)
// spliceCam_01.line = spliceCam_01.drawLine(50, 'rgb(255,0,0)')
// spliceCam_01.line.material.visible = false
// scene.add(spliceCam_01.line)
// mainCamera_01.tweenSlicePosition(
// 	spliceCam_01.pointsArray, // spline points
// 	new THREE.Vector3(0,0,0), // target camera point
// 	15000, // duration
// 	TWEEN.Easing.Quadratic.InOut,  //ease
// 	0, // delay
// 	Infinity, // repeat
// 	true) // yoyo
// mainCamera_01.tween.start()

// postprocessing
const composer = new EffectComposer(renderer)
let renderScene = new RenderPass( scene, mainCamera_01.camera )
composer.addPass(renderScene)

// ligths
let spotLight_01 = new Ligth3D('spotLight_01', 'spotLight', 1.5, 'rgb(255,100,50)', true )
spotLight_01.mesh = spotLight_01.instanciateLigth()
spotLight_01.mesh.position.set(2,2,0)
//scene.add(spotLight_01.mesh)
let pointLight_01 = new Ligth3D('pointLight_01', 'pointLight', 3, 'rgb(120,120,255)', true )
pointLight_01.mesh = pointLight_01.instanciateLigth()
pointLight_01.mesh.position.set(-4,1,2)
//scene.add(pointLight_01.mesh)
let directionalLight = new Ligth3D('directionalLight', 'directionalLight', 1, 'rgb(255,255,255)', true )
directionalLight.mesh = directionalLight.instanciateLigth()
directionalLight.mesh.position.set(2,5,2)
//scene.add(directionalLight.mesh)

// objects
let sphere_01 = new Geometry3D('sphere_01', 'sphere')
sphere_01.mesh = sphere_01.drawObject(1, 32, 'rgb(120,120,120)')
// scene.add(sphere_01.mesh)
// sphere_01.tweenPosition(sphere_01.mesh.position, // orinal position
// 	new THREE.Vector3(0,3,0), // target position
// 	2000, //duration
// 	TWEEN.Easing.Quadratic.InOut, // ease
// 	0, // delay
// 	Infinity, // repeat
// 	true) // yoyo
// sphere_01.tween.start()

// particles plane
let particleContainer = new ParticlesPlane3D('particle_wave', // name
	60, // amount
	1.5,  // seperation
	0.5, // amplitude position
	1.2, // amplitude scale
	0.09, // amplitudeSpeed
	0.1, // direction speed
	0.8) // direction speed max)
particleContainer.particles = particleContainer.draw( 0.008, 0xffffff )
particleContainer.followPlane()
scene.add(particleContainer.particles)

// controls
//let controls = new OrbitControls( mainCamera_01.camera, renderer.domElement )
//controls.autoRotate = true

// eventListener
window.addEventListener('resize', onWindowResize, false)
document.addEventListener('mousemove', onMouseMove, true)
document.addEventListener( 'mousewheel', onMouseWheel, true )
document.addEventListener( 'mouseup', onMouseUp, true )

// GUI
let gui = new dat.GUI()

let folder_wave = gui.addFolder('camera')
gui.add(mainCamera_01, 'mouseOrientation', 5, 20)

let folder_camera = gui.addFolder('wave animation')
gui.add(particleContainer, 'amplitudePosition', 0.1, 2)
gui.add(particleContainer, 'amplitudeSpeed', 0.01, 0.5)
gui.add(particleContainer, 'dirSpeed', 0.1, 1)

let folder_bloom = gui.addFolder('bloom effect')

// animate
let animate = function () {
	requestAnimationFrame( animate )
	//renderer.render( scene, mainCamera_01.camera )
	composer.render();
  stats.update()
	TWEEN.update()
	gui.updateDisplay()

	if(particleContainer.isPlaying) particleContainer.update()

}

animate()

// events listener functions
function onWindowResize() {
	if(!mainCamera_01.isControlable || !particleContainer.isPlaying) return
  mainCamera_01.camera.aspect = window.innerWidth / window.innerHeight;
  mainCamera_01.camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
	if(!mainCamera_01.isControlable || !particleContainer.isPlaying) return
	mainCamera_01.camera.rotation.y = (event.clientX / window.innerWidth - 0.5) / -mainCamera_01.mouseOrientation
	mainCamera_01.camera.rotation.x = (event.clientY / window.innerHeight-0.5) / -mainCamera_01.mouseOrientation -Math.PI/24
}

function onMouseWheel(event) {
	if(particleContainer.dirSpeed < particleContainer.dirSpeedMax)
		particleContainer.dirSpeed += particleContainer.dirSpeed/5
}

function onMouseUp(event) {
	particleContainer.isPlaying = !particleContainer.isPlaying
	if (particleContainer.isPlaying) particleContainer.followPlane()
	else particleContainer.followShape()
}
