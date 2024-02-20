import React from 'react';
import PropTypes from 'prop-types';
import {
  faCamera,
  faCube,
  faFont,
  faLightbulb
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ICONS = {
  camera: <FontAwesomeIcon icon={faCamera} title="camera" />,
  mesh: <FontAwesomeIcon icon={faCube} title="mesh" />,
  light: <FontAwesomeIcon icon={faLightbulb} title="light" />,
  text: <FontAwesomeIcon icon={faFont} title="text" />
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
