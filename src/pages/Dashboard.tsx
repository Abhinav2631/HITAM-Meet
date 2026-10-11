
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { VideoIcon, PlusCircle, Clock, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/components/AuthProvider";

interface Meeting {
  id: string;
  title: string;
  createdAt: Date;
  participantCount: number;
  isLive: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, logout } = useAuth();
  
  const [meetings, setMeetings] = useState<Meeting[]>([
    {
      id: "meeting-123",
      title: "Demo Meeting",
      createdAt: new Date(),
      participantCount: 0,
      isLive: false
    }
  ]);
  const [newMeetingTitle, setNewMeetingTitle] = useState("");
  const [joinMeetingId, setJoinMeetingId] = useState("");

  const createNewMeeting = () => {
    const meetingId = Math.random().toString(36).substring(2, 10);
    
    const newMeeting: Meeting = {
      id: meetingId,
      title: newMeetingTitle || `Meeting ${meetings.length + 1}`,
      createdAt: new Date(),
      participantCount: 0,
      isLive: false
    };
    
    setMeetings([...meetings, newMeeting]);
    setNewMeetingTitle("");
    
    toast({
      title: "Meeting Created",
      description: "Your new meeting has been created successfully",
    });
    
    // Navigate to the meeting
    navigate(`/meeting/${meetingId}`);
  };

  const joinMeeting = () => {
    if (!joinMeetingId) {
      toast({
        title: "Meeting ID Required",
        description: "Please enter a meeting ID to join",
        variant: "destructive",
      });
      return;
    }
    
    navigate(`/meeting/${joinMeetingId}`);
  };

  const showSettingsNotice = () => {
    toast({
      title: "Settings Unavailable",
      description: "Meeting preferences are not configurable in this demo.",
      variant: "destructive",
    });
  };

  const startMeeting = (meetingId: string) => {
    navigate(`/meeting/${meetingId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-hitam-primary text-white px-6 py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <VideoIcon className="mr-2" />
            <h1 className="text-xl font-bold">HITAM Meet</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm">
              Welcome, {user?.name || "User"}
            </span>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-white hover:bg-hitam-primary/90"
              onClick={() => logout()}
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-2/3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Your Meetings</h2>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    New Meeting
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Meeting</DialogTitle>
                    <DialogDescription>
                      Give your meeting a title and create it.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="title" className="text-right">
                        Title
                      </label>
                      <Input
                        id="title"
                        value={newMeetingTitle}
                        onChange={(e) => setNewMeetingTitle(e.target.value)}
                        className="col-span-3"
                        placeholder="Meeting Title (Optional)"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" onClick={createNewMeeting}>Create Meeting</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {meetings.map(meeting => (
                <Card key={meeting.id}>
                  <CardHeader className="pb-2">
                    <CardTitle>{meeting.title}</CardTitle>
                    <CardDescription>ID: {meeting.id}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>Created {meeting.createdAt.toLocaleDateString()}</span>
                      <User className="ml-4 mr-1 h-3 w-3" />
                      <span>{meeting.participantCount} participants</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full"
                      onClick={() => startMeeting(meeting.id)}
                    >
                      {meeting.isLive ? "Join Meeting" : "Start Meeting"}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
          
          <div className="w-full md:w-1/3">
            <Card>
              <CardHeader>
                <CardTitle>Join a Meeting</CardTitle>
                <CardDescription>
                  Enter a meeting ID to join an existing meeting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input
                    placeholder="Enter meeting ID"
                    value={joinMeetingId}
                    onChange={(e) => setJoinMeetingId(e.target.value)}
                  />
                  <Button 
                    className="w-full" 
                    onClick={joinMeeting}
                  >
                    Join Meeting
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Meeting Settings</CardTitle>
                <CardDescription>
                  Configure your meeting preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button variant="outline" className="w-full" onClick={showSettingsNotice}>
                    <Settings className="mr-2 h-4 w-4" />
                    Configure Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
