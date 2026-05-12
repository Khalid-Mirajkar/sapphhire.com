import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useDIDAvatar } from '@/hooks/useDIDAvatar';
import { useDIAVoice } from '@/hooks/useDIAVoice';
import { useUserCamera } from '@/hooks/useUserCamera';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import DIDAvatar from '@/components/DIDAvatar';
import UserVideoFeed from '@/components/UserVideoFeed';
import InterviewControls from '@/components/InterviewControls';
import { Mic, MicOff, Camera, CameraOff, Users, Clock } from 'lucide-react';

interface InterviewQuestion {
  id: number;
  question: string;
  category: string;
}

interface InterviewResponse {
  questionId: number;
  question: string;
  answer: string;
  score: number;
  evaluation: string;
  timeSpent: number;
}

interface AIInterviewSessionProps {
  companyName: string;
  jobTitle: string;
  onInterviewComplete: (responses: InterviewResponse[], totalTime: number) => void;
}

const AIInterviewSession: React.FC<AIInterviewSessionProps> = ({
  companyName,
  jobTitle,
  onInterviewComplete
}) => {
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<InterviewResponse[]>([]);
  const [interviewStartTime, setInterviewStartTime] = useState<number>(0);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [isWaitingForAnswer, setIsWaitingForAnswer] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [conversationState, setConversationState] = useState<'greeting' | 'question' | 'waiting' | 'transitioning' | 'acknowledging'>('greeting');
  const [inactivityTimer, setInactivityTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [speechEndTimer, setSpeechEndTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [isGreetingPhase, setIsGreetingPhase] = useState(true);
  const [lastTranscriptProcessed, setLastTranscriptProcessed] = useState('');
  const [isProcessingResponse, setIsProcessingResponse] = useState(false);
  const [speechListenerActive, setSpeechListenerActive] = useState(false);

  const { isGenerating: isDIDGenerating, currentVideoUrl, speakText: didSpeakText, isPlaying: isDIDPlaying } = useDIDAvatar();
  const { isGenerating: isDIAGenerating, isPlaying: isDIAPlaying, currentSubtitle: diaSubtitle, speakText: diaSpeakText } = useDIAVoice();
  const { 
    videoRef, 
    isVideoEnabled, 
    isAudioEnabled, 
    toggleVideo, 
    toggleAudio, 
    initializeCamera,
    stopCamera,
    hasPermissionError
  } = useUserCamera();
  const { 
    isListening, 
    transcript, 
    startListening, 
    stopListening, 
    resetTranscript,
    forceRestart
  } = useSpeechRecognition();

  const questions: InterviewQuestion[] = [
    {
      id: 1,
      question: `Tell me about yourself and why you're interested in the ${jobTitle} position at ${companyName}.`,
      category: 'Introduction'
    },
    {
      id: 2,
      question: "Describe a challenging project you've worked on and how you overcame the obstacles.",
      category: 'Problem Solving'
    },
    {
      id: 3,
      question: "How do you handle working under pressure and tight deadlines?",
      category: 'Work Style'
    },
    {
      id: 4,
      question: "What are your greatest strengths and how do they relate to this role?",
      category: 'Self Assessment'
    },
    {
      id: 5,
      question: `Where do you see yourself in 5 years, and how does this role at ${companyName} fit into your career goals?`,
      category: 'Career Goals'
    }
  ];

  // Clear all timers
  const clearAllTimers = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      setInactivityTimer(null);
    }
    if (speechEndTimer) {
      clearTimeout(speechEndTimer);
      setSpeechEndTimer(null);
    }
  };

  // Clean state for next question with enhanced logging
  const cleanStateForNextQuestion = () => {
    console.log('🧹 Cleaning state for next question...');
    clearAllTimers();
    stopListening();
    resetTranscript();
    setLastTranscriptProcessed('');
    setIsWaitingForAnswer(false);
    setIsProcessingResponse(false);
    setCurrentSubtitle('');
    setSpeechListenerActive(false);
    
    console.log('✅ State cleaned, ready for next question');
  };

  // Enhanced speech listener activation with force restart
  const activateSpeechListener = () => {
    console.log('🎤 Activating speech listener...');
    cleanStateForNextQuestion();
    
    setTimeout(() => {
      console.log('🔄 Starting fresh speech recognition with force restart...');
      resetTranscript();
      setLastTranscriptProcessed('');
      setIsWaitingForAnswer(true);
      setSpeechListenerActive(true);
      
      // Force restart to ensure clean state
      forceRestart();
      setInactivityTimeout();
    }, 800); // Increased delay to ensure clean state
  };

  // Set inactivity timer
  const setInactivityTimeout = () => {
    clearAllTimers();
    const timer = setTimeout(() => {
      if (isWaitingForAnswer && conversationState === 'waiting' && !isProcessingResponse) {
        handleInactivity();
      }
    }, 10000);
    setInactivityTimer(timer);
  };

  const handleInactivity = async () => {
    console.log('⏰ Handling inactivity...');
    const promptText = "Still there? Feel free to answer when you're ready.";
    setCurrentSubtitle(promptText);
    await diaSpeakText(promptText);
    
    // Restart listening after prompt with fresh state
    setTimeout(() => {
      if (isWaitingForAnswer && conversationState === 'waiting' && !isProcessingResponse) {
        console.log('🔄 Restarting listening after inactivity prompt...');
        resetTranscript();
        setLastTranscriptProcessed('');
        forceRestart();
        setSpeechListenerActive(true);
        setInactivityTimeout();
      }
    }, 3000);
  };

  const startInterview = async () => {
    console.log('🎬 Starting interview...');
    setInterviewStarted(true);
    setInterviewStartTime(Date.now());
    setConversationState('greeting');
    setIsGreetingPhase(true);
    
    // Initial greeting with DIA voice
    const greetingText = `Hi! I'm your AI Interviewer for the role of ${jobTitle} at ${companyName}. It's great to meet you. Before we begin, how are you feeling today?`;
    setCurrentSubtitle(greetingText);
    await diaSpeakText(greetingText);
    
    // Start listening for response after greeting
    setTimeout(() => {
      console.log('👂 Starting to listen for greeting response...');
      setConversationState('waiting');
      activateSpeechListener();
    }, 2000);
  };

  const handleGreetingResponse = async (userResponse: string) => {
    console.log('📝 Processing greeting response:', userResponse);
    
    if (isProcessingResponse || userResponse === lastTranscriptProcessed) {
      console.log('⚠️ Already processing this response, ignoring...');
      return;
    }
    
    setIsProcessingResponse(true);
    setLastTranscriptProcessed(userResponse);
    cleanStateForNextQuestion();
    setConversationState('acknowledging');
    
    // Acknowledge response and move to first question
    const acknowledgments = [
      "Thank you for sharing.",
      "Glad to hear that.",
      "Thanks, let's begin!"
    ];
    const acknowledgment = acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
    
    setCurrentSubtitle(acknowledgment);
    await diaSpeakText(acknowledgment);
    
    setIsGreetingPhase(false);
    setIsProcessingResponse(false);
    
    setTimeout(() => {
      askCurrentQuestion();
    }, 2000);
  };

  const askCurrentQuestion = async () => {
    if (currentQuestionIndex < questions.length) {
      const question = questions[currentQuestionIndex];
      console.log(`❓ Asking question ${currentQuestionIndex + 1}:`, question.question);
      
      cleanStateForNextQuestion();
      setQuestionStartTime(Date.now());
      setConversationState('question');
      
      setCurrentSubtitle(question.question);
      await diaSpeakText(question.question);
      
      // Start listening after question finishes with enhanced activation
      setTimeout(() => {
        console.log(`👂 Ready to listen for answer to question ${currentQuestionIndex + 1}...`);
        setConversationState('waiting');
        activateSpeechListener();
      }, 2000);
    }
  };

  const submitAnswer = async (userAnswer: string) => {
    console.log(`✅ Submitting answer for question ${currentQuestionIndex + 1}:`, userAnswer);
    
    if (isProcessingResponse || userAnswer === lastTranscriptProcessed) {
      console.log('⚠️ Already processing this response, ignoring...');
      return;
    }
    
    setIsProcessingResponse(true);
    setLastTranscriptProcessed(userAnswer);
    cleanStateForNextQuestion();
    setConversationState('acknowledging');
    
    const question = questions[currentQuestionIndex];
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    
    // Evaluate the response
    const evaluation = await evaluateResponse(question.question, userAnswer);
    
    const response: InterviewResponse = {
      questionId: question.id,
      question: question.question,
      answer: userAnswer,
      score: evaluation.score,
      evaluation: evaluation.feedback,
      timeSpent
    };

    setResponses(prev => [...prev, response]);
    
    // Acknowledge the answer
    const acknowledgments = [
      "Thank you for that detailed response.",
      "I appreciate your thoughtful answer.",
      "That's a great perspective, thank you."
    ];
    const acknowledgment = acknowledgments[Math.floor(Math.random() * acknowledgments.length)];
    setCurrentSubtitle(acknowledgment);
    await diaSpeakText(acknowledgment);
    
    setIsProcessingResponse(false);
    
    // Move to next question or end interview
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimeout(() => {
        askCurrentQuestion();
      }, 2000);
    } else {
      setTimeout(() => {
        endInterview();
      }, 2000);
    }
  };

  const evaluateResponse = async (question: string, answer: string): Promise<{ score: number; feedback: string }> => {
    const wordCount = answer.split(' ').length;
    const score = Math.min(10, Math.max(1, Math.round(wordCount / 10)));
    const feedback = wordCount > 20 ? "Good detailed response!" : "Consider providing more specific examples.";
    
    return { score, feedback };
  };

  const endInterview = async () => {
    console.log('🏁 Ending interview...');
    cleanStateForNextQuestion();
    const endingText = "Thank you for your time today. Your interview responses are being evaluated. Best of luck with your application!";
    setCurrentSubtitle(endingText);
    await diaSpeakText(endingText);
    
    const totalTime = Math.round((Date.now() - interviewStartTime) / 1000);
    setTimeout(() => {
      stopCamera();
      onInterviewComplete(responses, totalTime);
    }, 4000);
  };

  const handleEndCall = () => {
    cleanStateForNextQuestion();
    stopCamera();
    window.history.back();
  };

  const handleVideoEnd = () => {
    console.log('🎥 Video ended, clearing subtitle');
    if (conversationState === 'waiting') {
      setCurrentSubtitle('');
    }
  };

  // Enhanced speech detection with better state management
  useEffect(() => {
    if (transcript && transcript.trim().length > 0 && !isProcessingResponse && speechListenerActive) {
      console.log('📝 New transcript detected:', transcript);
      console.log('🔍 Last processed:', lastTranscriptProcessed);
      
      // Only process if this is a new transcript
      if (transcript !== lastTranscriptProcessed) {
        // Clear any existing speech end timer
        if (speechEndTimer) {
          clearTimeout(speechEndTimer);
          setSpeechEndTimer(null);
        }
        
        // Set new timer to detect end of speech
        const timer = setTimeout(() => {
          console.log('⏹️ Speech end detected, processing response...');
          
          if (conversationState === 'waiting' && transcript.trim() && !isProcessingResponse && speechListenerActive) {
            setSpeechListenerActive(false); // Prevent multiple processing
            
            if (isGreetingPhase) {
              handleGreetingResponse(transcript);
            } else {
              submitAnswer(transcript);
            }
          }
        }, 1500);
        
        setSpeechEndTimer(timer);
        
        // Clear inactivity timer since user is speaking
        if (inactivityTimer) {
          clearTimeout(inactivityTimer);
          setInactivityTimer(null);
        }
      }
    }
  }, [transcript, conversationState, isGreetingPhase, lastTranscriptProcessed, isProcessingResponse, speechListenerActive]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      clearAllTimers();
    };
  }, []);

  // Pre-interview setup screen
  if (!interviewStarted) {
    return (
      <div className="min-h-screen bg-[#0D0D0D] text-white">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-semibold">AI Interview</h1>
            <span className="text-gray-400">•</span>
            <span className="text-gray-400">{companyName} - {jobTitle}</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Users className="h-4 w-4" />
              <span>2 participants</span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-4xl w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* AI Interviewer Preview */}
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-center">AI Interviewer</h2>
                <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
                  <DIDAvatar
                    videoUrl={currentVideoUrl}
                    isGenerating={isDIDGenerating || isDIAGenerating}
                    isPlaying={isDIDPlaying || isDIAPlaying}
                    onVideoEnd={handleVideoEnd}
                    fallbackImageUrl="https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg"
                  />
                  
                  <div className="absolute bottom-3 left-3">
                    <div className="bg-black/60 px-2 py-1 rounded text-xs">
                      AI Interviewer
                    </div>
                  </div>
                </div>
              </div>

              {/* User Preview */}
              <div className="space-y-4">
                <h2 className="text-lg font-medium text-center">You</h2>
                <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-video">
                  <UserVideoFeed
                    videoRef={videoRef}
                    isVideoEnabled={isVideoEnabled}
                    onInitialize={initializeCamera}
                    hasPermissionError={hasPermissionError}
                    showPreviewLabel={true}
                  />
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="mt-8 flex flex-col items-center space-y-6">
              <div className="flex items-center space-x-6">
                <Button
                  onClick={toggleAudio}
                  variant="ghost"
                  size="icon"
                  className={`rounded-full w-14 h-14 transition-all duration-200 ${
                    isAudioEnabled 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                </Button>

                <Button
                  onClick={toggleVideo}
                  variant="ghost"
                  size="icon"
                  className={`rounded-full w-14 h-14 transition-all duration-200 ${
                    isVideoEnabled 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {isVideoEnabled ? <Camera className="h-6 w-6" /> : <CameraOff className="h-6 w-6" />}
                </Button>
              </div>

              <div className="text-center space-y-2">
                <p className="text-gray-400 text-sm">
                  Make sure your camera and microphone are working properly
                </p>
                <Button 
                  onClick={startInterview}
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:scale-105 font-semibold px-12 py-4 text-lg rounded-xl transition-all duration-300 border border-white/20"
                >
                  Start Interview
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white relative overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 z-20">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-3">
            <h1 className="text-white font-semibold">AI Interview</h1>
            <span className="text-gray-400">•</span>
            <span className="text-gray-400 text-sm">{companyName} - {jobTitle}</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Clock className="h-4 w-4" />
              <span>
                {isGreetingPhase ? 'Greeting' : `Question ${currentQuestionIndex + 1} of ${questions.length}`}
              </span>
            </div>
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-medium">
              REC
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Debug Status Panel */}
      <div className="absolute bottom-24 left-4 z-30">
        <div className="bg-black/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-gray-300 min-w-80">
          <div className="flex flex-col space-y-1">
            <div>
              {conversationState === 'greeting' && '🟢 AI Speaking (Greeting)...'}
              {conversationState === 'question' && `🟢 AI Asking Question ${currentQuestionIndex + 1}...`}
              {conversationState === 'waiting' && `🟡 Listening for Q${currentQuestionIndex + 1} response...`}
              {conversationState === 'acknowledging' && '🔵 AI Acknowledging...'}
              {conversationState === 'transitioning' && '🔄 Moving to next question...'}
            </div>
            <div className="text-gray-400 text-xs">
              🎤 Speech Active: {speechListenerActive ? '✅ YES' : '❌ NO'}
            </div>
            <div className="text-gray-400 text-xs">
              🎙️ Is Listening: {isListening ? '✅ YES' : '❌ NO'}
            </div>
            {transcript && (
              <div className="text-blue-400 text-xs max-w-64 truncate">
                Current: "{transcript}"
              </div>
            )}
            {lastTranscriptProcessed && (
              <div className="text-gray-500 text-xs max-w-64 truncate">
                Last: "{lastTranscriptProcessed}"
              </div>
            )}
            {isProcessingResponse && (
              <div className="text-yellow-400 text-xs">
                🔄 Processing response...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Video Grid */}
      <div className="absolute inset-0 pt-16 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-2 p-2">
        {/* AI Interviewer */}
        <div className="relative bg-gray-900 rounded-lg overflow-hidden">
          <DIDAvatar
            videoUrl={currentVideoUrl}
            isGenerating={isDIDGenerating || isDIAGenerating}
            isPlaying={isDIDPlaying || isDIAPlaying}
            onVideoEnd={handleVideoEnd}
            fallbackImageUrl="https://d-id-public-bucket.s3.us-west-2.amazonaws.com/alice.jpg"
          />
          
          <div className="absolute bottom-3 left-3">
            <div className="bg-black/60 px-2 py-1 rounded text-xs">
              AI Interviewer
            </div>
          </div>

          {/* Subtitles */}
          {showSubtitles && (currentSubtitle || diaSubtitle) && (
            <div className="absolute bottom-16 left-4 right-4">
              <div className="bg-black/80 backdrop-blur-sm rounded-lg px-4 py-2">
                <p className="text-white text-sm text-center leading-relaxed">
                  {diaSubtitle || currentSubtitle}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* User Video */}
        <div className="relative">
          <UserVideoFeed
            videoRef={videoRef}
            isVideoEnabled={isVideoEnabled}
            onInitialize={initializeCamera}
            subtitle={transcript}
            isListening={speechListenerActive && isListening}
            hasPermissionError={hasPermissionError}
          />
        </div>
      </div>

      {/* Current Question Overlay */}
      {currentQuestion && conversationState === 'question' && !isGreetingPhase && (
        <div className="absolute top-20 left-4 right-4 z-10">
          <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-blue-400 font-medium">{currentQuestion.category}</span>
                {isWaitingForAnswer && speechListenerActive && (
                  <span className="text-xs text-green-400 animate-pulse">Listening...</span>
                )}
              </div>
              <p className="text-white text-sm">{currentQuestion.question}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Conversation Status */}
      {conversationState === 'waiting' && (
        <div className="absolute bottom-32 left-4 right-4 z-10">
          <div className="bg-blue-600/20 backdrop-blur-sm border border-blue-500/30 rounded-lg px-4 py-2">
            <p className="text-blue-300 text-sm text-center">
              {isGreetingPhase ? "Please share how you're feeling today..." : "Please share your response..."}
              {speechListenerActive && isListening && (
                <span className="ml-2 text-green-400 animate-pulse">🎤 Listening...</span>
              )}
            </p>
          </div>
        </div>
      )}

      {/* Bottom Controls */}
      <InterviewControls
        isVideoEnabled={isVideoEnabled}
        isAudioEnabled={isAudioEnabled}
        onToggleVideo={toggleVideo}
        onToggleAudio={toggleAudio}
        onEndCall={handleEndCall}
      />
    </div>
  );
};

export default AIInterviewSession;
