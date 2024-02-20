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

  componentDidMount() {
    Events.on('raycastermouseenter', (el) => {
      this.setState({ hoveredEntity: el });
    });

    Events.on('raycastermouseleave', (el) => {
      this.setState({ hoveredEntity: el });
    });
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
