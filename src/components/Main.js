import React from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { AwesomeIcon } from './AwesomeIcon';
import Events from '../lib/Events';
import ComponentsSidebar from './components/Sidebar';
import ModalTextures from './modals/ModalTextures';
import ModalHelp from './modals/ModalHelp';
import ModalSponsor from './modals/ModalSponsor';
import SceneGraph from './scenegraph/SceneGraph';
import CameraToolbar from './viewport/CameraToolbar';
import TransformToolbar from './viewport/TransformToolbar';
import ViewportHUD from './viewport/ViewportHUD';

THREE.ImageUtils.crossOrigin = '';

export default class Main extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      entity: null,
      inspectorEnabled: true,
      isHelpOpen: false,
      isModalSponsorOpen: false,
      isModalTexturesOpen: false,
      sceneEl: AFRAME.scenes[0],
      visible: {
        scenegraph: true,
        attributes: true
      }
    };

    Events.on('togglesidebar', (event) => {
      if (event.which === 'all') {
        if (this.state.visible.scenegraph || this.state.visible.attributes) {
          this.setState({
            visible: {
              scenegraph: false,
              attributes: false
            }
          });
        } else {
          this.setState({
            visible: {
              scenegraph: true,
              attributes: true
            }
          });
        }
      } else if (event.which === 'attributes') {
        this.setState((prevState) => ({
          visible: {
            ...prevState.visible,
            attributes: !prevState.visible.attributes
          }
        }));
      } else if (event.which === 'scenegraph') {
        this.setState((prevState) => ({
          visible: {
            ...prevState.visible,
            scenegraph: !prevState.visible.scenegraph
          }
        }));
      }
    });
  }

  componentDidMount() {
    Events.on(
      'opentexturesmodal',
      function (selectedTexture, textureOnClose) {
        this.setState({
          selectedTexture: selectedTexture,
          isModalTexturesOpen: true,
          textureOnClose: textureOnClose
        });
      }.bind(this)
    );

    Events.on('entityselect', (entity) => {
      this.setState({ entity: entity });
    });

    Events.on('inspectortoggle', (enabled) => {
      this.setState({ inspectorEnabled: enabled });
    });

    Events.on('openhelpmodal', () => {
      this.setState({ isHelpOpen: true });
    });
  }

  onCloseHelpModal = (value) => {
    this.setState({ isHelpOpen: false });
  };

  onModalTextureOnClose = (value) => {
    this.setState({ isModalTexturesOpen: false });
    if (this.state.textureOnClose) {
      this.state.textureOnClose(value);
    }
  };

  openModalSponsor = () => {
    this.setState({ isModalSponsorOpen: true });
  };

  onCloseModalSponsor = () => {
    this.setState({ isModalSponsorOpen: false });
  };

  toggleEdit = () => {
    if (this.state.inspectorEnabled) {
      AFRAME.INSPECTOR.close();
    } else {
      AFRAME.INSPECTOR.open();
    }
  };

  renderComponentsToggle() {
    if (
      !this.state.inspectorEnabled ||
      !this.state.entity ||
      this.state.visible.attributes
    ) {
      return null;
    }
    return (
      <div className="toggle-sidebar right">
        <a
          onClick={() => {
            Events.emit('togglesidebar', { which: 'attributes' });
          }}
          title="Show components"
        >
          <AwesomeIcon icon={faPlus} />
        </a>
      </div>
    );
  }

  renderSceneGraphToggle() {
    if (!this.state.inspectorEnabled || this.state.visible.scenegraph) {
      return null;
    }
    return (
      <div className="toggle-sidebar left">
        <a
          onClick={() => {
            Events.emit('togglesidebar', { which: 'scenegraph' });
          }}
          title="Show scenegraph"
        >
          <AwesomeIcon icon={faPlus} />
        </a>
      </div>
    );
  }

  render() {
    const scene = this.state.sceneEl;
    const toggleButtonText = this.state.inspectorEnabled
      ? 'Back to Scene'
      : 'Inspect Scene';

    return (
      <div>
        <a className="toggle-edit" onClick={this.toggleEdit}>
          {toggleButtonText}
        </a>
        {this.state.inspectorEnabled && (
          <a className="sponsor-btn" onClick={this.openModalSponsor}>
            <svg
              aria-hidden="true"
              height="16"
              viewBox="0 0 16 16"
              version="1.1"
              width="16"
            >
              <path d="m8 14.25.345.666a.75.75 0 0 1-.69 0l-.008-.004-.018-.01a7.152 7.152 0 0 1-.31-.17 22.055 22.055 0 0 1-3.434-2.414C2.045 10.731 0 8.35 0 5.5 0 2.836 2.086 1 4.25 1 5.797 1 7.153 1.802 8 3.02 8.847 1.802 10.203 1 11.75 1 13.914 1 16 2.836 16 5.5c0 2.85-2.045 5.231-3.885 6.818a22.066 22.066 0 0 1-3.744 2.584l-.018.01-.006.003h-.002ZM4.25 2.5c-1.336 0-2.75 1.164-2.75 3 0 2.15 1.58 4.144 3.365 5.682A20.58 20.58 0 0 0 8 13.393a20.58 20.58 0 0 0 3.135-2.211C12.92 9.644 14.5 7.65 14.5 5.5c0-1.836-1.414-3-2.75-3-1.373 0-2.609.986-3.029 2.456a.749.749 0 0 1-1.442 0C6.859 3.486 5.623 2.5 4.25 2.5Z"></path>
            </svg>
            Sponsor
          </a>
        )}

        {this.renderSceneGraphToggle()}
        {this.renderComponentsToggle()}

        <div
          id="inspectorContainer"
          className={this.state.inspectorEnabled ? '' : 'hidden'}
        >
          <SceneGraph
            scene={scene}
            selectedEntity={this.state.entity}
            visible={this.state.visible.scenegraph}
          />

          <div id="viewportBar">
            <CameraToolbar />
            <ViewportHUD />
            <TransformToolbar />
          </div>

          <div id="rightPanel">
            <ComponentsSidebar
              entity={this.state.entity}
              visible={this.state.visible.attributes}
            />
          </div>
        </div>

        <ModalHelp
          isOpen={this.state.isHelpOpen}
          onClose={this.onCloseHelpModal}
        />
        <ModalSponsor
          isOpen={this.state.isModalSponsorOpen}
          onClose={this.onCloseModalSponsor}
        />
        <ModalTextures
          isOpen={this.state.isModalTexturesOpen}
          selectedTexture={this.state.selectedTexture}
          onClose={this.onModalTextureOnClose}
        />
      </div>
    );
  }
}
