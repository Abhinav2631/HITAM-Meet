
import React from 'react';

interface Participant {
  id: string;
  name: string;
  email: string;
  isMuted: boolean;
  hasCamera: boolean;
  isPresent: boolean;
  joinTime: Date;
  isScreenSharing?: boolean;
  isActive?: boolean;
  streamQuality?: 'good' | 'medium' | 'poor';
}

interface ParticipantsListProps {
  participants: Participant[];
  onParticipantSelect?: (id: string) => void;
  selectedParticipants?: string[];
}

export const ParticipantsList: React.FC<ParticipantsListProps> = ({
  participants,
  onParticipantSelect,
  selectedParticipants = []
}) => {
  const handleParticipantClick = (id: string) => {
    if (onParticipantSelect) {
      onParticipantSelect(id);
    }
  };
  
  return (
    <div className="space-y-1">
      {participants.map(participant => (
        <div 
          key={participant.id}
          className={`flex items-center justify-between p-2 rounded-sm ${
            selectedParticipants.includes(participant.id) ? 'bg-hitam-secondary/30' : ''
          } hover:bg-gray-700 cursor-pointer`}
          onClick={() => handleParticipantClick(participant.id)}
        >
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full ${
              participant.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'
            } mr-2`}></div>
            <span className="text-sm">{participant.name}</span>
            {participant.isScreenSharing && (
              <span className="ml-2 text-xs text-blue-400">Sharing</span>
            )}
          </div>
          <div className="flex gap-1">
            {participant.isMuted && <span className="text-xs text-gray-400">🔇</span>}
            {!participant.hasCamera && <span className="text-xs text-gray-400">🎦</span>}
            {participant.streamQuality === 'poor' && <span className="text-xs text-red-400">⚠️</span>}
          </div>
        </div>
      ))}
    </div>
  );
};
