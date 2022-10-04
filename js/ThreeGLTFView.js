
import ComponentView from 'core/js/views/componentView';

import * as THREE from 'libraries/three';
import 'libraries/GLTFLoader';
import 'libraries/DRACOLoader';
import 'libraries/OrbitControls';

class ThreeGLTFView extends ComponentView {

  postRender() {
    this.setupScene();
    this.setupInviewCompletion();
  }

  setupScene() {
    const _scene = this.model.get('_scene');

    const { fov, aspect, near, far, position } = this.model.get('_camera');

    const $container = this.$('.threegltf__rendered');

    this.scene = new THREE.Scene();
    const alphaRenderer = _scene.background === '';
    if (!alphaRenderer) {
      this.scene.background = new THREE.Color(_scene.background);
    }

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: alphaRenderer });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.renderer.outputEncoding = THREE.sRGBEncoding;

    $container[0].appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    this.camera.position.set(position.x, position.y, position.z);
    this.scene.add(this.camera);

    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);

    const ambientLight = _scene.ambientLight;
    const ambient = new THREE.AmbientLight(ambientLight.color, ambientLight.intensity);
    this.scene.add(ambient);

    const directionalLight = _scene.directionalLight;
    const directional = new THREE.DirectionalLight(directionalLight.color, directionalLight.intensity);
    directional.position.set(directionalLight.position.x, directionalLight.position.y, directionalLight.position.z);
    this.scene.add(directional);

    this.mixer = null;

    this.controls.target.set(0, 0.5, 0);
    this.controls.update();
    this.controls.enablePan = false;
    this.controls.enableDamping = true;

    this.loadModel();
  }

  loadModel() {
    const { src, scale } = this.model.get('_model');
    const dracoLoader = new THREE.DRACOLoader();
    const loader = new THREE.GLTFLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
    dracoLoader.setDecoderConfig({ type: 'js' });
    loader.setDRACOLoader(dracoLoader);
    loader.load(src, function (model3d) {
      const modelScene = model3d.scene;
      modelScene.position.set(1, 1, 0);
      modelScene.scale.set(scale, scale, scale);

      if (model3d.animations.length > 0) {
        this.clock = new THREE.Clock();
        this.mixer = new THREE.AnimationMixer(modelScene);
        this.mixer.clipAction(model3d.animations[0]).play();
      }
      this.scene.add(modelScene);
      this.renderLoop();
      this.setReadyStatus();
    }.bind(this), undefined, function (e) {
      this.setReadyStatus();
      console.error(e);

    });
  }

  renderLoop() {

    if (this.resizeRendererToDisplaySize(this.renderer)) {
      const canvas = this.renderer.domElement;
      this.camera.aspect = canvas.clientWidth / canvas.clientHeight;
      this.camera.updateProjectionMatrix();
    }
    if (this.mixer) {
      const delta = this.clock.getDelta();
      this.mixer.update(delta);
    }
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
    requestAnimationFrame(this.renderLoop.bind(this));
  }

  resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = canvas.clientWidth * pixelRatio | 0;
    const height = canvas.clientHeight * pixelRatio | 0;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      this.renderer.setSize(width, height, false);
    }
    return needResize;
  }
}

ThreeGLTFView.template = 'threeGLTF.jsx';

export default ThreeGLTFView;
