
import React, { useCallback, useEffect, useState, useRef } from "react";

interface Participant {
  id: string;
  name: string;
  email: string;
  isPresent: boolean;
  joinTime: Date;
  leaveTime?: Date;
  activityLog: Array<{ action: string; timestamp: Date }>;
}

interface AttendanceTrackerProps {
  meetingId: string;
  onAttendanceUpdate?: (attendance: Participant[]) => void;
  user: { id: string; name: string; email: string };
}

export const AttendanceTracker: React.FC<AttendanceTrackerProps> = ({
  meetingId,
  onAttendanceUpdate,
  user
}) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const checkIntervalRef = useRef<number | null>(null);

  const recordActivity = useCallback((action: string) => {
    setParticipants(prev => prev.map(participant => {
      if (participant.id !== user.id) return participant;

      return {
        ...participant,
        isPresent: action !== "left",
        leaveTime: action === "left" ? new Date() : participant.leaveTime,
        activityLog: [
          ...participant.activityLog,
          { action, timestamp: new Date() }
        ]
      };
    }));
  }, [user.id]);

  // On mount, add the current user to participants
  useEffect(() => {
    const newParticipant: Participant = {
      id: user.id,
      name: user.name,
      email: user.email,
      isPresent: true,
      joinTime: new Date(),
      activityLog: [{ action: "joined", timestamp: new Date() }]
    };

    setParticipants([newParticipant]);

    // In a real implementation, we would sync with a backend service here
    
    // Set up periodic activity tracking
    checkIntervalRef.current = window.setInterval(() => {
      recordActivity("activity-check");
    }, 60000); // Check every minute

    return () => {
      if (checkIntervalRef.current) {
        window.clearInterval(checkIntervalRef.current);
      }
    };
  }, [recordActivity, user.email, user.id, user.name]);

  // Notify parent component of attendance updates
  useEffect(() => {
    if (onAttendanceUpdate) {
      onAttendanceUpdate(participants);
    }
  }, [participants, onAttendanceUpdate]);

  // This component doesn't render anything visible
  return null;
};
