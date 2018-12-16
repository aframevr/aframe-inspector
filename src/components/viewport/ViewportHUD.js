var React = require('react');
var Events = require('../../lib/Events.js');
var classNames = require('classnames');

export default class ViewportHUD extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      hoveredEntity: null,
      selectedEntity: null
    };
  }

  componentDidMount () {
    Events.on('', () => {
    });
  }

  renderActiveEntityName () {
    if (this.state.hoveredEntity) {

    } else if (this.state.selectedEntity) {

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
