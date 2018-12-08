import React from 'react';
import PropTypes from 'prop-types';
import ComponentsContainer from './ComponentsContainer';
import Events from '../../lib/Events';

export default class Sidebar extends React.Component {
  static propTypes = {
    entity: PropTypes.object,
    visible: PropTypes.bool
  };

  constructor (props) {
    super(props);
    this.state = {
      open: false,
      entity: props.entity
    };
  }

  componentDidMount () {
    Events.on('componentremove', event => {
      this.forceUpdate();
    });

    Events.on('componentadd', event => {
      this.forceUpdate();
    });
  }

  handleToggle = () => {
    this.setState({open: !this.state.open});
    ga('send', 'event', 'Components', 'toggleSidebar');
  }

  componentChanged = (event) => {
    Events.emit('selectedentitycomponentchange', event);
  }

  componentWillReceiveProps (newProps) {
    if (this.state.entity !== newProps.entity) {
      if (this.state.entity) {
        this.state.entity.removeEventListener('componentchange', this.componentChanged);
        this.state.entity.removeEventListener('componentinitialized', this.componentCreated);
      }
      if (newProps.entity) {
        newProps.entity.addEventListener('componentchange', this.componentChanged);
        newProps.entity.addEventListener('componentinitialized', this.componentCreated);
      }
      this.setState({entity: newProps.entity});
    }
  }

  render () {
    const entity = this.state.entity;
    const visible = this.props.visible;
    if (entity && visible) {
      return (
        <div id='sidebar'>
          <ComponentsContainer entity={this.state.entity}/>
        </div>
      );
    } else {
      return <div/>;
    }
  }
}
