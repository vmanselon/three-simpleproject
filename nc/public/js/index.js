import * as THREE from './three/build/three.module.js'
import Stats from './three/examples/jsm/libs/stats.module.js'
import dat from './three/examples/jsm/libs/dat.gui.module.js'
import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js'
import {EffectComposer} from './three/examples/jsm/postprocessing/EffectComposer.js'
import {RenderPass} from './three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from './three/examples/jsm/postprocessing/UnrealBloomPass.js'
import TWEEN from './tween/src/Tween.js'

// classes
import {Camera3D, Spline3D, Ligth3D} from './src/standardObjects.js'
import {createColorRange, percent} from './src/utils.js'
import ParticleSystem from './src/ParticleSystem.js'

// scenes
let scene, renderer, mainCamera_01, composer

// utils
let gui, controls, stats

// particles parameter
let  particleSystem, particlesContainer, options, spawnerOptions
let PARTICLE_SIZE = 5.5
let PARTICLE_MAX = 100000
let SIZE = 8
let anchors = []
let anchorsYLimits = {min: 0, max:0}
let colorUp = new THREE.Color(231, 183, 130)
let colorDown = new THREE.Color(62, 216, 191)
let range = createColorRange(colorUp, colorDown)

//  postprocesing parameter
let bloomParams = {
	exposure: 1.0,
	bloomStrength: 1.9,
	bloomThreshold: 0.04,
	bloomRadius: .55
}

// manager
let debug = false

// awake
init()
renderer.setAnimationLoop(animate)

// start
function init(){

	// scene
	scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer({ antialias: true })
	renderer.setSize( window.innerWidth, window.innerHeight )
	renderer.setClearColor(0x000000, 1)
	scene.fog = new THREE.FogExp2(0x000000, 0.0215)
	document.getElementById('webgl').appendChild(renderer.domElement)

	// helpers
	stats = new Stats()
	document.body.appendChild(stats.domElement)
	if(debug){
		let gridHelper = new THREE.GridHelper( 50, 50 )
		scene.add( gridHelper )
		let axesHelper = new THREE.AxesHelper( 5 )
		scene.add( axesHelper )
	}

	// camera
	mainCamera_01 = new Camera3D( "mainCamera_01", 16, window.innerWidth/window.innerHeight, 0.1, 1000, 1, 10 )
 	mainCamera_01.camera.position.copy(new THREE.Vector3(10,5,40))

	// postprocessing
	composer = new EffectComposer(renderer)
	let renderScene = new RenderPass( scene, mainCamera_01.camera )
	composer.addPass(renderScene)
	let bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ))
	bloomPass.threshold = bloomParams.bloomThreshold
	bloomPass.strength = bloomParams.bloomStrength
	bloomPass.radius = bloomParams.bloomRadius
	composer.addPass( bloomPass )


  // particle system
	const textureLoader = new THREE.TextureLoader()
	options = {
		maxParticles: PARTICLE_MAX,
		position: new THREE.Vector3(0,0,0),
		positionRandomness: 1,
		baseVelocity: new THREE.Vector3(0, 0, 0),
		velocity: new THREE.Vector3(0, 0, 0),
		velocityRandomness: 1.0,
		acceleration: new THREE.Vector3(0,0,0),
		baseColor: new THREE.Color(1.0,1.0,1.0),
		color: new THREE.Color(1.0,1.0,1.0),
		colorRandomness: 0,
		lifetime: Infinity,
		size: PARTICLE_SIZE,
		sizeRandomness: PARTICLE_SIZE*2,
	  particleSpriteTex: textureLoader.load('./assets/textures/sprites/disc.png'),
	  blending: THREE.AdditiveBlending,
	}
	spawnerOptions = {
	  spawnRate: 500, // create at the rate of 500 particles/sec
	  timeScale: 1.0
	}
	particleSystem = new ParticleSystem(options)
	// particle container
	let loader = new GLTFLoader()
	let particlesContainer
	loader.load( './assets/models/castle/castle.gltf', function ( gltf ) {
    // get the model
		gltf.scene.traverse( function ( node ) {
			if ( node.isMesh ) particlesContainer = node
		} )
		particlesContainer.material = new THREE.MeshBasicMaterial( { color : '0x110000', wireframe: true, visible: false} )
		scene.add( particlesContainer )
		// ajust postion and size
		particlesContainer.scale.copy(new THREE.Vector3(0.05,0.05,0.05))
		// set parent
		particlesContainer.add(particleSystem)
		console.log(particlesContainer)
    //anchor points / vertices
		for (var i = 0; i < particlesContainer.geometry.attributes.position.count; i++) {
			let x = particlesContainer.geometry.attributes.position.array[i * 3 + 0]
			let y = particlesContainer.geometry.attributes.position.array[i * 3 + 1]
			let z = particlesContainer.geometry.attributes.position.array[i * 3 + 2]
			anchors.push(new THREE.Vector3(x,y,z))
			if(y < anchorsYLimits.min) anchorsYLimits.min = y
			else if(y > anchorsYLimits.max) anchorsYLimits.max = y
		}
		//spawn particles
		particlesContainer.add(particleSystem)
		for (let i = 0; i < anchors.length; i++) {
			// position
			options.position.copy(anchors[i])
      // color
			let currentColor = range[Math.round(percent(options.position.y,anchorsYLimits.min,anchorsYLimits.max)*254)]
			options.color = new THREE.Color(currentColor.r/255,currentColor.g/255,currentColor.b/255)
			particleSystem.spawnParticle( options )
		}
	})

	// controls
	controls = new OrbitControls( mainCamera_01.camera, renderer.domElement )

	// eventListener
	window.addEventListener('resize', onWindowResize, false)

	// GUI
	gui = new dat.GUI()
	let folder_bloom = gui.addFolder('bloom')
	folder_bloom.add( bloomParams, 'exposure', 0.1, 2 ).onChange( function ( value ) {
		renderer.toneMappingExposure = Math.pow( value, 4.0 )
	} )
	folder_bloom.add( bloomParams, 'bloomStrength', 0.0, 3.0 ).onChange( function ( value ) {
		bloomPass.strength = Number( value )
	} )
	folder_bloom.add( bloomParams, 'bloomThreshold', 0, 1.0 ).onChange( function ( value ) {
		bloomPass.threshold = Number( value )
	} )
	folder_bloom.add( bloomParams, 'bloomRadius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {
		bloomPass.radius = Number( value )
	} )

}

// update
function animate(time) {
	composer.render(time)
  stats.update(time)
	TWEEN.update(time)
	gui.updateDisplay(time)

  // particles
	particleSystem.update(time)
}

// events listener functions
function onWindowResize() {
  mainCamera_01.camera.aspect = window.innerWidth / window.innerHeight
  mainCamera_01.camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
