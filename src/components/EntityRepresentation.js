import React from 'react';
import PropTypes from 'prop-types';
import {
  faCamera,
  faCube,
  faFont,
  faLightbulb
} from '@fortawesome/free-solid-svg-icons';
import { AwesomeIcon } from './AwesomeIcon';

const ICONS = {
  camera: (
    <i title="camera">
      <AwesomeIcon icon={faCamera} />
    </i>
  ),
  mesh: (
    <i title="mesh">
      <AwesomeIcon icon={faCube} />
    </i>
  ),
  light: (
    <i title="light">
      <AwesomeIcon icon={faLightbulb} />
    </i>
  ),
  text: (
    <i title="text">
      <AwesomeIcon icon={faFont} />
    </i>
  )
};

export default class EntityRepresentation extends React.Component {
  static propTypes = {
    entity: PropTypes.object,
    onDoubleClick: PropTypes.func
  };

  render() {
    const entity = this.props.entity;
    const onDoubleClick = this.props.onDoubleClick;

    if (!entity) {
      return null;
    }

    // Icons.
    const icons = [];
    for (let objType in ICONS) {
      if (!entity.getObject3D(objType)) {
        continue;
      }
      icons.push(<span key={objType}>&nbsp;{ICONS[objType]}</span>);
    }

    // Name.
    let entityName = entity.id;
    let type = 'id';
    if (!entity.isScene && !entityName && entity.getAttribute('class')) {
      entityName = entity.getAttribute('class').split(' ')[0];
      type = 'class';
    } else if (!entity.isScene && !entityName && entity.getAttribute('mixin')) {
      entityName = entity.getAttribute('mixin').split(' ')[0];
      type = 'mixin';
    }

    return (
      <span className="entityPrint" onDoubleClick={onDoubleClick}>
        <span className="entityTagName">
          {'<' + entity.tagName.toLowerCase()}
        </span>
        {entityName && (
          <span className="entityName" data-entity-name-type={type}>
            &nbsp;{entityName}
          </span>
        )}
        {icons.length > 0 && <span className="entityIcons">{icons}</span>}
        <span className="entityCloseTag">{'>'}</span>
      </span>
    );
  }
}
