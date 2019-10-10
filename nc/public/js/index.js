import * as THREE from './three/build/three.module.js'
import Stats from './three/examples/jsm/libs/stats.module.js'
import dat from './three/examples/jsm/libs/dat.gui.module.js'
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js'
import TWEEN from './tween/src/Tween.js'

// classes
import {Camera3D, Spline3D, Geometry3D, Ligth3D} from './class/standardObjects.js';

// scene
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer()
renderer.setSize( window.innerWidth, window.innerHeight )
document.getElementById('webgl').appendChild(renderer.domElement)

// helpers
let stats = new Stats()
document.body.appendChild(stats.domElement)
let gridHelper = new THREE.GridHelper( 50, 50 )
scene.add( gridHelper )
let axesHelper = new THREE.AxesHelper( 5 )
scene.add( axesHelper )

// camera
let mainCamera_01 = new Camera3D( "mainCamera_01", 75, window.innerWidth/window.innerHeight, 0.1, 1000, 1 )
mainCamera_01.camera.position.z = 5
let curvePoints = new THREE.CatmullRomCurve3( [
	new THREE.Vector3( -10, 0, 10 ),
	new THREE.Vector3( -5, 5, 5 ),
	new THREE.Vector3( 0, 0, 5 ),
	new THREE.Vector3( 5, -5, 5 ),
	new THREE.Vector3( 10, 0, 10 )
] )
let spliceCam_01 = new Spline3D('spliceCam_01', curvePoints)
spliceCam_01.line = spliceCam_01.drawLine(50, 'rgb(255,0,0)')
scene.add(spliceCam_01.line)
mainCamera_01.tweenSlicePosition(
	spliceCam_01.pointsArray, // spline points
	new THREE.Vector3(0,0,0), // target camera point
	15000, // duration
	TWEEN.Easing.Quadratic.InOut,  //ease
	0, // delay
	Infinity, // repeat
	true) // yoyo
mainCamera_01.tween.start()

// ligths
let spotLight_01 = new Ligth3D('spotLight_01', 'spotLight', 1.5, 'rgb(255,100,50)', true )
spotLight_01.mesh = spotLight_01.instanciateLigth()
scene.add(spotLight_01.mesh)
spotLight_01.mesh.position.set(2,2,0)
let pointLight_01 = new Ligth3D('pointLight_01', 'pointLight', 3, 'rgb(120,120,255)', true )
pointLight_01.mesh = pointLight_01.instanciateLigth()
scene.add(pointLight_01.mesh)
pointLight_01.mesh.position.set(-4,1,2)
let directionalLight = new Ligth3D('directionalLight', 'directionalLight', 1, 'rgb(255,255,255)', true )
directionalLight.mesh = directionalLight.instanciateLigth()
scene.add(directionalLight.mesh)
directionalLight.mesh.position.set(2,5,2)

// objects
let sphere_01 = new Geometry3D('sphere_01', 'sphere')
sphere_01.mesh = sphere_01.drawMesh(1, 32, 'rgb(120,120,120)')
scene.add(sphere_01.mesh)
sphere_01.tweenPosition(sphere_01.mesh.position, // orinal position
	new THREE.Vector3(0,3,0), // target position
	2000, //duration
	TWEEN.Easing.Quadratic.InOut, // ease
	0, // delay
	Infinity, // repeat
	true) // yoyo
sphere_01.tween.start()

// controls
let controls = new OrbitControls( mainCamera_01.camera, renderer.domElement )

// GUI
let gui = new dat.GUI();
let folder_camera = gui.addFolder('camera animation')
gui.add(mainCamera_01, 'speed', 0, 1)

// animate
let animate = function () {
	requestAnimationFrame( animate )
	renderer.render( scene, mainCamera_01.camera )
  stats.update()
	TWEEN.update()

}

animate()
