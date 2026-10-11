import React, { useState } from "react";
import { 
  Mic, MicOff, Video, VideoOff, X, UserMinus, 
  MessageSquare, MessageSquareOff, Download, Mail, 
  ScreenShare, ScreenShareOff, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "./AuthProvider";

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

interface MeetingControlsProps {
  participants: Participant[];
  meetingId: string;
  onEndMeeting: () => void;
  onRemoveParticipants: (participantIds: string[]) => void;
  onOpenAssignments: () => void;
  onToggleCamera: () => void;
  onToggleMicrophone: () => void;
  onToggleScreenShare: () => void;
  onChatToggle: (enabled: boolean) => void;
  cameraActive: boolean;
  micActive: boolean;
  screenShareActive: boolean;
  isChatEnabled: boolean;
}

export const MeetingControls: React.FC<MeetingControlsProps> = ({
  participants,
  meetingId,
  onEndMeeting,
  onRemoveParticipants,
  onOpenAssignments,
  onToggleCamera,
  onToggleMicrophone,
  onToggleScreenShare,
  onChatToggle,
  cameraActive,
  micActive,
  screenShareActive,
  isChatEnabled,
}) => {
  const { isHost } = useAuth();
  
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
  
  const toggleChat = () => {
    if (!isHost) return;
    const newChatState = !isChatEnabled;
    onChatToggle(newChatState);
    toast({
      title: newChatState ? "Chat Enabled" : "Chat Disabled",
      description: newChatState 
        ? "Participants can now send messages" 
        : "Participants can no longer send messages",
      duration: 3000,
    });
  };

  const toggleParticipantSelection = (participantId: string) => {
    if (selectedParticipants.includes(participantId)) {
      setSelectedParticipants(selectedParticipants.filter(id => id !== participantId));
    } else {
      setSelectedParticipants([...selectedParticipants, participantId]);
    }
  };

  const removeParticipants = () => {
    if (!isHost || selectedParticipants.length === 0) return;

    onRemoveParticipants(selectedParticipants);
    toast({
      title: "Removed from Demo List",
      description: `${selectedParticipants.length} demo participant(s) removed from this view. No remote participant was affected.`,
    });

    setSelectedParticipants([]);
  };

  const escapeCsvCell = (value: string) => {
    const safeValue = /^[\s]*[=+\-@]/.test(value) ? `'${value}` : value;
    return `"${safeValue.replace(/"/g, '""')}"`;
  };

  const downloadAttendance = () => {
    const headers = ["Name", "Email", "Join Time", "Duration (minutes)"].map(escapeCsvCell).join(",");
    const rows = participants.map(participant => {
      const durationMinutes = Math.max(0, Math.floor((Date.now() - participant.joinTime.getTime()) / 60000));
      return [
        escapeCsvCell(participant.name),
        escapeCsvCell(participant.email),
        escapeCsvCell(participant.joinTime.toLocaleString()),
        String(durationMinutes)
      ].join(",");
    });
    const csvContent = [headers, ...rows].join("\n");
      
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance-${meetingId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Attendance Downloaded",
      description: "The attendance report has been downloaded as a CSV file",
    });
  };

  const emailAttendance = () => {
    toast({
      title: "Email Service Unavailable",
      description: "This demo has no email service. Download the attendance CSV instead.",
      variant: "destructive",
    });
  };

  const getTabItems = () => {
    const baseItems = [
      { value: "controls", label: "Controls" },
      { value: "participants", label: `Participants (${participants.length})` },
      { value: "stream", label: "Stream" },
    ];
    
    if (isHost) {
      baseItems.push({ value: "attendance", label: "Attendance" });
    }
    
    baseItems.push({ value: "assignments", label: "Assignments" });
    
    return baseItems;
  };

  const tabItems = getTabItems();

  return (
    <div className="rounded-md border border-slate-600 bg-slate-800 p-3 text-white shadow-lg sm:p-4">
      <Tabs defaultValue="controls" className="w-full">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-md bg-slate-700 p-1 sm:grid-cols-3 lg:grid-cols-5">
          {tabItems.map(tab => (
            <TabsTrigger 
              key={tab.value} 
              value={tab.value}
              className="min-h-10 min-w-0 whitespace-normal px-2 py-1.5 text-xs leading-tight text-slate-100 data-[state=active]:bg-hitam-primary data-[state=active]:text-white sm:text-sm"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <TabsContent value="controls" className="mt-3 grid grid-cols-2 gap-2">
          <Button 
            variant="outline" 
            className={`h-auto min-h-11 w-full justify-start whitespace-normal border-slate-500 bg-slate-700 px-2 text-left text-white hover:bg-slate-600 sm:px-3 ${!micActive ? "border-red-300 bg-red-900/70 hover:bg-red-800" : ""}`}
            onClick={onToggleMicrophone}
          >
            {!micActive ? <MicOff size={18} /> : <Mic size={18} />}
            <span>{!micActive ? "Unmute" : "Mute"}</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto min-h-11 w-full justify-start whitespace-normal border-slate-500 bg-slate-700 px-2 text-left text-white hover:bg-slate-600 sm:px-3"
            onClick={onToggleCamera}
          >
            {cameraActive ? <VideoOff size={18} /> : <Video size={18} />}
            <span>{cameraActive ? "Stop Video" : "Start Video"}</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto min-h-11 w-full justify-start whitespace-normal border-slate-500 bg-slate-700 px-2 text-left text-white hover:bg-slate-600 sm:px-3"
            onClick={onToggleScreenShare}
          >
            {screenShareActive ? <ScreenShareOff size={18} /> : <ScreenShare size={18} />}
            <span>{screenShareActive ? "Stop Sharing" : "Share Screen"}</span>
          </Button>
          
          {isHost && (
            <Button 
              variant="outline" 
              className="h-auto min-h-11 w-full justify-start whitespace-normal border-slate-500 bg-slate-700 px-2 text-left text-white hover:bg-slate-600 sm:px-3"
              onClick={toggleChat}
            >
              {isChatEnabled ? <MessageSquareOff size={18} /> : <MessageSquare size={18} />}
              <span>{isChatEnabled ? "Disable Chat" : "Enable Chat"}</span>
            </Button>
          )}
          
          <Button 
            variant="outline" 
            className="h-auto min-h-11 w-full justify-start whitespace-normal border-red-400 bg-red-700 px-2 text-left text-white hover:bg-red-600 sm:px-3"
            onClick={onEndMeeting}
          >
            <X size={18} />
            <span>{isHost ? "End Meeting" : "Leave Meeting"}</span>
          </Button>
        </TabsContent>
        
        <TabsContent value="participants" className="mt-3">
          <div className="max-h-60 overflow-y-auto border border-white/20 rounded-md p-2 mb-3 bg-hitam-tertiary/20">
            {participants.map(participant => (
              <button
                type="button"
                key={participant.id} 
                aria-pressed={selectedParticipants.includes(participant.id)}
                disabled={!isHost}
                className={`flex w-full items-center justify-between rounded-sm p-2 text-left disabled:cursor-default ${
                  selectedParticipants.includes(participant.id) ? "bg-hitam-tertiary/40" : ""
                } hover:bg-hitam-tertiary/30 transition-colors duration-200`}
                onClick={() => isHost && toggleParticipantSelection(participant.id)}
              >
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full ${
                    participant.isActive ? 'bg-green-400 animate-pulse' : 'bg-green-400/50'
                  } mr-2`}></div>
                  <span className="font-medium">{participant.name}</span>
                  {participant.isScreenSharing && (
                    <span className="ml-2 text-xs text-blue-300">Sharing</span>
                  )}
                </div>
                <div className="flex gap-1 text-xs text-gray-200">
                  {participant.isMuted && <MicOff size={14} />}
                  {!participant.hasCamera && <VideoOff size={14} />}
                </div>
              </button>
            ))}
          </div>
          
          {isHost && (
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-red-500/50 hover:bg-red-500/70 text-white border-white/20"
                onClick={removeParticipants}
                disabled={selectedParticipants.length === 0}
              >
                <UserMinus size={16} className="mr-1" />
                Remove Selected
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="stream" className="mt-3 text-sm">
          <div className="space-y-3 rounded-md bg-slate-700 p-3">
            <h3 className="font-medium text-white">Local preview status</h3>
            <p className="text-slate-200">
              This demo has no meeting server. Media is not connected to or streamed to other participants.
            </p>
            <Separator className="bg-white/20" />
            <div className="grid grid-cols-2 gap-2 text-slate-100">
              <span>Microphone</span><span>{micActive ? "On locally" : "Off"}</span>
              <span>Camera</span><span>{cameraActive ? "On locally" : "Off"}</span>
              <span>Screen sharing</span><span>{screenShareActive ? "On locally" : "Off"}</span>
            </div>
          </div>
        </TabsContent>
        
        {isHost && (
          <TabsContent value="attendance" className="text-sm mt-3">
            <div className="bg-hitam-tertiary/20 p-3 rounded-md">
              <div className="mb-2 font-semibold">Current Attendance: {participants.filter(p => p.isPresent).length}/{participants.length}</div>
              <p className="text-xs text-gray-300 mb-4">
                This report contains this browser session's demo participant list. Email delivery is not configured.
              </p>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-white/20 text-white hover:bg-hitam-tertiary/60"
                  onClick={downloadAttendance}
                >
                  <Download size={16} className="mr-1" />
                  Download CSV
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-white/20 text-white hover:bg-hitam-tertiary/60"
                  onClick={emailAttendance}
                >
                  <Mail size={16} className="mr-1" />
                  Email Report
                </Button>
              </div>
            </div>
          </TabsContent>
        )}
        
        <TabsContent value="assignments" className="text-sm mt-3">
          <div className="bg-hitam-tertiary/20 p-3 rounded-md">
            <p className="text-xs text-gray-300 mb-4">
              {isHost 
                ? "Upload assignments for participants to complete during or after the meeting." 
                : "View and submit assignments for this meeting."}
            </p>
            
            {isHost ? (
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-white/20 text-white hover:bg-hitam-tertiary/60"
                  onClick={onOpenAssignments}
                >
                  <FileText size={16} className="mr-1" />
                  Open Assignment Manager
                </Button>
                <p className="mt-2 text-xs">Assignments are managed in the meeting’s Assignments panel.</p>
              </div>
            ) : (
              <p className="text-xs">No assignments available for this meeting.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
