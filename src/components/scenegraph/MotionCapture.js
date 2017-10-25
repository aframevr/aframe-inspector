var Events = require('../../lib/Events');
import React from 'react';
import Select from 'react-select';
import 'react-select/dist/react-select.css';
import FileReaderInput from 'react-file-reader-input';

const SCRIPT = 'https://unpkg.com/aframe-motion-capture-components@0.2.6/dist/aframe-motion-capture-components.min.js';
// const SCRIPT = 'http://localhost:8080/examples/js/build.js';
const LOCALSTORAGE_LOOP = 'aframeinspectormocaploopenabled';
const LOCALSTORAGE_SELECTED_RECORDING = 'aframeinspectorselectedrecording';
const COUNTDOWN = 5;
const SAMPLE_RECORDING = 'https://gist.githubusercontent.com/anonymous/9face967294fa7ed206f409add055927/raw/77dce282eb44536e839cfe93c16dd40acef7587b/%23leftHand%20+%20%23rightHand.json';

let scriptInjected = 'avatar-recorder' in AFRAME.components;

const sceneEl = AFRAME.scenes[0];

/**
 * Motion capture recording.
 */
export default class MotionCapture extends React.Component {
  constructor (props) {
    super(props);

    if (localStorage.getItem(LOCALSTORAGE_LOOP) === '') {
      localStorage.setItem(LOCALSTORAGE_LOOP, 'true');
    }

    if (!scriptInjected) {
      // Inject mocap script.
      console.log(`[inspector] Injecting <script src="${SCRIPT}"></script> for motion capture.`);
      const script = document.createElement('script');
      script.setAttribute('src', SCRIPT);
      document.body.appendChild(script);
      scriptInjected = true;

      // Set mocap components once script is loaded.
      script.onload = this.onScriptLoad.bind(this);
    } else {
      this.onScriptLoad();
    }

    // Listen for when we've replayed an entire recording through, no loops.
    sceneEl.addEventListener('replayingstopped', () => {
      this.stopReplaying();
    });

    Events.on('inspectormodechanged', isOpen => {
      this.setState({inspectorOpened: isOpen});

      // During replay, hide the replayer mesh (pink box) if switching to first-person view.
      if (this.state.isReplaying && !isOpen) {
        const cameraEl = sceneEl.querySelector('[data-aframe-inspector-original-camera]');
        if (cameraEl.getObject3D('replayerMesh')) {
          cameraEl.getObject3D('replayerMesh').visible = false;
        }
        this.setState({inspectorOpened: false});
      }

      // During replay, show the replayer mesh (pink box) if switching to Inspector view.
      if (this.state.isReplaying && isOpen) {
        const cameraEl = sceneEl.querySelector('[data-aframe-inspector-original-camera]');
        if (cameraEl.getObject3D('replayerMesh')) {
          cameraEl.getObject3D('replayerMesh').visible = true;
        }
        this.setState({inspectorOpened: true});
      }

      // Stop recording if we entered back to Inspector during recording.
      if (this.state.isRecording && isOpen) {
        this.stopRecording();
      }
    });

    this.state = {
      countdown: -1,
      loopEnabled: JSON.parse(localStorage.getItem(LOCALSTORAGE_LOOP)),
      inspectorOpened: true,
      isCurrentlyUploading: false,
      isRecording: false,
      isReplaying: false,
      recordingName: '',  // For saving recording.
      recordingNames: [],
      selectedRecordingName: '',  // For replay.
      uploadedRecordingURL: '',  // For uploading to GitHub Gist.
      waitForButtonPress: true
    };
  }

  componentWillUnmount () {
    // Remove components.
    sceneEl.removeAttribute('avatar-recorder');
    sceneEl.removeAttribute('avatar-replayer');
  }

  onScriptLoad () {
    const self = this;

    // Set components.
    sceneEl.setAttribute('avatar-recorder', {
      autoPlay: false
    });
    sceneEl.setAttribute('avatar-replayer', {
      autoPlay: false,
      cameraOverride: '[data-aframe-inspector-original-camera]',
      loop: JSON.parse(localStorage.getItem(LOCALSTORAGE_LOOP))
    });

    this.recordingdb = sceneEl.systems.recordingdb;

    // Populate recording names, select from last session if any.
    this.refreshRecordingNames().then(recordingNames => {
      var selectedRecording = localStorage.getItem(LOCALSTORAGE_SELECTED_RECORDING);
      if (selectedRecording && this.state.recordingNames.indexOf(selectedRecording) !== -1) {
        this.setState({selectedRecordingName: selectedRecording});
      }

      // Add sample recording if empty.
      if (!recordingNames.length) {
        let xhr = new XMLHttpRequest();
        xhr.addEventListener('load', function () {
          self.recordingdb.addRecording('* Sample Recording', JSON.parse(this.responseText));
          self.refreshRecordingNames().then(() => {
            self.setState({selectedRecordingName: '* Sample Recording'});
          });
        });
        xhr.open('GET', SAMPLE_RECORDING);
        xhr.send();
      }
    });
  }

  buttonPressRecording = () => {
    var self = this;

    const textEntity = document.createElement('a-entity');
    textEntity.setAttribute('text', {
      align: 'center',
      color: 'red',
      value: 'Press any controller or keyboard button to record'
    });
    textEntity.setAttribute('position', '0 0 -1');

    // Resume the scene.
    sceneEl.play();

    // Set original camera back when recording.
    const cameraEl = sceneEl.querySelector('[data-aframe-inspector-original-camera]');
    cameraEl.setAttribute('camera', 'active', true);
    if (cameraEl.getObject3D('replayermesh')) {
      cameraEl.getObject3D('replayermesh').visible = false;
    }
    cameraEl.appendChild(textEntity);

    // Enter VR.
    sceneEl.enterVR();

    // Start recording when a button is pressed.
    sceneEl.addEventListener('buttonup', function buttonStart () {
      textEntity.parentNode.removeChild(textEntity);
      self.countdownRecording();
      sceneEl.removeEventListener('buttonup', buttonStart);
    });
    // Start recording when keyboard is pressed.
    document.addEventListener('keyup', function keyboardStart () {
      textEntity.parentNode.removeChild(textEntity);
      self.countdownRecording();
      document.removeEventListener('keyup', keyboardStart);
    });

    // Stop recording when a button is pressed 5 times in a row quickly.
    let counter = 0;
    let lastButtonPressId;
    let lastButtonPressTime;
    sceneEl.addEventListener('buttonup', function buttonsStop (evt) {
      if (!self.state.isRecording) { return; }

      if (lastButtonPressTime &&
          lastButtonPressId === evt.detail.id &&
          evt.timeStamp - lastButtonPressTime < 500) {
        // Same button pressed
        counter++;
        lastButtonPressTime = evt.timeStamp;
      } else {
        // First button press or different button pressed.
        counter = 1;
        lastButtonPressId = evt.detail.id;
        lastButtonPressTime = evt.timeStamp;
      }

      // Five presses reached. Stop recording.
      if (counter >= 5) {
        self.stopRecording();
      }

      // Remove this event listener when it's all done.
      Events.on('motioncapturerecordstop', () => {
        sceneEl.removeEventListener('buttonup', buttonsStop);
      });
    });
  }

  countdownRecording = () => {
    const textEntity = document.createElement('a-entity');
    textEntity.setAttribute('text', {
      align: 'center',
      color: 'red',
      value: COUNTDOWN.toString()
    });
    textEntity.setAttribute('scale', '3 3 3');
    textEntity.setAttribute('position', '0 0 -1');

    if (this.state.isReplaying) {
      this.stopReplaying();
    }

    // Resume the scene.
    sceneEl.play();

    // Set original camera back when recording.
    const cameraEl = sceneEl.querySelector('[data-aframe-inspector-original-camera]');
    cameraEl.setAttribute('camera', 'active', true);
    if (cameraEl.getObject3D('replayermesh')) {
      cameraEl.getObject3D('replayermesh').visible = false;
    }
    cameraEl.appendChild(textEntity);

    // Enter VR early due to user gesture requirements.
    sceneEl.enterVR();

    // Leave Inspector to remove all of its helpers.
    Events.emit('inspectormodechanged', false);

    // Update countdown both in VR and in Inspector UI.
    this.setState({countdown: COUNTDOWN.toString()});
    Events.emit('motioncapturecountdown', COUNTDOWN);
    this.countdownInterval = setInterval(() => {
      if (this.state.countdown === 0) {
        textEntity.parentNode.removeChild(textEntity);
        this.startRecording();
        this.setState({countdown: -1});
        Events.emit('motioncapturecountdown', -1);
        clearInterval(this.countdownInterval);
        return;
      }
      textEntity.setAttribute('text', {
        value: (this.state.countdown - 1).toString()
      });
      Events.emit('motioncapturecountdown', this.state.countdown - 1);
      this.setState({countdown: this.state.countdown - 1});
    }, 1000);
  }

  startRecording = () => {
    // Get recording name.
    const autoName = 'Recording #' + this.state.recordingNames.length;
    if (!this.state.recordingName) {
      this.setState({recordingName: autoName});
    }
    const recordingName = this.state.recordingName || autoName;

    // Name the recording.
    sceneEl.setAttribute('avatar-recorder', 'recordingName', recordingName);

    // Start recording!
    sceneEl.components['avatar-recorder'].startRecording();
    this.setState({isRecording: true});

    Events.emit('motioncapturerecordstart');
  }

  stopRecording = () => {
    // Stop recording.
    sceneEl.components['avatar-recorder'].stopRecording();

    // Pause back the scene.
    sceneEl.pause();

    // Restore Inspector camera.
    sceneEl.querySelector('[data-aframe-inspector="camera"]').setAttribute(
      'camera', 'active', true);

    this.refreshRecordingNames().then(() => {
      this.setState({
        isRecording: false,
        recordingName: '',
        selectedRecordingName: this.state.recordingName
      }, () => {
        // Re-enter Inspector. Do this after setting `isRecording` to false.
        Events.emit('inspectormodechanged', true);
      });
    });

    setTimeout(() => {
      this.startReplaying();
    });

    Events.emit('motioncapturerecordstop');
  }

  getOptions () {
    // Populate options for replaying recordings from localStorage, stored by the components.
    return this.state.recordingNames.sort().map(recordingName => {
      return {
        value: recordingName,
        label: recordingName
      };
    });
  }

  /**
   * Render options for stored recordings.
   */
  renderRecordingOptions = option => {
    return <strong className="option">{option.label}</strong>;
  }

  /**
   * Select recording from react-select.
   */
  selectRecording = value => {
    this.stopReplaying();
    this.setState({selectedRecordingName: value});
    localStorage.setItem(LOCALSTORAGE_SELECTED_RECORDING, value);
  }

  startReplaying = () => {
    if (this.state.isRecording || this.state.isReplaying) { return; }

    console.log(
      '[inspector] Replaying recording. Add ' +
      `avatar-replayer="recordingName: ${this.state.selectedRecordingName}; loop: true; spectatorMode: true"` +
      ' to <a-scene> to play automatically without Inspector ' +
      `or append to URL ?recording=${this.state.selectedRecordingName}`);

    // Resume the scene.
    sceneEl.play();

    // Select recording to replay.
    sceneEl.setAttribute('avatar-replayer', 'recordingName', this.state.selectedRecordingName);

    // Begin replaying.
    sceneEl.components['avatar-replayer'].replayRecordingFromSource();

    const cameraEl = sceneEl.querySelector('[data-aframe-inspector-original-camera]');
    cameraEl.getObject3D('replayerMesh').visible = true;

    this.setState({isReplaying: true});

    // Set so Inspector doesn't pause scene when switching modes.
    sceneEl.setAttribute('aframe-inspector-motion-capture-replaying', '');
  }

  stopReplaying = () => {
    // Stop replaying.
    sceneEl.components['avatar-replayer'].stopReplaying();

    // Pause back the scene only if Inspector is still open.
    // In case we exit the Inspector to view first-person or spectator mode, we don't want to
    // pause the scene while we're in those modes.
    if (this.state.inspectorOpened) {
      sceneEl.pause();
    }

    this.setState({isReplaying: false});

    sceneEl.removeAttribute('aframe-inspector-motion-capture-replaying');
  }

  /**
   * Delete selected recording from localStorage.
   */
  deleteRecording = () => {
    var self = this; // eslint-disable-line no-unused-vars

    if (!this.state.selectedRecordingName) { return; }

    this.recordingdb.deleteRecording(this.state.selectedRecordingName);
    this.refreshRecordingNames();
  }

  /**
   * Change recording name input to save as when recording.
   */
  onChangeRecordingName = evt => {
    this.setState({recordingName: evt.target.value});
  }

  /**
   * Update state.recordingNames, select recording if none selected.
   */
  refreshRecordingNames () {
    return new Promise(resolve => {
      this.recordingdb.getRecordingNames().then(recordingNames => {
        let state = {recordingNames: recordingNames};

        if (!recordingNames || !recordingNames.length) {
          // No recordings available, reset.
          state.selectedRecordingName = '';
        } else if (!this.state.selectedRecordingName ||
                   recordingNames.indexOf(this.state.selectedRecordingName) === -1) {
          // Recordings available and either no selected recording or invalid. Set to first.
          state.selectedRecordingName = recordingNames[0];
        }

        this.setState(state, () => {
          resolve(recordingNames);
        });
      });
    });
  }

  /**
   * Upload selected recording to GitHub Gist.
   */
  uploadRecording = () => {
    const self = this;
    const request = new XMLHttpRequest();
    console.log('Uploading recording to gist.github.com.');
    request.open('POST', 'https://api.github.com/gists', true);
    request.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    request.onload = function () {
      const data = JSON.parse(this.responseText);
      const url = data.files[Object.keys(data.files)[0]].raw_url;
      console.log('Recording uploaded to', url);
      self.setState({isCurrentlyUploading: false, uploadedRecordingURL: url});
    };

    this.recordingdb.getRecording(this.state.selectedRecordingName).then(data => {
      request.send(JSON.stringify({
        files: {
          [`${this.state.selectedRecordingName}.json`]: {
            content: JSON.stringify(data)
          }
        }
      }));
    });
    this.setState({isCurrentlyUploading: true});
  }

  /**
   * Download currently selected recording as local file.
   */
  downloadRecording = () => {
    const recordingName = this.state.selectedRecordingName;

    this.recordingdb.getRecording(recordingName).then(data => {
      // Compose data blob.
      const blob = new Blob([JSON.stringify(data)], {
        type: 'application/json'
      });

      // Create download link.
      const aEl = document.createElement('a');
      aEl.href = URL.createObjectURL(blob);
      aEl.setAttribute('download', recordingName.toLowerCase().replace(/ /g, '-') + '.json');
      aEl.innerHTML = 'Downloading...';
      aEl.style.display = 'none';

      // Click download link.
      document.body.appendChild(aEl);
      setTimeout(function () {
        aEl.click();
        document.body.removeChild(aEl);
      });
    });
  }

  /**
   * Add recording from file system as file input. Store as file name in localStorage.
   */
  addRecordingFromFile = (evt, results) => {
    results.forEach(result => {
      const [evt, file] = result;
      this.recordingdb.addRecording(file.name, JSON.parse(evt.target.result));
      this.refreshRecordingNames().then(() => {
        this.setState({selectedRecordingName: file.name});
      });
    });
  }

  addRecordingFromURL = () => {
    const self = this;
    const url = prompt('Enter a URL of a recording to fetch');
    if (!url) { return; }
    const recordingName = prompt('Enter a name for the recording to store as');
    let xhr = new XMLHttpRequest();
    xhr.addEventListener('load', function () {
      self.recordingdb.addRecording(
        recordingName || `Recording ${self.state.recordingNames.length}`,
        JSON.parse(this.responseText));
      self.refreshRecordingNames().then(() => {
        self.setState({selectedRecordingName: recordingName});
      });
    });
    xhr.open('GET', url);
    xhr.send();
  }

  handleRecordingStartKey = evt => {
    if (evt.key === 'Enter') {
      this.startRecording();
    }
  }

  toggleLoop = () => {
    this.setState({loopEnabled: !this.state.loopEnabled});
    sceneEl.setAttribute('avatar-replayer', 'loop', !this.state.loopEnabled);
    localStorage.setItem(LOCALSTORAGE_LOOP, !this.state.loopEnabled);
  }

  handleWaitButtonCheckboxChange = () => {
    this.setState({waitForButtonPress: !this.state.waitForButtonPress});
  }

  render () {
    const state = this.state;

    return (
      <div id="motionCapture" style={{background: '#2B2B2B', padding: '1px 0 20px 10px', width: '100%'}}>
        <p style={{marginBottom: 0}}>
          Motion Capture Recording
          <a className="button fa fa-question-circle" href="https://aframe.io/blog/motion-capture/" target="_blank" ref="external"></a>
        </p>

        <p style={{textDecoration: 'underline'}}>Record</p>

        <input id="recordingName" placeholder='Recording name...'
          value={state.recordingName || ''} onChange={this.onChangeRecordingName}
          onKeyPress={this.handleRecordingStartKey}
          title="Recording name"
          style={{padding: '10px 0 10px 10px', width: '75%'}}/>
        {state.countdown !== -1 && <span style={{color: '#EF2D5E', position: 'relative', left: '10px', top: '2px'}}>{this.state.countdown}</span>}
        {!state.isRecording && state.countdown === -1 &&
          <a className="button fa fa-circle" title="Start recording. Make sure `avatar-replayer.spectatorMode` is not active." onClick={state.waitForButtonPress ? this.buttonPressRecording : this.countdownRecording} style={{color: '#EF2D5E', position: 'relative', right: '2px', top: '2px'}}/>
        }
        {state.isRecording && state.countdown === -1 &&
          <a className="button fa fa-square" title="Stop recording" onClick={this.stopRecording} style={{color: '#EF2D5E'}}/>
        }

        <div style={{marginTop: '8px'}}>
          <input id="waitForButton" type="checkbox" checked={this.state.waitForButtonPress} onChange={this.handleWaitButtonCheckboxChange} style={{marginLeft: 0, marginTop: '2px'}}/>
          <label htmlFor="waitForButton" style={{fontSize: '10px', fontStyle: 'italic', display: 'inline-block', verticalAlign: 'top', width: '180px'}}>
            Use controller to toggle recording. Click the red circle, then press any button to start recording. Then press any button five times quickly to stop recording.
          </label>
        </div>

        <p style={{textDecoration: 'underline', marginBottom: 0}}>Replay</p>

        <Select
          className="savedRecordings"
          options={this.getOptions()}
          clearable={false}
          simpleValue
          placeholder="Replay recording..."
          noResultsText="No recordings found"
          onChange={this.selectRecording}
          optionRenderer={this.renderRecordingOptions}
          searchable={true}
          value={state.selectedRecordingName || undefined}
        />

        {!state.isReplaying && <a className="button fa fa-play" title={`Replay ${state.selectedRecordingName} recording`} onClick={this.startReplaying} style={{verticalAlign: 'middle', position: 'relative', top: '5px'}}/>}
        {state.isReplaying && <a className="button fa fa-square" title="Stop replaying recording" onClick={this.stopReplaying} style={{verticalAlign: 'middle', position: 'relative', top: '5px'}}/>}

        <div style={{paddingTop: '8px', paddingLeft: '2px'}}>
          <FileReaderInput as="text" onChange={this.addRecordingFromFile} style={{display: 'inline-block', marginLeft: '1px'}}>
            <a className="button fa fa-upload" title="Add recording from file system" style={{marginLeft: 0}}/>
          </FileReaderInput>
          <a className="button fa fa-link" title="Add recording from URL" onClick={this.addRecordingFromURL} style={{marginLeft: '10px', paddingRight: '60px'}}/>

          {state.selectedRecordingName && <span>
            <a className="button fa fa-repeat" title="Toggle loop of replaying" onClick={this.toggleLoop} style={{[this.state.loopEnabled && 'color']: '#FFF'}}/>
            <a className="button fa fa-save" title={`Download ${state.selectedRecordingName} recording`} onClick={this.downloadRecording}/>
            <a className={state.isCurrentlyUploading ? 'button fa fa-hourglass-half' : 'button fa fa-cloud-upload'} title={state.isCurrentlyUploading ? `Uploading ${state.selectedRecordingName}...` : `Upload ${state.selectedRecordingName} recording`} onClick={this.uploadRecording} style={{[state.isCurrentlyUploading && 'color']: '#24CAFF'}}/>
            <a className="button fa fa-trash" title={`Delete ${state.selectedRecordingName} recording`} onClick={this.deleteRecording}/>
          </span>}
        </div>

        {state.uploadedRecordingURL &&
          <a href={state.uploadedRecordingURL} target="_blank" ref="external" style={{color: '#FAFAFA', display: 'inline-block', marginLeft: '2px', marginTop: '10px', width: '85%', overflow: 'hidden'}} title={state.uploadedRecordingURL}>
            {state.uploadedRecordingURL}
          </a>
        }

        {state.selectedRecordingName === '* Sample Recording' &&
          <p style={{fontSize: '10px', width: '200px'}}>* To get controllers to replay with the sample recording, give your controllers <code>id="rightHand"</code> and <code>id="leftHand"</code></p>
        }
      </div>
    );
  }
}
