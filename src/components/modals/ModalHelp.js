import React from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';

export default class ModalHelp extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool,
    onClose: PropTypes.func
  };

  constructor (props) {
    super(props);
    this.state = {
      isOpen: this.props.isOpen
    };
  }

  componentWillReceiveProps (newProps) {
    if (this.state.isOpen !== newProps.isOpen) {
      this.setState({isOpen: newProps.isOpen});
    }
  }

  onClose = value => {
    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  render () {
    let shortcuts = [
      [
        {key: ['w'], description: 'Translate'},
        {key: ['e'], description: 'Rotate'},
        {key: ['r'], description: 'Scale'},
        {key: ['d'], description: 'Duplicate selected entity'},
        {key: ['f'], description: 'Focus on selected entity'},
        {key: ['g'], description: 'Toggle grid visibility'},
        {key: ['n'], description: 'Add new entity'},
        {key: ['supr | backspace'], description: 'Delete selected entity'}
      ],
      [
        {key: ['1'], description: 'Toggle scenegraph panel'},
        {key: ['2'], description: 'Toggle components panel'},
        {key: ['tab'], description: 'Toggle scenegraph and components panel'},
        {key: ['m'], description: 'Toggle motion capture tools'},

        {key: ['ctrl | cmd', 'x'], description: 'Cut selected entity'},
        {key: ['ctrl | cmd', 'c'], description: 'Copy selected entity'},
        {key: ['ctrl | cmd', 'v'], description: 'Paste entity'},
        {key: ['h'], description: 'Show this help'},
        {key: ['Esc'], description: 'Exit edit mode'},
        {key: ['ctrl', 'alt', 'i'], description: 'Switch Edit and VR Modes'}
      ]
    ];

    return (
      <Modal title="Shortcuts" isOpen={this.state.isOpen} onClose={this.onClose} extraCloseKeyCode={72}>
        <div className="help-lists">
        {
          shortcuts.map(function (column, idx) {
            return <ul className="help-list" key={idx}>
            {
              column.map(function (shortcut) {
                return (
                  <li key={shortcut.key} className="help-key-unit">
                  {
                    shortcut.key.map(function (key) {
                      return <kbd key={key} className="help-key"><span>{key}</span></kbd>;
                    })
                  }
                  <span className="help-key-def">{shortcut.description}</span>
                  </li>
                );
              })
            }
            </ul>;
          })
        }
        </div>
      </Modal>
    );
  }
}
