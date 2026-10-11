
import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { filterProfanity, containsProfanity } from "@/utils/profanityFilter";

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: Date;
  isFiltered: boolean;
}

interface ChatStreamProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isChatEnabled: boolean;
  currentUser: string;
}

export const ChatStream: React.FC<ChatStreamProps> = ({
  messages,
  onSendMessage,
  isChatEnabled,
  currentUser
}) => {
  const [newMessage, setNewMessage] = useState("");
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleSendMessage = (e: React.FormEvent) => {
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
    
    onSendMessage(messageContent);
    setNewMessage("");
  };
  
  return (
    <div className="flex-1 flex flex-col p-0 m-0">
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`rounded-md p-2 ${
              message.sender === currentUser ? 'bg-hitam-secondary/30' : 'bg-gray-900'
            }`}
          >
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
        <div ref={messagesEndRef} />
      </div>
      
      {isChatEnabled ? (
        <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-700">
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
    </div>
  );
};
