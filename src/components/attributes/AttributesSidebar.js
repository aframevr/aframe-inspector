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
        <div className="tab collapsible">
          <span>ATTRIBUTES</span>
          <div className="dropdown menu hide">
            <div className="dropdown-content">
              <a href="#" onClick={this.deleteComponent}>Collapse all</a>
            </div>
          </div>
        </div>
        <AttributesPanel/>
      </div>
    );
  }
}
