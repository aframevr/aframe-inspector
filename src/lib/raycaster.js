const Events = require('./Events');
const debounce = require('lodash.debounce');

function initRaycaster(inspector) {
  // Use cursor="rayOrigin: mouse".
  const mouseCursor = document.createElement('a-entity');
  mouseCursor.setAttribute('id', 'aframeInspectorMouseCursor');
  mouseCursor.setAttribute('cursor', 'rayOrigin', 'mouse');
  mouseCursor.setAttribute('data-aframe-inspector', 'true');
  mouseCursor.setAttribute('raycaster', {
    interval: 100,
    objects: 'a-scene :not([data-aframe-inspector])'
  });

  // Only visible objects.
  const raycaster = mouseCursor.components.raycaster;
  const refreshObjects = raycaster.refreshObjects;
  const overrideRefresh = () => {
    refreshObjects.call(raycaster);
    const objects = raycaster.objects;
    raycaster.objects = objects.filter(node => {
      while (node) {
        if (!node.visible) { return false; }
        node = node.parent;
      }
      return true;
    });
  };
  raycaster.refreshObjects = overrideRefresh;

  inspector.sceneEl.appendChild(mouseCursor);
  inspector.cursor = mouseCursor;

  inspector.sceneEl.addEventListener(
    'child-attached',
    debounce(function() {
      mouseCursor.components.raycaster.refreshObjects();
    }, 250)
  );

  mouseCursor.addEventListener('click', handleClick);
  mouseCursor.addEventListener('mouseenter', onMouseEnter);
  mouseCursor.addEventListener('mouseleave', onMouseLeave);
  inspector.container.addEventListener('mousedown', onMouseDown);
  inspector.container.addEventListener('mouseup', onMouseUp);
  inspector.container.addEventListener('dblclick', onDoubleClick);

  inspector.sceneEl.canvas.addEventListener('mouseleave', () => {
    setTimeout(() => {
      Events.emit('raycastermouseleave', null);
    });
  });

  const onDownPosition = new THREE.Vector2();
  const onUpPosition = new THREE.Vector2();
  const onDoubleClickPosition = new THREE.Vector2();

  function onMouseEnter() {
    Events.emit('raycastermouseenter', mouseCursor.components.cursor.intersectedEl);
  }

  function onMouseLeave() {
    Events.emit(
      'raycastermouseleave',
      mouseCursor.components.cursor.intersectedEl
    );
  }

  function handleClick(evt) {
    // Check to make sure not dragging.
    const DRAG_THRESHOLD = 0.03;
    if (onDownPosition.distanceTo(onUpPosition) >= DRAG_THRESHOLD) {
      return;
    }
    inspector.selectEntity(evt.detail.intersectedEl);
  }

  function onMouseDown(event) {
    if (event instanceof CustomEvent) {
      return;
    }
    event.preventDefault();
    const array = getMousePosition(
      inspector.container,
      event.clientX,
      event.clientY
    );
    onDownPosition.fromArray(array);
  }

  function onMouseUp(event) {
    if (event instanceof CustomEvent) {
      return;
    }
    event.preventDefault();
    const array = getMousePosition(
      inspector.container,
      event.clientX,
      event.clientY
    );
    onUpPosition.fromArray(array);
  }

  function onTouchStart(event) {
    const touch = event.changedTouches[0];
    const array = getMousePosition(
      inspector.container,
      touch.clientX,
      touch.clientY
    );
    onDownPosition.fromArray(array);
  }

  function onTouchEnd(event) {
    const touch = event.changedTouches[0];
    const array = getMousePosition(
      inspector.container,
      touch.clientX,
      touch.clientY
    );
    onUpPosition.fromArray(array);
  }

  /**
   * Focus on double click.
   */
  function onDoubleClick(event) {
    const array = getMousePosition(
      inspector.container,
      event.clientX,
      event.clientY
    );
    onDoubleClickPosition.fromArray(array);
    const intersectedEl = mouseCursor.components.cursor.intersectedEl;
    if (!intersectedEl) {
      return;
    }
    Events.emit('objectfocus', intersectedEl.object3D);
  }

  return {
    el: mouseCursor,
    enable: () => {
      mouseCursor.setAttribute('raycaster', 'enabled', true);
    },
    disable: () => {
      mouseCursor.setAttribute('raycaster', 'enabled', false);
    }
  };
}
module.exports.initRaycaster = initRaycaster;

function getMousePosition(dom, x, y) {
  const rect = dom.getBoundingClientRect();
  return [(x - rect.left) / rect.width, (y - rect.top) / rect.height];
}
