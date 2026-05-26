import React, { useState, useEffect, Suspense } from "react";
import { 
  ReviewAnalysis, 
  ProductInsight, 
  SystemLog, 
  User, 
  DashboardStats 
} from "./types";
  import LandingHero from "./components/LandingHero";
  const AnalyticsPanel = React.lazy(() => import("./components/AnalyticsPanel"));
  const ReviewAuditor = React.lazy(() => import("./components/ReviewAuditor"));
  const ReviewHistory = React.lazy(() => import("./components/ReviewHistory"));
  const ProductInsightsList = React.lazy(() => import("./components/ProductInsightsList"));
  const AdminPanel = React.lazy(() => import("./components/AdminPanel"));
  const ReviewResultsView = React.lazy(() => import("./components/ReviewResultsView"));
  const UserSettingsPanel = React.lazy(() => import("./components/UserSettingsPanel"));
import { useAuth } from "./lib/AuthContext";
import { 
  fetchReviews, 
  fetchProductInsights, 
  fetchAllLogs, 
  saveReview, 
  saveProductInsight, 
  saveSystemLog, 
  deleteReview 
} from "./lib/db";
import { 
  Shield, 
  Sparkles, 
  Layers, 
  Search, 
  Grid, 
  AlertTriangle, 
  MessageSquare, 
  Settings, 
  Users, 
  Server, 
  LogOut, 
  Menu, 
  X, 
  HelpCircle, 
  UserCheck, 
  Info,
  CheckCircle,
  BarChart3,
  Bot,
  ArrowRight,
  TrendingUp,
  Sun,
  Moon,
  Send,
  Loader2
} from "lucide-react";

export default function App() {
  const { 
    user, 
    authToken,
    loading: authLoading, 
    login, 
    signup, 
    logout, 
  } = useAuth();

  // Authentication Dialog States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authError, setAuthError] = useState("");
  const [authResetSent, setAuthResetSent] = useState(false);

  // Layout Theme State (force dark-only)
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // Active Navigation Tab
  const [currentTab, setCurrentTab] = useState<"dashboard" | "upload" | "results" | "analytics" | "reports" | "history" | "settings">("dashboard");
  const [viewMode, setViewMode] = useState<"user" | "admin">("user");
  const [latestResults, setLatestResults] = useState<ReviewAnalysis[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Platform Datasets
  const [reviewsHistory, setReviewsHistory] = useState<ReviewAnalysis[]>([]);
  const [productInsights, setProductInsights] = useState<ProductInsight[]>([]);
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalReviews: 0,
    fakeReviewsCount: 0,
    realReviewsCount: 0,
    averageTrust: 100,
    toxicCount: 0,
    usersCount: 1,
    productsCount: 0,
    sentimentDistribution: { positive: 0, negative: 0, neutral: 0 }
  });

  // Query/Search filter states
  const [filterSearch, setFilterSearch] = useState("");
  const [filterProduct, setFilterProduct] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSentiment, setFilterSentiment] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviewsCount, setTotalReviewsCount] = useState(0);

  // Loading indicator states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isFetchingHistory, setIsFetchingHistory] = useState(false);

  // Copilot Assistant dialog states
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
    { sender: "bot", text: "Hello! I am ReviewShield Copilot. Let's look into marketplace forensic anomalies together. Ask me how NLP flags fake reviews!" }
  ]);
  const [isChatSending, setIsChatSending] = useState(false);

  // Unified Toast System
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: "success" | "info" | "error" }>({
    show: false,
    msg: "",
    type: "success"
  });

  const triggerToast = (msg: string, type: "success" | "info" | "error" = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 4500);
  };

  // Sync Global Theme classes
  useEffect(() => {
    // Enforce dark theme always
    try {
      localStorage.setItem("rs_theme", "dark");
    } catch (e) {}
    const root = window.document.documentElement;
    root.classList.add("dark");
  }, []);

  // Pull database elements on authenticated session changes
  const refreshAllData = async () => {
    if (!user) return;
    setIsFetchingHistory(true);
    try {
      const isAdminRole = user.role === "admin";
      
      // 1. Ingest reviews lists
      const rawReviews = await fetchReviews(user.id, isAdminRole);
      setReviewsHistory(rawReviews);

      // 2. Fetch Aggregated Product rep metrics
      const rawInsights = await fetchProductInsights(user.id, isAdminRole);
      setProductInsights(rawInsights);

      // 3. Fetch system logs (admin-ready)
      if (isAdminRole) {
        const adminLogs = await fetchAllLogs();
        setSystemLogs(adminLogs);
      }

      // Calculate localized customer states on the fly
      const totalReviews = rawReviews.length;
      const fakeReviewsCount = rawReviews.filter(r => r.isFake).length;
      const realReviewsCount = totalReviews - fakeReviewsCount;
      const totalTrust = rawReviews.reduce((sum, r) => sum + r.trustScore, 0);
      const averageTrust = totalReviews > 0 ? Math.round(totalTrust / totalReviews) : 100;
      const toxicCount = rawReviews.filter(r => r.toxicityScore > 50).length;

      const sentimentDistribution = {
        positive: rawReviews.filter(r => r.sentiment === "positive").length,
        negative: rawReviews.filter(r => r.sentiment === "negative").length,
        neutral: rawReviews.filter(r => r.sentiment === "neutral").length
      };

      setStats({
        totalReviews,
        fakeReviewsCount,
        realReviewsCount,
        averageTrust,
        toxicCount,
        usersCount: isAdminRole ? 8 : 1, // Secure humanized telemetry
        productsCount: rawInsights.length,
        sentimentDistribution
      });

      // Pagination math of local state
      let filtered = [...rawReviews];
      if (filterSearch) {
        const s = filterSearch.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.reviewText.toLowerCase().includes(s) ||
            r.reviewerName.toLowerCase().includes(s) ||
            r.productName.toLowerCase().includes(s)
        );
      }
      if (filterProduct) {
        filtered = filtered.filter((r) => r.productName === filterProduct);
      }
      if (filterStatus) {
        filtered = filtered.filter((r) => r.isFake === (filterStatus === "fake"));
      }
      if (filterSentiment) {
        filtered = filtered.filter((r) => r.sentiment === filterSentiment);
      }

      setTotalReviewsCount(filtered.length);
      setTotalPages(Math.max(Math.ceil(filtered.length / 10), 1));
    } catch (err) {
      console.error("Failed to sync current snapshot states:", err);
    } finally {
      setIsFetchingHistory(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshAllData();
    }
  }, [user, filterSearch, filterProduct, filterStatus, filterSentiment, currentPage]);

  // Log dashboard render duration once user becomes available
  useEffect(() => {
    if (user) {
      try {
        const start = (window as any).__rs_app_start || performance.now();
        const now = performance.now();
        console.log('ui:dashboard:render', { userId: user.id, durationMs: Math.round(now - start), ts: Date.now() });
      } catch (e) {
        // ignore
      }
    }
  }, [user]);

  // Auth Handler Pipeline
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    try {
      if (authMode === "login") {
        await login(authEmail, authPassword);
        triggerToast("Welcome back! Credentials verified.", "success");
      } else {
        if (authName.trim().length === 0) {
          setAuthError("Please supply account owner name.");
          return;
        }
        await signup(authEmail, authPassword, authName);
        triggerToast("Account configured successfully!", "success");
      }
      setShowAuthModal(false);
      // Reset defaults
      setAuthPassword("");
      setAuthEmail("");
      setAuthName("");
    } catch (err: any) {
      let friendlyError = err.message || "Failed to authenticate. Verify keys.";
      if (friendlyError.includes("auth/invalid-credential")) {
        friendlyError = "Incorrect authorization password. Please recheck your credentials.";
      } else if (friendlyError.includes("auth/weak-password")) {
        friendlyError = "Security threshold error: password must remain at least 6 characters.";
      }
      setAuthError(friendlyError);
    }
  };

  const handleAuthKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Call submit handler with a synthetic event
      handleAuthSubmit({ preventDefault: () => {} } as unknown as React.FormEvent);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError("");
    try {
      setAuthError("Google sign-in is disabled for the custom auth backend.");
    } catch (err: any) {
      setAuthError(err.message || "Failed Google credentials verification.");
    }
  };

  const handlePasswordReset = async () => {
    setAuthError("Password reset is not enabled for the custom auth backend.");
  };

  const handleLogout = async () => {
    await logout();
    setViewMode("user");
    setCurrentTab("dashboard");
    setReviewsHistory([]);
    setProductInsights([]);
    setLatestResults([]);
    triggerToast("Encrypted workspace session locked safely.", "info");
  };

  // Perform bulk reviews analyzes via API Proxy
  const performReviewsAnalysis = async (payloadArr: any[]) => {
    if (!user) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch("/api/reviews/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({ reviews: payloadArr })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Linguistic pipeline analyzer rejected evaluation.");
      }

      // Persist analyzed results through the store-backed API
      const newlyAnalyzed: ReviewAnalysis[] = data.results || [];
      for (const item of newlyAnalyzed) {
        await saveReview(item, user.id);
      }

      // Calculate newly aggregated Insights row for each productName in this batch
      const productsInBatch = Array.from(new Set(newlyAnalyzed.map((r) => r.productName)));
      for (const pName of productsInBatch) {
        const matchSpecific = newlyAnalyzed.filter(r => r.productName === pName);
        const priorReviews = reviewsHistory.filter(r => r.productName === pName).concat(matchSpecific);
        const totalPCount = priorReviews.length;
        const fakeCount = priorReviews.filter(r => r.isFake).length;
        
        const avgTrust = Math.round(priorReviews.reduce((sum, r) => sum + r.trustScore, 0) / totalPCount);
        const avgRating = parseFloat((priorReviews.reduce((sum, r) => sum + r.rating, 0) / totalPCount).toFixed(1));
        const satisfactionScore = Math.round((priorReviews.filter(r => r.sentiment === "positive").length / totalPCount) * 100);
        
        const authenticityGrade = avgTrust > 85 ? "A" : avgTrust > 70 ? "B" : avgTrust > 50 ? "C" : "F";
        const consensusText = authenticityGrade === "A" 
          ? `The linguistic variation indices suggest natural human customer variance. Star scores scale perfectly proportional to syntactic sentiments.`
          : authenticityGrade === "B"
          ? `Slight stylistic uniform patterns and repetition flags noticed during evaluations, but core user feedback maps correctly to real product experiences.`
          : `High artificial intelligence stylistic footprint detected along with severe keyword repetitive blooms. Multiple high-toxicity competitor reviews also flagged.`;

        const newInsight: ProductInsight = {
          productName: pName,
          reviewsCount: totalPCount,
          averageRating: avgRating,
          averageTrustScore: avgTrust,
          satisfactionScore,
          authenticityGrade,
          consensusText,
          keyHighlights: matchSpecific[0]?.extractedKeywords.slice(0, 3) || ["Verified delivery", "Intuitive layout"],
          mainComplaints: matchSpecific[0]?.flaggedPatterns.slice(0, 3) || ["Repetitive styling elements"],
          actionableImprovements: ["Audit recent listing promo clusters", "Consolidate Q&A components"],
          lastUpdated: new Date().toISOString()
        };

        await saveProductInsight(newInsight, user.id);
      }

      // Save system audit telemetries
      await saveSystemLog("REVIEWS_EVALUATED_BATCH", `Secured check on ${newlyAnalyzed.length} uploads.`);

      triggerToast(`Forensic scan complete: parsed ${payloadArr.length} elements!`, "success");
      setLatestResults(newlyAnalyzed);
      await refreshAllData();
      setCurrentTab("results");
    } catch (err: any) {
      triggerToast(err.message || "Forensic analyzer gateway timeout.", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleBulkSummarize = async (reviewsTextJSON: string) => {
    setIsSummarizing(true);
    try {
      const res = await fetch("/api/reviews/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {})
        },
        body: reviewsTextJSON
      });
      if (res.ok) {
        triggerToast("Selected listing logs aggregated into concise Roadmap summaries!", "success");
        return await res.json();
      }
    } catch (err) {
      triggerToast("Summarizer capacity bounds exceeded.", "error");
    } finally {
      setIsSummarizing(false);
    }
    return null;
  };

  const handleDeleteReviewLog = async (id: string) => {
    if (user?.role !== "admin") {
      triggerToast("Access Denied: Admin authorization required.", "error");
      return;
    }
    try {
      await deleteReview(id);
      await saveSystemLog("PURGE_REVIEW_LOG", `Admin deleted audit log: ${id}`);
      triggerToast("Audit record purged successfully.", "success");
      await refreshAllData();
    } catch (err: any) {
      triggerToast("Failed to delete database record.", "error");
    }
  };

  const sendCopilotChat = async () => {
    if (!chatInput.trim()) return;
    const userMessage = chatInput.trim();
    setChatMessages((prev) => [...prev, { sender: "user", text: userMessage }]);
    setChatInput("");
    setIsChatSending(true);

    try {
      const summaryReport = `Active audits total: ${stats.totalReviews} entries. Suspicious flagged: ${stats.fakeReviewsCount} items. Listed Brand names: ${productInsights.map(p => p.productName).join(", ")}.`;
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, summaryReport })
      });
      if (res.ok) {
        const body = await res.json();
        setChatMessages((prev) => [...prev, { sender: "bot", text: body.reply }]);
      } else {
        setChatMessages((prev) => [...prev, { sender: "bot", text: "My network processing clusters are busy tracking metadata logs. Try scanning some reviews first." }]);
      }
    } catch (e) {
      setChatMessages((prev) => [...prev, { sender: "bot", text: "Communication node timeout. Check ReviewShield cloud services status." }]);
    } finally {
      setIsChatSending(false);
    }
  };

  // Styled helper definitions based on light/dark modifiers
  const appBg = theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900";
  const cardStyle = theme === "dark" ? "bg-slate-900 border-slate-808 hover:border-slate-700" : "bg-white border-slate-200 hover:border-slate-300 text-slate-950 shadow-sm";
  const textMuted = theme === "dark" ? "text-slate-400" : "text-slate-500";
  const headerStyle = theme === "dark" ? "bg-slate-950/90 border-slate-900" : "bg-white/90 border-slate-200 shadow-sm";
  const sidebarStyle = theme === "dark" ? "bg-slate-950 border-slate-900" : "bg-white border-slate-200 shadow-sm text-slate-900";

  // If initial auth session is still checking token
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center font-sans">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-teal-500/30 blur-2xl rounded-full animate-pulse"></div>
          <div className="relative bg-slate-900 border border-teal-500/50 p-6 rounded-2xl flex items-center justify-center">
            <Shield className="w-12 h-12 text-teal-400 animate-spin-slow" />
          </div>
        </div>
        <p className="text-sm font-bold tracking-tight uppercase tracking-widest text-slate-200">ReviewShield AI Platform</p>
        <p className="text-xs text-slate-500 uppercase mt-2 font-mono tracking-widest flex items-center gap-1.5 justify-center">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
          <span>Syncing Auth Sessions...</span>
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950 transition-colors duration-200 ${appBg}`}>
      
      {/* Dynamic Floating Toast Alerts */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in">
          <div className={`px-5 py-3.5 rounded-xl border flex items-center gap-2.5 shadow-2xl transition-all ${
            toast.type === "success" ? "bg-emerald-500/15 border-emerald-500/25 text-emerald-300" :
            toast.type === "error" ? "bg-rose-500/15 border-rose-500/25 text-rose-300" :
            "bg-teal-500/15 border-teal-500/25 text-teal-300"
          }`}>
            <Info className="w-4 h-4 shrink-0" />
            <span className="text-xs font-semibold">{toast.msg}</span>
          </div>
        </div>
      )}

      {/* VIEW PANEL 1: LANDING PAGE */}
      {!user ? (
        <LandingHero 
          onGetStarted={() => {
            setAuthMode("signup");
            setAuthError("");
            setShowAuthModal(true);
          }} 
          onLogin={() => {
            setAuthMode("login");
            setAuthError("");
            setShowAuthModal(true);
          }} 
        />
      ) : (
        
        /* VIEW PANEL 2: PLATFORM WORKSPACE CONTAINER */
        <div className="flex-1 flex overflow-hidden min-h-screen pt-18 relative">
          
          {/* Header Dashboard Nav */}
          <header className={`fixed top-0 left-0 w-full z-40 border-b backdrop-blur-md transition-colors duration-200 ${headerStyle}`}>
            <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-1 hover:bg-slate-900 rounded-lg text-slate-500 md:hidden block mr-1 cursor-pointer"
                >
                  <Menu className="w-5.5 h-5.5" />
                </button>
                <div className="bg-slate-900 border border-teal-400/30 p-1.5 text-teal-400 rounded-lg hidden sm:block">
                  <Shield className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <span className="text-base font-bold bg-gradient-to-r from-teal-500 to-emerald-400 bg-clip-text text-transparent">ReviewShield</span>
                  <span className="text-[9px] font-mono text-teal-400 border border-teal-500/20 bg-teal-500/10 px-1.5 ml-1.5 py-0.5 rounded font-bold uppercase">PRO</span>
                </div>
              </div>

              {/* Dynamic Theme indicator switcher */}
              <div className="flex items-center gap-4">
                
                <div className="hidden lg:flex items-center gap-2 bg-slate-900/60 border border-slate-800/80 px-4 py-2 rounded-xl text-[10px] text-slate-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Secure User: <strong>{user.email}</strong></span>
                </div>

                {/* Account details avatar bar */}
                <div className="flex items-center gap-3">
                  <div className="hidden md:block text-right">
                    <span className="block text-xs font-bold">{user.name}</span>
                    <span className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider">{user.role} workspace</span>
                  </div>
                  
                  <div className="p-2 rounded-xl border bg-slate-900 border-slate-800 text-teal-400 flex items-center gap-2 px-3" title="Dark Mode Enabled">
                    <Moon className="w-4 h-4" />
                    <span className="text-xs uppercase tracking-wider font-mono text-teal-300">Dark</span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-2.5 bg-slate-500/10 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-xl border border-transparent hover:border-red-500/20 transition-all cursor-pointer flex items-center justify-center"
                    title="Sign Out Platform"
                  >
                    <LogOut className="w-4.5 h-4.5" />
                  </button>
                </div>
              </div>

            </div>
          </header>

          {/* Collapsible Mobile/Desktop Side navigation rail */}
          <aside className={`fixed md:sticky top-18 bottom-0 left-0 z-30 w-64 border-r p-5 shrink-0 transition-transform md:translate-x-0 transition-colors duration-200 ${sidebarStyle} ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
            
            {/* Admin toggle console switcher */}
            {user.role === "admin" && (
              <div className="mb-6">
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-extrabold block mb-2 px-1">Access Channel</span>
                <div className="flex bg-slate-100 dark:bg-slate-950 p-1 border border-slate-250 dark:border-slate-850 rounded-xl">
                  <button
                    onClick={() => { setViewMode("user"); setMobileMenuOpen(false); }}
                    className={`flex-1 py-1.5 rounded-lg text-center text-[10px] uppercase font-mono tracking-wider font-extrabold cursor-pointer transition-all ${
                      viewMode === "user" 
                        ? "bg-teal-500/10 text-teal-500 dark:text-teal-400 border border-teal-500/10 font-bold" 
                        : "text-slate-400 hover:text-slate-950 bg-transparent border border-transparent"
                    }`}
                  >
                    Workspace
                  </button>
                  <button
                    onClick={() => { setViewMode("admin"); setMobileMenuOpen(false); }}
                    className={`flex-1 py-1.5 rounded-lg text-center text-[10px] uppercase font-mono tracking-wider font-extrabold cursor-pointer transition-all ${
                      viewMode === "admin" 
                        ? "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/10 font-bold" 
                        : "text-slate-400 hover:text-slate-950 bg-transparent border border-transparent"
                    }`}
                  >
                    Admin Console
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1">
              {viewMode === "user" ? (
                <>
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-semibold block mb-2.5 px-3">Brand Integrity</span>
                  
                  <SidebarItem 
                    active={currentTab === "dashboard"} 
                    onClick={() => { setCurrentTab("dashboard"); setMobileMenuOpen(false); }} 
                    icon={TrendingUp} 
                    label="Executive Dashboard" 
                  />

                  <SidebarItem 
                    active={currentTab === "upload"} 
                    onClick={() => { setCurrentTab("upload"); setMobileMenuOpen(false); }} 
                    icon={Grid} 
                    label="Analyze Reviews" 
                  />

                  {latestResults.length > 0 && (
                    <SidebarItem 
                      active={currentTab === "results"} 
                      onClick={() => { setCurrentTab("results"); setMobileMenuOpen(false); }} 
                      icon={Shield} 
                      label="Session Results" 
                    />
                  )}

                  <SidebarItem 
                    active={currentTab === "analytics"} 
                    onClick={() => { setCurrentTab("analytics"); setMobileMenuOpen(false); }} 
                    icon={BarChart3} 
                    label="Sentiment Analytics" 
                  />
                  <SidebarItem 
                    active={currentTab === "reports"} 
                    onClick={() => { setCurrentTab("reports"); setMobileMenuOpen(false); }} 
                    icon={MessageSquare} 
                    label="Product Insights" 
                  />
                  <SidebarItem 
                    active={currentTab === "history"} 
                    onClick={() => { setCurrentTab("history"); setMobileMenuOpen(false); }} 
                    icon={Layers} 
                    label="Reviews Ingest History" 
                  />
                  
                  <div className="pt-6">
                    <span className="text-[9px] font-mono text-slate-400 uppercase tracking-widest font-semibold block mb-2 px-3">Secured Options</span>
                    <SidebarItem 
                      active={currentTab === "settings"} 
                      onClick={() => { setCurrentTab("settings"); setMobileMenuOpen(false); }} 
                      icon={Settings} 
                      label="Profile Settings" 
                    />
                  </div>
                </>
              ) : (
                <>
                  <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-bold block mb-4 px-3">Console Panel</span>
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] uppercase font-mono text-center tracking-wider rounded-xl mb-4 font-extrabold">
                    🛡️ Global Root Node
                  </div>
                  <p className="text-[10px] text-slate-500 text-center px-4 leading-relaxed font-sans mt-3">
                    Administrative access unlocks real-time telemetry metrics, overall database totals, and secure eventlogs streams.
                  </p>
                </>
              )}
            </div>

            {/* Trust Quotient Gauge Widget */}
            <div className="absolute bottom-5 left-5 right-5 font-sans">
              <div className={`p-4 border rounded-xl ${cardStyle}`}>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-teal-400" />
                  <span className="text-xs font-bold">Brand Trust Indicator</span>
                </div>
                <div className="mt-2.5 flex items-baseline">
                  <span className={`text-2xl font-black ${stats.averageTrust > 75 ? "text-emerald-400" : stats.averageTrust > 50 ? "text-yellow-400" : "text-rose-400"}`}>{stats.averageTrust}%</span>
                  <span className="text-[9px] text-slate-500 ml-1.5 font-semibold font-mono">Veracity</span>
                </div>
              </div>
            </div>

          </aside>

          {/* Main workspace frame content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6 pt-2">
              
              {/* Context header */}
              <div className="flex flex-col sm:flex-row gap-2 justify-between items-start border-b border-slate-205 dark:border-slate-900 pb-5 mb-4">
                <div>
                  <h2 className="text-xl font-bold uppercase tracking-tight leading-tight">
                    {viewMode === "admin" ? "Administrative Shield Platform Console" : (
                      <>
                        {currentTab === "dashboard" && "Platform Operations Hub"}
                        {currentTab === "upload" && "Analyze Reviews Sandbox"}
                        {currentTab === "results" && "Linguistic Verdict Results"}
                        {currentTab === "analytics" && "Reputation Sentiment Analytics"}
                        {currentTab === "reports" && "AI Product Highlights & Roadmap"}
                        {currentTab === "history" && "Verification Ingestion History"}
                        {currentTab === "settings" && "Calibrations & Profiles Settings"}
                      </>
                    )}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    {viewMode === "admin" ? "Configure platform statistics, track overall system databases counters, and inspect audit logs." : (
                      <>
                        {currentTab === "dashboard" && `Welcome, ${user.name}. Overviewing reputation trust index indicators across scanned listings.`}
                        {currentTab === "upload" && "Validate raw reviews or bulk CSV sheets for instant fake index calculation."}
                        {currentTab === "results" && "Linguistic forensic analysis breakdowns for the current reviews batch."}
                        {currentTab === "analytics" && "Interactive polarity distribution charts, threat analysis timelines, and competitor smear highlights."}
                        {currentTab === "reports" && "Synthesized marketplace summaries, highlights advantages, and roadmap suggests."}
                        {currentTab === "history" && "Isolated secure dashboard log tracking natural, suspicious, and artificial records."}
                        {currentTab === "settings" && "Update profile names, adjust layout themes, change secure passwords, and manage database connection settings."}
                      </>
                    )}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={refreshAllData}
                    className="px-3.5 py-2.5 bg-slate-500/10 hover:bg-slate-500/20 border border-slate-300 dark:border-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Refresh Dashboard
                  </button>
                </div>
              </div>

              {/* Dynamic Sub-tab Pages Mounting */}
              {viewMode === "admin" ? (
                <Suspense fallback={<div className="p-6">Loading admin...</div>}>
                  <AdminPanel logs={systemLogs} user={user} token={authToken} />
                </Suspense>
              ) : (
                <>
                  
                  {/* Tab: Dashboard Hub */}
                  {currentTab === "dashboard" && (
                    <div className="space-y-6 animate-fade-in">
                      
                      {/* Onboarding Empty Guided Screen if database matches empty */}
                      {reviewsHistory.length === 0 ? (
                        <div className={`border rounded-2xl p-8 text-center max-w-3xl mx-auto space-y-6 ${cardStyle}`}>
                          <div className="relative mb-5 w-16 h-16 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-2xl flex items-center justify-center mx-auto">
                            <Bot className="w-8 h-8 text-teal-400 animate-pulse" />
                          </div>
                          <div className="space-y-2">
                            <h3 className="text-xl font-bold tracking-tight">Protect eCommerce Listings with ReviewShield AI</h3>
                            <p className="text-xs text-slate-500 max-w-xl mx-auto leading-relaxed">
                              Welcome! Your dashboard starts fresh and isolated. Let&apos;s run a linguistic deconstruction check on some reviews to begin scanning for automated AI bots, competitor smear attacks, and natural verified ratings.
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto pt-4 text-left">
                            <div className="p-4 rounded-xl border border-slate-205 dark:border-slate-850 space-y-2">
                              <span className="text-[10px] font-mono text-teal-400 font-bold uppercase block">FORENSIC RULE 1</span>
                              <span className="text-xs font-bold text-slate-300 block">Linguistic Forensics</span>
                              <p className="text-[11px] text-slate-550 leading-normal">Flags flary superlatives and LLM stylistic boilerplate outputs.</p>
                            </div>
                            <div className="p-4 rounded-xl border border-slate-205 dark:border-slate-850 space-y-2">
                              <span className="text-[10px] font-mono text-rose-400 font-bold uppercase block">FORENSIC RULE 2</span>
                              <span className="text-xs font-bold text-slate-300 block">Polarity Checker</span>
                              <p className="text-[11px] text-slate-550 leading-normal">Isolates instances where negative text contradicts 5-star ratings.</p>
                            </div>
                            <div className="p-4 rounded-xl border border-slate-205 dark:border-slate-850 space-y-2">
                              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block">FORENSIC RULE 3</span>
                              <span className="text-xs font-bold text-slate-300 block">Competitive Insights</span>
                              <p className="text-[11px] text-slate-550 leading-normal">Compiles actionable roadmaps from genuine complaints lists.</p>
                            </div>
                          </div>

                          <div className="pt-6">
                            <button
                              onClick={() => setCurrentTab("upload")}
                              className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-extrabold px-6 py-3.5 rounded-xl text-xs flex items-center gap-2 justify-center mx-auto shadow-md transition-all hover:scale-[1.01]"
                            >
                              <span>Scan First Product Reviews</span>
                              <ArrowRight className="w-4 h-4 text-slate-950" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        
                        /* standard dashboard cards overview */
                        <div className="space-y-8 animate-fade-in font-sans">
                          
                          {/* Bento Grid layout */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            
                            <div className={`p-6 border rounded-2xl relative overflow-hidden transition-all ${cardStyle}`}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Total Scanned Reviews</span>
                                  <h3 className="text-3xl font-extrabold mt-2 tracking-tight">{stats.totalReviews}</h3>
                                </div>
                                <div className="bg-teal-500/10 text-teal-400 p-2 rounded-xl">
                                  <Layers className="w-4 h-4" />
                                </div>
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono mt-3 block">Isolated profile database stats</span>
                            </div>

                            <div className={`p-6 border rounded-2xl relative overflow-hidden transition-all ${cardStyle}`}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Flagged Suspicious</span>
                                  <h3 className="text-3xl font-extrabold mt-2 text-rose-500 tracking-tight">{stats.fakeReviewsCount}</h3>
                                </div>
                                <div className="bg-rose-500/10 text-rose-400 p-2 rounded-xl">
                                  <AlertTriangle className="w-4 h-4" />
                                </div>
                              </div>
                              <span className="text-[10px] text-rose-500 font-bold mt-3 block">Risk ratio: {Math.round((stats.fakeReviewsCount / Math.max(stats.totalReviews, 1)) * 100)}%</span>
                            </div>

                            <div className={`p-6 border rounded-2xl relative overflow-hidden transition-all ${cardStyle}`}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Listing Trust Coefficient</span>
                                  <h3 className="text-3xl font-extrabold mt-2 text-emerald-400 tracking-tight">{stats.averageTrust}%</h3>
                                </div>
                                <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-xl">
                                  <Shield className="w-4 h-4" />
                                </div>
                              </div>
                              <span className="text-[10px] text-emerald-400 font-bold mt-3 block">High organic validity levels</span>
                            </div>

                            <div className={`p-6 border rounded-2xl relative overflow-hidden transition-all ${cardStyle}`}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Unique SKUs Tracked</span>
                                  <h3 className="text-3xl font-extrabold mt-2 tracking-tight">{stats.productsCount}</h3>
                                </div>
                                <div className="bg-yellow-500/10 text-yellow-400 p-2 rounded-xl">
                                  <Grid className="w-4 h-4" />
                                </div>
                              </div>
                              <span className="text-[10px] text-slate-500 font-mono mt-3 block">Product summaries compiled</span>
                            </div>

                          </div>

                          {/* Action quick links block */}
                          <div className={`border rounded-2xl p-6 ${cardStyle}`}>
                            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                              <div>
                                <h4 className="text-sm font-bold">Inspect Deception Specimen or Upload Listings</h4>
                                <p className="text-[11px] text-slate-500 mt-1">Submit high-density Amazon text feeds to deconstruct repetitive grammatical structures instantly.</p>
                              </div>
                              <div className="flex gap-3 w-full sm:w-auto">
                                <button
                                  onClick={() => setCurrentTab("upload")}
                                  className="flex-1 sm:flex-none justify-center bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs px-5 py-3 rounded-xl cursor-pointer transition-all hover:scale-[1.01] flex items-center gap-1.5"
                                >
                                  <span>Submit Scopes</span>
                                  <ArrowRight className="w-4 h-4 text-slate-950" />
                                </button>
                                <button
                                  onClick={() => setCurrentTab("analytics")}
                                  className="flex-1 sm:flex-none justify-center bg-slate-500/10 hover:bg-slate-500/20 border border-slate-300 dark:border-slate-850 text-xs font-bold px-4 py-3 rounded-xl cursor-pointer"
                                >
                                  Sentiment Charts
                                </button>
                              </div>
                            </div>
                          </div>

                        </div>
                      )}

                    </div>
                  )}

                  {/* Tab: Upload Reviews Sandbox */}
                  {currentTab === "upload" && (
                    <ReviewAuditor onAnalyze={performReviewsAnalysis} isAnalyzing={isAnalyzing} />
                  )}

                  {/* Tab: Review Session Results */}
                  {currentTab === "results" && (
                    <ReviewResultsView latestResults={latestResults} onBackToUpload={() => setCurrentTab("upload")} />
                  )}

                  {/* Tab: Analytics polarity charts */}
                  {currentTab === "analytics" && (
                    <AnalyticsPanel stats={stats} recentReviews={reviewsHistory} />
                  )}

                  {/* Tab: Insights recommendations */}
                  {currentTab === "reports" && (
                    <ProductInsightsList 
                      insights={productInsights} 
                      onSummarizeBulk={handleBulkSummarize} 
                      isSummarizing={isSummarizing} 
                    />
                  )}

                  {/* Tab: Archived database logs */}
                  {currentTab === "history" && (
                    <ReviewHistory
                      reviews={reviewsHistory}
                      totalReviews={totalReviewsCount}
                      totalPages={totalPages}
                      currentPage={currentPage}
                      onPageChange={setCurrentPage}
                      onDeleteReview={handleDeleteReviewLog}
                      filterSearch={filterSearch}
                      setFilterSearch={setFilterSearch}
                      filterProduct={filterProduct}
                      setFilterProduct={setFilterProduct}
                      filterStatus={filterStatus}
                      setFilterStatus={setFilterStatus}
                      filterSentiment={filterSentiment}
                      setFilterSentiment={setFilterSentiment}
                      isAdmin={user.role === "admin"}
                    />
                  )}

                  {/* Tab: User Account Configuration settings */}
                  {currentTab === "settings" && (
                    <UserSettingsPanel 
                      user={user} 
                      theme={theme}
                      onThemeToggle={(newTheme) => setTheme(newTheme)}
                      onSaveToast={triggerToast} 
                      onLogout={handleLogout}
                    />
                  )}

                </>
              )}

            </div>
          </main>

          {/* AI COPILOT ASSISTANT CHAT WIDGET DOCK */}
          <div className="fixed bottom-6 right-6 z-40">
            {!copilotOpen ? (
              <button
                onClick={() => setCopilotOpen(true)}
                className="w-14 h-14 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center shadow-2xl hover:scale-105 transition-all cursor-pointer border border-teal-400 group"
              >
                <Bot className="w-6 h-6 text-slate-950 group-hover:rotate-12 transition-transform" />
              </button>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl w-80 sm:w-96 h-108 flex flex-col shadow-2xl overflow-hidden font-sans">
                
                {/* Header bar */}
                <div className="bg-slate-950 border-b border-slate-850 px-4 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-lg flex items-center justify-center">
                      <Bot className="w-4 h-4 text-teal-400" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block leading-none">ReviewShield Copilot</span>
                      <span className="text-[8px] font-mono text-emerald-400 tracking-wider font-extrabold uppercase">NLP Advisor Active</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setCopilotOpen(false)}
                    className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors rounded-lg cursor-pointer"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Chats Container pane */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans text-xs">
                  {chatMessages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                        msg.sender === "user" 
                          ? "bg-teal-500 text-slate-950 font-semibold rounded-tr-none" 
                          : "bg-slate-950 border border-slate-850 text-slate-300 rounded-tl-none"
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isChatSending && (
                    <div className="flex justify-start">
                      <div className="p-3 bg-slate-950 border border-slate-850 text-slate-400 rounded-2xl rounded-tl-none flex items-center gap-2 font-mono text-[10px]">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-400" />
                        <span>Copilot analyzing patterns...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Text prompts field dock */}
                <div className="p-3 border-t border-slate-850 bg-slate-950/60 flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask about AI text, polarity markers..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        sendCopilotChat();
                      }
                    }}
                    className="flex-1 bg-slate-950 border border-slate-850 px-3 py-2 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                  <button
                    onClick={sendCopilotChat}
                    className="p-2 ml-1 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl cursor-pointer transition-all flex items-center justify-center shrink-0"
                  >
                    <Send className="w-4 h-4 text-slate-950" />
                  </button>
                </div>

              </div>
            )}
          </div>

        </div>
      )}

      {/* VERIFIABLE AUTH MODAL GATE */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm px-4 font-sans">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl relative p-6 animate-scale-up">
            
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-1 hover:bg-slate-850 border border-transparent hover:border-slate-800 rounded text-slate-400 hover:text-white transition-all"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <div className="text-center mb-6 pt-2">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-5 h-5 text-teal-400" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider">
                {authMode === "login" ? "Verify Credentials Key" : "Register Forensic Sandboxing"}
              </h3>
              <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-widest font-mono">Securing brand listing reputations</p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4 text-xs text-slate-350">
              
              {authError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/25 text-rose-300 rounded-xl flex gap-2 items-start leading-relaxed font-sans">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{authError}</span>
                </div>
              )}

              {authMode === "signup" && (
                <div>
                  <label className="block text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1.5">Your Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Johnson"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1.5">Authorized Email</label>
                <input
                  type="email"
                  required
                  placeholder="analyst@reviewshield.ai"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  onKeyDown={handleAuthKeyDown}
                  className="w-full bg-slate-950 border border-slate-850 px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-[9px] text-slate-400 uppercase tracking-widest font-bold mb-1.5">Secure Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  onKeyDown={handleAuthKeyDown}
                  className="w-full bg-slate-950 border border-slate-850 px-3.5 py-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-teal-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold py-3.5 rounded-xl transition-all shadow-md text-xs mt-6"
              >
                {authMode === "login" ? "Verify Session Credentials" : "Initialize Secure Auditing Sandbox"}
              </button>

              <div className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                Custom email and password auth only.
              </div>

              <div className="text-center pt-2 text-[9px] text-slate-500 uppercase font-mono tracking-wider">
                {authMode === "login" ? (
                  <>
                    First time auditing listings?{" "}
                    <span 
                      onClick={() => { setAuthMode("signup"); setAuthError(""); }} 
                      className="text-teal-400 hover:underline cursor-pointer font-bold"
                    >
                      Sign Up
                    </span>
                  </>
                ) : (
                  <>
                    Already hold shielding keys?{" "}
                    <span 
                      onClick={() => { setAuthMode("login"); setAuthError(""); }} 
                      className="text-teal-400 hover:underline cursor-pointer font-bold"
                    >
                      Login
                    </span>
                  </>
                )}
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

interface SidebarItemProps {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<any>;
  label: string;
}

function SidebarItem({ active, onClick, icon: IconComp, label }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-sans font-bold transition-all text-left ${
        active 
          ? "bg-teal-555/15 text-teal-500 dark:text-teal-400 border border-teal-500/20 shadow-inner" 
          : "text-slate-400 hover:text-slate-950 hover:bg-slate-100 dark:hover:text-slate-100 dark:hover:bg-slate-900 border border-transparent"
      }`}
    >
      <IconComp className={`w-4 h-4 ${active ? "text-teal-400" : "text-slate-500"}`} />
      <span>{label}</span>
    </button>
  );
}
