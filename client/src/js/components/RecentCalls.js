import React, { useEffect, useState } from 'react';
import { db } from '../../../server/config/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import './RecentCalls.css';

function RecentCalls({ currentUserId, onCallClick }) {
  const [recentCalls, setRecentCalls] = useState([]);

  useEffect(() => {
    const fetchRecentCalls = async () => {
      try {
        const q = query(
          collection(db, 'videoCalls'),
          orderBy('startTime', 'desc'),
          limit(5)
        );

        const querySnapshot = await getDocs(q);
        const calls = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          // Only show calls where the current user was involved
          if (data.callerId === currentUserId || data.receiverId === currentUserId) {
            calls.push({
              id: doc.id,
              ...data,
              // Convert timestamp to readable format
              startTime: data.startTime?.toDate().toLocaleString() || 'Unknown',
              otherPartyId: data.callerId === currentUserId ? data.receiverId : data.callerId
            });
          }
        });
        setRecentCalls(calls);
      } catch (error) {
        console.error('Error fetching recent calls:', error);
      }
    };

    fetchRecentCalls();
    // Refresh every 30 seconds
    const interval = setInterval(fetchRecentCalls, 30000);
    return () => clearInterval(interval);
  }, [currentUserId]);

  return (
    <div className="recent-calls">
      <h4>Recent Calls</h4>
      <div className="calls-list">
        {recentCalls.length === 0 ? (
          <p>No recent calls</p>
        ) : (
          recentCalls.map((call) => (
            <div key={call.id} className="call-item">
              <div className="call-info">
                <span className="caller-id">{call.otherPartyId}</span>
                <span className="call-time">{call.startTime}</span>
                <span className={`call-status ${call.status}`}>{call.status}</span>
              </div>
              <button 
                className="call-button"
                onClick={() => onCallClick(call.otherPartyId)}
              >
                Call Again
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RecentCalls;
