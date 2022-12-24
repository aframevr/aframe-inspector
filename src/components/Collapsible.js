import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

export default class Collapsible extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    collapsed: PropTypes.bool,
    children: PropTypes.oneOfType([PropTypes.array, PropTypes.element])
      .isRequired,
    id: PropTypes.string
  };

  static defaultProps = {
    collapsed: false
  };

  constructor(props) {
    super(props);
    this.state = {
      collapsed: this.props.collapsed
    };
  }

  toggleVisibility = (event) => {
    // Don't collapse if we click on actions like clipboard
    if (event.target.nodeName === 'A') return;
    this.setState({ collapsed: !this.state.collapsed });
    if (typeof ga !== 'undefined') {
      ga('send', 'event', 'Components', 'collapse');
    }
  };

  render() {
    const rootClassNames = {
      collapsible: true,
      component: true,
      collapsed: this.state.collapsed
    };
    if (this.props.className) {
      rootClassNames[this.props.className] = true;
    }
    const rootClasses = classNames(rootClassNames);

    const contentClasses = classNames({
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
