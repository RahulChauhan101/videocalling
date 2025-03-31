import React, { Component } from 'react';
import _ from 'lodash';
import { socket, PeerConnection } from './communication';
import { db } from './firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import MainWindow from './components/MainWindow';
import CallWindow from './components/CallWindow';
import CallModal from './components/CallModal';

class App extends Component {
  constructor() {
    super();
    this.state = {
      callWindow: '',
      callModal: '',
      callFrom: '',
      localSrc: null,
      peerSrc: null,
      currentUserId: null
    };
    this.pc = {};
    this.config = null;
    this.startCallHandler = this.startCall.bind(this);
    this.endCallHandler = this.endCall.bind(this);
  }

  componentDidMount() {
    socket
      .on('init', ({ id: currentUserId }) => {
        this.setState({ currentUserId });
      })
      .on('request', ({ from: callFrom }) => {
        this.setState({ callModal: 'active', callFrom });
      })
      .on('call', async (data) => {
        if (data.sdp) {
          this.pc.setRemoteDescription(data.sdp);
          if (data.sdp.type === 'offer') this.pc.createAnswer();
        } else this.pc.addIceCandidate(data.candidate);
      })
      .on('end', this.endCall.bind(this, false))
      .emit('init');
  }

  startCall(isCaller, friendID, config) {
    this.config = config;
    this.pc = new PeerConnection(friendID)
      .on('localStream', (src) => {
        const newState = { callWindow: 'active', localSrc: src };
        if (!isCaller) newState.callModal = '';
        this.setState(newState);
      })
      .on('peerStream', (src) => this.setState({ peerSrc: src }))
      .start(isCaller, config);

    try {
      // Store call in Firebase
      addDoc(collection(db, 'videoCalls'), {
        callerId: this.state.currentUserId,
        receiverId: friendID,
        startTime: serverTimestamp(),
        status: 'active'
      });
    } catch (error) {
      console.error('Error storing call:', error);
    }
  }

  endCall(isStarter, friendID = '') {
    try {
      // Update call status in Firebase
      addDoc(collection(db, 'videoCalls'), {
        callerId: this.state.currentUserId,
        receiverId: friendID,
        endTime: serverTimestamp(),
        status: 'ended'
      });
    } catch (error) {
      console.error('Error updating call status:', error);
    }

    this.pc.stop(isStarter);
    this.pc = {};
    this.config = null;
    this.setState({
      callWindow: '',
      callModal: '',
      localSrc: null,
      peerSrc: null
    });
  }

  render() {
    const { callFrom, callModal, callWindow, localSrc, peerSrc, currentUserId } = this.state;
    return (
      <div>
        <MainWindow
          clientId={currentUserId}
          startCall={this.startCallHandler}
        />
        {!_.isEmpty(this.config) && (
          <CallWindow
            status={callWindow}
            localSrc={localSrc}
            peerSrc={peerSrc}
            config={this.config}
            mediaDevice={this.pc.mediaDevice}
            endCall={this.endCallHandler}
          />
        )}
        <CallModal
          status={callModal}
          startCall={this.startCallHandler}
          rejectCall={this.endCallHandler}
          callFrom={callFrom}
        />
      </div>
    );
  }
}

export default App;
