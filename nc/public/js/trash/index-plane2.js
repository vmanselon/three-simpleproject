import * as THREE from './three/build/three.module.js'
import Stats from './three/examples/jsm/libs/stats.module.js'
import dat from './three/examples/jsm/libs/dat.gui.module.js'
import { OrbitControls } from './three/examples/jsm/controls/OrbitControls.js'
import {EffectComposer} from './three/examples/jsm/postprocessing/EffectComposer.js'
import {RenderPass} from './three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from './three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from './three/examples/jsm/postprocessing/ShaderPass.js'
import { VignetteShader } from './three/examples/jsm/shaders/VignetteShader.js'
import { FXAAShader } from './three/examples/jsm/shaders/FXAAShader.js';
import TWEEN from './tween/src/Tween.js'

// classes
import {Camera3D, Spline3D, Geometry3D, Ligth3D, ParticlesPlane3D} from './src/standardObjects.js';

// parameter postprocesing
let bloomParams = {
	exposure: 1.0,
	bloomStrength: .7,
	bloomThreshold: 0.96,
	bloomRadius: .1
}
let vignetteParams = {
	darkness: 1.1,
	offset: 1.11
}


// scene
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize( window.innerWidth, window.innerHeight )
renderer.setClearColor(0x111b35, 1)
scene.fog = new THREE.FogExp2(0x111b35, 0.0215)
document.getElementById('webgl').appendChild(renderer.domElement)

// helpers
let stats = new Stats()
document.body.appendChild(stats.domElement)
let debug = false
if(debug){
	let gridHelper = new THREE.GridHelper( 50, 50 )
	scene.add( gridHelper )
	let axesHelper = new THREE.AxesHelper( 5 )
	scene.add( axesHelper )
}

// camera
let mainCamera_01 = new Camera3D( "mainCamera_01", 16, window.innerWidth/window.innerHeight, 0.1, 1000, 1, 10 )
mainCamera_01.camera.setLens( 15, mainCamera_01.camera.frameHeight, 5.6, mainCamera_01.camera.coc )
mainCamera_01.camera.position.y = 10
mainCamera_01.camera.position.z = 25
mainCamera_01.camera.rotation.x = -Math.PI/100

let curvePoints = new THREE.CatmullRomCurve3( [
	new THREE.Vector3( 0, 10, 25 ),
	new THREE.Vector3( 0, 3, 15 ),
	new THREE.Vector3( 0, 1, -5 )
] )
let spliceCam_01 = new Spline3D('spliceCam_01', curvePoints)
spliceCam_01.line = spliceCam_01.drawLine(50, 'rgb(255,0,0)')
spliceCam_01.line.material.visible = debug
scene.add(spliceCam_01.line)
mainCamera_01.tweenSlicePosition(
	spliceCam_01.pointsArray, // spline points
	new THREE.Euler(0, 0, 0, 'XYZ'), // target camera point
	4000, // duration
	TWEEN.Easing.Quadratic.InOut,  //ease
	0, // delay
	0, // repeat
	false) // yoyo

// postprocessing
let composer = new EffectComposer(renderer)
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
let fxaaPass = new ShaderPass( FXAAShader )
let pixelRatio = renderer.getPixelRatio()
fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( window.innerWidth * pixelRatio )
fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( window.innerHeight * pixelRatio )
composer.addPass(fxaaPass)


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
// particles plane
let particleContainer = new ParticlesPlane3D('particle_wave', // name
	100, // amount
	1.5,  // seperation
	0.34, // amplitude position
	1.2, // amplitude scale
	0.09, // amplitudeSpeed
	0.03, // direction speed
	0.8) // direction speed max)
particleContainer.particles = particleContainer.draw( 0.015, 64, 0xffffff )
particleContainer.followPlane()
scene.add(particleContainer.particles)


// controls
let controls
if(debug){
	controls = new OrbitControls( mainCamera_01.camera, renderer.domElement )
	controls.autoRotate = true
}

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
  mainCamera_01.camera.aspect = window.innerWidth / window.innerHeight
  mainCamera_01.camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
	fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( window.innerWidth * pixelRatio )
	fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( window.innerHeight * pixelRatio )
}

function onMouseMove(event) {
	if(!mainCamera_01.isControlable || debug) return
	mainCamera_01.camera.rotation.y = (event.clientX / window.innerWidth - 0.5) / -mainCamera_01.mouseOrientation
	mainCamera_01.camera.rotation.x = (event.clientY / window.innerHeight-0.5) / -mainCamera_01.mouseOrientation -Math.PI/100
}

function onMouseWheel(event) {
	if(!particleContainer.isPlaying || debug) return
	if(particleContainer.dirSpeed < particleContainer.dirSpeedMax)
		particleContainer.dirSpeed += particleContainer.dirSpeed/5
}

function onMouseUp(event) {
	if(debug) return
	mainCamera_01.tween.start()
}
