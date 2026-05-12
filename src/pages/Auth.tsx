import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";
import { useSEO } from "@/hooks/useSEO";

export default function Auth() {
  useSEO({
    title: "Sign in or create account · Sapphhire",
    description: "Sign in to Sapphhire to access AI-powered interview practice and track your progress.",
  });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newsletter, setNewsletter] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Handle newsletter subscription for login
        if (newsletter) {
          const { data: { user } } = await supabase.auth.getUser();
          await supabase.from('newsletter_subscribers').insert({
            email,
            user_id: user?.id,
            source: 'signin'
          }); // Ignore errors (e.g., duplicate subscription)
        }
        
        navigate("/dashboard");
      } else {
        // Validate passwords match
        if (password !== confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }

        const redirectUrl = `${window.location.origin}/`;
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: redirectUrl,
            data: {
              name: name
            }
          }
        });
        
        if (error) throw error;
        
        // Create profile with name
        if (data.user) {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            name: name
          });
          
          // Handle newsletter subscription
          if (newsletter) {
            await supabase.from('newsletter_subscribers').insert({
              email,
              user_id: data.user.id,
              source: 'signup'
            }); // Ignore errors (e.g., duplicate subscription)
          }
        }
        
        toast({
          title: "Success!",
          description: "Account created successfully. Redirecting to dashboard...",
        });
        
        // Redirect to dashboard after successful signup
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      }
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password Reset Email Sent",
        description: "Check your email for the password reset link",
      });
      setShowForgotPassword(false);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReturnHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 space-y-6 backdrop-blur-md bg-black/30 rounded-xl border border-white/10">
        <h2 className="text-3xl font-bold text-center">
          {isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="bg-black/50 border-white/20"
                placeholder="Enter your full name"
              />
            </div>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-black/50 border-white/20"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-black/50 border-white/20"
            />
          </div>
          {!isLogin && (
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-black/50 border-white/20"
              />
            </div>
          )}
          
          {/* Newsletter Checkbox */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id="newsletter"
              checked={newsletter}
              onCheckedChange={(checked) => setNewsletter(checked as boolean)}
              className="mt-1"
            />
            <label
              htmlFor="newsletter"
              className="text-sm text-gray-300 leading-tight cursor-pointer"
            >
              Yes! Send me insider tips & success stories
            </label>
          </div>
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Loading..." : isLogin ? "Sign In" : "Create Account"}
          </Button>
          {isLogin && (
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-purple-400 hover:text-purple-300 transition-colors w-full text-center mt-2"
            >
              Forgot Password?
            </button>
          )}
        </form>
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-gray-400 hover:text-white transition-colors w-full text-center"
        >
          {isLogin
            ? "Don't have an account? Sign Up"
            : "Already have an account? Sign In"}
        </button>
        
        {/* Return to Home Link */}
        <div className="pt-4 border-t border-white/10">
          <button
            onClick={handleReturnHome}
            className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-white transition-colors w-full text-center group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Return to Home
          </button>
        </div>
      </div>

      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="bg-[#0D0D0D] text-white border border-white/10">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription className="text-gray-400">
              Enter your email address and we'll send you a password reset link.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-black/50 border-white/20"
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}