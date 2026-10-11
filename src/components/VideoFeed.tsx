
import React, { useRef, useEffect, useState } from 'react';
import { User, Activity, ScreenShare } from 'lucide-react';

interface VideoFeedProps {
  participantId: string;
  participantName: string;
  hasCamera: boolean;
  isMuted: boolean;
  isActive?: boolean;
  isScreenSharing?: boolean;
  streamQuality?: 'good' | 'medium' | 'poor';
  videoRef?: React.RefObject<HTMLVideoElement>;
  isMainFeed?: boolean;
  screenShareRef?: React.RefObject<HTMLVideoElement>;
}

export const VideoFeed: React.FC<VideoFeedProps> = ({
  participantId,
  participantName,
  hasCamera,
  isMuted,
  isActive = false,
  isScreenSharing = false,
  streamQuality = 'good',
  videoRef,
  isMainFeed = false,
  screenShareRef
}) => {
  const defaultVideoRef = useRef<HTMLVideoElement>(null);
  const defaultScreenShareRef = useRef<HTMLVideoElement>(null);
  const currentVideoRef = videoRef || defaultVideoRef;
  const currentScreenShareRef = screenShareRef || defaultScreenShareRef;
  
  return (
    <div className={`relative bg-gradient-to-br from-hitam-tertiary/30 to-hitam-dark rounded-md overflow-hidden flex items-center justify-center ${isMainFeed ? 'col-span-2 row-span-2' : ''} transition-all duration-300 hover:shadow-lg border border-hitam-light/10`}>
      {isScreenSharing ? (
        <video 
          ref={currentScreenShareRef}
          autoPlay 
          playsInline
          className="w-full h-full object-cover"
        />
      ) : hasCamera ? (
        <video 
          ref={currentVideoRef}
          autoPlay 
          muted={isMuted}
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-hitam-secondary/10 to-hitam-primary/20" />
          <User size={isMainFeed ? 64 : 48} className="text-white/30" />
        </>
      )}
      
      <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-md text-white text-xs flex items-center">
        {participantName}
        {isMuted ? (
          <span className="ml-2">🔇</span>
        ) : isActive ? (
          <span className="ml-2 text-green-400">
            <Activity className="h-3 w-3 inline-block animate-pulse" />
          </span>
        ) : null}
        {isScreenSharing && (
          <span className="ml-2 text-blue-300 flex items-center">
            <ScreenShare className="h-3 w-3 mr-1" />
            Sharing
          </span>
        )}
      </div>
      
      {streamQuality === 'poor' && (
        <div className="absolute top-2 right-2 bg-red-500/70 backdrop-blur-sm px-2 py-1 rounded text-white text-xs">
          Poor Connection
        </div>
      )}
    </div>
  );
};
