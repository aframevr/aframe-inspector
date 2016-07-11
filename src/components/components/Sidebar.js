var React = require('react');

import ComponentsContainer from './ComponentsContainer';

export default class Sidebar extends React.Component {
  constructor (props) {
    super(props);
    this.state = {open: false};
  }

  handleToggle = () => {
    this.setState({open: !this.state.open});
  }

  render () {
    return (
      <div id='sidebar'>
        <div className='sidebar-title'>components</div>
        <ComponentsContainer/>
      </div>
    );
  }
}
