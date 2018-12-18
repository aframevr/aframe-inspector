import Events from './Events';

// Save ortho camera FOV / position before switching to restore later.
let currentOrthoDir = '';
const orthoCameraMemory = {
  left: {position: new THREE.Vector3(-10, 0, 0), rotation: new THREE.Euler()},
  right: {position: new THREE.Vector3(10, 0, 0), rotation: new THREE.Euler()},
  top: {position: new THREE.Vector3(0, 10, 0), rotation: new THREE.Euler()},
  bottom: {position: new THREE.Vector3(0, -10, 0), rotation: new THREE.Euler()},
  back: {position: new THREE.Vector3(0, 0, -10), rotation: new THREE.Euler()},
  front: {position: new THREE.Vector3(0, 0, 10), rotation: new THREE.Euler()}
};

/**
 * Initialize various cameras, store original one.
 */
export function initCameras (inspector) {
  const originalCamera = inspector.currentCameraEl = inspector.sceneEl.camera.el;
  inspector.currentCameraEl.setAttribute(
    'data-aframe-inspector-original-camera',
    ''
  );

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
  const perspectiveCamera = inspector.camera = new THREE.PerspectiveCamera();
  perspectiveCamera.far = 10000;
  perspectiveCamera.near = 0.01;
  perspectiveCamera.position.set(0, 1.6, 2);
  perspectiveCamera.lookAt(new THREE.Vector3(0, 1.6, -1));
  perspectiveCamera.updateMatrixWorld();
  inspector.sceneEl.object3D.add(perspectiveCamera);
  inspector.sceneEl.camera = perspectiveCamera;

  const orthoCamera = new THREE.OrthographicCamera(-10, 10, 10, -10);
  inspector.sceneEl.object3D.add(orthoCamera);

  const cameras = inspector.cameras = {
    perspective: perspectiveCamera,
    original: originalCamera,
    ortho: orthoCamera
  };

  Events.on('cameraperspectivetoggle', () => {
    saveOrthoCamera(inspector.camera, currentOrthoDir);
    inspector.sceneEl.camera = inspector.camera = cameras.perspective;
    Events.emit('cameratoggle', {camera: inspector.camera, value: 'perspective'});
  });

  Events.on('cameraorthographictoggle', dir => {
    saveOrthoCamera(inspector.camera, currentOrthoDir);
    inspector.sceneEl.camera = inspector.camera = cameras.ortho;
    currentOrthoDir = dir;
    setOrthoCamera(cameras.ortho, dir);

    // Set initial rotation for the respective orthographic camera.
    if (cameras.ortho.rotation.x === 0 && cameras.ortho.rotation.y === 0 &&
        cameras.ortho.rotation.z === 0) {
      cameras.ortho.lookAt(0, 0, 0);
    }
    Events.emit('cameratoggle', {camera: inspector.camera, value: `ortho${dir}`});
  });

  return inspector.cameras;
};

function saveOrthoCamera (camera, dir) {
  if (camera.type !== 'OrthographicCamera') { return; }
  const info = orthoCameraMemory[dir];
  info.position.copy(camera.position);
  info.rotation.copy(camera.rotation);
  info.left = camera.left;
  info.right = camera.right;
  info.top = camera.top;
  info.bottom = camera.bottom;
}

function setOrthoCamera (camera, dir) {
  const info = orthoCameraMemory[dir];
  camera.left = info.left || -10;
  camera.right = info.right || 10;
  camera.top = info.top || 10;
  camera.bottom = info.bottom || -10;
  camera.position.copy(info.position);
  camera.rotation.copy(info.rotation);
}

