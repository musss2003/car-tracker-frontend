import { useEffect, useRef } from 'react';
import { sendHeartbeat } from '../services/activityService';

/**
 * Hook to track user activity and send periodic heartbeats
 * Sends heartbeat every 2 minutes while user is logged in
 */
export const useActivityTracking = () => {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Send initial heartbeat
    sendHeartbeat();

    // Set up periodic heartbeat (every 2 minutes)
    intervalRef.current = setInterval(() => {
      sendHeartbeat();
    }, 2 * 60 * 1000); // 2 minutes

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);
};
