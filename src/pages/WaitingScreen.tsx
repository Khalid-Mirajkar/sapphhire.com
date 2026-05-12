import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import PageTransition from "@/components/PageTransition";
import { Progress } from "@/components/ui/progress";
import { Clock } from "lucide-react";
import { useTestSession } from "@/hooks/useTestSession";
import { useSEO } from "@/hooks/useSEO";

interface Insight {
  id: string;
  category: string;
  headline: string;
  summary: string;
  image_url: string | null;
  source_link: string | null;
}

const HEADER_MESSAGES = [
  "We're analyzing the latest industry trends to craft your personalized questions.",
  "Your AI interview is being generated — powered by real-world insights and data.",
  "We're curating intelligent questions from today's top tech stories just for you.",
  "Our system is thinking like a recruiter — preparing challenges that truly test your edge.",
  "Gathering the smartest questions from recent innovations… this might take a few seconds.",
  "Your interview is syncing with live trends — because knowledge should never stand still.",
  "AI is at work — translating the latest news into real interview questions.",
  "Preparing questions that match the world's newest ideas. Sit tight, brilliance takes a moment.",
  "We're transforming global insights into your next learning moment.",
  "Your smart interview is loading — fueled by what's shaping the future right now."
];

const MOTIVATIONAL_QUOTES = [
  { text: "The more you learn, the more you earn.", author: "Warren Buffett" },
  { text: "Success is where preparation and opportunity meet.", author: "Bobby Unser" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Great things never come from comfort zones.", author: "" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Push yourself, because no one else is going to do it for you.", author: "" },
  { text: "Dream big. Start small. Act now.", author: "Robin Sharma" },
  { text: "Knowledge is power. Execution trumps everything.", author: "" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "" },
  { text: "Discipline equals freedom.", author: "Jocko Willink" },
  { text: "Your future is created by what you do today, not tomorrow.", author: "" },
  { text: "Every expert was once a beginner.", author: "" },
  { text: "Don't limit your challenges. Challenge your limits.", author: "" },
  { text: "Failure is simply the opportunity to begin again, this time more intelligently.", author: "Henry Ford" },
  { text: "What we know is a drop, what we don't know is an ocean.", author: "Isaac Newton" },
  { text: "It's not about being the best, it's about being better than yesterday.", author: "" },
  { text: "If you want to achieve greatness, stop asking for permission.", author: "" },
  { text: "Strive for progress, not perfection.", author: "" },
  { text: "Work hard in silence, let success make the noise.", author: "" },
  { text: "Learning never exhausts the mind.", author: "Leonardo da Vinci" }
];

const STATUS_MESSAGES: Record<number, string> = {
  25: "Fetching top stories…",
  50: "Analyzing and filtering quality…",
  75: "Tailoring questions to your level…"
};

const WaitingScreen = () => {
  const navigate = useNavigate();
  const { data: session } = useTestSession();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(20);
  const [statusMessage, setStatusMessage] = useState("Initializing…");
  const [showAlmostReady, setShowAlmostReady] = useState(false);
  const [headerMessage] = useState(() => 
    HEADER_MESSAGES[Math.floor(Math.random() * HEADER_MESSAGES.length)]
  );
  const [quote] = useState(() => 
    MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)]
  );

  useSEO({
    title: "Preparing your interview · Sapphhire",
    description: "Crafting personalised questions powered by real-world insights.",
  });

  // Fetch insights from Supabase
  useEffect(() => {
    const fetchInsights = async () => {
      const { data, error } = await supabase
        .from("insights")
        .select("*")
        .limit(10);

      if (data && !error) {
        // Shuffle and take 3 random insights
        const shuffled = data.sort(() => Math.random() - 0.5).slice(0, 3);
        setInsights(shuffled);
      }
    };

    fetchInsights();
  }, []);

  // Navigate to test after delay
  useEffect(() => {
    if (!session) return;
    const navigateTimer = setTimeout(() => {
      const target = session.testType === "AI Video Interview"
        ? "/ai-video-interview"
        : "/mcq-test";
      navigate(target, { state: session });
    }, 20000);
    return () => clearTimeout(navigateTimer);
  }, [navigate, session]);

  // Timer countdown with "Almost Ready" state
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = Math.min(prev + 5, 100); // 100/20 = 5% per second

        // Update status messages
        if (STATUS_MESSAGES[Math.round(newProgress)]) {
          setStatusMessage(STATUS_MESSAGES[Math.round(newProgress)]);
        }

        return newProgress;
      });

      setTimeRemaining((prev) => {
        const newTime = Math.max(0, prev - 1);
        if (newTime === 0) {
          setShowAlmostReady(true);
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Card carousel logic (slower)
  useEffect(() => {
    if (insights.length === 0) return;

    const carouselInterval = setInterval(() => {
      setCurrentCardIndex((prev) => (prev + 1) % insights.length);
    }, 8000);

    return () => clearInterval(carouselInterval);
  }, [insights.length]);

  const getCardStyle = (index: number) => {
    const diff = (index - currentCardIndex + insights.length) % insights.length;
    
    if (diff === 0) {
      return {
        zIndex: 30,
        scale: 1,
        opacity: 1,
        x: 0,
        filter: "blur(0px)"
      };
    } else if (diff === 1) {
      return {
        zIndex: 20,
        scale: 0.9,
        opacity: 0.6,
        x: 250,
        filter: "blur(3px)"
      };
    } else {
      return {
        zIndex: 10,
        scale: 0.85,
        opacity: 0.4,
        x: -250,
        filter: "blur(5px)"
      };
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#0D0D0D] flex flex-col relative overflow-hidden">
        {/* Ambient background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-purple-900/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />

        {/* Header Section */}
        <div className="relative z-10 pt-20 pb-8 px-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="text-2xl md:text-3xl font-medium text-white/90 leading-relaxed">
              {headerMessage}
            </h1>
          </motion.div>
        </div>

        {/* Progress Bar - Top Right */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="absolute top-24 right-8 w-64 z-20"
        >
          <div className="glass-card p-4 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-blue-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">~{timeRemaining}s</span>
              </div>
              <span className="text-xs text-gray-400">{Math.round(progress)}%</span>
            </div>
            <Progress 
              value={progress} 
              className="h-2 bg-white/10"
              indicatorClassName="bg-gradient-to-r from-blue-500 to-purple-500"
            />
            <motion.p
              key={statusMessage}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-gray-400 mt-3 text-center"
            >
              {showAlmostReady ? (
                <span className="text-purple-400 font-semibold animate-pulse">
                  Almost ready... ✨
                </span>
              ) : (
                statusMessage
              )}
            </motion.p>
          </div>
        </motion.div>

        {/* Main Insight Cards Section */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
          <div className="relative w-full max-w-2xl h-[500px]">
            <AnimatePresence mode="sync">
              {insights.map((insight, index) => {
                const style = getCardStyle(index);
                return (
                  <motion.div
                    key={insight.id}
                    className="absolute inset-0 w-full"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: style.opacity,
                      scale: style.scale,
                      x: style.x,
                      zIndex: style.zIndex,
                      filter: style.filter
                    }}
                    transition={{
                      duration: 0.7,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                  >
                    <div className="h-full glass-card rounded-3xl overflow-hidden backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl">
                      {/* Image Section - Top 60% */}
                      <div className="relative h-[60%] overflow-hidden">
                        {insight.image_url ? (
                          <img
                            src={insight.image_url}
                            alt={insight.headline}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center">
                            <span className="text-white/30 text-6xl font-bold">
                              {insight.category.charAt(0)}
                            </span>
                          </div>
                        )}
                        {/* Gradient overlay - lighter for main card */}
                        <div className={`absolute inset-0 bg-gradient-to-b ${
                          (index - currentCardIndex + insights.length) % insights.length === 0
                            ? 'from-transparent via-black/20 to-black/60'
                            : 'from-transparent via-black/40 to-black/80'
                        }`} />
                        
                        {/* Headline on image */}
                        <div className="absolute bottom-0 left-0 right-0 p-6">
                          <span className="inline-block px-3 py-1 bg-blue-500/30 backdrop-blur-sm rounded-full text-xs text-blue-200 mb-3">
                            {insight.category}
                          </span>
                          <h3 className="text-2xl font-bold text-white leading-tight">
                            {insight.headline}
                          </h3>
                        </div>
                      </div>

                      {/* Summary Section - Bottom 40% */}
                      <div className="h-[40%] p-6 flex flex-col justify-between">
                        <p className="text-gray-300 text-sm leading-relaxed line-clamp-6">
                          {insight.summary}
                        </p>
                        {insight.source_link && (
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                            <span className="text-xs text-gray-500">Source</span>
                            <span className="text-xs text-blue-400 font-medium truncate max-w-[200px]">
                              {new URL(insight.source_link).hostname}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Card indicators */}
            <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 flex gap-2">
              {insights.map((_, index) => (
                <motion.div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentCardIndex ? "bg-blue-500" : "bg-white/20"
                  }`}
                  animate={{
                    scale: index === currentCardIndex ? 1.2 : 1
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer Quote Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative z-10 pb-12 px-6"
        >
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block">
              {quote.text.split(" ").map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: 0.6 + index * 0.08,
                    ease: "easeOut"
                  }}
                  className="inline-block mr-[0.3em] text-xl md:text-2xl font-light text-white/80"
                >
                  {word}
                </motion.span>
              ))}
            </div>
            {quote.author && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1.5 }}
                className="text-sm text-blue-400 mt-4 font-medium"
              >
                — {quote.author}
              </motion.p>
            )}
          </div>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default WaitingScreen;
