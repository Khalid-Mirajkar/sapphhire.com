import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import DashboardSidebar from "@/components/DashboardSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Home, Menu, BarChart2, Clock, TrendingUp, TrendingDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import PageHeader from "@/components/PageHeader";
import { useSEO } from "@/hooks/useSEO";

const Dashboard = () => {
  useSEO({
    title: "Dashboard · Sapphhire",
    description: "Your interview practice dashboard with analytics, history, and quick actions.",
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { analytics, isLoading, error } = useAnalytics();

  // Get most recent interviews (last 5)
  const recentInterviews = analytics?.scoreByDate.slice(0, 5) || [];
  
  // Get top 3 companies by interview count
  const topCompanies = analytics?.scoreByCompany.slice(0, 3) || [];
  
  // Calculate improvement areas based on company performance
  const improvementAreas = topCompanies
    .filter(company => company.averageScore < 70)
    .map(company => ({
      company: company.company,
      score: company.averageScore,
      status: company.averageScore < 60 ? "critical" : "needs-improvement"
    }))
    .slice(0, 3);
    
  // Format time in minutes and seconds
  const formatTime = (seconds: number): string => {
    if (seconds === 0) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0D0D0D] text-white relative">
        {!isMobile ? (
          <DashboardSidebar />
        ) : (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="fixed top-4 left-4 z-20"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] p-0 border-r border-white/10 bg-black/80">
              <DashboardSidebar />
            </SheetContent>
          </Sheet>
        )}
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 right-4 z-20"
          onClick={() => navigate('/')}
          title="Back to Home"
        >
          <Home className="h-6 w-6" />
        </Button>
        
        <main className={isMobile ? "pt-16" : "pl-64"}>
          <div className="p-4 md:p-8">
            <PageHeader
              title="Welcome to your Dashboard"
              highlightedWord="Dashboard"
              description={`Select an option from the ${isMobile ? "menu" : "sidebar"} to get started.`}
            />
            
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-6 mb-6">
              {/* Quick Stats Card */}
              <Card className="bg-gradient-to-br from-purple-900/30 to-black/30 border border-purple-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg md:text-xl font-bold flex items-center">
                    <BarChart2 className="h-5 w-5 mr-2 text-purple-400" />
                    Quick Stats
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-sm">See your progress at a glance</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-4">
                      <div className="h-8 w-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"></div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Total Interviews</span>
                        <span className="font-semibold">{analytics?.totalInterviews || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Average Score</span>
                        <span className="font-semibold">{analytics?.averageScore ? `${Math.round(analytics.averageScore)}%` : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Average Time</span>
                        <span className="font-semibold flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-blue-400" />
                          {analytics?.averageTimeSeconds ? formatTime(analytics.averageTimeSeconds) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300">Best Score</span>
                        <span className="font-semibold">{analytics?.bestScore ? `${Math.round(analytics.bestScore)}%` : 'N/A'}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2 border-purple-500/50 hover:bg-purple-900/20"
                        onClick={() => navigate('/dashboard/analytics')}
                      >
                        View Full Analytics
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Recent Activity Card */}
              <Card className="bg-gradient-to-br from-blue-900/30 to-black/30 border border-blue-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg md:text-xl font-bold flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-blue-400" />
                    Recent Activity
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-sm">Your latest interview practice sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-4">
                      <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
                    </div>
                  ) : recentInterviews.length > 0 ? (
                    <div className="space-y-3">
                      {recentInterviews.map((interview, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-gray-300 text-sm">{interview.date}</span>
                          <div className="flex items-center">
                            <span className="font-semibold mr-2">{Math.round(interview.score)}%</span>
                            {interview.score >= 70 ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </div>
                      ))}
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full mt-2 border-blue-500/50 hover:bg-blue-900/20"
                        onClick={() => navigate('/dashboard/history')}
                      >
                        View All History
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-400">
                      <p>No recent interviews found</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3 border-blue-500/50 hover:bg-blue-900/20"
                        onClick={() => navigate('/start-practice')}
                      >
                        Start Practice
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Improvement Areas Card */}
              <Card className="bg-gradient-to-br from-green-900/30 to-black/30 border border-green-500/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg md:text-xl font-bold flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                    Improvement Areas
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-sm">Focus on these topics to improve</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex justify-center py-4">
                      <div className="h-8 w-8 rounded-full border-2 border-green-500 border-t-transparent animate-spin"></div>
                    </div>
                  ) : improvementAreas.length > 0 ? (
                    <div className="space-y-3">
                      {improvementAreas.map((area, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-gray-300">{area.company}</span>
                          <div className={`px-2 py-0.5 rounded text-xs font-medium ${
                            area.status === 'critical' ? 'bg-red-500/20 text-red-300' : 'bg-yellow-500/20 text-yellow-300'
                          }`}>
                            {Math.round(area.score)}%
                          </div>
                        </div>
                      ))}
                      <div className="mt-2 text-sm text-gray-400">
                        <p>Practice more interviews with these companies to improve your scores.</p>
                      </div>
                    </div>
                  ) : analytics && analytics.totalInterviews > 0 ? (
                    <div className="text-center py-4">
                      <p className="text-green-400 font-medium">Great job!</p>
                      <p className="text-gray-400 text-sm mt-1">No critical improvement areas detected</p>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-400">
                      <p>Complete interviews to see improvement areas</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3 border-green-500/50 hover:bg-green-900/20"
                        onClick={() => navigate('/start-practice')}
                      >
                        Start Practice
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
