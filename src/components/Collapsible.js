import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export default class Collapsible extends React.Component {
  static propTypes = {
    collapsed: PropTypes.bool,
    children: PropTypes.oneOfType([
      PropTypes.array,
      PropTypes.element
    ]).isRequired
  };

  static defaultProps = {
    collapsed: false
  };

  constructor (props) {
    super(props);
    this.state = {
      collapsed: this.props.collapsed
    };
  }

  shouldComponentUpdate (nextProps, nextState) {
    return this.props !== nextProps || this.state !== nextState;
  }

  toggleVisibility = () => {
    this.setState({collapsed: !this.state.collapsed});
    ga('send', 'event', 'Components', 'collapse');
  }

  render () {
    const rootClasses = classnames({
      collapsible: true,
      component: true,
      collapsed: this.state.collapsed
    });
    const contentClasses = classnames({
      content: true,
      hide: this.state.collapsed
    });

    return (
      <div className={rootClasses}>
        <div className='static' onClick={this.toggleVisibility}>
          <div className='collapse-button'/>
          {this.props.children[0]}
        </div>
        <div className={contentClasses}>
          {this.props.children[1]}
        </div>
      </div>
    );
  }
}
