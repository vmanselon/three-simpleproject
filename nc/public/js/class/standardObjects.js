import * as THREE from '../three/build/three.module.js'
import TWEEN from '../tween/src/Tween.js'

class Camera3D {

  constructor(name, fov, ratio, near, far, speed) {
    this.name = name
    this.camera = new THREE.PerspectiveCamera( fov, ratio, near, far )
    this.keysAnim = { origin: new THREE.Vector3( 0,0,0 ), target: new THREE.Vector3( 1,0,0 )}
    this.speed = speed
    this.tween = null
  }

  // animate mesh position with tween
  tweenSlicePosition(spline, target, time, easemode, delay, repeat, yoyoIsActivated){
    this.tween = new TWEEN.Tween(this.keysAnim.origin)
      .to(this.keysAnim.target, time)
      .onUpdate(() =>{
        let camPos = spline.getPointAt( this.keysAnim.origin.x )
        this.camera.position.copy( camPos )
        this.camera.lookAt(target)
      })
      .easing(easemode)
      .delay(delay)
      .repeat(repeat)
      .yoyo( yoyoIsActivated )
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
  constructor(name, type) {
    this.name = name
    this.type = type
    this.mesh = null
    this.tween = null
  }

  // get mesh
  drawMesh(size, segments, color){
    let geometry
    switch(this.type){
      case 'sphere' :
        geometry = new THREE.SphereBufferGeometry( size, segments, segments )
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

export {Camera3D, Spline3D, Geometry3D, Ligth3D }
