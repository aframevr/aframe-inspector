import React from 'react';
import Events from '../../lib/Events';
import { printEntity } from '../../lib/entity';

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
        <p>{printEntity(this.state.hoveredEntity)}</p>
      </div>
    );
  }
}
