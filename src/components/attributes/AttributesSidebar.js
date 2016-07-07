var React = require('react');

import AttributesPanel from './AttributesPanel';

export default class AttributesSidebar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {open: false};
  }

  handleToggle = () => {
    this.setState({open: !this.state.open});
  }

  render() {
    return (
      <div id="sidebar">
        <div className="sidebar-title">ATTRIBUTES</div>
        <AttributesPanel/>
      </div>
    );
  }
}
