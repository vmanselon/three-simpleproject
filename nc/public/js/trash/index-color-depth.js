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
import { BokehShader, BokehDepthShader } from './three/examples/jsm/shaders/BokehShader2.js'
import TWEEN from './tween/src/Tween.js'

// classes
import {Camera3D, Spline3D, Geometry3D, Ligth3D, ParticlesPlane3D} from './src/standardObjects.js'

let mainCamera_01, scene, renderer, composer, stats, gui, plane_01, materialDepth

// parameter animation
let animationTerrain = {
	count: 0,
	amplitudePosition: .3,
	amplitudeSpeed: .025
}

// parameter postprocesing
let postprocessing = { enabled: true }
let shaderSettings = {
	rings: 3,
	samples: 4
}
let effectController = {
	enabled: true,
	shaderFocus: true,
	fstop: 5.7,
	maxblur: 1.0,
	showFocus: false,
	focalDepth: 48.1,
	manualdof: false,
	vignetting: true,
	depthblur: true,
	threshold: 0.5,
	gain: 2.0,
	bias: 0.5,
	fringe: 0.7,
	focalLength: 35,
	noise: true,
	pentagon: false,
	dithering: 0.0001
}


init()
animate()

// start
function init(){

  // scne and renderer
	scene = new THREE.Scene()
	renderer = new THREE.WebGLRenderer({ antialias: true })
	renderer.setSize( window.innerWidth, window.innerHeight )
	renderer.setClearColor(0x101a34, 1)
	scene.fog = new THREE.FogExp2(0x101a34, 0.02)
	document.getElementById('webgl').appendChild(renderer.domElement)

	// helpers
	stats = new Stats()
	document.body.appendChild(stats.domElement)
	let showHelps = false
	if(showHelps){
		let gridHelper = new THREE.GridHelper( 50, 60 )
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
	let depthShader = BokehDepthShader
	materialDepth = new THREE.ShaderMaterial( {
		uniforms: depthShader.uniforms,
		vertexShader: depthShader.vertexShader,
		fragmentShader: depthShader.fragmentShader
	} )
	materialDepth.uniforms[ 'mNear' ].value = mainCamera_01.camera.near
	materialDepth.uniforms[ 'mFar' ].value = mainCamera_01.camera.far

	// ligths
	// let spotLight_01 = new Ligth3D('spotLight_01', 'spotLight', 1.5, 'rgb(255,100,50)', true )
	// spotLight_01.mesh = spotLight_01.instanciateLigth()
	// spotLight_01.mesh.position.set(2,2,0)
	// scene.add(spotLight_01.mesh)
	// let pointLight_01 = new Ligth3D('pointLight_01', 'pointLight', 3, 'rgb(120,120,255)', true )
	// pointLight_01.mesh = pointLight_01.instanciateLigth()
	// pointLight_01.mesh.position.set(-4,1,2)
	// scene.add(pointLight_01.mesh)
	// let directionalLight = new Ligth3D('directionalLight', 'directionalLight', 1, 'rgb(255,255,255)', true )
	// directionalLight.mesh = directionalLight.instanciateLigth()
	// directionalLight.mesh.position.set(2,5,2)
	// scene.add(directionalLight.mesh)

	// objects
	plane_01 = new Geometry3D('plane_01', 'plane', 120, 50)
	plane_01.mesh = plane_01.drawObject('rgb(250, 250, 250)')
	plane_01.mesh.material.morphTargets = true
	plane_01.mesh.material.transparent = true
	plane_01.mesh.material.opacity = 0.05
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
	controls.maxDistance = 50

	// eventListener
	window.addEventListener('resize', onWindowResize, false)

  initPostprocessing()
	let matChanger = function () {
		for ( var e in effectController ) {
			if ( e in postprocessing.bokeh_uniforms ) {
				postprocessing.bokeh_uniforms[ e ].value = effectController[ e ];
			}
		}
		postprocessing.enabled = effectController.enabled;
		postprocessing.bokeh_uniforms[ 'znear' ].value = mainCamera_01.camera.near;
		postprocessing.bokeh_uniforms[ 'zfar' ].value = mainCamera_01.camera.far;
		mainCamera_01.camera.setFocalLength( effectController.focalLength );
	}
	matChanger()

	// GUI
	gui = new dat.GUI()
	gui.add( effectController, 'enabled' ).onChange( matChanger )
	gui.add( effectController, 'shaderFocus' ).onChange( matChanger )
	gui.add( effectController, 'focalDepth', 0.0, 200.0 ).listen().onChange( matChanger )
	gui.add( effectController, 'fstop', 0.1, 22, 0.001 ).onChange( matChanger )
	gui.add( effectController, 'maxblur', 0.0, 5.0, 0.025 ).onChange( matChanger )
	gui.add( effectController, 'showFocus' ).onChange( matChanger )
	gui.add( effectController, 'manualdof' ).onChange( matChanger )
	gui.add( effectController, 'vignetting' ).onChange( matChanger )
	gui.add( effectController, 'depthblur' ).onChange( matChanger )
	gui.add( effectController, 'threshold', 0, 1, 0.001 ).onChange( matChanger )
	gui.add( effectController, 'gain', 0, 100, 0.001 ).onChange( matChanger )
	gui.add( effectController, 'bias', 0, 3, 0.001 ).onChange( matChanger )
	gui.add( effectController, 'fringe', 0, 5, 0.001 ).onChange( matChanger )
	gui.add( effectController, 'focalLength', 16, 80, 0.001 ).onChange( matChanger )
	gui.add( effectController, 'noise' ).onChange( matChanger )
	gui.add( effectController, 'dithering', 0, 0.001, 0.0001 ).onChange( matChanger )
	gui.add( effectController, 'pentagon' ).onChange( matChanger )
	gui.add( shaderSettings, 'rings', 1, 8 ).step( 1 ).onChange( shaderUpdate )
	gui.add( shaderSettings, 'samples', 1, 13 ).step( 1 ).onChange( shaderUpdate )
}


// update
function animate (){
	requestAnimationFrame( animate )
  stats.update()
	TWEEN.update()
	gui.updateDisplay()

	shapeAnimation()

	if ( postprocessing.enabled ) {
		renderer.clear()
		// render scene into texture
		renderer.setRenderTarget( postprocessing.rtTextureColor );
		renderer.clear()
		renderer.render( scene, mainCamera_01.camera )
		// render depth into texture
		scene.overrideMaterial = materialDepth
		renderer.setRenderTarget( postprocessing.rtTextureDepth )
		renderer.clear()
		renderer.render( scene, mainCamera_01.camera )
		scene.overrideMaterial = null
		// render bokeh composite
		renderer.setRenderTarget( null )
		renderer.render( postprocessing.scene, postprocessing.camera )
	} else {
		scene.overrideMaterial = null
		renderer.setRenderTarget( null )
		renderer.clear()
		renderer.render( scene, mainCamera_01.camera )
	}
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

function initPostprocessing() {
	postprocessing.scene = new THREE.Scene()
	postprocessing.camera = new THREE.OrthographicCamera( window.innerWidth / - 2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / - 2, - 10000, 10000 )
	postprocessing.camera.position.z = 100
	postprocessing.scene.add( postprocessing.camera )
	var pars = { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBFormat }
	postprocessing.rtTextureDepth = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, pars )
	postprocessing.rtTextureColor = new THREE.WebGLRenderTarget( window.innerWidth, window.innerHeight, pars )
	var bokeh_shader = BokehShader
	postprocessing.bokeh_uniforms = THREE.UniformsUtils.clone( bokeh_shader.uniforms )
	postprocessing.bokeh_uniforms[ 'tColor' ].value = postprocessing.rtTextureColor.texture
	postprocessing.bokeh_uniforms[ 'tDepth' ].value = postprocessing.rtTextureDepth.texture
	postprocessing.bokeh_uniforms[ 'textureWidth' ].value = window.innerWidth
	postprocessing.bokeh_uniforms[ 'textureHeight' ].value = window.innerHeight
	postprocessing.materialBokeh = new THREE.ShaderMaterial( {
		uniforms: postprocessing.bokeh_uniforms,
		vertexShader: bokeh_shader.vertexShader,
		fragmentShader: bokeh_shader.fragmentShader,
		defines: {
			RINGS: shaderSettings.rings,
			SAMPLES: shaderSettings.samples
		}
	} );
	postprocessing.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( window.innerWidth, window.innerHeight ), postprocessing.materialBokeh )
	postprocessing.quad.position.z = - 500
	postprocessing.scene.add( postprocessing.quad )
}

function shaderUpdate() {
	postprocessing.materialBokeh.defines.RINGS = shaderSettings.rings
	postprocessing.materialBokeh.defines.SAMPLES = shaderSettings.samples
	postprocessing.materialBokeh.needsUpdate = true
}
