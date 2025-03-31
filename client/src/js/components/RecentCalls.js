import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import './RecentCalls.css';

function RecentCalls({ currentUserId, onCallClick }) {
  const [recentCalls, setRecentCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentCalls = async () => {
      if (!currentUserId) return;
      
      try {
        setLoading(true);
        console.log('Fetching calls for user:', currentUserId);
        
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
              // Convert timestamp to readable format if it exists
              startTime: data.startTime ? new Date(data.startTime.seconds * 1000).toLocaleString() : 'Unknown',
              otherPartyId: data.callerId === currentUserId ? data.receiverId : data.callerId
            });
          }
        });
        console.log('Fetched calls:', calls);
        setRecentCalls(calls);
      } catch (error) {
        console.error('Error fetching recent calls:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUserId) {
      fetchRecentCalls();
      // Refresh every 30 seconds
      const interval = setInterval(fetchRecentCalls, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUserId]);

  if (loading) {
    return (
      <div className="recent-calls">
        <h4>Recent Calls</h4>
        <div className="calls-list">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

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
                <span className="caller-id">ID: {call.otherPartyId}</span>
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
