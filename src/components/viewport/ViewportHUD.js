var React = require('react');
var Events = require('../../lib/Events.js');
import {getEntityName} from '../../lib/entity';

export default class ViewportHUD extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      hoveredEntity: null,
      selectedEntity: null
    };
  }

  componentDidMount () {
    Events.on('entityselect', el => {
      this.setState({selectedEntity: el});
    });
  }

  renderActiveEntityName () {
    if (this.state.hoveredEntity) {
      return getEntityName(this.state.hoveredEntity);
    } else if (this.state.selectedEntity) {
      return getEntityName(this.state.selectedEntity);
    } else {
      return '';
    }
  }

  render () {
    return (
      <div id ='viewportHud'>
        <p>{this.renderActiveEntityName()}</p>
      </div>
    );
  }
}
