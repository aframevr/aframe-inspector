var React = require('react');
import PropTypes from 'prop-types';

export default class Modal extends React.Component {
  static propTypes = {
    id: PropTypes.string,
    children: PropTypes.oneOfType([PropTypes.array, PropTypes.element])
      .isRequired,
    isOpen: PropTypes.bool,
    extraCloseKeyCode: PropTypes.number,
    closeOnClickOutside: PropTypes.bool,
    onClose: PropTypes.func,
    title: PropTypes.string
  };

  static defaultProps = {
    closeOnClickOutside: true
  };

  constructor(props) {
    super(props);
    this.state = { isOpen: this.props.isOpen };
  }

  componentDidMount() {
    document.addEventListener('keyup', this.handleGlobalKeydown);
    document.addEventListener('mousedown', this.handleGlobalMousedown);
  }

  handleGlobalKeydown = event => {
    if (
      this.state.isOpen &&
      (event.keyCode === 27 ||
        (this.props.extraCloseKeyCode &&
          event.keyCode === this.props.extraCloseKeyCode))
    ) {
      this.close();

      // Prevent closing the inspector
      event.stopPropagation();
    }
  };

  shouldClickDismiss = event => {
    var target = event.target;
    // This piece of code isolates targets which are fake clicked by things
    // like file-drop handlers
    if (target.tagName === 'INPUT' && target.type === 'file') {
      return false;
    }
    if (target === this.refs.self || this.refs.self.contains(target))
      return false;
    return true;
  };

  handleGlobalMousedown = event => {
    if (
      this.props.closeOnClickOutside &&
      this.state.isOpen &&
      this.shouldClickDismiss(event)
    ) {
      if (typeof this.props.onClose === 'function') {
        this.props.onClose();
      }
    }
  };

  componentWillUnmount() {
    document.removeEventListener('keyup', this.handleGlobalKeydown);
    document.removeEventListener('mousedown', this.handleGlobalMousedown);
  }

  componentWillReceiveProps(newProps) {
    if (this.state.isOpen !== newProps.isOpen) {
      this.setState({ isOpen: newProps.isOpen });
    }
  }

  close = () => {
    this.setState({ isOpen: false });
    if (this.props.onClose) {
      this.props.onClose();
    }
  };

  render() {
    return (
      <div
        id={this.props.id}
        className={this.state.isOpen ? 'modal' : 'modal hide'}
      >
        <div className="modal-content" ref="self">
          <div className="modal-header">
            <span className="close" onClick={this.close}>
              ×
            </span>
            <h3>{this.props.title}</h3>
          </div>
          <div className="modal-body">{this.props.children}</div>
        </div>
      </div>
    );
  }
}
