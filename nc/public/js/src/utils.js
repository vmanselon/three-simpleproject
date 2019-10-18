import * as THREE from '../three/build/three.module.js'

// color
let  createColorRange = function(c1, c2) {
    let colorList = [], tmpColor
    for (let i=0; i<255; i++) {
        tmpColor = new THREE.Color()
        tmpColor.r = c1.r + ((i*(c2.r-c1.r))/255)
        tmpColor.g = c1.g + ((i*(c2.g-c1.g))/255)
        tmpColor.b = c1.b + ((i*(c2.b-c1.b))/255)
        colorList.push(tmpColor)
    }
    return colorList
}

// math
let percent = function(current, min, max) {
  let percent = (current/(min-max) + 0.5)
  if (percent>1) percent = 1
  else if (percent<0) percent = 0
  return percent
}

export { createColorRange, percent }
