import React from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';

export default class ModalSponsor extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired
  };

  render() {
    return (
      <Modal
        title="Sponsor"
        isOpen={this.props.isOpen}
        onClose={this.props.onClose}
      >
        <div style={{ fontSize: '1.2em', maxWidth: '500px' }}>
          <p>
            The inspector is kept up to date by members of the community working
            on the aframe editor, a modified version of the inspector with
            additional features.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <a
              href="https://github.com/c-frame/aframe-editor"
              target="_blank"
              rel="noreferrer"
              className="try-editor-btn"
            >
              Give the aframe editor a try
            </a>
          </div>
          <p style={{ fontWeight: 'bold', textAlign: 'center' }}>
            If you like it, please consider supporting the project.
          </p>
        </div>
      </Modal>
    );
  }
}
