import React, { useState } from "react";
import { Shield, Sparkles, AlertTriangle, CheckCircle, BarChart3, ChevronRight, HelpCircle, ArrowRight, Zap, RefreshCw, Star, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";

interface LandingHeroProps {
  onGetStarted: () => void;
  onLogin: () => void;
}

export default function LandingHero({ onGetStarted, onLogin }: LandingHeroProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("yearly");
  const [auditsCount, setAuditsCount] = useState(0);
  const [fakeCount, setFakeCount] = useState(0);
  const [trustScore, setTrustScore] = useState(0);

  // Animate stat counters on mount
  React.useEffect(() => {
    let a = 0; let f = 0; let t = 0;
    const aTarget = 1245678;
    const fTarget = 12345;
    const tTarget = 92;
    const id = setInterval(() => {
      a += Math.ceil(aTarget / 60);
      f += Math.ceil(fTarget / 60);
      t += 1;
      setAuditsCount(Math.min(a, aTarget));
      setFakeCount(Math.min(f, fTarget));
      setTrustScore(Math.min(t, tTarget));
      if (a >= aTarget && f >= fTarget && t >= tTarget) clearInterval(id);
    }, 35);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500 selection:text-slate-950 overflow-x-hidden">
      
      {/* Premium Glass Header */}
      <header className="fixed top-0 left-0 w-full z-50 border-b border-slate-900 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-teal-500/30 blur-md rounded-lg"></div>
              <div className="relative bg-slate-900 border border-teal-500/50 p-1.5 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-teal-400" />
              </div>
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-teal-400 bg-clip-text text-transparent">
                ReviewShield
              </span>
              <span className="text-xs font-bold font-mono px-1.5 py-0.5 ml-1.5 rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/20">
                AI
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm text-slate-400 font-medium">
            <a href="#features" className="hover:text-white transition-colors">Platform Features</a>
            <a href="#demo" className="hover:text-white transition-colors">Instant Demo</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing Structure</a>
            <a href="#faq" className="hover:text-white transition-colors">Resources</a>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              onClick={onLogin}
              className="text-sm font-semibold hover:text-white transition-colors text-slate-300 px-4 py-2"
            >
              Sign In
            </button>
            <button 
              onClick={onGetStarted}
              className="relative group overflow-hidden bg-teal-500 hover:bg-teal-400 text-slate-950 text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-teal-500/20 hover:shadow-teal-400/30 flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        
        {/* Futuristic Grid Background Lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none -z-10"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-500/10 blur-[100px] rounded-full pointer-events-none -z-10" />

        {/* Dynamic Badge */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-teal-400 text-xs font-mono font-medium shadow-inner shadow-teal-500/5 mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Next-Gen Fake Review & Sentiment Intelligence Engine</span>
        </motion.div>

        {/* Display Typography */}
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-sans font-extrabold tracking-tight text-white leading-[1.1] max-w-4xl"
        >
          Protect Your Brand with <span className="bg-gradient-to-r from-teal-400 via-emerald-300 to-cyan-400 bg-clip-text text-transparent">Actionable Review Intelligence</span>
        </motion.h1>

        {/* Sub-copy */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl font-light leading-relaxed"
        >
          Scan product reviews at scale to detect fake or AI-generated feedback, surface high-confidence insights, and act fast to protect reputation and revenue.
        </motion.p>

        {/* Call to Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center"
        >
          <button
            onClick={onGetStarted}
            className="w-full sm:w-auto bg-slate-50 hover:bg-white text-slate-950 font-bold px-8 py-4 rounded-xl transition-all shadow-xl hover:scale-[1.01] flex items-center justify-center gap-2"
          >
            <span>Launch Review Auditor</span>
            <ArrowRight className="w-5 h-5 text-slate-800" />
          </button>
          <a
            href="#features"
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white font-semibold px-8 py-4 rounded-xl border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center gap-1.5"
          >
            <span>Explore Technical Architecture</span>
          </a>
        </motion.div>

        {/* Trust Indicators */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 border-t border-slate-900 pt-10 w-full max-w-5xl"
        >
          <p className="text-xs font-mono tracking-widest text-teal-400 uppercase">Trusted by dynamic retail brands globally</p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto items-center">
            <div className="card text-center">
              <div className="text-sm text-slate-300">Audits Processed</div>
              <div className="text-2xl font-extrabold text-white mt-2">{auditsCount.toLocaleString()}</div>
            </div>
            <div className="card text-center">
              <div className="text-sm text-slate-300">Fake Reviews Flagged</div>
              <div className="text-2xl font-extrabold text-rose-400 mt-2">{fakeCount.toLocaleString()}</div>
            </div>
            <div className="card text-center">
              <div className="text-sm text-slate-300">Average Trust Score</div>
              <div className="text-2xl font-extrabold text-emerald-400 mt-2">{trustScore}%</div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-x-12 gap-y-6 items-center opacity-60 hover:opacity-80 transition-opacity">
            <span className="font-extrabold text-lg text-slate-300 tracking-wider">AMZ LISTINGS</span>
            <span className="font-bold text-lg text-slate-300 tracking-wider">FLIP KART CORE</span>
            <span className="font-semibold text-lg text-slate-300 tracking-tight">SHOPIFY AUDIT</span>
            <span className="font-extrabold text-lg text-slate-300 tracking-tight">E-PRO</span>
            <span className="font-medium text-lg text-slate-300 tracking-widest">ECOMRC CLOUD</span>
          </div>
        </motion.div>
      </section>

      {/* Bento Grid Features Showcase */}
      <section id="features" className="py-24 bg-slate-950 border-t border-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-sm font-mono tracking-widest text-teal-400 uppercase">How It Works</h2>
            <p className="mt-3 text-3xl sm:text-4xl font-extrabold text-white">Multi-layered Detection for Real Results</p>
            <p className="mt-4 text-slate-300 font-light">
              We combine heuristic signals with industry-grade language models to surface high-confidence signals, reduce false positives, and deliver actionable product insights.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-slate-900/40 border border-slate-900 p-8 rounded-2xl relative overflow-hidden group hover:border-slate-800 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 blur-2xl rounded-full" />
              <div className="bg-teal-500/10 border border-teal-500/20 text-teal-400 p-3 rounded-xl w-fit">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mt-6">AI Text Model Classifier</h3>
              <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                Flags chatbot stylistic footprints, grammatical anomalies, repetitive vocabulary structures, and uniform paragraph styling characteristic of LLMs like ChatGPT.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/40 border border-slate-900 p-8 rounded-2xl relative overflow-hidden group hover:border-slate-800 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 blur-2xl rounded-full" />
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl w-fit">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mt-6">Competitor Smear Scanner</h3>
              <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                Catches suspicious target campaigns. Filters extreme negative reviews carrying structural bias vocabularies created in coordinated brand demolition waves.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/40 border border-slate-900 p-8 rounded-2xl relative overflow-hidden group hover:border-slate-800 transition-all">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 blur-2xl rounded-full" />
              <div className="bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 p-3 rounded-xl w-fit">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mt-6">Real-Time Listing Health</h3>
              <p className="text-slate-400 text-sm mt-3 leading-relaxed">
                Transforms reviews count data into dynamic trust scores, product insights graphs, satisfaction levels, and authentic reputation grading models instantly.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Core Interactive Demo Visualization Section */}
      <section id="demo" className="py-20 bg-slate-900/20 border-t border-slate-900 relative">
        <div className="absolute inset-0 bg-teal-500/5 blur-[120px] pointer-events-none rounded-full" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 text-left">
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-teal-500/10 text-teal-400 border border-teal-500/20">Interactive Demo</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-4 tracking-tight">Experience Real-Time Review Forensic Audits</h2>
              <p className="mt-4 text-slate-400 leading-relaxed font-light">
                Our dashboard evaluates linguistic nuances, checking for mismatched score feedback patterns and rating extremes instantly. Real reviews trigger 90%+ confidence ratings; suspicious ones are quarantined.
              </p>
              
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-emerald-500/10 text-emerald-400 p-1.5 rounded-lg mt-0.5">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Trust Confidence Index</h4>
                    <p className="text-xs text-slate-400">Instantly grading consumer risk margins based on verified benchmarks.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-teal-500/10 text-teal-400 p-1.5 rounded-lg mt-0.5">
                    <RefreshCw className="w-4 h-4 animate-spin-slow" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Gemini Summary Consolidity</h4>
                    <p className="text-xs text-slate-400">Distilling thousands of comments into complaints summaries and highlights.</p>
                  </div>
                </div>
              </div>

              <button
                onClick={onGetStarted}
                className="mt-8 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-6 py-3 rounded-xl transition-all shadow-md flex items-center gap-1.5"
              >
                <span>Try Auditing Free</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl relative overflow-hidden">
              <div className="absolute top-3 left-3 flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/60" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
                <span className="w-3 h-3 rounded-full bg-teal-500/60" />
              </div>
              <div className="text-xs font-mono text-slate-500 text-center border-b border-slate-850 pb-3 mb-4 uppercase tracking-widest pt-1">
                Forensic Language Pipeline Sandbox
              </div>

              {/* Fake review example visual */}
              <div className="space-y-4">
                <div className="bg-slate-950/80 p-4 border border-slate-850 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-400/20">SUSPICIOUS (GPT-4 Vibe)</span>
                    <span className="text-xs font-mono text-slate-400">Rating: ★★★★★</span>
                  </div>
                  <p className="text-xs text-slate-300 italic">
                    &quot;Absolutely superb device... Delighted operational experience, pristine materials and highly recommend purchase with extreme confidence. Worth every penny!&quot;
                  </p>
                  <div className="mt-3 flex gap-2 items-center pt-2.5 border-t border-slate-900/60 text-[10px] font-mono">
                    <span className="text-red-400 bg-red-400/5 px-2 py-0.5 rounded border border-red-400/10">Fake Prob: 89%</span>
                    <span className="text-red-400 bg-red-400/5 px-2 py-0.5 rounded border border-red-400/10">Repetitive Praise Triggers</span>
                  </div>
                </div>

                {/* Genuine review example visual */}
                <div className="bg-slate-950/80 p-4 border border-slate-850 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">VERIFIED HUMAN</span>
                    <span className="text-xs font-mono text-slate-400">Rating: ★★★★☆</span>
                  </div>
                  <p className="text-xs text-slate-300 italic">
                    &quot;Nice earbuds, the pairing is fast but the case latch feels cheap. Good audio battery ranges overall.&quot;
                  </p>
                  <div className="mt-3 flex gap-2 items-center pt-2.5 border-t border-slate-900/60 text-[10px] font-mono">
                    <span className="text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-400/10">Trust Score: 95%</span>
                    <span className="text-emerald-400 bg-emerald-400/5 px-2 py-0.5 rounded border border-emerald-400/10">Balanced Critique Metrics</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Pricing Structure Plan */}
      <section id="pricing" className="py-24 bg-slate-950 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-sm font-mono tracking-widest text-teal-400 uppercase">Pricing Tiers</h2>
            <p className="mt-3 text-3xl font-extrabold text-white">Invest in Reputational Authenticity</p>
            
            {/* Monthly/Yearly Toggle Switch */}
            <div className="mt-6 inline-flex p-1 bg-slate-900 rounded-xl border border-slate-800">
              <button 
                onClick={() => setBillingCycle("monthly")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${billingCycle === "monthly" ? "bg-teal-500 text-slate-950 shadow" : "text-slate-400 hover:text-slate-200"}`}
              >
                Monthly Plan
              </button>
              <button 
                onClick={() => setBillingCycle("yearly")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${billingCycle === "yearly" ? "bg-teal-500 text-slate-950 shadow" : "text-slate-400 hover:text-slate-200"}`}
              >
                Yearly Plan <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-1 py-0.5 rounded text-[9px]">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            
            {/* Plan 1 */}
            <div className="bg-slate-900/40 border border-slate-900 hover:border-slate-800 p-8 rounded-2xl flex flex-col justify-between transition-all">
              <div>
                <h4 className="text-sm font-mono text-slate-400 uppercase">Standard Starter</h4>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-white">
                    {billingCycle === "yearly" ? "$19" : "$24"}
                  </span>
                  <span className="text-slate-500 ml-1.5 text-sm">/month</span>
                </div>
                <p className="mt-4 text-xs text-slate-400 leading-relaxed">Perfect for individual e-commerce merchants beginning listings validation strategies.</p>
                <div className="h-px bg-slate-800 my-6" />
                <ul className="space-y-3.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Up to 1,000 reviews audited monthly</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>CSV Review list upload</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Core sentiment classification ratios</span>
                  </li>
                </ul>
              </div>
              <button onClick={onGetStarted} className="mt-8 w-full py-3 rounded-xl bg-slate-900 text-slate-100 hover:bg-slate-800 text-xs font-bold border border-slate-800 transition-colors">
                Start Standard Trial
              </button>
            </div>

            {/* Plan 2 - Featured */}
            <div className="bg-slate-900 border-2 border-teal-500/60 p-8 rounded-2xl flex flex-col justify-between relative shadow-2xl transition-all scale-[1.02]">
              <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-teal-500 text-slate-950 text-[10px] font-bold tracking-widest uppercase px-3.5 py-1 rounded-full border border-teal-400/40">
                RECOMMENDED SAAS MODEL
              </div>
              <div>
                <h4 className="text-sm font-mono text-teal-400 uppercase mt-2">Accelerate Core</h4>
                <div className="mt-4 flex items-baseline">
                  <span className="text-5xl font-extrabold text-white">
                    {billingCycle === "yearly" ? "$79" : "$99"}
                  </span>
                  <span className="text-emerald-400 ml-1.5 text-sm">/month</span>
                </div>
                <p className="mt-4 text-xs text-slate-300 leading-relaxed">Configured for established Amazon, Shopify, and Flipkart sellers tracking multiple SKUs.</p>
                <div className="h-px bg-slate-800 my-6" />
                <ul className="space-y-3.5 text-xs text-slate-200">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Up to 25,000 reviews monthly audits</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Advanced AI fake reviews indicators</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Full Gemini-driven product roadmap reports</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Interactive 24/7 AI Risk Assistant</span>
                  </li>
                </ul>
              </div>
              <button onClick={onGetStarted} className="mt-8 w-full py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all shadow-md">
                Deploy Brand Shield Now
              </button>
            </div>

            {/* Plan 3 */}
            <div className="bg-slate-900/40 border border-slate-900 hover:border-slate-800 p-8 rounded-2xl flex flex-col justify-between transition-all">
              <div>
                <h4 className="text-sm font-mono text-slate-400 uppercase">Enterprise Scope</h4>
                <div className="mt-4 flex items-baseline">
                  <span className="text-4xl font-extrabold text-white">Custom</span>
                </div>
                <p className="mt-4 text-xs text-slate-400 leading-relaxed">For scale digital operations and e-commerce agencies overseeing massive brand listings portfolios.</p>
                <div className="h-px bg-slate-800 my-6" />
                <ul className="space-y-3.5 text-xs text-slate-300">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Unlimited review queries and API calls</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Dedicated database nodes & priority queues</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
                    <span>Custom API endpoints and webhooks</span>
                  </li>
                </ul>
              </div>
              <a href="mailto:sjagrit2005@gmail.com" className="mt-8 text-center py-3 rounded-xl bg-slate-900 text-slate-100 hover:bg-slate-800 text-xs font-bold border border-slate-800 transition-colors block">
                Contact Technical Architect
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-24 bg-slate-900/10 border-t border-slate-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <HelpCircle className="w-8 h-8 text-teal-400 mx-auto" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-4">Platform FAQ</h2>
            <p className="mt-2 text-slate-400 text-sm">Key details explaining how ReviewShield secures listings integrity.</p>
          </div>

          <div className="space-y-4">
            <AccordionItem 
              question="How exact is the ReviewShield fake review classifier?" 
              answer="ReviewShield combines text-rating alignment checks, VADER-derived sentiment calculations, and direct parsing via the Gemini 3.5 Flash model. This multi-layered screening offers over 92% accurate correlation values, keeping false positives beneath a strict 2% barrier."
            />
            <AccordionItem 
              question="Can I import rating files directly via CSV formats?" 
              answer="Absolutely. ReviewShield has a built-in drag-and-drop CSV importer. The system parses reviewer names, ratings, review texts, and target product columns seamlessly to analyze review lists in bulk."
            />
            <AccordionItem 
              question="Why use Gemini over standard regex keyword flags?" 
              answer="Modern bot networks write highly coherent, grammatically fluid paragraphs that standard regex fails to identify. Gemini analyzes stylistic layouts, sentence structural transitions, vocabulary distributions, and contextual sense to safely spot machine-engineered feedback patterns."
            />
            <AccordionItem 
              question="Are my Amazon and Shopify seller passwords secure?" 
              answer="We operate entirely client-proxied on server nodes. No sensitive marketplace tokens are requested; you simply upload standard CSV exports without providing account credentials, protecting your listings from unauthorized data leaks."
            />
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-slate-950 border-t border-slate-900 py-16 relative">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-white">Insulate Your Digital Storefront Today</h2>
          <p className="mt-4 text-slate-400 max-w-lg mx-auto text-sm">Isolate negative bots campaigns, verify real buyers ratings, and maximize listing authenticity metrics starting right now.</p>
          <button 
            onClick={onGetStarted}
            className="mt-8 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-8 py-4 rounded-xl shadow-lg hover:shadow-teal-500/10 transition-all inline-flex items-center gap-2 text-sm"
          >
            <span>Launch Free Trial Platform</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Real Footer */}
      <footer className="border-t border-slate-950 bg-slate-950 py-8 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-500" />
            <span className="font-bold text-slate-300">ReviewShield AI</span>
            <span>&copy; {new Date().getFullYear()} Inc. All Rights Reserved.</span>
          </div>

          <div className="flex gap-6">
            <span className="hover:text-slate-300 cursor-pointer">Security Compliance</span>
            <span className="hover:text-slate-300 cursor-pointer">API Agreement</span>
            <span className="hover:text-slate-300 cursor-pointer">Privacy Charter</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-slate-900/30 border border-slate-900 hover:border-slate-850 rounded-xl transition-all">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left px-6 py-4 flex items-center justify-between font-bold text-white text-sm"
      >
        <span>{question}</span>
        <span className={`text-teal-400 font-mono text-lg transition-transform ${isOpen ? "rotate-45" : ""}`}>+</span>
      </button>
      {isOpen && (
        <div className="px-6 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-900/50 pt-3">
          {answer}
        </div>
      )}
    </div>
  );
}
