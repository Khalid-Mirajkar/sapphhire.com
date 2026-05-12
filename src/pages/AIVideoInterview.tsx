
import React, { useState } from 'react';
import AIInterviewSession from '@/components/AIInterviewSession';
import AIInterviewResults from '@/components/AIInterviewResults';
import { useTestSession } from '@/hooks/useTestSession';
import { useSEO } from '@/hooks/useSEO';

interface InterviewResponse {
  questionId: number;
  question: string;
  answer: string;
  score: number;
  evaluation: string;
  timeSpent: number;
}

const AIVideoInterview = () => {
  const { data: session } = useTestSession();
  const [interviewCompleted, setInterviewCompleted] = useState(false);
  const [interviewResults, setInterviewResults] = useState<{
    responses: InterviewResponse[];
    totalTime: number;
  } | null>(null);

  useSEO({
    title: session ? `${session.jobTitle} interview · Sapphhire` : "AI Video Interview · Sapphhire",
    description: "Practise live AI video interviews tailored to your target role.",
  });

  if (!session) return null;

  const handleInterviewComplete = (responses: InterviewResponse[], totalTime: number) => {
    setInterviewResults({ responses, totalTime });
    setInterviewCompleted(true);
  };

  if (interviewCompleted && interviewResults) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white p-6">
        <AIInterviewResults
          responses={interviewResults.responses}
          totalTime={interviewResults.totalTime}
          companyName={session.companyName}
          jobTitle={session.jobTitle}
        />
      </div>
    );
  }

  return (
    <AIInterviewSession
      companyName={session.companyName}
      jobTitle={session.jobTitle}
      onInterviewComplete={handleInterviewComplete}
    />
  );
};

export default AIVideoInterview;
