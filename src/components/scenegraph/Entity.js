/* eslint-disable react/no-danger */
import React from 'react';
import PropTypes from 'prop-types';
import {
  faCaretDown,
  faCaretRight,
  faClone,
  faEye,
  faEyeSlash,
  faTrashAlt
} from '@fortawesome/free-solid-svg-icons';
import { AwesomeIcon } from '../AwesomeIcon';
import clsx from 'clsx';
import { removeEntity, cloneEntity } from '../../lib/entity';
import EntityRepresentation from '../EntityRepresentation';
import Events from '../../lib/Events';

export default class Entity extends React.Component {
  static propTypes = {
    depth: PropTypes.number,
    entity: PropTypes.object,
    isExpanded: PropTypes.bool,
    isFiltering: PropTypes.bool,
    isSelected: PropTypes.bool,
    selectEntity: PropTypes.func,
    toggleExpandedCollapsed: PropTypes.func
  };

  onClick = () => this.props.selectEntity(this.props.entity);

  onDoubleClick = () => Events.emit('objectfocus', this.props.entity.object3D);

  toggleVisibility = () => {
    const entity = this.props.entity;
    const visible =
      entity.tagName.toLowerCase() === 'a-scene'
        ? entity.object3D.visible
        : entity.getAttribute('visible');
    entity.setAttribute('visible', !visible);
  };

  render() {
    const isFiltering = this.props.isFiltering;
    const isExpanded = this.props.isExpanded;
    const entity = this.props.entity;
    const tagName = entity.tagName.toLowerCase();

    // Clone and remove buttons if not a-scene.
    const cloneButton =
      tagName === 'a-scene' ? null : (
        <a
          onClick={() => cloneEntity(entity)}
          title="Clone entity"
          className="button"
        >
          <AwesomeIcon icon={faClone} />
        </a>
      );
    const removeButton =
      tagName === 'a-scene' ? null : (
        <a
          onClick={(event) => {
            event.stopPropagation();
            removeEntity(entity);
          }}
          title="Remove entity"
          className="button"
        >
          <AwesomeIcon icon={faTrashAlt} />
        </a>
      );

    // Add spaces depending on depth.
    const pad = '&nbsp;&nbsp;&nbsp;&nbsp;'.repeat(this.props.depth);
    let collapse;
    if (entity.children.length > 0 && !isFiltering) {
      collapse = (
        <span
          onClick={() => this.props.toggleExpandedCollapsed(entity)}
          className="collapsespace"
        >
          {isExpanded ? (
            <AwesomeIcon icon={faCaretDown} />
          ) : (
            <AwesomeIcon icon={faCaretRight} />
          )}
        </span>
      );
    } else {
      collapse = <span className="collapsespace" />;
    }

    // Visibility button.
    const visible =
      tagName === 'a-scene'
        ? entity.object3D.visible
        : entity.getAttribute('visible');
    const visibilityButton = (
      <i title="Toggle entity visibility" onClick={this.toggleVisibility}>
        {visible ? (
          <AwesomeIcon icon={faEye} />
        ) : (
          <AwesomeIcon icon={faEyeSlash} />
        )}
      </i>
    );

    // Class name.
    const className = clsx({
      active: this.props.isSelected,
      entity: true,
      novisible: !visible,
      option: true
    });

    return (
      <div className={className} onClick={this.onClick}>
        <span>
          {visibilityButton}
          <span
            className="entityChildPadding"
            dangerouslySetInnerHTML={{ __html: pad }}
          />
          {collapse}
          <EntityRepresentation
            entity={entity}
            onDoubleClick={this.onDoubleClick}
          />
        </span>
        <span className="entityActions">
          {cloneButton}
          {removeButton}
        </span>
      </div>
    );
  }
}
