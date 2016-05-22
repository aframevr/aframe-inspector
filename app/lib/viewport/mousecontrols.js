/* globals THREE */
function MouseControls (editor) {
  var objects = [];

  // object picking
  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();

  // events
  function getIntersects (point, objects) {
    mouse.set((point.x * 2) - 1, -(point.y * 2) + 1);

    raycaster.setFromCamera(mouse, editor.camera);
    return raycaster.intersectObjects(objects);
  }

  var onDownPosition = new THREE.Vector2();
  var onUpPosition = new THREE.Vector2();

  function getMousePosition (dom, x, y) {
    var rect = dom.getBoundingClientRect();
    return [ (x - rect.left) / rect.width, (y - rect.top) / rect.height ];
  }

  function handleClick () {
    if (onDownPosition.distanceTo(onUpPosition) === 0) {
      var intersects = getIntersects(onUpPosition, objects);
      if (intersects.length > 0) {
        var object = intersects[ 0 ].object;
        if (object.userData.object !== undefined) {
          // helper
          editor.select(object.userData.object);
        } else {
          editor.select(object);
        }
      } else {
        editor.select(null);
      }
    }
  }

  function onMouseDown (event) {
    event.preventDefault();
    var array = getMousePosition(editor.container, event.clientX, event.clientY);
    onDownPosition.fromArray(array);
    document.addEventListener('mouseup', onMouseUp, false);
  }

  function onMouseUp (event) {
    var array = getMousePosition(editor.container, event.clientX, event.clientY);
    onUpPosition.fromArray(array);
    handleClick();
    document.removeEventListener('mouseup', onMouseUp, false);
  }

  editor.container.addEventListener('mousedown', onMouseDown, false);
}

module.exports = MouseControls;
