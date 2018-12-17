import React from 'react';
import PropTypes from 'prop-types';
import ComponentsContainer from './ComponentsContainer';
import Events from '../../lib/Events';

export default class Sidebar extends React.Component {
  static propTypes = {
    entity: PropTypes.object,
    visible: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.state = { open: false };
  }

  componentDidMount() {
    Events.on('componentremove', event => {
      this.forceUpdate();
    });

    Events.on('componentadd', event => {
      this.forceUpdate();
    });
  }

  handleToggle = () => {
    this.setState({ open: !this.state.open });
    ga('send', 'event', 'Components', 'toggleSidebar');
  };

  render() {
    const entity = this.props.entity;
    const visible = this.props.visible;
    if (entity && visible) {
      return (
        <div id="sidebar">
          <ComponentsContainer entity={entity} />
        </div>
      );
    } else {
      return <div />;
    }
  }
}
