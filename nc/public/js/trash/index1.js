function init() {
	let scene = new THREE.Scene()
	let stats = new Stats()
	document.body.appendChild(stats.dom)
  let clock = new THREE.Clock()
  let gui = new dat.GUI()

  // fog
	let enableFog = true
	if (enableFog) {
	scene.fog = new THREE.FogExp2('rgb(255, 255, 255)', 0.05)
	}

	// camera
	let camera = new THREE.PerspectiveCamera(
		50,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	)
	camera.position.set(5,5,10)
	camera.lookAt(new THREE.Vector3(0,0,0))
	scene.add(camera)

	// ligths
	let directionalLight = getDirectionalLight(0.9)
	directionalLight.name = 'directionalLight'
	let directionalLightObj = getShpere (0.05, 5)
	directionalLight.add(directionalLightObj)
	directionalLight.position.set(3.4,3,3)
	let directionalLightColor = 0xff0000
	directionalLightObj.material.color.setHex( directionalLightColor );
	directionalLight.color.setHex( directionalLightColor );
	scene.add(directionalLight)

	let spotLight = getSpotLight(2.5)
	//spotLight.
	spotLight.name = 'spotLight'
	let spotLightObj = getShpere (0.05, 5)
	spotLight.add(spotLightObj)
	spotLight.position.set(-4, 1.7, 0)
	spotLight.penumbra = 0.11
	let spotLigthColor =0x0000ff
	spotLightObj.material.color.setHex( spotLigthColor );
	spotLight.color.setHex( spotLigthColor );
	scene.add(spotLight)

  // objects
	let floor = getPlane(10)
	floor.name = 'floor'
	floor.rotation.x = Math.PI/2
	scene.add(floor)

	let sphere = getShpere(1,64)
	sphere.position.y = 1
	sphere.material = new THREE.MeshPhongMaterial ({
		color:'rgb(120, 120, 120)',
		blending: THREE.AdditiveBlending
	})
	sphere.castShadow = true
	let sphere2 = getShpere(1.01,24)
	sphere2.position.y = 1
	sphere2.material = new THREE.MeshPhongMaterial ({
		color: 0xeeeeee,
		blending: THREE.AdditiveBlending,
		wireframe: true
	})
	sphere2.castShadow =false
	sphere2.receiveShadow = false
	scene.add(sphere)
	scene.add(sphere2)

  // renderer
	let renderer = new THREE.WebGLRenderer()
	renderer.setSize(window.innerWidth, window.innerHeight)
	renderer.shadowMap.enabled = true
	renderer.setClearColor('rgb(120, 120, 120)')

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

	document.getElementById('webgl').appendChild(renderer.domElement)

	update(renderer, scene, camera, controls, stats, clock)

	return scene

}


function update(renderer, scene, camera, controls, stats, clock) {
	controls.update()
	stats.update()

  let elapsedTime = clock.getElapsedTime()

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

	light.shadow.bias = 0.001
	light.shadow.mapSize.width = 2048
	light.shadow.mapSize.height = 2048

	return light
}

function getDirectionalLight(intensity) {
	let light = new THREE.DirectionalLight('rgb(255,255,255)', intensity)
  light.castShadow = true

	light.shadow.mapSize.width = 2048;
	light.shadow.mapSize.height = 2048;

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
