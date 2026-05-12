
import { useEffect, useState, useRef } from "react";
import { Target, Settings, TrendingUp, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import FeatureCard from "@/components/FeatureCard";
import TestimonialCarousel from "@/components/TestimonialCarousel";
import ProcessSection from "@/components/ProcessSection";
import { Button } from "@/components/ui/button";
import GlowingButton from "@/components/GlowingButton";
import PageTransition from "@/components/PageTransition";
import AnimatedHeadingSequence from "@/components/AnimatedHeadingSequence";
import { useSEO } from "@/hooks/useSEO";

const Index = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useSEO({
    title: "Sapphhire · AI-powered interview practice",
    description: "Practise role-specific interview questions with AI feedback, analytics, and realistic simulations tailored to your dream job.",
  });
  
  // References for scroll animations
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  
  // Scroll progress for animations
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleStartPractice = () => {
    navigate('/start-practice');
  };

  const features = [
    {
      icon: Target,
      title: "Role-Specific Questions",
      description: "Know Exactly What You'll Be Asked"
    },
    {
      icon: Settings,
      title: "Smart Feedback",
      description: "Instant Feedback That Makes You Better, Faster"
    },
    {
      icon: TrendingUp,
      title: "Progress Tracking",
      description: "See how you improve over time across roles and industries."
    },
    {
      icon: Briefcase,
      title: "Realistic Simulations",
      description: "Practice in real-world scenarios built for your dream job."
    }
  ];

  return (
    <PageTransition>
      <div className="relative min-h-screen overflow-x-hidden bg-[#0D0D0D]">
        {/* Header with animation */}
        <motion.header 
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
            isScrolled ? 'backdrop-blur-md bg-black/70 shadow-md' : 'bg-transparent'
          }`}
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <motion.div 
                className="inline-flex items-baseline font-sans select-none"
                style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                {/* Sapph - Metallic Silver with slide-in animation */}
                <motion.span 
                  className="text-2xl font-normal"
                  style={{
                    background: 'linear-gradient(135deg, #E5E7EB 0%, #F9FAFB 25%, #D1D5DB 50%, #F3F4F6 75%, #9CA3AF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-0.015em'
                  }}
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                >
                  Sapph
                </motion.span>
                
                {/* HIRE - Sapphire Blue Gradient with electric glow */}
                <motion.span 
                  className="text-2xl font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 50%, #60A5FA 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    letterSpacing: '-0.015em',
                    textShadow: '0 0 20px rgba(59, 130, 246, 0.3)',
                    filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.4))'
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  whileHover={{ 
                    textShadow: '0 0 30px rgba(59, 130, 246, 0.6)',
                    filter: 'drop-shadow(0 0 12px rgba(59, 130, 246, 0.6))'
                  }}
                >
                  HIRE
                </motion.span>
              </motion.div>
              <motion.nav
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <ul className="flex space-x-6">
                  <motion.li whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                    <a href="#" className="text-gray-400 text-sm hover:text-white transition-colors">
                      About
                    </a>
                  </motion.li>
                  <motion.li whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                    <button 
                      onClick={() => navigate('/dashboard')}
                      className="text-gray-400 text-sm hover:text-white transition-colors"
                    >
                      Dashboard
                    </button>
                  </motion.li>
                  {user ? (
                    <>
                      <motion.li whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                        <button
                          onClick={handleLogout}
                          className="text-gray-400 text-sm hover:text-white transition-colors"
                        >
                          Logout
                        </button>
                      </motion.li>
                    </>
                  ) : (
                    <motion.li whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 10 }}>
                      <button
                        onClick={() => navigate('/auth')}
                        className="text-gray-400 text-sm hover:text-white transition-colors"
                      >
                        Sign In / Sign Up
                      </button>
                    </motion.li>
                  )}
                </ul>
              </motion.nav>
            </div>
          </div>
        </motion.header>
        
        {/* Hero Section with animation */}
        <motion.section 
          ref={heroRef}
          className="min-h-screen pt-24 pb-12 flex flex-col justify-center relative"
          style={{ opacity: heroOpacity, y: heroY }}
        >
          <div className="container mx-auto px-6 text-center">
            <motion.h1 
              className="text-5xl md:text-7xl font-bold mb-6 animate-text-reveal text-gradient"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              AI INTERVIEW SIMULATOR
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl mb-4 text-gray-300 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              Land Your Dream Job — Practice Interviews with an AI That Knows Exactly What Recruiters Want
            </motion.p>
            <motion.div 
              className="relative inline-block"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <GlowingButton 
                onClick={handleStartPractice} 
                variant="primary"
                className="mb-4"
              >
                Start Free Practice
              </GlowingButton>
            </motion.div>
            <motion.p 
              className="text-gray-400 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.2 }}
            >
              Already helping 1,200+ students ace their dream interviews
            </motion.p>
          </div>
        </motion.section>
        
        {/* Features Section with animation */}
        <motion.section 
          ref={featuresRef}
          className="py-20 relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="container mx-auto px-6">
            <motion.div 
              className="text-center max-w-3xl mx-auto mb-16"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
                Advanced Interview Prep — <span className="text-gradient">Powered by AI</span>
              </h2>
              
              <AnimatedHeadingSequence />
              
              <p className="text-xl text-gray-400 mt-6">
                Train with AI that understands your dream job better than you do — so you walk into interviews with bulletproof confidence.
              </p>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true, amount: 0.2 }}
                  whileHover={{ y: -10, transition: { duration: 0.2 } }}
                  className="h-full"
                >
                  <FeatureCard {...feature} />
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
        
        {/* Process Section (already has its own animations) */}
        <ProcessSection />
        
        {/* Testimonials with animations */}
        <motion.section 
          ref={testimonialsRef}
          id="testimonials" 
          className="py-20 relative"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="container mx-auto px-6">
            <motion.div 
              className="text-center max-w-3xl mx-auto mb-12"
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <h2 className="text-4xl font-bold mb-6 text-white">
                What People Are <span className="text-gradient">Saying</span>
              </h2>
              <p className="text-xl text-gray-300">
                Don't just take our word for it. Here's what our users have achieved with the AI Interview Simulator.
              </p>
            </motion.div>
            <TestimonialCarousel />
          </div>
        </motion.section>
        
        {/* CTA Section with animations */}
        <motion.section 
          ref={ctaRef}
          className="py-20 relative glass-card my-20 mx-6 rounded-2xl"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="container mx-auto px-6 text-center">
            <motion.h2 
              className="text-4xl font-bold mb-8 text-white"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true, amount: 0.5 }}
            >
              Get Started Today
            </motion.h2>
            <motion.p 
              className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto"
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true, amount: 0.5 }}
            >
              Join thousands of successful candidates who improved their interview performance with AI.
            </motion.p>
            <motion.div 
              className="relative inline-block"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true, amount: 0.5 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <GlowingButton 
                onClick={handleStartPractice}
                variant="primary"
              >
                Start Free Practice
              </GlowingButton>
            </motion.div>
          </div>
        </motion.section>
        
        {/* Footer with animations */}
        <motion.footer 
          className="py-12 relative border-t border-white/10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <motion.div 
                className="mb-6 md:mb-0"
                initial={{ x: -20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div 
                  className="inline-flex items-baseline font-sans select-none"
                  style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                >
                  {/* Sapph - Metallic Silver */}
                  <span 
                    className="text-xl font-normal"
                    style={{
                      background: 'linear-gradient(135deg, #E5E7EB 0%, #F9FAFB 25%, #D1D5DB 50%, #F3F4F6 75%, #9CA3AF 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      letterSpacing: '-0.015em'
                    }}
                  >
                    Sapph
                  </span>
                  
                  {/* HIRE - Sapphire Blue Gradient */}
                  <span 
                    className="text-xl font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 50%, #60A5FA 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      letterSpacing: '-0.015em'
                    }}
                  >
                    HIRE
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-2">Elevate your interview skills</p>
              </motion.div>
              <motion.div 
                className="flex gap-8"
                initial={{ x: 20, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                <motion.a 
                  href="#" 
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  About
                </motion.a>
                <motion.a 
                  href="#" 
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  Contact
                </motion.a>
                <motion.a 
                  href="#" 
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  Privacy
                </motion.a>
                <motion.a 
                  href="#" 
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                  whileHover={{ y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  Terms
                </motion.a>
              </motion.div>
            </div>
          </div>
        </motion.footer>
      </div>
    </PageTransition>
  );
};

export default Index;
