import './style.css'
import * as THREE from 'three'
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"


/**
 * Canvas
 */

const canvas = document.querySelector('canvas.webgl')

/**
 * Scene
 */
const scene = new THREE.Scene()

/**
 * Textures
 */
const textures = new THREE.TextureLoader()
const particleTexture = textures.load('/9.png')
const earthTexture1 = textures.load('/earth_edited.jpg')

/**
 * Sizes
 */

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

/**
 * camera
 */

const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1,10)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2
scene.add(camera)


/**
 * Particles
 */
// Creating a geometry instance
const particlesGeo = new THREE.BufferGeometry()
// Total amount of particles
const particleCount = 2000
// Creating an array for random positions
const positions = new Float32Array(particleCount * 3)

for (let i = 0; i < particleCount * 3; i++){
    positions[i] = (Math.random() - 0.5) * 10
}
// Setting a new attribute to the particles geometry
particlesGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
// Setting the particles material
const particlesMaterial = new THREE.PointsMaterial({
    size: 0.03,
    sizeAttenuation: true,
    transparent: true,
    alphaMap: particleTexture
})
particlesMaterial.map = particleTexture
const particles = new THREE.Points(particlesGeo, particlesMaterial)
scene.add(particles)

/**
 * Sphere
 */
const sphereGeo = new THREE.SphereGeometry(0.7,32,32)
const sphereMaterial = new THREE.MeshPhongMaterial({
    map: earthTexture1
})
const sphere = new THREE.Mesh(sphereGeo, sphereMaterial)
scene.add(sphere)

/**
 * Coordinate Dots
 */
// Mesh for adding the coordinates
const novaScotiaPin = new THREE.Mesh(new THREE.SphereGeometry(0.02,16,16), new THREE.MeshBasicMaterial({color:0xDC143C}))
const calgaryPin = new THREE.Mesh(new THREE.SphereGeometry(0.02,16,16), new THREE.MeshBasicMaterial({color:0xDC143C}))

// Radius for how far the dot extrudes
const radius = 0.681

// Nova Scotia Pin
const novaScotia = {
    lat: 40.2048,
    long: 66.0331
}
let xNS = radius * Math.cos(novaScotia.lat * Math.PI/180) * Math.cos(novaScotia.long * Math.PI/180)
let yNS = radius * Math.cos(novaScotia.lat * Math.PI/180) * Math.sin(novaScotia.long * Math.PI/180)
let zNS = radius * Math.sin(novaScotia.lat * Math.PI/180)
novaScotiaPin.position.set(xNS,yNS,zNS)

// Calgary Pin
const calgary = {
    lat: 51.0447,
    long: 114.0719
}
let xC = radius * Math.cos(calgary.lat * Math.PI/180) * Math.cos(calgary.long * Math.PI/180)
let yC = radius * Math.cos(calgary.lat * Math.PI/180) * Math.sin(calgary.long * Math.PI/180)
let zC = radius * Math.sin(calgary.lat * Math.PI/180)
calgaryPin.position.set(xC,yC,zC)

scene.add(novaScotiaPin, calgaryPin)

/**
 * Raycaster for the eventlisteners
 */

const raycaster = new THREE.Raycaster();
const raycaster1 = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Event listener for the location of the mouse pointer
window.addEventListener('mousemove', (event) => {

    mouse.x = ( event.clientX / sizes.width) * 2 - 1;
    mouse.y = - ( event.clientY / sizes.height) * 2 + 1;

})

/**
 * lights
 */
//AmbientLight
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
scene.add(ambientLight)

//Point light
const pointLight = new THREE.PointLight(0x87CEFA, 0.6)
pointLight.position.set(5,3,5)
scene.add(pointLight)

/**
 * Orbit controls
 */
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
// Setting the min and max zoom distances
controls.minDistance = 1.2
controls.maxDistance = 6.5

/**
 * Resizing the window
 */
window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({canvas: canvas})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */

const tick = () => {
    raycaster.setFromCamera(mouse, camera)
    raycaster1.setFromCamera(mouse, camera)

    const novaTest = [novaScotiaPin]
    const calTest = [calgaryPin]
    const intersects = raycaster.intersectObjects(novaTest)
    const intersects1 = raycaster1.intersectObjects(calTest)

    for(const object of novaTest) {
        if (intersects.find(intersect => intersect.object === object)) {
            document.getElementById('novaScotiaDescription').style.visibility = 'visible';
        } else {
            document.getElementById('novaScotiaDescription').style.visibility = 'hidden';
        }
    }
    for(const object of calTest) {
        if (intersects1.find(intersect => intersect.object === object)) {
            document.getElementById('calgaryDescription').style.visibility = 'visible';
        } else {
            document.getElementById('calgaryDescription').style.visibility = 'hidden';
        }
    }


    // Call tick again on the next frame
    window.requestAnimationFrame(tick)

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

}
tick()