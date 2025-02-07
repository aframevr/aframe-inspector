import Events from './Events';

// Save ortho camera FOV / position before switching to restore later.
let currentOrthoDir = '';
const orthoCameraMemory = {
  left: { position: new THREE.Vector3(-10, 0, 0), rotation: new THREE.Euler() },
  right: { position: new THREE.Vector3(10, 0, 0), rotation: new THREE.Euler() },
  top: { position: new THREE.Vector3(0, 10, 0), rotation: new THREE.Euler() },
  bottom: {
    position: new THREE.Vector3(0, -10, 0),
    rotation: new THREE.Euler()
  },
  back: { position: new THREE.Vector3(0, 0, -10), rotation: new THREE.Euler() },
  front: { position: new THREE.Vector3(0, 0, 10), rotation: new THREE.Euler() }
};

/**
 * Initialize various cameras, store original one.
 */
export function initCameras(inspector) {
  const sceneEl = inspector.sceneEl;

  const originalCamera = (inspector.currentCameraEl = sceneEl.camera.el);

  // If the current camera is the default, we should prevent AFRAME from
  // remove it once when we inject the editor's camera.
  if (inspector.currentCameraEl.hasAttribute('data-aframe-default-camera')) {
    inspector.currentCameraEl.removeAttribute('data-aframe-default-camera');
    inspector.currentCameraEl.setAttribute(
      'data-aframe-inspector',
      'default-camera'
    );
  }

  inspector.currentCameraEl.setAttribute('camera', 'active', false);

  // Create Inspector camera.
  const perspectiveCamera = (inspector.camera = new THREE.PerspectiveCamera());
  perspectiveCamera.far = 10000;
  perspectiveCamera.near = 0.01;
  perspectiveCamera.position.set(0, 1.6, 2);
  const center = new THREE.Vector3(0, 1.6, 0); // same as in viewport.js
  perspectiveCamera.lookAt(center);
  perspectiveCamera.updateMatrixWorld();
  sceneEl.object3D.add(perspectiveCamera);
  sceneEl.camera = perspectiveCamera;

  const ratio = sceneEl.canvas.width / sceneEl.canvas.height;
  const orthoCamera = new THREE.OrthographicCamera(
    -10 * ratio,
    10 * ratio,
    10,
    -10
  );
  sceneEl.object3D.add(orthoCamera);

  const cameras = (inspector.cameras = {
    perspective: perspectiveCamera,
    original: originalCamera,
    ortho: orthoCamera
  });

  // Command to switch to perspective.
  Events.on('cameraperspectivetoggle', () => {
    saveOrthoCamera(inspector.camera, currentOrthoDir);
    sceneEl.camera = inspector.camera = cameras.perspective;
    Events.emit('cameratoggle', {
      camera: inspector.camera,
      value: 'perspective'
    });
  });

  // Command to switch to ortographic.
  Events.on('cameraorthographictoggle', (dir) => {
    saveOrthoCamera(inspector.camera, currentOrthoDir);
    sceneEl.camera = inspector.camera = cameras.ortho;
    currentOrthoDir = dir;
    setOrthoCamera(cameras.ortho, dir, ratio);

    // Set initial rotation for the respective orthographic camera.
    if (
      cameras.ortho.rotation.x === 0 &&
      cameras.ortho.rotation.y === 0 &&
      cameras.ortho.rotation.z === 0
    ) {
      cameras.ortho.lookAt(0, 0, 0);
    }
    Events.emit('cameratoggle', {
      camera: inspector.camera,
      value: `ortho${dir}`
    });
  });

  return inspector.cameras;
}

function saveOrthoCamera(camera, dir) {
  if (camera.type !== 'OrthographicCamera') {
    return;
  }
  const info = orthoCameraMemory[dir];
  info.position.copy(camera.position);
  info.rotation.copy(camera.rotation);
  info.left = camera.left;
  info.right = camera.right;
  info.top = camera.top;
  info.bottom = camera.bottom;
}

function setOrthoCamera(camera, dir, ratio) {
  const info = orthoCameraMemory[dir];
  camera.left = info.left || -10 * ratio;
  camera.right = info.right || 10 * ratio;
  camera.top = info.top || 10;
  camera.bottom = info.bottom || -10;
  camera.position.copy(info.position);
  camera.rotation.copy(info.rotation);
}

/**
 * Copy position and rotation from source aframe camera to target camera.
 * Also set center for EditorControls 2m in front of camera.
 *
 * @param {Object3D} sourceCamera
 * @param {Camera} targetCamera
 * @param {EditorControls} controls
 */
export function copyCameraPosition(sourceCamera, targetCamera, controls) {
  sourceCamera.getWorldPosition(targetCamera.position);
  sourceCamera.getWorldQuaternion(targetCamera.quaternion);
  targetCamera.updateMatrixWorld();

  // Set center for EditorControls 2m in front of camera.
  const worldDirection = new THREE.Vector3();
  targetCamera.getWorldDirection(worldDirection);
  const center = targetCamera.position
    .clone()
    .addScaledVector(worldDirection, 2);
  controls.center.copy(center);
}
