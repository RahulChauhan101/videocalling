import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { faPhone, faVideo } from '@fortawesome/free-solid-svg-icons';
import ActionButton from './ActionButton';
import RecentCalls from './RecentCalls';

function MainWindow({ startCall, clientId }) {
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
    const config = { audio: true, video: true };
    startCall(true, targetId, config);
  };

  return (
    <div className="container main-window">
      <div>
        <h3>
          Hi, your ID is
          <input
            type="text"
            className="txt-clientId"
            defaultValue={clientId}
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
        currentUserId={clientId}
        onCallClick={handleCallClick}
      />
    </div>
  );
}

MainWindow.propTypes = {
  startCall: PropTypes.func.isRequired,
  clientId: PropTypes.string
};

export default MainWindow;
