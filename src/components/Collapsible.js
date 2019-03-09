import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

export default class Collapsible extends React.Component {
  static propTypes = {
    collapsed: PropTypes.bool,
    children: PropTypes.oneOfType([PropTypes.array, PropTypes.element])
      .isRequired,
    id: PropTypes.string
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

  toggleVisibility = () => {
    this.setState({ collapsed: !this.state.collapsed });
    ga('send', 'event', 'Components', 'collapse');
  };

  render () {
    const rootClassNames = {
      collapsible: true,
      component: true,
      collapsed: this.state.collapsed
    };
    if (this.props.className) {
      rootClassNames[this.props.className] = true;
    }
    const rootClasses = classnames(rootClassNames);

    const contentClasses = classnames({
      content: true,
      hide: this.state.collapsed
    });

    return (
      <div id={this.props.id} className={rootClasses}>
        <div className="static" onClick={this.toggleVisibility}>
          <div className="collapse-button" />
          {this.props.children[0]}
        </div>
        <div className={contentClasses}>{this.props.children[1]}</div>
      </div>
    );
  }
}
