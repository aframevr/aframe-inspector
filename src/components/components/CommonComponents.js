import React from 'react';
import PropTypes from 'prop-types';
import { faClipboard } from '@fortawesome/free-solid-svg-icons';
import { AwesomeIcon } from '../AwesomeIcon';
import { InputWidget } from '../widgets';
import DEFAULT_COMPONENTS from './DefaultComponents';
import PropertyRow from './PropertyRow';
import Collapsible from '../Collapsible';
import Mixins from './Mixins';
import {
  updateEntity,
  getEntityClipboardRepresentation
} from '../../lib/entity';
import EntityRepresentation from '../EntityRepresentation';
import Events from '../../lib/Events';
import copy from 'clipboard-copy';
import { saveBlob } from '../../lib/utils';
import GLTFIcon from '../../../assets/gltf.svg';

// @todo Take this out and use updateEntity?
function changeId(componentName, value) {
  var entity = AFRAME.INSPECTOR.selectedEntity;
  if (entity.id !== value) {
    entity.id = value;
    Events.emit('entityidchange', entity);
  }
}

export default class CommonComponents extends React.Component {
  static propTypes = {
    entity: PropTypes.object
  };

  componentDidMount() {
    Events.on('entityupdate', (detail) => {
      if (detail.entity !== this.props.entity) {
        return;
      }
      if (
        DEFAULT_COMPONENTS.indexOf(detail.component) !== -1 ||
        detail.component === 'mixin'
      ) {
        this.forceUpdate();
      }
    });
  }

  renderCommonAttributes() {
    const entity = this.props.entity;
    return ['position', 'rotation', 'scale', 'visible'].map((componentName) => {
      const schema = AFRAME.components[componentName].schema;
      var data = entity.object3D[componentName];
      if (componentName === 'rotation') {
        data = {
          x: THREE.MathUtils.radToDeg(entity.object3D.rotation.x),
          y: THREE.MathUtils.radToDeg(entity.object3D.rotation.y),
          z: THREE.MathUtils.radToDeg(entity.object3D.rotation.z)
        };
      }
      return (
        <PropertyRow
          onChange={updateEntity}
          key={componentName}
          name={componentName}
          showHelp={true}
          schema={schema}
          data={data}
          isSingle={true}
          componentname={componentName}
          entity={entity}
        />
      );
    });
  }

  exportToGLTF() {
    const entity = this.props.entity;
    AFRAME.INSPECTOR.exporters.gltf.parse(
      entity.object3D,
      function (buffer) {
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        saveBlob(blob, (entity.id || 'entity') + '.glb');
      },
      function (error) {
        console.error(error);
      },
      { binary: true }
    );
  }

  render() {
    const entity = this.props.entity;
    if (!entity) {
      return <div />;
    }
    const entityButtons = (
      <div>
        <a
          title="Export entity to GLTF"
          className="gltfIcon"
          onClick={(event) => {
            this.exportToGLTF();
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <img src={GLTFIcon} />
        </a>
        <a
          title="Copy entity HTML to clipboard"
          className="button"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            copy(getEntityClipboardRepresentation(this.props.entity));
          }}
        >
          <AwesomeIcon icon={faClipboard} />
        </a>
      </div>
    );

    return (
      <Collapsible id="componentEntityHeader" className="commonComponents">
        <div className="collapsible-header">
          <EntityRepresentation entity={entity} />
          {entityButtons}
        </div>
        <div className="collapsible-content">
          <div className="propertyRow">
            <label htmlFor="id" className="text">
              ID
            </label>
            <InputWidget
              onChange={changeId}
              entity={entity}
              name="id"
              value={entity.id}
            />
          </div>
          <div className="propertyRow">
            <label className="text">class</label>
            <span>{entity.getAttribute('class')}</span>
          </div>
          {this.renderCommonAttributes()}
          <Mixins entity={entity} />
        </div>
      </Collapsible>
    );
  }
}
