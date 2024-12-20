import { useState } from "react";
import { Button } from "@/components/ui-interviewGuru/button";
import { Input } from "@/components/ui-interviewGuru/input";
import { Label } from "@/components/ui-interviewGuru/label";
import { Card } from "@/components/ui-interviewGuru/card";
import { useToast } from "@/components/ui-interviewGuru/use-toast";
import FileUpload from "./FileUpload";
import InterviewSession from "./InterviewSession";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyAyZXZUJ5irogLkCclIE-1jKhKZKOiedUM");

const InterViewGuru = () => {
  const [resume, setResume] = useState(null);
  const [interviewerResume, setInterviewerResume] = useState(null);
  const [role, setRole] = useState("");
  const [round, setRound] = useState("");
  const [isInterviewStarted, setIsInterviewStarted] = useState(false);
  const { toast } = useToast();

  const handleStartInterview = () => {
    if (!resume || !interviewerResume || !role || !round) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields before starting the interview.",
        variant: "destructive",
      });
      return;
    }
    setIsInterviewStarted(true);
  };

  if (isInterviewStarted) {
    return (
      <InterviewSession
        resume={resume}
        interviewerResume={interviewerResume}
        role={role}
        round={round}
        genAI={genAI}
      />
    );
  }

  return (
    <div className="interview-container">
      <Card className="p-6">
        <h1 className="text-3xl font-bold text-center mb-8">Design Mock Interview Portal</h1>
        
        <div className="space-y-6">
          <div>
            <Label>Your Resume (PDF)</Label>
            <FileUpload
              accept=".pdf"
              onChange={(file) => setResume(file)}
              label="Upload your resume"
            />
          </div>

          <div>
            <Label>Interviewer's Resume (PDF)</Label>
            <FileUpload
              accept=".pdf"
              onChange={(file) => setInterviewerResume(file)}
              label="Upload interviewer's resume"
            />
          </div>

          <div>
            <Label htmlFor="role">Role you're applying for</Label>
            <Input
              id="role"
              placeholder="e.g. Senior Product Designer"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="round">Interview Round</Label>
            <Input
              id="round"
              placeholder="e.g. Design Challenge, Portfolio Review"
              value={round}
              onChange={(e) => setRound(e.target.value)}
            />
          </div>

          <Button
            className="w-full"
            size="lg"
            onClick={handleStartInterview}
          >
            Start Mock Interview
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default InterViewGuru;