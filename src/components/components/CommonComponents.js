import React from 'react';
import PropTypes from 'prop-types';
import CopyToClipboardButton from '../CopyToClipboardButton';
import { InputWidget } from '../widgets';
import DEFAULT_COMPONENTS from './DefaultComponents';
import PropertyRow from './PropertyRow';
import Collapsible from '../Collapsible';
import Mixins from './Mixins';
import { getEntityClipboardRepresentation } from '../../lib/entity';
import EntityRepresentation from '../EntityRepresentation';
import Events from '../../lib/Events';
import { saveBlob } from '../../lib/utils';
import GLTFIcon from '../../../assets/gltf.svg';

export default class CommonComponents extends React.Component {
  static propTypes = {
    entity: PropTypes.object
  };

  state = {
    duplicateId: null,
    idInputKey: 0
  };

  changeId = (componentName, value) => {
    var entity = AFRAME.INSPECTOR.selectedEntity;
    if (entity.id !== value) {
      // Ids must be unique; committing a duplicate id breaks entity lookups
      // done with getElementById or querySelector in components. Refuse the
      // value, show a message and remount the input so it displays the
      // entity's current id again.
      if (value && document.getElementById(value)) {
        this.setState((state) => ({
          duplicateId: value,
          idInputKey: state.idInputKey + 1
        }));
        return;
      }
      this.setState({ duplicateId: null });
      entity.id = value;
      Events.emit('entityidchange', entity);
    } else {
      this.setState({ duplicateId: null });
    }
  };

  componentDidUpdate(prevProps) {
    if (prevProps.entity !== this.props.entity && this.state.duplicateId) {
      this.setState({ duplicateId: null });
    }
  }

  onEntityUpdate = (detail) => {
    if (detail.entity !== this.props.entity) {
      return;
    }
    if (
      DEFAULT_COMPONENTS.indexOf(detail.component) !== -1 ||
      detail.component === 'mixin'
    ) {
      this.forceUpdate();
    }
  };

  componentDidMount() {
    Events.on('entityupdate', this.onEntityUpdate);
  }

  componentWillUnmount() {
    Events.off('entityupdate', this.onEntityUpdate);
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
          key={componentName}
          name={componentName}
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
          className="gltfIcon button"
          onClick={(event) => {
            this.exportToGLTF();
            event.preventDefault();
            event.stopPropagation();
          }}
        >
          <GLTFIcon />
        </a>
        <CopyToClipboardButton
          title="Copy entity HTML to clipboard"
          message="Copied entity HTML to clipboard"
          text={() => getEntityClipboardRepresentation(this.props.entity)}
        />
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
              key={this.state.idInputKey}
              onBlur={this.changeId}
              entity={entity}
              name="id"
              value={entity.id}
            />
          </div>
          {this.state.duplicateId !== null && (
            <div className="propertyRowError">
              The id &quot;{this.state.duplicateId}&quot; is already used by
              another element, the previous id was restored.
            </div>
          )}
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
