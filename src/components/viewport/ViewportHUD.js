var React = require('react');
var Events = require('../../lib/Events.js');
import { getEntityName } from '../../lib/entity';

export default class ViewportHUD extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hoveredEntity: null,
      selectedEntity: null
    };
  }

  componentDidMount() {
    Events.on('raycastermouseenter', el => {
      this.setState({ hoveredEntity: el });
    });

    Events.on('raycastermouseleave', el => {
      this.setState({ hoveredEntity: el });
    });
  }

  renderActiveEntityName() {
    if (this.state.hoveredEntity) {
      return `<${this.state.hoveredEntity.tagName.toLowerCase()} ${getEntityName(
        this.state.hoveredEntity
      )}>`.replace(' >', '>');
    } else {
      return '';
    }
  }

  render() {
    return (
      <div id="viewportHud">
        <p>{this.renderActiveEntityName()}</p>
      </div>
    );
  }
}
