import { useState, useEffect } from "react";
import { Button } from "@/components/ui-interviewGuru/button";
import { Card } from "@/components/ui-interviewGuru/card";
import { Textarea } from "@/components/ui-interviewGuru/textarea";
import { useToast } from "@/hooks/use-toast";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Progress } from "@/components/ui-interviewGuru/progress";

interface InterviewSessionProps {
  resume: File;
  interviewerResume: File;
  role: string;
  round: string;
  genAI: GoogleGenerativeAI;
}

interface Question {
  question: string;
  answer: string;
}

const InterviewSession = ({
  resume,
  interviewerResume,
  role,
  round,
  genAI,
}: InterviewSessionProps) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [score, setScore] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    generateQuestions();
  }, []);

  const generateQuestions = async () => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = `You are a design interviewer conducting an interview for the role of ${role} in the ${round} round. Generate exactly 5 relevant interview questions that focus on design principles, process, and problem-solving. For each question, also provide an ideal answer that would demonstrate strong design thinking. Return the response in this exact format (no markdown, just pure JSON):
      [
        {
          "question": "What is your design process?",
          "answer": "A strong answer would include..."
        },
        {
          "question": "How do you handle design critiques?",
          "answer": "A strong answer would include..."
        },
        {
          "question": "Can you describe a challenging design problem you've faced?",
          "answer": "A strong answer would include..."
        },
        {
          "question": "What tools do you use for design?",
          "answer": "A strong answer would include..."
        },
        {
          "question": "How do you stay updated with design trends?",
          "answer": "A strong answer would include..."
        }
      ]`;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      try {
        const parsedQuestions = JSON.parse(text);
        if (Array.isArray(parsedQuestions) && parsedQuestions.length === 5) {
          setQuestions(parsedQuestions);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (parseError) {
        console.error("Parse error:", parseError);
        toast({
          title: "Error",
          description: "Failed to parse interview questions. Please try again.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error generating questions:", error);
      toast({
        title: "Error",
        description: "Failed to generate interview questions. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleNextQuestion = async () => {
    if (!userAnswer.trim()) {
      toast({
        title: "Empty Answer",
        description: "Please provide an answer before continuing.",
        variant: "destructive",
      });
      return;
    }

    if (currentQuestionIndex === questions.length - 1) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `As a design interviewer, evaluate this response for the role of ${role}:
          Question: ${questions[currentQuestionIndex].question}
          Candidate's Answer: ${userAnswer}
          Expected Answer: ${questions[currentQuestionIndex].answer}
          
          Provide a detailed evaluation in this exact JSON format:
          {
            "score": <number between 0-100>,
            "strengths": ["<strength1>", "<strength2>", ...],
            "improvements": ["<improvement1>", "<improvement2>", ...],
            "suggestions": ["<specific suggestion1>", "<specific suggestion2>", ...],
            "overallFeedback": "<detailed paragraph of feedback>"
          }`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const feedbackData = JSON.parse(response.text());
        setScore(feedbackData.score);
        setFeedback(JSON.stringify(feedbackData, null, 2));
        setIsFinished(true);
      } catch (error) {
        console.error("Error generating feedback:", error);
        toast({
          title: "Error",
          description: "Failed to generate feedback. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer("");
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-orange-500";
    return "text-red-500";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-lg">Preparing your interview questions...</p>
      </div>
    );
  }

  if (isFinished) {
    try {
      const feedbackData = JSON.parse(feedback);
      return (
        <div className="max-w-3xl mx-auto p-4">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Interview Feedback</h2>
            
            <div className="flex justify-center mb-8">
              <div className="relative inline-flex items-center justify-center">
                <Progress value={feedbackData.score} className="w-32 h-32 rounded-full" />
                <span className={`absolute text-4xl font-bold ${getScoreColor(feedbackData.score)}`}>
                  {feedbackData.score}
                </span>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-green-600 mb-2">Strengths</h3>
                <ul className="list-disc pl-6">
                  {feedbackData.strengths.map((strength: string, index: number) => (
                    <li key={index}>{strength}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-orange-600 mb-2">Areas for Improvement</h3>
                <ul className="list-disc pl-6">
                  {feedbackData.improvements.map((improvement: string, index: number) => (
                    <li key={index}>{improvement}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-blue-600 mb-2">Specific Suggestions</h3>
                <ul className="list-disc pl-6">
                  {feedbackData.suggestions.map((suggestion: string, index: number) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2">Overall Feedback</h3>
                <p className="text-gray-700">{feedbackData.overallFeedback}</p>
              </div>
            </div>

            <Button
              className="mt-6"
              onClick={() => window.location.reload()}
            >
              Start New Interview
            </Button>
          </Card>
        </div>
      );
    } catch (error) {
      return (
        <div className="max-w-3xl mx-auto p-4">
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Error Processing Feedback</h2>
            <p>There was an error processing the interview feedback. Please try again.</p>
            <Button
              className="mt-6"
              onClick={() => window.location.reload()}
            >
              Start New Interview
            </Button>
          </Card>
        </div>
      );
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">
          Question {currentQuestionIndex + 1} of {questions.length}
        </h2>
        <div className="space-y-4">
          <p className="mb-4">{questions[currentQuestionIndex]?.question}</p>
          <Textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="mb-4"
            rows={6}
          />
          <Button onClick={handleNextQuestion}>
            {currentQuestionIndex === questions.length - 1 ? "Finish Interview" : "Next Question"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default InterviewSession;
