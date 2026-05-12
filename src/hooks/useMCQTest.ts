
import { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MCQQuestion, TestResult } from "@/types/mcq";
import { useAuth } from "@/contexts/AuthContext";
import { useQueryClient } from "@tanstack/react-query";

export const useMCQTest = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get data from router state, falling back to the persisted session in
  // localStorage so refreshes don't break the test.
  const stateData = (location.state as Record<string, string> | null) ?? null;
  let stored: Record<string, string> | null = null;
  if (!stateData?.companyName || !stateData?.jobTitle) {
    try {
      const raw = localStorage.getItem('testData');
      stored = raw ? JSON.parse(raw) : null;
    } catch {
      stored = null;
    }
  }
  const source = stateData?.companyName ? stateData : stored;

  const companyName = source?.companyName;
  const jobTitle = source?.jobTitle;
  const numberOfQuestions = source?.numberOfQuestions || '15';
  
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [questionSeed, setQuestionSeed] = useState(() => 
    Math.floor(Math.random() * 1000000) + Date.now() % 10000
  );
  const [isIncompatibleJob, setIsIncompatibleJob] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);
  
  // Timer related state
  const [initialSeconds, setInitialSeconds] = useState(600); // 10 minutes
  const [remainingSeconds, setRemainingSeconds] = useState(600);
  const [timerActive, setTimerActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!companyName || !jobTitle) {
      setError("Missing company name or job title. Please return to the start page.");
      setIsLoading(false);
      return;
    }

    const loadQuestions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setIsIncompatibleJob(false);
        
        console.log(`Loading questions for ${companyName} - ${jobTitle} with seed ${questionSeed}`);
        
        console.log("Making API request to generate-questions with params:", {
          companyName,
          jobTitle,
          seed: questionSeed
        });

        const { data, error: supabaseError } = await supabase.functions.invoke('generate-questions', {
          body: { 
            companyName, 
            jobTitle, 
            seed: questionSeed,
            numberOfQuestions: numberOfQuestions || "10"
          }
        });

        console.log("Edge function response received:", { data, error: supabaseError });

        if (supabaseError) {
          console.error('Error calling generate-questions function:', supabaseError);
          
          // Handle specific error cases from the error message
          if (supabaseError.message) {
            if (supabaseError.message.includes("Edge Function returned a non-2xx status code")) {
              if (data && typeof data === 'object' && data.error) {
                console.log("Edge function returned error details:", data);
                throw new Error(data.error || 'Unknown error from OpenAI API');
              } else if (supabaseError.message.includes("401")) {
                throw new Error('Invalid or missing OpenAI API key. Please check the configuration in Supabase Edge Function Secrets.');
              } else if (supabaseError.message.includes("429")) {
                throw new Error('OpenAI API quota exceeded. Please check your billing details or try again later.');
              } else {
                console.error('Edge function response data:', data);
                throw new Error('Error generating questions. This may be due to an issue with the OpenAI API key configuration. Please check the Edge Function logs for more details.');
              }
            } else {
              throw new Error(supabaseError.message || 'Failed to load questions');
            }
          }
        }

        if (!data) {
          throw new Error('No data received from the server. Please check the Edge Function logs for more information.');
        }

        if (!Array.isArray(data)) {
          console.error('Invalid response format:', data);
          if (typeof data === 'object' && data.error) {
            throw new Error(data.error);
          }
          throw new Error('Received invalid question data from the server');
        }

        if (data.length === 1 && data[0].options && data[0].options.length === 1 && 
            data[0].options[0] === "Try a different job role") {
          setIsIncompatibleJob(true);
        }
        
        const validatedData = data.map(question => {
          if (!question.options || question.options.length !== 4) {
            console.warn('Question with incorrect number of options found, fixing:', question);
            return {
              ...question,
              options: question.options?.length ? 
                [...question.options].concat(["Option 2", "Option 3", "Option 4"]).slice(0, 4) : 
                ["Option 1", "Option 2", "Option 3", "Option 4"]
            };
          }
          return question;
        });

        console.log('Successfully loaded questions:', validatedData.length);
        setQuestions(validatedData);
        
        // Show success toast
        if (validatedData.length > 0) {
          toast({
            title: "Questions Generated Successfully",
            description: `${validatedData.length} questions ready for your practice test`
          });
          
          // Start timer only if we have valid questions
          if (validatedData.length > 1) {
            startTimer();
          }
        }
        
      } catch (err) {
        console.error('Error loading questions:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load questions. Please try again.';
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
    
    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [companyName, jobTitle, toast, retryCount, questionSeed]);

  const startTimer = useCallback(() => {
    setTimerActive(true);
    setStartTime(Date.now());
    
    timerRef.current = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          // Time's up - auto submit
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          // Only auto-submit if we have at least one answer
          if (Object.keys(selectedAnswers).length > 0) {
            evaluateTest();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [selectedAnswers]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOptionSelect = (questionId: number, optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const evaluateTest = useCallback(() => {
    // Stop the timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      setTimerActive(false);
    }
    
    // Calculate time taken
    const timeInSeconds = initialSeconds - remainingSeconds;
    
    const incorrect = questions.filter(
      (q) => selectedAnswers[q.id] !== q.correctAnswer
    ).map(q => ({
      questionId: q.id,
      question: q.question,
      userAnswer: q.options[selectedAnswers[q.id]],
      correctAnswer: q.options[q.correctAnswer],
      explanation: q.explanation || ''
    }));

    const score = questions.length - incorrect.length;
    
    const result = {
      score,
      totalQuestions: questions.length,
      timeInSeconds,
      incorrectAnswers: incorrect
    };

    setTestResult(result);
    setShowResults(true);
    
    // Save results to database if user is authenticated
    if (user) {
      saveResultToDatabase(score, questions.length, timeInSeconds);
    }
  }, [questions, selectedAnswers, initialSeconds, remainingSeconds, user]);
  
  const saveResultToDatabase = async (score: number, totalQuestions: number, timeInSeconds: number) => {
    if (resultSaved) return; // Prevent duplicate saves
    
    try {
      const { error: saveError } = await supabase
        .from('interview_results')
        .insert({
          user_id: user?.id,
          score,
          total_questions: totalQuestions,
          company_name: companyName,
          job_title: jobTitle,
          time_seconds: timeInSeconds
        });
        
      if (saveError) {
        console.error('Error saving test results:', saveError);
        toast({
          variant: "destructive",
          title: "Failed to save results",
          description: "Your test results couldn't be saved to your history."
        });
      } else {
        setResultSaved(true);
        // Invalidate analytics cache to refresh dashboard immediately
        queryClient.invalidateQueries({ queryKey: ['interview-results'] });
        toast({
          title: "Results saved",
          description: "Your test results have been saved to your history."
        });
      }
    } catch (err) {
      console.error('Error in saveResultToDatabase:', err);
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleRestartTest = () => {
    setQuestions([]);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setShowResults(false);
    setTestResult(null);
    setQuestionSeed(Math.floor(Math.random() * 1000000) + Date.now() % 10000);
    setIsLoading(true);
    setResultSaved(false);
    setRemainingSeconds(600);
  };

  const handleTakeAnotherTest = () => {
    navigate('/start-practice');
  };

  const handleBackToStart = () => {
    navigate('/start-practice');
  };
  
  const handleBackToHome = () => {
    navigate('/');
  };

  return {
    questions,
    currentQuestion,
    selectedAnswers,
    isLoading,
    error,
    showResults,
    testResult,
    isIncompatibleJob,
    initialSeconds,
    remainingSeconds,
    handleOptionSelect,
    setCurrentQuestion,
    evaluateTest,
    handleRetry,
    handleRestartTest,
    handleTakeAnotherTest,
    handleBackToStart,
    handleBackToHome,
  };
};
