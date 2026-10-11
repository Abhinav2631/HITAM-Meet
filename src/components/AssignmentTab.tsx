
import React, { useState } from "react";
import { FileText, Upload, Download, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Separator } from "@/components/ui/separator";

interface Assignment {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
  dueDate?: Date;
  fileUrl?: string;
  fileName?: string;
}

interface AssignmentTabProps {
  isHost: boolean;
  meetingId: string;
}

export const AssignmentTab: React.FC<AssignmentTabProps> = ({ isHost, meetingId }) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newAssignment, setNewAssignment] = useState<Partial<Assignment>>({
    title: "",
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setNewAssignment({ 
        ...newAssignment, 
        fileName: e.target.files[0].name 
      });
    }
  };

  const createAssignment = () => {
    if (!newAssignment.title) {
      toast({
        title: "Title Required",
        description: "Please enter a title for the assignment",
        variant: "destructive",
      });
      return;
    }

    // In a real app, this would upload the file to a server
    const newAssignmentObj: Assignment = {
      id: Math.random().toString(36).substring(2, 15),
      title: newAssignment.title || "Untitled Assignment",
      description: newAssignment.description || "",
      createdAt: new Date(),
      dueDate: newAssignment.dueDate,
      fileName: selectedFile?.name,
      fileUrl: selectedFile ? URL.createObjectURL(selectedFile) : undefined,
    };

    setAssignments([...assignments, newAssignmentObj]);
    setNewAssignment({ title: "", description: "" });
    setSelectedFile(null);
    setShowUploadForm(false);

    toast({
      title: "Assignment Created",
      description: "Added to this browser session only; it is not shared with other participants.",
    });
  };

  const downloadAssignment = (assignment: Assignment) => {
    if (assignment.fileUrl) {
      const link = document.createElement("a");
      link.href = assignment.fileUrl;
      link.download = assignment.fileName || "assignment-file";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Downloading Assignment",
        description: `Downloading ${assignment.fileName}`,
      });
    } else {
      toast({
        title: "No File Attached",
        description: "This assignment has no file to download.",
        variant: "destructive",
      });
    }
  };

  const submitAssignment = () => {
    toast({
      title: "Submission Unavailable",
      description: "This demo has no submission service. Your solution was not uploaded.",
      variant: "destructive",
    });
  };

  return (
    <div className="w-full">
      {isHost && (
        <div className="mb-6">
          {!showUploadForm ? (
            <Button onClick={() => setShowUploadForm(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Upload New Assignment
            </Button>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Create New Assignment</CardTitle>
                <CardDescription>
                  Upload an assignment for meeting participants to complete.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    value={newAssignment.title}
                    onChange={e => setNewAssignment({...newAssignment, title: e.target.value})}
                    placeholder="Assignment Title" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input 
                    id="description" 
                    value={newAssignment.description}
                    onChange={e => setNewAssignment({...newAssignment, description: e.target.value})}
                    placeholder="Add details about the assignment" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="file">Assignment File</Label>
                  <Input 
                    id="file" 
                    type="file" 
                    onChange={handleFileChange}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => setShowUploadForm(false)}>
                  Cancel
                </Button>
                <Button onClick={createAssignment}>
                  Create Assignment
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-medium">
          {assignments.length 
            ? "Available Assignments" 
            : "No assignments available for this meeting"}
        </h3>
        
        {assignments.map(assignment => (
          <Card key={assignment.id}>
            <CardHeader>
              <CardTitle className="text-md flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                {assignment.title}
              </CardTitle>
              <CardDescription>
                {assignment.description || "No description provided"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {assignment.fileName && (
                <div className="flex items-center text-sm">
                  <span className="text-muted-foreground">File:</span>
                  <span className="font-medium ml-2">{assignment.fileName}</span>
                </div>
              )}
              
              {assignment.dueDate && (
                <div className="flex items-center text-sm mt-1">
                  <span className="text-muted-foreground">Due:</span>
                  <span className="font-medium ml-2">
                    {assignment.dueDate.toLocaleString()}
                  </span>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              {isHost ? (
                <Button variant="outline" size="sm" onClick={() => downloadAssignment(assignment)} disabled={!assignment.fileUrl}>
                  <Download className="mr-2 h-3 w-3" />
                  Download
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => downloadAssignment(assignment)} disabled={!assignment.fileUrl}>
                    <Download className="mr-2 h-3 w-3" />
                    Download
                  </Button>
                  <Button size="sm" onClick={submitAssignment}>
                    <CheckCircle2 className="mr-2 h-3 w-3" />
                    Submit Solution
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
