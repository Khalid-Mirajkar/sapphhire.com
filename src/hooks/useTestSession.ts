import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

export interface TestSessionData {
  companyName: string;
  jobTitle: string;
  companyLogo?: string;
  numberOfQuestions?: string;
  difficulty?: string;
  testType?: string;
}

const STORAGE_KEY = "testData";

/**
 * Centralised access to the active practice/test session.
 * Falls back to localStorage if React Router state is missing
 * (e.g. after a page refresh).
 */
export const useTestSession = (options?: { redirectIfMissing?: boolean }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const redirectIfMissing = options?.redirectIfMissing ?? true;

  const [data, setData] = useState<TestSessionData | null>(() => {
    const fromState = location.state as TestSessionData | null;
    if (fromState?.companyName && fromState?.jobTitle) return fromState;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as TestSessionData;
        if (parsed?.companyName && parsed?.jobTitle) return parsed;
      }
    } catch {
      /* ignore */
    }
    return null;
  });

  useEffect(() => {
    if (data) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch {
        /* ignore */
      }
      return;
    }
    if (redirectIfMissing) {
      toast({
        title: "Session expired",
        description: "Please start a new practice session.",
        variant: "destructive",
      });
      navigate("/start-practice", { replace: true });
    }
  }, [data, redirectIfMissing, navigate, toast]);

  const clearSession = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setData(null);
  };

  return { data, clearSession };
};
