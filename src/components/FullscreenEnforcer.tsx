
import React, { useEffect, useState } from "react";
import { Maximize2, AlertTriangle, DoorClosed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

type FullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  mozFullScreenElement?: Element | null;
  msFullscreenElement?: Element | null;
};

type FullscreenHTMLElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
  mozRequestFullScreen?: () => Promise<void> | void;
  msRequestFullscreen?: () => Promise<void> | void;
};

export const FullscreenEnforcer: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the document is in fullscreen mode
    const updateFullscreenState = () => {
      const fullscreenDocument = document as FullscreenDocument;
      const fullscreenElement = 
        fullscreenDocument.fullscreenElement ||
        fullscreenDocument.webkitFullscreenElement ||
        fullscreenDocument.mozFullScreenElement ||
        fullscreenDocument.msFullscreenElement;
      
      setIsFullscreen(!!fullscreenElement);
      
      // If we exited fullscreen and we're in meeting, force back to fullscreen
      if (!fullscreenElement && isFullscreen) {
        toast({
          title: "Fullscreen Required",
          description: "This meeting requires fullscreen mode. Please stay in fullscreen.",
          variant: "destructive",
        });
        
        // Force back to fullscreen after a short delay
        setTimeout(enterFullscreen, 1000);
      }
    };

    document.addEventListener("fullscreenchange", updateFullscreenState);
    document.addEventListener("webkitfullscreenchange", updateFullscreenState);
    document.addEventListener("mozfullscreenchange", updateFullscreenState);
    document.addEventListener("MSFullscreenChange", updateFullscreenState);

    // Window blur event to detect alt+tab or window switching
    const handleWindowBlur = () => {
      toast({
        title: "Meeting Active",
        description: "Please return to the meeting window.",
        variant: "destructive",
      });
    };

    window.addEventListener("blur", handleWindowBlur);
    
    // Visibility change event to detect tab switching
    const handleVisibilityChange = () => {
      if (document.hidden) {
        toast({
          title: "Meeting Active",
          description: "Please return to the meeting tab.",
          variant: "destructive",
        });
      }
    };
    
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("fullscreenchange", updateFullscreenState);
      document.removeEventListener("webkitfullscreenchange", updateFullscreenState);
      document.removeEventListener("mozfullscreenchange", updateFullscreenState);
      document.removeEventListener("MSFullscreenChange", updateFullscreenState);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isFullscreen]);

  const enterFullscreen = () => {
    const docEl = document.documentElement as FullscreenHTMLElement;

    const requestFullscreen = 
      docEl.requestFullscreen ||
      docEl.webkitRequestFullscreen ||
      docEl.mozRequestFullScreen ||
      docEl.msRequestFullscreen;

    if (requestFullscreen) {
      const result = requestFullscreen.call(docEl);
      if (result && typeof result.then === "function") {
        void result.catch(() => {
          toast({
            title: "Fullscreen Unavailable",
            description: "Your browser could not enter fullscreen mode.",
            variant: "destructive",
          });
        });
      }
    } else {
      toast({
        title: "Fullscreen Unavailable",
        description: "Your browser does not support fullscreen mode.",
        variant: "destructive",
      });
    }
  };

  const handleExitMeeting = () => {
    // Take the user to the Dashboard or home page
    navigate("/dashboard");
  };

  // If not in fullscreen, show a prompt to enter fullscreen
  if (!isFullscreen) {
    return (
      <div className="fixed inset-0 bg-hitam-primary bg-opacity-90 flex flex-col items-center justify-center z-50 text-white p-4">
        <AlertTriangle size={64} className="mb-4 text-hitam-error" />
        <h2 className="text-2xl font-bold mb-2">Fullscreen Required</h2>
        <p className="mb-6 text-center max-w-md">
          This meeting requires fullscreen mode to ensure participation and privacy.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <Button 
            onClick={enterFullscreen}
            className="bg-hitam-accent hover:bg-hitam-secondary w-full"
          >
            <Maximize2 className="mr-2" />
            Enter Fullscreen Mode
          </Button>
          <Button
            variant="destructive"
            onClick={handleExitMeeting}
            className="w-full mt-2 flex items-center justify-center"
          >
            <DoorClosed className="mr-2" />
            Exit Meeting
          </Button>
        </div>
      </div>
    );
  }

  return null;
};
