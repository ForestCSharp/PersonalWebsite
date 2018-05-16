import React, { Component } from 'react'
import * as THREE from 'three'
import GLTFLoader from 'three-gltf-loader';
import { withPrefix } from 'gatsby-link'

class Scene extends Component {
  constructor(props) {
    super(props)

    this.start = this.start.bind(this)
    this.stop = this.stop.bind(this)
    this.animate = this.animate.bind(this)
  }

  componentDidMount() {
    const width = this.mount.clientWidth
    const height = this.mount.clientHeight

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(
      75,
      width / height,
      0.1,
      1000
    )

    var RenderCanvas = document.getElementById("RenderCanvas");

    const renderer = new THREE.WebGLRenderer({ antialias: true, canvas: RenderCanvas })
    const geometry = new THREE.BoxGeometry(1, 1, 1)
    const material = new THREE.MeshBasicMaterial({ color: '#433F81' })

    const loader = new GLTFLoader()

    loader.load(
        // resource URL
        withPrefix("Airship/scene.gltf"),
        // called when the resource is loaded
        function ( gltf ) {
    
            scene.add( gltf.scene );
    
            gltf.animations; // Array<THREE.AnimationClip>
            gltf.scene; // THREE.Scene
            gltf.scenes; // Array<THREE.Scene>
            gltf.cameras; // Array<THREE.Camera>
            gltf.asset; // Object
    
        },
        // called when loading is in progresses
        function ( xhr ) {
    
            console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    
        },
        // called when loading has errors
        function ( error ) {
    
            console.log( 'An error happened' );
    
        }
    )

    camera.position.y = 3
    camera.position.z = 9

    var Sun = new THREE.DirectionalLight("yellow", 5.0)
    scene.add(Sun)

    var Ambient = new THREE.AmbientLight("white", 3.0)
    scene.add(Ambient)

    renderer.setClearColor('#000000')
    renderer.setSize(width, height)

    this.scene = scene
    this.camera = camera
    this.renderer = renderer
    this.material = material

    this.mount.appendChild(this.renderer.domElement)
    this.start()
  }

  componentWillUnmount() {
    this.stop()
    this.mount.removeChild(this.renderer.domElement)
  }

  start() {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate)
    }
  }

  stop() {
    cancelAnimationFrame(this.frameId)
  }

  animate() {
    //Rotate entire scene
    this.scene.rotation.y += 0.01

    this.renderScene()
    this.frameId = window.requestAnimationFrame(this.animate)
  }

  renderScene() {
    this.renderer.render(this.scene, this.camera)
  }

  render() {
    return (
      <div
        style={{ 
            display : "flex",
            flex : 1,
            minWidth : 0,
        }}
        ref={(mount) => { this.mount = mount }}
      >
      <canvas 
        id="RenderCanvas" 
        style = {{
            flex: 4,
            minWidth: 0
        }}
      >
      {this.props.children}
      </canvas>
      </div>
    )
  }
}

export default Scene