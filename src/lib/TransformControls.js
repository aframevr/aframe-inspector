/**
 * @author arodic / https://github.com/arodic
 */

(function() {
  'use strict';

  class GizmoMaterial extends THREE.MeshBasicMaterial {
    constructor(parameters) {
      super();

      this.depthTest = false;
      this.depthWrite = false;
      this.fog = false;
      this.side = THREE.FrontSide;
      this.transparent = true;

      this.setValues(parameters);

      this.oldColor = this.color.clone();
      this.oldOpacity = this.opacity;

      this.highlight = function(highlighted) {
        if (highlighted) {
          this.color.setRGB(1, 1, 0);
          this.opacity = 1;
        } else {
          this.color.copy(this.oldColor);
          this.opacity = this.oldOpacity;
        }
      };
    }
  }

  class GizmoLineMaterial extends THREE.LineBasicMaterial {
    constructor(parameters) {
      super();

      this.depthTest = false;
      this.depthWrite = false;
      this.fog = false;
      this.transparent = true;
      this.linewidth = 1;

      this.setValues(parameters);

      this.oldColor = this.color.clone();
      this.oldOpacity = this.opacity;

      this.highlight = function(highlighted) {
        if (highlighted) {
          this.color.setRGB(1, 1, 0);
          this.opacity = 1;
        } else {
          this.color.copy(this.oldColor);
          this.opacity = this.oldOpacity;
        }
      };
    }
  }

  var pickerMaterial = new GizmoMaterial({
    visible: false,
    transparent: false
  });

  THREE.TransformGizmo = class TransformGizmo extends THREE.Object3D {
    init() {
      this.handles = new THREE.Object3D();
      this.pickers = new THREE.Object3D();
      this.planes = new THREE.Object3D();

      this.add(this.handles);
      this.add(this.pickers);
      this.add(this.planes);

      //// PLANES

      var planeGeometry = new THREE.PlaneGeometry(50, 50, 2, 2);
      var planeMaterial = new THREE.MeshBasicMaterial({
        visible: false,
        side: THREE.DoubleSide
      });

      var planes = {
        XY: new THREE.Mesh(planeGeometry, planeMaterial),
        YZ: new THREE.Mesh(planeGeometry, planeMaterial),
        XZ: new THREE.Mesh(planeGeometry, planeMaterial),
        XYZE: new THREE.Mesh(planeGeometry, planeMaterial)
      };

      this.activePlane = planes['XYZE'];

      planes['YZ'].rotation.set(0, Math.PI / 2, 0);
      planes['XZ'].rotation.set(-Math.PI / 2, 0, 0);

      for (var i in planes) {
        planes[i].name = i;
        this.planes.add(planes[i]);
        this.planes[i] = planes[i];
      }

      //// HANDLES AND PICKERS

      var setupGizmos = function(gizmoMap, parent) {
        for (var name in gizmoMap) {
          for (i = gizmoMap[name].length; i--; ) {
            var object = gizmoMap[name][i][0];
            var position = gizmoMap[name][i][1];
            var rotation = gizmoMap[name][i][2];

            object.name = name;

            object.renderOrder = Infinity; // avoid being hidden by other transparent objects

            if (position)
              object.position.set(position[0], position[1], position[2]);
            if (rotation)
              object.rotation.set(rotation[0], rotation[1], rotation[2]);

            parent.add(object);
          }
        }
      };

      setupGizmos(this.handleGizmos, this.handles);
      setupGizmos(this.pickerGizmos, this.pickers);

      // reset Transformations

      this.traverse(function(child) {
        if (child instanceof THREE.Mesh) {
          child.updateMatrix();

          var tempGeometry = child.geometry.clone();
          tempGeometry.applyMatrix4(child.matrix);
          child.geometry = tempGeometry;

          child.position.set(0, 0, 0);
          child.rotation.set(0, 0, 0);
          child.scale.set(1, 1, 1);
        }
      });
    }

    highlight(axis) {
      this.traverse(function(child) {
        if (child.material && child.material.highlight) {
          if (child.name === axis) {
            child.material.highlight(true);
          } else {
            child.material.highlight(false);
          }
        }
      });
    }

    update(rotation, eye) {
      var vec1 = new THREE.Vector3(0, 0, 0);
      var vec2 = new THREE.Vector3(0, 1, 0);
      var lookAtMatrix = new THREE.Matrix4();

      this.traverse(function(child) {
        if (child.name.search('E') !== -1) {
          child.quaternion.setFromRotationMatrix(
            lookAtMatrix.lookAt(eye, vec1, vec2)
          );
        } else if (
          child.name.search('X') !== -1 ||
          child.name.search('Y') !== -1 ||
          child.name.search('Z') !== -1
        ) {
          child.quaternion.setFromEuler(rotation);
        }
      });
    }
  };

  THREE.TransformGizmoTranslate = class TransformGizmoTranslate extends THREE.TransformGizmo {
    constructor() {
      super();

      var arrowGeometry = new THREE.ConeGeometry(0.05, 0.2, 12, 1, false);
      arrowGeometry.translate(0, 0.5, 0);

      var lineXGeometry = new THREE.BufferGeometry();
      lineXGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0], 3)
      );

      var lineYGeometry = new THREE.BufferGeometry();
      lineYGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute([0, 0, 0, 0, 1, 0], 3)
      );

      var lineZGeometry = new THREE.BufferGeometry();
      lineZGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 1], 3)
      );

      this.handleGizmos = {
        X: [
          [
            new THREE.Mesh(arrowGeometry, new GizmoMaterial({ color: 0xff0000 })),
            [0.5, 0, 0],
            [0, 0, -Math.PI / 2]
          ],
          [
            new THREE.Line(
              lineXGeometry,
              new GizmoLineMaterial({ color: 0xff0000 })
            )
          ]
        ],

        Y: [
          [
            new THREE.Mesh(arrowGeometry, new GizmoMaterial({ color: 0x00ff00 })),
            [0, 0.5, 0]
          ],
          [
            new THREE.Line(
              lineYGeometry,
              new GizmoLineMaterial({ color: 0x00ff00 })
            )
          ]
        ],

        Z: [
          [
            new THREE.Mesh(arrowGeometry, new GizmoMaterial({ color: 0x0000ff })),
            [0, 0, 0.5],
            [Math.PI / 2, 0, 0]
          ],
          [
            new THREE.Line(
              lineZGeometry,
              new GizmoLineMaterial({ color: 0x0000ff })
            )
          ]
        ],

        XYZ: [
          [
            new THREE.Mesh(
              new THREE.OctahedronGeometry(0.1, 0),
              new GizmoMaterial({ color: 0xffffff, opacity: 0.25 })
            ),
            [0, 0, 0],
            [0, 0, 0]
          ]
        ],

        XY: [
          [
            new THREE.Mesh(
              new THREE.PlaneGeometry(0.29, 0.29),
              new GizmoMaterial({ color: 0xffff00, opacity: 0.25 })
            ),
            [0.15, 0.15, 0]
          ]
        ],

        YZ: [
          [
            new THREE.Mesh(
              new THREE.PlaneGeometry(0.29, 0.29),
              new GizmoMaterial({ color: 0x00ffff, opacity: 0.25 })
            ),
            [0, 0.15, 0.15],
            [0, Math.PI / 2, 0]
          ]
        ],

        XZ: [
          [
            new THREE.Mesh(
              new THREE.PlaneGeometry(0.29, 0.29),
              new GizmoMaterial({ color: 0xff00ff, opacity: 0.25 })
            ),
            [0.15, 0, 0.15],
            [-Math.PI / 2, 0, 0]
          ]
        ]
      };

      this.pickerGizmos = {
        X: [
          [
            new THREE.Mesh(
              new THREE.CylinderGeometry(0.2, 0, 1, 4, 1, false),
              pickerMaterial
            ),
            [0.6, 0, 0],
            [0, 0, -Math.PI / 2]
          ]
        ],

        Y: [
          [
            new THREE.Mesh(
              new THREE.CylinderGeometry(0.2, 0, 1, 4, 1, false),
              pickerMaterial
            ),
            [0, 0.6, 0]
          ]
        ],

        Z: [
          [
            new THREE.Mesh(
              new THREE.CylinderGeometry(0.2, 0, 1, 4, 1, false),
              pickerMaterial
            ),
            [0, 0, 0.6],
            [Math.PI / 2, 0, 0]
          ]
        ],

        XYZ: [
          [new THREE.Mesh(new THREE.OctahedronGeometry(0.2, 0), pickerMaterial)]
        ],

        XY: [
          [
            new THREE.Mesh(
              new THREE.PlaneGeometry(0.4, 0.4),
              pickerMaterial
            ),
            [0.2, 0.2, 0]
          ]
        ],

        YZ: [
          [
            new THREE.Mesh(
              new THREE.PlaneGeometry(0.4, 0.4),
              pickerMaterial
            ),
            [0, 0.2, 0.2],
            [0, Math.PI / 2, 0]
          ]
        ],

        XZ: [
          [
            new THREE.Mesh(
              new THREE.PlaneGeometry(0.4, 0.4),
              pickerMaterial
            ),
            [0.2, 0, 0.2],
            [-Math.PI / 2, 0, 0]
          ]
        ]
      };

      this.init();
    }

    setActivePlane(axis, eye) {
      var tempMatrix = new THREE.Matrix4();
      eye.applyMatrix4(
        tempMatrix
          .copy(tempMatrix.extractRotation(this.planes['XY'].matrixWorld))
          .invert()
      );

      if (axis === 'X') {
        this.activePlane = this.planes['XY'];

        if (Math.abs(eye.y) > Math.abs(eye.z))
          this.activePlane = this.planes['XZ'];
      }

      if (axis === 'Y') {
        this.activePlane = this.planes['XY'];

        if (Math.abs(eye.x) > Math.abs(eye.z))
          this.activePlane = this.planes['YZ'];
      }

      if (axis === 'Z') {
        this.activePlane = this.planes['XZ'];

        if (Math.abs(eye.x) > Math.abs(eye.y))
          this.activePlane = this.planes['YZ'];
      }

      if (axis === 'XYZ') this.activePlane = this.planes['XYZE'];

      if (axis === 'XY') this.activePlane = this.planes['XY'];

      if (axis === 'YZ') this.activePlane = this.planes['YZ'];

      if (axis === 'XZ') this.activePlane = this.planes['XZ'];
    }
  };

  THREE.TransformGizmoRotate = class TransformGizmoRotate extends THREE.TransformGizmo {
    constructor() {
      super();

      var CircleGeometry = function(radius, facing, arc) {
        var geometry = new THREE.BufferGeometry();
        var vertices = [];
        arc = arc ? arc : 1;

        for (var i = 0; i <= 64 * arc; ++i) {
          if (facing === 'x')
            vertices.push(
              0,
              Math.cos((i / 32) * Math.PI) * radius,
              Math.sin((i / 32) * Math.PI) * radius
            );
          if (facing === 'y')
            vertices.push(
              Math.cos((i / 32) * Math.PI) * radius,
              0,
              Math.sin((i / 32) * Math.PI) * radius
            );
          if (facing === 'z')
            vertices.push(
              Math.sin((i / 32) * Math.PI) * radius,
              Math.cos((i / 32) * Math.PI) * radius,
              0
            );
        }

        geometry.setAttribute(
          'position',
          new THREE.Float32BufferAttribute(vertices, 3)
        );
        return geometry;
      };

      this.handleGizmos = {
        X: [
          [
            new THREE.Line(
              new CircleGeometry(1, 'x', 0.5),
              new GizmoLineMaterial({ color: 0xff0000 })
            )
          ]
        ],

        Y: [
          [
            new THREE.Line(
              new CircleGeometry(1, 'y', 0.5),
              new GizmoLineMaterial({ color: 0x00ff00 })
            )
          ]
        ],

        Z: [
          [
            new THREE.Line(
              new CircleGeometry(1, 'z', 0.5),
              new GizmoLineMaterial({ color: 0x0000ff })
            )
          ]
        ],

        E: [
          [
            new THREE.Line(
              new CircleGeometry(1.25, 'z', 1),
              new GizmoLineMaterial({ color: 0xcccc00 })
            )
          ]
        ],

        XYZE: [
          [
            new THREE.Line(
              new CircleGeometry(1, 'z', 1),
              new GizmoLineMaterial({ color: 0x787878 })
            )
          ]
        ]
      };

      this.pickerGizmos = {
        X: [
          [
            new THREE.Mesh(
              new THREE.TorusGeometry(1, 0.12, 4, 12, Math.PI),
              pickerMaterial
            ),
            [0, 0, 0],
            [0, -Math.PI / 2, -Math.PI / 2]
          ]
        ],

        Y: [
          [
            new THREE.Mesh(
              new THREE.TorusGeometry(1, 0.12, 4, 12, Math.PI),
              pickerMaterial
            ),
            [0, 0, 0],
            [Math.PI / 2, 0, 0]
          ]
        ],

        Z: [
          [
            new THREE.Mesh(
              new THREE.TorusGeometry(1, 0.12, 4, 12, Math.PI),
              pickerMaterial
            ),
            [0, 0, 0],
            [0, 0, -Math.PI / 2]
          ]
        ],

        E: [
          [
            new THREE.Mesh(
              new THREE.TorusGeometry(1.25, 0.12, 2, 24),
              pickerMaterial
            )
          ]
        ],

        XYZE: [
          [
            new THREE.Mesh(
              new THREE.TorusGeometry(1, 0.12, 2, 24),
              pickerMaterial
            )
          ]
        ]
      };

      this.pickerGizmos.XYZE[0][0].visible = false; // disable XYZE picker gizmo

      this.init();
    }

    setActivePlane(axis) {
      if (axis === 'E') this.activePlane = this.planes['XYZE'];

      if (axis === 'X') this.activePlane = this.planes['YZ'];

      if (axis === 'Y') this.activePlane = this.planes['XZ'];

      if (axis === 'Z') this.activePlane = this.planes['XY'];
    }

    update(rotation, eye2) {
      super.update(rotation, eye2);

      var tempMatrix = new THREE.Matrix4();
      var worldRotation = new THREE.Euler(0, 0, 1);
      var tempQuaternion = new THREE.Quaternion();
      var unitX = new THREE.Vector3(1, 0, 0);
      var unitY = new THREE.Vector3(0, 1, 0);
      var unitZ = new THREE.Vector3(0, 0, 1);
      var quaternionX = new THREE.Quaternion();
      var quaternionY = new THREE.Quaternion();
      var quaternionZ = new THREE.Quaternion();
      var eye = eye2.clone();

      worldRotation.copy(this.planes['XY'].rotation);
      tempQuaternion.setFromEuler(worldRotation);

      tempMatrix
        .makeRotationFromQuaternion(tempQuaternion)
        .copy(tempMatrix)
        .invert();
      eye.applyMatrix4(tempMatrix);

      this.traverse(function(child) {
        tempQuaternion.setFromEuler(worldRotation);

        if (child.name === 'X') {
          quaternionX.setFromAxisAngle(unitX, Math.atan2(-eye.y, eye.z));
          tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionX);
          child.quaternion.copy(tempQuaternion);
        }

        if (child.name === 'Y') {
          quaternionY.setFromAxisAngle(unitY, Math.atan2(eye.x, eye.z));
          tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionY);
          child.quaternion.copy(tempQuaternion);
        }

        if (child.name === 'Z') {
          quaternionZ.setFromAxisAngle(unitZ, Math.atan2(eye.y, eye.x));
          tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionZ);
          child.quaternion.copy(tempQuaternion);
        }
      });
    }
  };

  THREE.TransformGizmoScale = class TransformGizmoScale extends THREE.TransformGizmo {
    constructor() {
      super();

      var arrowGeometry = new THREE.BoxGeometry(0.125, 0.125, 0.125);
      arrowGeometry.translate(0, 0.5, 0);

      var lineXGeometry = new THREE.BufferGeometry();
      lineXGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute([0, 0, 0, 1, 0, 0], 3)
      );

      var lineYGeometry = new THREE.BufferGeometry();
      lineYGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute([0, 0, 0, 0, 1, 0], 3)
      );

      var lineZGeometry = new THREE.BufferGeometry();
      lineZGeometry.setAttribute(
        'position',
        new THREE.Float32BufferAttribute([0, 0, 0, 0, 0, 1], 3)
      );

      this.handleGizmos = {
        X: [
          [
            new THREE.Mesh(arrowGeometry, new GizmoMaterial({ color: 0xff0000 })),
            [0.5, 0, 0],
            [0, 0, -Math.PI / 2]
          ],
          [
            new THREE.Line(
              lineXGeometry,
              new GizmoLineMaterial({ color: 0xff0000 })
            )
          ]
        ],

        Y: [
          [
            new THREE.Mesh(arrowGeometry, new GizmoMaterial({ color: 0x00ff00 })),
            [0, 0.5, 0]
          ],
          [
            new THREE.Line(
              lineYGeometry,
              new GizmoLineMaterial({ color: 0x00ff00 })
            )
          ]
        ],

        Z: [
          [
            new THREE.Mesh(arrowGeometry, new GizmoMaterial({ color: 0x0000ff })),
            [0, 0, 0.5],
            [Math.PI / 2, 0, 0]
          ],
          [
            new THREE.Line(
              lineZGeometry,
              new GizmoLineMaterial({ color: 0x0000ff })
            )
          ]
        ],

        XYZ: [
          [
            new THREE.Mesh(
              new THREE.BoxGeometry(0.125, 0.125, 0.125),
              new GizmoMaterial({ color: 0xffffff, opacity: 0.25 })
            )
          ]
        ]
      };

      this.pickerGizmos = {
        X: [
          [
            new THREE.Mesh(
              new THREE.CylinderGeometry(0.2, 0, 1, 4, 1, false),
              pickerMaterial
            ),
            [0.6, 0, 0],
            [0, 0, -Math.PI / 2]
          ]
        ],

        Y: [
          [
            new THREE.Mesh(
              new THREE.CylinderGeometry(0.2, 0, 1, 4, 1, false),
              pickerMaterial
            ),
            [0, 0.6, 0]
          ]
        ],

        Z: [
          [
            new THREE.Mesh(
              new THREE.CylinderGeometry(0.2, 0, 1, 4, 1, false),
              pickerMaterial
            ),
            [0, 0, 0.6],
            [Math.PI / 2, 0, 0]
          ]
        ],

        XYZ: [
          [
            new THREE.Mesh(
              new THREE.BoxGeometry(0.4, 0.4, 0.4),
              pickerMaterial
            )
          ]
        ]
      };

      this.init();
    }

    setActivePlane (axis, eye) {
      var tempMatrix = new THREE.Matrix4();
      eye.applyMatrix4(
        tempMatrix
          .copy(tempMatrix.extractRotation(this.planes['XY'].matrixWorld))
          .invert()
      );

      if (axis === 'X') {
        this.activePlane = this.planes['XY'];
        if (Math.abs(eye.y) > Math.abs(eye.z))
          this.activePlane = this.planes['XZ'];
      }

      if (axis === 'Y') {
        this.activePlane = this.planes['XY'];
        if (Math.abs(eye.x) > Math.abs(eye.z))
          this.activePlane = this.planes['YZ'];
      }

      if (axis === 'Z') {
        this.activePlane = this.planes['XZ'];
        if (Math.abs(eye.x) > Math.abs(eye.y))
          this.activePlane = this.planes['YZ'];
      }

      if (axis === 'XYZ') this.activePlane = this.planes['XYZE'];
    }
  };

  THREE.TransformControls = class TransformControls extends THREE.Object3D {
    constructor(_camera, domElement) {
      // TODO: Make non-uniform scale and rotate play nice in hierarchies
      // TODO: ADD RXYZ contol

      super();

      domElement = domElement !== undefined ? domElement : document;

      this.object = undefined;
      this.visible = false;
      this.translationSnap = null;
      this.rotationSnap = null;
      this.space = 'world';
      this.size = 1;
      this.axis = null;

      var camera = _camera;
      var scope = this;

      var _mode = 'translate';
      var _dragging = false;
      var _gizmo = {
        translate: new THREE.TransformGizmoTranslate(),
        rotate: new THREE.TransformGizmoRotate(),
        scale: new THREE.TransformGizmoScale()
      };

      for (var type in _gizmo) {
        var gizmoObj = _gizmo[type];

        gizmoObj.visible = type === _mode;
        this.add(gizmoObj);
      }

      var changeEvent = { type: 'change' };
      var mouseDownEvent = { type: 'mouseDown' };
      var mouseUpEvent = { type: 'mouseUp', mode: _mode };
      var objectChangeEvent = { type: 'objectChange' };

      var ray = new THREE.Raycaster();
      var pointerVector = new THREE.Vector2();

      var point = new THREE.Vector3();
      var offset = new THREE.Vector3();

      var rotation = new THREE.Vector3();
      var offsetRotation = new THREE.Vector3();
      var scale = 1;

      var lookAtMatrix = new THREE.Matrix4();
      var eye = new THREE.Vector3();

      var tempMatrix = new THREE.Matrix4();
      var tempVector = new THREE.Vector3();
      var tempQuaternion = new THREE.Quaternion();
      var tempEuler = new THREE.Euler();
      var unitX = new THREE.Vector3(1, 0, 0);
      var unitY = new THREE.Vector3(0, 1, 0);
      var unitZ = new THREE.Vector3(0, 0, 1);

      var quaternionXYZ = new THREE.Quaternion();
      var quaternionX = new THREE.Quaternion();
      var quaternionY = new THREE.Quaternion();
      var quaternionZ = new THREE.Quaternion();
      var quaternionE = new THREE.Quaternion();

      var oldPosition = new THREE.Vector3();
      var oldScale = new THREE.Vector3();
      var oldRotationMatrix = new THREE.Matrix4();

      var parentRotationMatrix = new THREE.Matrix4();
      var parentScale = new THREE.Vector3();

      var worldPosition = new THREE.Vector3();
      var worldRotation = new THREE.Euler();
      var worldRotationMatrix = new THREE.Matrix4();
      var camPosition = new THREE.Vector3();
      var camRotation = new THREE.Euler();

      this.setCamera = function (_camera) {
        camera = _camera;
      }

      this.activate = function() {
        domElement.addEventListener('mousedown', onPointerDown, false);
        domElement.addEventListener('touchstart', onPointerDown, false);

        domElement.addEventListener('mousemove', onPointerHover, false);
        domElement.addEventListener('touchmove', onPointerHover, false);

        domElement.addEventListener('mousemove', onPointerMove, false);
        domElement.addEventListener('touchmove', onPointerMove, false);

        domElement.addEventListener('mouseup', onPointerUp, false);
        domElement.addEventListener('mouseout', onPointerUp, false);
        domElement.addEventListener('touchend', onPointerUp, false);
        domElement.addEventListener('touchcancel', onPointerUp, false);
        domElement.addEventListener('touchleave', onPointerUp, false);
      };

      this.activate();

      this.dispose = function() {
        domElement.removeEventListener('mousedown', onPointerDown);
        domElement.removeEventListener('touchstart', onPointerDown);

        domElement.removeEventListener('mousemove', onPointerHover);
        domElement.removeEventListener('touchmove', onPointerHover);

        domElement.removeEventListener('mousemove', onPointerMove);
        domElement.removeEventListener('touchmove', onPointerMove);

        domElement.removeEventListener('mouseup', onPointerUp);
        domElement.removeEventListener('mouseout', onPointerUp);
        domElement.removeEventListener('touchend', onPointerUp);
        domElement.removeEventListener('touchcancel', onPointerUp);
        domElement.removeEventListener('touchleave', onPointerUp);
      };

      this.attach = function(object) {
        this.object = object;
        this.visible = true;
        this.update(true);
      };

      this.detach = function() {
        this.object = undefined;
        this.visible = false;
        this.axis = null;
      };

      this.getMode = function() {
        return _mode;
      };

      this.setMode = function(mode) {
        _mode = mode ? mode : _mode;

        if (_mode === 'scale') scope.space = 'local';

        for (var type in _gizmo) _gizmo[type].visible = type === _mode;

        this.update();
        scope.dispatchEvent(changeEvent);
      };

      this.setTranslationSnap = function(translationSnap) {
        scope.translationSnap = translationSnap;
      };

      this.setRotationSnap = function(rotationSnap) {
        scope.rotationSnap = rotationSnap;
      };

      this.setSize = function(size) {
        scope.size = size;
        this.update(true);
        scope.dispatchEvent(changeEvent);
      };

      this.setSpace = function(space) {
        scope.space = space;
        this.update();
        scope.dispatchEvent(changeEvent);
      };

      this.update = function(updateScale) {
        if (scope.object === undefined) return;

        scope.object.updateMatrixWorld();
        worldPosition.setFromMatrixPosition(scope.object.matrixWorld);
        worldRotation.setFromRotationMatrix(
          tempMatrix.extractRotation(scope.object.matrixWorld)
        );

        camera.updateMatrixWorld();
        camPosition.setFromMatrixPosition(camera.matrixWorld);
        camRotation.setFromRotationMatrix(
          tempMatrix.extractRotation(camera.matrixWorld)
        );

        scale = (worldPosition.distanceTo(camPosition) / 6) * scope.size;
        this.position.copy(worldPosition);
        if (updateScale) {
          this.scale.set(scale, scale, scale);
        }

        if (camera instanceof THREE.PerspectiveCamera) {
          eye
            .copy(camPosition)
            .sub(worldPosition)
            .normalize();
        } else if (camera instanceof THREE.OrthographicCamera) {
          eye.copy(camPosition).normalize();
        }

        if (scope.space === 'local') {
          _gizmo[_mode].update(worldRotation, eye);
        } else if (scope.space === 'world') {
          _gizmo[_mode].update(new THREE.Euler(), eye);
        }

        _gizmo[_mode].highlight(scope.axis);
      };

      function onPointerHover(event) {
        if (
          scope.object === undefined ||
          _dragging === true ||
          (event.button !== undefined && event.button !== 0)
        )
          return;

        var pointer = event.changedTouches ? event.changedTouches[0] : event;

        var intersect = intersectObjects(pointer, _gizmo[_mode].pickers.children);

        var axis = null;

        if (intersect) {
          axis = intersect.object.name;

          event.preventDefault();
        }

        if (scope.axis !== axis) {
          scope.axis = axis;
          scope.update();
          scope.dispatchEvent(changeEvent);
        }
      }

      function onPointerDown(event) {
        if (
          scope.object === undefined ||
          _dragging === true ||
          (event.button !== undefined && event.button !== 0)
        )
          return;

        var pointer = event.changedTouches ? event.changedTouches[0] : event;

        if (pointer.button === 0 || pointer.button === undefined) {
          var intersect = intersectObjects(
            pointer,
            _gizmo[_mode].pickers.children
          );

          if (intersect) {
            event.preventDefault();
            event.stopPropagation();

            scope.axis = intersect.object.name;

            scope.dispatchEvent(mouseDownEvent);

            scope.update();

            eye
              .copy(camPosition)
              .sub(worldPosition)
              .normalize();

            _gizmo[_mode].setActivePlane(scope.axis, eye);

            var planeIntersect = intersectObjects(pointer, [
              _gizmo[_mode].activePlane
            ]);

            if (planeIntersect) {
              oldPosition.copy(scope.object.position);
              oldScale.copy(scope.object.scale);

              oldRotationMatrix.extractRotation(scope.object.matrix);
              worldRotationMatrix.extractRotation(scope.object.matrixWorld);

              parentRotationMatrix.extractRotation(
                scope.object.parent.matrixWorld
              );
              parentScale.setFromMatrixScale(
                tempMatrix.copy(scope.object.parent.matrixWorld).invert()
              );

              offset.copy(planeIntersect.point);
            }
          }
        }

        _dragging = true;
      }

      function onPointerMove(event) {
        if (
          scope.object === undefined ||
          scope.axis === null ||
          _dragging === false ||
          (event.button !== undefined && event.button !== 0)
        )
          return;

        var pointer = event.changedTouches ? event.changedTouches[0] : event;

        var planeIntersect = intersectObjects(pointer, [
          _gizmo[_mode].activePlane
        ]);

        if (planeIntersect === false) return;

        event.preventDefault();
        event.stopPropagation();

        point.copy(planeIntersect.point);

        if (_mode === 'translate') {
          point.sub(offset);
          point.multiply(parentScale);

          if (scope.space === 'local') {
            point.applyMatrix4(tempMatrix.copy(worldRotationMatrix).invert());

            if (scope.axis.search('X') === -1) point.x = 0;
            if (scope.axis.search('Y') === -1) point.y = 0;
            if (scope.axis.search('Z') === -1) point.z = 0;

            point.applyMatrix4(oldRotationMatrix);

            scope.object.position.copy(oldPosition);
            scope.object.position.add(point);
          }

          if (scope.space === 'world' || scope.axis.search('XYZ') !== -1) {
            if (scope.axis.search('X') === -1) point.x = 0;
            if (scope.axis.search('Y') === -1) point.y = 0;
            if (scope.axis.search('Z') === -1) point.z = 0;

            point.applyMatrix4(tempMatrix.copy(parentRotationMatrix).invert());

            scope.object.position.copy(oldPosition);
            scope.object.position.add(point);
          }

          if (scope.translationSnap !== null) {
            if (scope.space === 'local') {
              scope.object.position.applyMatrix4(
                tempMatrix.copy(worldRotationMatrix).invert()
              );
            }

            if (scope.axis.search('X') !== -1)
              scope.object.position.x =
                Math.round(scope.object.position.x / scope.translationSnap) *
                scope.translationSnap;
            if (scope.axis.search('Y') !== -1)
              scope.object.position.y =
                Math.round(scope.object.position.y / scope.translationSnap) *
                scope.translationSnap;
            if (scope.axis.search('Z') !== -1)
              scope.object.position.z =
                Math.round(scope.object.position.z / scope.translationSnap) *
                scope.translationSnap;

            if (scope.space === 'local') {
              scope.object.position.applyMatrix4(worldRotationMatrix);
            }
          }
        } else if (_mode === 'scale') {
          point.sub(offset);
          point.multiply(parentScale);

          if (scope.space === 'local') {
            if (scope.axis === 'XYZ') {
              scale = 1 + point.y / Math.max(oldScale.x, oldScale.y, oldScale.z);

              scope.object.scale.x = oldScale.x * scale;
              scope.object.scale.y = oldScale.y * scale;
              scope.object.scale.z = oldScale.z * scale;
            } else {
              point.applyMatrix4(tempMatrix.copy(worldRotationMatrix).invert());

              if (scope.axis === 'X')
                scope.object.scale.x = oldScale.x * (1 + point.x / oldScale.x);
              if (scope.axis === 'Y')
                scope.object.scale.y = oldScale.y * (1 + point.y / oldScale.y);
              if (scope.axis === 'Z')
                scope.object.scale.z = oldScale.z * (1 + point.z / oldScale.z);
            }
          }
        } else if (_mode === 'rotate') {
          point.sub(worldPosition);
          point.multiply(parentScale);
          tempVector.copy(offset).sub(worldPosition);
          tempVector.multiply(parentScale);

          if (scope.axis === 'E') {
            point.applyMatrix4(tempMatrix.copy(lookAtMatrix).invert());
            tempVector.applyMatrix4(tempMatrix.copy(lookAtMatrix).invert());

            rotation.set(
              Math.atan2(point.z, point.y),
              Math.atan2(point.x, point.z),
              Math.atan2(point.y, point.x)
            );
            offsetRotation.set(
              Math.atan2(tempVector.z, tempVector.y),
              Math.atan2(tempVector.x, tempVector.z),
              Math.atan2(tempVector.y, tempVector.x)
            );

            tempQuaternion.setFromRotationMatrix(
              tempMatrix.copy(parentRotationMatrix).invert()
            );

            quaternionE.setFromAxisAngle(eye, rotation.z - offsetRotation.z);
            quaternionXYZ.setFromRotationMatrix(worldRotationMatrix);

            tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionE);
            tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionXYZ);

            scope.object.quaternion.copy(tempQuaternion);
          } else if (scope.axis === 'XYZE') {
            var p = point
                .clone()
                .cross(tempVector)
                .normalize()
            quaternionE.setFromEuler(tempEuler.set(p.x, p.y, p.z)); // rotation axis

            tempQuaternion.setFromRotationMatrix(
              tempMatrix.copy(parentRotationMatrix).invert()
            );
            quaternionX.setFromAxisAngle(
              quaternionE,
              -point.clone().angleTo(tempVector)
            );
            quaternionXYZ.setFromRotationMatrix(worldRotationMatrix);

            tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionX);
            tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionXYZ);

            scope.object.quaternion.copy(tempQuaternion);
          } else if (scope.space === 'local') {
            point.applyMatrix4(tempMatrix.copy(worldRotationMatrix).invert());

            tempVector.applyMatrix4(tempMatrix.copy(worldRotationMatrix).invert());

            rotation.set(
              Math.atan2(point.z, point.y),
              Math.atan2(point.x, point.z),
              Math.atan2(point.y, point.x)
            );
            offsetRotation.set(
              Math.atan2(tempVector.z, tempVector.y),
              Math.atan2(tempVector.x, tempVector.z),
              Math.atan2(tempVector.y, tempVector.x)
            );

            quaternionXYZ.setFromRotationMatrix(oldRotationMatrix);

            if (scope.rotationSnap !== null) {
              quaternionX.setFromAxisAngle(
                unitX,
                Math.round((rotation.x - offsetRotation.x) / scope.rotationSnap) *
                  scope.rotationSnap
              );
              quaternionY.setFromAxisAngle(
                unitY,
                Math.round((rotation.y - offsetRotation.y) / scope.rotationSnap) *
                  scope.rotationSnap
              );
              quaternionZ.setFromAxisAngle(
                unitZ,
                Math.round((rotation.z - offsetRotation.z) / scope.rotationSnap) *
                  scope.rotationSnap
              );
            } else {
              quaternionX.setFromAxisAngle(unitX, rotation.x - offsetRotation.x);
              quaternionY.setFromAxisAngle(unitY, rotation.y - offsetRotation.y);
              quaternionZ.setFromAxisAngle(unitZ, rotation.z - offsetRotation.z);
            }

            if (scope.axis === 'X')
              quaternionXYZ.multiplyQuaternions(quaternionXYZ, quaternionX);
            if (scope.axis === 'Y')
              quaternionXYZ.multiplyQuaternions(quaternionXYZ, quaternionY);
            if (scope.axis === 'Z')
              quaternionXYZ.multiplyQuaternions(quaternionXYZ, quaternionZ);

            scope.object.quaternion.copy(quaternionXYZ);
          } else if (scope.space === 'world') {
            rotation.set(
              Math.atan2(point.z, point.y),
              Math.atan2(point.x, point.z),
              Math.atan2(point.y, point.x)
            );
            offsetRotation.set(
              Math.atan2(tempVector.z, tempVector.y),
              Math.atan2(tempVector.x, tempVector.z),
              Math.atan2(tempVector.y, tempVector.x)
            );

            tempQuaternion.setFromRotationMatrix(
              tempMatrix.copy(parentRotationMatrix).invert()
            );

            if (scope.rotationSnap !== null) {
              quaternionX.setFromAxisAngle(
                unitX,
                Math.round((rotation.x - offsetRotation.x) / scope.rotationSnap) *
                  scope.rotationSnap
              );
              quaternionY.setFromAxisAngle(
                unitY,
                Math.round((rotation.y - offsetRotation.y) / scope.rotationSnap) *
                  scope.rotationSnap
              );
              quaternionZ.setFromAxisAngle(
                unitZ,
                Math.round((rotation.z - offsetRotation.z) / scope.rotationSnap) *
                  scope.rotationSnap
              );
            } else {
              quaternionX.setFromAxisAngle(unitX, rotation.x - offsetRotation.x);
              quaternionY.setFromAxisAngle(unitY, rotation.y - offsetRotation.y);
              quaternionZ.setFromAxisAngle(unitZ, rotation.z - offsetRotation.z);
            }

            quaternionXYZ.setFromRotationMatrix(worldRotationMatrix);

            if (scope.axis === 'X')
              tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionX);
            if (scope.axis === 'Y')
              tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionY);
            if (scope.axis === 'Z')
              tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionZ);

            tempQuaternion.multiplyQuaternions(tempQuaternion, quaternionXYZ);

            scope.object.quaternion.copy(tempQuaternion);
          }
        }

        // Trim decimals.
        if (_mode === 'translate') {
          scope.object.position.x = parseFloat(
            scope.object.position.x.toFixed(5)
          );
          scope.object.position.y = parseFloat(
            scope.object.position.y.toFixed(5)
          );
          scope.object.position.z = parseFloat(
            scope.object.position.z.toFixed(5)
          );
        } else if (_mode === 'rotate') {
          scope.object.rotation.x = parseFloat(
            scope.object.rotation.x.toFixed(5)
          );
          scope.object.rotation.y = parseFloat(
            scope.object.rotation.y.toFixed(5)
          );
          scope.object.rotation.z = parseFloat(
            scope.object.rotation.z.toFixed(5)
          );
        } else {
          scope.object.scale.x = parseFloat(scope.object.scale.x.toFixed(5));
          scope.object.scale.y = parseFloat(scope.object.scale.y.toFixed(5));
          scope.object.scale.z = parseFloat(scope.object.scale.z.toFixed(5));
        }

        scope.update();
        scope.dispatchEvent(changeEvent);
        objectChangeEvent.mode = _mode;
        scope.dispatchEvent(objectChangeEvent);
      }

      function onPointerUp(event) {
        event.preventDefault(); // Prevent MouseEvent on mobile

        if (event.button !== undefined && event.button !== 0) return;

        if (_dragging && scope.axis !== null) {
          mouseUpEvent.mode = _mode;
          scope.dispatchEvent(mouseUpEvent);
        }

        _dragging = false;

        if ('TouchEvent' in window && event instanceof TouchEvent) {
          // Force "rollover"

          scope.axis = null;
          scope.update();
          scope.dispatchEvent(changeEvent);
        } else {
          onPointerHover(event);
        }
      }

      function intersectObjects(pointer, objects) {
        var rect = domElement.getBoundingClientRect();
        var x = (pointer.clientX - rect.left) / rect.width;
        var y = (pointer.clientY - rect.top) / rect.height;

        pointerVector.set(x * 2 - 1, -(y * 2) + 1);
        ray.setFromCamera(pointerVector, camera);

        var intersections = ray.intersectObjects(objects, true);
        return intersections[0] ? intersections[0] : false;
      }
    }
  };
})();
