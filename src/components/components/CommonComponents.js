import React from 'react';
import PropTypes from 'prop-types';
import { InputWidget } from '../widgets';
import DEFAULT_COMPONENTS from './DefaultComponents';
import PropertyRow from './PropertyRow';
import Collapsible from '../Collapsible';
import Mixins from './Mixins';
import {
  updateEntity,
  getEntityClipboardRepresentation,
  printEntity
} from '../../lib/entity';
import Events from '../../lib/Events';
import Clipboard from 'clipboard';
import { saveBlob } from '../../lib/utils';

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
    Events.on('entityupdate', detail => {
      if (detail.entity !== this.props.entity) {
        return;
      }
      if (DEFAULT_COMPONENTS.indexOf(detail.component) !== -1) {
        this.forceUpdate();
      }
    });

    Events.on('refreshsidebarobject3d', () => {
      this.forceUpdate();
    });

    var clipboard = new Clipboard('[data-action="copy-entity-to-clipboard"]', {
      text: trigger => {
        return getEntityClipboardRepresentation(this.props.entity);
      }
    });
    clipboard.on('error', e => {
      // @todo Show the error on the UI
    });
  }

  renderCommonAttributes() {
    const entity = this.props.entity;
    const components = entity ? entity.components : {};
    return ['position', 'rotation', 'scale', 'visible'].map(componentName => {
      const schema = AFRAME.components[componentName].schema;
      var data = entity.object3D[componentName];
      if (componentName === 'rotation') {
        data = {
          x: THREE.Math.radToDeg(entity.object3D.rotation.x),
          y: THREE.Math.radToDeg(entity.object3D.rotation.y),
          z: THREE.Math.radToDeg(entity.object3D.rotation.z)
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
      function(buffer) {
        const blob = new Blob([buffer], { type: 'application/octet-stream' });
        saveBlob(blob, (entity.id || 'entity') + '.glb');
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
          onClick={event => {
            this.exportToGLTF();
            event.stopPropagation();
          }} >
          <img src={process.env.NODE_ENV === 'production' ? 'https://aframe.io/aframe-inspector/assets/gltf.svg' : '../assets/gltf.svg'} />
        </a>
        <a
          href="#"
          title="Copy entity HTML to clipboard"
          data-action="copy-entity-to-clipboard"
          className="button fa fa-clipboard"
          onClick={event => event.stopPropagation()}
        />
      </div>
    );

    return (
      <Collapsible id="componentEntityHeader" className="commonComponents">
        <div className="collapsible-header">
          {printEntity(entity)}
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
