import * as THREE from './three/build/three.module.js'
import Stats from './three/examples/jsm/libs/stats.module.js'
import dat from './three/examples/jsm/libs/dat.gui.module.js'
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from './three/examples/jsm/loaders/GLTFLoader.js'
import {EffectComposer} from './three/examples/jsm/postprocessing/EffectComposer.js'
import {RenderPass} from './three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from './three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from './three/examples/jsm/postprocessing/ShaderPass.js'
import { VignetteShader } from './three/examples/jsm/shaders/VignetteShader.js'
import { BokehPass } from './three/examples/jsm/postprocessing/BokehPass.js'
import TWEEN from './tween/src/Tween.js'

// classes
import {Camera3D, Spline3D, Geometry3D, Ligth3D, ParticlesPlane3D} from './src/standardObjects.js'

let mainCamera_01, scene, renderer, composer, stats, gui, plane_01

// parameter animation
let animationTerrain = {
	count: 0,
	amplitudePosition: .5,
	amplitudeSpeed: .025
}

// parameter postprocesing
let bloomParams = {
	exposure: 1.0,
	bloomStrength: .46,
	bloomThreshold: 0.48,
	bloomRadius: .13
}
let vignetteParams = {
	darkness: 1.2,
	offset: .4
}
let dofParams = {
	focus: 307,
	aperture:	1,
	aspect: 1,
	maxblur:	0.5,
	nearClip:	0.1,
	farClip:	1000
}


init()
animate()

// start
function init(){

  // scne and renderer
	scene = new THREE.Scene()
	renderer = new THREE.WebGLRenderer({ antialias: true })
	renderer.setSize( window.innerWidth, window.innerHeight )
	renderer.setClearColor(0x000000, 1)
	scene.fog = new THREE.FogExp2(0x000000, 0.04)
	document.getElementById('webgl').appendChild(renderer.domElement)

	// helpers
	stats = new Stats()
	document.body.appendChild(stats.domElement)
	let showHelps = false
	if(showHelps){
		let gridHelper = new THREE.GridHelper( 50, 50 )
		scene.add( gridHelper )
		let axesHelper = new THREE.AxesHelper( 5 )
		scene.add( axesHelper )
	}

	// camera
  mainCamera_01 = new Camera3D( "mainCamera_01", 15, window.innerWidth/window.innerHeight, 0.1, 1000, 1, 18 )
	mainCamera_01.camera.setLens( 15, mainCamera_01.camera.frameHeight, 5.6, mainCamera_01.camera.coc )
	mainCamera_01.camera.position.y = 3.5
	mainCamera_01.camera.position.z = 25
	mainCamera_01.camera.rotation.x = -Math.PI/24

	// postprocessing
	composer = new EffectComposer(renderer)
	let renderScene = new RenderPass( scene, mainCamera_01.camera )
	composer.addPass(renderScene)
	let bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ))
	bloomPass.threshold = bloomParams.bloomThreshold
	bloomPass.strength = bloomParams.bloomStrength
	bloomPass.radius = bloomParams.bloomRadius
	composer.addPass( bloomPass )
	let vignetteEffect = new ShaderPass(VignetteShader)
	vignetteEffect.uniforms['darkness'].value = vignetteParams.darkness
	vignetteEffect.uniforms['offset'].value =  vignetteParams.offset
	vignetteEffect.renderToScreen = true
	composer.addPass(vignetteEffect)
	let bokehPass = new BokehPass( scene, mainCamera_01.camera, {
		focus: dofParams.focus,
		aperture:	dofParams.aperture * 0.00001,
		aspect:	dofParams.aspect,
		maxblur: dofParams.maxblur,
		nearClip:	dofParams.nearClip,
		farClip:	dofParams.farClip
	})
	composer.addPass(bokehPass)
	console.log(bokehPass);

	// ligths
	// let spotLight_01 = new Ligth3D('spotLight_01', 'spotLight', 1.5, 'rgb(255,100,50)', true )
	// spotLight_01.mesh = spotLight_01.instanciateLigth()
	// spotLight_01.mesh.position.set(2,2,0)
	// scene.add(spotLight_01.mesh)
	// let pointLight_01 = new Ligth3D('pointLight_01', 'pointLight', 3, 'rgb(120,120,255)', true )
	// pointLight_01.mesh = pointLight_01.instanciateLigth()
	// pointLight_01.mesh.position.set(-4,1,2)
	// scene.add(pointLight_01.mesh)
	let directionalLight = new Ligth3D('directionalLight', 'directionalLight', 1, 'rgb(255,255,255)', true )
	directionalLight.mesh = directionalLight.instanciateLigth()
	directionalLight.mesh.position.set(2,5,2)
	scene.add(directionalLight.mesh)

	// objects
	plane_01 = new Geometry3D('plane_01', 'plane', 120, 50)
	plane_01.mesh = plane_01.drawObject('rgb(8, 8, 8)')
	plane_01.mesh.material.morphTargets = true
	plane_01.mesh.material.transparent = true
	plane_01.mesh.material.opacity = 1
	plane_01.mesh.material.side = THREE.DoubleSide
	plane_01.mesh.material.blending = THREE.AdditiveBlending
	plane_01.mesh.material.shininess = 100
	scene.add(plane_01.mesh)
	let linesMaterial = new THREE.MeshBasicMaterial( {
		wireframe: true
	} )
	let lines = new THREE.Mesh( plane_01.mesh.geometry, linesMaterial )
	lines.morphTargetInfluences = plane_01.mesh.morphTargetInfluences
	lines.morphTargetDictionary = plane_01.mesh.morphTargetDictionary
	plane_01.mesh.add( lines )
	let sprite = new THREE.TextureLoader().load( 'assets/textures/sprites/disc.png' )
	let pointsMaterial = new THREE.PointsMaterial( {
		size: 0.15,
		map: sprite,
		alphaTest: 0.1
	} )
	let points = new THREE.Points( plane_01.mesh.geometry, pointsMaterial )
	points.morphTargetInfluences = plane_01.mesh.morphTargetInfluences
	points.morphTargetDictionary = plane_01.mesh.morphTargetDictionary
	plane_01.mesh.add( points )
	plane_01.mesh.rotation.x = -Math.PI/2

	// controls
	let controls = new OrbitControls( mainCamera_01.camera, renderer.domElement )
	controls.autoRotate = true
	controls.minDistance = 3
	controls.maxDistance = 20

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
	let folder_vignette = gui.addFolder('vignetting')
	folder_vignette.add( vignetteParams, 'darkness', 0, 3 ).onChange( function ( value ) {
		vignetteEffect.uniforms['darkness'].value = value
	} )
	folder_vignette.add( vignetteParams, 'offset', 0, 3 ).onChange( function ( value ) {
		vignetteEffect.uniforms['offset'].value = value
	} )
	let folder_dof = gui.addFolder('dof')
	folder_dof.add( dofParams, 'focus', 0, 1000 ).onChange( function ( value ) {
		bokehPass.uniforms[ "focus" ].value = value
	} )
	folder_dof.add( dofParams, 'aperture', 0.0, 10.0 ).onChange( function ( value ) {
		bokehPass.uniforms[ "aperture" ].value = value * 0.00001
	} )
	folder_dof.add( dofParams, 'aspect', 0.0, 3.0 ).onChange( function ( value ) {
		bokehPass.uniforms[ "aspect" ].value = value
	} )
	folder_dof.add( dofParams, 'maxblur', 0.0, 5.0 ).onChange( function ( value ) {
		bokehPass.uniforms[ "maxblur" ].value = value
	} )
	folder_dof.add( dofParams, 'nearClip', 0.0, 1.0 ).onChange( function ( value ) {
		bokehPass.uniforms[ "nearClip" ].value = value
	} )
	folder_dof.add( dofParams, 'farClip', 100, 1000 ).onChange( function ( value ) {
		bokehPass.uniforms[ "farClip" ].value = value
	} )

}


// update
function animate (){
	requestAnimationFrame( animate )
	composer.render(.1)
  stats.update()
	TWEEN.update()
	gui.updateDisplay()

	shapeAnimation()
}

// animations
function shapeAnimation() {
	for (let i = 2; i < plane_01.mesh.geometry.attributes.position.array.length; i++) {
		plane_01.mesh.geometry.attributes.position.array[i] = (Math.sin((i + animationTerrain.count) * 0.3) * animationTerrain.amplitudePosition) + (Math.sin((i + animationTerrain.count) * 0.5) * animationTerrain.amplitudePosition)
		i+=2
	}
	plane_01.mesh.geometry.attributes.position.needsUpdate = true;
	animationTerrain.count += animationTerrain.amplitudeSpeed
}

// events listeners
function onWindowResize() {
  mainCamera_01.camera.aspect = window.innerWidth / window.innerHeight
  mainCamera_01.camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}
