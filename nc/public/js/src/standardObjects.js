import * as THREE from '../three/build/three.module.js'
import TWEEN from '../tween/src/Tween.js'

class Camera3D {

  constructor(name, fov, ratio, near, far, speed, mouseOrientation) {
    this.name = name
    this.camera = new THREE.PerspectiveCamera( fov, ratio, near, far )
    this.keysAnim = { origin: new THREE.Vector3( 0,0,0 ), target: new THREE.Vector3( 1,0,0 )}
    this.speed = speed
    this.mouseOrientation = mouseOrientation
    this.tween = null
    this.isControlable = true
  }

  // animate position along tween
  tweenSlicePosition(spline, target, time, easemode, delay, repeat, yoyoIsActivated){
    this.tween = new TWEEN.Tween(this.keysAnim.origin)
      .to(this.keysAnim.target, time)
      .easing(easemode)
      .delay(delay)
      .repeat(repeat)
      .yoyo( yoyoIsActivated )
      .onStart( () =>{
      	this.isControlable = false
      })
      .onUpdate(() =>{
        let camPos = spline.getPointAt( this.keysAnim.origin.x )
        this.camera.position.copy( camPos )
        let camRot = new THREE.Euler(
          this.camera.rotation.x + ((target.x - this.camera.rotation.x )*this.keysAnim.origin.x),
          this.camera.rotation.y + ((target.y - this.camera.rotation.y)*this.keysAnim.origin.x),
          this.camera.rotation.z + ((target.z - this.camera.rotation.z)*this.keysAnim.origin.x))
        this.camera.rotation.copy(camRot )
      })
      .onComplete(() =>{
        this.isControlable = true
      })

  }

}

class Spline3D {
  constructor(name, pointsArray) {
    this.name = name
    this.pointsArray = pointsArray
    this.line = null
  }

  drawLine(pointsRef, color){
    let points = this.pointsArray.getPoints( pointsRef )
    let geometry = new THREE.BufferGeometry().setFromPoints( points )
    let material = new THREE.LineBasicMaterial( { color : color} )
    let line = new THREE.Line( geometry, material )
    line.name = this.name
    return line
  }
}

class Geometry3D {
  constructor(name, type, size, segments) {
    this.name = name
    this.type = type
    this.size = size
    this.segments = segments
    this.mesh = null
    this.tween = null
  }

  // get mesh
  drawObject(color){
    let geometry
    switch(this.type){
      case 'sphere' :
        geometry = new THREE.SphereBufferGeometry( this.size, this.segments, this.segments )
        break
      case 'plane' :
        geometry = new THREE.PlaneBufferGeometry( this.size, this.size, this.segments, this.segments )
        break
    }
    let material = new THREE.MeshPhongMaterial( { color : color} )
    let obj = new THREE.Mesh( geometry, material )
    obj.name = this.name
    return obj
  }

  // animate mesh position with tween
  tweenPosition(posOrigin, posTarget, time, easemode, delay, repeat, yoyoIsActivated){
    this.tween = new TWEEN.Tween(posOrigin)
      .to(posTarget, time)
      .onUpdate(() =>{
        this.mesh.position.x = posOrigin.x
        this.mesh.position.y = posOrigin.y
        this.mesh.position.z = posOrigin.z
      })
      .easing(easemode)
      .delay(delay)
      .repeat(repeat)
      .yoyo( yoyoIsActivated )
  }
}

class Ligth3D {

  constructor(name, type, instensity, color, visible) {
    this.name = name
    this.type = type
    this.instensity = instensity
    this.color = color
    this.mesh = null
    this.isVisible = visible
  }

  instanciateLigth(){
    // object ligth
    let geometry = new THREE.SphereBufferGeometry( 0.05, 12, 12 )
    let material = new THREE.MeshBasicMaterial( { color : this.color} )
    let lightObj = new THREE.Mesh( geometry, material )
    lightObj.visible = this.isVisible

    //	light
    let newLight
    switch(this.type){
      case 'pointLight' :
        newLight = new THREE.PointLight(this.color , this.instensity )
        break
      case 'spotLight' :
        newLight = new THREE.SpotLight(this.color , this.instensity )
        break
      case 'directionalLight' :
        newLight = new THREE.DirectionalLight(this.color , this.instensity )
        break
    }
  	newLight.castShadow = true
    newLight.add(lightObj)
    newLight.name = this.name

    return newLight
  }
}

class ParticlesPlane3D {
  constructor(name, amount, separation, amplitudePosition, amplitudeScale, amplitude, speed, speedMax ) {
    this.name = name
    this.amountX = amount
    this.amountY = amount
    this.separation = separation
    this.particles = null
    this.count = 0
    this.amplitudePosition = amplitudePosition
    this.amplitudeScale = amplitudeScale
    this.amplitudeSpeed = amplitude
    this.dirSpeedOrign = speed
    this.dirSpeed = speed
    this.dirSpeedMax = speedMax
    this.isPlaying = true
  }

  // get particles
  draw ( size, segments, color){
    let particles = new THREE.Group()
    const geo = new THREE.SphereBufferGeometry(size, segments, segments)
    const mat = new THREE.MeshBasicMaterial({color: color})
    for (var ix = 0; ix < this.amountX; ix++)
  		for (var iy = 0; iy < this.amountY; iy++)
          particles.add(new THREE.Mesh(geo,mat))
    this.particles = particles
    return particles
  }

  update(){
    this.waveAnimation()
    this.moveDircetion()

    if(this.dirSpeed > this.dirSpeedOrign) this.dirSpeed -=this.dirSpeed/50
    else this.dirSpeed = this.dirSpeedOrign
  }

  waveAnimation(){
    let i = 0
    for (var ix = 0; ix < this.amountX; ix++) {
      for (var iy = 0; iy < this.amountY; iy++) {
        let particle = this.particles.children[i++]
        particle.position.y = (Math.sin((ix + this.count) * 0.3) * this.amplitudePosition) + (Math.sin((iy + this.count) * 0.5) * this.amplitudePosition)
        particle.scale.x = particle.scale.y = particle.scale.z = (Math.sin((ix + this.count) * 0.3) + 1.8) * this.amplitudeScale + (Math.sin((iy + this.count) * 0.5) + 1) * this.amplitudeScale
      }
    }
    this.count += this.amplitudeSpeed
  }

  moveDircetion(){
    let i = 0
    let limit = this.amountX * this.separation / 2
    for (var ix = 0; ix < this.amountX; ix++) {
      for (var iy = 0; iy < this.amountY; iy++) {
        let particle = this.particles.children[i++]
        particle.position.z += this.dirSpeed
        if(particle.position.z > limit) particle.position.z = -limit
        else if(particle.position.z < -limit) particle.position.z = limit
      }
    }
  }

  followPlane(){
    let i = 0
    for (var ix = 0; ix < this.amountX; ix++) {
  		for (var iy = 0; iy < this.amountY; iy++) {
  			this.particles.children[i].position.x = ix * this.separation - ((this.amountY * this.separation) / 2)
  			this.particles.children[i].position.z = iy * this.separation - ((this.amountY * this.separation) / 2)
  			i++
      }
  	}
    this.isPlaying = true
  }

  followShape(){
    for (var i = 0; i < this.particles.children.length; i++) {
      this.particles.children[i].position.copy (new THREE.Vector3(0,0,0))
    }
  }

}

export {Camera3D, Spline3D, Geometry3D, Ligth3D, ParticlesPlane3D }
