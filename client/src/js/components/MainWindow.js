import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { faPhone, faVideo } from '@fortawesome/free-solid-svg-icons';
import ActionButton from './ActionButton';
import RecentCalls from './RecentCalls';
import { socket } from '../communication';

function useClientID() {
  const [clientID, setClientID] = useState('');

  useEffect(() => {
    socket
      .on('init', ({ id }) => {
        document.title = `${id} - VideoCall`;
        setClientID(id);
      });
  }, []);

  return clientID;
}

function MainWindow({ startCall }) {
  const clientID = useClientID();
  const [friendID, setFriendID] = useState(null);

  /**
   * Start the call with or without video
   * @param {Boolean} video
   */
  const callWithVideo = (video) => {
    const config = { audio: true, video };
    return () => friendID && startCall(true, friendID, config);
  };

  const handleCallClick = (targetId) => {
    setFriendID(targetId);
    callWithVideo(true)();
  };

  return (
    <div className="container main-window">
      <div>
        <h3>
          Hi, your ID is
          <input
            type="text"
            className="txt-clientId"
            defaultValue={clientID}
            readOnly
          />
        </h3>
        <h4>Get started by calling a friend below</h4>
      </div>
      <div>
        <input
          type="text"
          className="txt-clientId"
          spellCheck={false}
          placeholder="Input friend ID"
          onChange={(event) => setFriendID(event.target.value)}
        />
        <div>
          <ActionButton icon={faVideo} onClick={callWithVideo(true)}>
            Video Call
          </ActionButton>
          <ActionButton icon={faPhone} onClick={callWithVideo(false)}>
            Audio Call
          </ActionButton>
        </div>
      </div>
      
      <RecentCalls 
        currentUserId={clientID}
        onCallClick={handleCallClick}
      />
    </div>
  );
}

MainWindow.propTypes = {
  startCall: PropTypes.func.isRequired
};

export default MainWindow;
