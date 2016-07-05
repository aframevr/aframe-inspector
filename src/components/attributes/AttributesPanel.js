var React = require('react');
var Events = require('../../lib/Events.js');

import Attributes from './Attributes';

export default class AttributesPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {entity: props.entity};
  }

  componentDidMount() {
    this.refresh();
    Events.on('entitySelected', function(entity){
      this.setState({entity: entity});
      if (entity !== null) {
        entity.addEventListener('componentchanged', this.refresh);
      }
    }.bind(this));
    document.addEventListener('componentremoved', function(e){
      if (this.state.entity === e.detail.target) {
        this.refresh();
      }
    }.bind(this));
  }

  refresh = () => {
    this.forceUpdate();
  }

  render() {
    return (
      <Attributes entity={this.state.entity}/>
    );
  }
}
