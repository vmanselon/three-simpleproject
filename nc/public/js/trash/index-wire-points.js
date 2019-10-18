import * as THREE from './three/build/three.module.js'
import Stats from './three/examples/jsm/libs/stats.module.js'
import dat from './three/examples/jsm/libs/dat.gui.module.js'
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js'
import {EffectComposer} from './three/examples/jsm/postprocessing/EffectComposer.js'
import {RenderPass} from './three/examples/jsm/postprocessing/RenderPass.js'
import TWEEN from './tween/src/Tween.js'

// classes
import {Camera3D, Spline3D, Geometry3D, Ligth3D, ParticlesPlane3D} from './src/standardObjects.js'

let mainCamera_01, scene, renderer, composer, stats, gui
let mesh, sign = 1

init()
animate()

// start
function init(){

  // scne and renderer
	scene = new THREE.Scene()
	renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
	renderer.setSize( window.innerWidth, window.innerHeight )
	renderer.setClearColor(0x000000, 0.0)
	scene.fog = new THREE.FogExp2(0x193c6d, 0.0115)
	document.getElementById('webgl').appendChild(renderer.domElement)

	// helpers
	stats = new Stats()
	document.body.appendChild(stats.domElement)
	let showHelps = true
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
	mainCamera_01.camera.position.z = 10
	mainCamera_01.camera.rotation.x = -Math.PI/24

	// postprocessing
	composer = new EffectComposer(renderer)
	let renderScene = new RenderPass( scene, mainCamera_01.camera )
	composer.addPass(renderScene)

	// ligths
	let spotLight_01 = new Ligth3D('spotLight_01', 'spotLight', 1.5, 'rgb(255,100,50)', true )
	spotLight_01.mesh = spotLight_01.instanciateLigth()
	spotLight_01.mesh.position.set(2,2,0)
	scene.add(spotLight_01.mesh)
	let pointLight_01 = new Ligth3D('pointLight_01', 'pointLight', 3, 'rgb(120,120,255)', true )
	pointLight_01.mesh = pointLight_01.instanciateLigth()
	pointLight_01.mesh.position.set(-4,1,2)
	scene.add(pointLight_01.mesh)
	let directionalLight = new Ligth3D('directionalLight', 'directionalLight', 1, 'rgb(255,255,255)', true )
	directionalLight.mesh = directionalLight.instanciateLigth()
	directionalLight.mesh.position.set(2,5,2)
	scene.add(directionalLight.mesh)

	// objects
	// let loader = new GLTFLoader()
	// loader.load( './assets/models/AnimatedMorphSphere/AnimatedMorphSphere.gltf', function ( gltf ) {
	// 	gltf.scene.traverse( function ( node ) {
	// 		if ( node.isMesh ) mesh = node
	// 	} )
	// 	mesh.material.morphTargets = true
	// 	scene.add( mesh )
	// 	// add points
	// 	var pointsMaterial = new THREE.PointsMaterial( {
	// 		size: 4,
	// 		sizeAttenuation: false,
	// 		alphaTest: 1,
	// 		morphTargets: true
	// 	} )
	// 	var points = new THREE.Points( mesh.geometry, pointsMaterial )
	// 	points.morphTargetInfluences = mesh.morphTargetInfluences
	// 	points.morphTargetDictionary = mesh.morphTargetDictionary
	// 	mesh.add( points )
	// } )
	let sphere_01 = new Geometry3D('sphere_01', 'sphere')
	sphere_01.mesh = sphere_01.drawObject(2, 32, 'rgb(120,120,120)')
	sphere_01.mesh.material.morphTargets = true
	scene.add(sphere_01.mesh)
	var linesMaterial = new THREE.MeshBasicMaterial( {
		wireframe: true
	} )
	var lines = new THREE.Mesh( sphere_01.mesh.geometry, linesMaterial )
	lines.morphTargetInfluences = sphere_01.mesh.morphTargetInfluences
	lines.morphTargetDictionary = sphere_01.mesh.morphTargetDictionary
	sphere_01.mesh.add( lines )
	var pointsMaterial = new THREE.PointsMaterial( {
		size: 4,
		sizeAttenuation: false,
		alphaTest: 1,
		morphTargets: true
	} )
	var points = new THREE.Points( sphere_01.mesh.geometry, pointsMaterial )
	points.morphTargetInfluences = sphere_01.mesh.morphTargetInfluences
	points.morphTargetDictionary = sphere_01.mesh.morphTargetDictionary
	sphere_01.mesh.add( points )



	// controls
	let controls = new OrbitControls( mainCamera_01.camera, renderer.domElement )
	controls.autoRotate = true
	controls.minDistance = 3
	controls.maxDistance = 20

	// eventListener
	window.addEventListener('resize', onWindowResize, false)

	// GUI
	gui = new dat.GUI()
	let folder_wave = gui.addFolder('camera')
}

// update
function animate (){
	requestAnimationFrame( animate )
	composer.render()
  stats.update()
	TWEEN.update()
	gui.updateDisplay()

	shapeAnimation()

}

// animations
function shapeAnimation() {
	// if ( mesh !== undefined ) {
	// 	//mesh.rotation.y += 0.01
	// 	mesh.morphTargetInfluences[ 1 ] = mesh.morphTargetInfluences[ 1 ] + 0.01 * sign
	// 	if ( mesh.morphTargetInfluences[ 1 ] <= 0 || mesh.morphTargetInfluences[ 1 ] >= 1 ) {
	// 		sign *= - 1
	// 	}
	// }
}

// events listeners
function onWindowResize() {
  mainCamera_01.camera.aspect = window.innerWidth / window.innerHeight
  mainCamera_01.camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
