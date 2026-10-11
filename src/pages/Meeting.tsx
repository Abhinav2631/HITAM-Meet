import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { User, Users, MessageSquare, FileText, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/components/AuthProvider";
import { FullscreenEnforcer } from "@/components/FullscreenEnforcer";
import { MeetingControls } from "@/components/MeetingControls";
import { AttendanceTracker } from "@/components/AttendanceTracker";
import { AssignmentTab } from "@/components/AssignmentTab";
import { filterProfanity, containsProfanity } from "@/utils/profanityFilter";
import { VideoFeed } from "@/components/VideoFeed";

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isFiltered: boolean;
}

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
}

const PARTICIPANT_LIMIT = 150;

const Meeting = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isAuthenticated, isHost } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isChatEnabled, setIsChatEnabled] = useState(true);
  
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [screenShareActive, setScreenShareActive] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState("chat");
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const screenShareRef = useRef<HTMLVideoElement>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  
  const [controlsOpen, setControlsOpen] = React.useState(false);

  useEffect(() => {
    console.log("Meeting component mounted. Auth state:", { user, isAuthenticated });
    
    if (!isAuthenticated || !user) {
      console.log("User not authenticated, redirecting to login");
      navigate("/login");
      return;
    }
    
    if (!meetingId) {
      console.log("No meeting ID provided, redirecting to dashboard");
      toast({
        title: "Invalid Meeting",
        description: "No meeting ID was provided.",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }
    
    console.log(`Loading meeting with ID: ${meetingId}`);
    
    const sampleParticipants: Participant[] = Array.from({ length: 8 }, (_, index) => ({
      id: `user-${index}`,
      name: `Demo User ${index + 1}`,
      email: `demo-user-${index + 1}@hitam.org`,
      isMuted: true,
      hasCamera: false,
      isPresent: true,
      joinTime: new Date(),
      isActive: false,
    }));
    
    setParticipants([
      {
        id: user.id,
        name: user.name,
        email: user.email,
        isMuted: false,
        hasCamera: true,
        isPresent: true,
        joinTime: new Date(),
        isActive: false,
      },
      ...sampleParticipants
    ]);
    
    if (sampleParticipants.length >= PARTICIPANT_LIMIT) {
      toast({
        title: "Participant Limit Reached",
        description: `This meeting has reached the maximum limit of ${PARTICIPANT_LIMIT} participants.`,
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }
    
    setMessages([
      {
        id: "system-1",
        sender: "System",
        content: `Welcome to meeting ${meetingId}. Remember to follow meeting guidelines.`,
        timestamp: new Date(),
        isFiltered: false
      },
      {
        id: "system-2",
        sender: "System",
        content: "This is a local demo. Camera and microphone controls only preview locally; media is not shared with other participants.",
        timestamp: new Date(),
        isFiltered: false
      }
    ]);
    
    setIsLoading(false);
    
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [user, meetingId, isAuthenticated, navigate, toast]);

  const startCamera = async () => {
    try {
      if (cameraActive) {
        mediaStreamRef.current?.getVideoTracks().forEach(track => {
          track.stop();
          mediaStreamRef.current?.removeTrack(track);
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStreamRef.current;
        }
        setCameraActive(false);
        
        updateParticipantCamera(user?.id || "", false);
        
        toast({
          title: "Camera Off",
          description: "Your camera has been turned off.",
          duration: 1500,
        });
      } else {
        const videoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        const videoTrack = videoStream.getVideoTracks()[0];
        if (mediaStreamRef.current) {
          mediaStreamRef.current.addTrack(videoTrack);
          videoStream.getTracks().filter(track => track !== videoTrack).forEach(track => track.stop());
        } else {
          mediaStreamRef.current = videoStream;
        }

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = mediaStreamRef.current;
        }
        setCameraActive(true);
        
        updateParticipantCamera(user?.id || "", true);
        
        toast({
          title: "Camera On",
          description: "Your camera is now active.",
          duration: 1500,
        });
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: "Could not access your camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const toggleMicrophone = async () => {
    try {
      if (micActive) {
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getAudioTracks().forEach(track => {
            track.enabled = false;
          });
        }
        setMicActive(false);
        
        updateParticipantMic(user?.id || "", true);
        
        toast({
          title: "Microphone Muted",
          description: "Your microphone has been muted.",
          duration: 1500,
        });
      } else {
        const audioTracks = mediaStreamRef.current?.getAudioTracks() ?? [];
        if (audioTracks.length > 0) {
          audioTracks.forEach(track => {
            track.enabled = true;
          });
        } else {
          const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
          const audioTrack = audioStream.getAudioTracks()[0];
          if (mediaStreamRef.current) {
            mediaStreamRef.current.addTrack(audioTrack);
            audioStream.getTracks().filter(track => track !== audioTrack).forEach(track => track.stop());
          } else {
            mediaStreamRef.current = audioStream;
          }
        }
        setMicActive(true);
        
        updateParticipantMic(user?.id || "", false);
        
        toast({
          title: "Microphone Unmuted",
          description: "Your microphone is now active.",
          duration: 1500,
        });
      }
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone Error",
        description: "Could not access your microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const startScreenShare = async () => {
    try {
      if (screenShareActive) {
        if (screenStreamRef.current) {
          screenStreamRef.current.getTracks().forEach(track => track.stop());
          screenStreamRef.current = null;
        }
        if (screenShareRef.current) {
          screenShareRef.current.srcObject = null;
        }
        setScreenShareActive(false);
        
        setParticipants(prev => 
          prev.map(p => p.id === user?.id ? { ...p, isScreenSharing: false } : p)
        );
        
        toast({
          title: "Screen Sharing Stopped",
          description: "You've stopped sharing your screen.",
          duration: 1500,
        });
      } else {
        const stream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true,
          audio: true
        });
        
        stream.getVideoTracks()[0].addEventListener('ended', () => {
          setScreenShareActive(false);
          setParticipants(prev => 
            prev.map(p => p.id === user?.id ? { ...p, isScreenSharing: false } : p)
          );
          
          if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => track.stop());
            screenStreamRef.current = null;
          }
          
          if (screenShareRef.current) {
            screenShareRef.current.srcObject = null;
          }
        });
        
        if (screenShareRef.current) {
          screenShareRef.current.srcObject = stream;
        }
        
        screenStreamRef.current = stream;
        setScreenShareActive(true);
        
        setParticipants(prev => 
          prev.map(p => p.id === user?.id ? { ...p, isScreenSharing: true } : p)
        );
        
        toast({
          title: "Screen Sharing Started",
          description: "You're now sharing your screen.",
          duration: 1500,
        });
      }
    } catch (error) {
      console.error("Error sharing screen:", error);
      toast({
        title: "Screen Share Error",
        description: "Could not share your screen. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const updateParticipantCamera = (participantId: string, hasCamera: boolean) => {
    setParticipants(prevParticipants => 
      prevParticipants.map(p => 
        p.id === participantId ? { ...p, hasCamera } : p
      )
    );
  };

  const updateParticipantMic = (participantId: string, isMuted: boolean) => {
    setParticipants(prevParticipants => 
      prevParticipants.map(p => 
        p.id === participantId ? { ...p, isMuted, isActive: !isMuted } : p
      )
    );
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !isChatEnabled) return;
    
    const hasProfanity = containsProfanity(newMessage);
    let messageContent = newMessage;
    
    if (hasProfanity) {
      messageContent = filterProfanity(newMessage);
      toast({
        title: "Message Modified",
        description: "Your message contained inappropriate content and has been filtered.",
        variant: "destructive",
      });
    }
    
    const message: Message = {
      id: Math.random().toString(36).substring(2, 15),
      sender: user?.name || "Anonymous",
      content: messageContent,
      timestamp: new Date(),
      isFiltered: hasProfanity
    };
    
    setMessages([...messages, message]);
    setNewMessage("");
  };

  const endMeeting = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
    }
    navigate("/dashboard");
  };

  const handleChatToggle = (enabled: boolean) => {
    setIsChatEnabled(enabled);
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hitam-primary">
        <div className="animate-pulse-slow text-white text-xl">Loading meeting...</div>
      </div>
    );
  }

  const getSidebarTabs = () => {
    const tabs = [
      { value: "chat", label: "Chat", icon: <MessageSquare className="h-4 w-4 mr-2" /> },
      { value: "participants", label: "Participants", icon: <Users className="h-4 w-4 mr-2" /> },
      { value: "assignments", label: "Assignments", icon: <FileText className="h-4 w-4 mr-2" /> }
    ];
    
    return tabs;
  };

  const sidebarTabs = getSidebarTabs();

  return (
    <div className="h-[100dvh] bg-gray-900 text-white overflow-hidden">
      <FullscreenEnforcer />

      <div className="flex h-full min-h-0 flex-col">
        <header className="flex shrink-0 flex-col gap-2 bg-hitam-primary p-3 text-white shadow-md sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2 className="text-lg font-medium">Meeting: {meetingId}</h2>
            <Separator orientation="vertical" className="hidden h-6 bg-white/20 sm:block" />
            <div className="flex items-center text-sm">
              <Users className="h-4 w-4 mr-1" />
              <span>{participants.length} participants</span>
            </div>
            <Separator orientation="vertical" className="hidden h-6 bg-white/20 sm:block" />
            <span className="text-xs text-white/80">Local demo · no server connection</span>
          </div>

          <Dialog open={controlsOpen} onOpenChange={setControlsOpen}>
            <DialogTrigger asChild>
              <button
                type="button"
                className="self-end rounded bg-hitam-tertiary px-3 py-2 text-sm font-medium text-white hover:bg-hitam-dark sm:self-auto"
              >
                Controls
              </button>
            </DialogTrigger>

            <DialogContent className="flex max-w-2xl flex-col border-slate-700 bg-slate-900 p-4 text-slate-100 sm:p-6">
              <DialogHeader>
                <DialogTitle className="text-white">Meeting Controls</DialogTitle>
                <DialogDescription className="text-slate-300">
                  Local preview controls and browser-only demo options. Nothing is shared with other participants.
                </DialogDescription>
              </DialogHeader>
              <MeetingControls
                participants={participants}
                meetingId={meetingId || ""}
                onEndMeeting={endMeeting}
                onRemoveParticipants={(removedIds) => {
                  setParticipants(current => current.filter(participant => !removedIds.includes(participant.id)));
                }}
                onToggleCamera={startCamera}
                onToggleMicrophone={toggleMicrophone}
                onToggleScreenShare={startScreenShare}
                onChatToggle={handleChatToggle}
                onOpenAssignments={() => {
                  setControlsOpen(false);
                  setActiveSidebarTab("assignments");
                }}
                cameraActive={cameraActive}
                micActive={micActive}
                screenShareActive={screenShareActive}
                isChatEnabled={isChatEnabled}
              />
            </DialogContent>
          </Dialog>
        </header>

        <main className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
          <div className="flex h-[38vh] min-h-0 shrink-0 flex-col md:h-auto md:flex-1">
            <div className="flex-1 overflow-hidden bg-black p-2 sm:p-4">
              <div className="grid grid-cols-3 gap-3 h-full">
                <div className="relative bg-gray-800 rounded-md overflow-hidden flex items-center justify-center col-span-2 row-span-2">
                  {screenShareActive ? (
                    <VideoFeed
                      participantId={user.id}
                      participantName={`${user.name} (You)`}
                      hasCamera={cameraActive}
                      isMuted={!micActive}
                      isActive={micActive}
                      isScreenSharing={true}
                      videoRef={localVideoRef}
                      screenShareRef={screenShareRef}
                      isMainFeed={true}
                    />
                  ) : (
                    <>
                      <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className={`w-full h-full object-cover ${
                          cameraActive ? "block" : "hidden"
                        }`}
                      />

                      {!cameraActive && (
                        <>
                          <div className="absolute inset-0 bg-gradient-to-br from-hitam-secondary to-hitam-primary opacity-30" />
                          <User size={64} className="text-white/30" />
                        </>
                      )}

                      <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-white text-xs flex items-center">
                        {user.name} (You)
                        {micActive ? (
                          <span className="ml-2 text-green-400">
                            <Activity className="h-3 w-3 inline-block animate-pulse" />
                          </span>
                        ) : (
                          <span className="ml-2">🔇</span>
                        )}
                      </div>

                    </>
                  )}
                </div>

                {participants.slice(1, 8).map((participant) => (
                  <VideoFeed
                    key={participant.id}
                    participantId={participant.id}
                    participantName={participant.name}
                    hasCamera={participant.hasCamera}
                    isMuted={participant.isMuted}
                    isActive={participant.isActive}
                    isScreenSharing={participant.isScreenSharing}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="flex min-h-0 w-full flex-1 flex-col border-t border-gray-700 bg-gray-800 md:w-80 md:flex-none md:border-l md:border-t-0">
            <Tabs value={activeSidebarTab} onValueChange={setActiveSidebarTab} className="flex min-h-0 flex-1 flex-col">
              <TabsList className="grid w-full shrink-0 grid-cols-3 rounded-none bg-gray-900">
                {sidebarTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="min-w-0 gap-1 px-1 text-xs data-[state=active]:bg-gray-800 sm:text-sm"
                  >
                    {tab.icon}
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="chat" className="m-0 flex min-h-0 flex-1 flex-col p-0">
                <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
                  {messages.map(message => (
                    <div key={message.id} className="bg-gray-900 rounded-md p-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-sm">
                          {message.sender}
                        </span>
                        <span className="text-xs text-gray-400">
                          {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                      </div>
                      <p className={`text-sm ${message.isFiltered ? "text-yellow-400" : "text-white"}`}>
                        {message.content}
                      </p>
                    </div>
                  ))}
                </div>

                {isChatEnabled ? (
                  <form onSubmit={sendMessage} className="p-3 border-t border-gray-700">
                    <div className="flex space-x-2">
                      <Input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        className="bg-gray-900 border-gray-700"
                      />
                      <Button type="submit" variant="secondary" size="icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 005.135 9.25h6.115a.75.75 0 010 1.5H5.135a1.5 1.5 0 00-1.442 1.086l-1.414 4.926a.75.75 0 00.826.95 28.896 28.896 0 0015.293-7.154.75.75 0 000-1.115A28.897 28.897 0 003.105 2.289z" />
                        </svg>
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="p-3 border-t border-gray-700 text-center text-sm text-gray-400">
                    Chat has been disabled by the host
                  </div>
                )}
              </TabsContent>

              <TabsContent value="participants" className="m-0 min-h-0 flex-1 overflow-y-auto p-3">
                <div className="space-y-1">
                  {participants.map(participant => (
                    <div 
                      key={participant.id}
                      className="flex items-center justify-between p-2 rounded-sm hover:bg-gray-700"
                    >
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full ${participant.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'} mr-2`}></div>
                        <span className="text-sm">{participant.name}</span>
                        {participant.isScreenSharing && (
                          <span className="ml-2 text-xs text-blue-400">Sharing</span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        {participant.isMuted && <span className="text-xs text-gray-400">🔇</span>}
                        {!participant.hasCamera && <span className="text-xs text-gray-400">🎦</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="assignments" className="flex-1 overflow-y-auto p-3 m-0">
                <AssignmentTab isHost={isHost} meetingId={meetingId || ""} />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      {isHost && (
        <AttendanceTracker meetingId={meetingId || ""} user={user} />
      )}
    </div>
  );
};

export default Meeting;
