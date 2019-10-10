function init() {
	let scene = new THREE.Scene()
	let stats = new Stats()
	document.body.appendChild(stats.dom)
  let clock = new THREE.Clock()
  let gui = new dat.GUI()

  // fog
	let enableFog = true
	if (enableFog) {
	scene.fog = new THREE.FogExp2('rgb(120, 102, 102)', 0.025)
	}

	// camera
	let camera = new THREE.PerspectiveCamera(
		50,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	)
	camera.position.set(4, 2, 5.3)
	camera.lookAt(0, 0, 0)
	scene.add(camera)

	// ligths
	let directionalLight = getDirectionalLight(1.3)
	directionalLight.name = 'directionalLight'
	let directionalLightObj = getShpere (0.05, 5)
	directionalLight.add(directionalLightObj)
	directionalLight.position.set(3,3,3)
	let directionalLightColor = rgbToHex(255,255,214)
	directionalLightObj.material.color.setHex( directionalLightColor )
	directionalLight.color.setHex( directionalLightColor )
	scene.add(directionalLight)

	let spotLight = getSpotLight(2.3)
	spotLight.name = 'spotLight'
	let spotLightObj = getShpere (0.05, 5)
	spotLight.add(spotLightObj)
	spotLight.position.set(-4, 1.7, 0)
	spotLight.penumbra = 0.24
	let spotLigthColor = rgbToHex(255, 200, 200)
	spotLightObj.material.color.setHex( spotLigthColor )
	spotLight.color.setHex( spotLigthColor )
	scene.add(spotLight)

  // ground
	let floor = getPlane(20)
	floor.name = 'floor'
	floor.rotation.x = Math.PI/2
	floor.material = new THREE.MeshPhongMaterial ({
		color:'rgb(10, 10, 10)',
		side: THREE.DoubleSide
	})
	floor.receiveShadow = true
	scene.add(floor)

	//  car
	const objLoader = new THREE.OBJLoader()
	objLoader.setPath('/assets/models/')
	const mtlLoader = new THREE.MTLLoader()
	mtlLoader.setPath('/assets/models/')
	new Promise((resolve) => {
	  mtlLoader.load('car.mtl', (materials) => {
	    resolve(materials)
	  })
	})
	.then((materials) => {
	  materials.preload()
	  objLoader.setMaterials(materials)
	  objLoader.load('car.obj', (object) => {

	  object.traverse( function ( child ) {
	    child.castShadow = true
			child.receiveShadow = true
		} )
		object.name = 'car'
	  scene.add(object)
		object.rotation.y -= Math.PI/2
		})
	})


  // renderer
	let renderer = new THREE.WebGLRenderer( { antialias: true } )
	renderer.setSize(window.innerWidth, window.innerHeight)
	renderer.shadowMap.enabled = true
	renderer.setClearColor('rgb(27, 27, 27)')
	document.getElementById('webgl').appendChild(renderer.domElement)

	var composer = new THREE.EffectComposer(renderer)
	var renderPass = new THREE.RenderPass(scene, camera)
	composer.addPass(renderPass)

	var vignetteEffect = new THREE.ShaderPass(THREE.VignetteShader)
	vignetteEffect.uniforms['darkness'].value = 1
	vignetteEffect.uniforms['offset'].value = 0.4
	vignetteEffect.renderToScreen = true
	composer.addPass(vignetteEffect)

	// controls
	let controls = new THREE.OrbitControls( camera, renderer.domElement )

	// gui.dat
  let folder_camera = gui.addFolder('camera')
	folder_camera.add(camera.position, 'x', -10, 10)
	folder_camera.add(camera.position, 'y', 1, 10)
  folder_camera.add(camera.position, 'z', 5, 10)

	let folder_ambiantligth = gui.addFolder('ambiant ligth')
	folder_ambiantligth.add(directionalLight, 'intensity', 0, 10)
	folder_ambiantligth.add(directionalLight.position, 'x', -10, 10)
	folder_ambiantligth.add(directionalLight.position, 'y', 0, 20)
	folder_ambiantligth.add(directionalLight.position, 'z', -10, 10)

	let folder_spotlight = gui.addFolder('spot ligth')
	folder_spotlight.add(spotLight, 'intensity', 0, 10)
	folder_spotlight.add(spotLight, 'penumbra', 0.0, 1.0)
	folder_spotlight.add(spotLight.position, 'x', -10, 10)
	folder_spotlight.add(spotLight.position, 'y', 0, 20)
	folder_spotlight.add(spotLight.position, 'z', -10, 10)

	update(composer, scene, camera, controls, stats, clock)

	return scene

}


function update(renderer, scene, camera, controls, stats, clock) {
	controls.update()
	stats.update()

  let elapsedTime = clock.getElapsedTime()

	 let carObj = scene.getObjectByName('car')
	 if(carObj)	carObj.rotation.y += 0.008

	renderer.render(scene, camera)

	requestAnimationFrame(function() {
		update(renderer, scene, camera, controls, stats, clock )
	})
}

let scene = init()


function getPointLight(intensity) {
	let light = new THREE.PointLight(0xffffff, intensity)
	light.castShadow = true

	return light
}

function getSpotLight(intensity) {
	let light = new THREE.SpotLight('rgb(255,255,255)', intensity)
	light.castShadow = true

	light.shadow.bias = 0.01
	light.shadow.mapSize.width = 4096
	light.shadow.mapSize.height = 4096

	return light
}

function getDirectionalLight(intensity) {
	let light = new THREE.DirectionalLight('rgb(255,255,255)', intensity)
  light.castShadow = true

	light.shadow.mapSize.width = 4096
	light.shadow.mapSize.height = 4096

	return light
}


function getPlane(size) {
	let geometry = new THREE.PlaneGeometry(size, size)
	let material = new THREE.MeshPhongMaterial({
		color: 'rgb(120, 120, 120)',
		side: THREE.DoubleSide
	})
	let mesh = new THREE.Mesh(
		geometry,
		material
	)
	mesh.receiveShadow = true
	return mesh
}

function getShpere(size, segments){
	let geometry = new THREE.SphereGeometry(size, segments, segments)
  let material = new THREE.MeshBasicMaterial ({
		color:'rgb(255,255,255)'
	})
	let mesh = new THREE.Mesh(
		geometry,
		material
	)
  mesh.receiveShadow = true
  return mesh
}


function componentToHex(c) {
  var hex = c.toString(16)
  return hex.length == 1 ? "0" + hex : hex
}

function rgbToHex(r, g, b) {
  return "0x" + componentToHex(r) + componentToHex(g) + componentToHex(b)
}
