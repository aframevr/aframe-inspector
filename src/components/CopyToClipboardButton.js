import React from 'react';
import PropTypes from 'prop-types';
import { faClipboard } from '@fortawesome/free-solid-svg-icons';
import { AwesomeIcon } from './AwesomeIcon';
import copy from 'clipboard-copy';

export default class CopyToClipboardButton extends React.Component {
  static propTypes = {
    text: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    message: PropTypes.string.isRequired
  };

  state = { copied: false };
  buttonRef = React.createRef();

  onClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    copy(this.props.text());
    this.setState({ copied: true });
    setTimeout(() => {
      this.setState({ copied: false });
    }, 2000);
  };

  render() {
    let tooltipStyle = null;
    if (this.state.copied && this.buttonRef.current) {
      const rect = this.buttonRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const isRightHalf = centerX > window.innerWidth / 2;
      tooltipStyle = {
        position: 'fixed',
        top: rect.bottom + 5 + 'px'
      };
      if (isRightHalf) {
        tooltipStyle.right = window.innerWidth - rect.right + 'px';
      } else {
        tooltipStyle.left = rect.left + 'px';
      }
    }

    return (
      <span ref={this.buttonRef}>
        <a title={this.props.title} className="button" onClick={this.onClick}>
          <AwesomeIcon icon={faClipboard} />
        </a>
        {this.state.copied && (
          <div className="copy-tooltip" style={tooltipStyle}>
            {this.props.message}
          </div>
        )}
      </span>
    );
  }
}
