import React from 'react';
import EntityRepresentation from '../EntityRepresentation';
import Events from '../../lib/Events';

export default class ViewportHUD extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hoveredEntity: null,
      selectedEntity: null
    };
  }

  onRaycasterMouseEnter = (el) => {
    this.setState({ hoveredEntity: el });
  };

  onRaycasterMouseLeave = (el) => {
    this.setState({ hoveredEntity: el });
  };

  componentDidMount() {
    Events.on('raycastermouseenter', this.onRaycasterMouseEnter);
    Events.on('raycastermouseleave', this.onRaycasterMouseLeave);
  }

  componentWillUnmount() {
    Events.off('raycastermouseenter', this.onRaycasterMouseEnter);
    Events.off('raycastermouseleave', this.onRaycasterMouseLeave);
  }

  render() {
    return (
      <div id="viewportHud">
        <p>
          <EntityRepresentation entity={this.state.hoveredEntity} />
        </p>
      </div>
    );
  }
}
